'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  CheckCircle, 
  AlarmClock,
  XCircle,
  MessageSquare,
  Edit,
  FileText,
  Award,
  Book,
  User,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '../../../types/separator';
import { Activity } from '@/lib/activities-service';
import { getAllActivities } from '@/lib/activities-service';

export default function StudentActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not a student
    if (user && user.role !== 'student') {
      router.push(`/activities/${params.id}`);
      return;
    }

    const fetchActivityDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, we would fetch from the API
        // For now, we'll use the localStorage data
        const allActivities = getAllActivities();
        const activityData = allActivities.find(a => a.id.toString() === params.id);
        
        if (!activityData) {
          setError('Activity not found');
          setLoading(false);
          return;
        }
        
        setActivity(activityData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activity details:', error);
        setError('Failed to fetch activity details');
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [user, router, params.id]);

  // Format date in a user-friendly way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Function to determine status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlarmClock className="h-4 w-4 mr-2" />
            Pending Verification
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-2" />
            Needs Revision
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <p className="mt-4 text-gray-600">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error || 'Activity not found'}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/student/activities')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = activity.status === 'pending' || activity.status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-32">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/student/activities')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Activities
        </Button>
      </div>

      {/* Activity Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{activity.title}</h1>
            <p className="text-gray-600 mt-1">Activity ID: {activity.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(activity.status)}
            {canEdit && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => router.push(`/student/activities/${activity.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Activity
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activity Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <p>{formatDate(activity.date)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <p>{activity.duration}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Activity Type</h3>
              <div className="flex items-center">
                <Book className="h-5 w-5 text-gray-400 mr-2" />
                <p>{activity.type}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mentor</h3>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <p>{activity.mentor || 'Not assigned'}</p>
              </div>
            </div>

            {activity.assigned_by_name && activity.assigned_by !== activity.student_id && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned By</h3>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <p>{activity.assigned_by_name}</p>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{activity.description || 'No description provided.'}</p>
          </div>

          {/* Learning Outcomes */}
          {activity.learningOutcomes && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Learning Outcomes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{activity.learningOutcomes}</p>
              </div>
            </>
          )}

          {/* Reflection */}
          {activity.reflection && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Reflection</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{activity.reflection}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Verification Status Card */}
      <Card className={`mb-6 ${
        activity.status === 'verified' ? 'bg-green-50 border-green-200' : 
        activity.status === 'rejected' ? 'bg-red-50 border-red-200' : 
        'bg-yellow-50 border-yellow-200'
      }`}>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            {activity.status === 'verified' ? (
              <>
                <Award className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-green-800">Verification Status</span>
              </>
            ) : activity.status === 'rejected' ? (
              <>
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                <span className="text-red-800">Needs Revision</span>
              </>
            ) : (
              <>
                <AlarmClock className="h-5 w-5 mr-2 text-yellow-600" />
                <span className="text-yellow-800">Pending Review</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.status === 'verified' && (
            <div className="text-green-700">
              <p className="mb-2">
                This activity has been verified by your mentor. It is now part of your official professional development record.
              </p>
              <div className="flex items-center mt-4">
                <User className="h-5 w-5 mr-2 text-green-600" />
                <p className="font-medium">Verified by: {activity.mentor}</p>
              </div>
              {activity.feedbackComments && (
                <div className="mt-4 p-4 bg-white rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Feedback from mentor:</h4>
                  <p className="text-gray-700">{activity.feedbackComments}</p>
                </div>
              )}
            </div>
          )}

          {activity.status === 'rejected' && (
            <div className="text-red-700">
              <p className="mb-2">
                Your activity needs revision based on mentor feedback. Please address the issues and resubmit.
              </p>
              <div className="mt-4 p-4 bg-white rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Feedback from mentor:</h4>
                <p className="text-gray-700">{activity.feedbackComments || activity.rejectionReason || 'No specific feedback provided.'}</p>
              </div>
              <div className="mt-4 flex">
                <Button 
                  onClick={() => router.push(`/student/activities/${activity.id}/edit`)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Revise Activity
                </Button>
              </div>
            </div>
          )}

          {activity.status === 'pending' && (
            <div className="text-yellow-700">
              <p>
                Your activity is currently under review by your mentor. You will be notified when it's verified.
              </p>
              <p className="mt-2 text-sm">
                You can still edit this activity while it's pending review.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Card (if any) */}
      {activity.evidence && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{activity.evidence}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activity.status === 'pending' && (
              <Button 
                variant="outline" 
                className="flex items-center justify-center"
                onClick={() => router.push(`/student/activities/${activity.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Activity
              </Button>
            )}
            <Button 
              variant="outline" 
              className="flex items-center justify-center"
              onClick={() => router.push('/student/messages')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Mentor
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center"
              onClick={() => router.push('/student/activities/new')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Log Similar Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 