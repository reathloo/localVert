import { compressImage, compressImageToTarget, compressPdf, estimatePdf, pdfPreview, validateFile } from '../src/conversion.js';
import { messages } from '../src/i18n.js';
import { audioToWav, imageToPdf, imagesToPdf, pdfToImagesZip, pdfToText } from '../src/extra-conversion.js';
import { docxToText, xlsxToCsv, pptxToText, officeToPdf } from '../src/office-conversion.js';
import { convertMedia, mediaSupport } from '../src/media-conversion.js';
import { ALL_FORMATS, BlobSource, Input } from '../vendor/generated/media-vendor.js';
import { zipBlobs } from '../src/zip.js';
import { fillUploadField } from '../src/upload-field.js';

const output = document.querySelector('#results');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = async (blob) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))).join(',');
const signal = () => new AbortController().signal;
output.textContent = 'Ready for local fixtures.';
document.querySelector('#choose-fixtures').addEventListener('click', () => document.querySelector('#fixtures').click());

const fixtureNames = ['image.png', 'image-no-extension', 'image.gif', 'image.tiff', 'invalid.jpg', 'broken.pdf', 'empty.png', 'text.pdf', 'scan.pdf', 'document.docx', 'sheet.xlsx', 'slides.pptx', 'tone.wav'];
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
  const sample = document.querySelector('#sample-pdf');
  const preview = document.querySelector('#sample-preview');
  if (sample.href) URL.revokeObjectURL(sample.href);
  if (preview.src) URL.revokeObjectURL(preview.src);
  sample.removeAttribute('href');
  sample.hidden = true;
  preview.removeAttribute('src');
  preview.hidden = true;
  let passed = 0;
  let total = 0;
  async function check(name, run) {
    total++;
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
  for (const name of ['image.gif', 'image.tiff']) {
    await check(`${name} converts locally to PNG`, async () => {
      const input = await validateFile(files[name]);
      const converted = await compressImage(input, 'image/png', 60, signal());
      assert(converted.blob.type === 'image/png', 'Output is not PNG');
      const bitmap = await createImageBitmap(converted.blob);
      assert(bitmap.width === 1 && bitmap.height === 1, 'Wrong dimensions');
      bitmap.close();
    });
  }
  await check('PNG strong compression reduces resolution', async () => {
    const converted = await compressImage(png, 'image/png', 10, signal());
    assert(converted.width === 450 && converted.height === 325, 'Incorrect resolution');
  });
  await check('Image resize, rotation and center crop produce correct dimensions', async () => {
    const resized = await compressImage(png, 'image/jpeg', 80, signal(), { maxDimension: 800, rotation: 90, squareCrop: true });
    const bitmap = await createImageBitmap(resized.blob);
    assert(bitmap.width === bitmap.height && bitmap.width <= 800 && bitmap.width > 0, 'Image options did not apply');
    bitmap.close();
  });
  await check('Target size reports success or failure honestly', async () => {
    const candidate = await compressImageToTarget(png, 'image/jpeg', 1, signal());
    assert(candidate.targetMet === (candidate.blob.size <= 1), 'Target state is incorrect');
  });
  await check('Pre-cancelled image conversion rejects', async () => {
    const controller = new AbortController(); controller.abort();
    let rejected = false;
    try { await compressImage(png, 'image/jpeg', 60, controller.signal); } catch (error) { rejected = error.name === 'AbortError'; }
    assert(rejected, 'Cancelled image conversion continued');
  });
  await check('Structure-preserving PDF remains readable', async () => {
    const converted = await compressPdf(pdf, 80, null, signal(), () => {});
    const loaded = await PDFLib.PDFDocument.load(await converted.blob.arrayBuffer());
    assert(loaded.getPageCount() === 1 && converted.blob.size <= pdf.size, 'PDF optimization damaged document');
    assert((await (await pdfToText(converted.blob, signal())).text()).includes('localVert'), 'Selectable text was lost');
  });
  await check('PDF with signature marker is kept unchanged', async () => {
    const signed = new File([pdf, '\n/ByteRange [0 1 2 3]\n'], 'signed.pdf', { type: 'application/pdf' });
    const converted = await compressPdf(signed, 80, null, signal(), () => {});
    assert(await hash(converted.blob) === await hash(signed), 'Signed PDF was modified');
  });
  await check('Interactive PDF form is kept unchanged', async () => {
    const document = await PDFLib.PDFDocument.create();
    const page = document.addPage([300, 200]);
    document.getForm().createTextField('name').addToPage(page, { x: 20, y: 100, width: 180, height: 30 });
    const form = new File([await document.save()], 'form.pdf', { type: 'application/pdf' });
    const converted = await compressPdf(form, 80, null, signal(), () => {});
    assert(await hash(converted.blob) === await hash(form), 'Form PDF was modified');
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
  await check('Multiple images produce a readable multi-page PDF', async () => {
    const blob = await imagesToPdf([png, png], 40, signal());
    const document = await PDFLib.PDFDocument.load(await blob.arrayBuffer());
    assert(document.getPageCount() === 2, 'Combined PDF has wrong page count');
  });
  await check('PDF pages export as valid PNG files in a ZIP', async () => {
    const blob = await pdfToImagesZip(pdf, 'image/png', 40, signal());
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);
    const nameLength = view.getUint16(26, true);
    const start = 30 + nameLength;
    assert(blob.type === 'application/zip' && view.getUint32(0, true) === 0x04034b50, 'Invalid ZIP header');
    assert(new TextDecoder().decode(bytes.slice(30, start)) === 'page-001.png', 'Wrong page name');
    assert(bytes[start] === 137 && bytes[start + 1] === 80 && bytes[start + 2] === 78 && bytes[start + 3] === 71, 'PNG payload missing');
    assert(view.getUint32(bytes.length - 22, true) === 0x06054b50, 'ZIP directory missing');
  });
  await check('Batch ZIP contains both local results', async () => {
    const zipped = await zipBlobs([{ name: 'first.png', blob: png }, { name: 'second.png', blob: png }], signal());
    const bytes = new Uint8Array(await zipped.arrayBuffer());
    const footer = new DataView(bytes.buffer, bytes.byteLength - 22);
    assert(footer.getUint16(10, true) === 2, 'Wrong ZIP entry count');
  });
  await check('Upload helper inserts only a compatible local file', () => {
    const field = document.createElement('input');
    field.type = 'file'; field.accept = '.png';
    document.body.append(field);
    try {
      const inserted = fillUploadField(btoa('PNG'), 'result.png', 'image/png');
      assert(inserted && field.files.length === 1 && field.files[0].name === 'result.png', 'File was not inserted');
      assert(!fillUploadField(btoa('PDF'), 'result.pdf', 'application/pdf'), 'Wrong format accepted');
    } finally { field.remove(); }
  });
  await check('PDF page export stops on cancellation', async () => {
    const controller = new AbortController();
    let pages = 0;
    let rejected = false;
    try {
      await pdfToImagesZip(files['scan.pdf'], 'image/jpeg', 40, controller.signal, (key) => {
        if (key === 'pageProgress') { pages++; controller.abort(); }
      });
    } catch { rejected = true; }
    assert(rejected && pages === 1, 'Export continued after cancellation');
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
  await check('PPTX to text reads slide content', async () => {
    const input = await validateFile(files['slides.pptx']);
    assert((await (await pptxToText(input, signal())).text()).includes('Hello Slides'), 'Slide text missing');
  });
  for (const name of ['document.docx', 'sheet.xlsx', 'slides.pptx']) {
    await check(`${name} creates readable local PDF`, async () => {
      const input = await validateFile(files[name]);
      const blob = await officeToPdf(input, signal());
      const document = await PDFLib.PDFDocument.load(await blob.arrayBuffer());
      assert(document.getPageCount() >= 1, 'No PDF page');
      if (name === 'document.docx') {
        sample.href = URL.createObjectURL(blob);
        sample.hidden = false;
        preview.src = URL.createObjectURL(await pdfPreview(blob, signal()));
        preview.hidden = false;
      }
    });
  }
  await check('WAV to MP3 creates valid local output', async () => {
    const input = await validateFile(files['tone.wav']);
    const blob = await convertMedia(input, 'audio/mpeg', 40, signal());
    const bytes = new Uint8Array(await blob.slice(0, 3).arrayBuffer());
    assert(blob.size > 100 && (bytes[0] === 0xff || String.fromCharCode(...bytes) === 'ID3'), 'MP3 header missing');
  });
  await check('WAV and MP3 to WAV create readable output', async () => {
    const input = await validateFile(files['tone.wav']);
    const mp3 = await convertMedia(input, 'audio/mpeg', 40, signal());
    for (const source of [input, await validateFile(new File([mp3], 'tone.mp3'))]) {
      const blob = await convertMedia(source, 'audio/wav', 40, signal());
      const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
      assert(String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WAVE', 'WAV header missing');
    }
  });
  for (const type of ['audio/ogg', 'audio/flac']) {
    if (await mediaSupport(type)) await check(`WAV to ${type} encodes locally`, async () => {
      const input = await validateFile(files['tone.wav']);
      const blob = await convertMedia(input, type, 40, signal());
      assert(blob.size > 100 && blob.type === type, 'Missing encoded media');
    });
  }
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8') && await mediaSupport('video/mp4') && await mediaSupport('video/webm')) {
    await check('WebM to MP4 and back transcodes locally', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const stream = canvas.captureStream(0);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
      const chunks = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      const ended = new Promise((resolve) => { recorder.onstop = resolve; });
      recorder.start();
      const context = canvas.getContext('2d');
      for (let frame = 0; frame < 10; frame++) {
        context.fillStyle = frame % 2 ? 'tomato' : 'royalblue';
        context.fillRect(0, 0, 64, 64);
        stream.getVideoTracks()[0].requestFrame();
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
      recorder.stop();
      await ended;
      stream.getTracks().forEach((track) => track.stop());
      const input = await validateFile(new File(chunks, 'sample.webm', { type: 'video/webm' }));
      const sourceProbe = new Input({ source: new BlobSource(input), formats: ALL_FORMATS });
      const sourceTracks = await sourceProbe.getVideoTracks();
      sourceProbe.dispose();
      assert(sourceTracks.length > 0, 'Recorded WebM has no video track');
      const optimized = await convertMedia(input, 'video/webm', 70, signal());
      assert(optimized.size > 100, 'Optimized WebM is empty');
      const result = await convertMedia(input, 'video/mp4', 40, signal());
      const bytes = new Uint8Array(await result.slice(4, 8).arrayBuffer());
      assert(result.size > 100 && String.fromCharCode(...bytes) === 'ftyp', 'MP4 header missing');
      const resultProbe = new Input({ source: new BlobSource(result), formats: ALL_FORMATS });
      const resultTracks = await resultProbe.getVideoTracks();
      resultProbe.dispose();
      assert(resultTracks.length > 0, 'Converted MP4 has no video track');
      let roundTrip;
      try { roundTrip = await convertMedia(await validateFile(new File([result], 'sample.mp4')), 'video/webm', 70, signal()); }
      catch (error) { throw new Error(`MP4 → WebM: ${error.message} (${error.cause ?? 'no detail'})`); }
      const webm = new Uint8Array(await roundTrip.slice(0, 4).arrayBuffer());
      assert(roundTrip.size > 100 && webm.join() === '26,69,223,163', 'WebM header missing');
    });
  }
  await check('WAV conversion retains valid audio header', async () => {
    const file = await validateFile(files['tone.wav']);
    const blob = await audioToWav(file, 40, signal());
    const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    assert(String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WAVE', 'Invalid WAV result');
  });
  output.textContent += `\n${passed}/${total} checks passed.\n`;
}
