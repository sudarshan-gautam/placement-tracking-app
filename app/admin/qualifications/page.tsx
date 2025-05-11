'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  Search,
  Filter,
  ChevronLeft,
  User,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Qualification, VerificationStatus } from '@/types/qualification';

// Extended qualification type with student details
interface QualificationWithStudent extends Qualification {
  student_name: string;
  student_email: string;
  verifier_name?: string;
}

export default function AdminQualificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [qualifications, setQualifications] = useState<QualificationWithStudent[]>([]);
  const [currentQualification, setCurrentQualification] = useState<QualificationWithStudent | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [qualificationsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [viewType, setViewType] = useState<'list' | 'grouped'>('list');
  const [groupedQualifications, setGroupedQualifications] = useState<Record<string, QualificationWithStudent[]>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, router, loading]);

  // Fetch all qualifications
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchQualifications();
    }
  }, [user]);

  const fetchQualifications = async () => {
    setIsLoading(true);
    try {
      // Construct query parameters
      let queryParams = new URLSearchParams();
      if (filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }
      if (filterType !== 'all') {
        queryParams.append('type', filterType);
      }

      const response = await fetch(`/api/admin/qualifications?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch qualifications');
      }

      const data = await response.json();
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

  const handleVerify = async (approved: boolean) => {
    if (!currentQualification || !user) return;

    setIsVerifying(true);
    try {
      const response = await fetch(
        `/api/admin/qualifications/${currentQualification.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            verification_status: approved ? 'verified' : 'rejected',
            verified_by: user.id,
            feedback: verificationFeedback
          })
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Qualification ${approved ? 'verified' : 'rejected'} successfully`
        });
        
        // Refresh qualifications
        fetchQualifications();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to process verification',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error verifying qualification:', error);
      toast({
        title: 'Error',
        description: 'Failed to process verification',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
      setCurrentQualification(null);
      setVerificationFeedback('');
    }
  };

  const handleDelete = async (qualification: QualificationWithStudent) => {
    try {
      const response = await fetch(
        `/api/admin/qualifications/${qualification.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Qualification deleted successfully'
        });
        
        // Refresh qualifications
        fetchQualifications();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete qualification',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting qualification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete qualification',
        variant: 'destructive'
      });
    }
  };

  const getPendingQualificationsCount = () => {
    return qualifications.filter(q => q.verification_status === 'pending').length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB').format(date);
  };

  const getStatusBadge = (status: VerificationStatus) => {
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
            <XCircle className="h-3 w-3" />
            Rejected
          </div>
        );
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

  // Filter qualifications based on search term
  const filteredQualifications = qualifications.filter(qual => {
    return (
      qual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qual.issuing_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qual.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qual.student_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate pagination
  const indexOfLastQualification = currentPage * qualificationsPerPage;
  const indexOfFirstQualification = indexOfLastQualification - qualificationsPerPage;
  const currentQualifications = filteredQualifications.slice(
    indexOfFirstQualification,
    indexOfLastQualification
  );

  // Update total pages when filtered qualifications change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredQualifications.length / qualificationsPerPage));
  }, [filteredQualifications, qualificationsPerPage]);

  // Page change handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstQualification + 1} to {Math.min(indexOfLastQualification, filteredQualifications.length)} of {filteredQualifications.length} qualifications
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

  // Group qualifications by student
  useEffect(() => {
    if (viewType === 'grouped' && filteredQualifications.length > 0) {
      const grouped: Record<string, QualificationWithStudent[]> = {};
      
      // Group by student_id
      filteredQualifications.forEach(qualification => {
        const studentId = qualification.student_id;
        if (!grouped[studentId]) {
          grouped[studentId] = [];
        }
        grouped[studentId].push(qualification);
      });
      
      setGroupedQualifications(grouped);
      
      // Initialize collapsed state only for new students
      const initialCollapsedState: Record<string, boolean> = {};
      Object.keys(grouped).forEach(studentId => {
        if (collapsedGroups[studentId] === undefined) {
          initialCollapsedState[studentId] = false; // All expanded by default
        }
      });
      
      // Only update if there are new keys to add
      if (Object.keys(initialCollapsedState).length > 0) {
        setCollapsedGroups(prev => ({
          ...prev,
          ...initialCollapsedState
        }));
      }
    }
  }, [filteredQualifications, viewType]); // Remove collapsedGroups from dependencies
  
  // Toggle collapse state for a student group
  const toggleCollapsed = (studentId: string) => {
    setCollapsedGroups({
      ...collapsedGroups,
      [studentId]: !collapsedGroups[studentId]
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => router.push('/admin')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Qualification Management</h1>
        </div>
        <div className="bg-amber-50 px-3 py-1 rounded-full flex items-center">
          <Clock className="h-4 w-4 text-amber-600 mr-1" />
          <span className="text-sm font-medium text-amber-700">
            {getPendingQualificationsCount()} Pending
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search by title, organization, or student name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-40">
            <select
              className="w-full h-10 pl-3 pr-10 rounded-md border border-input bg-background text-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                fetchQualifications();
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative w-full md:w-40">
            <select
              className="w-full h-10 pl-3 pr-10 rounded-md border border-input bg-background text-sm"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                fetchQualifications();
              }}
            >
              <option value="all">All Types</option>
              <option value="degree">Degrees</option>
              <option value="certificate">Certificates</option>
              <option value="license">Licenses</option>
              <option value="course">Courses</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="relative w-full md:w-40">
            <select
              className="w-full h-10 pl-3 pr-10 rounded-md border border-input bg-background text-sm"
              value={viewType}
              onChange={(e) => setViewType(e.target.value as 'list' | 'grouped')}
            >
              <option value="list">List View</option>
              <option value="grouped">Grouped by Student</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
        </div>
      ) : filteredQualifications.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">No Qualifications Found</h2>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'There are no qualifications in the system yet'}
          </p>
        </div>
      ) : (
        <>
          {viewType === 'list' ? (
            // Table view
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentQualifications.map((qualification) => (
                    <tr key={qualification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{qualification.student_name}</div>
                            <div className="text-sm text-gray-500">{qualification.student_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{qualification.title}</div>
                        <div className="text-sm text-gray-500">{qualification.issuing_organization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getQualificationTypeLabel(qualification.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(qualification.date_obtained)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(qualification.verification_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {qualification.certificate_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingCertificate(qualification.certificate_url!)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                          
                          {qualification.verification_status === 'pending' ? (
                            <Button
                              size="sm"
                              onClick={() => setCurrentQualification(qualification)}
                            >
                              Verify
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleDelete(qualification)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Grouped by student view
            <div className="space-y-4">
              {Object.entries(groupedQualifications).map(([studentId, qualifications]) => (
                <Card key={studentId} className="overflow-hidden">
                  <CardHeader 
                    className="flex flex-row items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50" 
                    onClick={() => toggleCollapsed(studentId)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <CardTitle className="text-lg font-semibold">{qualifications[0].student_name}</CardTitle>
                        <span className="text-sm text-gray-500">{qualifications[0].student_email}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-sm">
                        <span className="font-medium">{qualifications.length}</span>
                        <span className="ml-1 text-gray-500">Qualifications</span>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 transition-transform duration-200 ${
                          collapsedGroups[studentId] ? '' : 'rotate-180'
                        }`} 
                      />
                    </div>
                  </CardHeader>
                  
                  {!collapsedGroups[studentId] && (
                    <CardContent className="px-0 pb-0">
                      <ul className="divide-y divide-gray-200">
                        {qualifications.map((qualification) => (
                          <li key={qualification.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <h3 className="text-lg font-medium text-gray-800">{qualification.title}</h3>
                                  <span className="ml-3">
                                    {getStatusBadge(qualification.verification_status)}
                                  </span>
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
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                )}
                                
                                {qualification.verification_status === 'pending' ? (
                                  <Button
                                    size="sm"
                                    onClick={() => setCurrentQualification(qualification)}
                                  >
                                    Verify
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() => handleDelete(qualification)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Type:</span> {getQualificationTypeLabel(qualification.type)}
                              </div>
                              <div>
                                <span className="text-gray-500">Date Obtained:</span> {formatDate(qualification.date_obtained)}
                              </div>
                            </div>
                            
                            {qualification.description && (
                              <div className="mt-2 text-sm">
                                <span className="text-gray-500">Description:</span> {qualification.description}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Verification Dialog */}
      <Dialog
        open={!!currentQualification}
        onOpenChange={(open) => !open && setCurrentQualification(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Qualification</DialogTitle>
            <DialogDescription>
              Review this qualification before approving or rejecting
            </DialogDescription>
          </DialogHeader>
          
          {currentQualification && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{currentQualification.student_name}</p>
                  <p className="text-sm text-gray-500">{currentQualification.student_email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p>{currentQualification.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Issuing Organization</h3>
                  <p>{currentQualification.issuing_organization}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Obtained</h3>
                  <p>{formatDate(currentQualification.date_obtained)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p>{getQualificationTypeLabel(currentQualification.type)}</p>
                </div>
                {currentQualification.expiry_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                    <p>{formatDate(currentQualification.expiry_date)}</p>
                  </div>
                )}
              </div>
              
              {currentQualification.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-sm">{currentQualification.description}</p>
                </div>
              )}
              
              {currentQualification.certificate_url ? (
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Certificate</h3>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingCertificate(currentQualification.certificate_url!)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Certificate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={currentQualification.certificate_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-amber-50 p-4 text-amber-800">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>No certificate has been uploaded for this qualification</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Feedback (optional)</h3>
                <Textarea
                  placeholder="Enter any feedback or notes about this verification"
                  value={verificationFeedback}
                  onChange={(e) => setVerificationFeedback(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQualification(null)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleVerify(false)}
                disabled={isVerifying}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                variant="default"
                onClick={() => handleVerify(true)}
                disabled={isVerifying}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
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