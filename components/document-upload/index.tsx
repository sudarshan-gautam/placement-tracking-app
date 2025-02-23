'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, File, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DocumentUpload } from '@/types/overview';

interface DocumentUploaderProps {
  documents: DocumentUpload[];
  onUpload: (file: File, type: DocumentUpload['type']) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle the upload
      onUpload(e.dataTransfer.files[0], 'certificate');
    }
  };

  const getStatusIcon = (status: DocumentUpload['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Documents & Evidence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            Drag and drop your files here, or{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    onUpload(e.target.files[0], 'certificate');
                  }
                }}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: PDF, PNG, JPG (up to 10MB)
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center gap-4">
                <File className="h-8 w-8 text-gray-400" />
                <div>
                  <h3 className="font-medium">{doc.title}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {getStatusIcon(doc.status)}
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 