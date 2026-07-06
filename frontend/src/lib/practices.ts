// Display + schedule metadata for each app technique id, shared across the
// plan timeline and the daily tracker.

export interface PracticeMeta {
  name: string;
  emoji: string;
  when: string;
  clock: string;
  order: number;   // sort key, morning → night
  tone: string;    // accent color
  // What "proof" looks like for this practice (shown as an upload hint)
  proofHint: string;
}

export const PRACTICE_META: Record<string, PracticeMeta> = {
  viz:       { name: 'Visualization', emoji: '◐', when: 'Morning',            clock: '7:00 AM',  order: 420,  tone: '#7A9E7E', proofHint: 'a photo of you in your quiet spot' },
  affirm:    { name: 'Affirmations',  emoji: '✦', when: 'After coffee',       clock: '8:30 AM',  order: 510,  tone: '#DC8551', proofHint: 'a pic of your written affirmations' },
  '369':     { name: '3-6-9 Method',  emoji: '③', when: 'Morning · Noon · Night', clock: '3× daily', order: 540, tone: '#DC8551', proofHint: 'a pic of your 3-6-9 page' },
  meditate:  { name: 'Meditation',    emoji: '◎', when: 'Midday',             clock: '12:30 PM', order: 750,  tone: '#7A9E7E', proofHint: 'a screenshot of your session' },
  '555':     { name: '55×5 Method',   emoji: '⑤', when: 'Midday',             clock: '12:00 PM', order: 720,  tone: '#9B7AB5', proofHint: 'a pic of your 55× page' },
  movie:     { name: 'Vision Movie',  emoji: '▸', when: 'Afternoon',          clock: '1:00 PM',  order: 780,  tone: '#9B7AB5', proofHint: 'a screenshot of your vision movie' },
  gratitude: { name: 'Gratitude',     emoji: '♡', when: 'Evening',            clock: '8:00 PM',  order: 1200, tone: '#DC8551', proofHint: 'a pic of your gratitude list' },
  script:    { name: 'Scripting',     emoji: '✎', when: 'Before bed',         clock: '9:30 PM',  order: 1290, tone: '#7A9E7E', proofHint: 'a pic of your scripting page' },
};

export const practiceMeta = (appId: string): PracticeMeta =>
  PRACTICE_META[appId] ?? { name: appId, emoji: '✦', when: 'Daily', clock: '', order: 999, tone: '#7A9E7E', proofHint: 'a photo of your practice' };

// The 4 daily feeling states (post-practice check-in)
export const MOODS: { id: string; emoji: string; label: string; positive: boolean }[] = [
  { id: 'grateful', emoji: '🙏', label: 'Grateful', positive: true },
  { id: 'excited',  emoji: '✨', label: 'Excited',  positive: true },
  { id: 'doubtful', emoji: '🤔', label: 'Doubtful', positive: false },
  { id: 'tired',    emoji: '😮‍💨', label: 'Tired',   positive: false },
];
