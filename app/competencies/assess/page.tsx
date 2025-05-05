'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, ArrowLeft, User, Calendar, Award, Save, Upload, BookOpenCheck } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const COMPETENCY_AREAS = [
  'Classroom Management',
  'Differentiated Instruction',
  'Assessment & Feedback',
  'Technology Integration',
  'Subject Knowledge',
  'Professional Ethics',
  'Communication',
  'Collaboration',
  'Reflective Practice'
];

const SelfAssessmentPage = () => {
  const [competencies, setCompetencies] = useState(
    COMPETENCY_AREAS.map(area => ({
      area,
      selfScore: 3,
      notes: '',
      evidence: '',
      developmentPlan: ''
    }))
  );

  // Prepare data for radar chart
  const radarData = COMPETENCY_AREAS.map(area => {
    const comp = competencies.find(c => c.area === area);
    return {
      subject: area,
      selfScore: comp?.selfScore || 0,
      fullMark: 5
    };
  });

  const handleScoreChange = (index: number, value: number) => {
    const newCompetencies = [...competencies];
    newCompetencies[index].selfScore = value;
    setCompetencies(newCompetencies);
  };

  const handleTextChange = (index: number, field: 'notes' | 'evidence' | 'developmentPlan', value: string) => {
    const newCompetencies = [...competencies];
    newCompetencies[index][field] = value;
    setCompetencies(newCompetencies);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    alert('Self-assessment saved successfully!');
    // Navigate back to competencies page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/competencies" 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Competencies
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpenCheck className="h-8 w-8" />
          Self-Assessment
        </h1>
        <p className="text-gray-600">Evaluate your professional competencies</p>
      </div>

      {/* Competency Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Competency Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={130} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar name="Self Assessment" dataKey="selfScore" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="h-3 bg-red-500 rounded"></div>
              <p className="text-xs mt-1">1 - Beginning</p>
            </div>
            <div>
              <div className="h-3 bg-orange-500 rounded"></div>
              <p className="text-xs mt-1">2 - Developing</p>
            </div>
            <div>
              <div className="h-3 bg-yellow-500 rounded"></div>
              <p className="text-xs mt-1">3 - Proficient</p>
            </div>
            <div>
              <div className="h-3 bg-green-500 rounded"></div>
              <p className="text-xs mt-1">4 - Advanced</p>
            </div>
            <div>
              <div className="h-3 bg-blue-500 rounded"></div>
              <p className="text-xs mt-1">5 - Expert</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Assessment Form */}
      <form onSubmit={handleSubmit} className="mb-28">
        {competencies.map((competency, index) => (
          <Card key={competency.area} className="mb-6">
            <CardHeader>
              <CardTitle>{competency.area}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Score (1-5)</label>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleScoreChange(index, score)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          competency.selfScore === score 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reflection Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reflection Notes</label>
                  <textarea
                    value={competency.notes}
                    onChange={(e) => handleTextChange(index, 'notes', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="Reflect on your current capabilities in this area..."
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evidence</label>
                  <textarea
                    value={competency.evidence}
                    onChange={(e) => handleTextChange(index, 'evidence', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="List activities and experiences that demonstrate this competency..."
                  />
                </div>

                {/* Development Plan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Development Plan</label>
                  <textarea
                    value={competency.developmentPlan}
                    onChange={(e) => handleTextChange(index, 'developmentPlan', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    placeholder="What steps will you take to further develop this competency?"
                  />
                </div>

                {/* Evidence Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Evidence (Optional)</label>
                  <div className="flex items-center justify-center p-5 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, images up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Self-Assessment
          </button>
        </div>
      </form>

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
    </div>
  );
};

export default SelfAssessmentPage; 