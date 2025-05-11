export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type QualificationType = 'degree' | 'certificate' | 'license' | 'course' | 'other';

export interface Qualification {
  id: string;
  student_id: string;
  title: string;
  issuing_organization: string;
  description?: string;
  date_obtained: string;
  expiry_date?: string;
  certificate_url?: string;
  type: QualificationType;
  verification_status: VerificationStatus;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface QualificationFormData {
  title: string;
  issuing_organization: string;
  description?: string;
  date_obtained: string;
  expiry_date?: string;
  type: QualificationType;
  certificate_file?: File;
} 