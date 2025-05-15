'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { 
  FileText, Download, Edit, Upload, ArrowLeft, Plus, Trash, Check, 
  FileDown, Copy, AlertCircle, BarChart, Award, CheckCircle, Clock 
} from 'lucide-react';
import { CVGenerator } from '@/components/cv-generator';
import { Statement } from '@/types/overview';
import { CVTemplate, StudentCV, CoverLetterTemplate } from '@/types/cv';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cv');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // CV States
  const [cvTemplates, setCVTemplates] = useState<CVTemplate[]>([]);
  const [studentCVs, setStudentCVs] = useState<StudentCV[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [newCVName, setNewCVName] = useState('');
  const [isCreatingCV, setIsCreatingCV] = useState(false);
  const [showNewCVDialog, setShowNewCVDialog] = useState(false);
  const [selectedCV, setSelectedCV] = useState<StudentCV | null>(null);
  
  // Template editing states
  const [editingTemplate, setEditingTemplate] = useState<CVTemplate | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  
  // Cover Letter States
  const [coverLetterTemplates, setCoverLetterTemplates] = useState<CoverLetterTemplate[]>([]);
  const [newCoverLetterName, setNewCoverLetterName] = useState('');
  const [selectedCoverLetterTemplate, setSelectedCoverLetterTemplate] = useState<number | null>(null);
  const [showNewCoverLetterDialog, setShowNewCoverLetterDialog] = useState(false);

  // Fetch CV templates and student CVs
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
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

        // Fetch CV templates
        const templateRes = await fetch('/api/admin/cv-templates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (templateRes.ok) {
          const templates = await templateRes.json();
          setCVTemplates(templates);
        }

        // If user is a student, fetch their CVs
        if (user.role === 'student') {
          const cvRes = await fetch(`/api/student/${user.id}/cvs`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (cvRes.ok) {
            const cvs = await cvRes.json();
            setStudentCVs(cvs);
          }
        }

        // Fetch Cover Letter templates
        const coverTemplateRes = await fetch('/api/admin/cover-letter-templates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (coverTemplateRes.ok) {
          const coverTemplates = await coverTemplateRes.json();
          setCoverLetterTemplates(coverTemplates);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load document data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle creating a new CV
  const handleCreateCV = async () => {
    if (!newCVName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your CV",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingCV(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        toast({
          title: "Error",
          description: "Authentication token is missing. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Create new CV
      const response = await fetch(`/api/student/${user.id}/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCVName,
          template_id: selectedTemplate,
          content: {},
          html_content: '<div>Your CV content will appear here</div>'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "CV created successfully. Your ATS score baseline is " + result.ats_score + "%."
        });

        // Fetch updated CV list
        const cvRes = await fetch(`/api/student/${user.id}/cvs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (cvRes.ok) {
          const cvs = await cvRes.json();
          setStudentCVs(cvs);
        }

        // Close dialog and reset form
        setShowNewCVDialog(false);
        setNewCVName('');
        setSelectedTemplate(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create CV');
      }
    } catch (error) {
      console.error('Error creating CV:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create CV",
        variant: "destructive"
      });
    } finally {
      setIsCreatingCV(false);
    }
  };

  // Handle deleting a CV
  const handleDeleteCV = async (cvId: number) => {
    if (!confirm('Are you sure you want to delete this CV?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        toast({
          title: "Error",
          description: "Authentication token is missing. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Delete CV
      const response = await fetch(`/api/student/${user.id}/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "CV deleted successfully"
        });

        // Update the CV list by filtering out the deleted CV
        setStudentCVs(studentCVs.filter(cv => cv.id !== cvId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete CV",
        variant: "destructive"
      });
    }
  };

  // Handle opening the edit template dialog
  const openEditTemplateDialog = (template: CVTemplate) => {
    setEditingTemplate(template);
    setEditedName(template.name);
    setEditedDescription(template.description || '');
    setEditedCategory(template.category || 'General');
  };

  // Handle saving template changes
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    
    if (!editedName.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !user || user.role !== 'admin') {
        toast({
          title: "Error", 
          description: "Unauthorized. Admin access required.",
          variant: "destructive"
        });
        return;
      }

      // Update template
      const response = await fetch(`/api/admin/cv-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedName,
          description: editedDescription,
          category: editedCategory
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template updated successfully"
        });

        // Update the template in the list
        setCVTemplates(prevTemplates => 
          prevTemplates.map(t => 
            t.id === editingTemplate.id 
              ? { 
                  ...t, 
                  name: editedName, 
                  description: editedDescription, 
                  category: editedCategory 
                } 
              : t
          )
        );

        // Close dialog and reset state
        setEditingTemplate(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update template",
        variant: "destructive"
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine ATS score color based on value
  const getAtsScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Add this function inside DocumentsPage component
  const handleDownloadCV = async (cvId: number) => {
    if (!user) return;
    
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

      // Generate PDF download
      const response = await fetch(`/api/student/${user.id}/cvs/${cvId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Try to get CV name from the list
        const cv = studentCVs.find(cv => cv.id === cvId);
        a.download = `${cv?.name || 'CV'}.pdf`;
        
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
      } else {
        throw new Error('Failed to download CV');
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast({
        title: "Error",
        description: "Could not download CV. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Document Generator
        </h1>
        <p className="text-gray-600">Create professional CVs and cover letters</p>
      </div>

      {/* Tab navigation */}
      <Tabs defaultValue="cv" value={activeTab} onValueChange={setActiveTab} className="mb-28">
        <TabsList className="bg-white rounded-lg shadow-sm mb-6">
          <TabsTrigger value="cv" className="flex-1 py-4 font-medium">CV Builder</TabsTrigger>
          <TabsTrigger value="coverLetter" className="flex-1 py-4 font-medium">Cover Letter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cv" className="mb-28">
          {isLoading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
              <p>Loading CV data...</p>
            </div>
          ) : (
            <>
              {/* Template selection for new CV */}
              {user?.role === 'student' && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowNewCVDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create New CV
                  </button>
                  
                  {/* New CV Dialog */}
                  <Dialog open={showNewCVDialog} onOpenChange={setShowNewCVDialog}>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create New CV</DialogTitle>
                        <DialogDescription>
                          Give your CV a name and select a template to get started.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CV Name
                          </label>
                          <Input
                            value={newCVName}
                            onChange={(e) => setNewCVName(e.target.value)}
                            placeholder="e.g., Teaching Position CV"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Template
                          </label>
                          <Select 
                            value={selectedTemplate?.toString() || "none"} 
                            onValueChange={(val) => setSelectedTemplate(val === "none" ? null : parseInt(val))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No template (blank CV)</SelectItem>
                              {cvTemplates.filter(t => t.is_active).map((template) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewCVDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateCV} disabled={isCreatingCV}>
                          {isCreatingCV ? 'Creating...' : 'Create CV'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              
              {/* Existing CVs */}
              {user?.role === 'student' && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Your CVs</h2>
                  
                  {studentCVs.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No CVs Created Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Create your first CV to start building your professional profile.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              CV Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Template
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Updated
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ATS Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {studentCVs.map((cv) => (
                            <tr 
                              key={cv.id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => router.push(`/documents/cv/${cv.id}`)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {cv.name}
                                    </div>
                                    {cv.ats_score >= 90 && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        ATS Optimized
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {cv.template_name || 'Custom'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(cv.updated_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {cv.is_draft ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Draft
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Check className="w-3 h-3 mr-1" />
                                    Finalized
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className={`text-sm font-medium px-2 py-0.5 rounded mr-2 ${getAtsScoreColor(cv.ats_score)}`}>
                                    {cv.ats_score}%
                                  </span>
                                  <div className="w-20">
                                    <Progress value={cv.ats_score} className="h-2" />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/documents/cv/${cv.id}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCV(cv.id);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadCV(cv.id);
                                    }}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {/* Admin - Manage CV Templates */}
              {user?.role === 'admin' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Manage CV Templates</h2>
                  <p className="text-gray-600 mb-6">
                    Create and manage CV templates for students to use when creating their CVs.
                  </p>
                  
                  <div className="mb-4">
                    <Link 
                      href="/documents/templates/new"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Template
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cvTemplates.map((template) => (
                      <Card key={template.id} className={`${!template.is_active ? 'opacity-60' : ''}`}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            {template.name}
                          </CardTitle>
                          {!template.is_active && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500 mb-2">
                            {template.description || 'No description provided'}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Created:</span>
                            <span className="font-medium">{formatDate(template.created_at)}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditTemplateDialog(template)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Edit Dialog */}
              {editingTemplate && (
                <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit CV Template</DialogTitle>
                      <DialogDescription>
                        Make changes to the CV template. This will affect new CVs created with this template.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Template Name</label>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="e.g., Modern Professional CV"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <Select 
                          value={editedCategory} 
                          onValueChange={setEditedCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="IT/Technology">IT/Technology</SelectItem>
                            <SelectItem value="Creative">Creative</SelectItem>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Describe the template and its intended use"
                          rows={3}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTemplate} disabled={isSavingTemplate}>
                        {isSavingTemplate ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="coverLetter">
          <div className="mb-28">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cover Letter Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700">Target Position</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter position you're applying for"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organization</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Industry</label>
                      <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select industry</option>
                        <option value="education">Education</option>
                        <option value="special_education">Special Education</option>
                        <option value="higher_education">Higher Education</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coverLetterTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                        >
                          <h3 className="font-medium mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{template.description || 'No description'}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Category: {template.category || 'General'}</span>
                            <button 
                              className="text-blue-600 text-sm hover:text-blue-800"
                              onClick={() => {
                                toast({
                                  title: "Template Selected",
                                  description: `Using template: ${template.name}`
                                });
                              }}
                            >
                              Use this template
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Cover letter generation will be available in the next update."
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Generate Cover Letter
                    </button>
                    <button 
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Custom template editing will be available in the next update."
                        });
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      Customize Template
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsPage; 