import { t } from './i18n.js';
import { MAX_PDF_PAGES, MAX_PDF_OUTPUT_SIZE, MAX_FILE_SIZE } from './limits.js';

const MAX_PAGES = MAX_PDF_PAGES;
const MAX_OUTPUT_SIZE = MAX_PDF_OUTPUT_SIZE;
const MAX_MERGE_INPUT_SIZE = MAX_FILE_SIZE;
const UNSAFE_CATALOG_KEYS = ['AcroForm', 'Outlines', 'Names', 'Perms', 'OCProperties', 'StructTreeRoot', 'Collection', 'DSS'];

async function loadSafePdf(file, signal) {
  signal?.throwIfAborted();
  let document;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const decoder = new TextDecoder('latin1');
    let tail = '';
    for (let offset = 0; offset < bytes.length; offset += 1024 ** 2) {
      signal?.throwIfAborted();
      const chunk = tail + decoder.decode(bytes.subarray(offset, offset + 1024 ** 2));
      if (/\/(?:ByteRange|Sig|Encrypt|XFA|EmbeddedFiles)\b/.test(chunk)) throw new Error(t('pdfPagesUnsafe'));
      tail = chunk.slice(-64);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    document = await PDFLib.PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    signal?.throwIfAborted();
    if (error.message === t('pdfPagesUnsafe')) throw error;
    throw new Error(t('pdfReadError'));
  }
  signal?.throwIfAborted();
  if (UNSAFE_CATALOG_KEYS.some((key) => document.catalog.has(PDFLib.PDFName.of(key)))
    || document.getPages().some((page) => page.node.Annots()?.size() > 0)) {
    throw new Error(t('pdfPagesUnsafe'));
  }
  if (document.getPageCount() > MAX_PAGES) throw new Error(t('tooManyPages'));
  if (!document.getPageCount()) throw new Error(t('pdfReadError'));
  return document;
}

export async function inspectPdfPages(file, signal) {
  const document = await loadSafePdf(file, signal);
  return document.getPages().map((page, sourceIndex) => ({ sourceIndex, rotation: page.getRotation().angle }));
}

function checkPlan(plan, count) {
  if (!Array.isArray(plan) || !plan.length || plan.length > MAX_PAGES) throw new Error(t('pdfPagesEmpty'));
  const seen = new Set();
  for (const page of plan) {
    if (!Number.isInteger(page.sourceIndex) || page.sourceIndex < 0 || page.sourceIndex >= count
      || seen.has(page.sourceIndex) || ![0, 90, 180, 270].includes(page.rotation)) {
      throw new Error(t('pdfPagesInvalid'));
    }
    seen.add(page.sourceIndex);
  }
}

async function savePdf(document, signal) {
  signal?.throwIfAborted();
  const bytes = await document.save({ useObjectStreams: true });
  signal?.throwIfAborted();
  if (bytes.byteLength > MAX_OUTPUT_SIZE) throw new Error(t('pdfOutputTooLarge'));
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function editPdfPages(file, plan, signal) {
  const input = await loadSafePdf(file, signal);
  checkPlan(plan, input.getPageCount());
  const output = await PDFLib.PDFDocument.create();
  const pages = await output.copyPages(input, plan.map((page) => page.sourceIndex));
  for (let index = 0; index < pages.length; index++) {
    signal?.throwIfAborted();
    pages[index].setRotation(PDFLib.degrees(plan[index].rotation));
    output.addPage(pages[index]);
  }
  return savePdf(output, signal);
}

export async function mergePdfs(files, signal, onProgress = () => {}) {
  if (files.length < 2 || files.reduce((size, file) => size + file.size, 0) > MAX_MERGE_INPUT_SIZE) {
    throw new Error(t('pdfMergeLimit'));
  }
  const output = await PDFLib.PDFDocument.create();
  let count = 0;
  for (let index = 0; index < files.length; index++) {
    signal?.throwIfAborted();
    onProgress(index + 1, files.length);
    const input = await loadSafePdf(files[index], signal);
    count += input.getPageCount();
    if (count > MAX_PAGES) throw new Error(t('tooManyPages'));
    const pages = await output.copyPages(input, input.getPageIndices());
    for (const page of pages) output.addPage(page);
  }
  return savePdf(output, signal);
}
