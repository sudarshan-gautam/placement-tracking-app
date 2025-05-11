"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import VerificationDetail from "@/components/verification/VerificationDetail";
import { Loader2 } from "lucide-react";

export default function AdminProfileVerificationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Fetch profile details
        const response = await fetch(`/api/verifications/profiles/${id}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProfile(data);
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile details...</span>
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

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p>The profile you are looking for does not exist or you do not have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <VerificationDetail
        verificationType="profile"
        verificationData={profile}
        apiPath={`/api/verifications/profiles/${id}`}
        backPath="/admin/verifications"
      />
    </div>
  );
} 