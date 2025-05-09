'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { assignStudentToMentor, getMentorForStudent } from '@/lib/db-mentor-student-service';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'student';
}

interface AssignMentorProps {
  student: User;
  mentors: User[];
  onAssigned: () => void;
}

export default function AssignMentor({ student, mentors, onAssigned }: AssignMentorProps) {
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [currentMentor, setCurrentMentor] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch current mentor on component mount
    const fetchCurrentMentor = async () => {
      try {
        setLoading(true);
        const mentorData = await getMentorForStudent(student.id);
        
        if (mentorData && mentorData.mentor_id) {
          const mentor = mentors.find(m => m.id === mentorData.mentor_id);
          if (mentor) {
            setCurrentMentor(mentor);
            setSelectedMentorId(mentor.id);
          }
        }
      } catch (error) {
        console.error('Error fetching current mentor:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentMentor();
  }, [student.id, mentors]);

  const handleAssign = async () => {
    if (!selectedMentorId) {
      toast.error('Please select a mentor');
      return;
    }
    
    try {
      setLoading(true);
      const success = await assignStudentToMentor(selectedMentorId, student.id);
      
      if (success) {
        const mentor = mentors.find(m => m.id === selectedMentorId);
        setCurrentMentor(mentor || null);
        toast.success(`${student.name} assigned to ${mentor?.name}`);
        if (onAssigned) onAssigned();
      } else {
        toast.error('Failed to assign mentor');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      toast.error('Failed to assign mentor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <>
          {currentMentor && (
            <div className="text-sm">
              Current Mentor: <span className="font-medium">{currentMentor.name}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <select
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              className="text-sm rounded border border-gray-300 px-2 py-1 flex-1"
            >
              <option value="">Select a mentor</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleAssign}
              disabled={loading || !selectedMentorId}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Assign
            </button>
          </div>
        </>
      )}
    </div>
  );
} 