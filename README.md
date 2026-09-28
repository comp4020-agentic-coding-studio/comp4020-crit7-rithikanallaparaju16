# Class registration timetable

A prototype of class registration where you choose tutorials and labs **on the
timetable** rather than from a list. Each student is enrolled in up to four
courses. Lectures have no choice, so they go straight onto the week. For every
lab or tutorial, pressing "Choose lab" lays all of that course's options over
the grid as dashed blocks, next to everything already booked, and you click the
one you want. The page never reloads: options stay up until you pick one, then
the choice stays on the grid while you move to the next course.

Each option shows its seats (for example "12/20 seats"). Full classes are
greyed out and can't be joined; the first option of every course is always full
so this can be shown. After choosing, a message offers **Undo**. Seat counts and
choices update live in every open tab. On a phone the week shows one day at a
time, with day tabs that count the options on each day. A student's name and
courses can be edited, and a student can be deleted, from "Edit courses".

Students, their courses and their lab choices are saved in SQLite. Four test
students, each with two lab courses and two tutorial courses, are created the
first time the app starts on an empty database.

## What good looks like here

- **You pick against what's already there.** The old flow listed lab times as
  text, so you had to remember your week while reading them. Here the options
  sit on the same grid as your lectures and the labs you've already chosen.
- **No decisions you don't need to make.** Lectures appear without being
  registered.
- **Clashes are the student's call.** Universities can't guarantee a clash-free
  week, so a class that overlaps a lecture can still be chosen. Overlapping
  classes sit side by side, so the overlap is visible without a warning.
- **Works without JavaScript.** Scripts make choosing instant, but underneath
  it is a link and a form post, so it keeps working if scripts fail, and every
  option is a real button you can reach with the keyboard.

Checked in `spec/timetable.test.ts`: seeded students, saving, editing and
deleting a student, lectures placed automatically, every option overlaid,
earlier choices kept while another course is open, clashing choices allowed,
seat counts shown, full classes refused, undo clearing a choice, and seat
changes reaching the live stream. Whether the overlay actually *feels* easier,
and whether the phone view works in the hand, are judgement calls for testing
with people.

Not built: real logins (clicking a name stands in for logging in), waitlists,
and a real course catalogue. The seven courses in `src/lib/catalogue.ts` and
their "seats taken by other students" are made-up sample data.
