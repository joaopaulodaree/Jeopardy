import type { Media } from '../types';

const YOUTUBE_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/(watch|shorts|live)|youtu\.be\/)/;
const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i;
const VIDEO_EXTS = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function detectMediaType(url: string): Media['type'] {
  if (YOUTUBE_REGEX.test(url)) return 'youtube';
  if (IMAGE_EXTS.test(url)) return 'image';
  if (VIDEO_EXTS.test(url)) return 'video';
  return 'link';
}
