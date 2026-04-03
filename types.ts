export enum AppState {
  PASSWORD = 'PASSWORD',
  GALLERY = 'GALLERY',
  READING = 'READING',
}

export interface Letter {
  id: number;
  title: string;
  preview: string;
  file: string; // filename in public/letters/
}