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
  },
  // Add qualification verification samples
  {
    id: 6,
    student: {
      id: 106,
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      avatar: '/avatars/david.jpg'
    },
    activity: {
      id: 206,
      title: 'Bachelor of Education Degree',
      type: 'Qualification',
      date: '2023-06-15',
      duration: 'N/A',
      description: 'Bachelor of Education degree with specialization in Secondary Science Education from University of Melbourne.',
      reflection: 'This qualification gave me a strong foundation in educational theory and practice, with specialized knowledge in science teaching methodologies.',
      outcomes: [
        'Gained comprehensive knowledge of educational theories',
        'Developed science-specific teaching strategies',
        'Learned classroom management techniques'
      ],
      evidence: [
        { name: 'degree_certificate.pdf', type: 'application/pdf', size: '1.1 MB' },
        { name: 'transcript.pdf', type: 'application/pdf', size: '2.3 MB' }
      ]
    },
    submittedAt: '2023-06-20T09:15:00Z',
    status: 'pending',
    mentor: {
      id: 206,
      name: 'Prof. Elizabeth Taylor',
      email: 'elizabeth.taylor@example.com'
    },
    priority: 'High'
  },
  {
    id: 7,
    student: {
      id: 107,
      name: 'Sarah Jones',
      email: 'sarah.jones@example.com',
      avatar: '/avatars/sarah.jpg'
    },
    activity: {
      id: 207,
      title: 'First Aid Certification',
      type: 'Qualification',
      date: '2023-08-12',
      duration: '8 hours',
      description: 'Completed a comprehensive First Aid and CPR certification course, essential for classroom safety procedures.',
      reflection: 'The hands-on training was invaluable, giving me confidence to respond appropriately in emergency situations that might occur in a school setting.',
      outcomes: [
        'Certified in CPR and basic life support',
        'Learned to assess and respond to medical emergencies',
        'Developed skills in bandaging and wound care'
      ],
      evidence: [
        { name: 'first_aid_certificate.pdf', type: 'application/pdf', size: '780 KB' },
        { name: 'training_completion.jpg', type: 'image/jpeg', size: '1.5 MB' }
      ]
    },
    submittedAt: '2023-08-14T16:45:00Z',
    status: 'approved',
    mentor: {
      id: 207,
      name: 'Dr. Robert Harris',
      email: 'robert.harris@example.com'
    },
    priority: 'Medium',
    feedback: 'Essential qualification for all teaching staff. Documentation is clear and complete.'
  },
  {
    id: 8,
    student: {
      id: 108,
      name: 'James Miller',
      email: 'james.miller@example.com',
      avatar: '/avatars/james.jpg'
    },
    activity: {
      id: 208,
      title: 'Special Education Needs Specialist Certification',
      type: 'Qualification',
      date: '2023-07-05',
      duration: '40 hours',
      description: 'Completed specialized training in supporting students with diverse learning needs, including ADHD, autism spectrum disorders, and dyslexia.',
      reflection: 'This certification has transformed my approach to inclusive teaching. I now have concrete strategies to support all learners in my classroom.',
      outcomes: [
        'Learned assessment techniques for identifying learning needs',
        'Developed skills in creating appropriate accommodations',
        'Gained understanding of legal requirements for inclusive education'
      ],
      evidence: [
        { name: 'sen_certificate.pdf', type: 'application/pdf', size: '950 KB' },
        { name: 'course_materials.zip', type: 'application/zip', size: '15.8 MB' }
      ]
    },
    submittedAt: '2023-07-10T11:30:00Z',
    status: 'pending',
    mentor: {
      id: 208,
      name: 'Dr. Anna Martinez',
      email: 'anna.martinez@example.com'
    },
    priority: 'High'
  },
  {
    id: 9,
    student: {
      id: 109,
      name: 'Emily Thompson',
      email: 'emily.thompson@example.com',
      avatar: '/avatars/emily_t.jpg'
    },
    activity: {
      id: 209,
      title: 'Digital Learning Technologies Certificate',
      type: 'Qualification',
      date: '2023-09-02',
      duration: '24 hours',
      description: 'Completed certification in implementing digital learning tools and platforms in the classroom environment.',
      reflection: 'This qualification has equipped me with practical skills to integrate technology meaningfully into my teaching, enhancing student engagement and learning outcomes.',
      outcomes: [
        'Mastered key educational technology platforms',
        'Learned to design effective digital assessments',
        'Developed strategies for online and blended learning environments'
      ],
      evidence: [
        { name: 'digital_cert.pdf', type: 'application/pdf', size: '1.2 MB' },
        { name: 'sample_digital_lesson.html', type: 'text/html', size: '3.4 MB' }
      ]
    },
    submittedAt: '2023-09-05T14:20:00Z',
    status: 'rejected',
    mentor: {
      id: 209,
      name: 'Prof. Samuel Lee',
      email: 'samuel.lee@example.com'
    },
    priority: 'Medium',
    rejectionReason: 'The evidence provided does not demonstrate sufficient mastery of the platforms. Please provide examples of actual implementation in classroom settings.'
  },
  {
    id: 10,
    student: {
      id: 110,
      name: 'Daniel Garcia',
      email: 'daniel.garcia@example.com',
      avatar: '/avatars/daniel.jpg'
    },
    activity: {
      id: 210,
      title: 'Mathematics Subject Matter Expertise Certification',
      type: 'Qualification',
      date: '2023-08-25',
      duration: '32 hours',
      description: 'Advanced certification in mathematics teaching methodologies and content knowledge for secondary education.',
      reflection: 'This specialized training has deepened my understanding of complex mathematical concepts and how to teach them effectively to diverse learners.',
      outcomes: [
        'Enhanced knowledge of advanced mathematical concepts',
        'Developed specialized teaching methods for abstract mathematical topics',
        'Learned techniques for addressing math anxiety in students'
      ],
      evidence: [
        { name: 'math_certification.pdf', type: 'application/pdf', size: '890 KB' },
        { name: 'sample_lesson_plans.docx', type: 'application/msword', size: '2.7 MB' }
      ]
    },
    submittedAt: '2023-08-28T10:15:00Z',
    status: 'pending',
    mentor: {
      id: 210,
      name: 'Dr. Olivia Wang',
      email: 'olivia.wang@example.com'
    },
    priority: 'Low'
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
  },
  {
    id: 102,
    studentId: 2,
    studentName: 'Emily Johnson',
    studentEmail: 'emily.johnson@student.example.com',
    submittedAt: '2023-09-02T10:15:00Z',
    status: 'approved',
    documentUrl: '/verifications/student_id_2.pdf'
  },
  {
    id: 103,
    studentId: 3,
    studentName: 'Michael Wong',
    studentEmail: 'michael.wong@student.example.com',
    submittedAt: '2023-09-03T16:45:00Z',
    status: 'rejected',
    documentUrl: '/verifications/student_id_3.pdf',
    rejectionReason: 'Documents are expired. Please submit current identification.'
  },
  {
    id: 104,
    studentId: 4,
    studentName: 'Sarah Jones',
    studentEmail: 'sarah.jones@student.example.com',
    submittedAt: '2023-09-05T09:30:00Z',
    status: 'pending',
    documentUrl: '/verifications/student_id_4.pdf'
  },
  {
    id: 105,
    studentId: 5,
    studentName: 'David Wilson',
    studentEmail: 'david.wilson@student.example.com',
    submittedAt: '2023-09-07T14:20:00Z',
    status: 'pending',
    documentUrl: '/verifications/student_id_5.pdf'
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

  // State for search and filters (separate for each tab)
  const [activitiesSearchTerm, setActivitiesSearchTerm] = useState('');
  const [activitiesTypeFilter, setActivitiesTypeFilter] = useState('all');
  const [activitiesStatusFilter, setActivitiesStatusFilter] = useState('all');
  const [activitiesPriorityFilter, setActivitiesPriorityFilter] = useState('all');

  const [sessionsSearchTerm, setSessionsSearchTerm] = useState('');
  const [sessionsStatusFilter, setSessionsStatusFilter] = useState('all');
  const [sessionsPriorityFilter, setSessionsPriorityFilter] = useState('all');

  const [qualificationsSearchTerm, setQualificationsSearchTerm] = useState('');
  const [qualificationsStatusFilter, setQualificationsStatusFilter] = useState('all');
  const [qualificationsPriorityFilter, setQualificationsPriorityFilter] = useState('all');

  const [profileSearchTerm, setProfileSearchTerm] = useState('');
  const [profileStatusFilter, setProfileStatusFilter] = useState('all');

  const [selectedVerification, setSelectedVerification] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentVerification, setCurrentVerification] = useState<any>(null);
  
  // New state for profile verification
  const [showProfileVerificationModal, setShowProfileVerificationModal] = useState(false);
  const [currentProfileVerification, setCurrentProfileVerification] = useState<ProfileVerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Tab state for switching between different verification types
  const [activeTab, setActiveTab] = useState<'activities' | 'sessions' | 'qualifications' | 'profile'>('activities');
  
  // Get unique activity types for filter
  const activityTypes = ['all', ...Array.from(new Set<string>(verificationRequests.map(req => req.activity.type)))];
  
  // Get unique statuses for filter
  const statuses = ['all', ...Array.from(new Set<string>(verificationRequests.map(req => req.status)))];
  
  // Get unique priorities for filter
  const priorities = ['all', 'High', 'Medium', 'Low'];

  // Get the current search term based on active tab
  const getCurrentSearchTerm = () => {
    switch (activeTab) {
      case 'activities':
        return activitiesSearchTerm;
      case 'sessions':
        return sessionsSearchTerm;
      case 'qualifications':
        return qualificationsSearchTerm;
      case 'profile':
        return profileSearchTerm;
      default:
        return '';
    }
  };

  // Get the current status filter based on active tab
  const getCurrentStatusFilter = () => {
    switch (activeTab) {
      case 'activities':
        return activitiesStatusFilter;
      case 'sessions':
        return sessionsStatusFilter;
      case 'qualifications':
        return qualificationsStatusFilter;
      case 'profile':
        return profileStatusFilter;
      default:
        return 'all';
    }
  };

  // Update search term based on active tab
  const updateSearchTerm = (value: string) => {
    switch (activeTab) {
      case 'activities':
        setActivitiesSearchTerm(value);
        break;
      case 'sessions':
        setSessionsSearchTerm(value);
        break;
      case 'qualifications':
        setQualificationsSearchTerm(value);
        break;
      case 'profile':
        setProfileSearchTerm(value);
        break;
    }
  };

  // Update status filter based on active tab
  const updateStatusFilter = (value: string) => {
    switch (activeTab) {
      case 'activities':
        setActivitiesStatusFilter(value);
        break;
      case 'sessions':
        setSessionsStatusFilter(value);
        break;
      case 'qualifications':
        setQualificationsStatusFilter(value);
        break;
      case 'profile':
        setProfileStatusFilter(value);
        break;
    }
  };

  // Update priority filter based on active tab
  const updatePriorityFilter = (value: string) => {
    switch (activeTab) {
      case 'activities':
        setActivitiesPriorityFilter(value);
        break;
      case 'sessions':
        setSessionsPriorityFilter(value);
        break;
      case 'qualifications':
        setQualificationsPriorityFilter(value);
        break;
    }
  };

  // Activities tab - Create specific filter functions for each tab
  // Create a specific filtered list for activities
  const filteredActivitiesRequests = verificationRequests.filter(request => {
    // Only include activities, not teaching or qualification
    if (['Teaching', 'Qualification'].includes(request.activity.type)) return false;
    
    // Apply search filter
    const matchesSearch = 
      activitiesSearchTerm === '' || 
      request.student.name.toLowerCase().includes(activitiesSearchTerm.toLowerCase()) ||
      request.activity.title.toLowerCase().includes(activitiesSearchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = activitiesStatusFilter === 'all' || request.status === activitiesStatusFilter;
    
    // Apply priority filter
    const matchesPriority = activitiesPriorityFilter === 'all' || request.priority === activitiesPriorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sessions tab - Modify the VerificationList call to use these specific filtered arrays
  const filteredSessionsRequests = verificationRequests.filter(request => {
    // Only include teaching sessions
    if (request.activity.type !== 'Teaching') return false;
    
    // Apply search filter
    const matchesSearch = 
      sessionsSearchTerm === '' || 
      request.student.name.toLowerCase().includes(sessionsSearchTerm.toLowerCase()) ||
      request.activity.title.toLowerCase().includes(sessionsSearchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = sessionsStatusFilter === 'all' || request.status === sessionsStatusFilter;
    
    // Apply priority filter
    const matchesPriority = sessionsPriorityFilter === 'all' || request.priority === sessionsPriorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Qualifications tab
  const filteredQualificationsRequests = verificationRequests.filter(request => {
    // Only include qualifications
    if (request.activity.type !== 'Qualification') return false;
    
    // Apply search filter
    const matchesSearch = 
      qualificationsSearchTerm === '' || 
      request.student.name.toLowerCase().includes(qualificationsSearchTerm.toLowerCase()) ||
      request.activity.title.toLowerCase().includes(qualificationsSearchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = qualificationsStatusFilter === 'all' || request.status === qualificationsStatusFilter;
    
    // Apply priority filter
    const matchesPriority = qualificationsPriorityFilter === 'all' || request.priority === qualificationsPriorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Filter verification requests
  const filteredVerificationRequests = Array.isArray(verificationRequests) 
    ? verificationRequests.filter((request) => {
        if (!request) return false;
        
        // Get the appropriate search term based on active tab
        const currentSearchTerm = getCurrentSearchTerm();
        const currentStatusFilter = getCurrentStatusFilter();
        
        const matchesSearch = 
          currentSearchTerm === '' || 
          (request.student?.name?.toLowerCase() || '').includes(currentSearchTerm.toLowerCase()) ||
          (request.activity?.title?.toLowerCase() || '').includes(currentSearchTerm.toLowerCase());
        
        const matchesStatus = currentStatusFilter === 'all' || request.status === currentStatusFilter;
        
        // Apply tab-specific priority filters
        let matchesPriority = true;
        if (activeTab === 'activities' && activitiesPriorityFilter !== 'all') {
          matchesPriority = request.priority === activitiesPriorityFilter;
        } else if (activeTab === 'sessions' && sessionsPriorityFilter !== 'all') {
          matchesPriority = request.priority === sessionsPriorityFilter;
        } else if (activeTab === 'qualifications' && qualificationsPriorityFilter !== 'all') {
          matchesPriority = request.priority === qualificationsPriorityFilter;
        }
        
        return matchesSearch && matchesStatus && matchesPriority;
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
    const studentVerification = profileVerifications.find(v => v.id === id);
    const studentEmail = studentVerification?.studentEmail;
    
    if (studentEmail) {
      // Get all users from localStorage
      const users = localStorage.getItem('users');
      if (users) {
        try {
          const parsedUsers = JSON.parse(users);
          // Update the specific user's verification status
          const updatedUsers = parsedUsers.map((user: any) => {
            if (user.email === studentEmail) {
              return { ...user, isVerified: true, verificationStatus: 'verified' };
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
      
      // Also update any other relevant keys in localStorage
      localStorage.setItem(`userVerified-${studentEmail}`, 'true');
      localStorage.setItem(`user-${studentEmail}-verified`, 'true');
    }
    
    setShowProfileVerificationModal(false);
    
    // Show toast notification
    alert(`Profile verification for ${studentVerification?.studentName} has been approved`);
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
  
  // Profile tab - Filter function
  const filteredProfileVerifications = profileVerifications.filter(verification => {
    // Apply search filter
    const matchesSearch = 
      profileSearchTerm === '' || 
      verification.studentName.toLowerCase().includes(profileSearchTerm.toLowerCase()) ||
      verification.studentEmail.toLowerCase().includes(profileSearchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = profileStatusFilter === 'all' || verification.status === profileStatusFilter;
    
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
        <p className="text-gray-600">Review, approve, or reject student activities, teaching sessions, qualifications, and profile verifications</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'activities'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('activities')}
        >
          Activities
          {verificationRequests.filter(v => 
            !['Teaching', 'Qualification'].includes(v.activity.type) && 
            v.status === 'pending'
          ).length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {verificationRequests.filter(v => 
                !['Teaching', 'Qualification'].includes(v.activity.type) && 
                v.status === 'pending'
              ).length}
            </span>
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'sessions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions
          {verificationRequests.filter(v => v.activity.type === 'Teaching' && v.status === 'pending').length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {verificationRequests.filter(v => v.activity.type === 'Teaching' && v.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'qualifications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('qualifications')}
        >
          Qualifications
          {verificationRequests.filter(v => v.activity.type === 'Qualification' && v.status === 'pending').length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {verificationRequests.filter(v => v.activity.type === 'Qualification' && v.status === 'pending').length}
            </span>
          )}
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
      
      {/* Tab content based on selected tab */}
      {activeTab === 'activities' && (
        <>
          {/* Activities Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Activity Verification Requests</h2>
              
              {/* Activities search and filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or title"
                    value={activitiesSearchTerm}
                    onChange={(e) => {
                      setActivitiesSearchTerm(e.target.value);
                      // Trigger immediate filtering
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={activitiesStatusFilter}
                  onChange={(e) => setActivitiesStatusFilter(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                
                <select
                  value={activitiesPriorityFilter}
                  onChange={(e) => setActivitiesPriorityFilter(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === 'all' ? 'All Priorities' : priority}
                    </option>
                  ))}
                </select>
                
                <select
                  value={activitiesTypeFilter}
                  onChange={(e) => setActivitiesTypeFilter(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Activity Types' : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <VerificationList 
            verificationRequests={filteredActivitiesRequests}
            searchTerm={activitiesSearchTerm}
            setSearchTerm={setActivitiesSearchTerm}
            statusFilter={activitiesStatusFilter}
            setStatusFilter={setActivitiesStatusFilter}
            typeFilter={activitiesTypeFilter}
            setTypeFilter={setActivitiesTypeFilter}
            priorityFilter={activitiesPriorityFilter}
            setPriorityFilter={setActivitiesPriorityFilter}
            selectedVerification={selectedVerification}
            setSelectedVerification={setSelectedVerification}
            handleReview={handleReview}
            StatusBadge={StatusBadge}
            PriorityBadge={PriorityBadge}
            formatDate={formatDate}
            activityTypes={activityTypes}
            statuses={statuses}
            priorities={priorities}
            showFilters={false}
          />
        </>
      )}

      {activeTab === 'sessions' && (
        <>
          {/* Sessions Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Session Verification Requests</h2>
              
              {/* Sessions search and filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or title"
                    value={sessionsSearchTerm}
                    onChange={(e) => {
                      setSessionsSearchTerm(e.target.value);
                      // Trigger immediate filtering
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={sessionsStatusFilter}
                  onChange={(e) => setSessionsStatusFilter(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sessionsPriorityFilter}
                  onChange={(e) => setSessionsPriorityFilter(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          
          <VerificationList 
            verificationRequests={filteredSessionsRequests}
            searchTerm={sessionsSearchTerm}
            setSearchTerm={setSessionsSearchTerm}
            statusFilter={sessionsStatusFilter}
            setStatusFilter={setSessionsStatusFilter}
            typeFilter={activitiesTypeFilter} 
            setTypeFilter={setActivitiesTypeFilter}
            priorityFilter={sessionsPriorityFilter}
            setPriorityFilter={setSessionsPriorityFilter}
            selectedVerification={selectedVerification}
            setSelectedVerification={setSelectedVerification}
            handleReview={handleReview}
            StatusBadge={StatusBadge}
            PriorityBadge={PriorityBadge}
            formatDate={formatDate}
            activityTypes={activityTypes}
            statuses={statuses}
            priorities={priorities}
            showFilters={false}
          />
        </>
      )}

      {activeTab === 'qualifications' && (
        <>
          {/* Qualifications Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Qualification Verification Requests</h2>
              
              {/* Qualifications search and filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or title"
                    value={qualificationsSearchTerm}
                    onChange={(e) => {
                      setQualificationsSearchTerm(e.target.value);
                      // Trigger immediate filtering
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={qualificationsStatusFilter}
                  onChange={(e) => setQualificationsStatusFilter(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                
                <select
                  value={qualificationsPriorityFilter}
                  onChange={(e) => setQualificationsPriorityFilter(e.target.value)}
                  className="w-full md:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          
          <VerificationList 
            verificationRequests={filteredQualificationsRequests}
            searchTerm={qualificationsSearchTerm}
            setSearchTerm={setQualificationsSearchTerm}
            statusFilter={qualificationsStatusFilter}
            setStatusFilter={setQualificationsStatusFilter}
            typeFilter={activitiesTypeFilter} 
            setTypeFilter={setActivitiesTypeFilter}
            priorityFilter={qualificationsPriorityFilter}
            setPriorityFilter={setQualificationsPriorityFilter}
            selectedVerification={selectedVerification}
            setSelectedVerification={setSelectedVerification}
            handleReview={handleReview}
            StatusBadge={StatusBadge}
            PriorityBadge={PriorityBadge}
            formatDate={formatDate}
            activityTypes={activityTypes}
            statuses={statuses}
            priorities={priorities}
            showFilters={false}
          />
        </>
      )}

      {activeTab === 'profile' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Profile Verification Requests</h2>
              
              {/* Profile search and filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    value={profileSearchTerm}
                    onChange={(e) => {
                      setProfileSearchTerm(e.target.value);
                      // Trigger immediate filtering
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile verifications table */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProfileVerifications.map((verification) => (
                  <tr key={verification.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{verification.studentName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{verification.studentEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof verification.submittedAt === 'string' 
                          ? formatDate(verification.submittedAt) 
                          : String(verification.submittedAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {typeof verification.submittedAt === 'string' 
                          ? formatTime(verification.submittedAt) 
                          : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={verification.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {verification.status === 'pending' ? (
                        <button
                          onClick={() => handleProfileVerificationReview(verification)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {/* Verification Review Modal - existing modal for activities */}
      <VerificationReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onApprove={(id, feedback, rating) => {
          handleApproveVerification(id, feedback);
        }}
        onReject={(id, reason) => {
          handleRejectVerification(id, reason);
        }}
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
                      {typeof currentProfileVerification.submittedAt === 'string' ? formatDate(currentProfileVerification.submittedAt) : String(currentProfileVerification.submittedAt)}
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

function VerificationList({
  verificationRequests,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  priorityFilter,
  setPriorityFilter,
  selectedVerification,
  setSelectedVerification,
  handleReview,
  StatusBadge,
  PriorityBadge,
  formatDate,
  activityTypes,
  statuses,
  priorities,
  showFilters = true
}: {
  verificationRequests: VerificationRequest[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  priorityFilter: string;
  setPriorityFilter: (value: string) => void;
  selectedVerification: number | null;
  setSelectedVerification: (id: number | null) => void;
  handleReview: (request: VerificationRequest) => void;
  StatusBadge: React.FC<{status: 'pending' | 'approved' | 'rejected'}>;
  PriorityBadge: React.FC<{priority: string}>;
  formatDate: (date: string) => string;
  activityTypes: string[];
  statuses: string[];
  priorities: string[];
  showFilters?: boolean;
}) {
  // Helper function to safely display dates
  const safeFormatDate = (dateString: string | number | undefined): string => {
    if (!dateString) return '';
    if (typeof dateString === 'string') {
      return formatDate(dateString);
    }
    return String(dateString);
  };

  return (
    <>
      {showFilters && (
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
      )}
      
      {/* Verification List */}
      <div className="space-y-6">
        {verificationRequests.length > 0 ? (
          verificationRequests.map((request) => (
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
                      Submitted: {safeFormatDate(request.submittedAt)}
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
                      {safeFormatDate(request.activity.date)}
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
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No verification requests found matching your filters.</p>
          </div>
        )}
      </div>
    </>
  );
} 