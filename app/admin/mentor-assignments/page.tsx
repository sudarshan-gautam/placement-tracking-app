'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  email: string;
  assignedDate: string;
}

interface MentorAssignment {
  id: string;
  name: string;
  email: string;
  students: Student[];
}

export default function MentorAssignmentsPage() {
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/login');
      return;
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/admin/mentor-assignments');
        const data = await response.json();
        setAssignments(data.assignments || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAssignments();
    }
  }, [user]);

  if (!user || user.role !== 'admin' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mentor Assignments</h1>
        <p className="text-gray-600">View all mentor-student assignments</p>
      </div>

      <div className="grid gap-6">
        {assignments.map((mentor) => (
          <Card key={mentor.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <span className="text-xl">{mentor.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({mentor.email})</span>
                </div>
                <span className="text-sm font-normal text-gray-500">
                  {mentor.students.length} student{mentor.students.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentor.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Assigned: {new Date(student.assignedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {assignments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No mentor assignments found
          </div>
        )}
      </div>
    </div>
  );
} 