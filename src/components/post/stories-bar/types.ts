export interface StoryAudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: string;
  cover?: string;
}

export type StoryPrivacy = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export interface PhotoFilter {
  id: string;
  name: string;
  css: string;
}

export interface PhotoAdjustments {
  brightness: number; // 50 to 150, default 100
  contrast: number;   // 50 to 150, default 100
  saturation: number; // 0 to 200, default 100
  blur: number;       // 0 to 10, default 0
}

export interface PhotoTransform {
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface PhotoCropSettings {
  zoom: number;       // 1.0 to 3.0, default 1.0
  panX: number;       // percentage -60 to 60, default 0
  panY: number;       // percentage -60 to 60, default 0
  fitMode: 'cover' | 'contain'; // cover = fill 9:16 frame, contain = fit inside with blur bg
}

export interface StorySticker {
  id: string;
  emoji: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

export interface DraggableText {
  id: string;
  text: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  color: string;
  bgColor: string;
  fontSize: number; // e.g. 14, 18, 24
}
