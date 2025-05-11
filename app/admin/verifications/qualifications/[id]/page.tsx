"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import VerificationDetail from "@/components/verification/VerificationDetail";
import { Loader2 } from "lucide-react";

export default function AdminQualificationVerificationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [qualification, setQualification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQualification = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Fetch qualification details
        const response = await fetch(`/api/verifications/qualifications/${id}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch qualification: ${response.statusText}`);
        }
        
        const data = await response.json();
        setQualification(data);
        
      } catch (error) {
        console.error("Error fetching qualification:", error);
        setError("Failed to load qualification details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQualification();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading qualification details...</span>
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

  if (!qualification) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Qualification Not Found</h2>
          <p>The qualification you are looking for does not exist or you do not have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <VerificationDetail
        verificationType="qualification"
        verificationData={qualification}
        apiPath={`/api/verifications/qualifications/${id}`}
        backPath="/admin/verifications"
      />
    </div>
  );
} 