export type UserRole = 'admin' | 'mentor' | 'student';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: string | number;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
} 