'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  Tag, 
  FileText, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Upload, 
  MessageSquare,
  User
} from 'lucide-react';
import Link from 'next/link';
import { 
  getAllActivities, 
  updateActivity, 
  deleteActivity,
  addReflection,
  Activity,
  Feedback
} from '@/lib/activities-service';

// Sample evidence and competency data since these aren't in our activities service yet
const sampleEvidenceData = [
  { id: 1, name: 'Lesson Plan.pdf', type: 'document', url: '#' },
  { id: 2, name: 'Student Feedback.docx', type: 'document', url: '#' },
  { id: 3, name: 'Class Photo.jpg', type: 'image', url: '#' }
];

const sampleCompetencyData = [
  { id: 1, name: 'Curriculum Knowledge', level: 'Developing' },
  { id: 2, name: 'Classroom Management', level: 'Proficient' },
  { id: 3, name: 'Assessment Techniques', level: 'Developing' }
];

export default function ActivityDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity & { 
    evidence?: any[]; 
    competencies?: any[];
    verifiedBy?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Load the activity from localStorage
    const activityId = parseInt(params.id);
    const activities = getAllActivities();
    const foundActivity = activities.find(a => a.id === activityId);
    
    if (foundActivity) {
      // Add sample evidence and competencies since they're not in our activity service
      const enrichedActivity = {
        ...foundActivity,
        evidence: sampleEvidenceData,
        competencies: sampleCompetencyData,
        feedback: foundActivity.feedback || [],
        verifiedBy: foundActivity.status === 'verified' ? {
          name: foundActivity.mentor,
          role: 'Mentor',
          date: new Date().toISOString().split('T')[0],
          comments: 'Activity verified as completed successfully.'
        } : null
      };
      
      setActivity(enrichedActivity);
      setReflection(foundActivity.reflection || '');
    } else {
      // Activity not found
      alert('Activity not found');
      router.push('/activities');
    }
    setLoading(false);
  }, [params.id, router]);

  const handleReflectionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReflection(e.target.value);
  };

  const handleSaveReflection = () => {
    if (!activity) return;
    
    // Save reflection to localStorage
    const updatedActivity = addReflection(activity.id, reflection);
    
    if (updatedActivity) {
      // Update local state with the updated activity
      setActivity({
        ...activity,
        reflection: reflection,
        reflectionCompleted: true
      });
      setShowReflectionForm(false);
    }
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleSubmitFeedback = () => {
    if (!activity) return;
    
    const newFeedback: Feedback = {
      id: (activity.feedback?.length || 0) + 1,
      author: user?.name || 'Current User',
      role: user?.role || 'Mentor',
      date: new Date().toISOString().split('T')[0],
      content: feedback
    };
    
    const updatedFeedback = [...(activity.feedback || []), newFeedback];
    
    // Update the activity in localStorage with proper typing
    const result = updateActivity(activity.id, {
      feedback: updatedFeedback
    } as Partial<Activity>);
    
    if (result) {
      // Update local state
      setActivity({
        ...activity,
        feedback: updatedFeedback
      });
    }
    
    setFeedback('');
    setShowFeedbackForm(false);
  };

  const handleRequestVerification = () => {
    if (!activity) return;
    
    // In a real app, this would send a notification to the mentor
    alert('Verification request has been sent to your mentor.');
  };

  const handleDeleteActivity = () => {
    if (!activity) return;
    
    if (window.confirm('Are you sure you want to delete this activity?')) {
      // Delete from localStorage
      const deleted = deleteActivity(activity.id);
      
      if (deleted) {
        alert('Activity deleted successfully');
        router.push('/activities');
      }
    }
  };

  const handleMarkAsCompleted = () => {
    if (!activity) return;
    
    // Update status to 'completed' or equivalent in our activity model
    const updatedActivity = updateActivity(activity.id, {
      status: 'pending' // Set to pending to require verification
    });
    
    if (updatedActivity) {
      setActivity({
        ...activity,
        status: 'pending'
      });
      alert('Activity marked as completed and ready for verification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Activity Not Found</h1>
          <p className="text-gray-600 mb-6">The activity you're looking for doesn't exist or has been removed.</p>
          <Link href="/activities" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Back button */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/activities" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Activities
        </Link>
      </div>

      {/* Activity Header */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(activity.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {activity.duration} minutes
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  {activity.type}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.status === 'completed' ? 'Completed' : 'Planned'}
                </span>
                {activity.verified && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {activity.status === 'completed' && !activity.verified && (
                <button 
                  onClick={handleRequestVerification}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Request Verification
                </button>
              )}
              {activity.status === 'planned' && (
                <button 
                  onClick={handleMarkAsCompleted}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Completed
                </button>
              )}
              {activity.status !== 'completed' && (
                <Link 
                  href={`/activities/${activity.id}/edit`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Activity Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{activity.description}</p>
              
              {/* Reflection Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Reflection</h3>
                  {activity.status === 'completed' && !showReflectionForm && (
                    <button 
                      onClick={() => setShowReflectionForm(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {activity.reflection ? 'Edit Reflection' : 'Add Reflection'}
                    </button>
                  )}
                </div>
                
                {showReflectionForm ? (
                  <div>
                    <textarea
                      value={reflection}
                      onChange={handleReflectionChange}
                      rows={6}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                      placeholder="Reflect on what went well, what you learned, and what you might do differently next time."
                    ></textarea>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowReflectionForm(false)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveReflection}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Save Reflection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    {activity.reflection ? (
                      <p className="text-gray-700">{activity.reflection}</p>
                    ) : (
                      <p className="text-gray-500 italic">No reflection has been added yet.</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Competencies Section */}
              {activity.competencies && activity.competencies.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Competencies Demonstrated</h3>
                  <div className="space-y-3">
                    {activity.competencies.map((competency: any) => (
                      <div key={competency.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-700">{competency.name}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          competency.level === 'Advanced' ? 'bg-green-100 text-green-800' :
                          competency.level === 'Proficient' ? 'bg-blue-100 text-blue-800' :
                          competency.level === 'Developing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {competency.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Evidence Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Evidence</CardTitle>
              {activity.status === 'completed' && (
                <button 
                  onClick={() => setShowEvidenceUpload(!showEvidenceUpload)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Add Evidence
                </button>
              )}
            </CardHeader>
            <CardContent>
              {showEvidenceUpload && (
                <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-md">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to select files</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      id="evidence-upload" 
                      multiple 
                    />
                    <label 
                      htmlFor="evidence-upload"
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm inline-block cursor-pointer"
                    >
                      Select Files
                    </label>
                  </div>
                </div>
              )}
              
              {activity.evidence && activity.evidence.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {activity.evidence.map((evidence: any) => (
                    <li key={evidence.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-700">{evidence.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <a 
                          href={evidence.url} 
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No evidence has been uploaded yet.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Feedback Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Feedback</CardTitle>
              {user?.role === 'mentor' && activity.status === 'completed' && (
                <button 
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Add Feedback
                </button>
              )}
            </CardHeader>
            <CardContent>
              {showFeedbackForm && (
                <div className="mb-6">
                  <textarea
                    value={feedback}
                    onChange={handleFeedbackChange}
                    rows={4}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                    placeholder="Provide constructive feedback on this activity..."
                  ></textarea>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              )}
              
              {activity.feedback && activity.feedback.length > 0 ? (
                <div className="space-y-4">
                  {activity.feedback.map((item: any) => (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-start mb-2">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.author}</p>
                          <p className="text-xs text-gray-500">{item.role} • {new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{item.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No feedback has been provided yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Verification and Actions */}
        <div className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.verified ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Verified Activity</p>
                      <p className="text-sm text-gray-500">
                        Verified on {new Date(activity.verifiedBy.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Verified by:</p>
                    <p className="text-gray-900">{activity.verifiedBy.name}</p>
                    <p className="text-sm text-gray-500">{activity.verifiedBy.role}</p>
                  </div>
                  
                  {activity.verifiedBy.comments && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Verification Comments:</p>
                      <p className="text-gray-700">{activity.verifiedBy.comments}</p>
                    </div>
                  )}
                </div>
              ) : activity.status === 'completed' ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-100 rounded-full p-2 mr-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pending Verification</p>
                      <p className="text-sm text-gray-500">
                        This activity has not been verified yet.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleRequestVerification}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Request Verification
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-full p-2 mr-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Not Completed</p>
                    <p className="text-sm text-gray-500">
                      Complete this activity to request verification.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.status === 'planned' && (
                  <button 
                    onClick={handleMarkAsCompleted}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </button>
                )}
                
                {activity.status !== 'completed' && (
                  <Link 
                    href={`/activities/${activity.id}/edit`}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Activity
                  </Link>
                )}
                
                <button 
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download as PDF
                </button>
                
                {activity.status !== 'completed' && (
                  <button 
                    className="w-full px-4 py-2 bg-white border border-red-300 text-red-700 rounded-md hover:bg-red-50 flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Activity
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 