'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, UserPlus, Filter, Edit, Trash2, CheckCircle, XCircle, Shield, 
  GraduationCap, Briefcase, ChevronDown, Download, Upload, Info, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Sample user data
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
    assignedStudents: 12
  },
  { 
    id: '3', 
    name: 'Michael Johnson', 
    email: 'student@gmail.com', 
    role: 'student', 
    status: 'active', 
    dateJoined: '2023-05-10',
    lastActive: '2023-10-31',
    completedActivities: 18,
    verifiedActivities: 15
  },
  { 
    id: '4', 
    name: 'Sarah Williams', 
    email: 'sarah@example.com', 
    role: 'student', 
    status: 'pending', 
    dateJoined: '2023-09-05',
    lastActive: '2023-09-05',
    completedActivities: 2,
    verifiedActivities: 0
  },
  { 
    id: '5', 
    name: 'Robert Brown', 
    email: 'robert@example.com', 
    role: 'mentor', 
    status: 'inactive', 
    dateJoined: '2023-01-25',
    lastActive: '2023-08-15',
    assignedStudents: 0
  },
];

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

export default function UsersManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState(usersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
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
    status: ''
  });
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    status: 'pending'
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: ''
  });
  const [addFormErrors, setAddFormErrors] = useState({
    name: '',
    email: ''
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

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
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
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    let updatedUsers = [...users];
    
    switch (action) {
      case 'activate':
        updatedUsers = users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
        );
        showToast(`${selectedUsers.length} users activated successfully`, 'success');
        break;
      case 'deactivate':
        updatedUsers = users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'inactive' } : user
        );
        showToast(`${selectedUsers.length} users deactivated successfully`, 'success');
        break;
      case 'delete':
        updatedUsers = users.filter(user => !selectedUsers.includes(user.id));
        showToast(`${selectedUsers.length} users deleted successfully`, 'success');
        break;
      default:
        return;
    }
    
    // Update the users array
    setUsers(updatedUsers);
    
    // Clear selections
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // Get role icon with improved visual clarity
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className={`h-4 w-4 ${roleStyles.admin.icon}`} aria-label="Administrator" />;
      case 'mentor':
        return <Briefcase className={`h-4 w-4 ${roleStyles.mentor.icon}`} aria-label="Mentor" />;
      case 'student':
        return <GraduationCap className={`h-4 w-4 ${roleStyles.student.icon}`} aria-label="Student" />;
      default:
        return null;
    }
  };

  // Get status indicator with improved visual design
  const getStatusIndicator = (status: string) => {
    const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive;
    
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`} 
        title={statusDescriptions[status as keyof typeof statusDescriptions]}
      >
        {status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>}
        {status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></div>}
        {status === 'inactive' && <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div>}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get role-specific details
  const getRoleSpecificDetails = (userData: any) => {
    if (userData.role === 'mentor' && userData.assignedStudents !== undefined) {
      return `${userData.assignedStudents} assigned students`;
    } else if (userData.role === 'student' && userData.completedActivities !== undefined) {
      return `${userData.completedActivities} activities (${userData.verifiedActivities} verified)`;
    }
    return null;
  };

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      show: true,
      message,
      type
    });
    
    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({...prev, show: false}));
    }, 3000);
  };

  // Validate form data
  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: ''
    };
    
    // Name validation
    if (!editFormData.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    } else if (editFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      valid = false;
    }
    
    // Email validation
    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = 'Email address is invalid';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };

  // Handle edit user
  const handleEditUser = (user: any) => {
    setUserToEdit(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    // Reset form errors
    setFormErrors({
      name: '',
      email: ''
    });
    setShowEditModal(true);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setShowEditModal(false);
    setUserToEdit(null);
    // Reset form errors
    setFormErrors({
      name: '',
      email: ''
    });
  };

  // Handle edit form change
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear the error for this field when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle edit save
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before saving
    if (!validateForm()) {
      showToast('Please correct the errors in the form', 'error');
      return;
    }
    
    if (userToEdit) {
      try {
        // Check for duplicate email
        const isDuplicateEmail = users.some(u => 
          u.id !== userToEdit.id && u.email.toLowerCase() === editFormData.email.toLowerCase()
        );
        
        if (isDuplicateEmail) {
          setFormErrors({
            ...formErrors,
            email: 'This email is already in use by another user'
          });
          showToast('Email address is already in use', 'error');
          return;
        }
        
        // Update the users array with the edited data
        const updatedUsers = users.map(user => {
          if (user.id === userToEdit.id) {
            return {
              ...user,
              name: editFormData.name,
              email: editFormData.email,
              role: editFormData.role,
              status: editFormData.status
            };
          }
          return user;
        });
        
        // Update the state with the new users array
        setUsers(updatedUsers);
        
        // Show success message
        showToast(`User ${editFormData.name} updated successfully`, 'success');
        
        // Close the modal and reset states
        setShowEditModal(false);
        setUserToEdit(null);
      } catch (error) {
        showToast('An error occurred while updating the user', 'error');
        console.error('Update error:', error);
      }
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      // Remove the user from the array
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      
      // Update the state with the new users array
      setUsers(updatedUsers);
      
      // If the deleted user was selected, remove it from selection
      if (selectedUsers.includes(userToDelete.id)) {
        setSelectedUsers(selectedUsers.filter(id => id !== userToDelete.id));
      }
      
      // Show success message
      showToast(`User ${userToDelete.name} deleted successfully`, 'success');
      
      // Close the modal and reset states
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Handle open add user modal
  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      email: '',
      role: 'student',
      status: 'pending'
    });
    setAddFormErrors({
      name: '',
      email: ''
    });
    setShowAddModal(true);
  };

  // Handle add user cancel
  const handleAddCancel = () => {
    setShowAddModal(false);
    setAddFormErrors({
      name: '',
      email: ''
    });
  };

  // Handle add form change
  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear the error for this field when user starts typing
    if (addFormErrors[name as keyof typeof addFormErrors]) {
      setAddFormErrors({
        ...addFormErrors,
        [name]: ''
      });
    }
    
    setAddFormData({
      ...addFormData,
      [name]: value
    });
  };

  // Validate add form data
  const validateAddForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: ''
    };
    
    // Name validation
    if (!addFormData.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    } else if (addFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      valid = false;
    }
    
    // Email validation
    if (!addFormData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(addFormData.email)) {
      errors.email = 'Email address is invalid';
      valid = false;
    }
    
    setAddFormErrors(errors);
    return valid;
  };

  // Handle add user save
  const handleAddSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before saving
    if (!validateAddForm()) {
      showToast('Please correct the errors in the form', 'error');
      return;
    }
    
    try {
      // Check for duplicate email
      const isDuplicateEmail = users.some(user => 
        user.email.toLowerCase() === addFormData.email.toLowerCase()
      );
      
      if (isDuplicateEmail) {
        setAddFormErrors({
          ...addFormErrors,
          email: 'This email is already in use by another user'
        });
        showToast('Email address is already in use', 'error');
        return;
      }
      
      // Create a new user with a unique ID
      const newUserId = (Math.max(...users.map(u => parseInt(u.id))) + 1).toString();
      let newUser: any = {
        id: newUserId,
        name: addFormData.name,
        email: addFormData.email,
        role: addFormData.role,
        status: addFormData.status,
        dateJoined: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0]
      };
      
      // Add role-specific properties
      if (addFormData.role === 'mentor') {
        newUser.assignedStudents = 0;
      } else if (addFormData.role === 'student') {
        newUser.completedActivities = 0;
        newUser.verifiedActivities = 0;
      }
      
      // Add the new user to the list
      setUsers([...users, newUser]);
      
      // Show success message
      showToast(`User ${addFormData.name} created successfully`, 'success');
      
      // Close the modal
      setShowAddModal(false);
    } catch (error) {
      showToast('An error occurred while creating the user', 'error');
      console.error('Create error:', error);
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
  const downloadExportedData = (data: any[], format: string) => {
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
        dateJoined: user.dateJoined,
        lastActive: user.lastActive,
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
          user.dateJoined,
          user.lastActive,
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
          user.dateJoined,
          user.lastActive,
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
      const newUser = {
        id: newUserId,
        name: 'Imported User',
        email: `imported${newUserId}@example.com`,
        role: 'student',
        status: 'pending',
        dateJoined: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
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
                  <tr key={user.id} className={`
                    ${selectedUsers.includes(user.id) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                    hover:bg-gray-100 transition-colors duration-150
                    ${user.status === 'inactive' ? 'opacity-75' : ''}
                  `}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
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
                          {user.status === 'active' && (
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
                          user.status === 'active' ? 'bg-white border-green-300 text-green-700' :
                          user.status === 'pending' ? 'bg-white border-yellow-300 text-yellow-700' :
                          'bg-white border-gray-300 text-gray-700'
                        }`} 
                        title={statusDescriptions[user.status as keyof typeof statusDescriptions]}
                      >
                        {user.status === 'active' && <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>}
                        {user.status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>}
                        {user.status === 'inactive' && <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
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
                            setUserToDelete(user);
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