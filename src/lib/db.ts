import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { and, asc, count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { COURSES, findCourse, MAX_COURSES } from "./catalogue";
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

export function listStudents(): (Student & { courseCodes: string[] })[] {
  const rows = db.select().from(enrolments).all();
  return db
    .select()
    .from(students)
    .orderBy(asc(students.id))
    .all()
    .map((s) => ({
      ...s,
      courseCodes: rows.filter((r) => r.studentId === s.id).map((r) => r.courseCode),
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
    .sort((a, b) => COURSES.findIndex((c) => c.code === a) - COURSES.findIndex((c) => c.code === b));
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

export function createStudent(name: string, courseCodes: string[]): Student {
  const codes = [...new Set(courseCodes)].filter((c) => findCourse(c));
  if (!name || codes.length === 0 || codes.length > MAX_COURSES) {
    throw new Error("invalid student");
  }
  return db.transaction((tx) => {
    const student = tx.insert(students).values({ name }).returning().get();
    tx.insert(enrolments)
      .values(codes.map((courseCode) => ({ studentId: student.id, courseCode })))
      .run();
    return student;
  });
}

// Returns false when the lab isn't one of the course's options or the student isn't enrolled.
export function chooseLab(studentId: number, courseCode: string, activityId: string): boolean {
  const course = findCourse(courseCode);
  if (!course?.groups.some((g) => g.id === activityId)) return false;
  const enrolled = db
    .select()
    .from(enrolments)
    .where(and(eq(enrolments.studentId, studentId), eq(enrolments.courseCode, courseCode)))
    .get();
  if (!enrolled) return false;
  db.insert(labChoices)
    .values({ studentId, courseCode, activityId })
    .onConflictDoUpdate({
      target: [labChoices.studentId, labChoices.courseCode],
      set: { activityId },
    })
    .run();
  return true;
}

// Test students, each with two lab courses and two tutorial courses. Seeded only
// into an empty database so real data is never touched.
const SEED: { name: string; courses: string[]; labs: string[] }[] = [
  {
    name: "Aisha Khan",
    courses: ["COMP1100", "COMP1600", "MATH1005", "MATH1013"],
    labs: ["COMP1100-LAB01", "MATH1013-TUT03"],
  },
  { name: "Ben Nguyen", courses: ["COMP1100", "STAT1003", "MATH1005", "ECON1101"], labs: [] },
  {
    name: "Chloe Martin",
    courses: ["STAT1003", "ENGN1211", "MATH1013", "ECON1101"],
    labs: ["STAT1003-LAB01", "ENGN1211-LAB02", "ECON1101-TUT03"],
  },
  {
    name: "Dev Patel",
    courses: ["COMP1600", "ENGN1211", "MATH1005", "ECON1101"],
    labs: ["ENGN1211-LAB01"],
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
