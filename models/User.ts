import mongoose from 'mongoose';

export type UserRole = 'admin' | 'mentor' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  dateOfBirth?: Date;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['admin', 'mentor', 'student'],
    default: 'student',
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  profileImage: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.User || mongoose.model<User>('User', userSchema); 