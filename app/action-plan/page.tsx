'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Calendar,
  TrendingUp,
  FileText,
  User,
  Award,
  BookOpen
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ActionPlan, Goal } from '@/types/action-plan';

const ActionPlanPage = () => {
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([
    {
      id: 1,
      quarter: 'Q1 2025',
      status: 'in-progress',
      lastUpdated: '2025-02-01',
      strengths: [
        'Strong classroom management',
        'Effective lesson planning',
        'Good student engagement'
      ],
      weaknesses: [
        'Assessment strategy needs improvement',
        'Limited use of technology in lessons'
      ],
      goals: [
        {
          id: 1,
          title: 'Implement diverse assessment methods',
          deadline: '2025-03-15',
          status: 'in-progress',
          progress: 60
        },
        {
          id: 2,
          title: 'Enhance digital teaching skills',
          deadline: '2025-03-30',
          status: 'not-started',
          progress: 0
        }
      ],
      supervisorFeedback: 'Good progress on assessment methods. Consider attending the upcoming EdTech workshop.'
    }
  ]);

  // Sample progress data for the chart
  const progressData = [
    { month: 'Jan', progress: 20 },
    { month: 'Feb', progress: 45 },
    { month: 'Mar', progress: 60 },
    { month: 'Apr', progress: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="h-8 w-8" />
          Professional Development Action Plan
        </h1>
        <p className="text-gray-600">Track your progress and plan your professional growth</p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Current Action Plan */}
      {actionPlans.map(plan => (
        <Card key={plan.id} className="mb-28">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Action Plan - {plan.quarter}</CardTitle>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                In Progress
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {plan.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">Areas for Development</h3>
                  <ul className="space-y-2">
                    {plan.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Development Goals */}
              <div>
                <h3 className="text-lg font-medium mb-3">Development Goals</h3>
                <div className="space-y-4">
                  {plan.goals.map(goal => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-gray-500">Deadline: {goal.deadline}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          goal.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : goal.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {goal.status === 'completed' ? 'Completed' : 
                           goal.status === 'in-progress' ? 'In Progress' : 
                           'Not Started'}
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              {goal.progress}% Complete
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                          <div 
                            style={{ width: `${goal.progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisor Feedback */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Supervisor Feedback</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{plan.supervisorFeedback}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Quick Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-around">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Plus className="h-5 w-5" />
            New Goal
          </button>
          <button className="flex items-center gap-2 text-green-600 hover:text-green-700">
            <Calendar className="h-5 w-5" />
            Schedule Review
          </button>
          <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <FileText className="h-5 w-5" />
            Export Plan
          </button>
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

export default ActionPlanPage; 