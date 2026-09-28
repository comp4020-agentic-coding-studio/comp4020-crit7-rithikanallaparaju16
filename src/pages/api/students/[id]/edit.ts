import type { APIRoute } from "astro";
import { updateStudent } from "../../../../lib/db";

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  try {
    if (!updateStudent(id, name, form.getAll("courses").map(String))) {
      return new Response("No such student", { status: 404 });
    }
  } catch {
    return redirect(`/students/${id}/edit?error=1`, 303);
  }
  return redirect(`/students/${id}`, 303);
};
