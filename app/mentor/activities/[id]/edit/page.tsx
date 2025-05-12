"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

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
  created_at: string;
  updated_at: string;
  assigned_by?: string;
  assigned_by_name?: string;
};

export default function EditActivityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const activityId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_type: "",
    date_completed: "",
    duration_minutes: 0,
    evidence_url: "",
    status: ""
  });
  
  // Original activity data
  const [originalActivity, setOriginalActivity] = useState<Activity | null>(null);

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
        const response = await fetch(`/api/mentor/activities/${activityId}`, { headers });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activity: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setOriginalActivity(data);
        
        // Format date for the input field (YYYY-MM-DD)
        const dateObj = new Date(data.date_completed);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        // Set form data
        setFormData({
          title: data.title,
          description: data.description || "",
          activity_type: data.activity_type,
          date_completed: formattedDate,
          duration_minutes: data.duration_minutes,
          evidence_url: data.evidence_url || "",
          status: data.status
        });
      } catch (error) {
        console.error("Error fetching activity details:", error);
        setError("Failed to load activity details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityDetails();
  }, [user, activityId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !originalActivity) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare auth header
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      
      // Format data for API
      const updateData = {
        title: formData.title,
        description: formData.description,
        activity_type: formData.activity_type,
        date_completed: formData.date_completed,
        duration_minutes: parseInt(formData.duration_minutes.toString()),
        evidence_url: formData.evidence_url || null,
        status: formData.status
      };
      
      // Submit update
      const response = await fetch(`/api/mentor/activities/${activityId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status} ${response.statusText}`);
      }
      
      // Show success message
      toast({
        title: "Activity Updated",
        description: "The activity has been successfully updated.",
        variant: "default"
      });
      
      // Redirect back to activity detail page
      router.push(`/mentor/activities/${activityId}`);
      
    } catch (error) {
      console.error("Update error:", error);
      setError("Failed to update activity. Please try again.");
      
      toast({
        title: "Update Error",
        description: "There was a problem updating the activity.",
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
          onClick={() => router.push(`/mentor/activities/${activityId}`)}
          className="flex items-center space-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Activity</span>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold">Edit Activity</h1>
      
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
      ) : originalActivity ? (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity_type">Activity Type</Label>
                    <Select 
                      value={formData.activity_type} 
                      onValueChange={(value) => handleSelectChange("activity_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="coursework">Coursework</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_completed">Date Completed</Label>
                    <Input
                      id="date_completed"
                      name="date_completed"
                      type="date"
                      value={formData.date_completed}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      name="duration_minutes"
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evidence_url">Evidence URL (optional)</Label>
                  <Input
                    id="evidence_url"
                    name="evidence_url"
                    type="url"
                    value={formData.evidence_url}
                    onChange={handleInputChange}
                    placeholder="https://"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/mentor/activities/${activityId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : null}
    </div>
  );
} 