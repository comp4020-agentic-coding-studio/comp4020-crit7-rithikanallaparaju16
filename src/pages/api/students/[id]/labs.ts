import type { APIRoute } from "astro";
import { chooseLab } from "../../../../lib/db";

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const course = String(form.get("course") ?? "");
  const activity = String(form.get("activity") ?? "");
  if (!Number.isInteger(id) || !chooseLab(id, course, activity)) {
    return new Response("That class isn't available for this student.", { status: 400 });
  }
  if (request.headers.get("accept") === "application/json") {
    return Response.json({ ok: true });
  }
  return redirect(`/students/${id}#timetable`, 303);
};
