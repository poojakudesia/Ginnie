import { Wish } from '../types';

const TIMELINE_MONTHS: Record<string, number> = {
  '3m': 3,
  '6m': 6,
  '1y': 12,
  '3y': 36,
};

export const timelineLabel = (timeline: string): string =>
  ({ '3m': '3-month', '6m': '6-month', '1y': '1-year', '3y': '3-year' }[timeline] || timeline);

/** Add months without the "Jan 31 + 1 month = Mar 3" overflow. */
const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0); // rolled into next month → clamp to last day
  return d;
};

/** True once a wish's chosen timeline has elapsed since it was created. */
export const timelineElapsed = (wish: Wish): boolean => {
  const months = TIMELINE_MONTHS[wish.timeline];
  if (!months) return false;
  const created = new Date(wish.created_at);
  if (isNaN(created.getTime())) return false;
  const due = addMonths(created, months);
  return new Date().getTime() >= due.getTime();
};

export interface WishProgress {
  pct: number;        // 0–100, time elapsed toward the timeline
  daysLeft: number;   // whole days remaining (0 once due)
  totalDays: number;
}

/** Live progress of an active wish based on its timeline. */
export const wishProgress = (wish: Wish): WishProgress => {
  const months = TIMELINE_MONTHS[wish.timeline] ?? 12;
  const created = new Date(wish.created_at);
  const start = isNaN(created.getTime()) ? new Date() : created;
  const due = addMonths(start, months);

  const now = Date.now();
  const total = due.getTime() - start.getTime();
  const elapsed = now - start.getTime();
  const pct = total > 0 ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0;
  const dayMs = 1000 * 60 * 60 * 24;
  const daysLeft = Math.max(0, Math.ceil((due.getTime() - now) / dayMs));
  const totalDays = Math.max(1, Math.round(total / dayMs));
  return { pct, daysLeft, totalDays };
};

/**
 * The first wish that has reached its timeline, isn't already manifested,
 * and hasn't been reviewed yet — or null.
 */
export const pendingReviewWish = (
  wishes: Wish[],
  reviewedIds: string[],
): Wish | null => {
  const reviewed = new Set(reviewedIds);
  return (
    wishes.find(
      (w) => !w.is_manifested && !reviewed.has(w.id) && timelineElapsed(w),
    ) ?? null
  );
};
