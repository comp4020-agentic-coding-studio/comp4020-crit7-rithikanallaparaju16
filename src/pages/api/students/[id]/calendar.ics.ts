import type { APIRoute } from "astro";
import { buildCalendar } from "../../../../lib/calendar";
import { getTimetable } from "../../../../lib/db";

// A subscribed calendar feed: Google and Apple re-read it, so changes here
// replace the old classes in the student's calendar.
export const GET: APIRoute = ({ params }) => {
  const data = getTimetable(Number(params.id));
  if (!data) return new Response("No such student", { status: 404 });
  return new Response(buildCalendar(data), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="timetable.ics"',
      "cache-control": "no-cache",
    },
  });
};
