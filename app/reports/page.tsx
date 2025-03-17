'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
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
import { 
  Download, 
  FileText, 
  Calendar, 
  BarChart2, 
  PieChart as PieChartIcon,
  Filter
} from 'lucide-react';

// Sample data for reports
const activityByTypeData = [
  { name: 'Teaching', hours: 45 },
  { name: 'Professional Development', hours: 20 },
  { name: 'Planning', hours: 15 },
  { name: 'Communication', hours: 10 },
  { name: 'Assessment', hours: 8 },
  { name: 'Other', hours: 5 },
];

const monthlyProgressData = [
  { name: 'Jan', hours: 12 },
  { name: 'Feb', hours: 15 },
  { name: 'Mar', hours: 18 },
  { name: 'Apr', hours: 22 },
  { name: 'May', hours: 25 },
  { name: 'Jun', hours: 30 },
  { name: 'Jul', hours: 28 },
  { name: 'Aug', hours: 0 },
  { name: 'Sep', hours: 0 },
  { name: 'Oct', hours: 0 },
  { name: 'Nov', hours: 0 },
  { name: 'Dec', hours: 0 },
];

const verificationStatusData = [
  { name: 'Verified', value: 75 },
  { name: 'Pending', value: 15 },
  { name: 'Not Submitted', value: 10 },
];

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

const reportTemplates = [
  {
    id: 1,
    title: 'Monthly Activity Summary',
    description: 'A summary of all activities completed in the selected month with hours breakdown.',
    icon: Calendar,
  },
  {
    id: 2,
    title: 'Activity Type Analysis',
    description: 'Analysis of time spent on different types of professional activities.',
    icon: BarChart2,
  },
  {
    id: 3,
    title: 'Verification Status Report',
    description: 'Overview of verification status for all completed activities.',
    icon: FileText,
  },
  {
    id: 4,
    title: 'Professional Development Progress',
    description: 'Track progress towards professional development goals.',
    icon: PieChartIcon,
  },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const generateReport = (reportId: number) => {
    // In a real application, this would generate and download a report
    alert(`Generating report: ${reportTemplates.find(t => t.id === reportId)?.title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Track your progress and generate reports for your professional development</p>
      </div>

      {/* Time Period Filter */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedPeriod === 'month'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => handlePeriodChange('quarter')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedPeriod === 'quarter'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => handlePeriodChange('year')}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedPeriod === 'year'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                Year
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          {selectedPeriod === 'month' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={0}>January</option>
                <option value={1}>February</option>
                <option value={2}>March</option>
                <option value={3}>April</option>
                <option value={4}>May</option>
                <option value={5}>June</option>
                <option value={6}>July</option>
                <option value={7}>August</option>
                <option value={8}>September</option>
                <option value={9}>October</option>
                <option value={10}>November</option>
                <option value={11}>December</option>
              </select>
            </div>
          )}

          <div className="ml-auto">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Activity by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityByTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyProgressData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {verificationStatusData.map((entry, index) => (
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

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Total Hours</span>
                  <span className="text-sm font-medium text-gray-700">150/200</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Teaching Hours</span>
                  <span className="text-sm font-medium text-gray-700">45/60</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Professional Development</span>
                  <span className="text-sm font-medium text-gray-700">20/40</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Verified Activities</span>
                  <span className="text-sm font-medium text-gray-700">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <template.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                  <button
                    onClick={() => generateReport(template.id)}
                    className="mt-auto w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Generate
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Report Builder */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Custom Report Builder</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              Build a custom report by selecting the data points and time periods you want to include.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option>Activity Summary</option>
                  <option>Hours Breakdown</option>
                  <option>Verification Status</option>
                  <option>Progress Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last 6 months</option>
                  <option>Last year</option>
                  <option>Custom range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Build Custom Report
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 