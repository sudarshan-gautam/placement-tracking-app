'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Download, Edit, Upload, ArrowLeft, BookOpen, Award, Calendar, Briefcase, User } from 'lucide-react';
import { CVGenerator } from '@/components/cv-generator';
import { Statement, CoverLetterTemplate } from '@/types/overview';
import { Qualification } from '@/types/qualification';
import { Session } from '@/types/session';
import { Competency } from '@/types/competency';

interface CVData {
  qualifications: Qualification[];
  experience: Session[];
  competencies: Competency[];
  statements: Statement[];
}

const DocumentsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'cv' | 'coverLetter'>('cv');
  const [templates, setTemplates] = useState<CoverLetterTemplate[]>([
    {
      id: 1,
      title: 'Primary Education',
      lastUpdated: '2025-02-10',
      industry: 'Education'
    },
    {
      id: 2,
      title: 'Special Needs Support',
      lastUpdated: '2025-02-15',
      industry: 'Special Education'
    }
  ]);

  // Sample CV data
  const cvData: CVData = {
    qualifications: [
      { 
        id: 1, 
        name: 'Bachelor of Education', 
        governingBody: 'University of Education', 
        dateCompleted: '2024-05-30', 
        expiryDate: '2026-05-30',
        status: 'verified',
        certificate: 'certificate1.pdf'
      },
      { 
        id: 2, 
        name: 'First Aid Certificate', 
        governingBody: 'Red Cross', 
        dateCompleted: '2025-01-15', 
        expiryDate: '2026-01-15',
        status: 'verified',
        certificate: 'certificate2.pdf'
      }
    ],
    experience: [
      { 
        id: 1, 
        date: '2025-02-13',
        timeSpent: '2 hours',
        ageGroup: 'Primary (7-11)',
        organization: 'Springfield Elementary',
        topic: 'Literacy Skills Development',
        positives: 'Excellent engagement from students',
        developments: 'Could improve pace of lesson',
        supervisorFeedback: 'Strong first session, good classroom management',
        status: 'completed'
      },
      { 
        id: 2, 
        date: '2025-02-20',
        timeSpent: '1.5 hours',
        ageGroup: 'Secondary (11-16)',
        organization: 'Central High School',
        topic: 'Special Needs Support',
        positives: 'Built good rapport with student',
        developments: 'Need to prepare more materials',
        supervisorFeedback: 'Good progress with challenging student',
        status: 'completed'
      }
    ],
    competencies: [
      { 
        id: 1, 
        name: 'Classroom Management', 
        selfScore: 4, 
        supervisorScore: 4, 
        lastUpdated: '2025-02-15',
        feedback: 'Good progress in establishing routines',
        suggestions: 'Try implementing more structured transitions',
        researchEvidence: ['classroom_management_study.pdf'],
        researchAlignment: 3,
        developmentPlan: 'Attend workshop on classroom management'
      },
      { 
        id: 2, 
        name: 'Differentiated Instruction', 
        selfScore: 3, 
        supervisorScore: 3, 
        lastUpdated: '2025-02-10',
        feedback: 'Making good progress in adapting materials',
        suggestions: 'Consider more advanced differentiation techniques',
        researchEvidence: ['differentiation_paper.pdf'],
        researchAlignment: 4,
        developmentPlan: 'Read latest research on differentiation'
      }
    ],
    statements: [
      {
        id: 1,
        type: 'personal',
        content: 'Passionate and dedicated educator with a strong commitment to inclusive learning environments. Believes in nurturing both academic and personal growth in students through innovative teaching methods.',
        lastUpdated: '2025-01-20',
        keywords: ['passionate', 'inclusive', 'innovative']
      },
      {
        id: 2,
        type: 'professional',
        content: 'Experienced in differentiated instruction and student-centered learning approaches. Committed to evidence-based practice and continuous professional development in educational methodologies.',
        lastUpdated: '2025-02-05',
        keywords: ['differentiated instruction', 'evidence-based', 'professional development']
      }
    ]
  };

  const handleGenerateCV = () => {
    // In a real app, this would connect to a PDF generation API or service
    alert('Generating CV with your profile data...');
    // Simulating download
    setTimeout(() => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('This is a placeholder for a generated CV'));
      element.setAttribute('download', 'CV_' + user?.name.replace(' ', '_') + '.pdf');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  };

  const handleGenerateStatement = (type: Statement['type']) => {
    // In a real app, this would open a statement editor or generator
    alert(`Opening ${type} statement editor...`);
  };

  const handleGenerateCoverLetter = (templateId: number) => {
    // In a real app, this would generate a cover letter based on the template
    const template = templates.find(t => t.id === templateId);
    alert(`Generating cover letter using ${template?.title} template...`);
    // Simulating download
    setTimeout(() => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('This is a placeholder for a generated Cover Letter'));
      element.setAttribute('download', 'CoverLetter_' + template?.title.replace(' ', '_') + '.pdf');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
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
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('cv')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'cv'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            CV Builder
          </button>
          <button
            onClick={() => setActiveTab('coverLetter')}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'coverLetter'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cover Letter
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'cv' ? (
        <div className="mb-28">
          <CVGenerator 
            cvData={cvData} 
            onGenerateCV={handleGenerateCV} 
            onGenerateStatement={handleGenerateStatement} 
          />
        </div>
      ) : (
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
                      <option value="special-education">Special Education</option>
                      <option value="early-childhood">Early Childhood</option>
                      <option value="higher-education">Higher Education</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div 
                        key={template.id} 
                        className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{template.title}</h3>
                          <p className="text-sm text-gray-500">
                            Updated: {template.lastUpdated}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Industry: {template.industry}</p>
                        <button
                          onClick={() => handleGenerateCoverLetter(template.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4" />
                          Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-4 border-t">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <Upload className="h-4 w-4" />
                    Import Custom Template
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="flex justify-around max-w-4xl mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <User className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Sessions</span>
          </Link>
          <Link href="/qualifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Award className="h-6 w-6" />
            <span className="text-xs">Qualifications</span>
          </Link>
          <Link href="/competencies" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Competencies</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default DocumentsPage; 