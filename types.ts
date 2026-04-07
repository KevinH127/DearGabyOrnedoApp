export interface Letter {
  id: number;
  title: string;
  preview: string;
  url: string;       // Vercel Blob URL for the encrypted content
  createdAt: string;  // ISO date string
}