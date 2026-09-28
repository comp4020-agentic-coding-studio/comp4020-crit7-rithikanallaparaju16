# Class registration timetable

A prototype of class registration where you choose tutorials and labs **on the
timetable** rather than from a list. Each student is enrolled in up to four
courses. Lectures have no choice, so they go straight onto the week. For every
lab or tutorial, pressing "Choose lab" lays all of that course's options over
the grid as dashed blocks, next to everything already booked, and you click the
one you want. Options that overlap something already booked are marked
**clash**.

Students, their courses and their lab choices are saved in SQLite. Four test
students with four courses each are created the first time the app starts on an
empty database.

## What good looks like here

- **You pick against what's already there.** The old flow listed lab times as
  text, so you had to remember your week while reading them. Here the options
  sit on the same grid as your lectures and the labs you've already chosen.
- **No decisions you don't need to make.** Lectures appear without being
  registered.
- **Clashes are visible, not blocked.** A clashing option is outlined in red
  and names what it overlaps. You can still take it, because real students
  sometimes accept a clash with a recorded lecture.
- **Works without JavaScript.** Choosing is a link and a form post, so it keeps
  working if scripts fail, and every option is a real button you can reach
  with the keyboard.

Checked in `spec/timetable.test.ts`: seeded students, saving a new student,
lectures placed automatically, every option overlaid, a choice persisting, clash
flagging, and refusing a lab from a course the student isn't taking. Whether the
overlay actually *feels* easier is a judgement call for testing with people.

Not built: logins, capacity limits or waitlists, a real course catalogue (the
six courses in `src/lib/catalogue.ts` are made-up sample data), and live
updates between tabs.
