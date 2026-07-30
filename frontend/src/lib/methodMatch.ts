import { METHODS, Method } from './methodCatalog';

export interface MethodQuizAnswers {
  modality: string;    // Q1: visual | verbal | written | feeling
  habitStyle: string;  // Q2: structured | intuitive | micro | immersive
  blocker: string;     // Q3: consistency | doubt | impatience | clarity
  mindOpen: string;    // Q4: morning | walk | shower | meditation | sleep
  mentalState: string; // Q5: limiting belief
}

export interface ScoredMethod {
  method: Method;
  score: number;
}

/**
 * Tag-based scoring. Modality is weighted highest (it's the strongest
 * signal of how a practice will land), then habit style and blocker.
 */
export const scoreMethods = (answers: MethodQuizAnswers): ScoredMethod[] => {
  const { modality, blocker } = answers;
  // "All in until I burn out" → steer toward sustainable, micro practices.
  const habitStyle = answers.habitStyle === 'burnout' ? 'micro' : answers.habitStyle;

  return METHODS.map((method) => {
    let score = 0;
    if (method.tags.includes(modality)) score += 3;
    if (method.tags.includes(habitStyle)) score += 2;
    if (method.tags.includes(blocker)) score += 2;
    return { method, score };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable tie-break by catalog order
    return METHODS.indexOf(a.method) - METHODS.indexOf(b.method);
  });
};

export const topScored = (answers: MethodQuizAnswers, n: number): Method[] =>
  scoreMethods(answers).slice(0, n).map((s) => s.method);

/** A warm, blocker-aware reason line used when the AI is unavailable. */
export const fallbackReason = (method: Method, answers: MethodQuizAnswers): string => {
  const byBlocker: Record<string, string> = {
    consistency: 'small enough to keep your streak alive',
    doubt: 'a gentle antidote for when doubt creeps in',
    impatience: 'keeps you present while it unfolds',
    clarity: 'brings what you want into sharp focus',
  };
  const tail = byBlocker[answers.blocker] || 'a beautiful fit for how you dream';
  return `${method.name} — ${tail}.`;
};
