import { Wish } from '../types';

const TIMELINE_MONTHS: Record<string, number> = {
  '3m': 3,
  '6m': 6,
  '1y': 12,
  '3y': 36,
};

export const timelineLabel = (timeline: string): string =>
  ({ '3m': '3-month', '6m': '6-month', '1y': '1-year', '3y': '3-year' }[timeline] || timeline);

/** True once a wish's chosen timeline has elapsed since it was created. */
export const timelineElapsed = (wish: Wish): boolean => {
  const months = TIMELINE_MONTHS[wish.timeline];
  if (!months) return false;
  const created = new Date(wish.created_at);
  if (isNaN(created.getTime())) return false;
  const due = new Date(created);
  due.setMonth(due.getMonth() + months);
  return new Date().getTime() >= due.getTime();
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
