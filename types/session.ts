export type SessionStatus = 'completed' | 'pending';

export interface Session {
  id: number;
  date: string;
  timeSpent: string;
  ageGroup: string;
  organization: string;
  topic: string;
  positives: string;
  developments: string;
  supervisorFeedback: string;
  status: SessionStatus;
}

export const AGE_GROUPS = [
  'Early Years (0-5)',
  'Primary (7-11)',
  'Secondary (11-16)',
  'Post-16'
] as const;

export type AgeGroup = typeof AGE_GROUPS[number]; 