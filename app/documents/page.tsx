'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Edit, Download, ArrowLeft, User, Award, BookOpen, Calendar } from 'lucide-react';

const DocumentsPage = () => {
  const handleGenerateCV = () => {
    console.log('Generating CV...');
  };

  const handleGenerateStatement = (type: 'personal' | 'professional') => {
    console.log(`Generating ${type} statement...`);
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
          Document Generation
        </h1>
        <p className="text-gray-600">Generate your CV and statements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* CV Generation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Curriculum Vitae
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Qualifications</h3>
                  <p className="text-sm text-gray-500">8 included</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Experience</h3>
                  <p className="text-sm text-gray-500">15 sessions</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Competencies</h3>
                  <p className="text-sm text-gray-500">5 areas</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Research</h3>
                  <p className="text-sm text-gray-500">3 papers</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={handleGenerateCV}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Generate CV
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                  <Edit className="h-4 w-4" />
                  Edit Template
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Statements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Personal Statement Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Personal Statement</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a compelling personal statement highlighting your motivations and aspirations.
                </p>
                <button
                  onClick={() => handleGenerateStatement('personal')}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  <Edit className="h-4 w-4" />
                  Generate Personal Statement
                </button>
              </div>

              {/* Professional Statement Section */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-3">Professional Statement</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate a professional statement showcasing your expertise and experience.
                </p>
                <button
                  onClick={() => handleGenerateStatement('professional')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Edit className="h-4 w-4" />
                  Generate Professional Statement
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around max-w-4xl mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <User className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/qualifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Award className="h-6 w-6" />
            <span className="text-xs">Qualifications</span>
          </Link>
          <Link href="/competencies" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Competencies</span>
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Sessions</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default DocumentsPage; 