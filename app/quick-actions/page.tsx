'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Award, BookOpen, Calendar, BarChart2, FileText, Edit } from 'lucide-react';

const QuickActionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50/90 p-6">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid gap-4">
          <Link 
            href="/sessions/new" 
            className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Session</span>
          </Link>

          <Link 
            href="/qualifications/new" 
            className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Award className="h-5 w-5" />
            <span>Add Qualification</span>
          </Link>

          <Link 
            href="/competencies" 
            className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <BookOpen className="h-5 w-5" />
            <span>View Competencies</span>
          </Link>

          <Link 
            href="/action-plan" 
            className="flex items-center gap-3 p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Calendar className="h-5 w-5" />
            <span>Action Plan</span>
          </Link>

          <Link 
            href="/overview" 
            className="flex items-center gap-3 p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <BarChart2 className="h-5 w-5" />
            <span>View Analytics</span>
          </Link>

          <Link 
            href="/documents/cv" 
            className="flex items-center gap-3 p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <FileText className="h-5 w-5" />
            <span>Generate CV</span>
          </Link>

          <Link 
            href="/documents/statements" 
            className="flex items-center gap-3 p-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            <Edit className="h-5 w-5" />
            <span>Generate Statements</span>
          </Link>
        </div>

        <Link 
          href="/" 
          className="mt-8 block text-center text-gray-600 hover:text-gray-900"
        >
          Close
        </Link>
      </div>
    </div>
  );
};

export default QuickActionsPage; 