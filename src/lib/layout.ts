type Timed = { activity: { start: number; end: number } };

export interface Placed<T extends Timed> {
  item: T;
  lane: number;
  lanes: number;
}

// Side-by-side lanes for overlapping blocks within one day, like a calendar app.
export function placeDay<T extends Timed>(items: T[]): Placed<T>[] {
  const sorted = [...items].sort(
    (a, b) => a.activity.start - b.activity.start || a.activity.end - b.activity.end,
  );
  const placed: Placed<T>[] = [];
  let cluster: Placed<T>[] = [];
  let clusterEnd = -1;
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((p) => p.lane + 1));
    for (const p of cluster) p.lanes = lanes;
    placed.push(...cluster);
    cluster = [];
  };
  for (const item of sorted) {
    if (item.activity.start >= clusterEnd) flush();
    const laneEnds: number[] = [];
    for (const p of cluster) {
      laneEnds[p.lane] = Math.max(laneEnds[p.lane] ?? -1, p.item.activity.end);
    }
    let lane = laneEnds.findIndex((end) => end <= item.activity.start);
    if (lane === -1) lane = laneEnds.length;
    cluster.push({ item, lane, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, item.activity.end);
  }
  flush();
  return placed;
}
