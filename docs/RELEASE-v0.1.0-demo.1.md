# Rkeb — Android demo prerelease

First downloadable Android prototype for demo day. **Prerelease**, not a production transport service.

## Install

1. Download the attached `app-debug.apk` asset on an Android 7.0+ phone.
2. Open the APK and allow installation from your browser/files app when prompted.
3. Launch Rkeb and select **Essayer sans compte** (or demo mode on Login).
4. Before presenting: **Profil → Recommencer la démo**.

## Included

- Bundled demo screens and assets; no hosted site needed for demo mode.
- Booking, wallet, tickets, ride requests, groups/fuel pool, simulated tracking, boarding PIN and driver dashboard.
- Tanger / ENSA / Nuit themes; shared footer; About, searchable FAQ, Safety and Contact.
- Survey findings from the supplied 1,000-row questionnaire, distinguished from fictional activity metrics.

## Known limitations

- Debug-signed APK for sideloading, not a Play Store release.
- No physical-device installation or native UI test has yet been completed.
- SOS/GPS/ETA, driver replies, rewards and moderation are prototype simulations. No emergency messages are sent.
- Real sign-in and external links need internet; offline fonts use system fallbacks.
- No confirmed commercial partnership or fuel discount.

Web/mobile builds, TypeScript and the automated test suite were checked. Android packaging and APK signature verification were checked.
