'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  FileText, 
  User, 
  ClipboardCheck, 
  Briefcase, 
  MessageSquare, 
  BarChart2, 
  Calendar, 
  BookOpen, 
  Settings,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MentorQuickActionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== 'mentor') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Activities',
      description: 'Browse, create and manage activities',
      icon: FileText,
      href: '/activities',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    },
    {
      title: 'View Students',
      description: 'Manage your assigned students',
      icon: User,
      href: '/mentor/students',
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
    },
    {
      title: 'Verifications',
      description: 'Review pending verification requests',
      icon: ClipboardCheck,
      href: '/mentor/verifications',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    },
    {
      title: 'Jobs',
      description: 'Browse and manage job opportunities',
      icon: Briefcase,
      href: '/mentor/jobs',
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    },
    {
      title: 'Message Students',
      description: 'Communicate with your students',
      icon: MessageSquare,
      href: '/mentor/messages',
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    },
    {
      title: 'Generate Reports',
      description: 'Create reports on student progress',
      icon: BarChart2,
      href: '/mentor/reports',
      color: 'bg-red-50 text-red-600 hover:bg-red-100',
    },
    {
      title: 'Calendar',
      description: 'View and manage your schedule',
      icon: Calendar,
      href: '/mentor/calendar',
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    },
    {
      title: 'Resources',
      description: 'Access educational resources',
      icon: BookOpen,
      href: '/mentor/resources',
      color: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile information',
      icon: Settings,
      href: '/profile',
      color: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
    },
    {
      title: 'Create New Activity',
      description: 'Add a new activity for your students',
      icon: PlusCircle,
      href: '/activities/new',
      color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quick Actions</h1>
        <p className="text-gray-600">Access commonly used mentor functions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${action.color.split(' ')[0]}`}>
                    <action.icon className={`h-6 w-6 ${action.color.split(' ')[1]}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 