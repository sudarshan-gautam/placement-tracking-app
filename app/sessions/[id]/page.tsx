'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar, Clock, Users, BookOpen, ArrowLeft, Check, X, Edit, Save } from 'lucide-react';
import { Session, AGE_GROUPS } from '@/types/session';
import { getSessionById, updateSession, deleteSession } from '@/lib/sessions-service';
import { useAuth } from '@/lib/auth-context';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = parseInt(params.id as string);
  
  const [session, setSession] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    timeSpent: '',
    ageGroup: '',
    organization: '',
    topic: '',
    positives: '',
    developments: ''
  });

  // Create a mock user for demo purposes if none exists
  const mockUser = user || { id: 1, role: 'student', name: 'Student User' };
  const isAdmin = mockUser?.role === 'admin';
  const isMentor = mockUser?.role === 'mentor';
  const canApprove = isAdmin || isMentor;

  // Load session data
  useEffect(() => {
    if (sessionId) {
      const loadedSession = getSessionById(sessionId);
      if (loadedSession) {
        setSession(loadedSession);
        // Initialize form data
        setFormData({
          date: loadedSession.date,
          timeSpent: loadedSession.timeSpent,
          ageGroup: loadedSession.ageGroup,
          organization: loadedSession.organization,
          topic: loadedSession.topic,
          positives: loadedSession.positives,
          developments: loadedSession.developments
        });
      } else {
        // Session not found, redirect back to sessions list
        if (user?.role) {
          router.push(`/${user.role}/sessions`);
        } else {
          router.push('/');
        }
      }
    }
  }, [sessionId, router, user?.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    if (session) {
      // Reset form data to original session data
      setFormData({
        date: session.date,
        timeSpent: session.timeSpent,
        ageGroup: session.ageGroup,
        organization: session.organization,
        topic: session.topic,
        positives: session.positives,
        developments: session.developments
      });
    }
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (!session) return;
    
    setIsSaving(true);
    try {
      const updatedSession = updateSession(session.id, {
        ...formData,
        // Reset to pending if the content was changed
        status: 'pending',
        supervisorFeedback: 'Pending'
      });
      
      if (updatedSession) {
        setSession(updatedSession);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!session) return;
    
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const result = deleteSession(session.id);
        if (result) {
          router.push('/sessions');
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleApproveClick = async () => {
    if (!session) return;
    
    setIsSaving(true);
    try {
      const feedback = prompt('Enter feedback for this session:');
      if (feedback !== null) {
        const updatedSession = updateSession(session.id, {
          status: 'completed',
          supervisorFeedback: feedback
        });
        
        if (updatedSession) {
          setSession(updatedSession);
        }
      }
    } catch (error) {
      console.error('Error approving session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading session data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/sessions" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sessions
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              {isEditing ? 'Edit Session' : 'Session Details'}
            </h1>
            <p className="text-gray-600">{session.topic}</p>
            <div className="mt-2 flex space-x-2">
              <Link href={user?.role ? `/${user.role}/activities` : '/'} className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
                Activities
              </Link>
              <Link href={user?.role ? `/${user.role}/sessions` : '/'} className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                Teaching Sessions
              </Link>
            </div>
          </div>
          <div className="flex space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                {canApprove && session.status === 'pending' && (
                  <button
                    onClick={handleApproveClick}
                    disabled={isSaving}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                )}
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Details */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Session Information' : 'Session Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            /* Edit Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Spent (minutes)</label>
                  <input
                    type="number"
                    name="timeSpent"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter time in minutes"
                    min="1"
                    value={formData.timeSpent}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age Group</label>
                  <select 
                    name="ageGroup"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.ageGroup}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select age group</option>
                    {AGE_GROUPS.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization</label>
                  <input
                    type="text"
                    name="organization"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter organization name"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Topic</label>
                <input
                  type="text"
                  name="topic"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter the main topic of your session"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Key Positives</label>
                <textarea
                  name="positives"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="What went well in this session?"
                  value={formData.positives}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Areas for Development</label>
                <textarea
                  name="developments"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="What could be improved in future sessions?"
                  value={formData.developments}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {session.status === 'completed' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Date</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Duration</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {parseInt(session.timeSpent) / 60 < 1 
                      ? `${session.timeSpent} minutes` 
                      : `${(parseInt(session.timeSpent) / 60).toFixed(1)} hours`}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Age Group</div>
                  <div className="mt-1 text-sm text-gray-900">{session.ageGroup}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Organization</div>
                  <div className="mt-1 text-sm text-gray-900">{session.organization}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Topic</div>
                <div className="mt-1 text-sm text-gray-900">{session.topic}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Key Positives</div>
                <div className="mt-1 text-sm text-gray-900 whitespace-pre-line">{session.positives}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Areas for Development</div>
                <div className="mt-1 text-sm text-gray-900 whitespace-pre-line">{session.developments}</div>
              </div>

              {session.supervisorFeedback && session.supervisorFeedback !== 'Pending' && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Supervisor Feedback</div>
                  <div className="mt-1 text-sm text-gray-900 p-3 bg-blue-50 rounded-md">
                    {session.supervisorFeedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-between">
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 