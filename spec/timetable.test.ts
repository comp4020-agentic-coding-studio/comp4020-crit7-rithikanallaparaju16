import { JSDOM } from "jsdom";
import { describe, expect, inject, it } from "vitest";

const baseUrl = inject("baseUrl");

const page = async (path: string) => {
  const res = await fetch(new URL(path, baseUrl));
  return { status: res.status, doc: new JSDOM(await res.text()).window.document };
};

// Astro rejects cross-origin form POSTs; browsers send Origin, bare fetch doesn't.
const post = (path: string, body: URLSearchParams) =>
  fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { origin: baseUrl },
    body,
    redirect: "manual",
  });

const createStudent = async (name: string, courses: string[]) => {
  const body = new URLSearchParams({ name });
  for (const c of courses) body.append("courses", c);
  const res = await post("/api/students", body);
  expect(res.status).toBe(303);
  const location = res.headers.get("location") ?? "";
  expect(location).toMatch(/^\/students\/\d+$/);
  return location;
};

const visibleBlocks = (doc: Document) => [...doc.querySelectorAll(".day-body .block:not([hidden])")];
const optionButtons = (doc: Document) =>
  [...doc.querySelectorAll(".block.option:not([hidden]) button")];

describe("timetable", () => {
  it("seeds several test students, each with four courses", async () => {
    const { doc } = await page("/");
    const students = [...doc.querySelectorAll(".student-list > li")];
    expect(students.length).toBeGreaterThanOrEqual(4);
    for (const li of students.slice(0, 4)) {
      expect(li.querySelectorAll(".enrolled li")).toHaveLength(4);
    }
  });

  it("saves a new student's name and courses", async () => {
    const path = await createStudent("Spec Student", ["COMP1100", "STAT1003"]);
    const { doc } = await page(path);
    expect(doc.querySelector("h1")?.textContent).toContain("Spec Student");
    const courses = doc.querySelector(".courses")?.textContent ?? "";
    expect(courses).toContain("COMP1100");
    expect(courses).toContain("STAT1003");
    expect(courses).not.toContain("MATH1013");
  });

  it("rejects a student with more than four courses", async () => {
    const body = new URLSearchParams({ name: "Too Many" });
    for (const c of ["COMP1100", "MATH1013", "COMP1600", "STAT1003", "ENGN1211"]) {
      body.append("courses", c);
    }
    const res = await post("/api/students", body);
    expect(res.headers.get("location")).toMatch(/error/);
  });

  it("places lectures on the grid without the student choosing them", async () => {
    const path = await createStudent("Lecture Check", ["COMP1100"]);
    const { doc } = await page(path);
    const blocks = visibleBlocks(doc).map((b) => b.textContent);
    expect(blocks.filter((t) => t?.includes("COMP1100") && t.includes("Lecture"))).toHaveLength(2);
    expect(optionButtons(doc)).toHaveLength(0);
  });

  it("overlays every lab option for the course being chosen", async () => {
    const path = await createStudent("Overlay Check", ["COMP1100", "COMP1600"]);
    const { doc } = await page(`${path}?pick=COMP1100`);
    expect(optionButtons(doc)).toHaveLength(6);
    const lectures = visibleBlocks(doc).filter((b) => b.classList.contains("lecture"));
    expect(lectures.length).toBe(4);
  });

  it("persists the chosen lab and shows it as a fixed block", async () => {
    const path = await createStudent("Choice Check", ["COMP1100"]);
    const id = path.split("/").pop()!;
    const res = await post(
      `/api/students/${id}/labs`,
      new URLSearchParams({ course: "COMP1100", activity: "COMP1100-LAB04" }),
    );
    expect(res.status).toBe(303);
    const { doc } = await page(path);
    const labs = visibleBlocks(doc).filter((b) =>
      b.textContent?.includes("Lab"),
    );
    expect(labs).toHaveLength(1);
    expect(labs[0].textContent).toContain("09:00–11:00");
    expect(doc.querySelector(".courses")?.textContent).toContain("Thursday 09:00–11:00");
  });

  it("keeps an earlier course's chosen class on the grid while another course's options are open", async () => {
    const path = await createStudent("Keep Check", ["COMP1100", "MATH1005"]);
    const id = path.split("/").pop()!;
    await post(
      `/api/students/${id}/labs`,
      new URLSearchParams({ course: "COMP1100", activity: "COMP1100-LAB02" }),
    );
    const { doc } = await page(`${path}?pick=MATH1005`);
    expect(optionButtons(doc)).toHaveLength(6);
    const kept = visibleBlocks(doc).filter(
      (b) => b.textContent?.includes("COMP1100") && b.textContent.includes("Lab"),
    );
    expect(kept).toHaveLength(1);
    expect(kept[0].textContent).toContain("14:00–16:00");
  });

  it("lets a student choose a class that clashes with a lecture", async () => {
    const path = await createStudent("Clash Allowed", ["COMP1100", "STAT1003"]);
    const id = path.split("/").pop()!;
    // COMP1100 Tue 09:00–11:00 lab overlaps the STAT1003 Tue 10:00 lecture.
    const res = await post(
      `/api/students/${id}/labs`,
      new URLSearchParams({ course: "COMP1100", activity: "COMP1100-LAB01" }),
    );
    expect(res.status).toBe(303);
  });

  it("refuses a lab from a course the student isn't taking", async () => {
    const path = await createStudent("Refuse Check", ["COMP1100"]);
    const id = path.split("/").pop()!;
    const res = await post(
      `/api/students/${id}/labs`,
      new URLSearchParams({ course: "MATH1013", activity: "MATH1013-TUT01" }),
    );
    expect(res.status).toBe(400);
  });
});
