import type { APIRoute } from "astro";
import { createStudent } from "../../lib/db";

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const courses = form.getAll("courses").map(String);
  try {
    const student = createStudent(name, courses);
    return redirect(`/students/${student.id}`, 303);
  } catch {
    return redirect("/?error=1", 303);
  }
};
