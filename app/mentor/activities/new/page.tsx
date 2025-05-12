'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  Calendar,
  Clock,
  FileText,
  ArrowLeft,
  Check,
  Book,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

// Import types
import { MentorStudent } from '@/lib/mentor-student-service';

// Activity type options from the schema
const activityTypes = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'research', label: 'Research' },
  { value: 'project', label: 'Project' },
  { value: 'coursework', label: 'Coursework' },
  { value: 'other', label: 'Other' },
];

interface FormData {
  title: string;
  date_completed: string;
  duration_minutes: string;
  activity_type: string;
  description: string;
  evidence_url: string;
  student_id: string;
  learning_outcomes: string;
  feedback_comments: string;
}

export default function NewMentorActivityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState<MentorStudent[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    date_completed: new Date().toISOString().split('T')[0],
    duration_minutes: '60',
    activity_type: 'workshop',
    description: '',
    evidence_url: '',
    student_id: '',
    learning_outcomes: '',
    feedback_comments: ''
  });
  
  // Fetch assigned students for the mentor
  useEffect(() => {
    if (!user || user.role !== 'mentor') {
      router.push('/mentor/activities');
      return;
    }

    const fetchAssignedStudents = async () => {
      try {
        const response = await fetch('/api/students', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch assigned students');
        }
        
        const data = await response.json();
        setAssignedStudents(data);
        
        // If we have students, set the first one as default
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            student_id: data[0].student_id
          }));
        }
      } catch (error) {
        console.error('Error fetching assigned students:', error);
        toast({
          title: "Error",
          description: "Failed to load your assigned students. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchAssignedStudents();
  }, [user, router, toast]);

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
      // Validate student is assigned to this mentor
      if (!assignedStudents.some(s => s.student_id === formData.student_id)) {
        throw new Error('You can only create activities for your assigned students');
      }
      
      const activityData = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes),
        status: 'submitted', // Activities created by mentors are automatically submitted
        assigned_by: user?.id // Track who assigned this activity
      };
      
      // Send request to create the activity
      const response = await fetch('/api/mentor/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(activityData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create activity');
      }
      
      // Show success message
      toast({
        title: "Activity Created",
        description: "The activity has been created and assigned to the student."
      });
      
      // Redirect to the activities list
      router.push('/mentor/activities');
    } catch (error) {
      console.error('Error creating activity:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create activity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'mentor') {
    return null; // Don't render anything if not authenticated or not a mentor
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/mentor/activities" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Activities
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Activity for Student</h1>
        <p className="text-gray-600 mt-1">
          Assign a new professional development activity to one of your students
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
              {/* Student Selection */}
              <div className="col-span-full">
                <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Student*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="student_id"
                    name="student_id"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm pl-10 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.student_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a student</option>
                    {assignedStudents.map(student => (
                      <option key={student.student_id} value={student.student_id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
                {assignedStudents.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    You don't have any assigned students. Please contact an administrator.
                  </p>
                )}
              </div>

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
                <label htmlFor="date_completed" className="block text-sm font-medium text-gray-700 mb-1">
                  Date*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="date_completed"
                    name="date_completed"
                    type="date"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm pl-10 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.date_completed}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 60"
                    className="w-full rounded-md border-gray-300 shadow-sm pl-10 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Activity Type */}
              <div>
                <label htmlFor="activity_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Book className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="activity_type"
                    name="activity_type"
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm pl-10 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.activity_type}
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
                  placeholder="Describe what the student should do during this activity..."
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Learning Outcomes */}
              <div className="col-span-full">
                <label htmlFor="learning_outcomes" className="block text-sm font-medium text-gray-700 mb-1">
                  Learning Outcomes
                </label>
                <textarea
                  id="learning_outcomes"
                  name="learning_outcomes"
                  rows={3}
                  placeholder="What should the student learn from this activity?"
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.learning_outcomes}
                  onChange={handleChange}
                />
              </div>

              {/* Evidence URL */}
              <div className="col-span-full">
                <label htmlFor="evidence_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence URL
                </label>
                <input
                  id="evidence_url"
                  name="evidence_url"
                  type="text"
                  placeholder="e.g., https://drive.google.com/file/..."
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.evidence_url}
                  onChange={handleChange}
                />
              </div>

              {/* Feedback/Comments */}
              <div className="col-span-full">
                <label htmlFor="feedback_comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Feedback/Comments
                </label>
                <textarea
                  id="feedback_comments"
                  name="feedback_comments"
                  rows={3}
                  placeholder="Any initial feedback or comments for the student..."
                  className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.feedback_comments}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-4 border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/mentor/activities')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || assignedStudents.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Activity
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 