# Process log

Raw material for PROCESS.md: every commit's hash, two lines on what changed,
and the prompt(s) behind it, verbatim. Newest first.

## [`8e58ba2`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/8e58ba2): block commits while tests are red

The pre-commit hook now runs `pnpm check` and `pnpm test:browser`; a deliberately
broken assertion made it exit 1 and refuse the commit. CLAUDE.md bans `--no-verify` and loosening tests.

> what else can we add here? i dont want any commits when tests are red

## [`eed6fa9`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/eed6fa9): seats on chosen classes, Playwright viewport tests

Chosen classes now show their seat count, and `pnpm test:browser` checks all five
viewports in real Chrome. Proved the tests work by re-adding the old hidden-options
and 280px bugs: 6 tests failed, then all 12 passed once fixed. Dev server now reachable on Wi-Fi.

> - Make the phone view the default for the week view. Test 11 is the one most likely to feel awkward, so it's worth trying on your actual phone. Your laptop's address on your Wi-Fi, port 4321, should reach the dev server.
> - Show the seat count on your chosen class too, so students know how close it is to full.
> - Automated tests for real browsers. The CSS "hidden" bug and this 280px overflow were both invisible to the current tests. A small Playwright test at your three viewports would enforce the CLAUDE.md rule automatically. It's a new dev dependency, so it's your call. do all of these, and these are tests for you, you dont have to test everything just the new feature you added should be good

## [`7de6859`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/7de6859): harness rules, commit log, viewport fixes

Wrote CLAUDE.md rules (portrait + landscape viewports, two-window live checks,
test cases, this log) and fixed what the viewport sweep found: card overflow at
280px, unused width at 1920px, and options off-screen after tapping Choose in landscape.

> claude.md add these points, check all the viewports (1920×1080 and 390×844, 280x900. with all the updates keep giving me test cases so i can check. for the live classes open 2 ports and chcek. what else do you suggest

> oh, add the side wayy scroll rules as well, because timetable will be accessed side ways for students mostly. and add in clausde to keep adding hashes with a 2 line main info and my prompt every time so i can make the process.md later

## [`9e18273`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/9e18273): cite the timetable commits in PROCESS.md

Added the two feature commits to PROCESS.md's "How I got here", then pushed all
three commits so the citation links resolve on GitHub.

> add this commit hash to process.md too

> i cant see anything in process.md

> yes commit and push

## [`8b78c33`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/8b78c33): seat capacity, undo, live updates, phone day view, student editing

Options show seats and full classes can't be joined (every course's first option
is full for demos); choices can be undone and sync live across tabs over SSE.
Phones get one day at a time with day tabs; students can be edited or deleted.

> 2. Class capacity. Real labs fill up. Showing "12/20 seats" on each option and greying out full ones would be the most realistic addition. love this one. infact show the lab/tut of every first class full for testing and presenting purpose alone. do number 4 also, and 7th one is good as well, undo also good. live updartes is also perfect

> can you continue

## [`59a6de4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-rithikanallaparaju16/commit/59a6de4): overlay timetable replaces the guestbook

Lectures are placed automatically, and opening a course's lab or tutorial lays
every option over the week in place; clashes are allowed. Seeded four test
students with two lab and two tutorial courses each, and added course names.

> there are 4 courses as you can see. and once i click on it, we see that we have to register the lectures as well. so we can just directkly show the lectures because they dont have a choice, then for the labs, youj can see that it shows all options like date and time etc i want it to show on the timetable directly.for example as soon as i click on a courses "labs" it has to overlay all the timing for me, then i can literally see what i chose before and then choose according to that, now the app just shows me on text. show me a prototype of this. student name and courses can be saved in the backend. i also need you to create a few students w 4 courses each for testing

> Hello I want my timetable app to function in a way like let's see for example I have four lectures as soon as I login as a student. I want all of my four lectures to be visible to me already because I cannot change them. The next steps is each of these four lectures let's say have a computer lab so for computer labs and these computer labs can have different timings. Maybe let's say two lectures have labs and two other lectures have tutorials so these are the things that students can choose now. As soon as I click on let's say course ones tutorial then I want it to overlay all the office that are available. It should not show on text like how I upgrade the image. It has to be like as soon as I press on let's say discreet maths tutorial. It has to show me all the office that I have on my timetable itself and this time we already have my lectures so I can see what timings I want to choose. I have a student can also choose a tutorial that class with my lecture like that's my choice so you don't make any tests and remove those like it's okay if they clash because universities can't guarantee all students not clashing next now when I go to the second course I wanted to have all the lectures as usual as before and I also wanted to have the first courses chosen tutorial there so as soon as I choose a tutorial of the overlay all the options that one should be specifically there but until then everything should show until I click on what I want. Only then that should be permanent until then all of my options should keep showing so this way I will understand what options I have without reopening the timetable and refreshing it every single time. I can literally see it and choose whatever I want.

> add this commit hash and write a line "made my own test to check clashing classes which i dissaproved" in process.md. what more do you suggest? what does this website lack, any more options? also add the course name also

(The course names were added before this commit was made, so they are part of it.)
