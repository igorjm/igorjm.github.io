import { BRT_OFFSET_HOURS, envInt } from "./x-paths.mjs";

const SLOT_HOURS_BRT = [8, 12, 17, 20];

export function getPostSlotsForDay(dateStr, maxPosts) {
  const count = Math.min(maxPosts, SLOT_HOURS_BRT.length);
  const slots = SLOT_HOURS_BRT.slice(0, count);

  return slots.map((hour) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const utcHour = hour - BRT_OFFSET_HOURS;
    const scheduled = new Date(Date.UTC(y, m - 1, d, utcHour, 0, 0));
    return scheduled.toISOString();
  });
}

export function isPtBrDay(dateStr) {
  const weekday = envInt("X_PT_BR_WEEKDAY", 1); // Monday
  const d = new Date(`${dateStr}T12:00:00Z`);
  const day = d.getUTCDay();
  return day === weekday;
}

export function getDuePosts(queue, now = new Date()) {
  return queue.filter((item) => {
    if (item.posted) return false;
    const at = new Date(item.scheduledAt);
    return at <= now;
  });
}
