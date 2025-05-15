'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { 
  ArrowLeft, Download, Check, AlertCircle, Save, FileText,
  CheckCircle, BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CVGenerator } from '@/components/cv-generator';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface CVData {
  id: number;
  name: string;
  template_id?: number;
  template_name?: string;
  content: Record<string, any>;
  html_content: string;
  is_draft: boolean;
  ats_score: number;
  created_at: string;
  updated_at: string;
}

const CVDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const cv_id = params.cv_id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [cvContent, setCVContent] = useState<Record<string, any>>({});
  const [htmlContent, setHtmlContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  useEffect(() => {
    if (!user || !cv_id) return;
    
    const fetchCVData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Error",
            description: "Authentication token is missing. Please log in again.",
            variant: "destructive"
          });
          return;
        }

        // Fetch CV data
        const response = await fetch(`/api/student/${user.id}/cvs/${cv_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCVData(data);
          
          // Ensure content is properly parsed if it's a string
          let contentObj = data.content;
          if (typeof contentObj === 'string') {
            try {
              contentObj = JSON.parse(contentObj);
            } catch (error) {
              console.error('Error parsing CV content JSON:', error);
              contentObj = {};
            }
          }
          setCVContent(contentObj || {});
          
          // Check if HTML content is empty or just contains a placeholder
          const isHtmlEmpty = !data.html_content || 
                             data.html_content.includes('CV content will appear here') ||
                             data.html_content.includes('Your CV content will appear here');
          
          if (isHtmlEmpty && contentObj) {
            // Generate HTML from content
            const personal = contentObj.personal || {};
            let generatedHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <header style="text-align: center; margin-bottom: 20px;">
                  <h1 style="margin-bottom: 5px;">${personal.name || 'Your Name'}</h1>
                  <p style="margin: 0; color: #666;">${personal.title || 'Professional Title'}</p>
                  <p style="margin: 5px 0; color: #666;">
                    ${personal.email || 'email@example.com'} | 
                    ${personal.phone || '(123) 456-7890'} | 
                    ${personal.location || 'City, Country'}
                  </p>
                </header>
                
                <section style="margin-bottom: 20px;">
                  <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Summary</h2>
                  <p>${personal.summary || 'Professional summary goes here.'}</p>
                </section>
            `;
            
            setHtmlContent(generatedHtml);
          } else {
            setHtmlContent(data.html_content || '');
          }
        } else {
          throw new Error('Failed to fetch CV data');
        }
      } catch (error) {
        console.error('Error fetching CV data:', error);
        toast({
          title: "Error",
          description: "Could not load CV data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVData();
  }, [user, cv_id]);

  const handleSaveCV = async (updatedContent: Record<string, any>, updatedHtml: string) => {
    if (!user || !cv_id) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Update CV data
      const response = await fetch(`/api/student/${user.id}/cvs/${cv_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: updatedContent,
          html_content: updatedHtml
        })
      });
      
      if (response.ok) {
        const updatedCV = await response.json();
        setCVData(updatedCV);
        setCVContent(updatedContent);
        setHtmlContent(updatedHtml);
        
        toast({
          title: "Success",
          description: "CV updated successfully! Your ATS score is " + updatedCV.ats_score + "%."
        });
      } else {
        throw new Error('Failed to update CV');
      }
    } catch (error) {
      console.error('Error updating CV:', error);
      toast({
        title: "Error",
        description: "Could not save CV. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalizeCV = async () => {
    if (!user || !cv_id) return;
    
    setIsFinalizing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Finalize CV
      const response = await fetch(`/api/student/${user.id}/cvs/${cv_id}/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const updatedCV = await response.json();
        setCVData(prevData => {
          if (prevData) {
            return {...prevData, is_draft: false};
          }
          return null;
        });
        
        toast({
          title: "Success",
          description: "CV finalized successfully! Your final ATS score is " + updatedCV.ats_score + "%."
        });
      } else {
        throw new Error('Failed to finalize CV');
      }
    } catch (error) {
      console.error('Error finalizing CV:', error);
      toast({
        title: "Error",
        description: "Could not finalize CV. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!cvData || !user) return;
    
    setIsDownloading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Show loading toast
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your CV...",
      });

      // Generate PDF download
      const response = await fetch(`/api/student/${user.id}/cvs/${cv_id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download CV: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${cvData.name || 'CV'}.pdf`;
      
      // Append to the document and trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "CV downloaded successfully!"
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not download CV. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getAtsScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!user) {
    return <div className="p-6">Please log in to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/documents" 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>
        
        {isLoading ? (
          <h1 className="text-3xl font-bold text-gray-900">Loading CV...</h1>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-8 w-8" />
                  {cvData?.name || 'CV Editor'}
                </h1>
                <p className="text-gray-600">
                  {cvData?.template_name 
                    ? `Using template: ${cvData.template_name}` 
                    : 'Custom CV'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {cvData?.is_draft !== false && (
                  <Button 
                    onClick={handleFinalizeCV}
                    disabled={isFinalizing}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {isFinalizing ? 'Finalizing...' : 'Finalize CV'}
                  </Button>
                )}
                
                <Button 
                  onClick={handleDownloadCV}
                  variant="outline"
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </Button>
              </div>
            </div>
            
            {/* ATS Score */}
            {cvData?.ats_score !== undefined && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">ATS Compatibility Score:</span>
                </div>
                
                <div className="flex-grow max-w-md">
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${getAtsScoreColor(cvData.ats_score)}`}>
                      {cvData.ats_score}%
                    </span>
                    {cvData.ats_score >= 90 && (
                      <span className="text-sm flex items-center text-green-600">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Optimized for ATS
                      </span>
                    )}
                  </div>
                  <Progress value={cvData.ats_score} className="h-2" />
                </div>
                
                <div className="text-sm text-gray-500">
                  {cvData.ats_score < 70 ? (
                    <span className="flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      Keep improving your CV to increase chances of getting hired
                    </span>
                  ) : cvData.ats_score < 90 ? (
                    <span className="flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                      Good score, but there's room for improvement
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                      Excellent score! Your CV is optimized for job applications
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CV Editor */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CVGenerator 
            initialContent={cvContent} 
            initialHtml={htmlContent}
            templateId={cvData?.template_id}
            onSave={handleSaveCV}
            isSaving={isSaving}
          />
        </div>
      )}
    </div>
  );
};

export default CVDetailPage;
