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
  ChevronLeft,
  Filter,
  Search,
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
import { Qualification } from '@/types/qualification';
import { api } from '@/lib/api-client';

// Type for student with qualifications
interface Student {
  id: string;
  name: string;
  email: string;
  qualifications: Qualification[];
}

export default function MentorVerificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentQualification, setCurrentQualification] = useState<Qualification | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [collapsedStudents, setCollapsedStudents] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not logged in or not a mentor
  useEffect(() => {
    if (!loading) {  // Only check authentication after loading is complete
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'mentor') {
        router.push('/dashboard');
      }
    }
  }, [user, router, loading]);  // Add loading to the dependency array

  // Fetch assigned students and their qualifications
  useEffect(() => {
    if (user && user.role === 'mentor') {
      fetchAssignedStudents();
    }
  }, [user]);

  const fetchAssignedStudents = async () => {
    setIsLoading(true);
    try {
      // First, get all students assigned to this mentor
      const assignedStudents = await api.get<any[]>(`/api/mentor/${user?.id}/students`);
      const students: Student[] = [];

      // For each assigned student, fetch their qualifications
      for (const student of assignedStudents) {
        try {
          const qualifications = await api.get<Qualification[]>(`/api/student/${student.id}/qualifications`);
          // Add student with their qualifications
          students.push({
            id: student.id,
            name: student.name,
            email: student.email,
            qualifications
          });
        } catch (studentError) {
          console.error(`Error fetching qualifications for student ${student.id}:`, studentError);
        }
      }

      setStudents(students);
    } catch (error) {
      console.error('Error fetching students and qualifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assigned students and qualifications',
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
      await api.post(
        `/api/mentor/${user.id}/verifications/qualifications/${currentQualification.id}`,
        {
          action: approved ? 'verify' : 'reject',
          feedback: verificationFeedback
        }
      );

      toast({
        title: 'Success',
        description: `Qualification ${approved ? 'verified' : 'rejected'} successfully`
      });
      
      // Refresh student data
      fetchAssignedStudents();
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

  const getPendingQualificationsCount = () => {
    let count = 0;
    students.forEach(student => {
      student.qualifications.forEach(qualification => {
        if (qualification.verification_status === 'pending') {
          count++;
        }
      });
    });
    return count;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB').format(date);
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

  // Filter qualifications based on search term and type filter
  const filteredStudents = students.map(student => {
    const filteredQualifications = student.qualifications.filter(qual => {
      const matchesSearch = 
        qual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qual.issuing_organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterType === 'all' || 
        (filterType === 'pending' && qual.verification_status === 'pending') ||
        qual.type === filterType;
      
      return matchesSearch && matchesFilter;
    });
    
    return {
      ...student,
      qualifications: filteredQualifications
    };
  }).filter(student => student.qualifications.length > 0);

  // Toggle collapse state for a student
  const toggleCollapsed = (studentId: string) => {
    setCollapsedStudents({
      ...collapsedStudents,
      [studentId]: !collapsedStudents[studentId]
    });
  };

  // Initialize collapsed state for all students
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const initialCollapsedState: Record<string, boolean> = {};
      filteredStudents.forEach(student => {
        // Only set if not already in state to prevent infinite loops
        if (collapsedStudents[student.id] === undefined) {
          initialCollapsedState[student.id] = false; // All expanded by default
        }
      });
      
      // Only update if there are new keys to add
      if (Object.keys(initialCollapsedState).length > 0) {
        setCollapsedStudents(prev => ({
          ...prev,
          ...initialCollapsedState
        }));
      }
    }
  }, [filteredStudents]); // Remove collapsedStudents from dependencies

  // Calculate pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Update total pages when filtered students change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredStudents.length / studentsPerPage));
  }, [filteredStudents, studentsPerPage]);

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
          Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
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
          <h1 className="text-2xl font-bold">Qualification Verifications</h1>
        </div>
        <div className="bg-amber-50 px-3 py-1 rounded-full flex items-center">
          <Clock className="h-4 w-4 text-amber-600 mr-1" />
          <span className="text-sm font-medium text-amber-700">
            {getPendingQualificationsCount()} Pending
          </span>
        </div>
      </div>

      {/* Search and Filter */}
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
        <div className="relative w-full md:w-48">
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            className="w-full h-10 pl-3 pr-10 rounded-md border border-input bg-background text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="pending">Pending Only</option>
            <option value="degree">Degrees</option>
            <option value="certificate">Certificates</option>
            <option value="license">Licenses</option>
            <option value="course">Courses</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">No Qualifications Found</h2>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'You don\'t have any students with qualifications to verify yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentStudents.map((student) => (
              <Card key={student.id} className="overflow-hidden">
                <CardHeader 
                  className="flex flex-row items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50" 
                  onClick={() => toggleCollapsed(student.id)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <CardTitle className="text-lg font-semibold">{student.name}</CardTitle>
                      <span className="text-sm text-gray-500">{student.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-sm">
                      <span className="font-medium">{student.qualifications.length}</span>
                      <span className="ml-1 text-gray-500">Qualifications</span>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform duration-200 ${
                        collapsedStudents[student.id] ? '' : 'rotate-180'
                      }`} 
                    />
                  </div>
                </CardHeader>
                
                {!collapsedStudents[student.id] && (
                  <CardContent className="px-0 pb-0">
                    <ul className="divide-y divide-gray-200">
                      {student.qualifications.map((qualification) => (
                        <li key={qualification.id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium text-gray-800">{qualification.title}</h3>
                                <span className="ml-3">
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                                    qualification.verification_status === 'pending' 
                                      ? 'bg-amber-50 text-amber-600'
                                      : qualification.verification_status === 'verified'
                                      ? 'bg-green-50 text-green-600'
                                      : 'bg-red-50 text-red-600'
                                  }`}>
                                    {qualification.verification_status === 'pending' && (
                                      <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {qualification.verification_status === 'verified' && (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {qualification.verification_status === 'rejected' && (
                                      <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {qualification.verification_status.charAt(0).toUpperCase() + 
                                    qualification.verification_status.slice(1)}
                                  </div>
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
                                  View Certificate
                                </Button>
                              )}
                              
                              {qualification.verification_status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => setCurrentQualification(qualification)}
                                >
                                  Verify
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