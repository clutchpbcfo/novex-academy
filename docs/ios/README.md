# Novex Academy — iOS build guide

Capacitor 7 wraps the live `academy.novex.finance` webview into a
native iOS shell. The native side adds: 3-tab bottom bar, native
splash, status-bar tinting, in-app browser for the Open Terminal
flow, and App Store presence under the AI / Crypto Research category.

This guide is what you run on your Mac. Nothing here can be done
from WSL; iOS builds require Xcode.

## One-time setup

Prerequisites: macOS 14+, Xcode 16+, CocoaPods, Node 22 (use repo `.nvmrc`),
`pnpm` 9, paid Apple Developer account.

```bash
git clone git@github.com:clutchpbcfo/novex-academy.git
cd novex-academy
pnpm install
pnpm cap add ios
pnpm cap sync ios
pnpm cap open ios
```

## Bundle identifier and signing

Default in `capacitor.config.ts`: `finance.novex.academy`.

In Xcode → `App` target → Signing & Capabilities:
1. Team: select your Apple Developer team.
2. Bundle Identifier: confirm it matches `finance.novex.academy`.
3. Add Universal Links capability and wire `academy.novex.finance`.

## App icons

Drop a 1024×1024 PNG into `ios/App/App/Assets.xcassets/AppIcon.appiconset/`,
or generate the full set with `npx @capacitor/assets generate --ios`.
Source SVG at `docs/ios/icon-source.svg` is the master.

## Local build

```bash
pnpm build
pnpm cap sync ios
pnpm cap open ios
```

In Xcode: Product → Archive → Distribute → App Store Connect.

## TestFlight

After upload, App Store Connect → TestFlight → add yourself as
internal tester. Install on device and verify the three tabs
end-to-end before App Review.

## App Review

Walk through `docs/appstore/SUBMISSION-CHECKLIST.md`.

Two non-obvious things that have killed previous submissions:
- Screenshots show **academy and briefs only**. Never the terminal.
- Metadata says **AI research / crypto analytics / educational** and
  never **bot / trading bot / trading platform**.
  See `docs/appstore/METADATA.md`.

## Updating after launch

The webview pulls live from `academy.novex.finance` so most content
updates ship via `git push` to main. Re-archive only when:
- Native plugins change.
- `capacitor.config.ts` changes.
- App Store metadata or screenshots change.
- `Info.plist` permissions change.
