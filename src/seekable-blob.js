// Media containers can patch headers after writing their body. Keep output in
// bounded Blob chunks instead of growing one contiguous ArrayBuffer.
export function createSeekableBlob(maxBytes) {
  let chunks = [];
  let size = 0;
  const writable = new WritableStream({
    write({ data, position }) {
      const end = position + data.byteLength;
      if (!Number.isSafeInteger(position) || position < 0 || end > maxBytes) throw new RangeError('Media output exceeds the local size limit');
      const next = [];
      for (const chunk of chunks) {
        if (chunk.end <= position || chunk.start >= end) next.push(chunk);
        else {
          if (chunk.start < position) next.push({ start: chunk.start, end: position, blob: chunk.blob.slice(0, position - chunk.start) });
          if (chunk.end > end) next.push({ start: end, end: chunk.end, blob: chunk.blob.slice(end - chunk.start) });
        }
      }
      next.push({ start: position, end, blob: new Blob([data]) });
      next.sort((a, b) => a.start - b.start);
      chunks = next;
      size = Math.max(size, end);
    },
  });
  return {
    writable,
    blob(type) {
      const parts = [];
      let offset = 0;
      for (const chunk of chunks) {
        if (chunk.start !== offset) throw new Error('Incomplete media output');
        parts.push(chunk.blob);
        offset = chunk.end;
      }
      if (offset !== size || !size) throw new Error('Incomplete media output');
      return new Blob(parts, { type });
    },
  };
}
