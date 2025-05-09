'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { getJobById, updateJob, JobRequirement } from '@/lib/jobs-service';

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    category: 'Education',
    deadline: '',
    skills: ''
  });
  
  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const job = await getJobById(params.id);
        
        if (job) {
          setFormData({
            title: job.title,
            organization: job.organization,
            location: job.location,
            type: job.type,
            salary: job.salary,
            description: job.description,
            category: job.category || 'Education',
            deadline: job.applicationDeadline,
            skills: job.skills.join(', ')
          });
        } else {
          setError('Job not found');
        }
      } catch (error) {
        console.error('Error loading job:', error);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Parse the comma-separated skills into an array
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];
      
      const jobData = {
        title: formData.title,
        organization: formData.organization,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        category: formData.category,
        applicationDeadline: formData.deadline,
        skills: skillsArray
      };
      
      const updatedJob = await updateJob(params.id, jobData);
      
      if (updatedJob) {
        // Also update skills in job_skills table
        if (skillsArray.length > 0) {
          try {
            await fetch('/api/job-skills', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobId: params.id,
                skills: skillsArray
              })
            });
          } catch (skillsError) {
            console.error('Error updating job skills:', skillsError);
          }
        }
        
        alert('Job updated successfully');
        router.push('/admin/jobs');
      } else {
        setError('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Error updating job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/admin/jobs" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/jobs" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
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
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Internship">Internship</option>
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
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  placeholder="e.g. £30,000 - £40,000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                >
                  <option value="Education">Education</option>
                  <option value="Teaching">Teaching</option>
                  <option value="Administration">Administration</option>
                  <option value="Special Education">Special Education</option>
                  <option value="Early Years">Early Years</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Higher Education">Higher Education</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  placeholder="e.g. Teaching, Mathematics, Communication"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description*
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full border border-gray-300 rounded-md py-2 px-3"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <Link
                href="/admin/jobs"
                className="mr-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 