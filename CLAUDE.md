# Harness rules

These are the rules I hold the agent to on this project.

## Check every change in a real browser, portrait and landscape

- After any change to what a page shows, check every affected page in a real
  browser at **1920×1080**, **390×844** and **280×900**, and in landscape at
  **844×390** and **900×280**.
- Landscape matters most: students mostly hold their phone sideways to read a
  timetable. In landscape the full week must fit across the screen, and tapping
  "Choose" must bring that course's options into view without the student
  hunting for them.
- At each size: the page must not scroll sideways, text must not overlap or be
  cut off in a way that hides meaning, and every button and link must be
  reachable and usable. Measure page width with
  `document.documentElement.clientWidth`, not `innerWidth`, which can include
  the scrollbar and hide an overflow.
- Look at the screenshots, don't just measure. A check that counts elements
  can pass while the page looks broken.
- `pnpm test:browser` (Playwright, in `e2e/`) must pass: it enforces these
  viewports automatically. When a layout bug slips past it, add a check there
  that fails on the bug before fixing it.

## Check live updates with two windows

- Anything that updates live (seat counts, choices) must be checked with **two
  browser windows open on the same running server**: make the change in one
  and confirm the other updates without a reload.
- Both windows must use the same server. A second server process has its own
  event bus, so windows on different servers never see each other's updates.

## Give me test cases after every update

- End every update with a numbered list of test cases I can run myself: the
  steps to take and what I should see. Cover the feature that changed and
  anything nearby it could have broken.
- Mark which cases need two windows, a phone-sized window, or landscape.

## Never commit on red

- No commit while any test fails: `pnpm check` and `pnpm test:browser` must
  both be green. The pre-commit hook in `.githooks/pre-commit` enforces this;
  never bypass it with `--no-verify`.
- If a test fails, fix the code, or fix the test if it is genuinely wrong and
  say why. Never delete or loosen a test just to get a commit through.

## Run the CI checks before shipping

- CI skips every job while the repo is private, so before `/ship` makes it
  public, run what CI runs on a **fresh clone of what's on GitHub**, not the
  working folder: `pnpm install --frozen-lockfile`, `pnpm check`,
  `pnpm check:evidence`, and the course-key scan from `.github/trufflehog.yml`
  over the full history.
- Rehearse the deploy too: build the way the `Dockerfile` does (production
  build, then `pnpm prune --prod`), run that server, and repeat the deploy
  job's checks against it: the site returns 200, `/api/events` streams, a
  same-origin POST isn't refused, a cross-site POST is, and linkinator finds no
  broken internal links.
- Don't ship until every check passes, and report each result. If a check
  can't be run locally, say which and what covers it instead.

## Log every commit for PROCESS.md

- After every commit, add an entry to `process-log.md` with the short hash
  linked to its commit on GitHub, two lines on what changed and why, and my
  prompt(s) that led to it, quoted verbatim, typos and all.
- A commit can't contain its own hash, so the new entry goes into the next
  commit. Never amend a commit to add it. A commit that only adds log entries
  doesn't get an entry of its own.
- Newest entry first. This log is my raw material for PROCESS.md; don't
  edit PROCESS.md from it unless I ask.
