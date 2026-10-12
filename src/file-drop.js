export function installFileDrop(root, overlay, onFiles) {
  let depth = 0;
  const hasFiles = (event) => Array.from(event.dataTransfer?.types ?? []).includes('Files') || !!event.dataTransfer?.files?.length;
  const reset = () => { depth = 0; overlay.hidden = true; };
  const enter = (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth += 1;
    overlay.hidden = false;
  };
  const over = (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    overlay.hidden = false;
  };
  const leave = () => {
    depth = Math.max(0, depth - 1);
    if (!depth) reset();
  };
  const drop = (event) => {
    if (!hasFiles(event) && !depth) return;
    event.preventDefault();
    const files = [...(event.dataTransfer?.files ?? [])];
    reset();
    if (files.length) onFiles(files);
  };
  root.addEventListener('dragenter', enter);
  root.addEventListener('dragover', over);
  root.addEventListener('dragleave', leave);
  root.addEventListener('drop', drop);
  root.addEventListener('blur', reset);
  return () => {
    root.removeEventListener('dragenter', enter);
    root.removeEventListener('dragover', over);
    root.removeEventListener('dragleave', leave);
    root.removeEventListener('drop', drop);
    root.removeEventListener('blur', reset);
    reset();
  };
}
