# Biblesyn Android

Android application package for Biblesyn. This first native delivery uses an Android app container around the production Biblesyn experience, so the existing Supabase authentication, published content, plans, audio and Premium access remain the source of truth.

## Requirements
- Node.js 20+
- Expo CLI through npx
- An Expo account and EAS CLI
- Android device for installation/testing

## Local development
```bash
cd apps/android
npm install
npx expo start
```

## Build an installable APK
1. Create/link the EAS project and replace `CONFIGURE_EAS_PROJECT_ID` in `app.json` with its project ID.
2. Run `npx eas-cli login`.
3. Run `npx eas-cli build --platform android --profile preview`.
4. Download the APK from the EAS build page and install it on Android.

The build profile is configured to produce an APK for direct installation. No Play Store publication is required.

## Notes
- The app opens the production Biblesyn site at `https://blui.online/home`.
- Internal Biblesyn links remain inside the app; external links open in the Android browser.
- The website remains responsible for authentication and account data.
- Before release, test Google sign-in on a physical Android device. Google may reject OAuth sign-in from embedded browsers; if that occurs, the next step is a native Supabase OAuth flow using the `biblesyn://` callback and a shared authenticated session.
