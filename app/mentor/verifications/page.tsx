'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Clock,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ArrowLeft,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function VerificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<number | null>(null);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch verification requests from the API
    async function fetchVerificationRequests() {
      try {
        setLoading(true);
        const response = await fetch('/api/mentor/verifications');
        if (!response.ok) {
          throw new Error('Failed to fetch verification requests');
        }
        const data = await response.json();
        // Ensure pendingVerifications is always an array
        setVerificationRequests(Array.isArray(data.pendingVerifications) ? data.pendingVerifications : []);
      } catch (error) {
        console.error('Error fetching verification requests:', error);
        // Set to empty array on error
        setVerificationRequests([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchVerificationRequests();
  }, []);
  
  // Safely filter verification requests
  const filteredRequests = verificationRequests.filter(request => {
    // Skip filtering if request is null or undefined
    if (!request) return false;
    
    // Handle flat data structure (student is a string, not an object)
    const matchesSearch = 
      (request.student?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.activity?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Handle flat data structure (type is directly on the request)
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Get unique activity types for filter - ensure we have an array
  const activityTypes = ['all', ...Array.from(new Set(verificationRequests
    .filter(req => req && req.type) // Filter out null/undefined and ensure type exists
    .map(req => req.type)
  ))];
  
  // Handle approval/rejection
  const handleApprove = (id: number) => {
    // In a real app, this would call an API to update the verification status
    console.log(`Approving verification ${id}`);
    alert(`Verification #${id} has been approved`);
  };
  
  const handleReject = (id: number, reason: string) => {
    // In a real app, this would call an API to update the verification status
    console.log(`Rejecting verification ${id} with reason: ${reason}`);
    alert(`Verification #${id} has been rejected`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link href="/mentor" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
        <p className="text-gray-600">Review and verify student activities</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by student name or activity title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Type Filter */}
          <div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Activity Types' : type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Requests List */}
      <div className="space-y-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} className={`overflow-hidden ${selectedVerification === request.id ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{request.student}</h3>
                      <p className="text-sm text-gray-500">{request.student_email || 'No email available'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <div className="text-sm text-gray-500 mb-2 md:mb-0">
                      Submitted: {new Date(request.date || Date.now()).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => setSelectedVerification(selectedVerification === request.id ? null : request.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {selectedVerification === request.id ? 'Hide Details' : 'View Details'}
                      <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform ${selectedVerification === request.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">{request.activity}</h4>
                  <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(request.date || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {request.duration || 'Unknown duration'}
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                      {request.type || 'Unknown type'}
                    </div>
                  </div>
                  
                  {selectedVerification !== request.id && (
                    <p className="text-gray-700 line-clamp-2">{request.description || 'No description available'}</p>
                  )}
                </div>
                
                {selectedVerification === request.id && (
                  <div className="mt-4 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{request.description || 'No detailed description available'}</p>
                    </div>
                    
                    {request.reflection && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Reflection</h4>
                        <p className="text-gray-700">{request.reflection}</p>
                      </div>
                    )}
                    
                    {request.outcomes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Learning Outcomes</h4>
                        <ul className="list-disc pl-5 text-gray-700 space-y-1">
                          {Array.isArray(request.outcomes) ? (
                            request.outcomes.map((outcome: string, index: number) => (
                              <li key={index}>{outcome}</li>
                            ))
                          ) : (
                            <li>{request.outcomes}</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {request.evidence_url && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Evidence</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Evidence file</p>
                                <p className="text-xs text-gray-500">Click to download</p>
                              </div>
                            </div>
                            <a 
                              href={request.evidence_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Download className="h-5 w-5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4 flex flex-wrap gap-3 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Approve Verification
                      </button>
                      
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejection:');
                          if (reason) handleReject(request.id, reason);
                        }}
                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Reject Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FileText className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No verification requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'All verification requests have been processed.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 