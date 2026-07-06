// Performance badges awarded by consistency. The earned badge becomes the
// user's profile picture.

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  gradient: string;
  minRate: number; // minimum completion rate (0–1) to reach this tier
}

export const BADGES: Badge[] = [
  {
    id: 'master',
    name: 'Master Manifestor',
    emoji: '👑',
    blurb: "You don't just manifest—you engineer outcomes. You lead the energy of the community, turn intent into impact, and consistently raise the bar for everyone around you.",
    gradient: 'linear-gradient(135deg, #F5DA8E 0%, #C28E2A 100%)',
    minRate: 0.9,
  },
  {
    id: 'amplifier',
    name: 'Energy Amplifier',
    emoji: '⚡',
    blurb: "You're in your flow and making things happen. Your consistency, positivity, and action keep the collective momentum strong and moving forward.",
    gradient: 'linear-gradient(135deg, #DC8551 0%, #B8482E 100%)',
    minRate: 0.7,
  },
  {
    id: 'shifter',
    name: 'Growth Shifter',
    emoji: '🌱',
    blurb: "You're on the path and building your rhythm. With steady effort and alignment, you're contributing to the shared vision and growing every day.",
    gradient: 'linear-gradient(135deg, #7A9E7E 0%, #4E7D52 100%)',
    minRate: 0.45,
  },
  {
    id: 'awakening',
    name: 'Awakening Energy',
    emoji: '🌙',
    blurb: "Your potential is real—now it's time to activate it. A little more focus, consistency, and intention will help you step fully into your manifesting power.",
    gradient: 'linear-gradient(135deg, #9B7AB5 0%, #6D4C8A 100%)',
    minRate: 0,
  },
];

export const badgeById = (id: string | undefined): Badge | undefined =>
  BADGES.find((b) => b.id === id);

/** Highest-tier badge whose threshold the completion rate meets. */
export const badgeForRate = (rate: number): Badge =>
  BADGES.find((b) => rate >= b.minRate) ?? BADGES[BADGES.length - 1];
