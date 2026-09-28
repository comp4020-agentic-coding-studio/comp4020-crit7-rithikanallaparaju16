import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { COURSES, findCourse, MAX_COURSES } from "./catalogue";
import { publish } from "./events";
import { enrolments, labChoices, type Student, students } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");
client.pragma("foreign_keys = ON");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

export type { Student };

export interface StudentTimetable {
  student: Student;
  courseCodes: string[];
  labs: Map<string, string>;
}

const catalogueOrder = (a: string, b: string) =>
  COURSES.findIndex((c) => c.code === a) - COURSES.findIndex((c) => c.code === b);

export function listStudents(): (Student & { courseCodes: string[] })[] {
  const rows = db.select().from(enrolments).all();
  return db
    .select()
    .from(students)
    .orderBy(asc(students.id))
    .all()
    .map((s) => ({
      ...s,
      courseCodes: rows
        .filter((r) => r.studentId === s.id)
        .map((r) => r.courseCode)
        .sort(catalogueOrder),
    }));
}

export function getTimetable(id: number): StudentTimetable | undefined {
  const student = db.select().from(students).where(eq(students.id, id)).get();
  if (!student) return undefined;
  const courseCodes = db
    .select()
    .from(enrolments)
    .where(eq(enrolments.studentId, id))
    .all()
    .map((r) => r.courseCode)
    .sort(catalogueOrder);
  const labs = new Map(
    db
      .select()
      .from(labChoices)
      .where(eq(labChoices.studentId, id))
      .all()
      .map((r) => [r.courseCode, r.activityId]),
  );
  return { student, courseCodes, labs };
}

const cleanCourses = (name: string, courseCodes: string[]) => {
  const codes = [...new Set(courseCodes)].filter((c) => findCourse(c));
  if (!name || codes.length === 0 || codes.length > MAX_COURSES) {
    throw new Error("invalid student");
  }
  return codes;
};

// Seats taken = simulated outside demand + real choices, capped at capacity.
export function seatsTaken(activityIds?: string[]): Record<string, number> {
  const real = new Map(
    db
      .select({ id: labChoices.activityId, n: count() })
      .from(labChoices)
      .groupBy(labChoices.activityId)
      .all()
      .map((r) => [r.id, r.n]),
  );
  const out: Record<string, number> = {};
  for (const c of COURSES) {
    for (const g of c.groups) {
      if (activityIds && !activityIds.includes(g.id)) continue;
      out[g.id] = Math.min(g.capacity, g.baseTaken + (real.get(g.id) ?? 0));
    }
  }
  return out;
}

export function createStudent(name: string, courseCodes: string[]): Student {
  const codes = cleanCourses(name, courseCodes);
  return db.transaction((tx) => {
    const student = tx.insert(students).values({ name }).returning().get();
    tx.insert(enrolments)
      .values(codes.map((courseCode) => ({ studentId: student.id, courseCode })))
      .run();
    return student;
  });
}

// Dropping a course also drops its chosen lab, freeing the seat.
export function updateStudent(id: number, name: string, courseCodes: string[]): boolean {
  const codes = cleanCourses(name, courseCodes);
  const before = getTimetable(id);
  if (!before) return false;
  db.transaction((tx) => {
    tx.update(students).set({ name }).where(eq(students.id, id)).run();
    const dropped = before.courseCodes.filter((c) => !codes.includes(c));
    if (dropped.length) {
      tx.delete(enrolments)
        .where(and(eq(enrolments.studentId, id), inArray(enrolments.courseCode, dropped)))
        .run();
      tx.delete(labChoices)
        .where(and(eq(labChoices.studentId, id), inArray(labChoices.courseCode, dropped)))
        .run();
    }
    const added = codes.filter((c) => !before.courseCodes.includes(c));
    if (added.length) {
      tx.insert(enrolments)
        .values(added.map((courseCode) => ({ studentId: id, courseCode })))
        .run();
    }
  });
  publish({ studentId: id, seats: seatsTaken([...before.labs.values()]) });
  return true;
}

export function deleteStudent(id: number): void {
  const before = getTimetable(id);
  if (!before) return;
  db.delete(students).where(eq(students.id, id)).run();
  publish({ studentId: id, seats: seatsTaken([...before.labs.values()]) });
}

export type ChoiceResult = "ok" | "invalid" | "full";

// An empty activityId clears the choice (used by undo). A full class can't be
// joined, but a student already in it keeps their seat.
export function chooseLab(studentId: number, courseCode: string, activityId: string): ChoiceResult {
  const course = findCourse(courseCode);
  const activity = course?.groups.find((g) => g.id === activityId);
  if (!course || (activityId && !activity)) return "invalid";
  const enrolled = db
    .select()
    .from(enrolments)
    .where(and(eq(enrolments.studentId, studentId), eq(enrolments.courseCode, courseCode)))
    .get();
  if (!enrolled) return "invalid";
  const where = and(eq(labChoices.studentId, studentId), eq(labChoices.courseCode, courseCode));
  const previous = db.select().from(labChoices).where(where).get()?.activityId ?? null;
  if (activity && previous !== activity.id && seatsTaken([activity.id])[activity.id] >= activity.capacity) {
    return "full";
  }
  if (activity) {
    db.insert(labChoices)
      .values({ studentId, courseCode, activityId })
      .onConflictDoUpdate({
        target: [labChoices.studentId, labChoices.courseCode],
        set: { activityId },
      })
      .run();
  } else {
    db.delete(labChoices).where(where).run();
  }
  const touched = [previous, activity?.id].filter((x): x is string => !!x);
  publish({
    studentId,
    change: { courseCode, activityId: activity?.id ?? null },
    seats: seatsTaken(touched),
  });
  return "ok";
}

// Test students, each with two lab courses and two tutorial courses. Seeded only
// into an empty database so real data is never touched.
const SEED: { name: string; courses: string[]; labs: string[] }[] = [
  {
    name: "Aisha Khan",
    courses: ["COMP1100", "COMP1600", "MATH1005", "MATH1013"],
    labs: ["COMP1100-LAB02", "MATH1013-TUT03"],
  },
  { name: "Ben Nguyen", courses: ["COMP1100", "STAT1003", "MATH1005", "ECON1101"], labs: [] },
  {
    name: "Chloe Martin",
    courses: ["STAT1003", "ENGN1211", "MATH1013", "ECON1101"],
    labs: ["STAT1003-LAB02", "ENGN1211-LAB02", "ECON1101-TUT03"],
  },
  {
    name: "Dev Patel",
    courses: ["COMP1600", "ENGN1211", "MATH1005", "ECON1101"],
    labs: ["ENGN1211-LAB03"],
  },
];

if (db.select({ n: count() }).from(students).get()?.n === 0) {
  for (const seed of SEED) {
    const student = createStudent(seed.name, seed.courses);
    for (const lab of seed.labs) {
      chooseLab(student.id, lab.split("-")[0], lab);
    }
  }
}
