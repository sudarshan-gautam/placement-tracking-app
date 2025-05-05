'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, RefreshCw, Server, Database, Cpu, AlertTriangle, 
  CheckCircle, XCircle, Zap, HardDrive, Download, Calendar, Activity, Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, BarChart, ResponsiveContainer, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Sample system metrics data
const currentMetrics = {
  responseTime: '120ms',
  errorRate: '0.5%',
  serverLoad: '42%',
  memoryUsage: '62%',
  diskSpace: '47%',
  uptime: '99.98%',
  teachingActivities: 48,
  databaseConnections: 24,
  cpuUtilization: '38%',
  averageRequestTime: '95ms'
};

// Sample historical data for charts
const performanceHistory = [
  { time: '00:00', responseTime: 105, errorRate: 0.3, serverLoad: 30, memoryUsage: 58 },
  { time: '04:00', responseTime: 95, errorRate: 0.2, serverLoad: 25, memoryUsage: 55 },
  { time: '08:00', responseTime: 130, errorRate: 0.7, serverLoad: 45, memoryUsage: 65 },
  { time: '12:00', responseTime: 150, errorRate: 0.8, serverLoad: 55, memoryUsage: 72 },
  { time: '16:00', responseTime: 125, errorRate: 0.5, serverLoad: 48, memoryUsage: 68 },
  { time: '20:00', responseTime: 110, errorRate: 0.4, serverLoad: 40, memoryUsage: 60 },
  { time: 'Now', responseTime: 120, errorRate: 0.5, serverLoad: 42, memoryUsage: 62 }
];

// Sample data for different types of errors
const errorBreakdown = [
  { name: '404 Not Found', count: 45, percentage: 35 },
  { name: '500 Server Error', count: 32, percentage: 25 },
  { name: '403 Forbidden', count: 18, percentage: 14 },
  { name: 'Timeout', count: 15, percentage: 12 },
  { name: 'Database Error', count: 10, percentage: 8 },
  { name: 'Other', count: 8, percentage: 6 }
];

// Sample maintenance logs
const maintenanceLogs = [
  { 
    id: 1, 
    type: 'Scheduled', 
    description: 'System update and security patches applied', 
    date: '2023-10-25', 
    duration: '45 minutes',
    impact: 'Minimal'
  },
  { 
    id: 2, 
    type: 'Emergency', 
    description: 'Database optimization to address performance bottleneck', 
    date: '2023-10-15', 
    duration: '20 minutes',
    impact: 'Moderate'
  },
  { 
    id: 3, 
    type: 'Scheduled', 
    description: 'Added additional server capacity', 
    date: '2023-09-30', 
    duration: '30 minutes',
    impact: 'None'
  }
];

export default function SystemHealthPage() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLastRefreshed(new Date());
    setIsRefreshing(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/admin" className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Health Report</h1>
              <p className="text-sm text-gray-500">
                Last updated: {lastRefreshed.toLocaleTimeString()} on {lastRefreshed.toLocaleDateString()}
              </p>
            </div>
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.responseTime}</div>
              <div className="text-xs text-green-500 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Good (Target: &lt;150ms)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.errorRate}</div>
              <div className="text-xs text-green-500 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Good (Target: &lt;1%)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Server Load</CardTitle>
              <Server className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.serverLoad}</div>
              <div className="text-xs text-yellow-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warning (Target: &lt;40%)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.memoryUsage}</div>
              <div className="text-xs text-yellow-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warning (Target: &lt;60%)
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentMetrics.uptime}</div>
              <div className="text-xs text-green-500 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Good (Target: &gt;99.9%)
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Performance Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Response Time Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    name="Response Time (ms)" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Resource Utilization</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="serverLoad" 
                    name="Server Load (%)" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="memoryUsage" 
                    name="Memory Usage (%)" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Error Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Error Rate Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="errorRate" 
                    name="Error Rate (%)" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Error Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Additional Metrics Table */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Detailed Metrics</h2>
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              <Download className="h-4 w-4 mr-1" />
              Export as CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { name: 'Response Time', value: currentMetrics.responseTime, target: '<150ms', status: 'good' },
                  { name: 'Error Rate', value: currentMetrics.errorRate, target: '<1%', status: 'good' },
                  { name: 'Server Load', value: currentMetrics.serverLoad, target: '<40%', status: 'warning' },
                  { name: 'Memory Usage', value: currentMetrics.memoryUsage, target: '<60%', status: 'warning' },
                  { name: 'Disk Space', value: currentMetrics.diskSpace, target: '<70%', status: 'good' },
                  { name: 'Uptime', value: currentMetrics.uptime, target: '>99.9%', status: 'good' },
                  { name: 'Teaching Activities', value: currentMetrics.teachingActivities, target: '<60', status: 'good' },
                  { name: 'Database Connections', value: currentMetrics.databaseConnections, target: '<40', status: 'good' },
                  { name: 'CPU Utilization', value: currentMetrics.cpuUtilization, target: '<50%', status: 'good' },
                  { name: 'Average Request Time', value: currentMetrics.averageRequestTime, target: '<100ms', status: 'warning' }
                ].map((metric, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.target}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${metric.status === 'good' ? 'bg-green-100 text-green-800' : 
                          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {metric.status === 'good' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : metric.status === 'warning' ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Maintenance Logs */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Recent Maintenance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${log.type === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${log.impact === 'None' ? 'bg-green-100 text-green-800' : 
                          log.impact === 'Minimal' ? 'bg-blue-100 text-blue-800' : 
                          log.impact === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {log.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Link 
            href="/admin" 
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <button 
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
} 