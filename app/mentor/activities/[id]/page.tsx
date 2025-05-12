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
        
        // Fetch activity details using the mentor-specific endpoint
        const response = await fetch(`/api/mentor/activities/${activityId}`, { headers });
        
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

  // Add handlers for updating and deleting activities
  const handleDelete = async () => {
    if (!user || !activity) return;
    
    try {
      setSubmitting(true);
      
      // Prepare auth header
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      
      // Delete the activity
      const response = await fetch(`/api/mentor/activities/${activityId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }
      
      // Show success message
      toast({
        title: "Activity Deleted",
        description: "The activity has been successfully deleted.",
        variant: "default"
      });
      
      // Redirect back to activities list
      router.push('/mentor/activities');
      
    } catch (error) {
      console.error("Delete error:", error);
      
      toast({
        title: "Delete Error",
        description: "There was a problem deleting the activity.",
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
        <div className="grid grid-cols-1 gap-6">
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
                        <Badge variant={activity.status === 'completed' ? 'default' : 'outline'}>
                          {activity.status === 'completed' ? 'Completed' : 
                           activity.status === 'submitted' ? 'Submitted' : 'Draft'}
                        </Badge>
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
                onClick={() => router.push(`/mentor/activities/${activity.id}/edit`)}
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
                      This action cannot be undone. This will permanently delete the activity.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
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