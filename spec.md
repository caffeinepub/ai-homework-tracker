# AI Homework Tracker

## Current State
The app has a full homework tracker with TOTP authentication (setup + verify screens) and a Dashboard with assignment management, filtering, stats, and AI study tips.

## Requested Changes (Diff)

### Add
- **Subscription section** in the Dashboard: display two pricing tiers:
  - Free Trial: 3 months free
  - Premium: 1 year for $6
  Presented as a visually distinct section (cards or banner) accessible from the dashboard, no payment processing needed (Stripe not selected), just UI display.
- **App Details QR Code**: a QR code that encodes the app's name (StudyTrack), version (1.0.0), and description. Displayed in the dashboard footer area or as a small section users can access.

### Modify
- Dashboard layout to include the subscription section and app details QR code.

### Remove
- Nothing.

## Implementation Plan
1. Create `SubscriptionSection.tsx` component with two plan cards: Free Trial (3 months free) and Premium (1 year / $6).
2. Create `AppDetailsQR.tsx` component that generates and shows a QR code encoding app details (name, version, tagline). Use the `qrcode` or `qrcode.react` npm package.
3. Add the SubscriptionSection to the Dashboard below the stats row or as a separate tab.
4. Add the AppDetailsQR in the footer or as a small accessible section.
5. Install `qrcode.react` package for QR code generation.
