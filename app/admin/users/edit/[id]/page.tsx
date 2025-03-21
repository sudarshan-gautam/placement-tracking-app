'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, UserX, Shield, User, Check } from 'lucide-react';

// Sample user data (in a real app, this would come from an API)
const usersData = [
  { 
    id: '1', 
    name: 'John Doe', 
    email: 'admin@gmail.com', 
    role: 'admin', 
    status: 'active', 
    dateJoined: '2023-02-15',
    lastActive: '2023-11-01' 
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    email: 'mentor@gmail.com', 
    role: 'mentor', 
    status: 'active', 
    dateJoined: '2023-03-20',
    lastActive: '2023-10-28',
  },
  { 
    id: '3', 
    name: 'Michael Johnson', 
    email: 'student@gmail.com', 
    role: 'student', 
    status: 'active', 
    dateJoined: '2023-05-10',
    lastActive: '2023-10-31',
  },
  { 
    id: '4', 
    name: 'Sarah Williams', 
    email: 'sarah@example.com', 
    role: 'student', 
    status: 'pending', 
    dateJoined: '2023-09-05',
    lastActive: '2023-09-05',
  },
  { 
    id: '5', 
    name: 'Robert Brown', 
    email: 'robert@example.com', 
    role: 'mentor', 
    status: 'inactive', 
    dateJoined: '2023-01-25',
    lastActive: '2023-08-15',
  },
];

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const userId = params.id;
  
  // Find user in our sample data
  const userToEdit = usersData.find(user => user.id === userId);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // If we found the user, initialize the form with their data
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status,
      });
    }
  }, [userToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to update the user
      console.log('Updating user:', userId, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSaveSuccess(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user not found
  if (!userToEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <UserX className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Link href="/admin/users" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit User</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            onClick={() => {
              if (confirm('Are you sure you want to delete this user?')) {
                alert('User would be deleted in a real application');
                router.push('/admin');
              }
            }}
          >
            <UserX className="h-4 w-4 mr-2" />
            Delete User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* User header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-white text-blue-600 flex items-center justify-center mr-4">
              {userToEdit.role === 'admin' ? (
                <Shield className="h-8 w-8" />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{userToEdit.name}</h2>
              <p className="text-blue-100">{userToEdit.email}</p>
              <div className="flex space-x-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                  {userToEdit.role.charAt(0).toUpperCase() + userToEdit.role.slice(1)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                  ${userToEdit.status === 'active' ? 'bg-green-200 text-green-800' : 
                    userToEdit.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                    'bg-gray-200 text-gray-800'}`}>
                  {userToEdit.status.charAt(0).toUpperCase() + userToEdit.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {saveSuccess && (
            <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              User information updated successfully
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="admin">Admin</option>
                <option value="mentor">Mentor</option>
                <option value="student">Student</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                Account Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link href="/admin" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 