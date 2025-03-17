'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Filter, Briefcase, MapPin, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import Link from 'next/link';

// Sample job data
const jobsData = [
  {
    id: 1,
    title: 'Primary School Teacher',
    organization: 'London City School',
    location: 'London, UK',
    type: 'Full-time',
    posted: '2023-07-10',
    match: 85,
    description: 'Experienced primary school teacher needed for Year 3 class. Responsibilities include curriculum planning, assessment, and creating an engaging learning environment.',
    requirements: [
      { id: 1, text: 'Bachelor\'s degree in Education', essential: true, met: true },
      { id: 2, text: 'Qualified Teacher Status (QTS)', essential: true, met: true },
      { id: 3, text: 'Minimum 2 years teaching experience', essential: true, met: true },
      { id: 4, text: 'Experience with SEN students', essential: false, met: false },
      { id: 5, text: 'First Aid certification', essential: false, met: true },
    ]
  },
  {
    id: 2,
    title: 'Secondary School English Teacher',
    organization: 'Oakridge Academy',
    location: 'Manchester, UK',
    type: 'Full-time',
    posted: '2023-07-12',
    match: 72,
    description: 'English teacher needed for Key Stage 3 and 4. The successful candidate will be responsible for teaching English Language and Literature to students aged 11-16.',
    requirements: [
      { id: 1, text: 'Bachelor\'s degree in English or related field', essential: true, met: true },
      { id: 2, text: 'Qualified Teacher Status (QTS)', essential: true, met: true },
      { id: 3, text: 'Experience teaching GCSE English', essential: true, met: false },
      { id: 4, text: 'Ability to teach A-Level English', essential: false, met: false },
      { id: 5, text: 'Experience with curriculum development', essential: false, met: true },
    ]
  },
  {
    id: 3,
    title: 'Teaching Assistant',
    organization: 'Greenfield Primary School',
    location: 'Birmingham, UK',
    type: 'Part-time',
    posted: '2023-07-15',
    match: 90,
    description: 'Teaching Assistant needed to support classroom teachers with students aged 5-11. Responsibilities include providing one-on-one support to students, assisting with classroom activities, and supporting the teacher with administrative tasks.',
    requirements: [
      { id: 1, text: 'Level 3 Teaching Assistant qualification', essential: true, met: true },
      { id: 2, text: 'Experience working with primary school children', essential: true, met: true },
      { id: 3, text: 'Good literacy and numeracy skills', essential: true, met: true },
      { id: 4, text: 'First Aid certification', essential: false, met: true },
      { id: 5, text: 'Experience with SEN students', essential: false, met: true },
    ]
  },
  {
    id: 4,
    title: 'Physical Education Teacher',
    organization: 'Westside Secondary School',
    location: 'Liverpool, UK',
    type: 'Full-time',
    posted: '2023-07-08',
    match: 65,
    description: 'PE teacher needed for all key stages. The successful candidate will be responsible for planning and delivering PE lessons, organizing sports events, and promoting physical activity throughout the school.',
    requirements: [
      { id: 1, text: 'Bachelor\'s degree in Physical Education', essential: true, met: true },
      { id: 2, text: 'Qualified Teacher Status (QTS)', essential: true, met: true },
      { id: 3, text: 'Experience coaching team sports', essential: true, met: false },
      { id: 4, text: 'First Aid certification', essential: true, met: true },
      { id: 5, text: 'Swimming instructor qualification', essential: false, met: false },
    ]
  },
];

export default function JobsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    match: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const toggleJobExpand = (jobId: number) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      type: '',
      match: 0,
    });
  };

  // Filter jobs based on search term and filters
  const filteredJobs = jobsData.filter(job => {
    // Search term filter
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !job.organization.toLowerCase().includes(searchTerm.toLowerCase())) {
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
    
    return true;
  });

  // Get unique locations and job types for filter options
  const locations = Array.from(new Set(jobsData.map(job => job.location)));
  const jobTypes = Array.from(new Set(jobsData.map(job => job.type)));

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
                  onChange={(e) => handleFilterChange('match', parseInt(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={0}>Any Match</option>
                  <option value={50}>50% or higher</option>
                  <option value={70}>70% or higher</option>
                  <option value={80}>80% or higher</option>
                  <option value={90}>90% or higher</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Listings */}
      <div className="space-y-6">
        {filteredJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No jobs found matching your criteria.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <div 
                className="cursor-pointer"
                onClick={() => toggleJobExpand(job.id)}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                    <p className="text-gray-600">{job.organization}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Match: <span className="text-blue-600">{job.match}%</span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${job.match}%` }}
                      ></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Posted: {new Date(job.posted).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 line-clamp-2">
                      {job.description}
                    </p>
                    {expandedJob === job.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 ml-2 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Expanded job details */}
              {expandedJob === job.id && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium mb-4">Requirements</h3>
                  <div className="space-y-3 mb-6">
                    {job.requirements.map((req) => (
                      <div key={req.id} className="flex items-start">
                        <div className={`h-5 w-5 rounded-full flex-shrink-0 mr-3 ${
                          req.met ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <div className={`h-full w-full flex items-center justify-center text-xs font-bold ${
                            req.met ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {req.met ? '✓' : '✗'}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-700">{req.text}</p>
                          <p className="text-xs text-gray-500">
                            {req.essential ? 'Essential' : 'Desirable'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Full Details
                    </Link>
                    <Link
                      href={`/profile/job-match/${job.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Detailed Match Analysis
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 