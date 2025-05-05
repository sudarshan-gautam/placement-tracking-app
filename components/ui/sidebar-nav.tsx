'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  ListChecks,
  Briefcase,
  FileText,
  MessageCircle,
  User,
  Settings
} from 'lucide-react';

interface NavChildItem {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: NavChildItem[];
}

// Replace competency navigation items with activities
const studentNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Activities",
    href: "/activities",
    icon: <ListChecks className="h-5 w-5" />,
    children: [
      {
        title: "My Activities",
        href: "/activities",
      },
      {
        title: "Teaching Activities",
        href: "/activities/session",
      },
      {
        title: "Add New",
        href: "/activities/new",
      }
    ]
  },
  {
    title: "Job Board",
    href: "/jobs",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Messages",
    href: "/student/messages",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: <User className="h-5 w-5" />,
  }
];

// Mentor navigation items
const mentorNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/mentor",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Students",
    href: "/mentor/students",
    icon: <User className="h-5 w-5" />,
  },
  {
    title: "Verifications",
    href: "/mentor/verifications",
    icon: <ListChecks className="h-5 w-5" />,
  },
  {
    title: "Messages",
    href: "/mentor/messages",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: <User className="h-5 w-5" />,
  }
];

// Admin navigation items
const adminNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <User className="h-5 w-5" />,
  },
  {
    title: "Verifications",
    href: "/admin/verifications",
    icon: <ListChecks className="h-5 w-5" />,
  },
  {
    title: "Jobs",
    href: "/admin/jobs",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Messages",
    href: "/admin/messages",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  }
];

interface SidebarNavProps {
  role?: string;
}

export function SidebarNav({ role = 'student' }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = role === 'admin' ? adminNav : role === 'mentor' ? mentorNav : studentNav;

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <React.Fragment key={index}>
          {item.children ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500">
                {item.icon}
                {item.title}
              </div>
              <div className="ml-4 space-y-1">
                {item.children.map((child, childIndex) => (
                  <Link
                    key={childIndex}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      pathname === child.href
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                pathname === item.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
} 