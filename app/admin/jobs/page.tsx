'use client';

import React, { useState, useEffect } from 'react';
import { getAllJobs, addJob, updateJob, deleteJob } from '@/lib/jobs-service';
import { Job, JobRequirement } from '@/lib/jobs-service';
import { Trash2, Edit, Plus, Search, Filter, Download } from 'lucide-react';
import Link from 'next/link';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for new/edit job
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    category: 'Education',
    skills: ''
  });

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

  const handleDelete = (jobId: number) => {
    if (confirm('Are you sure you want to delete this job?')) {
      // Delete the job using the job service
      const success = deleteJob(jobId);
      
      if (success) {
        // Update the local state as well
        const updatedJobs = jobs.filter(job => job.id !== jobId);
        setJobs(updatedJobs);
        alert('Job deleted successfully.');
      } else {
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const openAddModal = () => {
    // Reset form data
    setFormData({
      title: '',
      organization: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      category: 'Education',
      skills: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      organization: job.organization,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      category: job.category,
      skills: job.skills.join(', ')
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showAddModal) {
      // Create basic requirements for the new job
      const baseRequirements: JobRequirement[] = [
        { 
          id: 1, 
          text: 'Required qualification', 
          essential: true, 
          met: false 
        },
        { 
          id: 2, 
          text: 'Experience in this field', 
          essential: true, 
          met: false 
        }
      ];
      
      // Handle add job using the job service
      const newJobData = {
        title: formData.title,
        organization: formData.organization,
        location: formData.location,
        type: formData.type,
        posted: new Date().toISOString().split('T')[0],
        match: 0, // Not relevant for admin-created jobs
        salary: formData.salary,
        applicationDeadline: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        startDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0],
        description: formData.description,
        aboutOrganization: `${formData.organization} is an educational institution focused on providing quality education.`,
        responsibilities: ['Fulfill job duties as assigned', 'Work collaboratively with team members'],
        requirements: baseRequirements,
        benefits: ['Competitive salary', 'Professional development opportunities'],
        applicationProcess: 'Apply with resume and cover letter',
        category: formData.category,
        skills: formData.skills.split(',').map(skill => skill.trim())
      };
      
      const newJob = addJob(newJobData);
      
      // Update local state
      setJobs([...jobs, newJob]);
      alert('Job added successfully.');
    } else if (showEditModal && selectedJob) {
      // Handle edit job using the job service
      const updatedJobData = {
        title: formData.title,
        organization: formData.organization,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        category: formData.category,
        skills: formData.skills.split(',').map(skill => skill.trim())
      };
      
      const updatedJob = updateJob(selectedJob.id, updatedJobData);
      
      if (updatedJob) {
        // Update local state
        const updatedJobs = jobs.map(job => {
          if (job.id === selectedJob.id) {
            return updatedJob;
          }
          return job;
        });
        
        setJobs(updatedJobs);
        alert('Job updated successfully.');
      } else {
        alert('Failed to update job. Please try again.');
      }
    }
    
    closeModals();
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
        <h1 className="text-2xl font-bold">Job Management</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Job
        </button>
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
                    Posted
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
                    <td className="px-6 py-4 whitespace-nowrap">{job.posted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openEditModal(job)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Job</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization*
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location*
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type*
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      placeholder="e.g. £30,000 - £40,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    >
                      <option value="Education">Education</option>
                      <option value="Higher Education">Higher Education</option>
                      <option value="Education Support">Education Support</option>
                      <option value="Physical Education">Physical Education</option>
                      <option value="Educational Leadership">Educational Leadership</option>
                      <option value="Educational Technology">Educational Technology</option>
                      <option value="Educational Consultancy">Educational Consultancy</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma separated)*
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    placeholder="e.g. Teaching, Curriculum Development, Assessment"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description*
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 h-32"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Add Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Job</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization*
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location*
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type*
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      placeholder="e.g. £30,000 - £40,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3"
                      required
                    >
                      <option value="Education">Education</option>
                      <option value="Higher Education">Higher Education</option>
                      <option value="Education Support">Education Support</option>
                      <option value="Physical Education">Physical Education</option>
                      <option value="Educational Leadership">Educational Leadership</option>
                      <option value="Educational Technology">Educational Technology</option>
                      <option value="Educational Consultancy">Educational Consultancy</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma separated)*
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    placeholder="e.g. Teaching, Curriculum Development, Assessment"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description*
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 h-32"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  >
                    Update Job
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