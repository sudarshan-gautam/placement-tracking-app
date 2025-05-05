'use client';

import React, { useState } from 'react';
import { Check, X, FileText, Calendar, User, AlertTriangle, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperclipIcon } from '@/components/icons/paperclip';
import { StarIcon } from '@/components/icons/star';

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
  verification: {
    id: number;
    type: string;
    title: string;
    user: string;
    date: string;
    priority: string;
    description: string;
    attachments: string[];
    status: string;
  } | null;
  onApprove: (id: number, feedback: string, rating: number) => void;
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
  const [rating, setRating] = useState(0);
  const [isApproving, setIsApproving] = useState(true);
  
  if (!isOpen || !verification) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
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

  const handleSubmit = () => {
    if (isApproving) {
      onApprove(verification.id, feedback, rating);
    } else {
      onReject(verification.id, feedback);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review Verification Request</DialogTitle>
          <DialogDescription>
            Review the verification request details and provide feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{verification.title}</h3>
              <p className="text-sm text-gray-500">By {verification.user}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(verification.priority)}`}>
              {verification.priority}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-gray-600">{verification.description}</p>
          </div>

          {verification.attachments && verification.attachments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Attachments</h4>
              <div className="flex flex-wrap gap-2">
                {verification.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                    <PaperclipIcon className="h-4 w-4" />
                    <span className="text-sm">{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium">Feedback</h4>
            <Textarea
              value={isRejectMode ? rejectReason : feedback}
              onChange={(e) => isRejectMode ? setRejectReason(e.target.value) : setFeedback(e.target.value)}
              placeholder={isRejectMode ? "Enter reason for rejection..." : "Enter your feedback..."}
              className="min-h-[100px]"
            />
          </div>

          {!isRejectMode && (
            <div className="space-y-2">
              <h4 className="font-medium">Rating</h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 rounded-full hover:bg-gray-100 ${
                      rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <StarIcon className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {isRejectMode ? (
              <Button variant="destructive" onClick={handleSubmit} disabled={!rejectReason}>
                Confirm Rejection
              </Button>
            ) : (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
                <Button onClick={handleSubmit} disabled={!feedback || rating === 0}>
                  Approve
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 