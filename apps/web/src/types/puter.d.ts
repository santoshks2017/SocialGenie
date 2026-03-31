// Type declarations for Puter.js (https://js.puter.com/v2/)
// Loaded via <script> tag in index.html — no npm package

interface PuterAI {
  chat(prompt: string, options?: { model?: string; stream?: boolean }): Promise<string | { message: { content: string } }>;
  txt2img(prompt: string, testMode?: boolean): Promise<HTMLImageElement>;
}

interface Puter {
  ai: PuterAI;
}

declare global {
  interface Window {
    puter?: Puter;
  }
}

export {};
