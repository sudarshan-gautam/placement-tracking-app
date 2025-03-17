'use client';

import React from 'react';
import { Plus, Award, BookOpen, Calendar, BarChart2, FileText, Edit, X, User, Settings, Shield, ClipboardCheck, Server, Briefcase } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsModal({ isOpen, onClose }: QuickActionsModalProps) {
  const { user } = useAuth();
  
  if (!isOpen) return null;

  // Admin-specific actions
  const adminActions = [
    {
      href: '/admin/users/new',
      icon: User,
      label: 'Add User',
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      href: '/admin/roles',
      icon: Shield,
      label: 'Modify Roles',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/admin/verifications',
      icon: ClipboardCheck,
      label: 'Verifications',
      bgColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      href: '/admin/reports',
      icon: BarChart2,
      label: 'Generate Reports',
      bgColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/admin/settings',
      icon: Settings,
      label: 'System Settings',
      bgColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      href: '/admin/backup',
      icon: Server,
      label: 'Backup Data',
      bgColor: 'bg-teal-600 hover:bg-teal-700'
    }
  ];

  // Mentor-specific actions
  const mentorActions = [
    {
      href: '/activities/new',
      icon: Plus,
      label: 'New Activity',
      bgColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      href: '/students',
      icon: User,
      label: 'View Students',
      bgColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      href: '/activities',
      icon: FileText,
      label: 'View Activities',
      bgColor: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      href: '/reports',
      icon: BarChart2,
      label: 'View Reports',
      bgColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/profile',
      icon: User,
      label: 'Edit Profile',
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
      href: '/profile',
      icon: User,
      label: 'Edit Profile',
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
      label: 'View Activities',
      bgColor: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      href: '/reports',
      icon: BarChart2,
      label: 'View Reports',
      bgColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      href: '/documents/cv',
      icon: FileText,
      label: 'Generate CV',
      bgColor: 'bg-teal-600 hover:bg-teal-700'
    }
  ];

  // Select actions based on user role
  const actions = user?.role === 'admin' 
    ? adminActions 
    : user?.role === 'mentor' 
      ? mentorActions 
      : studentActions;

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