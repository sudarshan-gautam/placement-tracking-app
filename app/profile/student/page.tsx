'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Camera, Upload, Edit, Award, BookOpen, FileText, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Radar } from 'recharts';

// Consistent date formatter to prevent hydration errors
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '/placeholder-profile.jpg');
  const [videoUrl, setVideoUrl] = useState(user?.videoUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [qualifications, setQualifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [jobInterests, setJobInterests] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    qualifications: true,
    skills: true,
    jobInterests: true,
  });
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user's qualifications
        const qualificationsRes = await fetch(`/api/student/${user?.id}/qualifications`);
        const qualificationsData = await qualificationsRes.json();
        setQualifications(qualificationsData.qualifications || []);

        // Fetch user's skills
        const skillsRes = await fetch(`/api/student/${user?.id}/skills`);
        const skillsData = await skillsRes.json();
        setSkills(skillsData.skills || []);

        // Fetch user's job interests
        const jobInterestsRes = await fetch(`/api/student/${user?.id}/job-interests`);
        const jobInterestsData = await jobInterestsRes.json();
        setJobInterests(jobInterestsData.jobInterests || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    });
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch(`/api/student/${user?.id}/profile-image`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setProfileImage(data.imageUrl);
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading profile image:', error);
        alert('Failed to upload profile image');
      }
    }
  };

  const handleVideoUploadClick = () => {
    videoInputRef.current?.click();
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('video', file);

      try {
        const response = await fetch(`/api/student/${user?.id}/video`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setVideoUrl(data.videoUrl);
          alert('Video uploaded successfully!');
        } else {
          throw new Error('Failed to upload video');
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video');
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/student/${user?.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio }),
      });

      if (response.ok) {
        setIsEditingProfile(false);
        alert('Profile saved successfully!');
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
        <p className="text-gray-600">Manage your personal information and track your development</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
              <button 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Edit className="h-4 w-4 mr-1" />
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
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
                <h2 className="text-xl font-bold">{user?.name || 'User Name'}</h2>
                <p className="text-gray-500">Student</p>
                
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
                  <h3 className="text-sm font-medium mb-1">Email</h3>
                  <p className="text-gray-700">{user?.email || 'email@example.com'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Bio</h3>
                  {isEditingProfile ? (
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-700">{bio}</p>
                  )}
                </div>
                {isEditingProfile && (
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Profile
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between pb-2 cursor-pointer"
              onClick={() => toggleSection('qualifications')}
            >
              <CardTitle className="text-xl font-bold">Qualifications</CardTitle>
              {expandedSections.qualifications ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </CardHeader>
            {expandedSections.qualifications && (
              <CardContent>
                <div className="space-y-4">
                  {qualifications.map((qualification: any) => (
                    <div key={qualification.id} className="flex items-start">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{qualification.title}</h3>
                        <p className="text-sm text-gray-500">{qualification.institution}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(qualification.date)}
                          {qualification.verified && (
                            <span className="ml-2 text-green-600 text-xs">✓ Verified</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link 
                    href="/qualifications"
                    className="block text-center py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 mt-4"
                  >
                    Add Qualification
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column - Skills and Job Interests */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between pb-2 cursor-pointer"
              onClick={() => toggleSection('skills')}
            >
              <CardTitle className="text-xl font-bold">Skills & Development</CardTitle>
              {expandedSections.skills ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </CardHeader>
            {expandedSections.skills && (
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Skills Comparison</h3>
                  <p className="text-sm text-gray-500 mb-4">Compare your self-assessment with your mentor's evaluation</p>
                  <div className="h-80 w-full">
                    {/* Radar chart would go here - using a placeholder for now */}
                    <div className="bg-gray-100 h-full rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Radar chart showing skills comparison</p>
                        <p className="text-sm text-gray-500">Self-assessment vs. Mentor evaluation</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Development Actions</h3>
                  <Link 
                    href="/action-plan"
                    className="block text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Action Plan
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between pb-2 cursor-pointer"
              onClick={() => toggleSection('jobInterests')}
            >
              <CardTitle className="text-xl font-bold">Job Interests & Alignment</CardTitle>
              {expandedSections.jobInterests ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </CardHeader>
            {expandedSections.jobInterests && (
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Role Alignment</h3>
                  <p className="text-sm text-gray-500 mb-4">See how your profile matches with your job interests</p>
                  <div className="space-y-4">
                    {jobInterests.map((job: any) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{job.title}</h4>
                          <span className="text-sm font-medium">
                            Match: <span className="text-blue-600">{job.match}%</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${job.match}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Link 
                            href={`/jobs/${job.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link 
                    href="/jobs"
                    className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Browse Jobs
                  </Link>
                  <Link 
                    href="/profile/cv"
                    className="flex-1 text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Generate CV
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/profile/cv"
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Generate CV</span>
                  </div>
                </Link>
                <Link 
                  href="/profile/cover-letter"
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-500" />
                    <span>Generate Cover Letter</span>
                  </div>
                </Link>
                <Link 
                  href="/documents"
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-500" />
                    <span>My Documents</span>
                  </div>
                </Link>
                <Link 
                  href="/documents/upload"
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-orange-500" />
                    <span>Upload Document</span>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 