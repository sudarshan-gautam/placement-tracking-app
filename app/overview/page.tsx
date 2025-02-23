'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Clock,
  Calendar,
  Award,
  Users,
  Download,
  Filter,
  RefreshCw,
  User,
  BookOpen,
  BarChart2
} from 'lucide-react';
import { DocumentUploader } from '@/components/document-upload';
import { ProgressionTracker } from '@/components/progression-tracker';
import {
  OverviewStats,
  CompetencyData,
  SessionActivityData,
  AgeGroupData,
  QualificationStatusData,
  TimePeriod,
  CVData,
  DocumentUpload,
  ProgressionData
} from '@/types/overview';

const OverviewPage = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  // Sample data
  const stats: OverviewStats = {
    totalHours: 156,
    totalSessions: 42,
    totalQualifications: 8,
    ageGroupsCovered: 4
  };

  const competencyData: CompetencyData[] = [
    { 
      area: 'Classroom Management',
      selfScore: 8,
      supervisorScore: 7,
      researchEvidence: ['Evidence-based behavior management', 'Student engagement research'],
      practiceAlignment: 85
    },
    { 
      area: 'Lesson Planning',
      selfScore: 7,
      supervisorScore: 8,
      researchEvidence: ['Differentiated instruction studies'],
      practiceAlignment: 75
    },
    { 
      area: 'Student Engagement',
      selfScore: 9,
      supervisorScore: 8,
      researchEvidence: ['Active learning research'],
      practiceAlignment: 90
    },
    { 
      area: 'Assessment',
      selfScore: 6,
      supervisorScore: 7,
      researchEvidence: ['Formative assessment studies'],
      practiceAlignment: 70
    },
    { 
      area: 'Technology Use',
      selfScore: 7,
      supervisorScore: 6,
      researchEvidence: ['EdTech integration research'],
      practiceAlignment: 80
    }
  ];

  const sessionActivity: SessionActivityData[] = [
    { month: 'Jan', hours: 32, sessions: 8 },
    { month: 'Feb', hours: 40, sessions: 10 },
    { month: 'Mar', hours: 45, sessions: 12 },
    { month: 'Apr', hours: 39, sessions: 12 }
  ];

  const ageGroupData: AgeGroupData[] = [
    { group: 'Early Years', sessions: 10, totalHours: 30 },
    { group: 'Primary', sessions: 15, totalHours: 45 },
    { group: 'Secondary', sessions: 12, totalHours: 36 },
    { group: 'Post-16', sessions: 5, totalHours: 15 }
  ];

  const qualificationStatus: QualificationStatusData[] = [
    { status: 'Completed', count: 5 },
    { status: 'In Progress', count: 2 },
    { status: 'Planned', count: 1 }
  ];

  // Sample CV data
  const cvData: CVData = {
    qualifications: [],
    experience: [],
    competencies: competencyData,
    statements: [
      {
        id: 1,
        type: 'personal',
        content: 'Dedicated teaching practitioner with a passion for student engagement...',
        lastUpdated: '2025-02-01',
        keywords: ['engagement', 'technology', 'differentiation']
      }
    ]
  };

  // Sample documents
  const documents: DocumentUpload[] = [
    {
      id: 1,
      type: 'certificate',
      title: 'First Aid Certificate',
      file: 'first-aid.pdf',
      uploadDate: '2025-01-15',
      status: 'verified'
    }
  ];

  // Sample progression data
  const progressionData: ProgressionData[] = [
    {
      period: 'Q1 2025',
      competencyLevels: competencyData,
      researchAlignment: 80,
      keyAchievements: [
        'Implemented new assessment strategy',
        'Completed advanced certification'
      ],
      developmentAreas: [
        'Technology integration',
        'Differentiated instruction'
      ]
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleGenerateCV = () => {
    // Handle CV generation
  };

  const handleGenerateStatement = (type: 'personal' | 'professional') => {
    // Handle statement generation
  };

  const handleFileUpload = (file: File, type: DocumentUpload['type']) => {
    // Handle file upload
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="h-8 w-8" />
          Overview & Analytics
        </h1>
        <p className="text-gray-600">Comprehensive visualization of your professional development journey</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Qualifications</p>
                <p className="text-2xl font-bold">{stats.totalQualifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Age Groups</p>
                <p className="text-2xl font-bold">{stats.ageGroupsCovered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Competency Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Competency Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={competencyData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="area" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="Self Assessment"
                    dataKey="selfScore"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Supervisor Assessment"
                    dataKey="supervisorScore"
                    stroke="#16a34a"
                    fill="#22c55e"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Research Alignment"
                    dataKey="practiceAlignment"
                    stroke="#8b5cf6"
                    fill="#a78bfa"
                    fillOpacity={0.4}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Progression Tracker */}
        <ProgressionTracker progressionData={progressionData} />
      </div>

      {/* Document Upload */}
      <div className="mb-8">
        <DocumentUploader
          documents={documents}
          onUpload={handleFileUpload}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-28">
        {/* Age Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Age Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageGroupData}
                    dataKey="sessions"
                    nameKey="group"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {ageGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Qualification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Qualification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualificationStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Qualifications" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <select 
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <Filter className="h-5 w-5" />
              Filter Data
            </button>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <Download className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>
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

export default OverviewPage; 