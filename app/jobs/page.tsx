'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Filter, Briefcase, MapPin, Clock, ChevronDown, ChevronUp, X, Bookmark, CheckCircle, Building, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { 
  getAllJobs, 
  getSavedJobs, 
  isJobSaved, 
  toggleSaveJob,
  getUserApplications,
  hasApplied,
  Job
} from '@/lib/jobs-service';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    match: 0,
    status: 'all', // 'all', 'saved', 'applied'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create a mock user for demo purposes if none exists
  const mockUser = user || { id: 1, role: 'student', name: 'Student User' };
  
  const isAdmin = mockUser?.role === 'admin';
  const isMentor = mockUser?.role === 'mentor';
  const isStudent = mockUser?.role === 'student';

  // Load jobs and user-specific data
  useEffect(() => {
    loadData(pagination.page, pagination.limit);
  }, [mockUser?.id, pagination.page, pagination.limit]);
  
  const loadData = async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedJobsData = await getAllJobs(page, limit);
      setJobs(loadedJobsData.jobs);
      setPagination(loadedJobsData.pagination);
      
      // If student, load their saved and applied jobs
      if (mockUser?.id) {
        const userId = typeof mockUser.id === 'string' ? parseInt(mockUser.id, 10) : mockUser.id;
        try {
          const userSavedJobs = await getSavedJobs(userId);
          setSavedJobs(Array.isArray(userSavedJobs) ? userSavedJobs : []);
          
          const userApplications = await getUserApplications(userId);
          setAppliedJobs(
            Array.isArray(userApplications) 
              ? userApplications.map(app => typeof app.jobId === 'string' ? parseInt(app.jobId, 10) : app.jobId) 
              : []
          );
          
          console.log(`Loaded ${loadedJobsData.jobs.length} jobs, ${userSavedJobs.length} saved, ${userApplications.length} applied`);
        } catch (userDataError) {
          console.error('Error loading user-specific job data:', userDataError);
          // Continue with jobs but without user-specific data
          setSavedJobs([]);
          setAppliedJobs([]);
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      loadData(newPage, pagination.limit);
    }
  };

  const toggleJobExpand = (jobId: number) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    if (key === 'match') {
      // Ensure match is always a number
      setFilters({
        ...filters,
        [key]: typeof value === 'string' ? parseInt(value) : value,
      });
    } else {
      setFilters({
        ...filters,
        [key]: value,
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      type: '',
      match: 0,
      status: 'all',
    });
  };

  const handleToggleSaveJob = async (jobId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent expanding job card
    
    try {
      if (mockUser?.id) {
        const userId = typeof mockUser.id === 'string' ? parseInt(mockUser.id, 10) : mockUser.id;
        const isNowSaved = await toggleSaveJob(userId, jobId);
        
        // Update local state
        if (isNowSaved) {
          setSavedJobs([...savedJobs, jobId]);
        } else {
          setSavedJobs(savedJobs.filter(id => id !== jobId));
        }
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      alert('Failed to save/unsave the job. Please try again.');
    }
  };

  // Filter jobs based on search term and filters
  const filteredJobs = jobs.filter(job => {
    // Search term filter
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !job.organization?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Location filter
    if (filters.location && job.location !== filters.location) {
      return false;
    }
    
    // Type filter
    if (filters.type && job.type !== filters.type) {
      return false;
    }
    
    // Match percentage filter
    if (filters.match > 0 && job.match < filters.match) {
      return false;
    }
    
    // Status filter (for students)
    if (isStudent) {
      if (filters.status === 'saved' && Array.isArray(savedJobs) && !savedJobs.includes(job.id)) {
        return false;
      }
      if (filters.status === 'applied' && Array.isArray(appliedJobs) && !appliedJobs.includes(job.id)) {
        return false;
      }
    }
    
    return true;
  });

  // Get unique locations and job types for filter options
  const locations = Array.from(new Set(jobs.map(job => job.location).filter(Boolean)));
  const jobTypes = Array.from(new Set(jobs.map(job => job.type).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
        <p className="text-gray-600">Find and compare job opportunities aligned with your skills</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs by title or organization"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filter Jobs</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Match
                </label>
                <select
                  value={filters.match}
                  onChange={(e) => handleFilterChange('match', Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="0">Any Match</option>
                  <option value="50">50% or higher</option>
                  <option value="70">70% or higher</option>
                  <option value="90">90% or higher</option>
                </select>
              </div>
              
              {/* Student-specific filters */}
              {isStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Jobs</option>
                    <option value="saved">Saved Jobs</option>
                    <option value="applied">Applied Jobs</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job Statistics - Only for students */}
      {isStudent && (
        <div className="mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Job Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Available Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 text-sm">Saved Jobs</p>
                  <p className="text-3xl font-bold text-blue-600">{savedJobs.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 text-sm">Applied Jobs</p>
                  <p className="text-3xl font-bold text-green-600">{appliedJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-1">Error loading jobs</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => loadData(pagination.page, pagination.limit)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-1">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search term
            </p>
          </div>
        ) : (
          <>
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleJobExpand(job.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {job.organization}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.type}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Posted: {new Date(job.posted).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Match Percentage */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                      job.match >= 80 ? 'bg-green-500' : 
                      job.match >= 60 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}>
                      {job.match}%
                    </div>
                    
                    {/* Status Indicators for Students */}
                    {isStudent && (
                      <div className="flex flex-col items-center space-y-2">
                        {Array.isArray(savedJobs) && savedJobs.includes(job.id) && (
                          <span 
                            className="rounded-full bg-blue-100 p-1" 
                            title="Saved job"
                            onClick={(e) => handleToggleSaveJob(job.id, e)}
                          >
                            <Bookmark className="h-4 w-4 text-blue-600" fill="currentColor" />
                          </span>
                        )}
                        {Array.isArray(appliedJobs) && appliedJobs.includes(job.id) && (
                          <span className="rounded-full bg-green-100 p-1" title="Applied job">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expanded Job Content */}
                {expandedJob === job.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-700 mb-4">{job.description}</p>
                    
                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Requirements</h4>
                      <ul className="space-y-2">
                        {job.requirements.map((requirement) => (
                          <li key={requirement.id} className="flex items-start">
                            {requirement.met ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`${requirement.essential ? 'font-medium' : ''}`}>
                              {requirement.text}
                              {requirement.essential && (
                                <span className="ml-2 text-xs font-medium text-red-500">Essential</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link 
                        href={`/jobs/${job.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Full Details
                      </Link>
                      
                      {/* Student-specific actions */}
                      {isStudent && (
                        <div className="flex space-x-2">
                          {!Array.isArray(savedJobs) || !savedJobs.includes(job.id) ? (
                            <button
                              onClick={(e) => handleToggleSaveJob(job.id, e)}
                              className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center"
                            >
                              <Bookmark className="h-4 w-4 mr-1" />
                              Save Job
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleToggleSaveJob(job.id, e)}
                              className="px-3 py-1.5 border border-blue-300 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 text-sm font-medium flex items-center"
                            >
                              <Bookmark className="h-4 w-4 mr-1" fill="currentColor" />
                              Saved
                            </button>
                          )}
                          
                          {!Array.isArray(appliedJobs) || !appliedJobs.includes(job.id) ? (
                            <Link 
                              href={`/jobs/${job.id}?apply=true`}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                              Apply Now
                            </Link>
                          ) : (
                            <Link 
                              href={`/jobs/${job.id}?application=view`}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Applied
                            </Link>
                          )}
                        </div>
                      )}
                      
                      {/* Mentor-specific actions */}
                      {isMentor && (
                        <button
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                        >
                          Recommend to Students
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Pagination UI */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page === pagination.pages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                  </button>
                </nav>
                
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} jobs)
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 