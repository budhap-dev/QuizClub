---
name: design-phase
description: Build one phase of the QuizClub design upgrade (app shell, home dashboard, presenter stage, host screen, quiz bank) as its own PR. Run as /design-phase <1-5>.
argument-hint: <phase 1-5>
disable-model-invocation: true
---

# Design upgrade: phase $ARGUMENTS

Build phase **$ARGUMENTS** from the table below, and only that phase.

| # | Phase | Brief | Needs | Status |
|---|-------|-------|-------|--------|
| 1 | App shell: desktop sidebar, mobile top bar and tab bar, shared primitives | `phases/1-shell.md` | none | todo |
| 2 | Home dashboard | `phases/2-home.md` | 1 | todo |
| 3 | Presenter stage | `phases/3-stage.md` | 1 | todo |
| 4 | Host screen | `phases/4-host.md` | 1 | todo |
| 5 | Quizzes and quiz bank | `phases/5-bank.md` | 1 | todo |

No argument, or one not in the table: list the phases with their status and stop.

## Keep token use low

- Read `spec.md` and this phase's brief, both in this folder. Do not open other phases' briefs.
- The briefs name every file a phase touches. Don't explore past them unless a type error leads you there.
- The mockups in `mockups/` are the visual source of truth, but they are large. Never read one whole. Run `grep -n '<!--' mockups/<file>` to find its section markers, then `sed -n 'a,bp'` only the section the brief names. Turn mockup hex colours into theme tokens using the table in `spec.md`.
- For files over 200 lines (`Stage.tsx`, `QuestionView.tsx`, `QuizBank.tsx`, `PlaySetup.tsx`), grep for the part you need and read that range.
- Don't re-read a file after editing it. Don't spawn subagents.

## Workflow (follows the repo's PR rules)

1. Check that every phase in **Needs** shows `done` in the table on `main` (`git log --oneline main | grep 'phase N'`). If one doesn't, stop and say which.
2. `git checkout main && git pull`, then `git checkout -b design/phase-$ARGUMENTS-<slug>`.
3. Build the brief. Keep every existing behaviour, store, route and keyboard shortcut unless the brief says to change it.
4. Run `npm run typecheck && npm run build`, and fix anything that fails.
5. Check the result in the browser at 390px and 1440px wide, in **Neon Night** and **Daylight** (one dark theme, one light). Look only at the routes the brief lists.
6. In this file, set the phase's Status to `done`, in the same commit.
7. Commit as `design: <what changed> (phase $ARGUMENTS)`, push, then `gh pr create` with a short summary, what you checked, and any gaps.
8. Give the PR link and stop. Merge (`gh pr merge N --squash --delete-branch`) only after the user says "merge" for that PR.
