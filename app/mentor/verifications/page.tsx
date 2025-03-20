'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ArrowLeft,
  Download
} from 'lucide-react';
import Link from 'next/link';

// Sample verification requests
const verificationRequests = [
  {
    id: 1,
    student: {
      id: 101,
      name: 'John Smith',
      email: 'john.smith@example.com',
      avatar: '/avatars/john.jpg'
    },
    activity: {
      id: 201,
      title: 'Primary School Teaching Session',
      type: 'Teaching',
      date: '2023-07-15',
      duration: '2 hours',
      description: 'Conducted a mathematics lesson for Year 3 students, focusing on basic multiplication and division concepts.',
      reflection: 'The session went well overall. Students were engaged with the interactive elements. Next time, I would allocate more time for the hands-on activities as some students needed additional support.',
      outcomes: [
        'Demonstrated effective classroom management techniques',
        'Adapted teaching approach based on student responses',
        'Created an inclusive learning environment'
      ],
      evidence: [
        { name: 'lesson_plan.pdf', type: 'application/pdf', size: '245 KB' },
        { name: 'class_photo.jpg', type: 'image/jpeg', size: '1.2 MB' }
      ]
    },
    submittedAt: '2023-07-16T10:30:00Z',
    status: 'pending'
  },
  {
    id: 2,
    student: {
      id: 102,
      name: 'Emma Johnson',
      email: 'emma.johnson@example.com',
      avatar: '/avatars/emma.jpg'
    },
    activity: {
      id: 202,
      title: 'Curriculum Planning Meeting',
      type: 'Planning',
      date: '2023-07-20',
      duration: '1.5 hours',
      description: 'Participated in a team meeting to plan the science curriculum for the upcoming term, focusing on ecology and environmental science units.',
      reflection: 'I contributed several ideas for hands-on experiments that were well-received. I need to improve my knowledge of curriculum standards to make more effective suggestions.',
      outcomes: [
        'Collaborated effectively with experienced teachers',
        'Contributed creative ideas for engaging learning activities',
        'Gained insight into curriculum development processes'
      ],
      evidence: [
        { name: 'meeting_notes.pdf', type: 'application/pdf', size: '187 KB' },
        { name: 'curriculum_draft.docx', type: 'application/msword', size: '342 KB' }
      ]
    },
    submittedAt: '2023-07-21T14:45:00Z',
    status: 'pending'
  },
  {
    id: 3,
    student: {
      id: 103,
      name: 'Michael Wong',
      email: 'michael.wong@example.com',
      avatar: '/avatars/michael.jpg'
    },
    activity: {
      id: 203,
      title: 'Parent-Teacher Conference',
      type: 'Communication',
      date: '2023-07-25',
      duration: '1 hour',
      description: 'Observed and participated in parent-teacher conferences for Year 5 students, discussing progress and areas for improvement.',
      reflection: 'I learned a lot about effective communication with parents. The mentor teacher modeled excellent strategies for addressing concerns constructively.',
      outcomes: [
        'Observed effective parent communication techniques',
        'Practiced active listening skills',
        'Learned to present student progress data clearly'
      ],
      evidence: [
        { name: 'conference_template.pdf', type: 'application/pdf', size: '156 KB' },
        { name: 'reflection_notes.pdf', type: 'application/pdf', size: '210 KB' }
      ]
    },
    submittedAt: '2023-07-26T09:15:00Z',
    status: 'pending'
  }
];

export default function VerificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<number | null>(null);
  
  // Filter verification requests
  const filteredRequests = verificationRequests.filter(request => {
    const matchesSearch = 
      request.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || request.activity.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Get unique activity types for filter
  const activityTypes = ['all', ...Array.from(new Set(verificationRequests.map(req => req.activity.type)))];
  
  // Handle approval/rejection
  const handleApprove = (id: number) => {
    // In a real app, this would call an API to update the verification status
    console.log(`Approving verification ${id}`);
    alert(`Verification #${id} has been approved`);
  };
  
  const handleReject = (id: number, reason: string) => {
    // In a real app, this would call an API to update the verification status
    console.log(`Rejecting verification ${id} with reason: ${reason}`);
    alert(`Verification #${id} has been rejected`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mentor" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
        <p className="text-gray-600">Review and verify student activities</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name or activity title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Type Filter */}
          <div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Activity Types' : type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Requests List */}
      <div className="space-y-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} className={`overflow-hidden ${selectedVerification === request.id ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{request.student.name}</h3>
                      <p className="text-sm text-gray-500">{request.student.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="text-sm text-gray-500 mb-2 md:mb-0">
                      Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => setSelectedVerification(selectedVerification === request.id ? null : request.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {selectedVerification === request.id ? 'Hide Details' : 'View Details'}
                      <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform ${selectedVerification === request.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">{request.activity.title}</h4>
                  <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(request.activity.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {request.activity.duration}
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                      {request.activity.type}
                    </div>
                  </div>
                  
                  {selectedVerification !== request.id && (
                    <p className="text-gray-700 line-clamp-2">{request.activity.description}</p>
                  )}
                </div>
                
                {selectedVerification === request.id && (
                  <div className="mt-4 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{request.activity.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Reflection</h4>
                      <p className="text-gray-700">{request.activity.reflection}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Learning Outcomes</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        {request.activity.outcomes.map((outcome, index) => (
                          <li key={index}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Evidence</h4>
                      <div className="space-y-2">
                        {request.activity.evidence.map((evidence, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{evidence.name}</p>
                                <p className="text-xs text-gray-500">{evidence.size}</p>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 flex flex-wrap gap-3 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Approve Verification
                      </button>
                      
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason) handleReject(request.id, reason);
                        }}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Reject Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FileText className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No verification requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'All verification requests have been processed.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 