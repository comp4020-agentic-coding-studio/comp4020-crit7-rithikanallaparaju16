import { EventEmitter } from "node:events";

// One process, one bus: every open SSE connection subscribes here. This only
// works because the app runs on exactly one machine (see fly.toml) — a second
// machine would have its own bus and clients would miss events.
export const bus = new EventEmitter();
bus.setMaxListeners(0);

export interface TimetableUpdate {
  studentId: number;
  // Set when one choice changed; absent when the whole timetable did (edit/delete).
  change?: { courseCode: string; activityId: string | null };
  seats: Record<string, number>;
}

export const publish = (update: TimetableUpdate) => bus.emit("update", update);
