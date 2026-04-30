# App Store metadata — Novex Academy

Copy/paste this into App Store Connect. Every string follows two
hard rules:

1. **Words we use:** AI research, crypto analytics, educational,
   confluence-scored signals, on-chain context, market intelligence,
   curriculum, postmortem, observatory.
2. **Words we never use:** bot, trading bot, automated trading,
   trading platform, copy trading, signals service, financial advice,
   guaranteed returns, profit, beat the market, alpha.

If a piece of copy not in this file is needed, run it past the same
two rules before shipping.

---

## Primary fields

**App Name** (max 30 chars)

```
Novex Academy
```

**Subtitle** (max 30 chars)

```
AI Crypto Research Curriculum
```

**Promotional Text** (max 170 chars, can be updated without review)

```
Five-module AI crypto curriculum + a live 4-hour postmortem stream.
Read the math, learn the regime, level up your read.
```

**Description** (max 4000 chars, recommended ~2000)

```
Novex Academy is a structured curriculum for crypto market
research. Five modules. Eighteen lessons. One operator certification.

Designed for traders, analysts, and curious operators who want to
understand the on-chain market through the lens of AI-driven
confluence scoring rather than gut feel.

THE CURRICULUM

• Perp Fundamentals — leverage, margin, funding, liquidation, and
  how each one shapes risk before you click anything.
• SENSEI Signal Mastery — the 12-dimensional scoring engine, the
  /19 scale, regime filters, and the worked examples that connect
  numbers to behavior.
• Fleet Intelligence — the seven-agent multi-perspective pipeline
  that stress-tests every setup. When to trust the math, when to
  trust the agents, and how to read the verdict.
• Risk Management — the 1–2% rule, position sizing math, circuit
  breakers, correlation traps, and the boring rules that keep
  operators alive across a long career.
• Graduation Exam — twenty-five scenario-based questions, drawn
  from real session logs. Pass at 80% or above to earn the CIO chip.

THE BRIEF STREAM

Every four hours, the AI fleet writes a postmortem on its last
read — was the call right, was it wrong, what shifted? Read the
postmortem, then read the score guide, then take the next read with
a calibrated head. The postmortem stream is open to every academy
user.

WHAT IT IS NOT

Novex Academy is research and education. It does not place trades,
manage funds, give financial advice, or guarantee outcomes. Past
analysis does not predict future market behavior. Operators are
responsible for their own decisions, sizing, and execution.

WHO IT IS FOR

Crypto-curious operators who think numerically, like to learn from
postmortems, and want a structured map of how a modern AI-driven
market read is actually built. Comfortable with the language of
perps, fibs, and order flow.

ABOUT NOVEX

Novex is an independent research collective focused on AI-driven
market analytics. The academy is the educational layer of a wider
research program.

LEGAL

Educational content only. Not financial, investment, tax, or legal
advice. Cryptocurrency markets carry substantial risk including
total loss. You are responsible for your own decisions.
```

**Keywords** (max 100 chars, comma-separated)

```
crypto,research,analytics,AI,education,bitcoin,ethereum,markets,curriculum,perp,fibs,liquidity
```

**Support URL**

```
https://novex.finance/support
```

**Marketing URL**

```
https://academy.novex.finance
```

**Privacy Policy URL**

```
https://novex.finance/privacy
```

---

## App Store category

- **Primary:** Education
- **Secondary:** Finance — Reference

> "AI Crypto Research & Analytics" is not an actual App Store
> category. Education + Finance/Reference is the closest match and
> avoids the heavily-policed Finance → Trading subcategory.

## Age rating

- **17+** (cryptocurrency reference triggers Unrestricted Web Access
  + Frequent/Intense Mature Themes flags).

## Content rights

- "Does your app contain, show, or access third-party content?" → **Yes**
  (live market data + briefs from `ctn-api.novex.finance`, operated
  by Novex.)

## Encryption

- "Does your app use encryption?" → **Yes** (HTTPS / TLS)
- "Standard encryption only?" → **Yes** (qualifies for the standard
  exemption; no annual self-classification report needed.)

---

## Screenshots brief

Five 6.5" + five 5.5" screenshots:
1. Academy module list — five modules, NXP totals visible.
2. Lesson detail — pick a SENSEI lesson with the score table.
3. Brief stream — three or more briefs with mixed RIGHT/WRONG/FLAT.
4. Sensei page — tier system grid + EMA ladder.
5. Leaderboard — only if user is signed in. Otherwise skip.

**Hard rule:** never include a screenshot of the live terminal,
position table, PnL curve, or order ticket.

## App Preview video

Optional. 15–30s. Same three-tab walk: Academy → Briefs → Sensei.
No Terminal tab footage.

---

## What's New (release notes for first version)

```
First release. Five-module AI crypto curriculum. Live 4-hour
postmortem stream. Sensei score guide.
```

---

## Reviewer notes

In App Store Connect → Version → "App Review Information → Notes",
paste:

```
Novex Academy is a structured educational curriculum about
AI-driven crypto market research. The app does not place trades,
manage funds, or give financial advice.

Test account: not required. All academy content and the brief
stream are public.

The app is a Capacitor wrap of academy.novex.finance. Tabs:
- Academy: lesson curriculum
- Briefs: read-only postmortem stream
- Open Terminal: opens novex.finance/terminal in the in-app
  browser. The terminal is a separate web product; the app does
  not execute trades or hold funds.

If anything in the brief stream appears to be a trade
recommendation, please contact us at support@novex.finance and we
will adjust copy. The intent is educational postmortem only.
```
