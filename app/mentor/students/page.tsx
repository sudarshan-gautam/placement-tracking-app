'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  User,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowLeft,
  BarChart2,
  Mail
} from 'lucide-react';
import Link from 'next/link';

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
  
  // Filter students based on search term
  const filteredStudents = studentsData.filter(student => 
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
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mentor" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600">Monitor and support your assigned students</p>
      </div>
      
      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students by name, email, or course"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      {/* Student Lists */}
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
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      href={`/mentor/students/${student.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <User className="h-4 w-4 mr-1" />
                      View Profile
                    </Link>
                    <button
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => window.location.href = `mailto:${student.email}`}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Contact
                    </button>
                    <Link 
                      href={`/mentor/students/${student.id}/report`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <BarChart2 className="h-4 w-4 mr-1" />
                      Generate Report
                    </Link>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-800">Verified</p>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-900 mt-1">{student.stats.verified}</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-yellow-800">Pending</p>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-xl font-bold text-yellow-900 mt-1">{student.stats.pending}</p>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-red-800">Rejected</p>
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-xl font-bold text-red-900 mt-1">{student.stats.rejected}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-800">Total Hours</p>
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-blue-900 mt-1">{student.stats.totalHours}</p>
                  </div>
                </div>
                
                {/* Recent Activity */}
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
                
                {/* Competencies */}
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
          </div>
        )}
      </div>
    </div>
  );
} 