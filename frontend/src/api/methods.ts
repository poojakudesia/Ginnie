import client from './client';
import { MethodQuizAnswers } from '../lib/methodMatch';
import { Method } from '../lib/methodCatalog';

export interface MethodRecommendation {
  id: string;
  reason: string;
}

interface RecommendResponse {
  recommendations: MethodRecommendation[];
}

/**
 * Ask the backend (Ginnie / Claude) to pick the 3 best-fit methods from the
 * pre-scored top-5. Returns [] on any failure so callers can fall back to the
 * local top-3 scored methods.
 */
export const recommendMethods = async (
  answers: MethodQuizAnswers,
  top5: Method[],
): Promise<MethodRecommendation[]> => {
  try {
    const { data } = await client.post<RecommendResponse>('/aura/recommend-methods', {
      modality: answers.modality,
      habitStyle: answers.habitStyle,
      blocker: answers.blocker,
      mindOpen: answers.mindOpen,
      mentalState: answers.mentalState,
      top5: top5.map((m) => ({ id: m.id, name: m.name, tags: m.tags, effort: m.effort })),
    });
    return Array.isArray(data?.recommendations) ? data.recommendations : [];
  } catch {
    return [];
  }
};

export interface RefinedAffirmation {
  refined: string;
  tips: string[];
  changed: boolean;
}

/**
 * Ask Ginnie to refine an affirmation (present-tense, positive, personal,
 * believable, concise, emotive). Throws on failure so the caller can show
 * an error; the backend itself already falls back to a rule-based refine.
 */
export const refineAffirmation = async (
  text: string,
  method?: string,
): Promise<RefinedAffirmation> => {
  const { data } = await client.post<RefinedAffirmation>('/aura/refine-affirmation', {
    text,
    method,
  });
  return data;
};
