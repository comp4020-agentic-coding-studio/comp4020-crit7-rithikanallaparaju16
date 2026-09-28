import { sql } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts), locally and deployed. Never edit the database
// by hand: state on the deployed volume outlives every deploy, and the
// migration trail is what keeps old state and new code compatible.
export const students = sqliteTable("students", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Course codes and activity ids refer to the static catalogue in src/lib/catalogue.ts.
export const enrolments = sqliteTable(
  "enrolments",
  {
    studentId: int("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    courseCode: text("course_code").notNull(),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.courseCode] })],
);

export const labChoices = sqliteTable(
  "lab_choices",
  {
    studentId: int("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    courseCode: text("course_code").notNull(),
    activityId: text("activity_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.courseCode] })],
);

export type Student = typeof students.$inferSelect;
