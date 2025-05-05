'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Award, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  FileText,
  User,
  Building,
  HistoryIcon,
  Bell
} from 'lucide-react';
import { Qualification, QualificationStatus } from '@/types/qualification';
import { CertificateUpload } from '@/components/certificate-upload';
import { useAuth } from '@/lib/auth-context';

// Sample qualification data - in a real app, this would come from an API
const qualificationsData: Qualification[] = [
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
];

// Sample history data
interface HistoryEntry {
  id: number;
  date: string;
  action: string;
  user: string;
  comment?: string;
}

const QualificationDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [qualification, setQualification] = useState<Qualification | null>(null);
  const [showCertificateUpload, setShowCertificateUpload] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQualification, setEditedQualification] = useState<Partial<Qualification>>({});
  
  // Sample history data - in a real app, this would come from an API
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([
    {
      id: 1,
      date: '2025-01-15',
      action: 'Qualification Created',
      user: 'Alice Johnson',
    },
    {
      id: 2,
      date: '2025-01-16',
      action: 'Certificate Uploaded',
      user: 'Alice Johnson',
    },
    {
      id: 3,
      date: '2025-01-18',
      action: 'Submitted for Verification',
      user: 'Alice Johnson',
    },
    {
      id: 4,
      date: '2025-01-20',
      action: 'Verified',
      user: 'Dr. Jane Smith',
      comment: 'Certificate verified with issuing body.'
    }
  ]);

  useEffect(() => {
    // In a real app, this would be an API call
    const qualId = parseInt(id as string);
    const qual = qualificationsData.find(q => q.id === qualId);
    
    if (qual) {
      setQualification(qual);
      setEditedQualification(qual);
    } else {
      // Qualification not found, redirect to qualifications list
      router.push('/qualifications');
    }
  }, [id, router]);

  const handleCertificateUpload = (file: File) => {
    // Here you would typically handle the file upload to your backend
    console.log('Uploading certificate:', file);
    
    // Update the qualification with the new certificate
    if (qualification) {
      const updatedQual = {
        ...qualification,
        certificate: file.name,
        status: 'pending' as QualificationStatus
      };
      
      setQualification(updatedQual);
      
      // Add history entry
      const newEntry: HistoryEntry = {
        id: Math.max(...historyEntries.map(h => h.id), 0) + 1,
        date: new Date().toISOString().split('T')[0],
        action: 'Certificate Updated',
        user: user?.name || 'Current User',
      };
      
      setHistoryEntries([...historyEntries, newEntry]);
    }
    
    setShowCertificateUpload(false);
  };

  const handleResubmit = () => {
    if (qualification) {
      const updatedQual = {
        ...qualification,
        status: 'pending' as QualificationStatus
      };
      
      setQualification(updatedQual);
      
      // Add history entry
      const newEntry: HistoryEntry = {
        id: Math.max(...historyEntries.map(h => h.id), 0) + 1,
        date: new Date().toISOString().split('T')[0],
        action: 'Resubmitted for Verification',
        user: user?.name || 'Current User',
      };
      
      setHistoryEntries([...historyEntries, newEntry]);
    }
  };

  const handleSaveEdit = () => {
    if (qualification && editedQualification) {
      const updatedQual = {
        ...qualification,
        ...editedQualification,
        status: 'pending' as QualificationStatus
      };
      
      setQualification(updatedQual);
      
      // Add history entry
      const newEntry: HistoryEntry = {
        id: Math.max(...historyEntries.map(h => h.id), 0) + 1,
        date: new Date().toISOString().split('T')[0],
        action: 'Details Updated',
        user: user?.name || 'Current User',
      };
      
      setHistoryEntries([...historyEntries, newEntry]);
      setIsEditing(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedQualification({
      ...editedQualification,
      [name]: value
    });
  };

  const getStatusBadge = (status: QualificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            Pending Verification
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Changes Requested
          </span>
        );
      default:
        return null;
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90; // Expires within 90 days
  };

  if (!qualification) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading qualification details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/qualifications" 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Qualifications
        </Link>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="h-8 w-8" />
              {qualification.name}
            </h1>
            <p className="text-gray-600">{qualification.governingBody}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {getStatusBadge(qualification.status)}
            {isExpiringSoon(qualification.expiryDate) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                <Bell className="h-4 w-4 mr-1" />
                Expires in {Math.ceil((new Date(qualification.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Qualification Details */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Qualification Details</CardTitle>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qualification Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editedQualification.name}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issuing Organization</label>
                    <input
                      type="text"
                      name="governingBody"
                      value={editedQualification.governingBody}
                      onChange={handleEditChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Completed</label>
                      <input
                        type="date"
                        name="dateCompleted"
                        value={editedQualification.dateCompleted}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={editedQualification.expiryDate}
                        onChange={handleEditChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedQualification(qualification);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Qualification Name</p>
                      <p className="flex items-center gap-2 mt-1">
                        <Award className="h-5 w-5 text-gray-400" /> 
                        {qualification.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Issuing Organization</p>
                      <p className="flex items-center gap-2 mt-1">
                        <Building className="h-5 w-5 text-gray-400" /> 
                        {qualification.governingBody}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date Completed</p>
                      <p className="flex items-center gap-2 mt-1">
                        <Calendar className="h-5 w-5 text-gray-400" /> 
                        {new Date(qualification.dateCompleted).toLocaleDateString()}
                      </p>
                    </div>
                    {qualification.expiryDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                        <p className="flex items-center gap-2 mt-1">
                          <Clock className="h-5 w-5 text-gray-400" /> 
                          {new Date(qualification.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              {qualification.certificate ? (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <p className="font-medium">{qualification.certificate}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      <button 
                        onClick={() => setShowCertificateUpload(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Update
                      </button>
                    </div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg text-xs text-gray-500">
                    Uploaded on {historyEntries.find(h => h.action.includes('Certificate'))?.date || 'N/A'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No certificate uploaded</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a certificate to complete this qualification
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCertificateUpload(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Certificate
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection Reason (if applicable) */}
          {qualification.status === 'rejected' && qualification.rejectionReason && (
            <Card className="border-red-100">
              <CardHeader className="pb-2 bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Changes Requested
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-red-50 text-red-700">
                <p>{qualification.rejectionReason}</p>
                <div className="mt-4">
                  <button
                    onClick={handleResubmit}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Resubmit for Verification
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {qualification.status === 'pending' && (
                  <div className="p-3 bg-yellow-50 rounded-md text-sm text-yellow-700 mb-4">
                    <p className="font-medium">Verification in Progress</p>
                    <p>Your qualification has been submitted and is awaiting verification.</p>
                  </div>
                )}
                <button 
                  onClick={() => setShowCertificateUpload(true)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {qualification.certificate ? 'Update Certificate' : 'Upload Certificate'}
                </button>
                {qualification.status === 'rejected' && (
                  <button 
                    onClick={handleResubmit}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Resubmit for Verification
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historyEntries.map((entry, index) => (
                  <div 
                    key={entry.id} 
                    className={`relative pl-6 ${
                      index !== historyEntries.length - 1 ? 'pb-4 border-l-2 border-gray-200' : ''
                    }`}
                  >
                    <div className="absolute left-[-5px] bg-white p-1">
                      <div className={`w-2 h-2 rounded-full ${
                        entry.action.includes('Verified') ? 'bg-green-500' :
                        entry.action.includes('Rejected') ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}></div>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()} by {entry.user}</p>
                      {entry.comment && (
                        <p className="text-xs text-gray-600 mt-1">{entry.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Certificate Upload Modal */}
      {showCertificateUpload && (
        <CertificateUpload
          onUpload={handleCertificateUpload}
          onClose={() => setShowCertificateUpload(false)}
        />
      )}
    </div>
  );
};

export default QualificationDetailPage; 