import type { APIRoute } from "astro";
import { deleteStudent } from "../../../../lib/db";

export const POST: APIRoute = ({ params, redirect }) => {
  deleteStudent(Number(params.id));
  return redirect("/?deleted=1", 303);
};
