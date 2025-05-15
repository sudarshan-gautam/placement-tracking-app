'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Trash, Edit, Plus, AlertCircle } from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { CoverLetterTemplate } from '@/types/cv';
import { toast } from '@/components/ui/use-toast';

export default function AdminCoverLetterTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<CoverLetterTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CoverLetterTemplate | null>(null);
  
  // New template form state
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('General');
  
  // Fetch cover letter templates
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({
            title: "Error",
            description: "Authentication token is missing",
            variant: "destructive"
          });
          return;
        }

        const response = await fetch('/api/admin/cover-letter-templates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch cover letter templates",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching cover letter templates:', error);
        toast({
          title: "Error",
          description: "An error occurred while fetching templates",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [user]);

  // Create new template
  const handleCreateTemplate = async () => {
    if (!templateName) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing",
          variant: "destructive"
        });
        return;
      }

      // Simple template structure
      const structure = {
        sections: ["header", "greeting", "introduction", "body", "closing", "signature"],
        layout: "standard",
        style: "professional"
      };

      const response = await fetch('/api/admin/cover-letter-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          category: templateCategory,
          structure: structure
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cover letter template created successfully"
        });
        
        // Refresh templates list
        const updatedResponse = await fetch('/api/admin/cover-letter-templates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setTemplates(data);
        }
        
        // Reset form
        setTemplateName('');
        setTemplateDescription('');
        setTemplateCategory('General');
        setShowNewTemplateDialog(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create template");
      }
    } catch (error) {
      console.error('Error creating cover letter template:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive"
      });
    }
  };

  // Delete template
  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token is missing",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/cover-letter-templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template deleted successfully"
        });
        
        // Remove from state
        setTemplates(templates.filter(template => template.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete template");
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Render template card
  const renderTemplateCard = (template: CoverLetterTemplate) => {
    return (
      <Card key={template.id} className="overflow-hidden">
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex justify-between items-center">
            <span>{template.name}</span>
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {template.category || 'General'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-gray-600 mb-2">{template.description || 'No description provided'}</p>
          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <div>Created: {formatDate(template.created_at)}</div>
            <div>Last Updated: {formatDate(template.updated_at)}</div>
            <div className="flex items-center mt-2">
              <div className={`h-2 w-2 rounded-full mr-2 ${template.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{template.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteTemplate(template.id)}
          >
            <Trash className="h-4 w-4 mr-1" /> Delete
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setEditingTemplate(template)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Ensure user is admin
  if (user && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 max-w-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">Access Denied</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cover Letter Templates</h1>
        <Button onClick={() => setShowNewTemplateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Templates Found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new cover letter template.</p>
          <Button 
            onClick={() => setShowNewTemplateDialog(true)}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => renderTemplateCard(template))}
        </div>
      )}

      {/* Create new template dialog */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Cover Letter Template</DialogTitle>
            <DialogDescription>
              Create a new cover letter template that students can use to build their application documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Template Name</label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Professional Cover Letter"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select 
                id="category"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="General">General</option>
                <option value="IT/Technology">IT/Technology</option>
                <option value="Creative">Creative</option>
                <option value="Academic">Academic</option>
                <option value="Entry Level">Entry Level</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe the template and its ideal use cases"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit template dialog */}
      {editingTemplate && (
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update the template information.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                Editing functionality will be implemented in the next release.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setEditingTemplate(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 