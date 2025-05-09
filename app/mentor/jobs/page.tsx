'use client';

import React, { useState, useEffect } from 'react';
import { getAllJobs } from '@/lib/jobs-service';
import { Job } from '@/lib/jobs-service';
import { Search, Filter, Download, Users, Mail, AlertCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// Add fallback student data
const fallbackStudents = [
  { id: '188b371be2f79a54972c14e6c7c9ab1e', name: 'Alex Wilson', skills: [] },
  { id: 'f7bf993e30dd92966ca812285c6b61aa', name: 'Jessica Lee', skills: [] },
  { id: '2419160dab534e9b8ce6e53ef646d222', name: 'Michael Taylor', skills: [] },
  { id: '628cbc72b2bf81d08fff15ba87e1c1d4', name: 'Emma Clark', skills: [] },
  { id: '5b2df08a4b539e5fe259a3cdaafdc089', name: 'James Martin', skills: [] },
  { id: '7288975ef2240f17209759d21add7c3a', name: 'Olivia Wright', skills: [] },
  { id: 'adca6f1e3f8f9fd96057cc278a26e607', name: 'William Harris', skills: [] },
  { id: '3f7dea92698c531dd7bcc8a0f79d44c9', name: 'Student User', skills: [] }
];

// Define a proper Student interface
interface Student {
  id: string;
  name: string;
  email?: string;
  skills: string[];
  [key: string]: any; // For other properties that might be present
}

export default function MentorJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>(fallbackStudents);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recommendNote, setRecommendNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  useEffect(() => {
    loadJobs(pagination.page, pagination.limit);
    loadStudents();
  }, [pagination.page, pagination.limit]);

  const loadStudents = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available to load students');
        // Use fallback students if no user ID is available
        console.log('Using fallback students with skills:', fallbackStudents.map(s => ({name: s.name, skillCount: s.skills?.length || 0})));
        setStudents(fallbackStudents);
        return;
      }
      
      console.log('Loading students for mentor:', user.id);
      const response = await fetch(`/api/mentor/students?mentorId=${user.id}`);
      
      if (!response.ok) {
        console.error('Error loading students:', response.statusText, 'Status:', response.status);
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response');
        }
        // Use fallback data if API call fails
        console.log('API call failed, using fallback students');
        setStudents(fallbackStudents);
        return;
      }
      
      const data = await response.json();
      console.log(`Loaded ${data.students?.length || 0} students from API:`, data.students);
      
      // Check if skills data is properly included
      const studentsWithSkills = data.students && data.students.length > 0 
        ? data.students.map((student: any) => {
            // If student skills is undefined/null/not an array, initialize as empty array
            if (!student.skills || !Array.isArray(student.skills)) {
              console.log(`Student ${student.name} has no skills array, initializing empty array`);
              student.skills = [];
            }
            console.log(`Student ${student.name} has ${student.skills.length} skills:`, student.skills);
            return student;
          })
        : [];
      
      // Use API data if available, otherwise fallback
      if (studentsWithSkills.length > 0) {
        console.log('Setting students with processed skills data');
        setStudents(studentsWithSkills);
      } else {
        console.log('No students returned from API, using fallback data');
        setStudents(fallbackStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      // Use fallback data on error
      console.log('Error caught, using fallback students');
      setStudents(fallbackStudents);
    }
  };

  const loadJobs = async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const jobsData = await getAllJobs(page, limit);
      
      // Ensure each job has a skills array
      const jobsWithSkills = jobsData.jobs.map(job => {
        if (!job.skills || !Array.isArray(job.skills)) {
          console.log(`Job ${job.title} has no skills array, initializing empty array`);
          job.skills = [];
        }
        console.log(`Job ${job.title} has ${job.skills.length} skills:`, job.skills);
        return job;
      });
      
      console.log(`Loaded ${jobsWithSkills.length} jobs with skills data`);
      setJobs(jobsWithSkills);
      setPagination(jobsData.pagination);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      loadJobs(newPage, pagination.limit);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };
  
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedStudent(id === "0" ? null : id);
  };

  const openRecommendModal = (job: Job) => {
    setSelectedJob(job);
    setRecommendNote('');
    setShowRecommendModal(true);
  };

  const closeRecommendModal = () => {
    setShowRecommendModal(false);
  };

  const handleRecommend = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedStudent || !selectedJob) {
        alert('Please select a student to recommend this job to.');
        return;
      }
      
      // In a real application, this would send the recommendation to the student via API
      // For now, we'll just simulate the action with an alert
      const student = students.find(s => s.id === selectedStudent);
      alert(`Job "${selectedJob.title}" has been recommended to ${student?.name}. Your note has been sent.`);
      
      closeRecommendModal();
    } catch (error) {
      console.error('Error recommending job:', error);
      alert('An error occurred while recommending the job. Please try again.');
    }
  };

  // Calculate job match for the selected student
  const calculateMatchForStudent = (job: Job) => {
    if (!selectedStudent) return '—';
    
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return '—';
    
    // Debug log for the current student
    console.log('Selected student:', student.name, 'ID:', selectedStudent);
    console.log('Student skills:', student.skills);
    
    // Debug log for the current job
    console.log('Job:', job.title, 'ID:', job.id);
    console.log('Job skills:', job.skills);
    
    // Ensure both job skills and student skills are properly processed
    const studentSkills = Array.isArray(student.skills) 
      ? student.skills.map((s: string) => typeof s === 'string' ? s.toLowerCase() : '')
      : [];
    
    const jobSkills = Array.isArray(job.skills) 
      ? job.skills.map(s => typeof s === 'string' ? s.toLowerCase() : '')
      : [];
    
    console.log('Processed student skills:', studentSkills);
    console.log('Processed job skills:', jobSkills);
    
    if (studentSkills.length === 0 || jobSkills.length === 0) {
      console.log('No skills to match, returning 0%');
      return '0%';
    }
    
    // Calculate matching skills with proper type checking
    const matchingSkills = jobSkills.filter(skill => 
      studentSkills.some((studentSkill: string) => 
        typeof studentSkill === 'string' && typeof skill === 'string' &&
        (studentSkill.includes(skill) || skill.includes(studentSkill))
      )
    );
    
    console.log('Matching skills:', matchingSkills);
    
    const matchPercentage = Math.round((matchingSkills.length / jobSkills.length) * 100);
    console.log('Match percentage:', matchPercentage + '%');
    return `${matchPercentage}%`;
  };

  // Filter jobs based on search term and category filter
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (job.organization && job.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || job.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...Array.from(new Set(jobs.map(job => job.category).filter(Boolean)))];

  // Pagination UI component
  const renderPagination = () => (
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
          type="button"
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
            type="button"
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
          type="button"
        >
          <span className="sr-only">Next</span>
          <ChevronDown className="h-5 w-5 -rotate-90" />
        </button>
      </nav>
      
      <div className="ml-4 flex items-center text-sm text-gray-500">
        Page {pagination.page} of {pagination.pages} ({pagination.total} jobs)
      </div>
    </div>
  );

  // If not a mentor, redirect or show access denied message
  if (user && user.role !== 'mentor') {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">This page is only accessible to mentors.</p>
        <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Guidance</h1>
        <div className="flex items-center space-x-2">
          <Users size={18} className="text-gray-500" />
          <select
            className="border border-gray-300 rounded-md py-2 px-3 min-w-[200px]"
            value={selectedStudent ? selectedStudent : '0'}
            onChange={handleStudentChange}
            aria-label="Select a student to view job matches for"
          >
            <option value="0">Select a student...</option>
            {students && students.length > 0 ? (
              students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading students...</option>
            )}
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-4"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="w-full md:w-64 flex items-center">
            <Filter size={18} className="text-gray-400 mr-2" />
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-4"
              value={filter}
              onChange={handleFilterChange}
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md flex items-center">
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => loadJobs(pagination.page, pagination.limit)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/jobs/${job.id}?from=mentor`} className="text-blue-600 hover:underline">
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.organization}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${
                        calculateMatchForStudent(job) === '—' ? 'text-gray-500' :
                        parseInt(calculateMatchForStudent(job) as string) > 70 ? 'text-green-600' :
                        parseInt(calculateMatchForStudent(job) as string) > 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {calculateMatchForStudent(job)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openRecommendModal(job)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={!selectedStudent}
                        title={!selectedStudent ? "Select a student first" : "Recommend job"}
                      >
                        <Mail size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Recommend Job Modal */}
      {showRecommendModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Recommend Job</h2>
              
              <div className="mb-4">
                <div className="font-medium">{selectedJob.title}</div>
                <div className="text-sm text-gray-500">{selectedJob.organization}</div>
              </div>
              
              <form onSubmit={handleRecommend}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    value={selectedStudent || ''}
                    disabled
                  >
                    {students
                      .filter(student => student.id === selectedStudent)
                      .map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (Optional)
                  </label>
                  <textarea
                    value={recommendNote}
                    onChange={(e) => setRecommendNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 h-32"
                    placeholder="Add a personal note to the student about why you're recommending this job..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeRecommendModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Send Recommendation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      {!isLoading && !error && filteredJobs.length > 0 && renderPagination()}
    </div>
  );
} 