# Android demo — install before presentation day

## Install the APK

Current release: [v0.1.0-demo.4](https://github.com/FYI88/REKEBTEST/releases/tag/v0.1.0-demo.4).

[Download the latest Android APK](https://github.com/FYI88/REKEBTEST/releases/latest/download/rkeb-android.apk). Version code 4. Can update earlier demo versions when signed by the same machine-local key.

New in demo.4:

- **Back button**: the phone's back button returns to the previous screen. On the home screens (`/` and `/app`) the first press shows « Appuie encore sur retour pour quitter »; a second press within 2 seconds closes the app (`src/components/native-shell.tsx`, `@capacitor/app`).
- **Offline banner**: with no connection, a saffron banner explains that account login is unavailable and offers « Ouvrir le mode démo ».
- **Route sketch**: ride detail shows a journal-style ink sketch of the route with named, numbered pickups in travel order (`src/components/route-sketch.tsx`). It is labelled as indicative, not GPS.

Phone check for demo.4: press back from a ride detail (returns to the list), then twice on the home screen (exits); turn on airplane mode and confirm the banner.

The website displays **APK Android** in its mobile landing action bar and shared footer (below 768px). Downloads are hidden inside the native Capacitor app. The stable link uses GitHub's latest release with the asset name `rkeb-android.apk`; keep that exact name and mark future demo releases as Latest for the link to continue working. This is an Android APK, not an iOS app.

The locally built, debug-signed APK is:

`android/app/build/outputs/apk/debug/app-debug.apk`

1. Transfer this file to your Android phone (Android 7.0 or newer).
2. Open it from the phone's Files app. Allow installation from that source if Android asks.
3. Install **Rkeb** and launch it.
4. Choose **Essayer sans compte** or **Entrer en mode démo (Amine)**.
5. Try booking, wallet, tickets, requests, groups and the driver dashboard.
6. Close and reopen the app to check persistence.
7. Turn airplane mode on and repeat the demo. Demo data, images and scripts are bundled; external links and real account authentication require a connection. Web fonts fall back to system fonts offline.
8. Before presenting, use **Profil → Recommencer la démo**.

This is a Capacitor Android wrapper containing the client demo. No hosted web server is required. It is a demo APK, not a Play Store release. The debug signing key is machine-local; rebuilding on another machine can require uninstalling the previous demo APK first.

## Rebuild

To regenerate launcher and splash images from `public/rkeb-logo.png`, install Pillow and run `python scripts/android-branding.py` before building Android.

Requirements: Node.js 22+, a complete JDK 21, Android SDK platform 36 and SDK build tools. Android Studio can provide the SDK and manage installation.

```powershell
npm ci
npm run build                 # updates the generated file route tree
npm run android:sync          # builds client assets and copies them into Android
# Set JAVA_HOME to a complete JDK 21 and ANDROID_HOME to your SDK folder.
```

Run from the `android` directory:

```powershell
.\gradlew.bat assembleDebug --no-daemon --max-workers=1 "-Dorg.gradle.jvmargs=-Xmx768m -XX:ActiveProcessorCount=2"
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

For the setup used during this session (temporary tooling, not committed):

```powershell
$env:JAVA_HOME = "$env:LOCALAPPDATA\Temp\opencode\jdk\jdk-21.0.13.0.2+1"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Temp\opencode\android-sdk"
```

Alternatively, `npm run android:open` opens the native project in Android Studio.

## Verification status

- Web and standalone mobile client builds succeeded.
- Android `assembleDebug` succeeded with one worker and the reduced-memory settings above.
- The mobile client rendered landing, About, Help, Safety, Contact and discovery in headless Chrome at 390px.
- APK installation, native navigation and the phone's keyboard/system-bar behavior must still be checked on a physical phone before demo day.

## What stays simulated

GPS, ETA, SOS, driver replies, boarding rewards and moderation use the local prototype behavior. No emergency messages are sent. Partnerships shown in the footer are proposals, not signed agreements.
