'use client';

import { useState, useEffect } from 'react';
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
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  X,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { VerificationReviewModal } from '@/components/ui/verification-review-modal';

// Define proper types
interface Evidence {
  name: string;
  type: string;
  size: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface Mentor {
  id: number;
  name: string;
  email: string;
}

interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  duration: string;
  description: string;
  reflection: string;
  outcomes: string[];
  evidence: Evidence[];
}

interface VerificationRequest {
  id: number;
  student: Student;
  activity: Activity;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  mentor: Mentor;
  priority: 'High' | 'Medium' | 'Low';
  rejectionReason?: string;
  feedback?: string;
}

// Add profileVerification type
interface ProfileVerificationRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl: string;
  rejectionReason?: string;
}

// Sample verification data
const initialVerificationRequests: VerificationRequest[] = [
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
    status: 'pending',
    mentor: {
      id: 201,
      name: 'Dr. Emily Johnson',
      email: 'emily.johnson@example.com'
    },
    priority: 'High'
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
    status: 'pending',
    mentor: {
      id: 202,
      name: 'Prof. Michael Brown',
      email: 'michael.brown@example.com'
    },
    priority: 'Medium'
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
    status: 'pending',
    mentor: {
      id: 203,
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@example.com'
    },
    priority: 'Low'
  },
  {
    id: 4,
    student: {
      id: 104,
      name: 'Robert Anderson',
      email: 'robert.anderson@example.com',
      avatar: '/avatars/robert.jpg'
    },
    activity: {
      id: 204,
      title: 'Professional Development Workshop',
      type: 'Training',
      date: '2023-08-01',
      duration: '4 hours',
      description: 'Attended a workshop on inclusive education practices and differentiation strategies for diverse learners.',
      reflection: 'The workshop provided valuable insights into creating accessible learning materials. I plan to implement the strategies in my future lesson planning.',
      outcomes: [
        'Gained understanding of Universal Design for Learning principles',
        'Developed skills for creating differentiated assessments',
        'Networked with experienced educators in the field'
      ],
      evidence: [
        { name: 'workshop_certificate.pdf', type: 'application/pdf', size: '178 KB' },
        { name: 'implementation_plan.docx', type: 'application/msword', size: '256 KB' }
      ]
    },
    submittedAt: '2023-08-02T16:20:00Z',
    status: 'approved',
    mentor: {
      id: 204,
      name: 'Prof. James Wilson',
      email: 'james.wilson@example.com'
    },
    priority: 'Medium'
  },
  {
    id: 5,
    student: {
      id: 105,
      name: 'Linda Martinez',
      email: 'linda.martinez@example.com',
      avatar: '/avatars/linda.jpg'
    },
    activity: {
      id: 205,
      title: 'Digital Learning Resource Creation',
      type: 'Development',
      date: '2023-08-05',
      duration: '3 hours',
      description: 'Created interactive digital resources for a science unit on the solar system using H5P and other educational technology tools.',
      reflection: 'I successfully created engaging learning materials that incorporate multimedia elements. I want to further develop my skills in creating interactive quizzes and assessments.',
      outcomes: [
        'Developed digital literacy skills',
        'Created accessible learning materials',
        'Incorporated multimedia elements to engage different learning styles'
      ],
      evidence: [
        { name: 'solar_system_module.h5p', type: 'application/octet-stream', size: '4.5 MB' },
        { name: 'resource_screenshots.pdf', type: 'application/pdf', size: '2.1 MB' }
      ]
    },
    submittedAt: '2023-08-06T11:10:00Z',
    status: 'rejected',
    mentor: {
      id: 205,
      name: 'Dr. Thomas Rodriguez',
      email: 'thomas.rodriguez@example.com'
    },
    priority: 'High',
    rejectionReason: 'The evidence provided does not sufficiently demonstrate the claimed outcomes. Please include more detailed documentation of the development process.'
  }
];

// Sample profile verification data
const initialProfileVerifications: ProfileVerificationRequest[] = [
  {
    id: 101,
    studentId: 1,
    studentName: 'Sudarshan',
    studentEmail: 'student@example.com',
    submittedAt: '2023-09-01T14:30:00Z',
    status: 'pending',
    documentUrl: '/verifications/student_id_1.pdf'
  }
];

// Format date helper
const formatDate = (dateString: string | number) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Format time helper
const formatTime = (dateString: string | number) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function AdminVerificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Get verification data from localStorage or use initial data
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const savedData = typeof window !== 'undefined' ? localStorage.getItem('adminVerifications') : null;
    return savedData ? JSON.parse(savedData) : initialVerificationRequests;
  });

  // Get profile verification data from localStorage or use initial data
  const [profileVerifications, setProfileVerifications] = useState<ProfileVerificationRequest[]>(() => {
    const savedData = typeof window !== 'undefined' ? localStorage.getItem('profileVerifications') : null;
    return savedData ? JSON.parse(savedData) : initialProfileVerifications;
  });

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentVerification, setCurrentVerification] = useState<any>(null);
  
  // New state for profile verification
  const [showProfileVerificationModal, setShowProfileVerificationModal] = useState(false);
  const [currentProfileVerification, setCurrentProfileVerification] = useState<ProfileVerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Tab state for switching between activity and profile verifications
  const [activeTab, setActiveTab] = useState<'activity' | 'profile'>('activity');
  
  // Get unique activity types for filter
  const activityTypes = ['all', ...Array.from(new Set<string>(verificationRequests.map(req => req.activity.type)))];
  
  // Get unique statuses for filter
  const statuses = ['all', ...Array.from(new Set<string>(verificationRequests.map(req => req.status)))];
  
  // Get unique priorities for filter
  const priorities = ['all', 'High', 'Medium', 'Low'];

  // Add safe filtering for verification requests
  const filteredVerificationRequests = Array.isArray(verificationRequests) 
    ? verificationRequests.filter((request) => {
        if (!request) return false;
        
        const matchesSearch = searchTerm === '' || 
          (request.student?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (request.activity?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  // Handle review button click
  const handleReview = (request: VerificationRequest) => {
    setCurrentVerification({
      id: request.id,
      type: request.activity.type,
      title: request.activity.title,
      user: request.student.name,
      date: request.activity.date,
      priority: request.priority,
      description: request.activity.description,
      attachments: request.activity.evidence.map((e: any) => e.name)
    });
    setShowReviewModal(true);
  };
  
  // Handle approve verification
  const handleApproveVerification = (id: number, feedback: string) => {
    // Update local state for immediate feedback
    setVerificationRequests(verificationRequests.map(v => 
      v.id === id ? { ...v, status: 'approved', feedback } : v
    ));
    
    // Call API to update in database
    fetch('/api/admin/verifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id.toString(), // Convert to string to fix type error
        status: 'approved',
        feedback,
      }),
    });
    
    setShowReviewModal(false);
    setSelectedVerification(null);
  };
  
  // Handle reject verification
  const handleRejectVerification = (id: number, reason: string) => {
    // Update local state for immediate feedback
    setVerificationRequests(verificationRequests.map(v => 
      v.id === id ? { ...v, status: 'rejected', rejectionReason: reason } : v
    ));
    
    // Call API to update in database
    fetch('/api/admin/verifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id.toString(), // Convert to string to fix type error
        status: 'rejected',
        feedback: reason,
      }),
    });
    
    setShowReviewModal(false);
    setSelectedVerification(null);
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };
  
  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Low
          </span>
        );
    }
  };
  
  // Handle approve profile verification
  const handleApproveProfileVerification = (id: number) => {
    const updatedVerifications = profileVerifications.map(req => 
      req.id === id ? { ...req, status: 'approved' as const } : req
    );
    
    setProfileVerifications(updatedVerifications);
    localStorage.setItem('profileVerifications', JSON.stringify(updatedVerifications));
    
    // Update student's verification status in localStorage
    const studentEmail = profileVerifications.find(v => v.id === id)?.studentEmail;
    if (studentEmail) {
      // Get all users from localStorage
      const users = localStorage.getItem('users');
      if (users) {
        try {
          const parsedUsers = JSON.parse(users);
          // Update the specific user's verification status
          const updatedUsers = parsedUsers.map((user: any) => {
            if (user.email === studentEmail) {
              return { ...user, isVerified: true };
            }
            return user;
          });
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        } catch (error) {
          console.error('Error updating user verification status:', error);
        }
      }
      
      // Set the individual student's verification status
      localStorage.setItem(`verificationStatus-${studentEmail}`, 'verified');
    }
    
    setShowProfileVerificationModal(false);
    
    // Show toast notification
    alert(`Profile verification for ${profileVerifications.find(v => v.id === id)?.studentName} has been approved`);
  };
  
  // Handle reject profile verification
  const handleRejectProfileVerification = (id: number, reason: string) => {
    if (!reason) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    const updatedVerifications = profileVerifications.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const, rejectionReason: reason } : req
    );
    
    setProfileVerifications(updatedVerifications);
    localStorage.setItem('profileVerifications', JSON.stringify(updatedVerifications));
    
    // Update student's verification status in localStorage
    const studentEmail = profileVerifications.find(v => v.id === id)?.studentEmail;
    if (studentEmail) {
      // Store rejection details
      const rejectionDetails = {
        reason,
        date: new Date().toISOString()
      };
      
      localStorage.setItem(`verificationStatus-${studentEmail}`, 'rejected');
      localStorage.setItem(`rejectionDetails-${studentEmail}`, JSON.stringify(rejectionDetails));
    }
    
    setShowProfileVerificationModal(false);
    setRejectionReason('');
    
    // Show toast notification
    alert(`Profile verification for ${profileVerifications.find(v => v.id === id)?.studentName} has been rejected`);
  };
  
  // Handle profile verification review
  const handleProfileVerificationReview = (verification: ProfileVerificationRequest) => {
    setCurrentProfileVerification(verification);
    setShowProfileVerificationModal(true);
  };
  
  // Check for new verification requests from students
  useEffect(() => {
    // In a real app, this would be an API call to get pending verification requests
    // For this demo, we'll check localStorage for any pending requests
    
    const checkForNewVerifications = () => {
      // Check if any user has a pending verification status
      const allKeys = Object.keys(localStorage);
      const verificationKeys = allKeys.filter(key => key.startsWith('verificationStatus-'));
      
      const pendingVerifications: ProfileVerificationRequest[] = [];
      
      verificationKeys.forEach(key => {
        const status = localStorage.getItem(key);
        if (status === 'pending') {
          // Extract email from key: verificationStatus-email@example.com
          const studentEmail = key.replace('verificationStatus-', '');
          
          // Get user details from localStorage
          const users = localStorage.getItem('users');
          if (users) {
            try {
              const parsedUsers = JSON.parse(users);
              const user = parsedUsers.find((u: any) => u.email === studentEmail);
              
              if (user) {
                // Check if this verification is already in our list
                const existingVerification = profileVerifications.some(v => v.studentEmail === studentEmail);
                
                if (!existingVerification) {
                  pendingVerifications.push({
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    studentId: user.id || Math.floor(Math.random() * 1000),
                    studentName: user.name || 'Unknown Student',
                    studentEmail,
                    submittedAt: new Date().toISOString(),
                    status: 'pending',
                    documentUrl: '/verifications/document.pdf' // Placeholder
                  });
                }
              }
            } catch (error) {
              console.error('Error parsing user data:', error);
            }
          }
        }
      });
      
      // If we found new pending verifications, add them to our state
      if (pendingVerifications.length > 0) {
        setProfileVerifications(prev => {
          const updated = [...prev, ...pendingVerifications];
          localStorage.setItem('profileVerifications', JSON.stringify(updated));
          return updated;
        });
      }
    };
    
    // Check on component mount
    checkForNewVerifications();
    
    // Also set up an interval to check periodically (simulating real-time updates)
    const interval = setInterval(checkForNewVerifications, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter profile verifications
  const filteredProfileVerifications = profileVerifications.filter(verification => {
    const matchesSearch = 
      verification.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Verification Management</h1>
        <p className="text-gray-600">Review, approve, or reject student activity and profile verifications</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'activity'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('activity')}
        >
          Activity Verifications
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Verifications
          {profileVerifications.filter(v => v.status === 'pending').length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {profileVerifications.filter(v => v.status === 'pending').length}
            </span>
          )}
        </button>
      </div>
      
      {activeTab === 'activity' ? (
        <>
          {/* Filters and Search for Activity Verifications */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Type Filter */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              id="type-filter"
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
          </div>
          
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Priority Filter */}
          <div>
            <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priorities' : priority}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Verification List */}
      <div className="space-y-6">
        {filteredVerificationRequests.length > 0 ? (
          filteredVerificationRequests.map((request) => (
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
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <StatusBadge status={request.status} />
                    <PriorityBadge priority={request.priority} />
                    <div className="text-sm text-gray-500">
                      Submitted: {formatDate(request.submittedAt)}
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
                      {formatDate(request.activity.date)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {request.activity.duration}
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                      {request.activity.type}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      Mentor: {request.mentor.name}
                    </div>
                  </div>
                  
                  {selectedVerification !== request.id && (
                    <p className="text-gray-700 line-clamp-2">{request.activity.description}</p>
                  )}
                </div>
                
                {selectedVerification === request.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Description</h5>
                        <p className="text-gray-700 text-sm">{request.activity.description}</p>
                        
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 mt-4">Reflection</h5>
                        <p className="text-gray-700 text-sm">{request.activity.reflection}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Outcomes</h5>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {request.activity.outcomes.map((outcome: string, index: number) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                        
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 mt-4">Evidence</h5>
                        <div className="space-y-2">
                          {request.activity.evidence.map((evidence: any, index: number) => (
                            <div key={index} className="flex items-center text-sm">
                              <FileText className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="text-blue-600">{evidence.name}</span>
                              <span className="text-gray-500 ml-2">({evidence.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-4 bg-red-50 p-4 rounded-md">
                        <h5 className="text-sm font-semibold text-red-800 flex items-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejection Reason
                        </h5>
                        <p className="text-red-700 text-sm mt-1">{request.rejectionReason}</p>
                      </div>
                    )}
                    
                    {request.status === 'approved' && request.feedback && (
                      <div className="mt-4 bg-green-50 p-4 rounded-md">
                        <h5 className="text-sm font-semibold text-green-800 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Feedback
                        </h5>
                        <p className="text-green-700 text-sm mt-1">{request.feedback}</p>
                      </div>
                    )}
                    
                    {request.status === 'pending' && (
                      <div className="flex justify-end mt-6 space-x-3">
                        <button
                          onClick={() => handleReview(request)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Review Verification
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FileText className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No verifications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No verification requests match your current filters.
            </p>
          </div>
        )}
          </div>
        </>
      ) : (
        <>
          {/* Filters and Search for Profile Verifications */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
      </div>
      
              {/* Status Filter */}
              <div>
                <label htmlFor="profile-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="profile-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Profile Verification Table */}
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProfileVerifications.length > 0 ? (
                      filteredProfileVerifications.map((verification) => (
                        <tr key={verification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{verification.studentName}</div>
                                <div className="text-sm text-gray-500">{verification.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(String(verification.submittedAt))}</div>
                            <div className="text-sm text-gray-500">{formatTime(String(verification.submittedAt))}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={verification.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {verification.status === 'pending' ? (
                              <button
                                onClick={() => handleProfileVerificationReview(verification)}
                                className="text-blue-600 hover:text-blue-900 ml-4"
                              >
                                Review
                              </button>
                            ) : (
                              <div className="text-gray-400 ml-4">
                                {verification.status === 'approved' ? 'Approved' : 'Rejected'}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No profile verification requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Verification Review Modal - existing modal for activities */}
        <VerificationReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
        onApprove={(feedback) => handleApproveVerification(currentVerification?.id, feedback)}
        onReject={(reason) => handleRejectVerification(currentVerification?.id, reason)}
          verification={currentVerification}
      />
      
      {/* Profile Verification Review Modal */}
      {showProfileVerificationModal && currentProfileVerification && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Profile Verification Request</h3>
                <button
                  onClick={() => setShowProfileVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Student:</span>
                    <span className="ml-2">{currentProfileVerification.studentName}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{currentProfileVerification.studentEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">Submitted:</span>
                    <span className="ml-2">
                      {formatDate(String(currentProfileVerification.submittedAt))} at {formatTime(String(currentProfileVerification.submittedAt))}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Verification Document</h4>
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Student identity document</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Document
                    </button>
                  </div>
                </div>
                
                {currentProfileVerification.status === 'pending' && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Rejection Reason (optional)</h4>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason if rejecting this verification request..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    ></textarea>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowProfileVerificationModal(false)}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  {currentProfileVerification.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleRejectProfileVerification(currentProfileVerification.id, rejectionReason)}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveProfileVerification(currentProfileVerification.id)}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 