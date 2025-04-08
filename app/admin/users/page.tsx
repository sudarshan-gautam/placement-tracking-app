'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, UserPlus, Filter, Edit, Trash2, CheckCircle, XCircle, Shield, 
  GraduationCap, Briefcase, ChevronDown, Download, Upload, Info, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'student';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

// Role descriptions for tooltips
const roleDescriptions = {
  admin: "Full access to all system features and user management",
  mentor: "Can review student activities and provide feedback",
  student: "Can log placements and submit verifications"
};

// Status descriptions for tooltips
const statusDescriptions = {
  active: "User can log in and use the system",
  pending: "Account created but not yet activated",
  inactive: "Account disabled or suspended"
};

// Status colors with better contrast
const statusStyles = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  inactive: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

// Role colors with better contrast
const roleStyles = {
  admin: {
    icon: 'text-red-600',
    bg: 'bg-red-50'
  },
  mentor: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  student: {
    icon: 'text-green-600',
    bg: 'bg-green-50'
  }
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportSelection, setExportSelection] = useState('all');
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    password: ''
  });
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: ''
  });
  const [addFormErrors, setAddFormErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });
  const router = useRouter();

  // Fetch users from the database
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        showToast('Failed to load users', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, router]);

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // For demonstration, we'll consider all fetched users as "active"
    // In a real app, you would have a status field in your user model
    const userStatus = user.status || 'active';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle checkbox selection
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user: User) => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    let updatedUsers = [...users];
    
    switch (action) {
      case 'activate':
        // In a real app, you would send API requests to update each user's status
        showToast('Bulk activation is not implemented yet', 'info');
        break;
      case 'deactivate':
        showToast('Bulk deactivation is not implemented yet', 'info');
        break;
      case 'delete':
        showToast('Bulk deletion is not implemented yet', 'info');
        break;
      default:
        break;
    }
    
    setUsers(updatedUsers);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Get role icon based on role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className={`${roleStyles.admin.icon} h-4 w-4`} />;
      case 'mentor':
        return <Briefcase className={`${roleStyles.mentor.icon} h-4 w-4`} />;
      case 'student':
        return <GraduationCap className={`${roleStyles.student.icon} h-4 w-4`} />;
      default:
        return null;
    }
  };

  // Get status indicator
  const getStatusIndicator = (status: string = 'active') => {
    const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.active;
    
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border}`}>
        {status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'pending' && <Info className="h-3 w-3 mr-1" />}
        {status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  // Get role-specific user details
  const getRoleSpecificDetails = (userData: User) => {
    if (userData.role === 'mentor') {
      return <span>{userData.assignedStudents || 0} assigned students</span>;
    } else if (userData.role === 'student') {
      const verified = userData.verifiedActivities || 0;
      const total = userData.completedActivities || 0;
      return <span>{total} activities ({verified} verified)</span>;
    }
    return null;
  };

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      show: true,
      message,
      type
    });
    
    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Validate edit form
  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: ''
    };
    
    if (!editFormData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // Handle edit user click
  const handleEditUser = (userData: User) => {
    setUserToEdit(userData);
    setEditFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status || 'active',
      password: ''
    });
    setFormErrors({
      name: '',
      email: ''
    });
    setShowEditModal(true);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setUserToEdit(null);
    setShowEditModal(false);
    setEditFormData({
      name: '',
      email: '',
      role: '',
      status: '',
      password: ''
    });
    setFormErrors({
      name: '',
      email: ''
    });
  };

  // Handle edit form changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (name === 'name' || name === 'email') {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle edit save
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userToEdit) {
      return;
    }
    
    try {
      const requestBody: {
        name: string;
        email: string;
        role: string;
        password?: string;
      } = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role
      };
      
      // Only include password in the request if it's been provided
      if (editFormData.password) {
        requestBody.password = editFormData.password;
      }
      
      const response = await fetch(`/api/admin/users/${userToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      const data = await response.json();
      
      // Update users array with the updated user
      setUsers(users.map((user: User) => 
        user.id === userToEdit.id ? data.user : user
      ));
      
      showToast('User updated successfully', 'success');
      handleEditCancel();
    } catch (error) {
      console.error('Error updating user:', error);
      showToast((error as Error).message || 'Failed to update user', 'error');
    }
  };

  // Handle delete user click
  const handleDeleteUser = (userData: User) => {
    setUserToDelete(userData);
    setShowDeleteModal(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!userToDelete) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      // Remove user from the users array
      setUsers(users.filter((user: User) => user.id !== userToDelete.id));
      
      showToast('User deleted successfully', 'success');
      handleDeleteCancel();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast((error as Error).message || 'Failed to delete user', 'error');
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  // Handle add user modal open
  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      status: 'active'
    });
    setAddFormErrors({
      name: '',
      email: '',
      password: ''
    });
    setShowAddModal(true);
  };

  // Handle add cancel
  const handleAddCancel = () => {
    setShowAddModal(false);
    setAddFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      status: 'active'
    });
    setAddFormErrors({
      name: '',
      email: '',
      password: ''
    });
  };

  // Handle add form changes
  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (name === 'name' || name === 'email' || name === 'password') {
      setAddFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate add form
  const validateAddForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: '',
      password: ''
    };
    
    if (!addFormData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!addFormData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(addFormData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!addFormData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (addFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setAddFormErrors(errors);
    return isValid;
  };

  // Handle add save
  const handleAddSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddForm()) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: addFormData.name,
          email: addFormData.email,
          password: addFormData.password,
          role: addFormData.role
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      const data = await response.json();
      
      // Add new user to the users array
      setUsers([data.user, ...users]);
      
      showToast('User added successfully', 'success');
      handleAddCancel();
    } catch (error) {
      console.error('Error creating user:', error);
      showToast((error as Error).message || 'Failed to create user', 'error');
    }
  };

  // Handle export users
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Handle export cancel
  const handleExportCancel = () => {
    setShowExportModal(false);
  };

  // Handle export confirm
  const handleExportConfirm = () => {
    const dataToExport = exportSelection === 'selected' && selectedUsers.length > 0
      ? users.filter(user => selectedUsers.includes(user.id))
      : filteredUsers;
    
    // Generate and download file based on selected format
    downloadExportedData(dataToExport, exportFormat);
    
    // Show success message
    showToast(`Exported ${dataToExport.length} users in ${exportFormat.toUpperCase()} format`, 'success');
    setShowExportModal(false);
  };
  
  // Generate and download file
  const downloadExportedData = (data: User[], format: string) => {
    let fileContent = '';
    let fileName = `user-export-${new Date().toISOString().slice(0, 10)}`;
    let fileType = '';
    
    if (format === 'json') {
      // Format JSON data
      const exportData = data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        dateJoined: user.created_at,
        lastActive: user.updated_at,
        ...(user.assignedStudents !== undefined ? { assignedStudents: user.assignedStudents } : {}),
        ...(user.completedActivities !== undefined ? { 
          completedActivities: user.completedActivities,
          verifiedActivities: user.verifiedActivities
        } : {})
      }));
      
      fileContent = JSON.stringify(exportData, null, 2);
      fileName += '.json';
      fileType = 'application/json';
    } else if (format === 'csv') {
      // Format CSV data
      // Generate headers first
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Date Joined', 'Last Active', 'Assigned Students', 'Completed Activities', 'Verified Activities'];
      fileContent = headers.join(',') + '\n';
      
      // Add each row of data
      data.forEach(user => {
        const row = [
          user.id,
          `"${user.name.replace(/"/g, '""')}"`, // Escape quotes in names
          `"${user.email}"`,
          user.role,
          user.status,
          user.created_at,
          user.updated_at,
          user.assignedStudents !== undefined ? user.assignedStudents : '',
          user.completedActivities !== undefined ? user.completedActivities : '',
          user.verifiedActivities !== undefined ? user.verifiedActivities : ''
        ];
        fileContent += row.join(',') + '\n';
      });
      
      fileName += '.csv';
      fileType = 'text/csv';
    } else if (format === 'excel') {
      // For Excel, we'll generate a CSV file that can be opened in Excel
      // In a production app, you would use a library like exceljs or xlsx
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Date Joined', 'Last Active', 'Assigned Students', 'Completed Activities', 'Verified Activities'];
      fileContent = headers.join(',') + '\n';
      
      // Add each row of data
      data.forEach(user => {
        const row = [
          user.id,
          `"${user.name.replace(/"/g, '""')}"`,
          `"${user.email}"`,
          user.role,
          user.status,
          user.created_at,
          user.updated_at,
          user.assignedStudents !== undefined ? user.assignedStudents : '',
          user.completedActivities !== undefined ? user.completedActivities : '',
          user.verifiedActivities !== undefined ? user.verifiedActivities : ''
        ];
        fileContent += row.join(',') + '\n';
      });
      
      fileName += '.xlsx';
      fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
    
    // Create a blob and download link
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Handle import users
  const handleImport = () => {
    setImportFile(null);
    setShowImportModal(true);
  };

  // Handle import cancel
  const handleImportCancel = () => {
    setShowImportModal(false);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  // Handle import confirm
  const handleImportConfirm = () => {
    if (importFile) {
      // In a real application, this would process the file and import users
      // For demo purposes, we'll just add a sample user and show a success message
      const newUserId = (Math.max(...users.map(u => parseInt(u.id))) + 1).toString();
      const newUser: User = {
        id: newUserId,
        name: 'Imported User',
        email: `imported${newUserId}@example.com`,
        role: 'student',
        status: 'active',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        completedActivities: 0,
        verifiedActivities: 0
      };
      
      setUsers([...users, newUser]);
      showToast(`Successfully imported users from ${importFile.name}`, 'success');
      setShowImportModal(false);
    } else {
      showToast('Please select a file to import', 'error');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600 text-sm">Manage all users, their roles, and account status.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <button 
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={handleOpenAddModal}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
          <button 
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => setShowTutorial(!showTutorial)}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {showTutorial ? 'Hide Help' : 'Show Help'}
          </button>
        </div>
      </div>

      {/* Tutorial/Help Section - Improved visual clarity */}
      {showTutorial && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Quick Guide to User Management</h3>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1.5">
                <li><span className="font-medium">Search</span>: Find users by name or email</li>
                <li><span className="font-medium">Filters</span>: Narrow down results by role or account status</li>
                <li><span className="font-medium">Checkboxes</span>: Select multiple users for bulk actions like activation/deactivation</li>
                <li><span className="font-medium">Edit</span>: Modify user details or permissions</li>
                <li><span className="font-medium">Icons</span>: 
                  <span className="inline-flex items-center ml-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
                    <Shield className="h-3 w-3 text-red-600 inline" /> Admin
                  </span>,
                  <span className="inline-flex items-center ml-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                    <Briefcase className="h-3 w-3 text-blue-600 inline" /> Mentor
                  </span>,
                  <span className="inline-flex items-center ml-1 px-1.5 py-0.5 rounded bg-green-50 border border-green-200">
                    <GraduationCap className="h-3 w-3 text-green-600 inline" /> Student
                  </span>
                </li>
              </ul>
              <button 
                className="text-blue-700 text-sm font-medium mt-3 hover:underline"
                onClick={() => setShowTutorial(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar - Improved contrast */}
      {selectedUsers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6 flex flex-wrap items-center gap-3 shadow-sm">
          <span className="text-sm font-medium flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
            {selectedUsers.length} users selected
          </span>
          <div className="flex-grow"></div>
          <button 
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => handleBulkAction('activate')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Activate
          </button>
          <button 
            className="flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => handleBulkAction('deactivate')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Deactivate
          </button>
          <button 
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={() => handleBulkAction('delete')}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
              onClick={handleExport}
              title="Export user data as CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
              onClick={handleImport}
              title="Import users from CSV file"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200 bg-white">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="mentor">Mentor</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
                onClick={() => {
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table - Enhanced for better clarity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      title="Select all users"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Last Active</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user._id} className={`
                    ${selectedUsers.includes(user._id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                    hover:bg-gray-100 transition-colors duration-150
                    ${(user.status || 'active') === 'inactive' ? 'opacity-75' : ''}
                  `}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                      />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 relative">
                          <div className={`h-12 w-12 rounded-full shadow-md border-2 ${
                            user.role === 'admin' ? 'bg-white border-red-300 text-red-700' :
                            user.role === 'mentor' ? 'bg-white border-blue-300 text-blue-700' :
                            'bg-white border-green-300 text-green-700'
                          } flex items-center justify-center uppercase font-bold text-lg`}>
                            {user.name.substring(0, 2)}
                          </div>
                          {(user.status || 'active') === 'active' && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`flex items-center px-3 py-1.5 rounded-md border-2 ${
                        user.role === 'admin' ? 'bg-white border-red-300' :
                        user.role === 'mentor' ? 'bg-white border-blue-300' :
                        'bg-white border-green-300'
                      }`} title={roleDescriptions[user.role as keyof typeof roleDescriptions]}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1.5 text-sm font-semibold text-gray-800 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${
                          (user.status || 'active') === 'active' ? 'bg-white border-green-300 text-green-700' :
                          (user.status || 'active') === 'pending' ? 'bg-white border-yellow-300 text-yellow-700' :
                          'bg-white border-gray-300 text-gray-700'
                        }`} 
                        title={statusDescriptions[(user.status || 'active') as keyof typeof statusDescriptions]}
                      >
                        {(user.status || 'active') === 'active' && <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>}
                        {(user.status || 'active') === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>}
                        {(user.status || 'active') === 'inactive' && <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>}
                        {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                      {getRoleSpecificDetails(user) && (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border-2 border-gray-300 font-medium">
                          {getRoleSpecificDetails(user)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-800">
                      {user.dateJoined}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-800">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {/* Edit button */}
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="group relative flex items-center justify-center bg-white p-2.5 rounded-md transition-all duration-150 hover:shadow-md border-2 border-blue-300"
                        >
                          <span className="absolute z-10 opacity-0 group-hover:opacity-100 -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap transition-opacity duration-150">
                            Edit user details
                          </span>
                          <Edit className="h-5 w-5 text-blue-600 group-hover:text-blue-800" />
                          <span className="sr-only">Edit</span>
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => {
                            handleDeleteUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="group relative flex items-center justify-center bg-white p-2.5 rounded-md transition-all duration-150 hover:shadow-md border-2 border-red-300"
                        >
                          <span className="absolute z-10 opacity-0 group-hover:opacity-100 -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap transition-opacity duration-150">
                            Delete user
                          </span>
                          <Trash2 className="h-5 w-5 text-red-600 group-hover:text-red-800" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center py-8">
                      <Search className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-xl font-semibold text-gray-800 mb-2">No users found</p>
                      <p className="text-base text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                      {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setRoleFilter('all');
                            setStatusFilter('all');
                          }}
                          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button disabled className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-white opacity-50 cursor-not-allowed">
              Previous
            </button>
            <button disabled className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-white opacity-50 cursor-not-allowed">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredUsers.length > 0 ? 1 : 0}</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{filteredUsers.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button disabled className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 opacity-50 cursor-not-allowed">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 hover:bg-blue-50">
                  1
                </button>
                <button disabled className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 opacity-50 cursor-not-allowed">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the user <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button 
                onClick={handleEditCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSave}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className={`w-full p-2 border ${formErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:ring-2`}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    className={`w-full p-2 border ${formErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:ring-2`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-gray-500 text-xs">(Leave blank to keep current password)</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={editFormData.password}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md focus:ring-2"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="mentor">Mentor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
              <button 
                onClick={handleAddCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSave}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="add-name"
                    name="name"
                    value={addFormData.name}
                    onChange={handleAddFormChange}
                    className={`w-full p-2 border ${addFormErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:ring-2`}
                    required
                    placeholder="Enter full name"
                  />
                  {addFormErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="add-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="add-email"
                    name="email"
                    value={addFormData.email}
                    onChange={handleAddFormChange}
                    className={`w-full p-2 border ${addFormErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:ring-2`}
                    required
                    placeholder="email@example.com"
                  />
                  {addFormErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="add-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="add-password"
                    name="password"
                    value={addFormData.password}
                    onChange={handleAddFormChange}
                    className={`w-full p-2 border ${addFormErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md focus:ring-2`}
                    required
                    placeholder="Enter password"
                  />
                  {addFormErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{addFormErrors.password}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="add-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    id="add-role"
                    name="role"
                    value={addFormData.role}
                    onChange={handleAddFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="mentor">Mentor</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="add-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="add-status"
                    name="status"
                    value={addFormData.status}
                    onChange={handleAddFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleAddCancel}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Export Users</h3>
              <button 
                onClick={handleExportCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className="ml-2">CSV</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      name="exportFormat"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className="ml-2">Excel</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      name="exportFormat"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={(e) => setExportFormat(e.target.value)}
                    />
                    <span className="ml-2">JSON</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Users to Export</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      name="exportSelection"
                      value="all"
                      checked={exportSelection === 'all'}
                      onChange={(e) => setExportSelection(e.target.value)}
                    />
                    <span className="ml-2">All filtered users ({filteredUsers.length})</span>
                  </label>
                  <label className={`inline-flex items-center ${selectedUsers.length === 0 ? 'opacity-50' : ''}`}>
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-blue-600"
                      name="exportSelection"
                      value="selected"
                      checked={exportSelection === 'selected'}
                      onChange={(e) => setExportSelection(e.target.value)}
                      disabled={selectedUsers.length === 0}
                    />
                    <span className="ml-2">Selected users ({selectedUsers.length})</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleExportCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Import Users</h3>
              <button 
                onClick={handleImportCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600">
                Upload a CSV or Excel file containing user data. The file should have columns for name, email, role, and status.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {importFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                    <p className="text-sm font-medium">{importFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => setImportFile(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported formats: CSV, Excel (.xlsx)
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium cursor-pointer"
                    >
                      Select File
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleImportCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportConfirm}
                disabled={!importFile}
                className={`px-4 py-2 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  importFile 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-400 cursor-not-allowed'
                }`}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        } text-white flex items-center min-w-[300px]`}>
          <div className="mr-3">
            {toast.type === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>{toast.message}</div>
          <button 
            onClick={() => setToast(prev => ({...prev, show: false}))}
            className="ml-auto text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
} 