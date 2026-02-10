import { SlideMessage, Photo } from './types';

// The password to enter the site
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || "love";
export const PASSWORD_HINT = "The answer is what makes the world go round (4 letters)";
export const SHOW_LOADING_SCREEN = false; // Set to true to show "Coming Soon" screen

// Music URL - You can replace this with any MP3 link
// export const MUSIC_URL = "https://cdn.pixabay.com/download/audio/2022/10/18/audio_31c2730e64.mp3"; 
export const MUSIC_CALM_ID = "_XRZMKW6xGI"; // Feelings (30-Minute Loop) | Relaxing Romantic Music
export const MUSIC_YOUTUBE_ID = "kuqs19UyNEk"; // WayV - Poppin' Love (Track Video)
export const MUSIC_YOUTUBE_START_TIME = 34; // Start at chorus (0:43)
export const MUSIC_VOLUME = 20; // Background volume level (0-100)
// Alternative cheerful track: "https://cdn.pixabay.com/audio/2022/10/18/audio_31c2730e64.mp3"

// Cute GIFs for the screens
export const GIFS = {
  // Shy/Asking bear or cat
  asking: "https://media1.tenor.com/m/fA24cQ3oW6wAAAAC/cute-cat.gif",
  // Happy/Kissing/Hugging
  celebration: "https://media1.tenor.com/m/T_16rA88a8MAAAAC/mochi-peach.gif",
};

// Slideshow messages
export const SLIDES: SlideMessage[] = [
  { id: 1, text: "Hii..." },
  { id: 2, text: "Since we live a little far from each other..." },
  { id: 3, text: "And things are a little different now..." },
  { id: 4, text: "I wanted to..." },
  { id: 5, text: "Ask you something in a different way too..." },
  { id: 6, text: "I wanted to ask..." },
];

// Placeholder photos - User should replace these with real memories
export const PHOTOS: Photo[] = [
  { id: 1, url: "/images/DSCF2631.jpeg", rotation: -5 },
  { id: 2, url: "/images/IMG_4964.JPG", rotation: 3 },
  { id: 3, url: "/images/IMG_5137.JPG", rotation: -4 },
  { id: 4, url: "/images/IMG_5167.jpeg", rotation: 5 },
  { id: 5, url: "/images/IMG_5380.JPG", rotation: -2 },
  { id: 6, url: "/images/IMG_6263.JPG", rotation: 4 },
  { id: 7, url: "/images/IMG_6592.JPG", rotation: -3 },
  { id: 8, url: "/images/IMG_7410.JPG", rotation: 6 },
  { id: 9, url: "/images/IMG_7620.JPG", rotation: -5 },
  { id: 10, url: "/images/IMG_8177.JPG", rotation: 2 },
  { id: 11, url: "/images/IMG_8728.jpeg", rotation: -4 },
];