'use client';

import React, { useState } from 'react';
import { Plus, Award, BookOpen, Calendar, BarChart2, FileText, Edit, X, User, Settings, Shield, ClipboardCheck, Server, Briefcase, CheckCircle, MessageCircle, Folder } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsModal({ isOpen, onClose }: QuickActionsModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  if (!isOpen) return null;

  // Admin-specific actions
  const adminActions = [
    {
      href: '/admin/users',
      icon: User,
      label: 'Manage Users',
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      href: '/admin/qualifications',
      icon: Award,
      label: 'Manage Qualifications',
      bgColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      href: '/admin/verifications',
      icon: ClipboardCheck,
      label: 'Verifications',
      bgColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      href: '/admin/messages',
      icon: MessageCircle,
      label: 'Messages',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/admin/sessions',
      icon: Calendar,
      label: 'Sessions',
      bgColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      href: '/admin/reports',
      icon: BarChart2,
      label: 'Generate Reports',
      bgColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/activities',
      icon: Folder,
      label: 'Activities',
      bgColor: 'bg-teal-600 hover:bg-teal-700'
    }
  ];

  // Mentor-specific actions
  const mentorActions = [
    {
      href: '/activities',
      icon: FileText,
      label: 'Activities',
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      href: '/mentor/verifications/qualifications',
      icon: Award,
      label: 'Verify Qualifications',
      bgColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      href: '/mentor/sessions',
      icon: Calendar,
      label: 'Sessions',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/mentor/students',
      icon: User,
      label: 'View Students',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/mentor/verifications',
      icon: ClipboardCheck,
      label: 'Verifications',
      bgColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      href: '/mentor/jobs',
      icon: Briefcase,
      label: 'Jobs',
      bgColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/mentor/messages',
      icon: MessageCircle,
      label: 'Messages',
      bgColor: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  // Student actions
  const studentActions = [
    {
      href: '/activities/new',
      icon: Plus,
      label: 'New Activity',
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      href: '/qualifications',
      icon: Award,
      label: 'My Qualifications',
      bgColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      href: '/profile',
      icon: User,
      label: 'My Profile',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/jobs',
      icon: Briefcase,
      label: 'Browse Jobs',
      bgColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      href: '/activities',
      icon: FileText,
      label: 'My Activities',
      bgColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/sessions',
      icon: Calendar,
      label: 'Teaching Sessions',
      bgColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    {
      href: '/documents',
      icon: FileText,
      label: 'Generate CV',
      bgColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      href: '/student/messages',
      icon: MessageCircle,
      label: 'Messages',
      bgColor: 'bg-teal-600 hover:bg-teal-700'
    }
  ];

  // Select actions based on user role
  const actions = user?.role === 'admin' 
    ? adminActions 
    : user?.role === 'mentor' 
      ? mentorActions 
      : studentActions;

  const handleActionClick = (e: React.MouseEvent, action: any) => {
    e.preventDefault();
    if (action.href) {
      router.push(action.href);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
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
              href={action.href || '#'}
              onClick={(e) => handleActionClick(e, action)}
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

// Export a second component for the card-based design (second screenshot)
export function QuickActionsCard({ onAddUser }: { onAddUser: () => void }) {
  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-black mb-4">Quick Actions</h2>
      <div className="bg-white rounded-lg shadow-md p-4">
        <button
          onClick={onAddUser}
          className="w-full text-left flex items-center gap-4 py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-lg text-gray-800">Add User</span>
        </button>
      </div>
    </div>
  );
} 