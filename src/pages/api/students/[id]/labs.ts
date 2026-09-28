import type { APIRoute } from "astro";
import { chooseLab } from "../../../../lib/db";

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const course = String(form.get("course") ?? "");
  const activity = String(form.get("activity") ?? "");
  const result = Number.isInteger(id) ? chooseLab(id, course, activity) : "invalid";
  const wantsJson = request.headers.get("accept") === "application/json";
  if (result !== "ok") {
    const message =
      result === "full" ? "That class is full." : "That class isn't available for this student.";
    const status = result === "full" ? 409 : 400;
    return wantsJson ? Response.json({ error: result, message }, { status }) : new Response(message, { status });
  }
  return wantsJson ? Response.json({ ok: true }) : redirect(`/students/${id}#timetable`, 303);
};
