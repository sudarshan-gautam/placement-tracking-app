'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Tag, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

// Activity types for selection
const activityTypes = [
  'Teaching',
  'Professional Development',
  'Planning',
  'Communication',
  'Assessment',
  'Other',
];

export default function NewActivityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    description: '',
    reflection: '',
    status: 'planned',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Activity type is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Valid duration is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real app, this would call an API to save the activity
      console.log('Submitting activity:', formData);
      alert('Activity created successfully!');
      router.push('/activities');
    }
  };

  const handleMarkAsCompleted = () => {
    setFormData({
      ...formData,
      status: 'completed',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Back button */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link href="/activities" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </Link>
      </div>

      {/* Page Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Activity</h1>
        <p className="text-gray-600">Record a new professional activity for your portfolio</p>
      </div>

      {/* Activity Form */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                      errors.title 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="e.g., Primary School Teaching Session"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Type*
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                        errors.type 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    >
                      <option value="">Select Type</option>
                      {activityTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                        errors.date 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)*
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="1"
                      className={`block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                        errors.duration 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`block w-full rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                      errors.description 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Provide a detailed description of the activity..."
                  ></textarea>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="planned"
                        checked={formData.status === 'planned'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Planned</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="completed"
                        checked={formData.status === 'completed'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Completed</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Reflection Section (only shown if activity is marked as completed) */}
          {formData.status === 'completed' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Reflection</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-1">
                    Reflect on your experience
                  </label>
                  <textarea
                    id="reflection"
                    name="reflection"
                    value={formData.reflection}
                    onChange={handleInputChange}
                    rows={6}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Reflect on what went well, what you learned, and what you might do differently next time..."
                  ></textarea>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Competencies Section (only shown if activity is marked as completed) */}
          {formData.status === 'completed' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Competencies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Select the competencies demonstrated in this activity and your self-assessment of your level.
                </p>
                
                {/* This would be dynamically generated based on a list of competencies */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="comp-1"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="comp-1" className="ml-2 text-sm text-gray-700">
                        Curriculum Knowledge
                      </label>
                    </div>
                    <select className="block rounded-md border-gray-300 shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Level</option>
                      <option value="Developing">Developing</option>
                      <option value="Proficient">Proficient</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="comp-2"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="comp-2" className="ml-2 text-sm text-gray-700">
                        Classroom Management
                      </label>
                    </div>
                    <select className="block rounded-md border-gray-300 shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Level</option>
                      <option value="Developing">Developing</option>
                      <option value="Proficient">Proficient</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="comp-3"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="comp-3" className="ml-2 text-sm text-gray-700">
                        Assessment Techniques
                      </label>
                    </div>
                    <select className="block rounded-md border-gray-300 shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Level</option>
                      <option value="Developing">Developing</option>
                      <option value="Proficient">Proficient</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Evidence Upload Section (only shown if activity is marked as completed) */}
          {formData.status === 'completed' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Upload files as evidence of your activity (e.g., lesson plans, presentations, certificates).
                </p>
                
                <div className="p-4 border border-dashed border-gray-300 rounded-md text-center">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="evidence-upload" 
                    multiple 
                  />
                  <label 
                    htmlFor="evidence-upload"
                    className="cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">
                        Drag and drop files here, or click to select files
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-between">
            <Link
              href="/activities"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            
            <div className="space-x-3">
              {formData.status === 'planned' && (
                <button
                  type="button"
                  onClick={handleMarkAsCompleted}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Mark as Completed
                </button>
              )}
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Activity
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 