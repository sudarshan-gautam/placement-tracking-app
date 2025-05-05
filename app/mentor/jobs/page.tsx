'use client';

import React, { useState, useEffect } from 'react';
import { getAllJobs } from '@/lib/jobs-service';
import { Job } from '@/lib/jobs-service';
import { Search, Filter, Download, Users, Mail, Star, StarOff } from 'lucide-react';
import Link from 'next/link';
import userProfiles from '@/lib/user-profiles';

export default function MentorJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recommendNote, setRecommendNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Get only student profiles
  const studentProfiles = userProfiles.filter(profile => profile.role === 'student');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    setIsLoading(true);
    const allJobs = getAllJobs();
    setJobs(allJobs);
    setIsLoading(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };
  
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedStudent(id === 0 ? null : id);
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
    
    if (!selectedStudent || !selectedJob) {
      alert('Please select a student to recommend this job to.');
      return;
    }
    
    // In a real application, this would send the recommendation to the student
    // For now, we'll just simulate the action with an alert
    const student = studentProfiles.find(s => s.id === selectedStudent);
    alert(`Job "${selectedJob.title}" has been recommended to ${student?.name}. Your note has been sent.`);
    
    closeRecommendModal();
  };

  // Calculate job match for the selected student
  const calculateMatchForStudent = (job: Job) => {
    if (!selectedStudent) return '—';
    
    const student = studentProfiles.find(s => s.id === selectedStudent);
    if (!student) return '—';
    
    // Very simple match calculation based on skills overlap
    const studentSkills = student.skills.map(s => s.toLowerCase());
    const jobSkills = job.skills.map(s => s.toLowerCase());
    
    const matchingSkills = jobSkills.filter(skill => 
      studentSkills.some(studentSkill => studentSkill.includes(skill) || skill.includes(studentSkill))
    );
    
    const matchPercentage = jobSkills.length > 0 
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 0;
    
    return `${matchPercentage}%`;
  };

  // Filter jobs based on search term and category filter
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || job.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Get unique categories for filter dropdown
  const categories = ['all', ...Array.from(new Set(jobs.map(job => job.category)))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Guidance</h1>
        <div className="flex items-center space-x-2">
          <Users size={18} className="text-gray-500" />
          <select
            className="border border-gray-300 rounded-md py-2 px-3"
            value={selectedStudent ? selectedStudent.toString() : '0'}
            onChange={handleStudentChange}
          >
            <option value="0">Select a student...</option>
            {studentProfiles.map(student => (
              <option key={student.id} value={student.id.toString()}>
                {student.name}
              </option>
            ))}
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
                      <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:underline">
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
                        title="Recommend to student"
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
              <form onSubmit={handleRecommend}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job
                  </label>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    <div className="font-semibold">{selectedJob.title}</div>
                    <div className="text-gray-600">{selectedJob.organization}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student*
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    value={selectedStudent ? selectedStudent.toString() : ''}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value="">Select a student...</option>
                    {studentProfiles.map(student => (
                      <option key={student.id} value={student.id.toString()}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recommendation Note
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md py-2 px-3 h-32"
                    placeholder="Write a personalized note to the student about why you're recommending this job..."
                    value={recommendNote}
                    onChange={(e) => setRecommendNote(e.target.value)}
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
    </div>
  );
} 