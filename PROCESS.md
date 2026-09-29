# Process overview

## What I built

I built a fix for ANU's timetabling app. Lectures are already there because they
are compulsory, and when you choose a lab or tutorial, all its options are
overlaid on your existing timetable, so you can see what clashes and by how
much, along with a live count of the seats left.

## How I got here

ANU's timetable app makes you pick labs from a text list, so you have to
remember your week and trust the word "clash". I asked for the options to go on
the timetable instead:

> as soon as i click on a courses "labs" it has to overlay all the timing for me, then i can literally see what i chose before and then choose according to that

The agent's first version flagged clashes in red and tested for them. I
disapproved of that:

> it's okay if they clash because universities can't guarantee all students not clashing

I also wanted the options to stay on screen, without reloading, until I picked
one. [`59a6de4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/59a6de4) placed lectures automatically, overlaid every
option and tested that a clashing choice is accepted. [`8b78c33`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/8b78c33)
then added seat counts (every course's first option is always full, for
demos), undo, live updates across tabs, a one-day phone view and student
editing.

Next, I wrote my rules into `CLAUDE.md` ([`7de6859`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/7de6859)): check five
viewports, check live updates in two windows, and give me test cases after
every update. I included landscape after pointing out:

> timetable will be accessed side ways for students mostly

Screenshots caught two bugs the tests missed (hidden options still showing
and a 280px overflow), so [`eed6fa9`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/eed6fa9) added Playwright tests that
catch both. Finally, I asked:

> i dont want any commits when tests are red

so [`8e58ba2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/8e58ba2) added a pre-commit hook that blocks commits
unless every test passes.
