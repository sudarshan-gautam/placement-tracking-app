'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import { 
  BookOpen, 
  TrendingUp, 
  MessageCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  Award,
  FileText,
  CheckCircle,
  Info,
  ExternalLink,
  Upload,
  Plus,
  ArrowUpRight,
  Check,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Competency } from '@/types/competency';
import { ResearchEvidenceViewer } from '@/components/research-evidence';
import { ResearchMetrics } from '@/components/research-metrics';
import { ResearchUpload } from '@/components/research-upload';
import { ClientOnly } from '@/components/ui/client-only';

const CompetenciesPage = () => {
  const [competencies] = useState<Competency[]>([
    {
      id: 1,
      name: 'Classroom Management',
      selfScore: 7,
      supervisorScore: 6,
      lastUpdated: '2025-02-01',
      feedback: 'Good progress in maintaining classroom discipline',
      suggestions: 'Consider advanced behavior management techniques',
      researchEvidence: [
        'Evidence-based behavior management strategies from recent studies',
        'Research on positive reinforcement techniques',
        'Student engagement metrics from classroom observations'
      ],
      researchAlignment: 85,
      developmentPlan: 'Implement structured reward systems based on research findings'
    },
    {
      id: 2,
      name: 'Lesson Planning',
      selfScore: 8,
      supervisorScore: 7,
      lastUpdated: '2025-02-05',
      feedback: 'Well-structured lesson plans with clear objectives',
      suggestions: 'Include more differentiation strategies',
      researchEvidence: [
        'Differentiated instruction research findings',
        'Learning styles adaptation studies',
        'Curriculum design best practices'
      ],
      researchAlignment: 75,
      developmentPlan: 'Incorporate more evidence-based differentiation techniques'
    },
    {
      id: 3,
      name: 'Assessment Methods',
      selfScore: 6,
      supervisorScore: 7,
      lastUpdated: '2025-02-10',
      feedback: 'Good variety of assessment techniques',
      suggestions: 'Consider more formative assessment strategies',
      researchEvidence: [
        'Recent studies on formative assessment impact',
        'Research on feedback effectiveness',
        'Assessment for learning principles'
      ],
      researchAlignment: 80,
      developmentPlan: 'Implement research-based formative assessment techniques'
    }
  ]);

  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [showResearchEvidence, setShowResearchEvidence] = useState(false);
  const [showResearchUpload, setShowResearchUpload] = useState(false);

  // Sample research evidence data
  const researchEvidenceData: ResearchEvidence[] = [
    {
      id: 1,
      competencyId: 1,
      source: 'Journal of Educational Psychology (2024)',
      findings: 'Meta-analysis of behavior management techniques shows significant positive correlation between structured reward systems and student engagement.',
      datePublished: '2024-01-15',
      impact: 'Implementation of evidence-based reward systems led to 35% improvement in classroom behavior management.',
      alignment: 85
    },
    {
      id: 2,
      competencyId: 1,
      source: 'Teaching and Teacher Education (2023)',
      findings: 'Longitudinal study demonstrates effectiveness of positive reinforcement in diverse classroom settings.',
      datePublished: '2023-11-20',
      impact: 'Positive reinforcement techniques showed consistent results across different age groups and cultural contexts.',
      alignment: 90
    },
    {
      id: 3,
      competencyId: 1,
      source: 'Educational Research Review (2023)',
      findings: 'Systematic review of classroom management strategies highlights importance of consistent application.',
      datePublished: '2023-09-10',
      impact: 'Schools implementing consistent management strategies saw 40% reduction in behavioral incidents.',
      alignment: 80
    }
  ];

  // Transform data for radar chart
  const radarData = competencies.map(comp => ({
    subject: comp.name,
    selfScore: comp.selfScore,
    supervisorScore: comp.supervisorScore,
    researchAlignment: (comp.researchAlignment / 10), // Convert to same scale as scores
    fullMark: 10
  }));

  // Progress data
  const progressData = [
    { month: 'Jan', score: 6.5, alignment: 70 },
    { month: 'Feb', score: 7.0, alignment: 75 },
    { month: 'Mar', score: 7.5, alignment: 80 },
    { month: 'Apr', score: 8.0, alignment: 85 }
  ];

  // Sample metrics data
  const metricsData = competencies.map(comp => ({
    name: comp.name,
    researchAlignment: comp.researchAlignment,
    evidenceCount: comp.researchEvidence.length,
    implementationScore: Math.floor((comp.selfScore + comp.supervisorScore) / 2 * 10) // More deterministic score
  }));

  const handleViewEvidence = (competency: Competency) => {
    setSelectedCompetency(competency);
    setShowResearchEvidence(true);
  };

  const handleUpload = useCallback((files: File[]) => {
    // Handle file upload
    console.log('Uploading files:', files);
    setShowResearchUpload(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Competency Framework</h1>
        <p className="text-gray-600">Track and develop your professional competencies</p>
      </div>

      {/* Competency Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Competency Overview</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar name="Self Assessment" dataKey="selfScore" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                  <Radar name="Supervisor Assessment" dataKey="supervisorScore" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-2 gap-6">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600 mr-2" />
                <span className="text-xs">Self</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <span className="text-xs">Supervisor</span>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Competency Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Competency Stats</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Overall Rating</p>
                  <p className="text-2xl font-bold text-blue-700">4.2/5</p>
                  <p className="text-xs text-gray-500">Based on self-assessment</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Supervisor Rating</p>
                  <p className="text-2xl font-bold text-green-700">4.0/5</p>
                  <p className="text-xs text-gray-500">Average across areas</p>
                </div>
          </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Strongest Areas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Classroom Management</span>
                    <span className="text-sm font-medium">7.0</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Assessment Methods</span>
                    <span className="text-sm font-medium">6.0</span>
                  </div>
                </div>
                    </div>
              
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Development Areas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Lesson Planning</span>
                    <span className="text-sm font-medium">8.0</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
                </div>

      {/* Recent Assessments */}
      <Card className="mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Assessments</CardTitle>
          <Link 
            href="/competencies/assess" 
            className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
          >
            New Assessment
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competencies.map((assessment) => (
              <div key={assessment.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{assessment.name}</h3>
                  <span className="text-sm text-gray-500">Updated: {assessment.lastUpdated}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Self Score</p>
                      <p className="font-medium">{assessment.selfScore}/10</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Supervisor Score</p>
                      <p className="font-medium">{assessment.supervisorScore}/10</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{assessment.feedback}</p>
                <Link
                  href={`/competencies/${assessment.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="mb-28">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Action Items</CardTitle>
        </CardHeader>
        <CardContent>
                <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                    <div>
                  <p className="font-medium">Complete Self-Assessment</p>
                  <p className="text-sm text-gray-500">Due: 2025-03-01</p>
                </div>
              </div>
              <Link
                href="/competencies/assess"
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Start
              </Link>
                  </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Update Development Plan</p>
                  <p className="text-sm text-gray-500">Due: 2025-03-10</p>
                </div>
              </div>
              <Link
                href="/competencies/development-plan"
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Update
              </Link>
                </div>
              </div>
            </CardContent>
          </Card>

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
          <Link href="/competencies" className="flex flex-col items-center text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Competencies</span>
          </Link>
      </div>
      </nav>

      {/* Research Evidence Viewer Modal */}
      {showResearchEvidence && selectedCompetency && (
        <ResearchEvidenceViewer
          competencyName={selectedCompetency.name}
          researchEvidence={researchEvidenceData}
          onClose={() => {
            setShowResearchEvidence(false);
            setSelectedCompetency(null);
          }}
        />
      )}

      {/* Research Upload Modal */}
      {showResearchUpload && (
        <ResearchUpload
          onUpload={handleUpload}
          onClose={() => setShowResearchUpload(false)}
        />
      )}
    </div>
  );
};

export default CompetenciesPage; 