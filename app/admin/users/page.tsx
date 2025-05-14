'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, UserPlus, Filter, Edit, Trash2, CheckCircle, XCircle, Shield, 
  GraduationCap, Briefcase, ChevronDown, Download, Upload, Info, HelpCircle, ShieldCheck, User as UserIcon,
  Users, UserCheck, X, Plus, ArrowRightLeft, Eye, UploadCloud
} from 'lucide-react';
import { useAuth, User as AuthUser } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  assignStudentToMentor, 
  unassignStudentFromMentor, 
  getStudentsForMentor, 
  getMentorForStudent,
  getMentorsWithStudentCounts
} from '@/lib/db-mentor-student-service';
import userProfiles from '@/lib/user-profiles';
import { User as UserType, UserRole, UserStatus } from '@/types/user';
import { toast } from 'sonner';
import ManageMentorshipModal from '@/app/components/ManageMentorshipModal';
import { parseImportFile } from '@/lib/file-parsers';

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mentor' | 'student';
  status?: 'active' | 'pending' | 'inactive';
  created_at: string;
  updated_at: string;
  assignedStudents?: number;
  completedActivities?: number;
  verifiedActivities?: number;
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
  admin: { bg: 'bg-red-100', icon: <ShieldCheck className="h-4 w-4 text-red-600" /> },
  mentor: { bg: 'bg-blue-100', icon: <GraduationCap className="h-4 w-4 text-blue-600" /> },
  student: { bg: 'bg-green-100', icon: <UserIcon className="h-4 w-4 text-green-600" /> }
};

export default function AdminUsersPage() {
  const { user, setUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [isLoading, setIsLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: '',
    password: '',
    adminPassword: ''
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
  const { toast } = useToast();
  const router = useRouter();

  // Add new state variables for mentor-student management
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [assignedStudentIds, setAssignedStudentIds] = useState<number[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [assignmentFormData, setAssignmentFormData] = useState({
    studentId: '',
    notes: ''
  });
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [studentToUnassign, setStudentToUnassign] = useState<User | null>(null);
  const [unassignReason, setUnassignReason] = useState('');
  const [userToView, setUserToView] = useState<User | null>(null);
  const [viewAsModalOpen, setViewAsModalOpen] = useState(false);

  // Add new state variables for student-mentor assignment
  const [showMentorAssignmentModal, setShowMentorAssignmentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [availableMentors, setAvailableMentors] = useState<User[]>([]);
  const [mentorAssignmentFormData, setMentorAssignmentFormData] = useState({
    mentorId: '',
    notes: ''
  });

  // Add new state variables for tracking mentors and their students
  const [mentorStudentsMap, setMentorStudentsMap] = useState<Record<string, string[]>>({});
  const [studentMentorMap, setStudentMentorMap] = useState<Record<string, string>>({});

  // Add these states after the other state variables
  const [showMentorshipModal, setShowMentorshipModal] = useState<boolean>(false);
  const [selectedUserForMentorship, setSelectedUserForMentorship] = useState<User | null>(null);

  // Fetch users from the database
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, router, toast]);

  // Function to fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      // Handle the response which directly returns the users array
      setUsers(Array.isArray(data) ? data : []);
      
      // After fetching users, load mentor-student assignments
      if (Array.isArray(data) && data.length > 0) {
        fetchMentorStudentAssignments();
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a useEffect to load all mentor-student assignments
  useEffect(() => {
    // Load mentor-student assignments when users are loaded
    if (users.length > 0 && !loading) {
      fetchMentorStudentAssignments();
    }
  }, [users, loading]);

  // Function to fetch all mentor-student assignments 
  const fetchMentorStudentAssignments = async () => {
    try {
      const response = await fetch('/api/admin/mentorship');
      if (!response.ok) {
        throw new Error('Failed to fetch mentor-student assignments');
      }
      
      const assignments = await response.json();
      
      // Build maps for easy lookup
      const mentorsMap: Record<string, string[]> = {};
      const studentsMap: Record<string, string> = {};
      
      assignments.forEach((assignment: any) => {
        const mentorId = assignment.mentor_id;
        const studentId = assignment.student_id;
        
        // Add to mentor's student list
        if (!mentorsMap[mentorId]) {
          mentorsMap[mentorId] = [];
        }
        mentorsMap[mentorId].push(studentId);
        
        // Add to student's mentor
        studentsMap[studentId] = mentorId;
      });
      
      setMentorStudentsMap(mentorsMap);
      setStudentMentorMap(studentsMap);
      
      // Log for debugging
      console.log("Updated mentor-student assignments:");
      console.log("Mentors map:", mentorsMap);
      console.log("Students map:", studentsMap);
    } catch (error) {
      console.error('Error fetching mentor-student assignments:', error);
    }
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    // For demonstration, we'll consider all fetched users as "active"
    // In a real app, you would have a status field in your user model
    const userStatus = user.status || 'active';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle checkbox selection
  const toggleUserSelection = (userId: string, checked: boolean) => {
    setSelectedUsers(prev =>
      checked
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? users.map(user => user.id) : []);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    let updatedUsers = [...users];
    
    switch (action) {
      case 'activate':
        // In a real app, you would send API requests to update each user's status
        toast({
          title: 'Info',
          description: 'Bulk activation is not implemented yet',
        });
        break;
      case 'deactivate':
        toast({
          title: 'Info',
          description: 'Bulk deactivation is not implemented yet',
        });
        break;
      case 'delete':
        toast({
          title: 'Info',
          description: 'Bulk deletion is not implemented yet',
        });
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
    return roleStyles[role as keyof typeof roleStyles].icon;
  };

  // Get status indicator
  const getStatusIndicator = (status?: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const currentStatus = status || 'active';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[currentStatus as keyof typeof statusStyles]}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${
          currentStatus === 'active' ? 'bg-green-400' :
          currentStatus === 'pending' ? 'bg-yellow-400' :
          'bg-gray-400'
        }`} />
        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
      </span>
    );
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

  // Get role-specific user details
  const getRoleSpecificDetails = (user: User) => {
    switch (user.role) {
      case 'mentor':
        return `${user.assignedStudents || 0} students | ${user.verifiedActivities || 0} activities verified`;
      case 'student':
        return `${user.completedActivities || 0} activities completed`;
      default:
        return '';
    }
  };

  // Handle user selection
  const handleUserSelection = (userId: string) => {
    const id = userId || '';
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(id => id !== userId)
        : [...prev, id]
    );
  };

  // Get user ID for operations
  const getUserId = (user: User) => {
    return user.id || '';
  };

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
    });
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
      password: '',
      adminPassword: ''
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
      password: '',
      adminPassword: ''
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
    
    if (!userToEdit || !validateForm()) return;
    
    try {
      // Update user with PATCH method to proper endpoint
      const response = await fetch(`/api/admin/users/${userToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
          status: editFormData.status,
          password: editFormData.password || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to update user');
      }

      const data = await response.json();
      
      // Update users list with proper type casting
      setUsers(prevUsers => 
        prevUsers.map(u => {
          if (u.id === userToEdit.id) {
            return {
              ...u,
              name: editFormData.name,
              email: editFormData.email,
              role: editFormData.role as 'admin' | 'mentor' | 'student',
              status: editFormData.status as 'active' | 'pending' | 'inactive' | undefined,
              updated_at: new Date().toISOString()
            };
          }
          return u;
        })
      );
      
      showToast(data.message || 'User updated successfully', 'success');
      setShowEditModal(false);
      setUserToEdit(null);
      setEditFormData({
        name: '',
        email: '',
        role: '',
        status: '',
        password: '',
        adminPassword: ''
      });
      setFormErrors({
        name: '',
        email: ''
      });
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
        throw new Error(errorData.error || errorData.details || 'Failed to delete user');
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addFormData.name,
          email: addFormData.email,
          password: addFormData.password,
          role: addFormData.role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }

      const { user: newUser } = await response.json();
      
      // Add new user to the list
      setUsers([...users, newUser]);
      
      showToast('User created successfully', 'success');
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
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('Failed to create user', 'error');
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
  const handleImportConfirm = async () => {
    if (!importFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to import',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Parse the file using our utility function
      const importedUsers = await parseImportFile(importFile);
      
      if (importedUsers.length === 0) {
        throw new Error('No valid users found in the import file');
      }
      
      // Send the users to the API for bulk import
      const response = await fetch('/api/admin/users/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: importedUsers }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import users');
      }
      
      const result = await response.json();
      
      // Show import results
      toast({
        title: 'Import Complete',
        description: result.message,
        variant: 'default',
      });
      
      // Refresh user list
      await fetchUsers();
      
      // Close modal
      setShowImportModal(false);
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Updated function to handle opening the assignment modal
  const handleOpenAssignmentModal = async (mentorUser: User) => {
    setSelectedMentor(mentorUser);
    
    try {
      // Get all students assigned to this mentor from API
      const response = await fetch(`/api/admin/mentorship/students/${mentorUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students for mentor');
      }
      
      const students = await response.json();
      
      // Convert string IDs to numbers for compatibility with existing code
      const studentIds = students.map((s: any) => 
        typeof s.student_id === 'string' ? parseInt(s.student_id, 10) : s.student_id
      );
      
      setAssignedStudentIds(studentIds);
      
      // Get all student users for the selection dropdown
      const studentUsers = users.filter(u => u.role === 'student');
      setAvailableStudents(studentUsers);
      
      // Reset form data
      setAssignmentFormData({
        studentId: '',
        notes: ''
      });
      
      setShowAssignmentModal(true);
    } catch (error) {
      console.error('Error opening assignment modal:', error);
      showToast('Failed to load students for this mentor', 'error');
    }
  };
  
  const handleOpenUnassignModal = (student: User) => {
    setStudentToUnassign(student);
    setUnassignReason('');
    setShowUnassignModal(true);
  };
  
  const handleUnassignStudent = async () => {
    if (!studentToUnassign) {
      return;
    }
    
    try {
      // Delete the assignment using the API
      const response = await fetch(`/api/admin/mentorship?student_id=${studentToUnassign.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to unassign student');
      }
      
      // If this was called from the assignments modal, refresh the assigned students list
      if (selectedMentor) {
        const studentsResponse = await fetch(`/api/admin/mentorship/students/${selectedMentor.id}`);
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          // Convert string IDs to numbers for compatibility with existing code
          setAssignedStudentIds(studentsData.map((s: any) => 
            typeof s.student_id === 'string' ? parseInt(s.student_id, 10) : s.student_id
          ));
        }
      }
      
      // Close the modal
      setShowUnassignModal(false);
      setStudentToUnassign(null);
      setUnassignReason('');
      
      // Show success message
      showToast('Student unassigned successfully', 'success');
      
      // Refresh all users to get updated counts
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      setUsers(Array.isArray(usersData) ? usersData : []);
      
    } catch (error) {
      console.error('Error unassigning student:', error);
      showToast((error as Error).message || 'Failed to unassign student', 'error');
    }
  };
  
  // Function to close the assignment modal
  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);
    setSelectedMentor(null);
    setAssignedStudentIds([]);
    setAvailableStudents([]);
  };
  
  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to handle view as user button click
  const handleViewAsUser = (userData: User) => {
    setUserToView(userData);
    setViewAsModalOpen(true);
  };

  // Function to close view as modal
  const handleViewAsCancel = () => {
    setUserToView(null);
    setViewAsModalOpen(false);
  };

  // Function to switch to viewing as the selected user
  const handleViewAsConfirm = () => {
    if (!userToView) return;
    
    // Store original user in localStorage for returning later
    if (user) {
      localStorage.setItem('original_user', JSON.stringify(user));
    }
    
    // Create a User object matching the AuthUser type
    const viewAsUser: AuthUser = {
      id: String(userToView.id), // Ensure id is a string
      name: userToView.name,
      email: userToView.email,
      role: userToView.role as 'admin' | 'mentor' | 'student'
    };
    
    // Add a token for the user (without this, auth middleware may block access)
    // This is a simple temporary token - in a real application you would generate a proper JWT
    const tempToken = btoa(JSON.stringify({
      id: viewAsUser.id,
      role: viewAsUser.role,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    }));
    
    // Save to localStorage to persist across page refresh
    localStorage.setItem('user', JSON.stringify(viewAsUser));
    localStorage.setItem('token', tempToken);
    localStorage.setItem('is_temporary_user', 'true');
    
    // Update user context
    setUser(viewAsUser);
    
    // Redirect to appropriate page based on role
    if (viewAsUser.role === 'admin') {
      router.push('/admin');
    } else if (viewAsUser.role === 'mentor') {
      router.push('/mentor/dashboard');
    } else {
      router.push('/dashboard');
    }
    
    // Close modal
    setViewAsModalOpen(false);
    
    // Show toast notification
    toast({
      title: "Viewing as user",
      description: `You are now viewing the application as ${viewAsUser.name}`,
      variant: "default",
    });
  };

  // Get student count for a mentor from the current state
  const getStudentCountForMentor = (mentorId: string | number) => {
    // Use the mentorStudentsMap which contains all mentor-student assignments
    const studentsList = mentorStudentsMap[mentorId.toString()] || [];
    return studentsList.length;
  };

  // Get mentor name for a student from the current state (using the users array)
  const getMentorNameForStudent = (studentId: string | number) => {
    const studentIdString = studentId.toString();
    const mentorId = studentMentorMap[studentIdString];
    
    if (!mentorId) return null;
    
    const mentor = users.find(u => u.id.toString() === mentorId.toString());
    return mentor ? mentor.name : null;
  };

  // Memoized function to get all student IDs assigned to the current mentor
  const getStudentIdsForCurrentMentor = () => {
    if (!selectedMentor) return [];
    return assignedStudentIds;
  };

  const handleCloseUnassignModal = () => {
    setShowUnassignModal(false);
    setStudentToUnassign(null);
    setUnassignReason('');
  };

  // Function to open the mentor assignment modal for a student
  const handleOpenMentorAssignmentModal = async (studentUser: User) => {
    setSelectedStudent(studentUser);
    
    // Get all mentor users for the selection dropdown
    const mentorUsers = users.filter(u => u.role === 'mentor');
    setAvailableMentors(mentorUsers);
    
    // Get current mentor if any using API
    const studentId = studentUser.id.toString();
    try {
      const mentorResponse = await fetch(`/api/admin/mentorship/mentor/${studentId}`);
      const mentorData = await mentorResponse.json();
      
      // Reset form data with current mentor if one exists
      setMentorAssignmentFormData({
        mentorId: mentorData && mentorData.mentor_id ? mentorData.mentor_id.toString() : '',
        notes: ''
      });
    } catch (error) {
      console.error('Error fetching mentor for student:', error);
      setMentorAssignmentFormData({
        mentorId: '',
        notes: ''
      });
    }
    
    setShowMentorAssignmentModal(true);
  };
  
  // Function to close the mentor assignment modal
  const handleCloseMentorAssignmentModal = () => {
    // Refresh data before closing
    fetchUsers();
    
    setShowMentorAssignmentModal(false);
    setSelectedStudent(null);
    setAvailableMentors([]);
  };
  
  // Function to handle mentor assignment form changes
  const handleMentorAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMentorAssignmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Function to handle assigning a mentor to the selected student
  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !mentorAssignmentFormData.mentorId) {
      showToast('Please select a mentor to assign', 'error');
      return;
    }
    
    // Use string IDs directly without parsing as integers
    const studentId = selectedStudent.id.toString();
    const mentorId = mentorAssignmentFormData.mentorId.toString();
    
    try {
      // Check if the student has an assigned mentor
      const mentorResponse = await fetch(`/api/admin/mentorship/mentor/${studentId}`);
      if (mentorResponse.ok) {
        const mentorData = await mentorResponse.json();
        
        // If the student has a mentor, unassign them first
        if (mentorData && mentorData.mentor_id) {
          await unassignStudentFromMentor(studentId);
        }
      }
      
      // Assign the student to the new mentor
      const success = await assignStudentToMentor(
        mentorId, 
        studentId, 
        mentorAssignmentFormData.notes
      );
      
      if (success) {
        // Show success message
        showToast('Mentor assigned successfully', 'success');
        
        // Update the users array to show the updated data
        fetchUsers();
        
        // Close the modal
        handleCloseMentorAssignmentModal();
      } else {
        showToast('Failed to assign mentor. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      showToast((error as Error).message || 'Failed to assign mentor', 'error');
    }
  };
  
  // Function to directly assign a mentor from the list
  const handleQuickAssignMentor = (mentorId: string | number) => {
    if (!selectedStudent) return;
    
    // Update the form data with the string ID
    setMentorAssignmentFormData(prev => ({
      ...prev,
      mentorId: mentorId.toString()
    }));
    
    // Create a fake form event
    const fakeEvent = {
      preventDefault: () => {}
    } as React.FormEvent;
    
    // Use the existing function
    handleAssignMentor(fakeEvent);
  };

  // Add these functions after other handler functions
  const handleOpenMentorshipModal = (user: User) => {
    setSelectedUserForMentorship(user);
    setShowMentorshipModal(true);
  };

  const handleCloseMentorshipModal = () => {
    setShowMentorshipModal(false);
    setSelectedUserForMentorship(null);
    fetchUsers(); // Refresh users to show updated mentorship data
  };

  // Function to handle assigning a student to the selected mentor
  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMentor || !assignmentFormData.studentId) {
      showToast('Please select a student to assign', 'error');
      return;
    }
    
    try {
      // Use string IDs directly
      const mentorId = selectedMentor.id.toString();
      const studentId = assignmentFormData.studentId.toString();
      
      const success = await assignStudentToMentor(
        mentorId, 
        studentId, 
        assignmentFormData.notes
      );
      
      if (success) {
        showToast('Student assigned successfully', 'success');
        
        // Refresh the assigned students list
        const studentsResponse = await fetch(`/api/admin/mentorship/students/${mentorId}`);
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          // Store student IDs as strings
          setAssignedStudentIds(studentsData.map((s: any) => s.student_id.toString()));
        }
        
        // Reset form
        setAssignmentFormData({
          studentId: '',
          notes: ''
        });
        
        // Refresh users to update the UI
        fetchUsers();
        
        // Close the assignment modal if needed
        handleCloseAssignmentModal();
      } else {
        showToast('Failed to assign student', 'error');
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      showToast((error as Error).message || 'Failed to assign student', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add, edit, and manage users in the system. Assign mentors to students.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="secondary"
            className="flex items-center"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center"
            variant="secondary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={handleOpenAddModal}
            className="flex items-center"
            variant="default"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Import guidance panel */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Import Users Guide</h3>
            <p className="mt-1 text-sm text-blue-600">
              You can import users via CSV, Excel, or JSON files. Files should include columns for name, email, role (admin/mentor/student), and status (active/pending/inactive).
              <br />
              <span className="font-medium">Format example:</span> 
              <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">name,email,role,status</code>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a 
                href="/templates/user_import_template.csv" 
                download 
                className="inline-flex items-center text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
              >
                <Download className="h-3 w-3 mr-1" />
                CSV Template
              </a>
              <a 
                href="/templates/user_import_template.xlsx" 
                download 
                className="inline-flex items-center text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
              >
                <Download className="h-3 w-3 mr-1" />
                Excel Template
              </a>
              <a 
                href="/templates/user_import_template.json" 
                download 
                className="inline-flex items-center text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
              >
                <Download className="h-3 w-3 mr-1" />
                JSON Template
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters panel */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="relative rounded-md shadow-sm w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search users by name, email, or role..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-1 transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-sm text-gray-500">{selectedUsers.length} selected</span>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
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
      </div>

      {/* Users Table - Enhanced for better clarity */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Assignment
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={selectedUsers.includes(user.id) ? 'bg-gray-50' : undefined}>
                      <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => toggleUserSelection(user.id, e.target.checked)}
                        />
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 uppercase font-bold">
                              {user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md ${roleStyles[user.role].bg}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1.5 font-medium capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStatusIndicator(user.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.role === 'mentor' ? (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getStudentCountForMentor(user.id)} students
                            </span>
                            <button
                              onClick={() => handleOpenAssignmentModal(user)}
                              className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Manage
                            </button>
                          </div>
                        ) : user.role === 'student' ? (
                          <div>
                            {(() => {
                              const mentorName = getMentorNameForStudent(user.id);
                              return mentorName ? (
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    {mentorName}
                                  </span>
                                  <button
                                    onClick={() => handleOpenUnassignModal(user)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                  >
                                    Change
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="text-gray-400 text-xs">No mentor assigned</span>
                                  <button
                                    onClick={() => handleOpenMentorAssignmentModal(user)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                  >
                                    Assign
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewAsUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View as this user"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                        {searchQuery ? (
                          <div>
                            <p className="text-gray-600 mb-2">No users match your search criteria</p>
                            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                              Clear Search
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-600 mb-2">No users found</p>
                            <Button variant="outline" size="sm" onClick={handleOpenAddModal}>
                              Add User
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {loading && (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
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
                  <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Admin Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="adminPassword"
                    name="adminPassword"
                    value={editFormData.adminPassword}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md focus:ring-2"
                    placeholder="Enter your admin password to confirm changes"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">For security, please enter your admin password to confirm these changes</p>
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
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl">
            <h3 className="text-lg font-medium mb-4">Import Users</h3>
            
            <div className="mb-6 bg-blue-50 rounded-md p-4 text-sm">
              <h4 className="font-medium text-blue-800 mb-2">File Format Requirements:</h4>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li><span className="font-medium">Supported formats:</span> CSV, JSON</li>
                <li><span className="font-medium">Required fields:</span> name, email, role</li>
                <li><span className="font-medium">Optional fields:</span> status</li>
                <li><span className="font-medium">Valid roles:</span> admin, mentor, student</li>
                <li><span className="font-medium">Valid statuses:</span> active, pending, inactive</li>
              </ul>
              
              <div className="mt-3 bg-white rounded p-3 border border-blue-200">
                <p className="font-medium text-blue-800 mb-1">CSV Example:</p>
                <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                  name,email,role,status<br />
                  John Doe,john@example.com,student,active<br />
                  Jane Smith,jane@example.com,mentor,active
                </code>
                
                <p className="font-medium text-blue-800 mt-3 mb-1">JSON Example:</p>
                <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                  [<br />
                  &nbsp;&nbsp;&#123;"name": "John Doe", "email": "john@example.com", "role": "student"&#125;,<br />
                  &nbsp;&nbsp;&#123;"name": "Jane Smith", "email": "jane@example.com", "role": "mentor"&#125;<br />
                  ]
                </code>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV or JSON file</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".csv,.json,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              {importFile && (
                <div className="mt-3">
                  <div className="flex items-center bg-gray-100 p-2 rounded">
                    <div className="flex-1 truncate">{importFile.name}</div>
                    <button 
                      onClick={() => setImportFile(null)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleImportCancel}>Cancel</Button>
              <Button 
                variant="default" 
                onClick={handleImportConfirm}
                disabled={!importFile || isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Users
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor-Student Assignment Modal */}
      {showAssignmentModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Students for {selectedMentor.name}</h2>
                <button 
                  onClick={handleCloseAssignmentModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Assigned Students Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Assigned Students</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {assignedStudentIds.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No students assigned to this mentor yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignedStudentIds.map(studentId => {
                            const student = users.find(u => {
                              const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id;
                              return uid === studentId;
                            });
                            
                            if (!student) return null;
                            
                            return (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                      <UserIcon className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {student.name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {student.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleOpenUnassignModal(student)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Unassign
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Assign New Student Form */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Assign New Student</h3>
                <form onSubmit={handleAssignStudent} className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student
                    </label>
                    <select
                      name="studentId"
                      value={assignmentFormData.studentId}
                      onChange={handleAssignmentFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    >
                      <option value="">Select a student...</option>
                      {availableStudents
                        .filter(student => !assignedStudentIds.includes(
                          typeof student.id === 'string' ? parseInt(student.id, 10) : student.id
                        ))
                        .map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.email})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      value={assignmentFormData.notes}
                      onChange={handleAssignmentFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 h-24"
                      placeholder="Add notes about this assignment"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                      disabled={!assignmentFormData.studentId}
                    >
                      <Plus size={18} className="mr-2" />
                      Assign Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Unassign Student Confirmation Modal */}
      {showUnassignModal && studentToUnassign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Unassign Student</h2>
              <p className="mb-4">
                Are you sure you want to unassign <span className="font-semibold">{studentToUnassign.name}</span> from this mentor?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for unassigning (optional)
                </label>
                <textarea
                  value={unassignReason}
                  onChange={(e) => setUnassignReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 h-24"
                  placeholder="Provide a reason for unassigning this student"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseUnassignModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnassignStudent}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Unassign Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View As User Modal */}
      {viewAsModalOpen && userToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">View as User</h3>
            <div className="mb-6">
              <p className="text-gray-700">
                You are about to temporarily view the application as:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 uppercase font-bold mr-3">
                    {userToView.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{userToView.name}</div>
                    <div className="text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        userToView.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : userToView.role === 'mentor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {userToView.role.charAt(0).toUpperCase() + userToView.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              You will be able to navigate the application as this user. 
              To return to your admin view, use the "Return to Admin User" option in the profile menu.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleViewAsCancel}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleViewAsConfirm}
                className="px-4 py-2 flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                <Eye className="h-4 w-4 mr-2" />
                View as {userToView.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Assignment Modal */}
      {showMentorAssignmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Assign Mentor to {selectedStudent.name}</h2>
                <button 
                  onClick={handleCloseMentorAssignmentModal}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Current Mentor Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Current Mentor</h3>
                {(() => {
                  const studentId = typeof selectedStudent.id === 'string' 
                    ? parseInt(selectedStudent.id, 10) 
                    : selectedStudent.id;
                  const mentorName = getMentorNameForStudent(studentId);
                  
                  return mentorName ? (
                    <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="mr-4">
                        <GraduationCap className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-green-800">{mentorName}</div>
                        <div className="text-sm text-green-600">Currently assigned</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-500">
                      No mentor is currently assigned to this student.
                    </div>
                  );
                })()}
              </div>
              
              {/* Assign New Mentor Form */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Assign New Mentor</h3>
                <form onSubmit={handleAssignMentor} className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Mentor
                    </label>
                    <select
                      name="mentorId"
                      value={mentorAssignmentFormData.mentorId}
                      onChange={handleMentorAssignmentFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    >
                      <option value="">Select a mentor...</option>
                      {availableMentors.map(mentor => (
                        <option key={mentor.id} value={mentor.id}>
                          {mentor.name} ({mentor.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      value={mentorAssignmentFormData.notes}
                      onChange={handleMentorAssignmentFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 h-24"
                      placeholder="Add notes about this assignment"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseMentorAssignmentModal}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                      disabled={!mentorAssignmentFormData.mentorId}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Assign Mentor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Modal */}
      {showMentorshipModal && selectedUserForMentorship && (
        <ManageMentorshipModal
          isOpen={showMentorshipModal}
          onClose={handleCloseMentorshipModal}
          user={selectedUserForMentorship}
          allUsers={users}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
} 