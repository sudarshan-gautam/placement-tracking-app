export interface CVTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  structure: any; // The structure of the CV template as a JSON object
  preview_image?: string | null;
  creator_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentCV {
  id: number;
  student_id: string;
  name: string;
  template_id: number | null;
  template_name?: string;
  template_structure?: any;
  content: any; // The content of the CV as a JSON object
  html_content: string; // HTML representation for display
  created_at: string;
  updated_at: string;
  last_generated_at: string | null;
  ats_score: number;
  is_draft: boolean;
}

export interface CoverLetterTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  industry: string | null;
  structure: any; // The structure of the template as a JSON object
  preview_image?: string | null;
  content: string; // Template content with placeholders
  creator_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentCoverLetter {
  id: number;
  student_id: string;
  name: string;
  template_id: number | null;
  template_name?: string;
  job_position: string | null;
  company_name: string | null;
  content: string; // Full content of the cover letter
  html_content: string; // HTML representation for display
  created_at: string;
  updated_at: string;
  last_generated_at: string | null;
  ats_score: number;
  is_draft: boolean;
} 