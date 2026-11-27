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

The Studio includes **Topic से Scenes** and **Script से Scenes** generation using Google Gemini 3.8 Flash via the Interactions API. The AI generator requires `GEMINI_API_KEY` in the Render environment; manual scene editing remains available without an AI key. The backend exposes `POST /api/ai-scenes` and calls Gemini 3.8 Flash through the Interactions API server-side. Configure `GEMINI_API_KEY` as a secret environment variable on the Render service (do not place the key in frontend code or commit a real key). The generator returns scene-wise English visual prompts, Hindi voice-over scripts, and concise on-screen text.

The existing visual pipeline generates AI still images and animates them during FFmpeg rendering. A true text-to-video clip provider is not included in this change; that requires a separate provider account/API key and may incur usage charges.


## Version 1.0.3 changes

- Added 1:1 square video output (1080×1080 render canvas), with 9:16 at 1080×1920 and 16:9 at 1920×1080.
- Added scene reorder controls, per-field copy actions, scene quality checks, and scene edit Undo/Redo history.
- Added Home / New 16:9 Video / About bottom navigation.
- Updated Android version to 1.0.3 (versionCode 4).
- Android build workflow now also runs when web/server source files change.

Note: AI scene generation requires a valid `GEMINI_API_KEY` configured as a Render environment secret. This archive does not include API keys or signing keystores.

## Build validation note

The source files were checked for TypeScript/TSX syntax errors and JSON validity. A full Vite/TypeScript dependency-aware build and Android Gradle APK build were not completed in the packaging environment because npm registry access was unavailable and the Android SDK/signing secrets are not included in this source archive. Run the GitHub Actions workflow with the repository's Android signing secrets to produce the signed APK; deploy the server to Render with `GEMINI_API_KEY` configured to enable Gemini scene generation.


## Version 1.0.5 — Direct Script Studio

- Replaced the Android Scene Builder input with one complete-script editor.
- The Render Node splits long scripts internally at sentence/word boundaries; the full narration is retained across all generated segments.
- Removed the previous 750-character Edge TTS truncation and the five-chunk Google TTS fallback limit.
- Removed the 30-scene request truncation for direct scripts.
- Added bounded render preparation concurrency to reduce TTS/visual-provider overload on long scripts.
- Uses the full narration text for word-timed Hindi kinetic captions/subtitles.
- Preserved the existing Disha Manch 9:16 header/footer assets.


## Version 1.0.6 — Gemini Interactions API migration

- Replaced the retired Gemini 2.5 Flash `generateContent` request with Google's `@google/genai` SDK and the Interactions API.
- Updated the model identifier to `gemini-3.8-flash`.
- Added defensive extraction for text returned in the Interactions API response and clear errors for empty or invalid JSON.
- Updated Android version to 1.0.6 (versionCode 7).
