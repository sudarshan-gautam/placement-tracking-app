'use client';

import React, { useState } from 'react';
import { Check, X, FileText, Calendar, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface VerificationRequest {
  id: number;
  type: string;
  title: string;
  user: string;
  date: string;
  priority: string;
  // Add more properties as needed for a real implementation
  description?: string;
  submittedBy?: string;
  attachments?: string[];
}

interface VerificationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationRequest | null;
  onApprove: (id: number, feedback: string) => void;
  onReject: (id: number, reason: string) => void;
}

export function VerificationReviewModal({ 
  isOpen, 
  onClose, 
  verification, 
  onApprove, 
  onReject 
}: VerificationReviewModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  if (!isOpen || !verification) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const handleReject = () => {
    if (isRejectMode) {
      onReject(verification.id, rejectReason);
      setRejectReason('');
      setIsRejectMode(false);
    } else {
      setIsRejectMode(true);
    }
  };

  const handleCancel = () => {
    setRejectReason('');
    setIsRejectMode(false);
    setFeedback('');
    onClose();
  };

  const handleApprove = () => {
    onApprove(verification.id, feedback);
    setFeedback('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Review Verification</h2>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Verification Details */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(verification.priority)} mr-3`}>
              {verification.priority}
            </span>
            <span className="text-gray-500 text-sm">{verification.type}</span>
          </div>
          
          <h3 className="text-xl font-bold mb-4">{verification.title}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span>{verification.user}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <span>{verification.date}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700">
              {verification.description || `This is a ${verification.type.toLowerCase()} verification request. In a real implementation, this would display the full details of the verification.`}
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Attachments</h4>
            {verification.attachments && verification.attachments.length > 0 ? (
              <div className="space-y-2">
                {verification.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <Link href="#" className="text-blue-600 hover:underline">{attachment}</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No attachments provided</p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {isRejectMode ? (
          <div>
            <div className="mb-4">
              <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for rejection
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                placeholder="Please provide a reason for rejecting this verification..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsRejectMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                disabled={!rejectReason.trim()}
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Confirm Rejection
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (optional)
              </label>
              <textarea
                id="feedback"
                rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                placeholder="Add any feedback or comments about this verification..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReject}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <X className="h-5 w-5 mr-2" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Check className="h-5 w-5 mr-2" />
                Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 