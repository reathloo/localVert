import { compressImage, compressPdf, estimatePdf, pdfPreview, validateFile } from '../src/conversion.js';
import { messages } from '../src/i18n.js';
import { audioToWav, imageToPdf, pdfToText } from '../src/extra-conversion.js';
import { docxToText, xlsxToCsv } from '../src/office-conversion.js';

const output = document.querySelector('#results');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = async (blob) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))).join(',');
const signal = () => new AbortController().signal;
output.textContent = 'Ready for local fixtures.';
document.querySelector('#choose-fixtures').addEventListener('click', () => document.querySelector('#fixtures').click());

const fixtureNames = ['image.png', 'image-no-extension', 'invalid.jpg', 'broken.pdf', 'empty.png', 'text.pdf', 'scan.pdf', 'document.docx', 'sheet.xlsx', 'tone.wav'];
document.querySelector('#run-generated').addEventListener('click', async () => {
  try {
    const files = {};
    for (const name of fixtureNames) {
      const response = await fetch(`generated/${name}`);
      if (!response.ok) throw new Error(`Missing ${name}`);
      files[name] = new File([await response.blob()], name);
    }
    await run(files);
  } catch (error) { output.textContent = `Fixture loading failed: ${error.message}`; }
});
document.querySelector('#fixtures').addEventListener('change', (event) => run(Object.fromEntries([...event.target.files].map((file) => [file.name, file]))));

async function run(files) {
  output.textContent = '';
  let passed = 0;
  async function check(name, run) {
    try { await run(); passed++; output.textContent += `PASS ${name}\n`; }
    catch (error) { output.textContent += `FAIL ${name}: ${error.message}\n`; }
  }
  const png = files['image.png'];
  const pdf = files['text.pdf'];
  if (!png || !pdf || !files['scan.pdf']) { output.textContent = 'Select all generated fixtures.'; return; }
  const originalHash = await hash(png);
  await check('All translations have matching keys and placeholders', () => {
    const keys = Object.keys(messages.en).sort();
    const slots = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join();
    for (const language of Object.values(messages)) {
      assert(Object.keys(language).sort().join() === keys.join(), 'Missing keys');
      for (const key of keys) assert(slots(language[key]) === slots(messages.en[key]), key);
    }
  });
  await check('File detection works without MIME type or extension', async () => {
    const normalized = await validateFile(new File([png], 'image-no-extension', { type: '' }));
    assert(normalized.type === 'image/png' && normalized.size === png.size, 'Incorrect normalization');
  });
  for (const name of ['invalid.jpg', 'empty.png']) {
    await check(`Reject ${name}`, async () => {
      let rejected = false;
      try { await validateFile(files[name]); } catch { rejected = true; }
      assert(rejected, 'Invalid input accepted');
    });
  }
  for (const type of ['image/jpeg', 'image/webp', 'image/png']) {
    await check(`Encode and decode ${type}`, async () => {
      const converted = await compressImage(png, type, 60, signal());
      assert(converted.blob.type === type, 'Unexpected encoder fallback');
      const decoded = await createImageBitmap(converted.blob);
      assert(decoded.width === converted.width && decoded.height === converted.height, 'Incorrect dimensions');
      decoded.close();
    });
  }
  await check('PNG strong compression reduces resolution', async () => {
    const converted = await compressImage(png, 'image/png', 10, signal());
    assert(converted.width === 450 && converted.height === 325, 'Incorrect resolution');
  });
  await check('Pre-cancelled image conversion rejects', async () => {
    const controller = new AbortController(); controller.abort();
    let rejected = false;
    try { await compressImage(png, 'image/jpeg', 60, controller.signal); } catch (error) { rejected = error.name === 'AbortError'; }
    assert(rejected, 'Cancelled image conversion continued');
  });
  await check('Preserved PDF is byte-identical', async () => {
    const converted = await compressPdf(pdf, 80, null, signal(), () => {});
    assert(await hash(converted.blob) === await hash(pdf), 'Original PDF changed');
  });
  await check('PDF estimate and compression create valid output', async () => {
    const source = files['scan.pdf'];
    const estimate = await estimatePdf(source, 60, signal());
    assert(estimate.pages === 12 && estimate.size > 0, 'Incorrect estimate');
    const converted = await compressPdf(source, 60, null, signal(), () => {});
    const loaded = await PDFLib.PDFDocument.load(await converted.blob.arrayBuffer());
    assert(loaded.getPageCount() === 12, 'Page count changed');
  });
  await check('Unreachable PDF target reports additional quality reduction', async () => {
    const converted = await compressPdf(pdf, 60, 1, signal(), () => {});
    assert(converted.blob.size > 1 && converted.reducedFurther, 'Target fallback missing');
  });
  await check('PDF cancellation stops after first rendered page', async () => {
    const controller = new AbortController(); let pages = 0; let rejected = false;
    try {
      await compressPdf(files['scan.pdf'], 60, null, controller.signal, (key) => {
        if (key === 'pageProgress') { pages++; controller.abort(); }
      });
    } catch { rejected = true; }
    assert(rejected && pages === 1, 'Rendering continued after cancellation');
  });
  await check('Malformed PDF rejects without hanging', async () => {
    let rejected = false;
    try { await compressPdf(files['broken.pdf'], 80, null, signal(), () => {}); } catch { rejected = true; }
    assert(rejected, 'Malformed PDF accepted');
  });
  await check('PDF preview stays within 700 × 700 pixels', async () => {
    const preview = await pdfPreview(pdf, signal());
    const bitmap = await createImageBitmap(preview);
    assert(bitmap.width <= 700 && bitmap.height <= 700, 'Preview exceeds bounds');
    bitmap.close();
  });
  await check('Original image remains byte-identical', async () => assert(await hash(png) === originalHash, 'Original changed'));
  await check('Image to PDF produces one readable page', async () => {
    const blob = await imageToPdf(png, 40, signal());
    const document = await PDFLib.PDFDocument.load(await blob.arrayBuffer());
    assert(blob.type === 'application/pdf' && document.getPageCount() === 1, 'Invalid PDF result');
  });
  await check('PDF to text retains selectable text', async () => {
    const blob = await pdfToText(pdf, signal());
    assert((await blob.text()).includes('localVert'), 'Text missing');
  });
  await check('Scanned PDF does not pretend to contain OCR text', async () => {
    let rejected = false;
    try { await pdfToText(files['scan.pdf'], signal()); } catch { rejected = true; }
    assert(rejected, 'Scan was exported as text');
  });
  await check('DOCX to text reads document content', async () => {
    const file = await validateFile(files['document.docx']);
    const blob = await docxToText(file, signal());
    assert((await blob.text()).includes('Hello Word'), 'Word text missing');
  });
  await check('XLSX to CSV exports first worksheet', async () => {
    const file = await validateFile(files['sheet.xlsx']);
    const blob = await xlsxToCsv(file, signal());
    assert((await blob.text()).includes('Name,42') && (await blob.text()).includes('Ada,7'), 'CSV rows missing');
  });
  await check('WAV conversion retains valid audio header', async () => {
    const file = await validateFile(files['tone.wav']);
    const blob = await audioToWav(file, 40, signal());
    const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    assert(String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WAVE', 'Invalid WAV result');
  });
  output.textContent += `\n${passed}/22 checks passed.\n`;
}
