'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClipboardCheck, Filter, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

interface Session {
  id: string;
  displayId: number;
  title: string;
  description: string;
  date: string;
  location: string;
  status: string;
  enrolledCount?: number;
  student: {
    id: number;
    name: string;
  };
}

export default function AdminSessionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const sessionsPerPage = 10;

  // Fetch sessions data
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        
        // Make API call to fetch sessions from the database
        console.log('Attempting to fetch sessions from API...');
        const response = await fetch('/api/admin/sessions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        
        const data = await response.json();
        console.log('Successfully fetched sessions from API:', data.sessions?.length || 0);
        setSessions(data.sessions || []);
        setFilteredSessions(data.sessions || []);
        setTotalSessions(data.sessions?.length || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        console.log('Falling back to sample data');
        toast({
          title: 'Error',
          description: 'Failed to load sessions',
          variant: 'destructive'
        });
        
        // Fallback to sample data if API fails
        const sampleSessions: Session[] = [
          {
            id: 'sample-id-1',
            displayId: 1,
            title: 'Art Workshop - Professional',
            description: 'A 120-minute online workshop on art techniques',
            date: '2025-04-13',
            location: 'Virtual Classroom',
            status: 'planned',
            student: { id: 1, name: 'John Doe' }
          },
          {
            id: 'sample-id-2',
            displayId: 2,
            title: 'Mathematics for Grade 5',
            description: 'Introduction to multiplication and division',
            date: '2023-09-15',
            location: 'Main Classroom',
            status: 'completed',
            student: { id: 2, name: 'Jane Smith' }
          },
          {
            id: 'sample-id-3',
            displayId: 3,
            title: 'Science Experiment',
            description: 'Simple chemical reactions demonstration',
            date: '2023-09-20',
            location: 'Science Lab',
            status: 'completed',
            student: { id: 3, name: 'Alice Johnson' }
          },
          {
            id: 'sample-id-4',
            displayId: 4,
            title: 'History Virtual Tour',
            description: 'Ancient Egypt exploration',
            date: '2023-09-25',
            location: 'Computer Lab',
            status: 'planned',
            student: { id: 4, name: 'Bob Wilson' }
          },
          {
            id: 'sample-id-5',
            displayId: 5,
            title: 'Reading Assistance',
            description: 'Guided reading for struggling readers',
            date: '2023-09-18',
            location: 'Library',
            status: 'completed',
            student: { id: 5, name: 'Charlie Brown' }
          },
          {
            id: 'sample-id-6',
            displayId: 6,
            title: 'Art Workshop',
            description: 'Painting techniques for beginners',
            date: '2023-09-28',
            location: 'Art Room',
            status: 'planned',
            student: { id: 6, name: 'Diana Prince' }
          }
        ];
        
        console.log('Using sample data with', sampleSessions.length, 'sessions');
        setSessions(sampleSessions);
        setFilteredSessions(sampleSessions);
        setTotalSessions(sampleSessions.length);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [toast]);
  
  // Filter sessions based on search query and status filter
  useEffect(() => {
    const filtered = sessions.filter(session => {
      const matchesSearch = 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.student.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        session.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredSessions(filtered);
    setTotalSessions(filtered.length);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sessions]);
  
  // Calculate pagination
  const totalPages = Math.ceil(totalSessions / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const endIndex = Math.min(startIndex + sessionsPerPage, filteredSessions.length);
  const currentSessions = filteredSessions.slice(startIndex, endIndex);
  
  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the useEffect
  };
  
  // Handle pagination
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teaching Sessions</h1>
        <Link href="/admin/sessions/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
            </div>
            
            {/* Filter by status */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleStatusFilterChange('all')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === 'all' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => handleStatusFilterChange('planned')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === 'planned' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Planned
                </button>
                <button 
                  onClick={() => handleStatusFilterChange('completed')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === 'completed' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Completed
                </button>
                <button 
                  onClick={() => handleStatusFilterChange('cancelled')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    statusFilter === 'cancelled' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
          
          {/* Sessions Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3">ID</th>
                      <th scope="col" className="px-4 py-3">Title</th>
                      <th scope="col" className="px-4 py-3">Student</th>
                      <th scope="col" className="px-4 py-3">Date</th>
                      <th scope="col" className="px-4 py-3">Location</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Enrolled</th>
                      <th scope="col" className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSessions.length > 0 ? (
                      currentSessions.map((session) => (
                        <tr key={session.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {session.displayId || '—'}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {session.title}
                          </td>
                          <td className="px-4 py-3">
                            {session.student.name}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(session.date)}
                          </td>
                          <td className="px-4 py-3">
                            {session.location}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(session.status)}`}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700">
                              {session.enrolledCount || 0} students
                            </span>
                          </td>
                          <td className="px-4 py-3 space-x-2">
                            <Link 
                              href={`/admin/sessions/${session.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link 
                              href={`/admin/sessions/${session.id}/edit`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="bg-white border-b">
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No sessions found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredSessions.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {endIndex} of {totalSessions} sessions
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`inline-flex items-center px-3 py-1 rounded-md ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`inline-flex items-center px-3 py-1 rounded-md ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 