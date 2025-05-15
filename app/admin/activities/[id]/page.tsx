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
import { Loader2, Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, FileText, ArrowLeft, Link as LinkIcon, RotateCw } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

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

type VerificationLog = {
  id: string;
  activity_id: string;
  verification_status: string;
  verified_by: string;
  verified_by_name: string;
  feedback: string;
  created_at: string;
};

export default function AdminActivityDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const activityId = params.id as string;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

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
        const response = await fetch(`/api/admin/activities/${activityId}`, { headers });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to fetch activity: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || Object.keys(data).length === 0) {
          throw new Error('Activity not found or no data returned');
        }
        
        setActivity(data);
        
        // Pre-fill feedback if it exists
        if (data.feedback) {
          setFeedback(data.feedback);
        }
      } catch (error) {
        console.error("Error fetching activity details:", error);
        setError(error instanceof Error ? error.message : "Failed to load activity details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityDetails();
  }, [user, activityId]);

  // Fetch verification logs
  useEffect(() => {
    const fetchVerificationLogs = async () => {
      if (!user || !activityId) return;
      
      try {
        setIsLogsLoading(true);
        
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Fetch verification logs
        const response = await fetch(`/api/admin/activities/${activityId}/logs`, { headers });
        
        if (!response.ok) {
          console.error(`Failed to fetch verification logs: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        setVerificationLogs(data);
      } catch (error) {
        console.error("Error fetching verification logs:", error);
      } finally {
        setIsLogsLoading(false);
      }
    };
    
    if (activeTab === "history") {
      fetchVerificationLogs();
    }
  }, [user, activityId, activeTab]);

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
        feedback: feedback.trim() || undefined,
        admin_override: true
      });
      
      // Submit verification
      const response = await fetch('/api/admin/verifications/activities', {
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

  // Reset verification status
  const resetVerification = async () => {
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
        reset: true
      });
      
      // Reset verification
      const response = await fetch('/api/admin/verifications/activities/reset', {
        method: 'POST',
        headers,
        body
      });
      
      if (!response.ok) {
        throw new Error(`Reset failed: ${response.status} ${response.statusText}`);
      }
      
      // Update local state with corrected null type
      const updatedActivity: Activity = { 
        ...activity, 
        verification_status: 'pending', 
        feedback: '',
        verified_by_name: null
      };
      
      setActivity(updatedActivity);
      setFeedback('');
      
      // Show success message
      toast({
        title: "Verification Reset",
        description: "The activity verification status has been reset to pending.",
        variant: "default"
      });
      
    } catch (error) {
      console.error("Reset error:", error);
      setError("Failed to reset verification. Please try again.");
      
      toast({
        title: "Reset Error",
        description: "There was a problem resetting the verification status.",
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
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/admin/activities')}
          className="flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Activities</span>
        </Button>
        
        {activity && activity.verification_status !== 'pending' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <RotateCw className="h-4 w-4" />
                <span>Reset Verification</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Verification Status?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset the verification status to 'pending' and clear any feedback. This action is logged and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetVerification}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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
          <Card>
            <CardHeader className="pb-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{activity.title}</CardTitle>
                  <div className="mt-2 flex items-center">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Student: {activity.student_name}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize px-3 py-1">
                  {activity.activity_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{activity.description || "No description provided."}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground mb-1">Completion Date</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-primary mr-2" />
                        <span className="font-medium">{formatDate(activity.date_completed)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground mb-1">Duration</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-primary mr-2" />
                        <span className="font-medium">{activity.duration_minutes} minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground mb-1">Status</span>
                      <div className="flex items-center">
                        {renderStatusBadge(activity.verification_status)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {activity.evidence_url && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">Evidence</h3>
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 text-primary mr-2" />
                      <a 
                        href={activity.evidence_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Evidence
                      </a>
                    </div>
                  </div>
                )}
                
                {activity.assigned_by_name && activity.assigned_by !== activity.student_id && (
                  <div className="border-t pt-6">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">Assigned by: {activity.assigned_by_name}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <Button 
                variant="outline"
                onClick={() => router.push(`/admin/activities/${activity.id}/edit`)}
                disabled={submitting}
              >
                Edit Activity
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={submitting}>
                    Delete Activity
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the activity
                      and remove all associated verification data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/admin/activities/${activity.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to delete activity');
                          }
                          
                          toast({
                            title: "Activity Deleted",
                            description: "The activity has been successfully deleted.",
                          });
                          
                          router.push('/admin/activities');
                        } catch (error) {
                          console.error('Error deleting activity:', error);
                          toast({
                            title: "Error",
                            description: "Failed to delete activity. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="history">Verification History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="verification" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea 
                          id="feedback"
                          placeholder="Provide feedback for the student about this activity..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-medium">Current Status</div>
                        <div className="flex items-center space-x-2">
                          {renderStatusBadge(activity.verification_status)}
                        </div>
                        
                        {(activity.verification_status === 'verified' || activity.verification_status === 'rejected') && (
                          <>
                            <div className="text-sm text-muted-foreground mt-4">
                              <div>Verified by: {activity.verified_by_name || 'Unknown'}</div>
                              <div>Date: {formatDate(activity.updated_at)}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLogsLoading ? (
                    <div className="flex justify-center items-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : verificationLogs.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No verification history found for this activity.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {verificationLogs.map((log, index) => (
                        <div key={log.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {log.verification_status === 'verified' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : log.verification_status === 'rejected' ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="font-medium capitalize">{log.verification_status}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(log.created_at)}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm">By: {log.verified_by_name}</span>
                          </div>
                          {log.feedback && (
                            <div className="mt-2 bg-muted p-3 rounded-md">
                              <span className="text-sm">{log.feedback}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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