'use client';

import React, { useState } from 'react';
import { X, Upload, Award } from 'lucide-react';

interface QualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (qualification: {
    name: string;
    issuingOrganization: string;
    dateCompleted: string;
    expiryDate?: string;
    certificateFile?: File;
  }) => void;
}

export function QualificationModal({ isOpen, onClose, onSave }: QualificationModalProps) {
  const [qualification, setQualification] = useState({
    name: '',
    issuingOrganization: '',
    dateCompleted: '',
    expiryDate: '',
    certificateFile: undefined as File | undefined
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQualification(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQualification(prev => ({ ...prev, certificateFile: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(qualification);
    
    // Reset form
    setQualification({
      name: '',
      issuingOrganization: '',
      dateCompleted: '',
      expiryDate: '',
      certificateFile: undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Award className="h-6 w-6" />
            <h2 className="text-xl font-bold">Add Qualification</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-600 mb-4">Add a new qualification or certificate</p>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Qualification Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={qualification.name}
                  onChange={handleChange}
                  placeholder="e.g., First Aid Certificate"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Issuing Organization*
                </label>
                <input
                  type="text"
                  name="issuingOrganization"
                  value={qualification.issuingOrganization}
                  onChange={handleChange}
                  placeholder="e.g., Red Cross"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date Completed*
                </label>
                <input
                  type="date"
                  name="dateCompleted"
                  value={qualification.dateCompleted}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry Date (if applicable)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={qualification.expiryDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Certificate
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input 
                          type="file"
                          onChange={handleFileChange}
                          className="sr-only"
                          accept="image/*,.pdf"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    {qualification.certificateFile && (
                      <p className="text-sm text-green-600">{qualification.certificateFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Qualification
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 