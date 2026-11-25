# Hindi Video Studio — Native Android (Kotlin + Jetpack Compose)

This directory contains the complete native Android project for **Hindi Video Studio**, structured for Gradle Kotlin DSL (`compileSdk = 35`, `minSdk = 24`) and Jetpack Compose Material 3.

## Build an Installable APK

1. Open the `android/` directory in **Android Studio (Ladybug or newer)**, or run from terminal inside `android/` (with Android SDK & Gradle wrapper configured):
   ```bash
   ./gradlew assembleDebug
   ```
2. Install the generated debug APK onto an Android device or emulator:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```
3. To build a release APK, configure a signing config in `app/build.gradle.kts` and run:
   ```bash
   ./gradlew assembleRelease
   ```

## Self-Hosted Render Node API Contract (Free / No Paid SDKs)

Local prompt drafting, format/style/voice/AI selection, storyboard planning, JSON export, and Library persistence work 100% offline on-device. Live MP4 rendering connects to your self-hosted Render Node:

- `GET /health` → HTTP `200 OK`
- `POST /api/render` → Accepts JSON payload (`topicPrompt`, `formatId`, `aspectRatio`, `style`, `voiceId`, `scriptAiProvider`, `sceneCount`), returns `{ "jobId": "...", "status": "queued", "progress": 10, "stage": "..." }`
- `GET /api/jobs/{jobId}` → Returns `{ "jobId": "...", "status": "rendering|completed|failed", "progress": 0..100, "stage": "...", "mp4Url": "https://.../video.mp4" }`
