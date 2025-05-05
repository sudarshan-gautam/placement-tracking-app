'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Award, 
  Upload, 
  Check, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  BookOpen, 
  Filter, 
  Search,
  Download,
  PlusCircle,
  FileText,
  ArrowUpDown,
  Bell,
  X
} from 'lucide-react';
import { Qualification, QualificationStatus } from '@/types/qualification';
import { CertificateUpload } from '@/components/certificate-upload';
import { ClientOnly } from '@/components/ui/client-only';

const QualificationsPage = () => {
  const [qualifications, setQualifications] = useState<Qualification[]>([
    {
      id: 1,
      name: 'First Aid Certificate',
      governingBody: 'Red Cross',
      dateCompleted: '2024-12-01',
      expiryDate: '2025-12-01',
      status: 'verified',
      certificate: 'certificate1.pdf'
    },
    {
      id: 2,
      name: 'Safeguarding Training',
      governingBody: 'Department of Education',
      dateCompleted: '2025-01-15',
      expiryDate: '2026-01-15',
      status: 'pending',
      certificate: 'certificate2.pdf'
    },
    {
      id: 3,
      name: 'Teaching Qualification',
      governingBody: 'National Education Board',
      dateCompleted: '2024-10-15',
      expiryDate: '2029-10-15',
      status: 'verified',
      certificate: 'certificate3.pdf'
    },
    {
      id: 4,
      name: 'Child Protection Training',
      governingBody: 'Child Safety Council',
      dateCompleted: '2024-11-20',
      expiryDate: '2025-11-20',
      status: 'rejected',
      certificate: 'certificate4.pdf',
      rejectionReason: 'Certificate is not clearly legible. Please upload a higher quality scan.'
    }
  ]);

  // State for new qualification form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQualification, setNewQualification] = useState({
    name: '',
    governingBody: '',
    dateCompleted: '',
    expiryDate: '',
    certificate: null as File | null
  });

  // State for certificate upload modal
  const [showCertificateUpload, setShowCertificateUpload] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<Qualification | null>(null);
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'expiry'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort qualifications
  const filteredAndSortedQualifications = qualifications
    .filter(qual => {
      // Apply search filter
      const matchesSearch = qual.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            qual.governingBody.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || qual.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.dateCompleted).getTime() - new Date(b.dateCompleted).getTime()
          : new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime();
      } else if (sortBy === 'expiry') {
        return sortOrder === 'asc' 
          ? new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          : new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
      }
      return 0;
    });

  // Count qualifications by status
  const statsData = {
    total: qualifications.length,
    verified: qualifications.filter(q => q.status === 'verified').length,
    pending: qualifications.filter(q => q.status === 'pending').length,
    rejected: qualifications.filter(q => q.status === 'rejected').length,
    expiringSoon: qualifications.filter(q => {
      const today = new Date();
      const expiryDate = new Date(q.expiryDate);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 90; // Expires within 90 days
    }).length
  };

  const getStatusIcon = (status: QualificationStatus) => {
    switch (status) {
      case 'verified':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: QualificationStatus) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Changes Requested';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: QualificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleCertificateUpload = useCallback((file: File) => {
    // Here you would typically handle the file upload to your backend
    console.log('Uploading certificate:', file);
    
    // Update the qualification with the new certificate
    if (selectedQualification) {
      setQualifications(prev => prev.map(qual => 
        qual.id === selectedQualification.id
          ? { ...qual, certificate: file.name, status: 'pending' as QualificationStatus }
          : qual
      ));
    }
    
    setShowCertificateUpload(false);
    setSelectedQualification(null);
  }, [selectedQualification]);

  const handleAddNewQualification = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newQualification.name || !newQualification.governingBody || !newQualification.dateCompleted) {
      alert('Please fill out all required fields');
      return;
    }

    // Create new qualification object
    const newQual: Qualification = {
      id: Math.max(...qualifications.map(q => q.id), 0) + 1,
      name: newQualification.name,
      governingBody: newQualification.governingBody,
      dateCompleted: newQualification.dateCompleted,
      expiryDate: newQualification.expiryDate || '',
      status: 'pending',
      certificate: newQualification.certificate ? newQualification.certificate.name : ''
    };

    // Add to qualifications
    setQualifications(prev => [...prev, newQual]);
    
    // Reset form
    setNewQualification({
      name: '',
      governingBody: '',
      dateCompleted: '',
      expiryDate: '',
      certificate: null
    });
    
    setShowAddForm(false);
  };

  const handleToggleSort = (field: 'name' | 'date' | 'expiry') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90; // Expires within 90 days
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewQualification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewQualification(prev => ({
        ...prev,
        certificate: e.target.files![0]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8" />
            Qualifications & Certificates
          </h1>
          <p className="text-gray-600">Manage your professional qualifications and certificates</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Qualification
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-3xl font-bold text-gray-900">{statsData.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-green-600">Verified</p>
              <p className="text-3xl font-bold text-green-700">{statsData.verified}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{statsData.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-red-600">Rejected</p>
              <p className="text-3xl font-bold text-red-700">{statsData.rejected}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-orange-600">Expiring Soon</p>
              <p className="text-3xl font-bold text-orange-700">{statsData.expiringSoon}</p>
            </div>
          </CardContent>
        </Card>
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
              placeholder="Search qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Qualifications List */}
      <Card className="mb-28">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle>Your Qualifications</CardTitle>
            <div className="flex gap-2">
              <button 
                onClick={() => handleToggleSort('name')}
                className="flex items-center text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Name
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </button>
              <button 
                onClick={() => handleToggleSort('date')}
                className="flex items-center text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Date
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </button>
              <button 
                onClick={() => handleToggleSort('expiry')}
                className="flex items-center text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Expiry
                <ArrowUpDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredAndSortedQualifications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No qualifications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search filters' 
                  : 'Add your first qualification to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Qualification
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedQualifications.map((qual) => (
                <div
                  key={qual.id}
                  className="border rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-4 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">{qual.name}</h3>
                          {getStatusBadge(qual.status)}
                          {isExpiringSoon(qual.expiryDate) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Bell className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{qual.governingBody}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            Completed: {new Date(qual.dateCompleted).toLocaleDateString()}
                          </span>
                          {qual.expiryDate && (
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              Expires: {new Date(qual.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 flex flex-col items-end">
                        <div className="flex gap-2">
                          {qual.certificate ? (
                            <button 
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View Certificate
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setSelectedQualification(qual);
                                setShowCertificateUpload(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Upload Certificate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {qual.status === 'rejected' && qual.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md text-sm text-red-700">
                        <p className="font-medium">Changes Requested:</p>
                        <p>{qual.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Qualification Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    Add Qualification
                  </h2>
                  <p className="text-gray-600">Add a new qualification or certificate</p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleAddNewQualification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualification Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={newQualification.name}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., First Aid Certificate"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Issuing Organization*</label>
                  <input
                    type="text"
                    name="governingBody"
                    value={newQualification.governingBody}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Red Cross"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Completed*</label>
                    <input
                      type="date"
                      name="dateCompleted"
                      value={newQualification.dateCompleted}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date (if applicable)</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={newQualification.expiryDate}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Certificate</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input 
                            type="file"
                            name="certificate"
                            onChange={handleFileChange}
                            className="sr-only"
                            accept="image/*,.pdf"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                      {newQualification.certificate && (
                        <p className="text-sm text-green-600">{newQualification.certificate.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewQualification}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Qualification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Upload Modal */}
      {showCertificateUpload && selectedQualification && (
        <CertificateUpload
          onUpload={handleCertificateUpload}
          onClose={() => {
            setShowCertificateUpload(false);
            setSelectedQualification(null);
          }}
        />
      )}
    </div>
  );
};

export default QualificationsPage; 