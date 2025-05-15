'use client';

import React, { useState, useEffect, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText, User, Briefcase, Award, BookOpen, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface CVGeneratorProps {
  initialContent: Record<string, any>;
  initialHtml: string;
  templateId?: number;
  onSave: (content: Record<string, any>, html: string) => Promise<void>;
  isSaving: boolean;
}

export const CVGenerator: React.FC<CVGeneratorProps> = ({
  initialContent,
  initialHtml,
  templateId,
  onSave,
  isSaving
}) => {
  // Use base React state to avoid performance optimizations that may cause issues
  const [content, setContent] = useState<Record<string, any>>(initialContent || {});
  const [htmlContent, setHtmlContent] = useState(initialHtml || '');
  const [activeSection, setActiveSection] = useState('personal');
  
  // Unique ID for this component instance to prevent key collisions
  const instanceId = useId();
  
  // Initialize content with basic structure if not provided
  useEffect(() => {
    if (!initialContent || Object.keys(initialContent).length === 0) {
      const defaultContent = {
        personal: {
          name: '',
          title: '',
          email: '',
          phone: '',
          location: '',
          summary: ''
        },
        education: [],
        experience: [],
        skills: [],
        projects: []
      };
      
      setContent(defaultContent);
      // Generate preview immediately
      generatePreview(defaultContent);
    } else {
      setContent(initialContent);
      // Generate preview immediately
      generatePreview(initialContent);
    }
  }, [initialContent]);
  
  // Direct update function for field changes - doesn't trigger preview immediately
  const updateField = (section: string, field: string, value: string) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (!newContent[section]) {
        newContent[section] = {};
      }
      
      newContent[section] = { 
        ...newContent[section], 
        [field]: value 
      };
      
      // Schedule a preview update with a delay
      setTimeout(() => {
        generatePreview(newContent);
      }, 300);
      
      return newContent;
    });
  };
  
  // Update compound section like education, experience, etc.
  const updateArraySection = (section: string, index: number, field: string, value: string) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (!Array.isArray(newContent[section])) {
        newContent[section] = [];
      }
      
      const items = [...newContent[section]];
      if (!items[index]) {
        items[index] = {};
      }
      
      items[index] = { ...items[index], [field]: value };
      newContent[section] = items;
      
      // Schedule a preview update with a delay
      setTimeout(() => {
        generatePreview(newContent);
      }, 300);
      
      return newContent;
    });
  };
  
  // Function to add an item to an array section
  const addToSection = (section: string, template: Record<string, any>) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (!Array.isArray(newContent[section])) {
        newContent[section] = [];
      }
      
      newContent[section] = [...newContent[section], { ...template }];
      
      // Request preview update after adding an item
      setTimeout(() => {
        generatePreview(newContent);
      }, 100);
      
      return newContent;
    });
  };
  
  // Function to remove an item from an array section
  const removeFromSection = (section: string, index: number) => {
    setContent(prev => {
      const newContent = { ...prev };
      if (!Array.isArray(newContent[section])) {
        return prev;
      }
      
      newContent[section] = newContent[section].filter((_, i) => i !== index);
      
      // Request preview update after removing an item
      setTimeout(() => {
        generatePreview(newContent);
      }, 100);
      
      return newContent;
    });
  };
  
  // Request a preview update with delay to allow batching of updates
  const requestPreviewUpdate = () => {
    setTimeout(() => {
      generatePreview(content);
    }, 800);
  };

  const generatePreview = (updatedContent: Record<string, any>) => {
    // Very simple HTML generation for demo purposes
    // In a real app, you would use a more sophisticated template system
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin-bottom: 5px;">${updatedContent.personal?.name || 'Your Name'}</h1>
          <p style="margin: 0; color: #666;">${updatedContent.personal?.title || 'Professional Title'}</p>
          <p style="margin: 5px 0; color: #666;">
            ${updatedContent.personal?.email || 'email@example.com'} | 
            ${updatedContent.personal?.phone || '(123) 456-7890'} | 
            ${updatedContent.personal?.location || 'City, Country'}
          </p>
        </header>
        
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Summary</h2>
          <p>${updatedContent.personal?.summary || 'Professional summary goes here.'}</p>
        </section>
    `;
    
    // Education section
    if (updatedContent.education && updatedContent.education.length > 0) {
      html += `
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Education</h2>
          <ul style="list-style-type: none; padding: 0;">
      `;
      
      updatedContent.education.forEach((edu: any) => {
        html += `
          <li style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${edu.degree || 'Degree'}</strong>
              <span>${edu.year || 'Year'}</span>
            </div>
            <div>${edu.institution || 'Institution'}</div>
            <div style="font-style: italic; color: #666;">${edu.location || 'Location'}</div>
          </li>
        `;
      });
      
      html += `
          </ul>
        </section>
      `;
    }
    
    // Experience section
    if (updatedContent.experience && updatedContent.experience.length > 0) {
      html += `
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Experience</h2>
          <ul style="list-style-type: none; padding: 0;">
      `;
      
      updatedContent.experience.forEach((exp: any) => {
        html += `
          <li style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${exp.title || 'Job Title'}</strong>
              <span>${exp.period || 'Time Period'}</span>
            </div>
            <div>${exp.company || 'Company'}, ${exp.location || 'Location'}</div>
            <p>${exp.description || 'Job description'}</p>
          </li>
        `;
      });
      
      html += `
          </ul>
        </section>
      `;
    }
    
    // Skills section
    if (updatedContent.skills && updatedContent.skills.length > 0) {
      html += `
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
      `;
      
      updatedContent.skills.forEach((skill: any) => {
        html += `
          <span style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;">
            ${skill.name || 'Skill'}
          </span>
        `;
      });
      
      html += `
          </div>
        </section>
      `;
    }
    
    // Projects section
    if (updatedContent.projects && updatedContent.projects.length > 0) {
      html += `
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Projects</h2>
          <ul style="list-style-type: none; padding: 0;">
      `;
      
      updatedContent.projects.forEach((project: any) => {
        html += `
          <li style="margin-bottom: 10px;">
            <strong>${project.name || 'Project Name'}</strong>
            <p>${project.description || 'Project description'}</p>
          </li>
        `;
      });
      
      html += `
          </ul>
        </section>
      `;
    }
    
    html += `
      </div>
    `;
    
    setHtmlContent(html);
  };

  const handleSave = () => {
    // Generate the latest preview before saving
    generatePreview(content);
    // Then save the content and HTML
    onSave(content, htmlContent);
  };

  // Personal Info Form - using direct DOM attributes and no callbacks to prevent focus issues
  const PersonalInfoForm = () => {
    const personal = content.personal || {};
    
    // Use onBlur to update preview only when user leaves the field
    const handleBlur = () => {
      requestPreviewUpdate();
    };
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              id={`${instanceId}-personal-name`}
              key={`${instanceId}-personal-name`}
              name="personal-name"
              value={personal.name || ''} 
              onChange={(e) => updateField('personal', 'name', e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., John Smith"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Professional Title</label>
            <Input 
              id={`${instanceId}-personal-title`}
              key={`${instanceId}-personal-title`}
              name="personal-title"
              value={personal.title || ''} 
              onChange={(e) => updateField('personal', 'title', e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., Special Education Teacher"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              id={`${instanceId}-personal-email`}
              key={`${instanceId}-personal-email`}
              name="personal-email"
              value={personal.email || ''} 
              onChange={(e) => updateField('personal', 'email', e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., john.smith@example.com"
              type="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input 
              id={`${instanceId}-personal-phone`}
              key={`${instanceId}-personal-phone`}
              name="personal-phone"
              value={personal.phone || ''} 
              onChange={(e) => updateField('personal', 'phone', e.target.value)}
              onBlur={handleBlur}
              placeholder="e.g., (123) 456-7890"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input 
            id={`${instanceId}-personal-location`}
            key={`${instanceId}-personal-location`}
            name="personal-location"
            value={personal.location || ''} 
            onChange={(e) => updateField('personal', 'location', e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., London, UK"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Professional Summary</label>
          <Textarea 
            id={`${instanceId}-personal-summary`}
            key={`${instanceId}-personal-summary`}
            name="personal-summary"
            value={personal.summary || ''} 
            onChange={(e) => updateField('personal', 'summary', e.target.value)}
            onBlur={handleBlur}
            placeholder="Write a brief professional summary..."
            rows={6}
          />
        </div>
      </div>
    );
  };

  // Education Form with cleaner approach
  const EducationForm = () => {
    const education = Array.isArray(content.education) ? content.education : [];
    
    const addEducation = () => {
      addToSection('education', {
        degree: '',
        institution: '',
        location: '',
        year: '',
        description: ''
      });
    };
    
    const handleBlur = () => {
      requestPreviewUpdate();
    };
    
    return (
      <div className="space-y-6">
        {education.map((edu: any, index: number) => (
          <div key={`education-${index}-${instanceId}`} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Education #{index + 1}</h3>
              <button 
                onClick={() => removeFromSection('education', index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Degree/Certificate</label>
                <Input 
                  id={`${instanceId}-education-${index}-degree`}
                  name={`education-${index}-degree`}
                  value={edu.degree || ''} 
                  onChange={(e) => updateArraySection('education', index, 'degree', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g., Bachelor of Education"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Input 
                  id={`${instanceId}-education-${index}-year`}
                  name={`education-${index}-year`}
                  value={edu.year || ''} 
                  onChange={(e) => updateArraySection('education', index, 'year', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g., 2018-2022"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Input 
                  id={`${instanceId}-education-${index}-institution`}
                  name={`education-${index}-institution`}
                  value={edu.institution || ''} 
                  onChange={(e) => updateArraySection('education', index, 'institution', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g., University of London"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input 
                  id={`${instanceId}-education-${index}-location`}
                  name={`education-${index}-location`}
                  value={edu.location || ''} 
                  onChange={(e) => updateArraySection('education', index, 'location', e.target.value)}
                  onBlur={handleBlur}
                  placeholder="e.g., London, UK"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea 
                id={`${instanceId}-education-${index}-description`}
                name={`education-${index}-description`}
                value={edu.description || ''} 
                onChange={(e) => updateArraySection('education', index, 'description', e.target.value)}
                onBlur={handleBlur}
                placeholder="Describe your studies, achievements, etc."
                rows={3}
              />
            </div>
          </div>
        ))}
        
        <Button 
          onClick={addEducation}
          variant="outline"
          className="w-full"
        >
          + Add Education
        </Button>
      </div>
    );
  };

  // Other section forms would be similar to Education...
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Editor */}
      <div className="space-y-4">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="personal" className="flex flex-col items-center py-2">
              <User className="h-4 w-4 mb-1" />
              <span className="text-xs">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex flex-col items-center py-2">
              <BookOpen className="h-4 w-4 mb-1" />
              <span className="text-xs">Education</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex flex-col items-center py-2">
              <Briefcase className="h-4 w-4 mb-1" />
              <span className="text-xs">Experience</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex flex-col items-center py-2">
              <Award className="h-4 w-4 mb-1" />
              <span className="text-xs">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex flex-col items-center py-2">
              <FileText className="h-4 w-4 mb-1" />
              <span className="text-xs">Projects</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-white p-4 rounded-lg border">
            <TabsContent value="personal">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <PersonalInfoForm />
            </TabsContent>
            
            <TabsContent value="education">
              <h3 className="text-lg font-medium mb-4">Education</h3>
              <EducationForm />
            </TabsContent>
            
            <TabsContent value="experience">
              <h3 className="text-lg font-medium mb-4">Work Experience</h3>
              <p className="text-gray-500">Add your work experience here...</p>
              {/* Implement similar to EducationForm */}
            </TabsContent>
            
            <TabsContent value="skills">
              <h3 className="text-lg font-medium mb-4">Skills</h3>
              <p className="text-gray-500">Add your skills here...</p>
              {/* Implement skills editor */}
            </TabsContent>
            
            <TabsContent value="projects">
              <h3 className="text-lg font-medium mb-4">Projects</h3>
              <p className="text-gray-500">Add your projects here...</p>
              {/* Implement projects editor */}
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      
      {/* Right Panel - Preview */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-sm font-medium">CV Preview</h3>
          <p className="text-xs text-gray-500">Changes will appear here as you edit</p>
        </div>
        <div className="p-4 overflow-auto h-[calc(100vh-320px)]">
          <div 
            className="cv-preview"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}; 