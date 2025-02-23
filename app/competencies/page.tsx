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
  Upload
} from 'lucide-react';
import { Competency } from '@/types/competency';
import { ResearchEvidenceViewer } from '@/components/research-evidence';
import { ResearchMetrics } from '@/components/research-metrics';
import { ResearchUpload } from '@/components/research-upload';

const CompetencyPage = () => {
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
    implementationScore: Math.round(Math.random() * 20 + 70) // Sample implementation score
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
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Role Competency
            </h1>
            <p className="text-gray-600">Track your professional competencies and research alignment</p>
          </div>
          <button
            onClick={() => setShowResearchUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="h-5 w-5" />
            Add Research Evidence
          </button>
        </div>
      </div>

      {/* Research Metrics */}
      <div className="mb-8">
        <ResearchMetrics competencyData={metricsData} />
      </div>

      {/* Research Alignment Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Research-Informed Practice
            </CardTitle>
            <Link 
              href="/overview#research" 
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              View Full Analysis
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">85%</span>
                </div>
                <div>
                  <h3 className="font-medium">Overall Research Alignment</h3>
                  <p className="text-sm text-gray-600">Based on evidence-based practice indicators</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Research Areas</h4>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Evidence-based teaching methods
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Student engagement strategies
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Assessment techniques
                  </li>
                </ul>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    name="Competency Score" 
                    stroke="#2563eb" 
                    fill="#3b82f6" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="alignment" 
                    name="Research Alignment %" 
                    stroke="#16a34a" 
                    fill="#22c55e" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900">Implementation Progress</h4>
                <p className="text-2xl font-bold text-blue-600">78%</p>
                <p className="text-sm text-blue-700">Research-based methods applied</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-900">Evidence Sources</h4>
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-sm text-green-700">Research papers integrated</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900">Practice Impact</h4>
                <p className="text-2xl font-bold text-purple-600">92%</p>
                <p className="text-sm text-purple-700">Positive outcome correlation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Radar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Competency Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
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
                  dataKey="researchAlignment"
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

      {/* Detailed Competencies */}
      <div className="space-y-6 mb-28">
        {competencies.map((comp) => (
          <Card key={comp.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{comp.name}</h3>
                    <p className="text-sm text-gray-500">Last updated: {comp.lastUpdated}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      <span className="text-sm font-medium">{comp.researchAlignment}% Research Aligned</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{comp.selfScore}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Self Score</p>
                      <p className="text-xs text-gray-500">Your assessment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold">{comp.supervisorScore}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Supervisor Score</p>
                      <p className="text-xs text-gray-500">Professional assessment</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Feedback</p>
                      <p className="text-sm text-gray-600">{comp.feedback}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Areas for Development</p>
                      <p className="text-sm text-gray-600">{comp.suggestions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Research Evidence
                  </h4>
                  <ul className="space-y-2">
                    {comp.researchEvidence.map((evidence, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-500 mt-1" />
                        <span className="text-sm text-purple-900">{evidence}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-sm font-medium text-purple-900">Development Plan</p>
                    <p className="text-sm text-purple-800">{comp.developmentPlan}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button 
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                    onClick={() => handleViewEvidence(comp)}
                  >
                    <FileText className="h-4 w-4" />
                    View Evidence
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                    <ExternalLink className="h-4 w-4" />
                    Research Links
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

      {/* Quick Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-around">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <TrendingUp className="h-5 w-5" />
            Update Scores
          </button>
          <button className="flex items-center gap-2 text-green-600 hover:text-green-700">
            <MessageCircle className="h-5 w-5" />
            Request Feedback
          </button>
          <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <AlertCircle className="h-5 w-5" />
            View Development Plan
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around max-w-4xl mx-auto">
          <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <User className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/qualifications" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Award className="h-6 w-6" />
            <span className="text-xs">Quals + Experience</span>
          </Link>
          <Link href="/competencies" className="flex flex-col items-center text-blue-600">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Role Competency</span>
          </Link>
          <Link href="/sessions" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Session Library</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CompetencyPage; 