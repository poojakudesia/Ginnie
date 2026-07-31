// Wish analysis: gibberish detection + goal/timeline feasibility.
// Pure functions — no network — so the insight is instant as the user types.

export type WishVerdict = 'motivate' | 'rethink';

export interface WishAnalysis {
  verdict: WishVerdict;
  message: string;
}

const TIMELINE_MONTHS: Record<string, number> = {
  '3m': 3,
  '6m': 6,
  '1y': 12,
  '3y': 36,
};

const humanTimeline = (t: string): string =>
  ({ '3m': '3 months', '6m': '6 months', '1y': 'a year', '3y': '3 years' }[t] || t);

// Does a single token read like a real word?
const looksRealWord = (letters: string): boolean => {
  if (letters.length === 0) return false;
  const vowels = (letters.match(/[aeiou]/g) || []).length;
  // Short tokens with no vowel are usually valid abbreviations/units (kg, tv, mm)
  if (vowels === 0) return letters.length <= 3;
  // Random strings tend to have long consonant OR vowel runs
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(letters)) return false;
  if (/[aeiou]{4,}/.test(letters)) return false;
  const ratio = vowels / letters.length;
  if (ratio < 0.15 || ratio > 0.85) return false;
  return true;
};

/**
 * Heuristic gibberish / nonsense detector for a goal / "why" field.
 * Accepts real sentences (even with numbers/units) but rejects keyboard
 * mashing and random character strings.
 */
export const looksLikeGibberish = (raw: string): boolean => {
  const text = raw.trim().toLowerCase();
  if (text.replace(/[^a-z]/g, '').length < 3) return true;

  // Obvious keyboard mashing / hammered characters.
  if (/(asdf|sdfg|dfgh|fghj|qwer|wert|erty|rtyu|zxcv|xcvb|cvbn|hjkl|uiop|poiu|mnbv)/.test(text)) return true;
  if (/(.)\1{4,}/.test(text)) return true;

  // Judge each alphabetic word.
  const alphaWords = text
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ''))
    .filter((w) => w.length > 0);
  if (alphaWords.length === 0) return true;

  const realCount = alphaWords.filter(looksRealWord).length;
  if (realCount === 0) return true;
  // Most words must read like real words.
  if (realCount / alphaWords.length < 0.6) return true;
  // A single-word entry must be a proper word (≥3 letters, real-looking).
  if (alphaWords.length === 1 && alphaWords[0].length < 3) return true;

  return false;
};

const kgFromUnit = (amount: number, unit: string): number =>
  /lb|pound/.test(unit) ? amount * 0.4536 : amount;

/**
 * Assess whether a goal is realistic for the chosen timeline and return a
 * tailored, goal-aware insight. Assumes the goal already passed the
 * gibberish check and category + timeline are set.
 */
export const analyzeWish = (
  goal: string,
  category: string,
  timeline: string,
): WishAnalysis => {
  const months = TIMELINE_MONTHS[timeline] ?? 12;
  const when = humanTimeline(timeline);
  const g = goal.toLowerCase();
  const cat = category.toLowerCase();

  const motivate = (message: string): WishAnalysis => ({ verdict: 'motivate', message });
  const rethink = (message: string): WishAnalysis => ({ verdict: 'rethink', message });

  // ── Weight-loss feasibility ──────────────────────────────────────────────
  const lose = g.match(
    /(lose|losing|loose|loosing|los|drop|shed|shedding|lost|cut|reduce)\D{0,14}(\d{1,3})\s?(kgs?|kilos?|kilograms?|pounds?|lbs?|lb)/,
  );
  if (lose) {
    const kg = kgFromUnit(parseInt(lose[2], 10), lose[3]);
    const perMonth = kg / months;
    if (perMonth > 5) {
      return rethink(
        `Losing ${lose[2]}${lose[3]} in ${when} works out to about ${perMonth.toFixed(
          1,
        )}kg every month — faster than what's healthy or lasting. Give it a longer runway and your body (and your belief) will hold the result.`,
      );
    }
    return motivate(
      `Losing ${lose[2]}${lose[3]} across ${when} is a steady, sustainable pace. Trust the daily reps — this one is genuinely within reach.`,
    );
  }

  // ── Wealth feasibility ───────────────────────────────────────────────────
  if (/(millionaire|million|crore)/.test(g) && months <= 6) {
    return rethink(
      `A seven-figure leap in ${when} is a stretch from a standing start. Keep the vision — but set a bold, buildable milestone for ${when} and let the bigger number live a little further out.`,
    );
  }
  if (/(\$|usd|inr|rs\.?|€|£)\s?\d/.test(g) || /\b\d+\s?(k|lakh|lac)\b/.test(g)) {
    return motivate(
      `Naming a real number is powerful — the mind manifests what it can measure. Anchor it to one small action a day over ${when} and watch the gap close.`,
    );
  }

  // ── Skill / credential feasibility ───────────────────────────────────────
  if (/(fluent|fluency)/.test(g) && months < 6) {
    return rethink(
      `True fluency in under ${when} is steep. Aim for confident-conversational by ${when} — a win you'll actually feel — and let fluency follow naturally.`,
    );
  }
  if (/\b(phd|doctorate|md)\b/.test(g) && months < 36) {
    return rethink(
      `That credential usually takes years, not ${when}. Set the next real milestone for ${when} and keep the title firmly in your sights.`,
    );
  }
  if (/(marathon)/.test(g) && months < 3) {
    return rethink(
      `A full marathon needs a real training base — ${when} is cutting it fine. A half-marathon by ${when} would be a strong, safe target to build from.`,
    );
  }

  // ── Category-aware encouragement (default) ───────────────────────────────
  const byCategory: Record<string, string> = {
    career: `This is a strong career move, and ${when} gives you room to make it real. Keep showing up — opportunities tend to find people already in motion.`,
    wealth: `A clear wealth goal over ${when} is very workable. Pair the vision with consistent, boring action and momentum compounds.`,
    health: `A grounded health goal over ${when} is exactly the kind of thing daily practice rewards. Small and steady wins this one.`,
    love: `Matters of the heart move at their own pace — and ${when} is a kind, realistic window. Stay open; align the feeling first and the rest follows.`,
    travel: `Very doable within ${when}. Start by naming the date and the first small step — booking energy is manifesting energy.`,
    purpose: `A purpose-led goal is the most magnetic kind. ${when} is plenty of time to take the first honest step — clarity comes from motion.`,
  };

  return motivate(
    byCategory[cat] ||
      `This feels like a clear, reachable ${cat} goal for ${when}. Channel it into daily practice and let it build.`,
  );
};
