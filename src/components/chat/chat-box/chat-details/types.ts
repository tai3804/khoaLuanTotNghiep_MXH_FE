export interface SharedMediaItem {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  time: string;
  senderName?: string;
  fileName?: string;
}

export interface SharedFileItem {
  id: string;
  url: string;
  fileName: string;
  fileSize?: number;
  time: string;
  senderName?: string;
  extension: string;
}

export interface SharedLinkItem {
  id: string;
  url: string;
  domain: string;
  snippet?: string;
  time: string;
  senderName?: string;
}

export type ChatDetailsTab = 'MEDIA' | 'FILES' | 'LINKS' | 'CUSTOMIZE';

export interface ChatTheme {
  id: string;
  name: string;
  colorHex: string;
  gradientClass?: string;
}
