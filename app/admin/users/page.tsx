'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, UserPlus, Filter, Edit, Trash2, CheckCircle, XCircle, Shield, 
  GraduationCap, Briefcase, ChevronDown, Download, Upload, Info, HelpCircle, ShieldCheck, User,
  Users, UserCheck, X, Plus, ArrowRightLeft, Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
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
} from '@/lib/mentor-student-service';
import userProfiles from '@/lib/user-profiles';
import { User as UserType, UserRole, UserStatus } from '@/types/user';

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
  student: { bg: 'bg-green-100', icon: <User className="h-4 w-4 text-green-600" /> }
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
        // Handle the response which directly returns the users array
        setUsers(Array.isArray(data) ? data : []);
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
    
    fetchUsers();
  }, [user, router, toast]);

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
    
    // Check if admin password is provided for sensitive changes
    if (!editFormData.adminPassword) {
      showToast('Please enter your admin password to confirm changes', 'error');
      return;
    }
    
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
          password: editFormData.password || undefined,
          adminPassword: editFormData.adminPassword // Send admin password for verification
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
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

  // New function to handle opening the assignment modal
  const handleOpenAssignmentModal = (mentorUser: User) => {
    setSelectedMentor(mentorUser);
    
    // Get students assigned to this mentor
    const mentorId = typeof mentorUser.id === 'string' 
      ? parseInt(mentorUser.id, 10) 
      : mentorUser.id;
    
    const assignedIds = getStudentsForMentor(mentorId);
    setAssignedStudentIds(assignedIds);
    
    // Get all student users for the selection dropdown
    const studentUsers = users.filter(u => u.role === 'student');
    setAvailableStudents(studentUsers);
    
    // Reset form data
    setAssignmentFormData({
      studentId: '',
      notes: ''
    });
    
    setShowAssignmentModal(true);
  };
  
  // Function to handle assigning a student to the selected mentor
  const handleAssignStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMentor || !assignmentFormData.studentId) {
      showToast('Please select a student to assign', 'error');
      return;
    }
    
    const mentorId = typeof selectedMentor.id === 'string' 
      ? parseInt(selectedMentor.id, 10) 
      : selectedMentor.id;
    
    const studentId = parseInt(assignmentFormData.studentId, 10);
    
    // Assign the student to the mentor
    const success = assignStudentToMentor(
      mentorId, 
      studentId, 
      assignmentFormData.notes
    );
    
    if (success) {
      // Update the local state
      setAssignedStudentIds([...assignedStudentIds, studentId]);
      
      // Reset the form
      setAssignmentFormData({
        studentId: '',
        notes: ''
      });
      
      // Show success message
      showToast('Student assigned successfully', 'success');
      
      // Update the users array to show the updated count
      const updatedUsers = users.map(u => {
        if (u.id === selectedMentor.id) {
          return {
            ...u,
            assignedStudents: (u.assignedStudents || 0) + 1
          };
        }
        return u;
      });
      
      setUsers(updatedUsers);
    } else {
      showToast('Failed to assign student. Please try again.', 'error');
    }
  };
  
  // Function to handle unassigning a student
  const handleOpenUnassignModal = (student: User) => {
    setStudentToUnassign(student);
    setUnassignReason('');
    setShowUnassignModal(true);
  };
  
  const handleUnassignStudent = () => {
    if (!selectedMentor || !studentToUnassign) {
      return;
    }
    
    const mentorId = typeof selectedMentor.id === 'string' 
      ? parseInt(selectedMentor.id, 10) 
      : selectedMentor.id;
    
    const studentId = typeof studentToUnassign.id === 'string'
      ? parseInt(studentToUnassign.id, 10)
      : studentToUnassign.id;
    
    // Unassign the student from the mentor
    const success = unassignStudentFromMentor(
      mentorId,
      studentId,
      unassignReason
    );
    
    if (success) {
      // Update the local state
      setAssignedStudentIds(assignedStudentIds.filter(id => id !== studentId));
      
      // Close the modal
      setShowUnassignModal(false);
      setStudentToUnassign(null);
      
      // Show success message
      showToast('Student unassigned successfully', 'success');
      
      // Update the users array to show the updated count
      const updatedUsers = users.map(u => {
        if (u.id === selectedMentor.id && u.assignedStudents && u.assignedStudents > 0) {
          return {
            ...u,
            assignedStudents: u.assignedStudents - 1
          };
        }
        return u;
      });
      
      setUsers(updatedUsers);
    } else {
      showToast('Failed to unassign student. Please try again.', 'error');
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
    localStorage.setItem('original_user', JSON.stringify(user));
    
    // Create a User object from the user data
    const viewAsUser: UserType = {
      id: userToView.id,
      name: userToView.name,
      email: userToView.email,
      role: userToView.role as UserRole,
      status: (userToView.status || 'active') as UserStatus
    };
    
    // Update user context
    setUser(viewAsUser);
    
    // Save to localStorage to persist across page refresh
    localStorage.setItem('user', JSON.stringify(viewAsUser));
    localStorage.setItem('is_temporary_user', 'true');
    
    // Redirect to appropriate page based on role
    if (viewAsUser.role === 'admin') {
      router.push('/admin');
    } else if (viewAsUser.role === 'mentor') {
      router.push('/mentor/students');
    } else {
      router.push('/dashboard');
    }
    
    // Close modal
    setViewAsModalOpen(false);
  };

  // Function to get mentor name for a student
  const getMentorNameForStudent = (studentId: string | number) => {
    const numericStudentId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    const mentorId = getMentorForStudent(numericStudentId);
    
    if (!mentorId) return null;
    
    const mentor = users.find(u => {
      const uid = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id;
      return uid === mentorId;
    });
    
    return mentor ? mentor.name : null;
  };

  // Function to get student count for a mentor
  const getStudentCountForMentor = (mentorId: string | number) => {
    const numericMentorId = typeof mentorId === 'string' ? parseInt(mentorId, 10) : mentorId;
    const students = getStudentsForMentor(numericMentorId);
    return students.length;
  };

  const handleCloseUnassignModal = () => {
    setShowUnassignModal(false);
    setStudentToUnassign(null);
    setUnassignReason('');
  };

  // Function to open the mentor assignment modal for a student
  const handleOpenMentorAssignmentModal = (studentUser: User) => {
    setSelectedStudent(studentUser);
    
    // Get all mentor users for the selection dropdown
    const mentorUsers = users.filter(u => u.role === 'mentor');
    setAvailableMentors(mentorUsers);
    
    // Get current mentor if any
    const studentId = typeof studentUser.id === 'string' 
      ? parseInt(studentUser.id, 10) 
      : studentUser.id;
    
    const currentMentorId = getMentorForStudent(studentId);
    
    // Reset form data with current mentor if one exists
    setMentorAssignmentFormData({
      mentorId: currentMentorId ? currentMentorId.toString() : '',
      notes: ''
    });
    
    setShowMentorAssignmentModal(true);
  };
  
  // Function to close the mentor assignment modal
  const handleCloseMentorAssignmentModal = () => {
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
  const handleAssignMentor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !mentorAssignmentFormData.mentorId) {
      showToast('Please select a mentor to assign', 'error');
      return;
    }
    
    const studentId = typeof selectedStudent.id === 'string' 
      ? parseInt(selectedStudent.id, 10) 
      : selectedStudent.id;
    
    const mentorId = parseInt(mentorAssignmentFormData.mentorId, 10);
    
    // First unassign from any existing mentor if needed
    const currentMentorId = getMentorForStudent(studentId);
    if (currentMentorId) {
      unassignStudentFromMentor(currentMentorId, studentId, 'Reassigning to different mentor');
    }
    
    // Assign the student to the new mentor
    const success = assignStudentToMentor(
      mentorId, 
      studentId, 
      mentorAssignmentFormData.notes
    );
    
    if (success) {
      // Show success message
      showToast('Mentor assigned successfully', 'success');
      
      // Update the users array to show the updated data
      // This is a simplification - a real app would refetch the data
      
      // Close the modal
      handleCloseMentorAssignmentModal();
    } else {
      showToast('Failed to assign mentor. Please try again.', 'error');
    }
  };
  
  // Function to directly assign a mentor from the list
  const handleQuickAssignMentor = (mentorId: string | number) => {
    if (!selectedStudent) return;
    
    // Update the form data
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
            <Input
              type="search"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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
                      Details
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Assignment
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Joined
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Updated
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
                        {getRoleSpecificDetails(user)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.role === 'mentor' ? (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getStudentCountForMentor(user.id)} students
                            </span>
                          </div>
                        ) : user.role === 'student' ? (
                          <div>
                            {(() => {
                              const mentorName = getMentorNameForStudent(user.id);
                              return mentorName ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <GraduationCap className="h-3 w-3 mr-1" />
                                  {mentorName}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">No mentor assigned</span>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(user.updated_at)}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewAsUser(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title={`View as ${user.name}`}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {user.role === 'mentor' && (
                            <button
                              onClick={() => handleOpenAssignmentModal(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Manage assigned students"
                            >
                              <Users className="h-5 w-5" />
                            </button>
                          )}
                          {user.role === 'student' && (
                            <button
                              onClick={() => handleOpenMentorAssignmentModal(user)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Assign a mentor"
                            >
                              <GraduationCap className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditUser(user)}
                            title="Edit user"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete user"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                                      <User className="h-4 w-4 text-gray-500" />
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
    </div>
  );
} 