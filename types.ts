export enum AppState {
  PASSWORD = 'PASSWORD',
  SLIDESHOW = 'SLIDESHOW',
  TRANSITION = 'TRANSITION',
  QUESTION = 'QUESTION',
  SUCCESS = 'SUCCESS',
  LETTER = 'LETTER',
  PLANNER = 'PLANNER',
}

export interface SlideMessage {
  id: number;
  text: string;
}

export interface Photo {
  id: number;
  url: string;
  rotation: number;
}