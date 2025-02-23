export type QualificationStatus = 'verified' | 'pending' | 'rejected';

export interface Qualification {
  id: number;
  name: string;
  governingBody: string;
  dateCompleted: string;
  expiryDate: string;
  status: QualificationStatus;
  certificate: string;
} 