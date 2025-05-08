'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Search, User, ArrowUpRight, User2, UserX, UserCheck } from 'lucide-react';
import userProfiles from '@/lib/user-profiles';
import { getStudentsForMentor } from '@/lib/mentor-student-service';

// Sample student data
const studentsData = [
  {
    id: 101,
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatar: '/avatars/john.jpg',
    course: 'Education Studies',
    year: 3,
    stats: {
      verified: 12,
      pending: 3,
      rejected: 1,
      totalHours: 48
    },
    recent: {
      title: 'Primary School Teaching Session',
      date: '2023-07-15'
    },
    competencies: [
      { name: 'Classroom Management', level: 'Developing' },
      { name: 'Lesson Planning', level: 'Proficient' },
      { name: 'Assessment Design', level: 'Developing' }
    ]
  },
  {
    id: 102,
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    avatar: '/avatars/emma.jpg',
    course: 'Primary Education',
    year: 2,
    stats: {
      verified: 8,
      pending: 2,
      rejected: 0,
      totalHours: 32
    },
    recent: {
      title: 'Curriculum Planning Meeting',
      date: '2023-07-20'
    },
    competencies: [
      { name: 'Classroom Management', level: 'Developing' },
      { name: 'Lesson Planning', level: 'Developing' },
      { name: 'Assessment Design', level: 'Beginning' }
    ]
  },
  {
    id: 103,
    name: 'Michael Wong',
    email: 'michael.wong@example.com',
    avatar: '/avatars/michael.jpg',
    course: 'Secondary Science Education',
    year: 4,
    stats: {
      verified: 15,
      pending: 1,
      rejected: 2,
      totalHours: 62
    },
    recent: {
      title: 'Parent-Teacher Conference',
      date: '2023-07-25'
    },
    competencies: [
      { name: 'Classroom Management', level: 'Proficient' },
      { name: 'Lesson Planning', level: 'Proficient' },
      { name: 'Assessment Design', level: 'Advanced' }
    ]
  },
  {
    id: 104,
    name: 'Sarah Taylor',
    email: 'sarah.taylor@example.com',
    avatar: '/avatars/sarah.jpg',
    course: 'Early Childhood Education',
    year: 3,
    stats: {
      verified: 10,
      pending: 5,
      rejected: 1,
      totalHours: 42
    },
    recent: {
      title: 'Assessment Review',
      date: '2023-07-28'
    },
    competencies: [
      { name: 'Classroom Management', level: 'Proficient' },
      { name: 'Lesson Planning', level: 'Developing' },
      { name: 'Assessment Design', level: 'Developing' }
    ]
  }
];

export default function StudentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<typeof studentsData>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not authenticated or not a mentor
    if (!user) {
      router.push('/');
    } else if (user.role !== 'mentor') {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Load assigned students for this mentor
      loadAssignedStudents();
    }
  }, [user, router]);
  
  const loadAssignedStudents = () => {
    if (!user) return;
    
    setLoading(true);
    
    // Get student IDs assigned to this mentor
    const mentorId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const assignedStudentIds = getStudentsForMentor(mentorId);
    
    if (assignedStudentIds.length === 0) {
      setAssignedStudents([]);
      setLoading(false);
      return;
    }
    
    // Filter student data to only show assigned students
    const filteredStudents = studentsData.filter(student => 
      assignedStudentIds.includes(student.id)
    );
    
    setAssignedStudents(filteredStudents);
    setLoading(false);
  };
  
  // Filter students based on search term
  const filteredStudents = assignedStudents.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get competency level badge
  const getCompetencyBadge = (level: string) => {
    switch (level) {
      case 'Beginning':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Beginning</span>;
      case 'Developing':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Developing</span>;
      case 'Proficient':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Proficient</span>;
      case 'Advanced':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Advanced</span>;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Students</h1>
          <p className="text-gray-600">Manage and track student progress</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name, email or course..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card 
              key={student.id} 
              className={`overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                selectedStudent === student.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  {/* Student Info */}
                  <div className="flex items-start mb-4 sm:mb-0">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <User className="h-7 w-7 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <div className="mt-1 text-sm">
                        <span className="text-gray-700">{student.course}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-700">Year {student.year}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-col sm:items-end">
                    <div className="flex space-x-3 mb-2">
                      <Link 
                        href={`/mentor/students/${student.id}/profile`}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md flex items-center"
                      >
                        <User2 className="h-4 w-4 mr-1" />
                        View Profile
                      </Link>
                      <Link 
                        href={`/mentor/students/${student.id}/activities`}
                        className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-md flex items-center"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activities
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>Last Activity: {new Date(student.recent.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-500 mb-1">Hours</p>
                    <p className="text-xl font-bold text-blue-700">{student.stats.totalHours}</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-500 mb-1">Verified</p>
                    <p className="text-xl font-bold text-green-700">{student.stats.verified}</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-500 mb-1">Pending</p>
                    <p className="text-xl font-bold text-yellow-700">{student.stats.pending}</p>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-500 mb-1">Rejected</p>
                    <p className="text-xl font-bold text-red-700">{student.stats.rejected}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
                    <Link href={`/mentor/students/${student.id}/activities`} className="text-xs text-blue-600 hover:text-blue-800">
                      View All
                    </Link>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{student.recent.title}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">{new Date(student.recent.date).toLocaleDateString()}</p>
                      <Link href={`/activities/${student.id}`} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        Details
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Key Competencies</h4>
                    <Link href={`/mentor/students/${student.id}/competencies`} className="text-xs text-blue-600 hover:text-blue-800">
                      View All
                    </Link>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                    {student.competencies.map((competency, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <p className="text-sm text-gray-700">{competency.name}</p>
                        {getCompetencyBadge(competency.level)}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <User className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search term.' 
                : 'No students have been assigned to you yet.'}
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Students are assigned to you by administrators. Please contact an administrator
                if you need to have students assigned to your mentorship.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 