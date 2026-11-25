<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9d03e45c-b813-4671-8ace-ae5bfd47e179

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## AI Scene Generator (Gemini)

The Studio now includes **Topic से Scenes** and **Script से Scenes** generation. The backend exposes `POST /api/ai-scenes` and calls Gemini 2.5 Flash server-side. Configure `GEMINI_API_KEY` as a secret environment variable on the Render service (do not place the key in frontend code or commit a real key). The generator returns scene-wise English visual prompts, Hindi voice-over scripts, and concise on-screen text.

The existing visual pipeline generates AI still images and animates them during FFmpeg rendering. A true text-to-video clip provider is not included in this change; that requires a separate provider account/API key and may incur usage charges.
