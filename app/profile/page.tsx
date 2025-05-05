'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Camera, Upload, Edit, Award, BookOpen, FileText, Briefcase, ChevronDown, ChevronUp, Mail, Phone, MapPin, Calendar, Building, Save, Shield, CheckCircle2, AlertCircle, X, Users, GraduationCap, School, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from '@/components/ui/use-toast';
import { QualificationModal } from '@/components/qualification-modal';
import { studentSkillsData, jobInterestsData, qualificationsData, mentorStudentData } from '@/lib/sample-data';

// Verification status type
type VerificationStatus = 'unverified' | 'pending' | 'rejected' | 'verified';

// Interface for verification rejection
interface VerificationRejection {
  reason: string;
  date: string;
}

// Use sample data from imports
const jobInterests = jobInterestsData;
const qualifications = qualificationsData;
const mentorStudents = mentorStudentData;

// Consistent date formatter to prevent hydration errors
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState('/placeholder-profile.jpg');
  const [videoUrl, setVideoUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unverified');
  const [showVerificationRequest, setShowVerificationRequest] = useState(false);
  const [showRejectionDetails, setShowRejectionDetails] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState<VerificationRejection>({
    reason: '',
    date: ''
  });
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  
  // Personal details state
  const [personalDetails, setPersonalDetails] = useState({
    name: '',
    email: '',
    phone: '07123456789',
    address: 'London, UK',
    dateOfBirth: '1990-01-01',
    institution: 'University of London',
    role: 'student',
    bio: 'Passionate educator with 3 years of experience in primary education. Specializing in creative teaching methods and inclusive classroom environments.'
  });
  
  const [expandedSections, setExpandedSections] = useState({
    qualifications: true,
    skills: true,
    jobInterests: true,
    students: true
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const verificationDocRef = useRef<HTMLInputElement>(null);

  // Initialize personal details with user data when available
  useEffect(() => {
    if (user) {
      // Load verification status on component mount
      const savedVerificationStatus = localStorage.getItem(`verificationStatus-${user.email}`);
      if (savedVerificationStatus) {
        setVerificationStatus(savedVerificationStatus as VerificationStatus);
      } else if (user.role === 'admin') {
        // Admin users are automatically verified
        setVerificationStatus('verified');
        localStorage.setItem(`verificationStatus-${user.email}`, 'verified');
      }
      
      // Load rejection details if available
      const savedRejectionDetails = localStorage.getItem(`rejectionDetails-${user.email}`);
      if (savedRejectionDetails) {
        try {
          setRejectionDetails(JSON.parse(savedRejectionDetails));
        } catch (error) {
          console.error('Error parsing rejection details:', error);
        }
      }
      
      // Load profile data from localStorage - now user-specific
      const savedProfileData = localStorage.getItem(`profileData-${user.email}`);
      
      if (savedProfileData) {
        try {
          const parsedData = JSON.parse(savedProfileData);
          setPersonalDetails(parsedData);
          
          // If profile image is saved, use that
          if (parsedData.profileImage) {
            setProfileImage(parsedData.profileImage);
          }
        } catch (error) {
          console.error('Error parsing saved profile data:', error);
          
          // Fallback to user data from auth context
          setPersonalDetails(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            role: user.role || prev.role
          }));
        }
      } else {
        // No saved profile data, use user data from auth context
        setPersonalDetails(prev => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          role: user.role || prev.role
        }));
      }
      
      // Load profile image from user data if available and not already set from localStorage
      if (user.profileImage && !localStorage.getItem(`profileData-${user.email}`)) {
        setProfileImage(user.profileImage);
      }
    }
  }, [user]);

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    });
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          setProfileImage(imageData);
          
          // Always save the image immediately regardless of edit mode
          // This fixes the admin profile image upload issue
          
          // Save current profile image to localStorage to persist on refresh
          const currentProfileData = localStorage.getItem(`profileData-${user.email}`);
          
          if (currentProfileData) {
            try {
              const parsedData = JSON.parse(currentProfileData);
              parsedData.profileImage = imageData;
              localStorage.setItem(`profileData-${user.email}`, JSON.stringify(parsedData));
              // Also update persistent storage
              localStorage.setItem(`persistentProfileData-${user.email}`, JSON.stringify(parsedData));
            } catch (error) {
              console.error('Error updating profile image:', error);
            }
          } else {
            // Create new profile data if none exists
            const newProfileData = {
              ...personalDetails,
              profileImage: imageData
            };
            localStorage.setItem(`profileData-${user.email}`, JSON.stringify(newProfileData));
            // Also update persistent storage
            localStorage.setItem(`persistentProfileData-${user.email}`, JSON.stringify(newProfileData));
          }
          
          // Update user object directly with new profile image
          updateUser({
            profileImage: imageData
          });
          
          // Update user data in localStorage to simulate database update
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              userData.profileImage = imageData;
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
              console.error('Error updating user profile image:', error);
            }
          }
          
          toast({
            title: "Profile image updated",
            description: "Your profile image has been updated successfully"
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUploadClick = () => {
    videoInputRef.current?.click();
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the video to a server
      // For now, we'll just set a placeholder URL
      setVideoUrl('https://example.com/video.mp4');
      toast({
        title: "Video uploaded",
        description: "Your introduction video has been uploaded successfully"
      });
    }
  };

  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalDetails({
      ...personalDetails,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    // In a real app, you would save the profile data to a database
    try {
      // Simulate API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a complete profile data object to save
      const profileData = {
        ...personalDetails,
        profileImage // Store the profile image as well
      };
      
      // Save to localStorage for persistence between page refreshes - now user-specific
      localStorage.setItem(`profileData-${user?.email}`, JSON.stringify(profileData));
      
      // Also save to persistent storage to keep data after logout
      localStorage.setItem(`persistentProfileData-${user?.email}`, JSON.stringify(profileData));
      
      // Update auth context (in a real app, this would be part of the API response)
      if (user) {
        // Use the updateUser function from auth context to update the user in real-time
        updateUser({
          name: personalDetails.name,
          profileImage
        });
        
        // For backward compatibility, still update localStorage directly
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            userData.name = personalDetails.name;
            userData.profileImage = profileImage;
            
            // Save updated user back to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Trigger storage event to update other components
            // This will not work in the same window, but we'll use updateUser for that
            // This is for completeness in case other components listen to storage events
            window.dispatchEvent(new Event('storage'));
          } catch (error) {
            console.error('Error updating user data:', error);
          }
        }
      }
      
    setIsEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleVerificationDocClick = () => {
    verificationDocRef.current?.click();
  };
  
  const handleVerificationDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      // In a real app, you would upload the document to a server
      setVerificationStatus('pending');
      setShowVerificationRequest(false);
      
      // Save verification status to localStorage for persistence - user specific
      localStorage.setItem(`verificationStatus-${user.email}`, 'pending');
      
      // Create a new profile verification request in the admin system
      try {
        const profileVerifications = localStorage.getItem('profileVerifications');
        let verifications = profileVerifications ? JSON.parse(profileVerifications) : [];
        
        // Add new verification request
        verifications.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          studentId: user.id || Math.floor(Math.random() * 1000),
          studentName: user.name || personalDetails.name,
          studentEmail: user.email,
          submittedAt: new Date().toISOString(),
          status: 'pending',
          documentUrl: '/verifications/document.pdf' // Placeholder
        });
        
        localStorage.setItem('profileVerifications', JSON.stringify(verifications));
      } catch (error) {
        console.error('Error creating verification request:', error);
      }
      
      toast({
        title: "Verification requested",
        description: "Your verification documents have been submitted and are pending review"
      });
    }
  };
  
  // For demo purposes - functions to simulate admin actions
  const simulateVerificationApproval = () => {
    if (user) {
      setVerificationStatus('verified');
      localStorage.setItem(`verificationStatus-${user.email}`, 'verified');
      toast({
        title: "Verification approved",
        description: "Your account has been verified!"
      });
    }
  };
  
  const simulateVerificationRejection = () => {
    if (user) {
      const rejection: VerificationRejection = {
        reason: "The document provided was not clearly legible. Please upload a higher quality scan.",
        date: new Date().toISOString()
      };
      
      setRejectionDetails(rejection);
      setVerificationStatus('rejected');
      
      // Save to localStorage
      localStorage.setItem(`verificationStatus-${user.email}`, 'rejected');
      localStorage.setItem(`rejectionDetails-${user.email}`, JSON.stringify(rejection));
      
      toast({
        title: "Verification rejected",
        description: "Your verification request has been rejected",
        variant: "destructive"
      });
    }
  };
  
  const handleReapplyForVerification = () => {
    setShowVerificationRequest(true);
  };

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            Pending Verification
          </div>
        );
      case 'rejected':
        return (
          <button 
            onClick={() => setShowRejectionDetails(!showRejectionDetails)}
            className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium hover:bg-red-100"
          >
            <AlertCircle className="h-3 w-3" />
            Rejected - View Details
          </button>
        );
      default:
        return null;
    }
  };

  // Add a function to handle saving qualifications
  const handleSaveQualification = (qualificationData: {
    name: string;
    issuingOrganization: string;
    dateCompleted: string;
    expiryDate?: string;
    certificateFile?: File;
  }) => {
    // Here you would normally send this data to your API
    console.log('Saving qualification:', qualificationData);
    
    // Show success message
    toast({
      title: "Qualification Added",
      description: "Your qualification has been submitted for verification"
    });
    
    setShowQualificationModal(false);
  };

  // Rendering helper function to generate role-specific content
  const renderRoleSpecificContent = () => {
    if (!user) return null;
    
    // Student-specific content
    if (user.role === 'student') {
      return (
        <>
          {/* Skills & Development */}
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => toggleSection('skills')}
            >
              <CardTitle className="text-xl font-bold">Skills & Development</CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`} />
            </CardHeader>
            
            {expandedSections.skills && (
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Skills Comparison</h3>
                  <p className="text-gray-600 text-sm mb-4">Compare your self-assessment with your mentor's evaluation</p>
                  
                  <div className="aspect-square max-w-md mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={studentSkillsData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar
                          name="Self Assessment"
                          dataKey="self"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="Mentor Evaluation"
                          dataKey="mentor"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                        <RechartsTooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Development Actions</h3>
                  <Link href="/activities" className="block w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 text-center">
                    View My Activities
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Job Interests & Alignment */}
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => toggleSection('jobInterests')}
            >
              <CardTitle className="text-xl font-bold">Job Interests & Alignment</CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.jobInterests ? 'rotate-180' : ''}`} />
            </CardHeader>
            
            {expandedSections.jobInterests && (
              <CardContent>
                <div className="space-y-4">
                  {jobInterests.map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{job.title}</h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {job.match}% Match
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${job.match}%` }}></div>
                      </div>
                    </div>
                  ))}
                  
                  <Link href="/jobs" className="block text-blue-600 hover:text-blue-800 text-center mt-4">
                    View More Job Opportunities
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Qualifications */}
          <Card>
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => toggleSection('qualifications')}
            >
              <CardTitle className="text-xl font-bold">Qualifications</CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.qualifications ? 'rotate-180' : ''}`} />
            </CardHeader>
            
            {expandedSections.qualifications && (
              <CardContent>
                <div className="space-y-4">
                  {qualifications.map(qualification => (
                    <div key={qualification.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{qualification.title}</h3>
                          <p className="text-gray-500 text-sm">{qualification.institution}</p>
                          <p className="text-gray-500 text-sm">Issued: {formatDate(qualification.date)}</p>
                        </div>
                        {qualification.verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setShowQualificationModal(true)} 
                    className="block w-full py-2 px-4 border border-gray-300 text-center rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Add New Qualification
                  </button>
                </div>
              </CardContent>
            )}
          </Card>
        </>
      );
    }
    
    // Mentor-specific content
    if (user.role === 'mentor') {
      return (
        <>
          {/* Mentor Qualifications */}
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => toggleSection('qualifications')}
            >
              <CardTitle className="text-xl font-bold">Qualifications & Expertise</CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.qualifications ? 'rotate-180' : ''}`} />
            </CardHeader>
            
            {expandedSections.qualifications && (
              <CardContent>
                <div className="space-y-4">
                  {qualifications.map(qualification => (
                    <div key={qualification.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{qualification.title}</h3>
                          <p className="text-gray-500 text-sm">{qualification.institution}</p>
                          <p className="text-gray-500 text-sm">Issued: {formatDate(qualification.date)}</p>
                        </div>
                        {qualification.verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setShowQualificationModal(true)} 
                    className="block w-full py-2 px-4 border border-gray-300 text-center rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Add New Qualification
                  </button>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Assigned Students */}
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => toggleSection('students')}
            >
              <CardTitle className="text-xl font-bold">Assigned Students</CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.students ? 'rotate-180' : ''}`} />
            </CardHeader>
            
            {expandedSections.students && (
              <CardContent>
                <div className="space-y-4">
                  {mentorStudents.map(student => (
                    <div key={student.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-gray-500 text-sm">{student.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          student.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Link href="/mentor/students" className="block text-blue-600 hover:text-blue-800 text-center mt-4">
                    View All Students
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Verification Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Verification Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href="/mentor/verifications" 
                className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700"
              >
                View Pending Verifications
              </Link>
            </CardContent>
          </Card>
        </>
      );
    }
    
    // Admin-specific content
    if (user.role === 'admin') {
      return (
        <>
          {/* Admin Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Administrative Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Administrator Account
                  </h3>
                  <p className="text-sm text-blue-600 mt-2">
                    You have full administrative access to the system. Please ensure all actions comply with data protection regulations.
                  </p>
                  
                  {/* Admin verification badge */}
                  <div className="mt-3 flex items-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Automatically Verified Admin Account
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link 
                    href="/admin/users" 
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Users className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <h3 className="font-medium">User Management</h3>
                      <p className="text-sm text-gray-500">Manage user accounts</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/admin/verifications" 
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <CheckCircle2 className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <h3 className="font-medium">Verifications</h3>
                      <p className="text-sm text-gray-500">Review verification requests</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/admin/settings" 
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Settings className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <h3 className="font-medium">System Settings</h3>
                      <p className="text-sm text-gray-500">Configure system settings</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/admin" 
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <h3 className="font-medium">Admin Dashboard</h3>
                      <p className="text-sm text-gray-500">View system overview</p>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
    
    // Default content if role doesn't match any specific case
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">
          {user?.role === 'admin' ? 'Manage your administrator profile and system settings' :
           user?.role === 'mentor' ? 'Manage your mentor profile and student assignments' :
           'Manage your personal information and track your development'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
              <div className="flex gap-2">
                {isEditingProfile ? (
                  <>
                    <button
                      onClick={() => {
                        // Cancel changes by reloading data from localStorage or user
                        const savedProfileData = localStorage.getItem(`profileData-${user?.email}`);
                        if (savedProfileData) {
                          try {
                            const parsedData = JSON.parse(savedProfileData);
                            setPersonalDetails(parsedData);
                            if (parsedData.profileImage) {
                              setProfileImage(parsedData.profileImage);
                            }
                          } catch (error) {
                            console.error('Error parsing saved profile data:', error);
                          }
                        } else if (user) {
                          setPersonalDetails(prev => ({
                            ...prev,
                            name: user.name || prev.name,
                            email: user.email || prev.email,
                            role: user.role || prev.role
                          }));
                        }
                        setIsEditingProfile(false);
                      }}
                      className="text-gray-600 hover:text-gray-800 flex items-center"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  </>
                ) : (
              <button 
                    onClick={() => setIsEditingProfile(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                    Edit
              </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div 
                    className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
                    onClick={handleProfileImageClick}
                  >
                    <Image 
                      src={profileImage} 
                      alt="Profile" 
                      width={128} 
                      height={128} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {isEditingProfile && (
                    <div 
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer"
                      onClick={handleProfileImageClick}
                    >
                      <Camera className="h-4 w-4" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </div>
                
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="name"
                    value={personalDetails.name}
                    onChange={handlePersonalDetailsChange}
                    className="text-xl font-bold text-center border border-gray-300 rounded-md px-2 py-1 mb-1 w-full"
                  />
                ) : (
                  <h2 className="text-xl font-bold">{personalDetails.name}</h2>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-500 capitalize">{personalDetails.role}</p>
                  {getVerificationBadge()}
                </div>
                
                {/* Rejection details modal */}
                {showRejectionDetails && verificationStatus === 'rejected' && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md w-full">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-red-700 mb-1">Verification Rejected</h4>
                      <button 
                        onClick={() => setShowRejectionDetails(false)}
                        className="text-red-700 hover:text-red-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-red-600 mb-3">{rejectionDetails.reason}</p>
                    <p className="text-xs text-gray-500">
                      {rejectionDetails.date ? `Rejected on: ${new Date(rejectionDetails.date).toLocaleDateString()}` : ''}
                    </p>
                    <button
                      onClick={handleReapplyForVerification}
                      className="mt-2 text-xs bg-red-600 text-white rounded px-2 py-1 w-full"
                    >
                      Reapply for Verification
                    </button>
                  </div>
                )}
                
                {/* Only show verification request button for non-admin users */}
                {personalDetails.role !== 'admin' && (
                  <>
                    {verificationStatus === 'unverified' && !showVerificationRequest && (
                      <button 
                        onClick={() => setShowVerificationRequest(true)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Request verification
                      </button>
                    )}
                    
                    {verificationStatus === 'rejected' && !showVerificationRequest && !showRejectionDetails && (
                      <button 
                        onClick={handleReapplyForVerification}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Reapply for verification
                      </button>
                    )}
                  </>
                )}
                
                {showVerificationRequest && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md w-full">
                    <h4 className="text-sm font-medium text-blue-700 mb-1">Verify your identity</h4>
                    <p className="text-xs text-blue-600 mb-2">Upload an ID or educational document to verify your account</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleVerificationDocClick}
                        className="text-xs flex-1 bg-blue-600 text-white rounded px-2 py-1 flex items-center justify-center"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload document
                      </button>
                      <button
                        onClick={() => setShowVerificationRequest(false)}
                        className="text-xs flex-1 bg-gray-200 text-gray-700 rounded px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={verificationDocRef} 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleVerificationDocUpload}
                    />
                  </div>
                )}
                
                {videoUrl ? (
                  <div className="mt-4 w-full">
                    <h3 className="text-sm font-medium mb-2">Video Introduction</h3>
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600">Video uploaded</p>
                    </div>
                    {isEditingProfile && (
                      <button 
                        onClick={handleVideoUploadClick}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Replace video
                      </button>
                    )}
                  </div>
                ) : isEditingProfile ? (
                  <button 
                    onClick={handleVideoUploadClick}
                    className="mt-4 flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video Introduction
                  </button>
                ) : null}
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  className="hidden" 
                  accept="video/*"
                  onChange={handleVideoUpload}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Email</h3>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  {isEditingProfile ? (
                      <input
                        type="email"
                        name="email"
                        value={personalDetails.email}
                        onChange={handlePersonalDetailsChange}
                        className="border border-gray-300 rounded-md px-3 py-1 w-full"
                    />
                  ) : (
                      <p className="text-gray-700">{personalDetails.email}</p>
                )}
              </div>
        </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Phone</h3>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        name="phone"
                        value={personalDetails.phone}
                        onChange={handlePersonalDetailsChange}
                        className="border border-gray-300 rounded-md px-3 py-1 w-full"
                      />
                    ) : (
                      <p className="text-gray-700">{personalDetails.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Location</h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="address"
                        value={personalDetails.address}
                        onChange={handlePersonalDetailsChange}
                        className="border border-gray-300 rounded-md px-3 py-1 w-full"
                      />
                    ) : (
                      <p className="text-gray-700">{personalDetails.address}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Date of Birth</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditingProfile ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={personalDetails.dateOfBirth}
                        onChange={handlePersonalDetailsChange}
                        className="border border-gray-300 rounded-md px-3 py-1 w-full"
                      />
                    ) : (
                      <p className="text-gray-700">{formatDate(personalDetails.dateOfBirth)}</p>
                    )}
                  </div>
                  </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Institution</h3>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="institution"
                        value={personalDetails.institution}
                        onChange={handlePersonalDetailsChange}
                        className="border border-gray-300 rounded-md px-3 py-1 w-full"
                      />
                    ) : (
                      <p className="text-gray-700">{personalDetails.institution}</p>
                    )}
                  </div>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Role-specific content */}
        <div className="lg:col-span-2">
          {renderRoleSpecificContent()}
        </div>
      </div>
      
      {/* Add the QualificationModal */}
      <QualificationModal 
        isOpen={showQualificationModal}
        onClose={() => setShowQualificationModal(false)}
        onSave={handleSaveQualification}
      />
    </div>
  );
} 