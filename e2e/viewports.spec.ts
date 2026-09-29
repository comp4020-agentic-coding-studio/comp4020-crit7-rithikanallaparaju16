import { expect, type APIRequestContext, type Page, test } from "@playwright/test";

// The viewports CLAUDE.md requires, portrait and landscape.
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
  { width: 280, height: 900 },
  { width: 844, height: 390 },
  { width: 900, height: 280 },
];

const createStudent = async (request: APIRequestContext, baseURL: string, courses: string[]) => {
  const form = new URLSearchParams({ name: "Browser Test" });
  for (const c of courses) form.append("courses", c);
  const res = await request.post("/api/students", {
    headers: { origin: baseURL, "content-type": "application/x-www-form-urlencoded" },
    data: form.toString(),
    maxRedirects: 0,
  });
  return res.headers().location;
};

const openCourse = (page: Page, code: string) =>
  page.locator(`.course[data-course="${code}"] .toggle`).click();

for (const { width, height } of VIEWPORTS) {
  const phone = width < 1000;
  test.describe(`${width}×${height}`, () => {
    test.use({ viewport: { width, height }, isMobile: phone, hasTouch: phone });

    test("no page scrolls sideways", async ({ page, request, baseURL }) => {
      const student = await createStudent(request, baseURL!, ["COMP1100", "MATH1005"]);
      for (const path of ["/", student, `${student}/edit`, "/readme/"]) {
        await page.goto(path);
        const { scroll, client } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(scroll, `${path} is wider than the screen`).toBeLessThanOrEqual(client);
      }
    });

    test("opening a course shows only that course's options, in view", async ({ page, request, baseURL }) => {
      const student = await createStudent(request, baseURL!, ["COMP1100", "MATH1005", "ECON1101"]);
      await page.goto(student);
      await openCourse(page, "MATH1005");
      const shown = page.locator(".block.group:visible");
      await expect(shown.first()).toBeVisible();
      for (const course of await shown.evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.course))) {
        expect(course).toBe("MATH1005");
      }
      // Phones: the student shouldn't have to hunt for the options after tapping.
      if (phone) {
        await expect
          .poll(() =>
            page.locator(".block.option:visible").evaluateAll((els) =>
              els.some((el) => {
                const r = el.getBoundingClientRect();
                return r.top >= 0 && r.bottom <= window.innerHeight;
              }),
            ),
          )
          .toBe(true);
      }
    });
  });
}

for (const viewport of [VIEWPORTS[0], VIEWPORTS[3]]) {
  test.describe(`chosen class at ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });
    test("shows its seat count", async ({ page, request, baseURL }) => {
      const student = await createStudent(request, baseURL!, ["COMP1100"]);
      await page.goto(student);
      await openCourse(page, "COMP1100");
      await page.locator('[data-activity="COMP1100-LAB04"] button').click();
      const chosen = page.locator(".block.current");
      await expect(chosen).toBeVisible();
      await expect(chosen.locator(".seats")).toBeVisible();
      await expect(chosen.locator(".seats")).toHaveText(/^\d+\/20 seats$/);
      await expect(page.locator('.course[data-course="COMP1100"] .seat-status')).toHaveText(/\d+\/20 seats/);
    });
  });
}
