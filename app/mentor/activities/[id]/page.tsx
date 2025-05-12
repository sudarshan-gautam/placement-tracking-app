"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, FileText, ArrowLeft, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Activity = {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date_completed: string;
  duration_minutes: number;
  evidence_url?: string;
  status: string;
  student_id: string;
  student_name: string;
  verification_id?: string;
  verification_status?: string;
  feedback?: string;
  verified_by_name?: string | null;
  created_at: string;
  updated_at: string;
  assigned_by?: string;
  assigned_by_name?: string;
};

export default function MentorActivityDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const activityId = params.id as string;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch activity data
  useEffect(() => {
    const fetchActivityDetails = async () => {
      if (!user || !activityId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Fetch activity details
        const response = await fetch(`/api/activities/${activityId}`, { headers });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activity: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setActivity(data);
        
        // Pre-fill feedback if it exists
        if (data.feedback) {
          setFeedback(data.feedback);
        }
      } catch (error) {
        console.error("Error fetching activity details:", error);
        setError("Failed to load activity details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityDetails();
  }, [user, activityId]);

  // Helper function to render status badge
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />Verified
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
          <AlertCircle className="h-3 w-3 mr-1" />Pending
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          <XCircle className="h-3 w-3 mr-1" />Rejected
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
          Not Submitted
        </Badge>;
    }
  };

  // Handle verification
  const handleVerification = async (status: 'verified' | 'rejected') => {
    if (!user || !activity) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare auth header and request body
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      
      const body = JSON.stringify({
        activity_id: activity.id,
        verification_status: status,
        feedback: feedback.trim() || undefined
      });
      
      // Submit verification
      const response = await fetch('/api/verifications/activities', {
        method: 'POST',
        headers,
        body
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      const updatedActivity = { 
        ...activity, 
        verification_status: status, 
        feedback: feedback,
        verified_by_name: user.name
      };
      
      setActivity(updatedActivity);
      
      // Show success message
      toast({
        title: status === 'verified' ? "Activity Verified" : "Activity Rejected",
        description: status === 'verified' 
          ? "The activity has been successfully verified." 
          : "The activity has been rejected with feedback.",
        variant: "default"
      });
      
    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to submit verification. Please try again.");
      
      toast({
        title: "Verification Error",
        description: "There was a problem submitting your verification.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/mentor/activities')}
          className="flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Activities</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          </CardContent>
        </Card>
      ) : activity ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Activity Main Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">{activity.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {renderStatusBadge(activity.verification_status)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {activity.activity_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground mt-1">{activity.description || "No description provided."}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Completed: {formatDate(activity.date_completed)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Duration: {activity.duration_minutes} minutes</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Student: {activity.student_name}</span>
                    </div>
                    
                    {activity.evidence_url && (
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={activity.evidence_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Evidence
                        </a>
                      </div>
                    )}
                    
                    {activity.assigned_by_name && activity.assigned_by !== activity.student_id && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Assigned by: {activity.assigned_by_name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Verification Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="feedback">Feedback</Label>
                      <Textarea 
                        id="feedback"
                        placeholder="Provide feedback for the student about this activity..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="mt-1"
                        rows={4}
                        disabled={activity.verification_status === 'verified' || activity.verification_status === 'rejected'}
                      />
                    </div>
                    
                    {activity.verification_status === 'pending' && (
                      <div className="flex space-x-2 justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={submitting}>
                              {submitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Activity?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this activity? The student will be notified and will need to make changes based on your feedback.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleVerification('rejected')}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="default" disabled={submitting}>
                              {submitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Verify
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Verify Activity?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to verify this activity? This confirms that the student has completed this activity as described.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleVerification('verified')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Verify
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                    
                    {(activity.verification_status === 'verified' || activity.verification_status === 'rejected') && (
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {activity.verification_status === 'verified' ? 'Verified' : 'Rejected'} by{' '}
                          {activity.verified_by_name || 'Unknown'} on{' '}
                          {formatDate(activity.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{activity.student_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-medium">{activity.student_id}</span>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/mentor/students/${activity.student_id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                      </div>
                    </div>
                    
                    {activity.status === 'submitted' && (
                      <div className="flex items-start space-x-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Submitted for Verification</p>
                          <p className="text-xs text-muted-foreground">{formatDate(activity.updated_at)}</p>
                        </div>
                      </div>
                    )}
                    
                    {(activity.verification_status === 'verified' || activity.verification_status === 'rejected') && (
                      <div className="flex items-start space-x-2">
                        <div className={`h-2 w-2 rounded-full ${activity.verification_status === 'verified' ? 'bg-green-500' : 'bg-red-500'} mt-2`}></div>
                        <div>
                          <p className="text-sm font-medium capitalize">{activity.verification_status}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(activity.updated_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              Activity not found or you don't have permission to view it.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 