import {
  ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Output,
  Mp3OutputFormat, OggOutputFormat, FlacOutputFormat, WavOutputFormat,
  Mp4OutputFormat, WebMOutputFormat, Quality, canEncodeAudio, canEncodeVideo,
  registerMp3Encoder,
} from '../vendor/generated/media-vendor.js';
import { t } from './i18n.js';

const profiles = [
  { audio: 192_000, video: 3_000_000, maxWidth: 1920 },
  { audio: 128_000, video: 1_500_000, maxWidth: 1280 },
  { audio: 64_000, video: 700_000, maxWidth: 854 },
];

export async function mediaSupport(type) {
  if (type === 'audio/mpeg') {
    if (!(await canEncodeAudio('mp3'))) registerMp3Encoder();
    return canEncodeAudio('mp3');
  }
  if (type === 'audio/ogg') return canEncodeAudio('opus');
  if (type === 'audio/flac') return canEncodeAudio('flac');
  if (type === 'video/mp4') return canEncodeVideo('avc') && canEncodeAudio('aac');
  if (type === 'video/webm') return canEncodeVideo('vp8') && canEncodeAudio('opus');
  return type === 'audio/wav';
}

export async function convertMedia(file, outputType, strength, signal, onProgress = () => {}) {
  signal.throwIfAborted();
  if (!(await mediaSupport(outputType))) throw new Error(t('mediaCodecUnavailable'));
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  let conversion;
  try {
    if (!(await input.canRead())) throw new Error(t('mediaReadError'));
    const level = strength <= 30 ? 0 : strength <= 65 ? 1 : 2;
    const profile = profiles[level];
    const target = new BufferTarget();
    const outputFormat = {
      'audio/mpeg': Mp3OutputFormat,
      'audio/ogg': OggOutputFormat,
      'audio/flac': FlacOutputFormat,
      'audio/wav': WavOutputFormat,
      'video/mp4': Mp4OutputFormat,
      'video/webm': WebMOutputFormat,
    }[outputType];
    if (!outputFormat) throw new Error(t('unsupported'));
    const output = new Output({ format: new outputFormat(), target });
    const audioCodec = outputType === 'audio/mpeg' ? 'mp3' : outputType === 'audio/ogg' ? 'opus'
      : outputType === 'audio/flac' ? 'flac' : outputType === 'video/mp4' ? 'aac'
        : outputType === 'video/webm' ? 'opus' : 'pcm-s16';
    const videoCodec = outputType === 'video/mp4' ? 'avc' : 'vp8';
    conversion = await Conversion.init({
      input, output, tracks: 'primary', copy: false, showWarnings: false,
      video: outputType.startsWith('video/') ? async (track) => ({
        codec: videoCodec,
        width: Math.min(profile.maxWidth, await track.getCodedWidth()),
        quality: new Quality({ bitrate: profile.video }),
      }) : { discard: true },
      audio: { codec: audioCodec, quality: new Quality({ bitrate: profile.audio }) },
    });
    if (!conversion.isValid || !conversion.utilizedTracks.length || conversion.discardedTracks.length) {
      throw new Error(t('mediaCodecUnavailable'), { cause: conversion.discardedTracks.map(({ reason }) => reason).join(',') || 'invalid_conversion' });
    }
    conversion.onProgress = (progress) => onProgress('mediaProgress', { percent: Math.round(progress * 100) });
    const abort = () => { conversion.cancel().catch(() => {}); };
    signal.addEventListener('abort', abort, { once: true });
    try {
      await conversion.execute();
      signal.throwIfAborted();
      if (!target.buffer) throw new Error(t('mediaReadError'));
      const blob = new Blob([target.buffer], { type: outputType });
      const check = new Input({ source: new BlobSource(blob), formats: ALL_FORMATS });
      try {
        const tracks = outputType.startsWith('video/') ? await check.getVideoTracks() : await check.getAudioTracks();
        if (!tracks.length) throw new Error(t('mediaReadError'));
      } finally { check.dispose(); }
      signal.throwIfAborted();
      return blob;
    } finally { signal.removeEventListener('abort', abort); }
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof Error && [t('mediaCodecUnavailable'), t('mediaReadError')].includes(error.message)) throw error;
    throw new Error(t('mediaReadError'));
  } finally { input.dispose(); }
}
