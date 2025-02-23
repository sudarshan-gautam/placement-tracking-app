'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, AlertCircle } from 'lucide-react';
import { ProgressionData } from '@/types/overview';

interface ProgressionTrackerProps {
  progressionData: ProgressionData[];
}

export const ProgressionTracker: React.FC<ProgressionTrackerProps> = ({
  progressionData
}) => {
  // Calculate average competency scores for each period
  const chartData = progressionData.map(period => ({
    period: period.period,
    averageScore: period.competencyLevels.reduce((acc, curr) => acc + curr.selfScore, 0) / period.competencyLevels.length,
    researchAlignment: period.researchAlignment
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Professional Progression
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progression Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="averageScore"
                  name="Competency Score"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="researchAlignment"
                  name="Research Alignment"
                  stroke="#16a34a"
                  fill="#22c55e"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Latest Period Details */}
          {progressionData.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Latest Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Achievements</h4>
                  <ul className="space-y-1">
                    {progressionData[progressionData.length - 1].keyAchievements.map((achievement, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="h-4 w-4 text-green-500" />
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Development Areas</h4>
                  <ul className="space-y-1">
                    {progressionData[progressionData.length - 1].developmentAreas.map((area, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 