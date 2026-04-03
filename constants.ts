import { Letter } from './types';

// The password to enter the site
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

// Letter metadata — add new letters here!
// The actual content lives in public/letters/<file>.txt
export const LETTERS: Letter[] = [
  {
    id: 1,
    title: "April 2, 2026",
    preview: "I just want to talk to youu",
    file: "letter-1.txt",
  },
];