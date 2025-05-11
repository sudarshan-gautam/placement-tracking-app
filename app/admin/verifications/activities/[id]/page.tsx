"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import VerificationDetail from "@/components/verification/VerificationDetail";
import { Loader2 } from "lucide-react";

export default function AdminActivityVerificationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Fetch activity details
        const response = await fetch(`/api/verifications/activities/${id}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activity: ${response.statusText}`);
        }
        
        const data = await response.json();
        setActivity(data);
        
      } catch (error) {
        console.error("Error fetching activity:", error);
        setError("Failed to load activity details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivity();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading activity details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Activity Not Found</h2>
          <p>The activity you are looking for does not exist or you do not have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <VerificationDetail
        verificationType="activity"
        verificationData={activity}
        apiPath={`/api/verifications/activities/${id}`}
        backPath="/admin/verifications"
      />
    </div>
  );
} 