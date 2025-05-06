'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Calendar,
  Clock,
  FileText,
  ArrowLeft,
  Upload,
  Plus,
  X,
  Check,
  Book
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { addActivity } from '@/lib/activities-service';
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
  learningOutcomes: string;
  reflection: string;
  evidence: string;
}

export default function NewActivityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: '1h',
    type: 'Teaching',
    description: '',
    learningOutcomes: '',
    reflection: '',
    evidence: ''
  });
  
  // Redirect if not a student
  if (user && user.role !== 'student') {
    router.push('/activities/new');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Add activity using the service
      const newActivity = addActivity({
        ...formData,
        status: 'pending',
        reflectionCompleted: !!formData.reflection,
        mentor: 'Pending Assignment',
        student: user?.name || 'Student',
        studentId: user?.id || 1,
        location: 'University Placement',
      });
      
      // Show success message
      toast({
        title: "Activity Logged Successfully",
        description: "Your activity has been submitted for verification."
      });
      
      // Redirect to the activity list page
      router.push('/student/activities');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to log your activity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/student/activities')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Activities
        </Button>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Log New Activity</h1>
        <p className="text-gray-600 mt-1">
          Record a new professional development activity for verification
        </p>
      </div>

      {/* Activity Form */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="col-span-full">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Title*
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g., Classroom Observation at Springfield Elementary"
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm pl-10 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="duration"
                    name="duration"
                    type="text"
                    required
                    placeholder="e.g., 2h or 90m"
                    className="w-full rounded-md border-gray-300 shadow-sm pl-10 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.duration}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Activity Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Book className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="type"
                    name="type"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm pl-10 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Describe what you did during this activity..."
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Learning Outcomes */}
              <div className="col-span-full">
                <label htmlFor="learningOutcomes" className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Outcomes
                </label>
                <textarea
                  id="learningOutcomes"
                  name="learningOutcomes"
                  rows={3}
                  placeholder="What did you learn from this activity?"
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.learningOutcomes}
                  onChange={handleChange}
                />
              </div>

              {/* Reflection */}
              <div className="col-span-full">
                <label htmlFor="reflection" className="block text-sm font-medium text-gray-700 mb-1">
                  Reflection
                </label>
                <textarea
                  id="reflection"
                  name="reflection"
                  rows={3}
                  placeholder="Reflect on your experience and what you would do differently next time..."
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.reflection}
                  onChange={handleChange}
                />
              </div>

              {/* Evidence */}
              <div className="col-span-full">
                <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence
                </label>
                <textarea
                  id="evidence"
                  name="evidence"
                  rows={3}
                  placeholder="Describe or list any evidence you have to support this activity..."
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.evidence}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Note: File upload feature will be available in a future update.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/student/activities')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Activity
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 