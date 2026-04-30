# App Store submission checklist — Novex Academy

Run through top to bottom before clicking **Submit for Review**.

## Before the build

- [ ] `pnpm install --frozen-lockfile` clean.
- [ ] `pnpm test` green (10/10 new tests pass; pre-existing
      wallet-modal + exam-view-timer failures are unchanged from main).
- [ ] `pnpm build` green (NODE_OPTIONS=4096 — mirrors Vercel).
- [ ] Manually load `academy.novex.finance` on a phone browser; verify
      academy + briefs + sensei routes render and Open Terminal CTA works.
- [ ] No "trading bot" / "trading platform" / "guaranteed" copy
      reachable from the app:
      `grep -ri "trading bot\|trading platform\|guarantee" .`
- [ ] Privacy policy published at `novex.finance/privacy`.
- [ ] Support URL `novex.finance/support` returns 200.

## In Xcode

- [ ] Bundle id `finance.novex.academy` (matches `capacitor.config.ts`).
- [ ] Version + build numbers bumped (e.g. `1.0.0` / `1`).
- [ ] App icon set complete — every slot filled (Apple rejects partials).
- [ ] Launch storyboard renders Novex shell color (`#05080d`).
- [ ] `Info.plist` — only permissions actually used.
- [ ] No localhost / staging URLs in any plist or built JS.
- [ ] Archive succeeds. Distribute → App Store Connect succeeds.

## In App Store Connect

- [ ] Strings pasted from `docs/appstore/METADATA.md`.
- [ ] Category: Education (primary) / Finance — Reference (secondary).
- [ ] Age rating 17+.
- [ ] Encryption answered Yes / Standard / Exempt.
- [ ] Privacy "Data Used to Track You" = none.
- [ ] Screenshots: Academy + Briefs + Sensei only. No terminal.
- [ ] 5×6.5" + 5×5.5" uploaded.
- [ ] Reviewer Notes pasted (METADATA.md → Reviewer notes).
- [ ] Demo account: not required.
- [ ] Export compliance answered.
- [ ] Build number matches the Xcode upload.

## After Submit

- [ ] Watch App Store Connect → Activity.
- [ ] If review goes "In Review" → expect 24–48h.
- [ ] If rejected, common causes:
  - Crypto + finance category mismatch → emphasize education.
  - "App appears to enable trading" → respond with the screenshot
    index showing only academy + briefs + sensei; Open Terminal is
    a link to a separate web product.
  - Privacy policy missing data category → fix `novex.finance/privacy`.

## After approval

- [ ] Update memory: bundle id, app id, review learnings
      (`memory/project_app_store_launch.md`).
- [ ] App Store badge + link in academy footer.
- [ ] Tweet from `@NovexFi`. Pinned.
