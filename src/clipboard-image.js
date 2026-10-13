import { t } from './i18n.js';

const SUPPORTED = new Set(['image/png', 'image/jpeg', 'image/webp']);

export function imageFromPaste(clipboardData) {
  const item = [...(clipboardData?.items ?? [])].find((entry) => entry.kind === 'file' && entry.type.startsWith('image/'));
  const file = item?.getAsFile();
  if (!file) return null;
  return new File([file], `clipboard-image.${file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] || 'png'}`, { type: file.type });
}

export async function readClipboardImage() {
  if (!navigator.clipboard?.read) throw new Error(t('clipboardPasteHint'));
  let entries;
  try { entries = await navigator.clipboard.read(); }
  catch { throw new Error(t('clipboardPasteHint')); }
  for (const entry of entries) {
    const type = entry.types.find((candidate) => SUPPORTED.has(candidate));
    if (type) {
      const blob = await entry.getType(type);
      return new File([blob], `clipboard-image.${type === 'image/jpeg' ? 'jpg' : type.split('/')[1]}`, { type });
    }
  }
  throw new Error(t('clipboardNoImage'));
}
