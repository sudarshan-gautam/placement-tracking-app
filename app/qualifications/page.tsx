'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, Upload, Check, Clock, AlertCircle, User, Calendar, BookOpen } from 'lucide-react';
import { Qualification, QualificationStatus } from '@/types/qualification';
import { CertificateUpload } from '@/components/certificate-upload';

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
    }
  ]);

  const [showCertificateUpload, setShowCertificateUpload] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<Qualification | null>(null);

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

  const handleViewCertificate = (qualification: Qualification) => {
    // Here you would typically handle viewing the certificate
    console.log('Viewing certificate:', qualification.certificate);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-8 w-8" />
          Qualifications & Experience
        </h1>
        <p className="text-gray-600">Manage your professional qualifications and certificates</p>
      </div>

      {/* Add New Qualification Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Qualification</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualification Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter qualification name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Governing Body</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter governing body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Completed</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date (if applicable)</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Upload Certificate</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Qualification
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List of Qualifications */}
      <Card className="mb-28">
        <CardHeader>
          <CardTitle>Your Qualifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualifications.map((qual) => (
              <div
                key={qual.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">{qual.name}</h3>
                    {getStatusIcon(qual.status)}
                  </div>
                  <p className="text-sm text-gray-500">{qual.governingBody}</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>Completed: {qual.dateCompleted}</span>
                    <span>Expires: {qual.expiryDate}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {getStatusText(qual.status)}
                  </span>
                  <div className="flex gap-2">
                    {qual.certificate ? (
                      <button 
                        onClick={() => handleViewCertificate(qual)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Certificate
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedQualification(qual);
                          setShowCertificateUpload(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Upload Modal */}
      {showCertificateUpload && (
        <CertificateUpload
          onUpload={handleCertificateUpload}
          onClose={() => {
            setShowCertificateUpload(false);
            setSelectedQualification(null);
          }}
        />
      )}

      {/* Filter Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option>All Categories</option>
              <option>Teaching</option>
              <option>Safety</option>
              <option>Professional Development</option>
            </select>
            <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option>All Status</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
          <button className="text-blue-600 hover:text-blue-700">
            Export List
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
          <Link href="/qualifications" className="flex flex-col items-center text-blue-600">
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

export default QualificationsPage; 