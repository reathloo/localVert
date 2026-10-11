// Serialized by scripting.executeScript and run only after the user clicks the button.
export function fillUploadField(encoded, name, mime) {
  const extension = name.split('.').pop().toLowerCase();
  const matches = (field) => {
    if (field.disabled || field.hidden || field.closest('[hidden], [inert]')) return false;
    const accept = field.accept.toLowerCase().split(',').map((part) => part.trim()).filter(Boolean);
    return !accept.length || accept.some((part) => part === `.${extension}` || part === mime || part === `${mime.split('/')[0]}/*`);
  };
  const fields = [...document.querySelectorAll('input[type="file"]')].filter(matches);
  const focused = fields.includes(document.activeElement) ? document.activeElement : null;
  const field = focused || (fields.length === 1 ? fields[0] : null);
  if (!field) return false;
  const raw = atob(encoded);
  const bytes = Uint8Array.from(raw, (letter) => letter.charCodeAt(0));
  const transfer = new DataTransfer();
  transfer.items.add(new File([bytes], name, { type: mime }));
  field.files = transfer.files;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.focus();
  return true;
}
