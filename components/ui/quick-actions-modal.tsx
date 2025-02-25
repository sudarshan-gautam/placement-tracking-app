'use client';

import React from 'react';
import { Plus, Award, BookOpen, Calendar, BarChart2, FileText, Edit, X } from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsModal({ isOpen, onClose }: QuickActionsModalProps) {
  if (!isOpen) return null;

  const actions = [
    {
      href: '/sessions/new',
      icon: Plus,
      label: 'New Session',
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      href: '/qualifications',
      icon: Award,
      label: 'Add Qualification',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/competencies',
      icon: BookOpen,
      label: 'View Competencies',
      bgColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      href: '/action-plan',
      icon: Calendar,
      label: 'Action Plan',
      bgColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/overview',
      icon: BarChart2,
      label: 'View Analytics',
      bgColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      href: '/documents/cv',
      icon: FileText,
      label: 'Generate CV',
      bgColor: 'bg-teal-600 hover:bg-teal-700'
    },
    {
      href: '/documents/statements',
      icon: Edit,
      label: 'Generate Statements',
      bgColor: 'bg-rose-600 hover:bg-rose-700'
    }
  ];

  const handleActionClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    window.location.href = href;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid gap-4">
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              onClick={(e) => handleActionClick(e, action.href)}
              className={`flex items-center gap-3 p-4 text-white rounded-lg ${action.bgColor}`}
            >
              <action.icon className="h-5 w-5" />
              <span>{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
} 