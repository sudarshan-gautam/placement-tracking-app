'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { 
  Award, 
  FileText,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock, 
  Edit,
  Trash,
  ChevronLeft,
  Download,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollapseCard } from '@/components/ui/collapsible-card';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import QualificationForm from '../components/qualification-form';
import { Qualification } from '@/types/qualification';
import { api } from '@/lib/api-client';

export default function QualificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingQualification, setIsAddingQualification] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  const [deletingQualification, setDeletingQualification] = useState<Qualification | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [qualificationsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading) {  // Only check authentication after loading is complete
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'student') {
        // For now, only students can access this page
        router.push('/dashboard');
      }
    }
  }, [user, router, loading]);  // Add loading to the dependency array

  // Fetch qualifications once after authentication is confirmed
  useEffect(() => {
    if (user && !isLoading) {
      fetchQualifications();
    }
  }, [user]); // Remove fetchQualifications to avoid dependency loop

  const fetchQualifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Qualification[]>(`/api/student/${user?.id}/qualifications`);
      setQualifications(data);
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load qualifications',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQualification = () => {
    setIsAddingQualification(true);
  };

  const handleEditQualification = (qualification: Qualification) => {
    setEditingQualification(qualification);
  };

  const handleDeleteQualification = async () => {
    if (!deletingQualification) return;

    try {
      await api.delete(`/api/student/${user?.id}/qualifications/${deletingQualification.id}`);
      
      toast({
        title: 'Success',
        description: 'Qualification deleted successfully'
      });
      fetchQualifications();
    } catch (error) {
      console.error('Error deleting qualification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete qualification',
        variant: 'destructive'
      });
    } finally {
      setDeletingQualification(null);
    }
  };

  const handleQualificationSaved = () => {
    fetchQualifications();
    setIsAddingQualification(false);
    setEditingQualification(null);
  };

  const handleCancelForm = () => {
    setIsAddingQualification(false);
    setEditingQualification(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB').format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Verified
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            Pending
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  const getQualificationTypeLabel = (type: string) => {
    switch (type) {
      case 'degree':
        return 'Degree';
      case 'certificate':
        return 'Certificate';
      case 'license':
        return 'License';
      case 'course':
        return 'Course';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  // Calculate pagination
  const indexOfLastQualification = currentPage * qualificationsPerPage;
  const indexOfFirstQualification = indexOfLastQualification - qualificationsPerPage;
  const currentQualifications = qualifications.slice(
    indexOfFirstQualification,
    indexOfLastQualification
  );

  // Update total pages when qualifications change
  useEffect(() => {
    setTotalPages(Math.ceil(qualifications.length / qualificationsPerPage));
  }, [qualifications, qualificationsPerPage]);

  // Page change handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
  return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstQualification + 1} to {Math.min(indexOfLastQualification, qualifications.length)} of {qualifications.length} qualifications
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
            </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => router.push('/dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">My Qualifications</h1>
        </div>
        <Button onClick={() => setIsAddingQualification(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Qualification
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
            </div>
      ) : qualifications.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">No Qualifications Yet</h2>
          <p className="text-gray-500 mb-6">
            Add your qualifications to showcase your expertise and achievements
          </p>
          <Button onClick={() => setIsAddingQualification(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Qualification
          </Button>
            </div>
          ) : (
        <>
          <CollapseCard 
            title="My Qualifications" 
            icon={<Award className="h-5 w-5" />}
            defaultExpanded={true}
          >
            <ul className="divide-y divide-gray-200">
              {currentQualifications.map((qualification) => (
                <li key={qualification.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-800">{qualification.title}</h3>
                        <span className="ml-3">{getStatusBadge(qualification.verification_status)}</span>
                      </div>
                      <p className="text-sm text-gray-500">{qualification.issuing_organization}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {qualification.certificate_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingCertificate(qualification.certificate_url!)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Certificate
                        </Button>
                      )}
                      
                      {qualification.verification_status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingQualification(qualification)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => setDeletingQualification(qualification)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                          )}
                        </div>
                      </div>
                  
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span> {getQualificationTypeLabel(qualification.type)}
                    </div>
                    <div>
                      <span className="text-gray-500">Date Obtained:</span> {formatDate(qualification.date_obtained)}
                    </div>
                    {qualification.expiry_date && (
                      <div>
                        <span className="text-gray-500">Expiry Date:</span> {formatDate(qualification.expiry_date)}
                      </div>
                    )}
                  </div>
                  
                  {qualification.description && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Description:</span> {qualification.description}
                </div>
                  )}
                </li>
              ))}
            </ul>
          </CollapseCard>
          
          {/* Pagination */}
          {qualifications.length > qualificationsPerPage && renderPagination()}
        </>
      )}

      {/* Add Qualification Dialog */}
      <Dialog open={isAddingQualification} onOpenChange={setIsAddingQualification}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Qualification</DialogTitle>
            <DialogDescription>
              Add your qualifications to showcase your expertise and achievements
            </DialogDescription>
          </DialogHeader>
          {user && (
            <QualificationForm
              userId={user.id}
              onSuccess={handleQualificationSaved}
              onCancel={handleCancelForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Qualification Dialog */}
      <Dialog
        open={!!editingQualification}
        onOpenChange={(open) => !open && setEditingQualification(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Qualification</DialogTitle>
            <DialogDescription>
              Update your qualification details
            </DialogDescription>
          </DialogHeader>
          {user && editingQualification && (
            <QualificationForm
              userId={user.id}
              qualificationId={editingQualification.id}
              initialData={{
                title: editingQualification.title,
                issuing_organization: editingQualification.issuing_organization,
                description: editingQualification.description || '',
                date_obtained: editingQualification.date_obtained,
                expiry_date: editingQualification.expiry_date || '',
                type: editingQualification.type as any,
                certificate_file: undefined
              }}
              onSuccess={handleQualificationSaved}
              onCancel={handleCancelForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingQualification}
        onOpenChange={(open) => !open && setDeletingQualification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Qualification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this qualification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingQualification(null)}
                >
                  Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQualification}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Viewer Dialog */}
      <Dialog
        open={!!viewingCertificate}
        onOpenChange={(open) => !open && setViewingCertificate(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Certificate</DialogTitle>
          </DialogHeader>
          <div className="h-[60vh] overflow-auto">
            {viewingCertificate && (
              viewingCertificate.endsWith('.pdf') ? (
                <iframe
                  src={viewingCertificate}
                  className="w-full h-full"
                  title="Certificate PDF"
                ></iframe>
              ) : (
                <img
                  src={viewingCertificate}
                  alt="Certificate"
                  className="max-w-full h-auto mx-auto"
                />
              )
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewingCertificate(null)}
            >
              Close
            </Button>
            {viewingCertificate && (
              <Button asChild>
                <a
                  href={viewingCertificate}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 