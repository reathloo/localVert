import { build } from 'esbuild';
import { copyFile } from 'node:fs/promises';

await build({
  entryPoints: ['scripts/media-vendor.js', 'scripts/tiff-vendor.js'],
  outdir: 'vendor/generated',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  sourcemap: false,
  legalComments: 'external',
});

await Promise.all([
  ['mediabunny', 'MEDIABUNNY-LICENSE'],
  ['@mediabunny/mp3-encoder', 'MP3-ENCODER-LICENSE'],
  ['utif', 'UTIF-LICENSE'],
].map(([name, filename]) => copyFile(`node_modules/${name}/LICENSE`, `vendor/generated/${filename}`)));
