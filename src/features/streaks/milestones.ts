// Streak milestone badges (PRD §5.6).

export interface Milestone {
  d: number;
  name: string;
  color: string;
}

export const MILESTONES: Milestone[] = [
  { d: 3, name: 'Bronze', color: '#C97B3C' },
  { d: 7, name: 'Silver', color: '#A8B3C4' },
  { d: 14, name: 'Gold', color: '#F5C84B' },
  { d: 30, name: 'Platinum', color: '#7FE3D0' },
  { d: 60, name: 'Diamond', color: '#8AB6FF' },
];

export function nextMilestone(streak: number): (Milestone & { prev: number }) | null {
  for (let i = 0; i < MILESTONES.length; i++) {
    if (streak < MILESTONES[i].d) {
      return { ...MILESTONES[i], prev: i === 0 ? 0 : MILESTONES[i - 1].d };
    }
  }
  return null;
}
