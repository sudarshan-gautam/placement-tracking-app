'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar,
  Clock,
  FileText,
  ArrowLeft,
  Upload,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';

// Activity type options
const activityTypes = [
  { value: 'Teaching', label: 'Teaching' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Development', label: 'Development' },
  { value: 'Observation', label: 'Observation' },
  { value: 'Assessment', label: 'Assessment' },
  { value: 'Other', label: 'Other' },
];

interface FormData {
  title: string;
  date: string;
  duration: string;
  type: string;
  description: string;
  reflection: string;
  outcomes: string[];
  files: File[];
}

interface FormErrors {
  title?: string;
  date?: string;
  duration?: string;
  type?: string;
  description?: string;
  submit?: string;
}

export default function NewActivityPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: '',
    duration: '',
    type: 'Teaching',
    description: '',
    reflection: '',
    outcomes: [''],
    files: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle outcome changes
  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes[index] = value;
    setFormData(prev => ({
      ...prev,
      outcomes: newOutcomes
    }));
  };
  
  // Add new outcome field
  const addOutcomeField = () => {
    setFormData(prev => ({
      ...prev,
      outcomes: [...prev.outcomes, '']
    }));
  };
  
  // Remove outcome field
  const removeOutcomeField = (index: number) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      outcomes: newOutcomes
    }));
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files as FileList)]
      }));
    }
  };
  
  // Remove a file
  const removeFile = (index: number) => {
    const newFiles = [...formData.files];
    newFiles.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      files: newFiles
    }));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.type) newErrors.type = 'Activity type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call an API endpoint to save the activity
      console.log('Submitting activity:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/activities');
      }, 2000);
    } catch (error) {
      console.error('Error submitting activity:', error);
      setErrors({ submit: 'Failed to submit activity. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/activities" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Activity</h1>
        <p className="text-gray-600">Record a new professional activity for your portfolio</p>
      </div>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Activity submitted successfully! Redirecting to activities page...
        </div>
      )}
      
      {/* Error Message */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {errors.submit}
        </div>
      )}
      
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g., Primary School Teaching Session"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            {/* Date and Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.date ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                </div>
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.duration ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="e.g., 2 hours"
                  />
                </div>
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>
            </div>
            
            {/* Activity Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${errors.type ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`block w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Describe what you did during this activity..."
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            
            {/* Learning Outcomes */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Learning Outcomes
                </label>
                <button
                  type="button"
                  onClick={addOutcomeField}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Outcome
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                What did you learn or achieve from this activity?
              </p>
              
              <div className="space-y-2">
                {formData.outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleOutcomeChange(index, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={`Outcome ${index + 1}`}
                    />
                    {formData.outcomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOutcomeField(index)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reflection */}
            <div>
              <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-1">
                Reflection
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Reflect on your experience and what you would do differently next time.
              </p>
              <textarea
                id="reflection"
                name="reflection"
                value={formData.reflection}
                onChange={handleChange}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your reflections on this activity..."
              ></textarea>
            </div>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evidence (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Upload documents, photos, or other evidence of your activity (max 5 files).
              </p>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload files</span>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        multiple
                        onChange={handleFileChange}
                        disabled={formData.files.length >= 5}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>
              
              {/* File List */}
              {formData.files.length > 0 && (
                <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-md">
                  {formData.files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div className="flex items-center">
                        <FileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Link
                href="/activities"
                className="mr-4 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Activity'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 