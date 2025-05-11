'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Loader2, ThumbsUp, ThumbsDown, FileText, User, Calendar, Building, Award, Clock } from "lucide-react";

type VerificationDetailProps = {
  verificationType: 'qualification' | 'session' | 'activity' | 'competency' | 'profile';
  verificationData: any; // Type is dynamic based on verification type
  apiPath: string; // e.g., "/api/verifications/qualifications/123"
  backPath: string; // e.g., "/admin/verifications"
};

export default function VerificationDetail({
  verificationType,
  verificationData,
  apiPath,
  backPath
}: VerificationDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(verificationData.feedback || '');
  const [verificationStatus, setVerificationStatus] = useState(
    verificationData.verification_status || 'pending'
  );
  const router = useRouter();

  // Handle verification status change
  const handleVerification = async (status: 'verified' | 'rejected' | 'pending') => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(apiPath, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          feedback
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update verification status');
      }
      
      // Update local state
      setVerificationStatus(status);
      
      // Delay to show the success state before redirecting
      setTimeout(() => {
        router.push(backPath);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render verification status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Verified</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Function to render verification-specific details
  const renderVerificationDetails = () => {
    switch (verificationType) {
      case 'qualification':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm text-muted-foreground">Qualification Type</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Award className="h-4 w-4 mr-2" />
                  {verificationData.type}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Issuing Organization</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Building className="h-4 w-4 mr-2" />
                  {verificationData.issuing_organization}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Date Obtained</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(verificationData.date_obtained)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Expiry Date</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {verificationData.expiry_date ? formatDate(verificationData.expiry_date) : 'No expiry date'}
                </p>
              </div>
            </div>
            {verificationData.certificate_url && (
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground">Certificate</Label>
                <div className="mt-2">
                  <Button variant="outline" onClick={() => window.open(verificationData.certificate_url, '_blank')}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                </div>
              </div>
            )}
          </>
        );
        
      case 'session':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm text-muted-foreground">Date</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(verificationData.date)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Time</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2" />
                  {verificationData.start_time} - {verificationData.end_time}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Location</Label>
                <p className="text-md font-medium mt-1">
                  {verificationData.location}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Session Status</Label>
                <p className="text-md font-medium mt-1">
                  {verificationData.session_status}
                </p>
              </div>
            </div>
            {verificationData.reflection && (
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground">Reflection</Label>
                <p className="text-md mt-1 p-3 bg-muted rounded-md">
                  {verificationData.reflection}
                </p>
              </div>
            )}
          </>
        );
        
      case 'activity':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm text-muted-foreground">Activity Type</Label>
                <p className="text-md font-medium mt-1">
                  {verificationData.activity_type}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Date Completed</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(verificationData.date_completed)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Duration</Label>
                <p className="text-md font-medium flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-2" />
                  {verificationData.duration_minutes} minutes
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Activity Status</Label>
                <p className="text-md font-medium mt-1">
                  {verificationData.activity_status}
                </p>
              </div>
            </div>
            {verificationData.evidence_url && (
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground">Evidence</Label>
                <div className="mt-2">
                  <Button variant="outline" onClick={() => window.open(verificationData.evidence_url, '_blank')}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Evidence
                  </Button>
                </div>
              </div>
            )}
          </>
        );
        
      case 'competency':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm text-muted-foreground">Competency Name</Label>
                <p className="text-md font-medium mt-1">
                  {verificationData.competency_name}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Category</Label>
                <p className="text-md font-medium mt-1">
                  {verificationData.competency_category}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Level</Label>
                <p className="text-md font-medium mt-1 capitalize">
                  {verificationData.level}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <Label className="text-sm text-muted-foreground">Description</Label>
              <p className="text-md mt-1 p-3 bg-muted rounded-md">
                {verificationData.competency_description}
              </p>
            </div>
            {verificationData.evidence_url && (
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground">Evidence</Label>
                <div className="mt-2">
                  <Button variant="outline" onClick={() => window.open(verificationData.evidence_url, '_blank')}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Evidence
                  </Button>
                </div>
              </div>
            )}
          </>
        );
        
      case 'profile':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm text-muted-foreground">User Email</Label>
                <p className="text-md font-medium mt-1">
                  {verificationData.user_email}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Role</Label>
                <p className="text-md font-medium mt-1 capitalize">
                  {verificationData.user_role}
                </p>
              </div>
            </div>
            {verificationData.document_url && (
              <div className="mb-6">
                <Label className="text-sm text-muted-foreground">Verification Document</Label>
                <div className="mt-2">
                  <Button variant="outline" onClick={() => window.open(verificationData.document_url, '_blank')}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                </div>
              </div>
            )}
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              {verificationType === 'competency'
                ? verificationData.competency_name
                : verificationType === 'profile'
                ? `${verificationData.user_name}'s Profile Verification`
                : verificationData.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {verificationType.charAt(0).toUpperCase() + verificationType.slice(1)} Verification
            </CardDescription>
          </div>
          <div>
            {renderStatusBadge(verificationStatus)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Student information */}
          <div>
            <h3 className="text-md font-medium mb-2">Student Details</h3>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="font-medium">
                {verificationType === 'profile' 
                  ? verificationData.user_name 
                  : verificationData.student_name}
              </span>
            </div>
          </div>
          
          <Separator />
          
          {/* Description */}
          {verificationData.description && (
            <div>
              <h3 className="text-md font-medium mb-2">Description</h3>
              <p className="text-md">{verificationData.description}</p>
            </div>
          )}
          
          {/* Render type-specific details */}
          {renderVerificationDetails()}
          
          <Separator />
          
          {/* Feedback section */}
          <div>
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Provide your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push(backPath)} disabled={isLoading}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            onClick={() => handleVerification('rejected')}
            disabled={isLoading}
          >
            {isLoading && verificationStatus === 'rejected' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ThumbsDown className="h-4 w-4 mr-2" />
            )}
            Reject
          </Button>
          <Button 
            onClick={() => handleVerification('verified')}
            disabled={isLoading}
          >
            {isLoading && verificationStatus === 'verified' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ThumbsUp className="h-4 w-4 mr-2" />
            )}
            Verify
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 