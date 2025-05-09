import { Qualification } from './qualification';
import { Session } from './session';
import { ActionPlan } from './action-plan';
import { Competency as CompetencyData } from './competency';

export interface OverviewStats {
  totalHours: number;
  totalSessions: number;
  totalQualifications: number;
  ageGroupsCovered: number;
}

export interface CompetencyData {
  area: string;
  selfScore: number;
  supervisorScore: number;
  researchEvidence?: string[];
  practiceAlignment?: number;
}

export interface SessionActivityData {
  month: string;
  hours: number;
  sessions: number;
}

export interface AgeGroupData {
  group: string;
  sessions: number;
  totalHours: number;
}

export interface QualificationStatusData {
  status: string;
  count: number;
}

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface CVData {
  qualifications: Qualification[];
  experience: Session[];
  competencies: CompetencyData[];
  statements: Statement[];
  researchProjects?: string[];
}

export interface Statement {
  id: number;
  type: 'personal' | 'professional';
  content: string;
  lastUpdated: string;
  keywords: string[];
}

export interface ProgressionData {
  period: string;
  competencyLevels: CompetencyData[];
  researchAlignment: number;
  keyAchievements: string[];
  developmentAreas: string[];
}

export interface ActionPlanQuarterly extends ActionPlan {
  researchEvidence: string[];
  progressIndicators: string[];
  nextSteps: string[];
  reflections: string;
  supervisorEndorsement?: {
    endorsed: boolean;
    comments: string;
    date: string;
  };
}

export interface DocumentUpload {
  id: number;
  type: 'certificate' | 'evidence' | 'reflection' | 'research';
  title: string;
  file: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
  comments?: string;
}

// CV and Document Generator Types

// Qualification for CV
export interface Qualification {
  id: number;
  name: string;
  governingBody: string;
  dateCompleted: string;
  expiryDate: string;
  status?: 'verified' | 'pending' | 'rejected';
}

// Experience entry for CV
export interface Experience {
  id: number;
  title: string;
  organization: string;
  date: string;
  duration: number;
  type?: string;
}

// Competency for CV
export interface Competency {
  id: number;
  name: string;
  level: number;
  description?: string;
}

// Complete CV data structure
export interface CVData {
  qualifications: Qualification[];
  experience: Experience[];
  competencies: Competency[];
  statements: Statement[];
}

// Cover letter template
export interface CoverLetterTemplate {
  id: number;
  title: string;
  lastUpdated: string;
  industry: string;
  content?: string;
} 