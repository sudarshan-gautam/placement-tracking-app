export type GoalStatus = 'completed' | 'in-progress' | 'not-started';

export interface Goal {
  id: number;
  title: string;
  deadline: string;
  status: GoalStatus;
  progress: number;
}

export interface ActionPlan {
  id: number;
  quarter: string;
  status: 'in-progress' | 'completed' | 'not-started';
  lastUpdated: string;
  strengths: string[];
  weaknesses: string[];
  goals: Goal[];
  supervisorFeedback: string;
} 