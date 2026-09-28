import type { APIRoute } from "astro";
import { bus, type TimetableUpdate } from "../../lib/events";

// Server-sent events: seat counts and choices stream to every open timetable.
// The deploy workflow probes this path for its opening comment.
export const GET: APIRoute = () => {
  let onUpdate: (update: TimetableUpdate) => void;
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<string>({
    start(controller) {
      controller.enqueue(": connected\n\n");
      heartbeat = setInterval(() => controller.enqueue(": ping\n\n"), 30_000);
      onUpdate = (update) => controller.enqueue(`data: ${JSON.stringify(update)}\n\n`);
      bus.on("update", onUpdate);
    },
    cancel() {
      clearInterval(heartbeat);
      bus.off("update", onUpdate);
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
  });
};
