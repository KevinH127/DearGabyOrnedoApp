import { Letter } from './types';

// The password to enter the site
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

// Letter metadata — add new letters here!
// The actual content lives in public/letters/<file>.txt
export const LETTERS: Letter[] = [
  {
    id: 1,
    title: "April 2, 2026",
    preview: "I just wanted to talk to you",
    file: "letter-1.txt",
  },
  {
    id: 2,
    title: "April 3, 2026",
    preview: "How I felt today",
    file: "letter-2.txt",
  },
];