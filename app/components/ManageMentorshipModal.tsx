'use client';

import { useState, useEffect } from 'react';
import MentorStudents from './MentorStudents';
import AssignMentor from './AssignMentor';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'student';
}

interface ManageMentorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  allUsers: User[];
  onUpdate?: () => void;
}

export default function ManageMentorshipModal({
  isOpen,
  onClose,
  user,
  allUsers,
  onUpdate
}: ManageMentorshipModalProps) {
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Filter out mentors and students from all users
      setMentors(allUsers.filter(u => u.role === 'mentor'));
      setStudents(allUsers.filter(u => u.role === 'student'));
    }
  }, [isOpen, allUsers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {user.role === 'mentor' 
                ? `Manage Students for ${user.name}` 
                : `Manage Mentor for ${user.name}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {user.role === 'mentor' ? (
            <MentorStudents 
              mentor={user} 
              students={students} 
              onUpdate={() => {
                if (onUpdate) onUpdate();
              }} 
            />
          ) : user.role === 'student' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assign Mentor to {user.name}</h3>
              <AssignMentor 
                student={user} 
                mentors={mentors} 
                onAssigned={() => {
                  if (onUpdate) onUpdate();
                }} 
              />
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Admin users don't have mentor-student relationships.
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex justify-end">
            <button 
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 