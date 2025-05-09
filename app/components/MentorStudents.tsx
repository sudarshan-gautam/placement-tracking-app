'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getStudentsForMentor, 
  assignStudentToMentor, 
  unassignStudentFromMentor 
} from '@/lib/db-mentor-student-service';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'student';
}

interface MentorStudentsProps {
  mentor: User;
  students: User[];
  onUpdate?: () => void;
}

export default function MentorStudents({ mentor, students, onUpdate }: MentorStudentsProps) {
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  useEffect(() => {
    fetchAssignedStudents();
  }, [mentor.id]);

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);
      const studentData = await getStudentsForMentor(mentor.id);
      setAssignedStudents(studentData);
      
      // Filter available students (those not already assigned)
      const assignedIds = new Set(studentData.map((s: any) => s.student_id));
      setAvailableStudents(students.filter(s => !assignedIds.has(s.id)));
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      toast.error('Failed to load assigned students');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudentId) {
      toast.error('Please select a student');
      return;
    }

    try {
      setLoading(true);
      const success = await assignStudentToMentor(mentor.id, selectedStudentId, notes);
      
      if (success) {
        toast.success('Student assigned successfully');
        setSelectedStudentId('');
        setNotes('');
        setShowAddForm(false);
        fetchAssignedStudents();
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to assign student');
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      toast.error('Failed to assign student');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to unassign this student?')) {
      return;
    }

    try {
      setLoading(true);
      const success = await unassignStudentFromMentor(studentId);
      
      if (success) {
        toast.success('Student unassigned successfully');
        fetchAssignedStudents();
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to unassign student');
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
      toast.error('Failed to unassign student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Students Assigned to {mentor.name}</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Assign New Student'}
        </button>
      </div>

      {showAddForm && (
        <div className="border rounded-md p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Assign a New Student</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded border p-2"
                disabled={loading}
              >
                <option value="">Select a student...</option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded border p-2"
                rows={3}
                placeholder="Add notes about this assignment..."
                disabled={loading}
              />
            </div>
            
            <button
              onClick={handleAssignStudent}
              disabled={loading || !selectedStudentId}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Assigning...' : 'Assign Student'}
            </button>
          </div>
        </div>
      )}

      {loading && !showAddForm ? (
        <div className="text-center py-4">Loading assigned students...</div>
      ) : assignedStudents.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No students assigned to this mentor yet.</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignedStudents.map((assignment: any) => {
                const student = students.find(s => s.id === assignment.student_id);
                return (
                  <tr key={assignment.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student ? student.name : assignment.student_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student ? student.email : assignment.student_email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(assignment.assigned_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleUnassignStudent(assignment.student_id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Unassign
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 