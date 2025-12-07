export interface SlideData {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'analyzing' | 'success' | 'error';
  content?: SlideContent;
  error?: string;
}

export interface SlideContent {
  title: string;
  points: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  READY_TO_EXPORT = 'READY_TO_EXPORT',
}

export type SlideLayout = 'left' | 'right' | 'fullscreen';

export interface PresentationSettings {
  layout: SlideLayout;
  includeTitle: boolean;
  includePoints: boolean;
}