'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Camera, Upload, Edit, Award, BookOpen, FileText, Briefcase, ChevronDown, ChevronUp, Mail, Phone, MapPin, Calendar, Building, Save, Shield, CheckCircle2, AlertCircle, X, Users, GraduationCap, School, Settings, BarChart, Globe, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { toast } from '@/components/ui/use-toast';
import { QualificationModal } from '@/components/qualification-modal';
import { getStudentsForMentor } from '@/lib/db-mentor-student-service';
import EducationForm from '@/app/components/profile/EducationForm';
import ExperienceForm from '@/app/components/profile/ExperienceForm';
import ProfileEducationView from '@/app/components/profile/ProfileEducationView';
import ProfileExperienceView from '@/app/components/profile/ProfileExperienceView';

// Verification status type
type VerificationStatus = 'unverified' | 'pending' | 'rejected' | 'verified';

// Interface for verification rejection
interface VerificationRejection {
  reason: string;
  date: string;
}

// Define types for data structures
interface JobInterest {
  id: number;
  title: string;
  match: number;
}

interface Qualification {
  id: number;
  title: string;
  institution: string;
  date: string;
  verified: boolean;
}

interface MentorStudent {
  id: number;
  name: string;
  email: string;
  status: string;
  progress: number;
}

interface SkillData {
  subject: string;
  self: number;
  mentor: number;
  fullMark: number;
  years_experience: number;
}

// Initialize empty arrays for state instead of using constants
const jobInterests: JobInterest[] = [];
const qualifications: Qualification[] = [];
const mentorStudents: MentorStudent[] = [];
const studentSkillsData: SkillData[] = [];

// Consistent date formatter to prevent hydration errors
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Helper function to convert skill level to numeric score for chart
const convertLevelToScore = (level: string): number => {
  switch (level) {
    case 'beginner': return 25;
    case 'intermediate': return 50;
    case 'advanced': return 75;
    case 'expert': return 100;
    default: return 0;
  }
};

// Helper function to get readable label for skill level
const getSkillLevelLabel = (level: number): string => {
  if (level <= 25) return 'Beginner';
  if (level <= 50) return 'Intermediate';
  if (level <= 75) return 'Advanced';
  return 'Expert';
};

// Helper function to convert numeric skill level to text
const getSkillLevelText = (level: number): string => {
  if (level <= 25) return 'beginner';
  if (level <= 50) return 'intermediate';
  if (level <= 75) return 'advanced';
  return 'expert';
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSections, setEditingSections] = useState({
    basicInfo: false,
    contactInfo: false,
    biography: false,
    education: false,
    socialMedia: false
  });
  
  // Added social media state
  const [socialMedia, setSocialMedia] = useState({
    website: '',
    linkedin: '',
    twitter: ''
  });
  
  const [studentSkillsData, setStudentSkillsData] = useState<SkillData[]>([]);
  const [jobInterests, setJobInterests] = useState<JobInterest[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [mentorStudents, setMentorStudents] = useState<MentorStudent[]>([]);
  const [profileImage, setProfileImage] = useState('/placeholder-profile.jpg');
  const [coverImage, setCoverImage] = useState('/placeholder-cover.jpg');
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
    phone: '',
    countryCode: '+44', // Default to UK
    secondary_email: '',
    address: '',
    dateOfBirth: '',
    institution: '',
    role: '',
    bio: '',
    education: '',  // From user_profiles table
    graduation_year: '', // From user_profiles table - changed from null to empty string
    preferred_job_type: '', // From user_profiles table
    preferred_location: '', // From user_profiles table
    years_experience: 0 // From user_skills
  });
  
  const [expandedSections, setExpandedSections] = useState({
    qualifications: true,
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
      
      // Set initial user data
          setPersonalDetails(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            role: user.role || prev.role
          }));
      
      // Load profile image from user data only as a fallback
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      }
      
      // Fetch user profile data from the database
      const fetchUserProfile = async () => {
        try {
          // Get token and ensure it's valid
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No authentication token found in localStorage');
            toast({
              title: "Authentication Error",
              description: "Please log in again to view your profile",
              variant: "destructive"
            });
            return;
          }
          
          // Check basic token format
          if (!token.includes('.') || token.split('.').length !== 3) {
            console.error('Invalid token format in localStorage');
            localStorage.removeItem('token'); // Clear invalid token
            toast({
              title: "Authentication Error",
              description: "Your session is invalid. Please log in again.",
              variant: "destructive"
            });
            return;
          }
          
          console.log(`Fetching profile data from /api/${user.role}/${user.id}/profile`);
          const response = await fetch(`/api/${user.role}/${user.id}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const profileData = await response.json();
            console.log('Profile data received:', profileData);
            
            // Update personal details with database data
            setPersonalDetails(prev => ({
              ...prev,
              name: profileData.name || prev.name,
              email: profileData.email || prev.email,
              role: profileData.role || prev.role,
              bio: profileData.bio || prev.bio,
              education: profileData.education || prev.education,
              graduation_year: profileData.graduation_year || prev.graduation_year,
              preferred_job_type: profileData.preferred_job_type || prev.preferred_job_type,
              preferred_location: profileData.preferred_location || prev.preferred_location,
              // Parse phone to separate country code and number if it exists
              ...(profileData.phone && profileData.phone.startsWith('+') 
                ? {
                    countryCode: profileData.phone.substring(0, profileData.phone.indexOf(' ') > 0 ? 
                      profileData.phone.indexOf(' ') : 3),
                    phone: profileData.phone.substring(profileData.phone.indexOf(' ') > 0 ? 
                      profileData.phone.indexOf(' ') + 1 : 3)
                  }
                : {
                    phone: profileData.phone || prev.phone,
                    countryCode: prev.countryCode
                  }
              ),
              secondary_email: profileData.secondary_email || prev.secondary_email
            }));
            
            // Update social media data if available
            if (profileData.social_media) {
              try {
                // If social_media is stored as a JSON string, parse it
                const socialMediaData = typeof profileData.social_media === 'string' 
                  ? JSON.parse(profileData.social_media) 
                  : profileData.social_media;
                
                setSocialMedia({
                  website: socialMediaData.website || '',
                  linkedin: socialMediaData.linkedin || '',
                  twitter: socialMediaData.twitter || ''
                });
                
                console.log('Loaded social media data:', socialMediaData);
            } catch (error) {
                console.error('Error parsing social media data:', error);
              }
            }
            
            // Load profile image if available
            if (profileData.profileImage) {
              setProfileImage(profileData.profileImage);
            } else if (profileData.profile_image) {
              setProfileImage(profileData.profile_image);
            }
            
            // Load cover image if available
            if (profileData.cover_image) {
              setCoverImage(profileData.cover_image);
            }
          } else {
            console.error('Failed to fetch profile data:', response.status);
            toast({
              title: "Error",
              description: "Failed to load profile data",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
          toast({
            title: "Error",
            description: "An unexpected error occurred while loading your profile",
            variant: "destructive"
          });
        }
      };
      
      fetchUserProfile();
      
      // Fetch user skills data
      const fetchUserSkills = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No authentication token found in localStorage');
            return;
          }
          
          const response = await fetch(`/api/skills/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const skillsData = await response.json();
            console.log('Skills data received:', skillsData);
            
            if (skillsData && Array.isArray(skillsData)) {
              // Transform skills data for radar chart
              const formattedSkills = skillsData.map((skill: any) => {
                // Use helper function to convert text level to numeric score
                const selfScore = convertLevelToScore(skill.level || 'intermediate');
                // Create a simulated mentor score that's slightly different
                const mentorScore = Math.max(20, selfScore - 10);
                
                return {
                  subject: skill.skill || '',
                  self: selfScore,
                  mentor: mentorScore,
                  fullMark: 100,
                  years_experience: skill.years_experience || 0
                };
              });
              
              setStudentSkillsData(formattedSkills);
            } else {
              console.error('Skills data is not an array:', skillsData);
              setStudentSkillsData([]);
            }
          } else {
            console.error('Failed to fetch skills data:', response.status);
            setStudentSkillsData([]);
          }
        } catch (error) {
          console.error('Error fetching skills data:', error);
          setStudentSkillsData([]);
        }
      };
      
      // Fetch other data based on user role
      if (user.role === 'student') {
        fetchUserSkills();
        
        // Fetch job interests
        // TODO: Replace with actual API call
        const sampleJobs = [
          { id: 1, title: 'Software Developer', match: 85 },
          { id: 2, title: 'UX Designer', match: 75 }
        ];
        setJobInterests(sampleJobs);
      } else if (user.role === 'mentor') {
        fetchUserSkills();
        
        // Fetch assigned students for mentors
        const fetchMentorStudents = async () => {
          try {
            if (!user || !user.id) {
              console.error('User or user ID is not available');
              return;
            }
            
            console.log('Fetching students for mentor ID:', user.id);
            
            // Use the service function instead of direct API call
            const studentsData = await getStudentsForMentor(user.id);
            
            console.log('Raw mentor students data received:', JSON.stringify(studentsData, null, 2));
            
            if (Array.isArray(studentsData) && studentsData.length > 0) {
              // Transform the data to match our expected format
              const formattedStudents = studentsData.map(student => {
                // Make sure we're extracting the right fields based on the API response
                const formattedStudent = {
                  id: student.assignment_id || 0,
                  name: student.student_name || '',
                  email: student.student_email || '',
                  status: 'Active',  // Default status
                  progress: Math.floor(Math.random() * 100) // Simulated progress for now
                };
                
                console.log('Formatted student:', formattedStudent);
                return formattedStudent;
              });
              
              console.log('All formatted students:', formattedStudents);
              setMentorStudents(formattedStudents);
            } else {
              // If no data or empty array, reset the state
              console.log('No students found or empty array received');
              setMentorStudents([]);
            }
          } catch (error) {
            console.error('Error fetching mentor students:', error);
            // Don't use fallback data so we can see the actual issue
            setMentorStudents([]);
          }
        };
        
        fetchMentorStudents();
      } else if (user.role === 'admin') {
        fetchUserSkills();
      }
      
      // Fetch qualifications for all users
      // TODO: Replace with actual API call
      const sampleQualifications = [
        { id: 1, title: 'Teaching Certificate', institution: 'Education Board', date: '2021-05-15', verified: true },
        { id: 2, title: 'First Aid Training', institution: 'Red Cross', date: '2022-01-20', verified: false }
      ];
      setQualifications(sampleQualifications);
    }
  }, [user, updateUser]);

  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalDetails({
      ...personalDetails,
      [name]: value
    });
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number format
  const isValidPhone = (phone: string, countryCode: string): boolean => {
    // Remove any non-digit characters except the plus sign
    const cleanedPhone = phone.replace(/[^\d]/g, '');
    const cleanedCountryCode = countryCode.trim();
    
    // Basic validation - at least 6 digits
    if (cleanedPhone.length < 6) {
      return false;
    }
    
    // Must have a valid country code starting with +
    if (!cleanedCountryCode || !cleanedCountryCode.startsWith('+')) {
      return false;
    }
    
    return true;
  };

  const handleSaveProfile = async () => {
    try {
      // Validate email format
      if (!isValidEmail(personalDetails.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }
      
      // Validate phone number format
      if (personalDetails.phone && !isValidPhone(personalDetails.phone, personalDetails.countryCode)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number",
          variant: "destructive"
        });
        return;
      }
      
      // Validate secondary email if provided
      if (personalDetails.secondary_email && !isValidEmail(personalDetails.secondary_email)) {
        toast({
          title: "Invalid Secondary Email",
          description: "Please enter a valid secondary email address",
          variant: "destructive"
        });
        return;
      }
      
      // Format full phone number
      const formattedPhone = personalDetails.phone 
        ? `${personalDetails.countryCode} ${personalDetails.phone}` 
        : '';
      
      // Prepare profile data including social media but without biography
      const profileData = {
        name: personalDetails.name,
        email: personalDetails.email,
        bio: personalDetails.bio,
        education: personalDetails.education,
        graduation_year: personalDetails.graduation_year,
        preferred_job_type: personalDetails.preferred_job_type,
        preferred_location: personalDetails.preferred_location,
        phone: formattedPhone,
        secondary_email: personalDetails.secondary_email,
        social_media: socialMedia
      };
      
      console.log('Saving profile data:', profileData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found in localStorage');
        toast({
          title: "Authentication Error",
          description: "Please log in again to update your profile",
          variant: "destructive"
        });
        return;
      }
      
      // Save profile data to the server - changed from PUT to PATCH
      const response = await fetch(`/api/${user?.role}/${user?.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      let profileUpdateSuccessful = response.ok;
      let errorMessage = '';
      
      if (!response.ok) {
        const errorData = await response.json();
        errorMessage = errorData.error || 'Failed to update profile';
        console.error('Error updating profile:', errorMessage);
      }
      
      // Also save skills data if there are any
      let skillsUpdateSuccessful = true;
      if (studentSkillsData.length > 0 && user) {
        try {
          // Clean up empty skills
          const validSkills = studentSkillsData.filter(skill => 
            skill.subject && skill.subject.trim() !== ''
          );
          
          if (validSkills.length > 0) {
            // Prepare skills data for API
            const skillsData = validSkills.map(skill => ({
              user_id: user.id,
              skill: skill.subject,
              level: getSkillLevelText(skill.self),
              years_experience: skill.years_experience
            }));
            
            // Save skills data
            const skillsResponse = await fetch(`/api/skills/${user.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(skillsData)
            });
            
            if (!skillsResponse.ok) {
              const skillsErrorData = await skillsResponse.json();
              console.error('Error saving skills data:', skillsErrorData);
              skillsUpdateSuccessful = false;
              if (!errorMessage) {
                errorMessage = skillsErrorData.error || 'Failed to update skills';
              }
            }
          }
        } catch (error) {
          console.error('Error saving skills data:', error);
          skillsUpdateSuccessful = false;
          if (!errorMessage) {
            errorMessage = error instanceof Error ? error.message : 'Unknown error updating skills';
          }
        }
      }
      
      if (profileUpdateSuccessful && skillsUpdateSuccessful) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated"
        });
        
        // Update user state with new data
        updateUser({
          ...user!,
          name: personalDetails.name,
          email: personalDetails.email,
        });
        
        // Reset edit mode
        setEditingSections({
          basicInfo: false,
          contactInfo: false,
          biography: false,
          education: false,
          socialMedia: false
        });
        
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Error Updating Profile",
          description: errorMessage || "An error occurred while updating your profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      // Create a local preview of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Set a temporary preview
          const imageData = e.target.result as string;
          setProfileImage(imageData);
        }
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);

      // Get stored token
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Call the appropriate API endpoint based on user role
      const uploadUrl = `/api/${user.role}/${user.id}/profile-image`;
      console.log("Uploading image to:", uploadUrl);
      
      fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Server response:', response.status, text);
            throw new Error(`Failed to upload image: ${response.status} ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        // Instead of updating user object, only update UI
        setProfileImage(data.imageUrl);
        
        // Also keep the localStorage updated for backward compatibility
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            // Don't update profileImage here anymore
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            console.error('Error updating user in localStorage:', error);
          }
        }

        // Update personal details
        setPersonalDetails(prev => ({
          ...prev,
          profileImage: data.imageUrl
        }));
          
      toast({
          title: "Profile image updated",
          description: "Your profile image has been updated successfully"
      });
      })
      .catch(error => {
        console.error('Error uploading profile image:', error);
      toast({
        title: "Error",
          description: error.message || "Failed to upload profile image",
        variant: "destructive"
        });
        
        // Restore previous image if upload fails
        if (user.profileImage) {
          setProfileImage(user.profileImage);
        } else {
          setProfileImage('/placeholder-profile.jpg');
        }
      });
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
    
    // Common skills section for all roles
    const skillsSection = (
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
          onClick={() => toggleSection('qualifications')}
            >
              <CardTitle className="text-xl font-bold">Skills & Development</CardTitle>
          <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.qualifications ? 'rotate-180' : ''}`} />
            </CardHeader>
            
        {expandedSections.qualifications && (
              <CardContent>
            <h3 className="text-lg font-medium mb-4">Skills Overview</h3>
            <p className="text-gray-600 text-sm mb-4">Your skills levels and comparisons</p>
                  
            {studentSkillsData.length > 0 ? (
              <>
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
                
                {/* Detailed Skills List */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">My Skills</h3>
                <div className="space-y-4">
                    {studentSkillsData.map((skill, index) => (
                      <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{skill.subject}</h4>
                          <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {getSkillLevelLabel(skill.self)}
                        </span>
                      </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${skill.self}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Experience: {skill.years_experience} {skill.years_experience === 1 ? 'year' : 'years'}</span>
                          <span>Self Assessment: {skill.self}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </>
            ) : (
              <div className="text-center p-8 text-gray-500">
                <BarChart className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No skills data available</p>
                <p className="text-sm mt-2">Add skills to see your development radar</p>
              </div>
            )}
              </CardContent>
            )}
          </Card>
    );

    // Role-specific sections
    if (user.role === 'student') {
      return (
        <>
          {skillsSection}
          
          {/* Job Interests */}
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => toggleSection('qualifications')}
            >
              <CardTitle className="text-xl font-bold">Job Interests</CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.qualifications ? 'rotate-180' : ''}`} />
            </CardHeader>
            
            {expandedSections.qualifications && (
              <CardContent>
                <h3 className="text-lg font-medium mb-4">Job Match Analysis</h3>
                <p className="text-gray-600 text-sm mb-4">Jobs that match your skills and preferences</p>
                
                {jobInterests.length > 0 ? (
                <div className="space-y-4">
                    {jobInterests.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">{job.title}</h4>
                          <span className="text-green-600 font-semibold">{job.match}% Match</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${job.match}%` }}
                          ></div>
                      </div>
                    </div>
                  ))}
                  
                    <button className="w-full mt-4 py-2 text-center text-blue-600 hover:text-blue-800 font-medium">
                      View All Job Matches
                  </button>
                </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p>No job interests added yet</p>
                    <p className="text-sm mt-2">Add your preferences to see matched jobs</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Qualifications */}
          <Card>
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => toggleSection('qualifications')}
            >
              <div className="flex items-center">
                <CardTitle className="text-xl font-bold">Qualifications & Certifications</CardTitle>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQualificationModal(true);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <Award className="h-4 w-4" />
                </button>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.qualifications ? 'rotate-180' : ''}`} />
            </CardHeader>
            
            {expandedSections.qualifications && (
              <CardContent>
                {qualifications.length > 0 ? (
                <div className="space-y-4">
                    {qualifications.map((qualification) => (
                      <div key={qualification.id} className="flex items-start border-b border-gray-100 pb-4">
                        <div className="flex-shrink-0 mr-3">
                        {qualification.verified ? (
                            <div className="bg-green-100 text-green-700 p-2 rounded-full">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="bg-gray-100 text-gray-400 p-2 rounded-full">
                              <Award className="h-5 w-5" />
                            </div>
                        )}
                      </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{qualification.title}</h4>
                            <span className="text-sm text-gray-500">{formatDate(qualification.date)}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{qualification.institution}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${qualification.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {qualification.verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p>No qualifications added yet</p>
                    <p className="text-sm mt-2">Add your qualifications to showcase your expertise</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </>
      );
    } else if (user.role === 'mentor') {
      return (
        <>
          {skillsSection}
          
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
                <h3 className="text-lg font-medium mb-4">Students under your mentorship</h3>
                
                {mentorStudents.length > 0 ? (
                <div className="space-y-4">
                    {mentorStudents.map((student) => (
                      <div key={student.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-gray-600 text-sm">{student.email}</p>
                            <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                              student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                          <div className="md:text-right">
                            <p className="text-sm text-gray-600">Progress</p>
                            <div className="w-full md:w-32 bg-gray-200 rounded-full h-2.5 mt-1">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                            </div>
                            <p className="text-sm mt-1">{student.progress}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                    <div className="flex justify-center mt-4">
                      <Link 
                        href="/mentor/students"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                    View All Students
                  </Link>
                </div>
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p>No assigned students</p>
                    <p className="text-sm mt-2">Students will appear here when they are assigned to you</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Verification Requests */}
          <Card className="mb-6">
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
    } else if (user.role === 'admin') {
      return (
        <>
          {skillsSection}
          
          {/* Admin Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Admin Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/users" className="block p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-700 p-3 rounded-full mr-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">User Management</h4>
                      <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
                    </div>
                    </div>
                  </Link>
                  
                <Link href="/admin/settings" className="block p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-purple-100 text-purple-700 p-3 rounded-full mr-3">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">System Settings</h4>
                      <p className="text-sm text-gray-600">Configure system preferences</p>
                    </div>
                    </div>
                  </Link>
                  
                <Link href="/admin/jobs" className="block p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-green-100 text-green-700 p-3 rounded-full mr-3">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Job Management</h4>
                      <p className="text-sm text-gray-600">Manage job listings and applications</p>
                    </div>
                    </div>
                  </Link>
                  
                <Link href="/admin/reports" className="block p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-orange-100 text-orange-700 p-3 rounded-full mr-3">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Reports & Analytics</h4>
                      <p className="text-sm text-gray-600">View system reports and statistics</p>
                    </div>
                    </div>
                  </Link>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
    
    return null;
  };

  const toggleEditSection = (section: string) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Handle cover image click
  const coverInputRef = useRef<HTMLInputElement>(null);
  const handleCoverImageClick = () => {
    coverInputRef.current?.click();
  };

  // Handle cover image change
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      // Similar to profile image upload but for cover image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          setCoverImage(imageData);
        }
      };
      reader.readAsDataURL(file);
      
      // Here you would implement the API call to save the cover image
      // For now just showing the preview
      toast({
        title: "Cover image updated",
        description: "Your cover image has been updated"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <p className="text-gray-600 mb-8">
        {user?.role === 'admin' && 'Manage your administrator profile and system settings'}
        {user?.role === 'mentor' && 'Manage your mentor profile and student assignments'}
        {user?.role === 'student' && 'Manage your personal information and track your development'}
      </p>
      
      {/* Cover and Profile Image Section */}
      <div className="relative mb-24">
        {/* Cover Image */}
        <div className="relative h-64 w-full bg-gray-200 rounded-lg overflow-hidden">
          <Image 
            src={coverImage} 
            alt="Cover" 
            width={1200} 
            height={300}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
              className="bg-white text-gray-800 font-bold py-2 px-4 rounded flex items-center"
              onClick={handleCoverImageClick}
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Cover
                    </button>
              </div>
          <input 
            type="file" 
            ref={coverInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleCoverImageChange}
          />
        </div>
        
        {/* Profile Image - Centered */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <Image 
                      src={profileImage} 
                      alt="Profile" 
                      width={128} 
                      height={128} 
                      className="object-cover w-full h-full"
                    />
              <button 
                className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
                      onClick={handleProfileImageClick}
                    >
                <Camera className="h-5 w-5 text-white" />
              </button>
                    </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
          </div>
                </div>
                
        {/* User Name and Role - Below Profile Image */}
        <div className="absolute -bottom-28 left-1/2 transform -translate-x-1/2 text-center">
          <h2 className="text-2xl font-bold flex items-center justify-center">
            {personalDetails.name}
            <span className="ml-2 text-gray-500 text-lg">[{user?.role}]</span>
            {verificationStatus === 'verified' && (
              <span className="ml-2 text-green-500"><CheckCircle2 className="h-5 w-5" /></span>
            )}
          </h2>
        </div>
        
        {/* Social Media and Contact Icons */}
        <div className="absolute -bottom-12 left-4 flex space-x-3">
          {personalDetails.phone && (
            <div 
              className="bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-blue-50" 
              title={`Call ${personalDetails.countryCode} ${personalDetails.phone}`}
              onClick={() => window.location.href = `tel:${personalDetails.countryCode}${personalDetails.phone}`}
            >
              <Phone className="h-5 w-5 text-gray-600" />
            </div>
          )}
          {socialMedia.website && (
            <a href={socialMedia.website} target="_blank" rel="noopener noreferrer" className="bg-white rounded-full p-2 shadow-md" title="Website">
              <Globe className="h-5 w-5 text-gray-600" />
            </a>
          )}
          {socialMedia.linkedin && (
            <a href={socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white rounded-full p-2 shadow-md" title="LinkedIn">
              <Linkedin className="h-5 w-5 text-gray-600" />
            </a>
          )}
          {socialMedia.twitter && (
            <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="bg-white rounded-full p-2 shadow-md" title="Twitter">
              <Twitter className="h-5 w-5 text-gray-600" />
            </a>
          )}
                </div>
                
        {/* Edit Profile Button */}
        <div className="absolute -bottom-12 right-4">
                      <button 
            onClick={() => {
              if (isEditingProfile) {
                handleSaveProfile();
              }
              setIsEditingProfile(!isEditingProfile);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            {isEditingProfile ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
                      </button>
                    </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Edit Profile</h2>
                    <button
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-500 hover:text-gray-700"
                    >
                <X size={24} />
                    </button>
                  </div>
                    
            {/* Tabbed Interface */}
            <div className="flex-1 overflow-auto">
              <div className="px-4 pt-4">
                <div className="mb-6 border-b overflow-x-auto">
                  <div className="flex space-x-1 min-w-max pb-1">
                      <button 
                      className={`py-2 px-4 font-medium border-b-2 whitespace-nowrap ${
                        activeTab === 'personal' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('personal')}
                    >
                      Personal Info
                      </button>
                      <button 
                      className={`py-2 px-4 font-medium border-b-2 whitespace-nowrap ${
                        activeTab === 'contact' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('contact')}
                    >
                      Contact Info
                      </button>
                      <button
                      className={`py-2 px-4 font-medium border-b-2 whitespace-nowrap ${
                        activeTab === 'education' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('education')}
                    >
                      Education
                      </button>
                      <button
                      className={`py-2 px-4 font-medium border-b-2 whitespace-nowrap ${
                        activeTab === 'experience' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('experience')}
                    >
                      Experience
                    </button>
                    <button
                      className={`py-2 px-4 font-medium border-b-2 whitespace-nowrap ${
                        activeTab === 'skills' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('skills')}
                    >
                      Skills
                    </button>
                    <button
                      className={`py-2 px-4 font-medium border-b-2 whitespace-nowrap ${
                        activeTab === 'social' 
                          ? 'border-blue-600 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('social')}
                    >
                      Social Media
                      </button>
                    </div>
                </div>
              
                {/* Tab Content */}
                <div className="px-1 space-y-6 pb-6">
                  {/* Personal Information Tab */}
                  {activeTab === 'personal' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                    <input 
                            type="text"
                            id="name"
                            name="name"
                            value={personalDetails.name}
                            onChange={handlePersonalDetailsChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Full Name"
                    />
                  </div>
                        
                        <div>
                          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                            Education
                          </label>
                          <input
                            type="text"
                            id="education"
                            name="education"
                            value={personalDetails.education}
                            onChange={handlePersonalDetailsChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your education background"
                          />
                    </div>
                        
                        <div>
                          <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700 mb-1">
                            Graduation Year
                          </label>
                          <input 
                            type="number"
                            id="graduation_year"
                            name="graduation_year"
                            value={personalDetails.graduation_year || ''}
                            onChange={handlePersonalDetailsChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Year of graduation"
                          />
                  </div>

                        <div>
                          <label htmlFor="preferred_job_type" className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Job Type
                          </label>
                <input 
                            type="text"
                            id="preferred_job_type"
                            name="preferred_job_type"
                            value={personalDetails.preferred_job_type || ''}
                            onChange={handlePersonalDetailsChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Full-time, Part-time, Remote"
                />
              </div>

                        <div className="md:col-span-2">
                          <label htmlFor="preferred_location" className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Location
                          </label>
                          <input
                            type="text"
                            id="preferred_location"
                            name="preferred_location"
                            value={personalDetails.preferred_location || ''}
                            onChange={handlePersonalDetailsChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your preferred work location"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={personalDetails.bio}
                          onChange={handlePersonalDetailsChange}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Short bio about yourself"
                        />
                      </div>
                    </div>
                  )}

                  {/* Contact Information Tab */}
                  {activeTab === 'contact' && (
              <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                      <input
                        type="email"
                            id="email"
                        name="email"
                        value={personalDetails.email}
                        onChange={handlePersonalDetailsChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Email Address"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="secondary_email" className="block text-sm font-medium text-gray-700 mb-1">
                            Secondary Email (Optional)
                          </label>
                          <input
                            type="email"
                            id="secondary_email"
                            name="secondary_email"
                            value={personalDetails.secondary_email}
                            onChange={handlePersonalDetailsChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Secondary Email Address"
                          />
              </div>
        </div>

                <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="flex">
                          <select
                            id="countryCode"
                            name="countryCode"
                            value={personalDetails.countryCode}
                            onChange={handlePersonalDetailsChange}
                            className="w-24 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="+1">+1 (US)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+61">+61 (AU)</option>
                            <option value="+91">+91 (IN)</option>
                            {/* Add more country codes as needed */}
                          </select>
                      <input
                        type="tel"
                            id="phone"
                        name="phone"
                        value={personalDetails.phone}
                        onChange={handlePersonalDetailsChange}
                            className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                 
                  {/* Education Tab */}
                  {activeTab === 'education' && (
                    <div className="space-y-4">
                      <EducationForm 
                        userId={user?.id ? String(user.id) : ''} 
                        onUpdate={() => {
                          // Callback when education is updated
                          toast({
                            title: 'Education Updated',
                            description: 'Your education history has been updated.'
                          });
                        }} 
                      />
                  </div>
                  )}
                  
                  {/* Experience Tab */}
                  {activeTab === 'experience' && (
                    <div className="space-y-4">
                      <ExperienceForm 
                        userId={user?.id ? String(user.id) : ''} 
                        onUpdate={() => {
                          // Callback when experience is updated
                          toast({
                            title: 'Experience Updated',
                            description: 'Your work experience has been updated.'
                          });
                        }} 
                      />
                </div>
                  )}
                  
                  {/* Skills Tab */}
                  {activeTab === 'skills' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">My Skills</h3>
                        <button
                          onClick={() => {
                            setStudentSkillsData([
                              ...studentSkillsData, 
                              {
                                subject: '',
                                self: 25,
                                mentor: 0,
                                fullMark: 100,
                                years_experience: 0
                              }
                            ]);
                          }}
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <span className="mr-1">+</span> Add Skill
                        </button>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">Manage your skills and experience levels</p>
                      
                      {studentSkillsData.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {studentSkillsData.map((skill, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-12 md:col-span-4 mb-2 md:mb-0">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Skill
                                  </label>
                      <input
                        type="text"
                                    value={skill.subject}
                                    onChange={(e) => {
                                      const updatedSkills = [...studentSkillsData];
                                      updatedSkills[index].subject = e.target.value;
                                      setStudentSkillsData(updatedSkills);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Skill name"
                                  />
                                </div>
                                
                                <div className="col-span-6 md:col-span-4">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Level
                                  </label>
                                  <select
                                    value={skill.self}
                                    onChange={(e) => {
                                      const updatedSkills = [...studentSkillsData];
                                      updatedSkills[index].self = parseInt(e.target.value);
                                      setStudentSkillsData(updatedSkills);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  >
                                    <option value="25">Beginner</option>
                                    <option value="50">Intermediate</option>
                                    <option value="75">Advanced</option>
                                    <option value="100">Expert</option>
                                  </select>
                                </div>
                                
                                <div className="col-span-5 md:col-span-3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Years
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={skill.years_experience}
                                    onChange={(e) => {
                                      const updatedSkills = [...studentSkillsData];
                                      updatedSkills[index].years_experience = parseInt(e.target.value);
                                      setStudentSkillsData(updatedSkills);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                
                                <div className="col-span-1 flex items-end justify-center pb-1">
                                  <button
                                    onClick={() => {
                                      const updatedSkills = studentSkillsData.filter((_, i) => i !== index);
                                      setStudentSkillsData(updatedSkills);
                                    }}
                                    className="text-red-500 hover:text-red-700 p-2"
                                    aria-label="Remove skill"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <p className="text-gray-500 mb-4">You haven't added any skills yet</p>
                          <button
                            onClick={() => {
                              setStudentSkillsData([{
                                subject: '',
                                self: 25,
                                mentor: 0,
                                fullMark: 100,
                                years_experience: 0
                              }]);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Add your first skill
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Social Media Tab */}
                  {activeTab === 'social' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                          Website URL
                        </label>
                        <div className="flex items-center">
                          <span className="bg-gray-100 p-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                            <Globe className="h-5 w-5" />
                          </span>
                          <input
                            type="url"
                            id="website"
                            name="website"
                            value={socialMedia.website}
                            onChange={(e) => setSocialMedia({...socialMedia, website: e.target.value})}
                            className="flex-1 p-2 border border-gray-300 rounded-r-md"
                            placeholder="https://yourwebsite.com"
                          />
                  </div>
                </div>
                
                <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                          LinkedIn URL
                        </label>
                  <div className="flex items-center">
                          <span className="bg-gray-100 p-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                            <Linkedin className="h-5 w-5" />
                          </span>
                      <input
                            type="url"
                            id="linkedin"
                            name="linkedin"
                            value={socialMedia.linkedin}
                            onChange={(e) => setSocialMedia({...socialMedia, linkedin: e.target.value})}
                            className="flex-1 p-2 border border-gray-300 rounded-r-md"
                            placeholder="https://linkedin.com/in/yourusername"
                          />
                  </div>
                  </div>
                
                <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter/X URL
                        </label>
                  <div className="flex items-center">
                          <span className="bg-gray-100 p-2 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                            <Twitter className="h-5 w-5" />
                          </span>
                      <input
                            type="url"
                            id="twitter"
                            name="twitter"
                            value={socialMedia.twitter}
                            onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})}
                            className="flex-1 p-2 border border-gray-300 rounded-r-md"
                            placeholder="https://twitter.com/yourusername"
                          />
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                  </div>
              
              <div className="flex justify-end mt-2 p-4 border-t sticky bottom-0 bg-white">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleSaveProfile();
                    setIsEditingProfile(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bio Section */}
      <div className="mt-32 mb-8 text-center max-w-2xl mx-auto">
        <p className="text-gray-700">{personalDetails.bio || 'No bio provided'}</p>
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Education Information - make it sticky */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{personalDetails.email}</span>
                  </div>
                  
                  {personalDetails.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{personalDetails.countryCode} {personalDetails.phone}</span>
                    </div>
                  )}
                  
                  {personalDetails.secondary_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{personalDetails.secondary_email} (Secondary)</span>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
            
            {/* Education Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Education</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.id ? (
                  <ProfileEducationView userId={String(user.id)} />
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <School className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>Sign in to view your education history</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Experience Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Experience</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.id ? (
                  <ProfileExperienceView userId={String(user.id)} />
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Briefcase className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>Sign in to view your work experience</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right Column - Role-specific content */}
        <div className="lg:col-span-2">
          {renderRoleSpecificContent()}
        </div>
      </div>
      
      {/* File Input for Document Upload */}
      <input 
        type="file" 
        ref={verificationDocRef} 
        className="hidden" 
        accept="image/*,.pdf"
        onChange={handleVerificationDocUpload}
      />
      
      {/* Qualification Modal */}
      {showQualificationModal && (
      <QualificationModal 
        isOpen={showQualificationModal}
        onClose={() => setShowQualificationModal(false)}
        onSave={handleSaveQualification}
      />
      )}
    </div>
  );
} 