export interface Competency {
  id: number;
  name: string;
  selfScore: number;
  supervisorScore: number;
  lastUpdated: string;
  feedback: string;
  suggestions: string;
  researchEvidence: string[];
  researchAlignment: number;
  developmentPlan: string;
}

export interface RadarDataPoint {
  subject: string;
  selfScore: number;
  supervisorScore: number;
  researchAlignment: number;
  fullMark: number;
}

export interface ResearchEvidence {
  id: number;
  competencyId: number;
  source: string;
  findings: string;
  datePublished: string;
  impact: string;
  alignment: number;
} 