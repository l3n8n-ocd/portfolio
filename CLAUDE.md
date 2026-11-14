# CLAUDE.md: Lenon Adriano's portfolio

Read this before changing anything here. It holds what a new case study needs, so adding one is a
short conversation, not a rebuild. Runbook and the named next case:
[`docs/FL-CAP_KEEP_THE_HABIT.md`](./docs/FL-CAP_KEEP_THE_HABIT.md).

- **Live:** https://l3n8n-ocd.github.io/portfolio/ (GitHub Pages, base path `/portfolio/`)
- **Contact on the site:** GitHub, LinkedIn and the `#contact` form. Never publish an email address.
- **Commits:** as Lenon D. Adriano only, no co-author trailers. Conventional Commits
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).

---

## 1 · Where case studies live

| What | Where |
| --- | --- |
| Case study data | `CASES: CaseStudy[]` in [`src/components/CapstoneAndProjects.tsx`](./src/components/CapstoneAndProjects.tsx) |
| Section heading | the `<h2>` in the same file ("Three things I shipped, ...": update the count) |
| Archive row | `CLOUD_LABS: CaseLink[]` in the same file: links only, no card |
| Card styles | `.case-card`, `.case-impact`, `.case-facts` in `src/App.css` |
| Proof images | `public/assets/cases/<slug>.webp`, linked as `/portfolio/assets/cases/<slug>.webp` |

There is no `src/data/portfolioData.ts`. The data sits in the component file.

```ts
interface CaseStudy {
  index: string      // '01', '02', ... MicroCredit API is always '01'
  category: string   // 'Flagship · Fintech backend'
  title: string
  impact: string     // the plain-English outcome line: shown first, under "Plain-English impact"
  facts: string[]    // [Beat 1 problem, Beat 2 did & decided (1–2 items), Beat 3 what came of it]
  note?: string      // credit and caveats
  tags: string[]     // 3–4
  links: CaseLink[]  // { label: 'Code ↗', href }, at most 3
}
```

## 2 · The three-beat shape (Week 2) and the 10-second rules (Week 6)

1. **`impact` first:** one plain-English line that says what can't go wrong now. No jargon, one breath.
2. **Beat 1: The Problem.** The concrete failure or bottleneck before this existed.
3. **Beat 2: What I Did & Decided.** The build, the trade-off, and the call a human made.
4. **Beat 3: What Came of It.** Numbers a reader can check (tests, eval passes, timings), and links.

10-second critique rules (from [`docs/SURVIVE_THE_CRIT.md`](./docs/SURVIVE_THE_CRIT.md)):

- The plain-English outcome line comes before any technical detail.
- **One primary button on the page:** emerald "Book a 15-min walkthrough" (`.cta-primary`). Case
  cards get outline links (`.project-link-button`) only. Never a second filled or emerald button.
- At most 4 cases in the main grid. A fifth means the oldest supporting case moves to the archive row.
- Every number on a card points to a file, a test run or a live link. No evidence means a TODO, not copy.

## 3 · Voice Card

> **"Direct, technical, plainspoken, concrete, zero buzzwords."**

<!-- voice-check:off -->
1. Banned: "results-driven", "passionate", "seamless", "cutting-edge", "leveraged" (any form of
   "leverage"), "synergy", "robust". Rewrite the sentence; don't swap in a synonym.
<!-- voice-check:on -->
2. Name the real thing: a state transition (`APPROVED → DISBURSED`), a header (`Idempotency-Key`,
   `If-Match`), an invariant (`Σ debits === Σ credits`, `₱1.00 = 100`) or a file path.
3. One breath per sentence. If you can't say it in one breath, split it or cut it.
4. Claims follow evidence. Anything the code, tests, deployment or a public link can't show is a TODO.

Check (prints nothing):

```bash
sed '/voice-check:off/,/voice-check:on/d' CLAUDE.md docs/*.md | grep -niwE 'results-driven|passionate|seamless|cutting-edge|leverag(e|ed|es|ing)|synergy|robust'
grep -rniwE 'results-driven|passionate|seamless|cutting-edge|leverag(e|ed|es|ing)|synergy|robust' src
```

## 4 · Stack and theme (as the code is today)

| Layer | What is in the repo |
| --- | --- |
| UI | React 19 (`react@^19.2.8`), function components and hooks |
| Build | Vite 8 (`vite build`), `base: '/portfolio/'` in `vite.config.js` |
| Language | Mostly `.jsx`; `Hero.tsx`, `CapstoneAndProjects.tsx` and `ContactDispatchForm.tsx` are TypeScript. There is no `tsconfig.json`, and `vite build` strips types without checking them. |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) plus hand-written CSS variables in `src/App.css` |
| Deploy | `.github/workflows/deploy.yml` on every push to `main`. The last 6 runs took 28–36 s. |

Theme tokens (`src/App.css`, `src/index.css`):

| Token | Dark (default) | Light (`.theme-light`) |
| --- | --- | --- |
| `--bg` | `#050816` | `#edf2ff` |
| `--text` | `#e2e8f0` | `#0f172a` |
| `--muted` | `#a8b5cc` | `#334155` |
| `--primary` (labels, links) | `#8b5cf6` | `#7c3aed` (labels `#5b21b6`) |
| `--emerald` (the one CTA fill) | `#10b981` under `#022c22` text (5.97:1) | same fill |
| `--emerald-text` (text on the page) | `#34d399` | `#065f46` |

- **Fonts:** body is `Inter, 'Segoe UI', sans-serif`; code and the proof widget use `'JetBrains Mono'`.
- **`#059669`** is never used under white text (3.77:1 fails AA). Use it only as a fill under near-black
  text, or as a border.
- **Not in the code yet:** the Week 6 brief names a `#060B14` dark background, a `#F8FAFC` light
  background and Plus Jakarta Sans. None of them is in `src/`. The MicroCredit API Identity Kit
  (`#F8FAFC`, `#0F172A`, `#1E293B`, `#059669`, Plus Jakarta Sans + JetBrains Mono) is a separate
  palette. Moving the portfolio onto either one is a design change of its own, not part of adding a case.

## 5 · Checks before every push

```bash
npm run build                      # exit 0
npm run lint                       # eslint: see the note below
npm run preview -- --port 4173     # then open http://localhost:4173/portfolio/
```

`npm run lint` already fails on `main` (as of `75774b5`) with 3 errors that a case-study change doesn't
touch:
- `src/GooeyNav.jsx` lines 19 and 31: an impure function called during render;
- `src/Scanner.jsx` line 321: an empty block.

A new case must not add a fourth. Fixing these is its own `fix:` commit.

At 375 px wide (DevTools device toolbar), run this in the console. It must print `0`:
`document.documentElement.scrollWidth - innerWidth`.

## 6 · One-Prompt Case Study Generator

Paste this into Claude Code in this repo, or into the Claude Project, with the raw notes underneath:

```text
Read CLAUDE.md and docs/FL-CAP_KEEP_THE_HABIT.md. Add one case to CASES in src/components/CapstoneAndProjects.tsx.
Case: <name>. My raw notes, numbers and links are below. Use only facts in them; anything else becomes a TODO.
Shape: impact = one plain-English line (what can't go wrong now); facts = [Beat 1 problem, Beat 2 did & decided (1–2), Beat 3 what came of it with numbers].
Put it at index <02|03>, renumber the rest, keep MicroCredit API at 01, keep the grid at 4 or fewer, and update the <h2> count.
Apply the Voice Card and its banned-word check. No new colours, fonts or buttons; links use .project-link-button.
Run npm run build and the 375 px overflow check, show me the diff, then commit as Lenon with feat(cases): add <name> case study and push to main.
```

The Case 04 notes are already drafted in `docs/FL-CAP_KEEP_THE_HABIT.md` §2, ready to paste.
