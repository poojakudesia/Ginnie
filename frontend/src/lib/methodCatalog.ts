// The manifestation-method catalog (from the Method Match spec).
// `tags` drive scoring; the rest is display + routing into the app's
// existing technique/tutorial vocabulary via `appId`.

export type Effort = 'low' | 'medium' | 'high';

export interface Method {
  id: string;
  name: string;
  tags: string[];
  effort: Effort;
  appId: string;   // maps to an existing technique id (viz/affirm/movie/script/369/555/gratitude/meditate)
  emoji: string;
  blurb: string;
}

export const METHODS: Method[] = [
  { id: 'visualization',    name: 'Visualization',                    tags: ['visual', 'immersive'],                        effort: 'medium', appId: 'viz',       emoji: '◐', blurb: 'See it before you see it.' },
  { id: 'vision_board',     name: 'Vision Board',                     tags: ['visual', 'micro', 'clarity'],                 effort: 'low',    appId: 'movie',     emoji: '▦', blurb: 'A collage of your future, in view daily.' },
  { id: 'scripting',        name: 'Scripting (Future Journaling)',    tags: ['written', 'intuitive', 'immersive', 'clarity'], effort: 'medium', appId: 'script',    emoji: '✍', blurb: 'Write tomorrow in present tense.' },
  { id: 'method_369',       name: '3-6-9 Method',                     tags: ['written', 'structured', 'consistency'],       effort: 'medium', appId: '369',       emoji: '③', blurb: 'Write it 3×, 6×, then 9× a day.' },
  { id: 'method_55x5',      name: '5x55 Method',                      tags: ['written', 'structured', 'consistency'],       effort: 'high',   appId: '555',       emoji: '⑤', blurb: 'One line, 55 times, for 5 days.' },
  { id: 'affirmations',     name: 'Spoken Affirmations / Mirror Work', tags: ['verbal', 'micro', 'doubt'],                  effort: 'low',    appId: 'affirm',    emoji: '✦', blurb: 'Speak it true, out loud.' },
  { id: 'gratitude',        name: 'Gratitude Journaling',             tags: ['written', 'feeling', 'micro', 'impatience'],  effort: 'low',    appId: 'gratitude', emoji: '♡', blurb: 'Receipts before requests.' },
  { id: 'act_as_if',        name: 'Living in the End (Act As If)',    tags: ['feeling', 'intuitive', 'doubt'],              effort: 'medium', appId: 'viz',       emoji: '✧', blurb: 'Feel it as already done.' },
  { id: 'guided_meditation', name: 'Guided Manifestation Meditation', tags: ['verbal', 'visual', 'immersive', 'impatience'], effort: 'high',  appId: 'meditate',  emoji: '◎', blurb: 'Drop in and receive.' },
  { id: 'pillow_method',    name: 'Pillow / Letter Method',           tags: ['written', 'micro'],                           effort: 'low',    appId: 'script',    emoji: '✉', blurb: 'A letter to the universe, under your pillow.' },
];

export const methodById = (id: string): Method | undefined =>
  METHODS.find((m) => m.id === id);

// A soft palette per effort tier for the result cards
export const EFFORT_TONE: Record<Effort, { bg: string; text: string; label: string }> = {
  low:    { bg: '#CBDCC0', text: '#2F3D24', label: 'MICRO' },
  medium: { bg: '#E8D6AE', text: '#473A1E', label: 'DAILY' },
  high:   { bg: '#DDCBE0', text: '#3A2A40', label: 'DEEP' },
};
