'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, BookOpen, Target, Award } from 'lucide-react';

interface ResearchMetricsProps {
  competencyData: {
    name: string;
    researchAlignment: number;
    evidenceCount: number;
    implementationScore: number;
  }[];
}

export const ResearchMetrics: React.FC<ResearchMetricsProps> = ({
  competencyData
}) => {
  const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b'];
  const [selectedMetric, setSelectedMetric] = useState<'alignment' | 'implementation' | 'impact'>('alignment');

  // Calculate research quality indicators
  const qualityIndicators = {
    peerReviewed: competencyData.filter(comp => comp.researchAlignment > 80).length,
    practicalEvidence: competencyData.filter(comp => comp.implementationScore > 75).length,
    totalSources: competencyData.reduce((acc, curr) => acc + curr.evidenceCount, 0)
  };

  // Transform data for detailed view
  const detailedData = competencyData.map(comp => ({
    name: comp.name,
    alignment: comp.researchAlignment,
    implementation: comp.implementationScore,
    impact: Math.round((comp.researchAlignment + comp.implementationScore) / 2),
    evidence: comp.evidenceCount
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Research Quality</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{qualityIndicators.peerReviewed}</p>
                  <p className="text-sm text-gray-500">peer-reviewed sources</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Evidence Base</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{qualityIndicators.totalSources}</p>
                  <p className="text-sm text-gray-500">total sources</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Practical Evidence</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{qualityIndicators.practicalEvidence}</p>
                  <p className="text-sm text-gray-500">implemented findings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metric Selector */}
      <div className="flex justify-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <button
          onClick={() => setSelectedMetric('alignment')}
          className={`px-4 py-2 rounded-lg ${
            selectedMetric === 'alignment'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Research Alignment
        </button>
        <button
          onClick={() => setSelectedMetric('implementation')}
          className={`px-4 py-2 rounded-lg ${
            selectedMetric === 'implementation'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Implementation
        </button>
        <button
          onClick={() => setSelectedMetric('impact')}
          className={`px-4 py-2 rounded-lg ${
            selectedMetric === 'impact'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overall Impact
        </button>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Research Integration Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detailedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey={selectedMetric} 
                  name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} 
                  fill={selectedMetric === 'alignment' ? '#3b82f6' : selectedMetric === 'implementation' ? '#22c55e' : '#8b5cf6'}
                />
                <Bar dataKey="evidence" name="Evidence Sources" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Research Quality Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Research Quality Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {competencyData.map((comp, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">{comp.name}</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Research Alignment</span>
                      <span className="font-medium">{comp.researchAlignment}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${comp.researchAlignment}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Implementation</span>
                      <span className="font-medium">{comp.implementationScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${comp.implementationScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Evidence Sources</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                      {comp.evidenceCount} sources
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 