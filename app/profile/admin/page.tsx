'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Camera, Edit, Shield, Settings, Key, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '/placeholder-profile.jpg');
  const [bio, setBio] = useState(user?.bio || '');
  const [systemAccess, setSystemAccess] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    access: true
  });
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Fetch system access data
        const accessRes = await fetch(`/api/admin/${user?.id}/access`);
        const accessData = await accessRes.json();
        setSystemAccess(accessData.access || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAdminData();
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
        const response = await fetch(`/api/admin/${user?.id}/profile-image`, {
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
      const response = await fetch(`/api/admin/${user?.id}/profile`, {
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600">Manage your profile and system access</p>
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
                <p className="text-gray-500">Administrator</p>
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

        {/* Right Column - System Access */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader 
              className="flex flex-row items-center justify-between pb-2 cursor-pointer"
              onClick={() => toggleSection('access')}
            >
              <CardTitle className="text-xl font-bold">System Access</CardTitle>
              {expandedSections.access ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </CardHeader>
            {expandedSections.access && (
              <CardContent>
                <div className="space-y-4">
                  {systemAccess.map((access: any) => (
                    <div key={access.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{access.name}</h3>
                          <p className="text-sm text-gray-500">{access.description}</p>
                          <p className="text-sm text-gray-500">
                            Last accessed: {new Date(access.lastAccessed).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/admin/${access.name.toLowerCase().replace(' ', '-')}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Settings className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Link 
                      href="/admin/settings"
                      className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      System Settings
                    </Link>
                    <Link 
                      href="/admin/security"
                      className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      Security Settings
                    </Link>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 