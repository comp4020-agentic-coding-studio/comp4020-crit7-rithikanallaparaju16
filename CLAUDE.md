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

## Log every commit for PROCESS.md

- After every commit, add an entry to `process-log.md` with the short hash
  linked to its commit on GitHub, two lines on what changed and why, and my
  prompt(s) that led to it, quoted verbatim, typos and all.
- A commit can't contain its own hash, so the new entry goes into the next
  commit. Never amend a commit to add it.
- Newest entry first. This log is my raw material for PROCESS.md; don't
  edit PROCESS.md from it unless I ask.
