# CLAUDE.md — novex-academy

**Canonical branch:** `main`. Nothing else. `main` = what's on academy.novex.finance.

**DEAD — do not resurrect, ever:**
- Any `src/app/` tree. Academy is flat `app/(academy)/` route groups.
- Old Dynamic Labs codebase. Wallet bridge is inside the current tree.
- `feat/app-store-ready-academy-redesign-with-wallet-bridge` — deleted Apr 17 2026 after its tip (`b92e59a`) became main.
- `pnpm-lock.yaml` — pnpm + Node 24 has a fatal URL parse bug on Vercel. Repo uses `package-lock.json` / npm. DO NOT reintroduce pnpm.

**Hard rules (violate → outage):**
1. **Commits MUST use `clutchpbcfo <clutchpbcfo@gmail.com>`.** Never `christian-larios@hotmail.com`. Vercel blocks deploys where commit email doesn't match a GitHub account. Global git config is correct — do not pass `-c user.email=...` overrides.
2. **`npx next build` with zero errors before every push.** Including force-pushes. A 14ms Vercel build = `next.config.mjs` crashed at import (usually a missing dep); Next silently skips build and ships empty output. Local build surfaces these instantly.
3. **Never force-push main without explicit user approval in the current chat.** Branch protection blocks force-push server-side (public repo, classic rule enforced). If you're about to reach for `--force` or `+HEAD:main`, stop.
4. **Never assume canonical branch from commit timestamps or intuition.** If uncertain, ASK.
5. **`find app -name 'page.tsx'` empty ≠ repo empty.** Check both `app/` and `src/app/`. Read `ls -la` before concluding.
6. **Unrelated histories = two codebases.** Never merge or force-push across them without user confirmation of which side is canonical.

**Outage mode:** diagnose → propose → confirm → execute. No execute-and-pivot. Two risky things back-to-back → the second is almost certainly wrong.

**Routes post-deploy 404?** Before touching code: `npx vercel inspect <url> --logs | tail -20`. Build time <5s = config crash, fix locally first. 30s+ = real routing issue.

**Handoffs to Claude Code or other agents must name:** target repo, target branch, what's canonical, what's DEAD, what NOT to revert.
