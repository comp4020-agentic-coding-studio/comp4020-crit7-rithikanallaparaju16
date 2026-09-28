export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

export interface Activity {
  id: string;
  courseCode: string;
  kind: "Lecture" | "Lab" | "Tutorial";
  day: number;
  start: number;
  end: number;
  room: string;
  capacity: number;
  // Seats held by students outside this prototype, so the counts look lived-in.
  baseTaken: number;
}

export interface Course {
  code: string;
  name: string;
  groupKind: "Lab" | "Tutorial";
  lectures: Activity[];
  groups: Activity[];
}

type Slot = [day: number, start: string, end: string, room: string];

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Deterministic 30–85% fill per class. The first option of every course is
// always full (set in course()) so the full state can be demonstrated.
function simulatedDemand(id: string, capacity: number) {
  let hash = 2166136261;
  for (const ch of id) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0;
  return Math.floor(capacity * (0.3 + (hash % 56) / 100));
}

function course(
  code: string,
  name: string,
  groupKind: Course["groupKind"],
  lectures: Slot[],
  groups: Slot[],
): Course {
  const make = (kind: Activity["kind"], prefix: string) =>
    ([day, start, end, room]: Slot, i: number): Activity => {
      const id = `${code}-${prefix}${String(i + 1).padStart(2, "0")}`;
      const capacity = kind === "Lecture" ? 0 : kind === "Lab" ? 20 : 25;
      return {
        id,
        courseCode: code,
        kind,
        day,
        start: minutes(start),
        end: minutes(end),
        room,
        capacity,
        baseTaken: i === 0 ? capacity : simulatedDemand(id, capacity),
      };
    };
  return {
    code,
    name,
    groupKind,
    lectures: lectures.map(make("Lecture", "LEC")),
    groups: groups.map(make(groupKind, groupKind === "Lab" ? "LAB" : "TUT")),
  };
}

// Lectures never overlap each other, so every combination of four courses is registrable.
export const COURSES: Course[] = [
  course(
    "COMP1100",
    "Programming as Problem Solving",
    "Lab",
    [
      [0, "10:00", "11:00", "Manning Clark Hall"],
      [2, "10:00", "11:00", "Manning Clark Hall"],
    ],
    [
      [1, "09:00", "11:00", "CSIT N113"],
      [1, "14:00", "16:00", "CSIT N113"],
      [2, "13:00", "15:00", "CSIT N114"],
      [3, "09:00", "11:00", "CSIT N113"],
      [3, "15:00", "17:00", "CSIT N114"],
      [4, "11:00", "13:00", "CSIT N113"],
    ],
  ),
  course(
    "MATH1013",
    "Mathematics and Applications 2",
    "Tutorial",
    [
      [1, "12:00", "13:00", "Hanna Neumann G02"],
      [3, "12:00", "13:00", "Hanna Neumann G02"],
      [4, "09:00", "10:00", "Hanna Neumann G02"],
    ],
    [
      [0, "14:00", "15:00", "Hanna Neumann 1.33"],
      [0, "16:00", "17:00", "Hanna Neumann 1.33"],
      [2, "09:00", "10:00", "Hanna Neumann 1.34"],
      [2, "15:00", "16:00", "Hanna Neumann 1.33"],
      [4, "13:00", "14:00", "Hanna Neumann 1.34"],
    ],
  ),
  course(
    "MATH1005",
    "Discrete Mathematical Models",
    "Tutorial",
    [
      [0, "13:00", "14:00", "Hanna Neumann G02"],
      [2, "11:00", "12:00", "Hanna Neumann G02"],
    ],
    [
      [0, "15:00", "16:00", "Hanna Neumann 1.35"],
      [1, "11:00", "12:00", "Hanna Neumann 1.35"],
      [2, "15:00", "16:00", "Hanna Neumann 1.36"],
      [3, "10:00", "11:00", "Hanna Neumann 1.35"],
      [3, "14:00", "15:00", "Hanna Neumann 1.36"],
      [4, "10:00", "11:00", "Hanna Neumann 1.35"],
    ],
  ),
  course(
    "COMP1600",
    "Foundations of Computing",
    "Lab",
    [
      [0, "12:00", "13:00", "Birch Theatre 1"],
      [3, "11:00", "12:00", "Birch Theatre 1"],
    ],
    [
      [1, "11:00", "12:00", "CSIT N115"],
      [1, "16:00", "17:00", "CSIT N115"],
      [2, "11:00", "12:00", "CSIT N116"],
      [3, "14:00", "15:00", "CSIT N115"],
      [4, "10:00", "11:00", "CSIT N116"],
    ],
  ),
  course(
    "STAT1003",
    "Statistical Techniques",
    "Lab",
    [
      [1, "10:00", "11:00", "Copland G030"],
      [2, "14:00", "15:00", "Copland G030"],
    ],
    [
      [0, "09:00", "10:00", "CBE 1.01"],
      [0, "15:00", "16:00", "CBE 1.01"],
      [3, "10:00", "11:00", "CBE 1.02"],
      [3, "16:00", "17:00", "CBE 1.01"],
      [4, "14:00", "15:00", "CBE 1.02"],
    ],
  ),
  course(
    "ENGN1211",
    "Discovering Engineering",
    "Lab",
    [
      [0, "09:00", "10:00", "Ian Ross Theatre"],
      [4, "12:00", "13:00", "Ian Ross Theatre"],
    ],
    [
      [1, "13:00", "15:00", "Ian Ross Workshop"],
      [2, "16:00", "18:00", "Ian Ross Workshop"],
      [3, "13:00", "15:00", "Ian Ross Workshop"],
    ],
  ),
  course(
    "ECON1101",
    "Microeconomics 1",
    "Tutorial",
    [
      [1, "15:00", "16:00", "Llewellyn Hall"],
      [3, "09:00", "10:00", "Llewellyn Hall"],
    ],
    [
      [0, "11:00", "12:00", "Coombs Ext 1.04"],
      [2, "12:00", "13:00", "Coombs Ext 1.04"],
      [4, "15:00", "16:00", "Coombs Ext 1.05"],
    ],
  ),
];

export const MAX_COURSES = 4;

export const findCourse = (code: string) => COURSES.find((c) => c.code === code);

export const formatTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const describeSlot = (a: Activity) =>
  `${DAYS[a.day]} ${formatTime(a.start)}–${formatTime(a.end)}`;

