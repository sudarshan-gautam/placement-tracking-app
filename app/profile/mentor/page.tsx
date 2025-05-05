'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Camera, Upload, Edit, Users, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function MentorProfilePage() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '/placeholder-profile.jpg');
  const [bio, setBio] = useState(user?.bio || '');
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    students: true,
    verifications: true
  });
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        // Fetch assigned students
        const studentsRes = await fetch(`/api/mentor/${user?.id}/students`);
        const studentsData = await studentsRes.json();
        setAssignedStudents(studentsData.students || []);

        // Fetch pending verifications
        const verificationsRes = await fetch(`/api/mentor/${user?.id}/verifications`);
        const verificationsData = await verificationsRes.json();
        setPendingVerifications(verificationsData.verifications || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching mentor data:', error);
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMentorData();
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
        const response = await fetch(`/api/mentor/${user?.id}/profile-image`, {
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

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/mentor/${user?.id}/profile`, {
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
        <h1 className="text-3xl font-bold text-gray-900">Mentor Profile</h1>
        <p className="text-gray-600">Manage your profile and track your students' progress</p>
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
                <p className="text-gray-500">Mentor</p>
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
        </div>

        {/* Right Column - Students and Verifications */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between pb-2 cursor-pointer"
              onClick={() => toggleSection('students')}
            >
              <CardTitle className="text-xl font-bold">Assigned Students</CardTitle>
              {expandedSections.students ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </CardHeader>
            {expandedSections.students && (
              <CardContent>
                <div className="space-y-4">
                  {assignedStudents.map((student: any) => (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.email}</p>
                          <p className="text-sm text-gray-500">
                            {student.course} - Year {student.year}
                          </p>
                        </div>
                        <Link 
                          href={`/mentor/students/${student.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Profile
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{student.activities.verified}</p>
                          <p className="text-xs text-gray-500">Verified</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{student.activities.pending}</p>
                          <p className="text-xs text-gray-500">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{student.activities.total}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link 
                    href="/mentor/students"
                    className="block text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View All Students
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader 
              className="flex flex-row items-center justify-between pb-2 cursor-pointer"
              onClick={() => toggleSection('verifications')}
            >
              <CardTitle className="text-xl font-bold">Pending Verifications</CardTitle>
              {expandedSections.verifications ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </CardHeader>
            {expandedSections.verifications && (
              <CardContent>
                <div className="space-y-4">
                  {pendingVerifications.map((verification: any) => (
                    <div key={verification.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{verification.student}</h3>
                          <p className="text-sm text-gray-500">{verification.activity}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(verification.date).toLocaleDateString()} - {verification.hours} hours
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-green-600 hover:text-green-800">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <Clock className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link 
                    href="/mentor/verifications"
                    className="block text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View All Verifications
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 