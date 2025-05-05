'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import userProfiles from '@/lib/user-profiles';
import { getJobsForUser } from '@/lib/jobs-service';
import { User, UserRole, UserStatus } from '@/types/user';
import { UserCog, ArrowLeftRight, ShieldCheck, GraduationCap, UserCheck, Eye, EyeOff } from 'lucide-react';
import { getStudentsForMentor, isStudentAssignedToMentor } from '@/lib/mentor-student-service';

export default function UserSwitcher() {
  const { user, setUser } = useAuth();
  const [mode, setMode] = useState<'role' | 'user'>('role');
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize the original user on first load if we're in impersonation mode
  useEffect(() => {
    if (typeof window !== 'undefined' && !originalUser) {
      // Check if we're in impersonation mode
      const storedOriginalUser = localStorage.getItem('original_user');
      if (storedOriginalUser) {
        try {
          setOriginalUser(JSON.parse(storedOriginalUser));
          setMode('user');
        } catch (error) {
          console.error('Error parsing original user:', error);
          localStorage.removeItem('original_user');
        }
      }
    }
  }, [originalUser]);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleModeChange = (newMode: 'role' | 'user') => {
    setMode(newMode);
  };
  
  const getAvailableRoles = (): UserRole[] => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return ['admin', 'mentor', 'student'];
      case 'mentor':
        return ['mentor', 'student'];
      default:
        return [user.role];
    }
  };
  
  const getAvailableUsers = (): User[] => {
    if (!user) return [];
    
    // Convert user profiles to User type
    const convertedUsers = userProfiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as UserRole,
      status: 'active' as UserStatus,
      profileImage: profile.avatar || '/placeholder-profile.jpg'
    }));
    
    // Filter users based on current user's role
    if (user.role === 'admin') {
      // Admin can view as any user
      return convertedUsers;
    } else if (user.role === 'mentor') {
      // Mentor can only view as assigned students
      const mentorId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      const assignedStudentIds = getStudentsForMentor(mentorId);
      
      return convertedUsers.filter(u => {
        // Always include the current mentor
        if (u.id === user.id) return true;
        
        // Only include assigned students
        if (u.role === 'student') {
          const studentId = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id;
          return assignedStudentIds.includes(studentId);
        }
        
        return false;
      });
    }
    
    // Students can only view as themselves
    return convertedUsers.filter(u => u.id === user.id);
  };
  
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = event.target.value as UserRole;
    
    // Only proceed if role is different
    if (user?.role === selectedRole) return;
    
    // Store original user for returning later
    if (!originalUser) {
      setOriginalUser(user);
      localStorage.setItem('original_user', JSON.stringify(user));
    }
    
    // Find a default user with the selected role
    let targetUser: User | undefined;
    
    if (user?.role === 'admin' && selectedRole === 'mentor') {
      // Admin viewing as mentor - pick first mentor
      const mentorProfile = userProfiles.find(p => p.role === 'mentor');
      if (mentorProfile) {
        targetUser = {
          id: mentorProfile.id,
          name: mentorProfile.name,
          email: mentorProfile.email,
          role: 'mentor',
          status: 'active',
          profileImage: mentorProfile.avatar || '/placeholder-profile.jpg'
        };
      }
    } else if ((user?.role === 'admin' || user?.role === 'mentor') && selectedRole === 'student') {
      // Admin or mentor viewing as student - pick first student
      let studentProfile;
      
      if (user.role === 'mentor') {
        // For mentors, pick an assigned student
        const mentorId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        const assignedStudentIds = getStudentsForMentor(mentorId);
        
        studentProfile = userProfiles.find(p => {
          if (p.role !== 'student') return false;
          return assignedStudentIds.includes(p.id);
        });
      } else {
        // For admins, pick any student
        studentProfile = userProfiles.find(p => p.role === 'student');
      }
      
      if (studentProfile) {
        targetUser = {
          id: studentProfile.id,
          name: studentProfile.name,
          email: studentProfile.email,
          role: 'student',
          status: 'active',
          profileImage: studentProfile.avatar || '/placeholder-profile.jpg'
        };
      }
    } else if (selectedRole === 'admin') {
      // Anyone viewing as admin - pick first admin
      const adminProfile = userProfiles.find(p => p.role === 'admin');
      if (adminProfile) {
        targetUser = {
          id: adminProfile.id,
          name: adminProfile.name,
          email: adminProfile.email,
          role: 'admin',
          status: 'active',
          profileImage: adminProfile.avatar || '/placeholder-profile.jpg'
        };
      }
    }
    
    if (targetUser) {
      // Update user in auth context
      setUser(targetUser);
      
      // Save to localStorage with a flag to indicate this is temporary
      localStorage.setItem('user', JSON.stringify(targetUser));
      localStorage.setItem('is_temporary_user', 'true');
      
      // Load personalized jobs for this user
      const userId = typeof targetUser.id === 'string' ? parseInt(targetUser.id, 10) : targetUser.id;
      getJobsForUser(userId);
      
      console.log(`Switched to role: ${selectedRole}`);
    }
    
    // Close dropdown after selection
    setIsOpen(false);
  };
  
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProfileId = parseInt(event.target.value, 10);
    const selectedProfile = userProfiles.find(p => p.id === selectedProfileId);
    
    if (!selectedProfile) return;
    
    // Store original user for returning later if not already set
    if (!originalUser) {
      setOriginalUser(user);
      localStorage.setItem('original_user', JSON.stringify(user));
    }
    
    // Convert user profile to the User type expected by auth context
    const newUser: User = {
      id: selectedProfile.id,
      name: selectedProfile.name,
      email: selectedProfile.email,
      role: selectedProfile.role as UserRole,
      status: 'active' as UserStatus,
      profileImage: selectedProfile.avatar || '/placeholder-profile.jpg'
    };
    
    // Update user in auth context
    setUser(newUser);
    
    // Save to localStorage with a flag to indicate this is temporary
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('is_temporary_user', 'true');
    
    // Load personalized jobs for this user
    const profileId = typeof selectedProfile.id === 'string' ? parseInt(selectedProfile.id, 10) : selectedProfile.id;
    getJobsForUser(profileId);
    
    console.log(`Switched to user: ${selectedProfile.name} (${selectedProfile.role})`);
    
    // Close dropdown after selection
    setIsOpen(false);
  };
  
  const handleReturnToOriginal = () => {
    if (!originalUser) return;
    
    // Restore original user
    setUser(originalUser);
    localStorage.setItem('user', JSON.stringify(originalUser));
    
    // Clear temporary flags
    localStorage.removeItem('original_user');
    localStorage.removeItem('is_temporary_user');
    
    // Reset state
    setOriginalUser(null);
    setMode('role');
    
    // Load personalized jobs for the original user
    const userId = typeof originalUser.id === 'string' ? parseInt(originalUser.id, 10) : originalUser.id;
    getJobsForUser(userId);
    
    console.log(`Returned to original user: ${originalUser.name} (${originalUser.role})`);
    
    // Close dropdown after return
    setIsOpen(false);
  };
  
  if (!user) return null;
  
  const availableRoles = getAvailableRoles();
  const availableUsers = getAvailableUsers();
  const isImpersonating = !!originalUser;
  const canSwitchRoles = availableRoles.length > 1;
  
  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-4 w-4 text-red-600" />;
      case 'mentor':
        return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case 'student':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };
  
  // Main button for top nav
  const renderMainButton = () => {
    if (!canSwitchRoles) return null;
    
    // Only show Return button when impersonating
    if (isImpersonating) {
      return (
        <button
          onClick={handleReturnToOriginal}
          className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-amber-100 text-amber-800 hover:bg-amber-200"
        >
          <ArrowLeftRight className="h-4 w-4 mr-1.5" />
          Return to {originalUser?.name}
        </button>
      );
    }
    
    // Otherwise, don't render anything in the top nav
    return null;
  };
  
  return (
    <div className="relative">
      {renderMainButton()}
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-2 text-sm">
            <div className="flex items-center justify-between text-gray-700 mb-1">
              <div className="flex items-center">
                <UserCog className="mr-2 h-4 w-4" />
                <span>View {isImpersonating ? 'as Another User' : 'Mode'}</span>
              </div>
              
              {availableRoles.length > 1 && (
                <div className="flex space-x-2 text-xs">
                  <button 
                    onClick={() => handleModeChange('role')}
                    className={`px-2 py-0.5 rounded ${mode === 'role' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    By Role
                  </button>
                  <button 
                    onClick={() => handleModeChange('user')}
                    className={`px-2 py-0.5 rounded ${mode === 'user' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    By User
                  </button>
                </div>
              )}
            </div>
            
            {mode === 'role' && availableRoles.length > 1 ? (
              <select 
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" 
                onChange={handleRoleChange} 
                value={user.role}
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            ) : mode === 'user' ? (
              <select 
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" 
                onChange={handleUserChange} 
                value={user.id.toString()}
              >
                {availableUsers.map(availableUser => (
                  <option key={availableUser.id} value={availableUser.id.toString()}>
                    {availableUser.name} ({availableUser.role})
                  </option>
                ))}
              </select>
            ) : null}
            
            {isImpersonating && !renderMainButton() && (
              <button 
                onClick={handleReturnToOriginal}
                className="w-full mt-2 flex items-center justify-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                <ArrowLeftRight className="h-3 w-3 mr-1" />
                Return to {originalUser.name}
              </button>
            )}
          </div>
          <div className="border-t border-gray-200"></div>
        </div>
      )}
    </div>
  );
} 