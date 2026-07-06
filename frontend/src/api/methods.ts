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
