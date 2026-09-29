import { type Activity, findCourse } from "./catalogue";
import type { StudentTimetable } from "./db";

// Sample semester dates for the weekly repeats; the start is a Monday.
export const TERM = { start: "2026-07-27", end: "2026-10-30" };

const TZID = "Australia/Sydney";

// Canberra's daylight-saving rules, so class times stay put across the October change.
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:STANDARD",
  "DTSTART:19700405T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU",
  "TZOFFSETFROM:+1100",
  "TZOFFSETTO:+1000",
  "TZNAME:AEST",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "DTSTART:19701004T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU",
  "TZOFFSETFROM:+1000",
  "TZOFFSETTO:+1100",
  "TZNAME:AEDT",
  "END:DAYLIGHT",
  "END:VTIMEZONE",
];

const pad = (n: number) => String(n).padStart(2, "0");
const compactDate = (iso: string) => iso.replaceAll("-", "");

const escapeText = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// RFC 5545 lines are at most 75 octets; longer ones continue after CRLF + space.
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function firstDate(day: number): string {
  const d = new Date(`${TERM.start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + day);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

const localTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}00`;

function event(studentId: number, a: Activity, stamp: string): string[] {
  const date = firstDate(a.day);
  return [
    "BEGIN:VEVENT",
    // Stable per student and class: when a class is swapped, its old UID leaves
    // the feed and subscribed calendars delete that event on their next sync.
    `UID:${a.id}-student${studentId}@timetable.comp4020`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZID}:${date}T${localTime(a.start)}`,
    `DTEND;TZID=${TZID}:${date}T${localTime(a.end)}`,
    // UNTIL must be UTC; the last Friday's end in UTC is still before any weekend class.
    `RRULE:FREQ=WEEKLY;UNTIL=${compactDate(TERM.end)}T235959Z`,
    `SUMMARY:${escapeText(`${a.courseCode} ${a.kind}`)}`,
    `DESCRIPTION:${escapeText(findCourse(a.courseCode)?.name ?? "")}`,
    `LOCATION:${escapeText(a.room)}`,
    "END:VEVENT",
  ];
}

export function buildCalendar({ student, courseCodes, labs }: StudentTimetable, now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const activities = courseCodes.flatMap((code) => {
    const course = findCourse(code);
    if (!course) return [];
    const chosen = course.groups.find((g) => g.id === labs.get(code));
    return chosen ? [...course.lectures, chosen] : course.lectures;
  });
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//COMP4020//Class registration timetable//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`Timetable - ${student.name}`)}`,
    `X-WR-TIMEZONE:${TZID}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    ...VTIMEZONE,
    ...activities.flatMap((a) => event(student.id, a, stamp)),
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
