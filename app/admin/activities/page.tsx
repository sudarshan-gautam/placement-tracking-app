"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Filter, Clock, FileText, User, Calendar, CheckCircle, XCircle, AlertCircle, Download, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type Activity = {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  date_completed: string;
  duration_minutes: number;
  evidence_url?: string;
  status: string;
  student_id: string;
  student_name: string;
  verification_id?: string;
  verification_status?: string;
  feedback?: string;
  verified_by?: string;
  verified_by_name?: string;
  created_at?: string;
  updated_at?: string;
  
  // For UI compatibility
  type?: string;
  date?: string;
  duration?: string | number;
};

type Student = {
  id: string;
  name: string;
};

type Mentor = {
  id: string;
  name: string;
};

export default function AdminActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingVerifications: 0,
    verifiedActivities: 0,
    rejectedActivities: 0,
    unsubmittedActivities: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch students and mentors
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Fetch students
        const studentsResponse = await fetch('/api/students', { headers });
        
        if (!studentsResponse.ok) {
          throw new Error(`Failed to fetch students: ${studentsResponse.statusText}`);
        }
        
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
        
        // Fetch mentors
        const mentorsResponse = await fetch('/api/mentors', { headers });
        
        if (!mentorsResponse.ok) {
          throw new Error(`Failed to fetch mentors: ${mentorsResponse.statusText}`);
        }
        
        const mentorsData = await mentorsResponse.json();
        setMentors(mentorsData);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
      }
    };
    
    fetchUsers();
  }, [user]);

  // Fetch activities data
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Build query params
        let queryParams = new URLSearchParams();
        
        if (statusFilter !== 'all') {
          queryParams.append('status', statusFilter);
        }
        
        if (typeFilter !== 'all') {
          queryParams.append('type', typeFilter);
        }
        
        if (studentFilter !== 'all') {
          queryParams.append('studentId', studentFilter);
        }
        
        if (mentorFilter !== 'all') {
          queryParams.append('mentorId', mentorFilter);
        }
        
        // Fetch activities data - admins can see all activities
        const response = await fetch(`/api/admin/activities?${queryParams.toString()}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setActivities(data);
        
        // Calculate stats
        const pendingCount = data.filter((a: Activity) => a.verification_status === 'pending').length;
        const verifiedCount = data.filter((a: Activity) => a.verification_status === 'verified').length;
        const rejectedCount = data.filter((a: Activity) => a.verification_status === 'rejected').length;
        const unsubmittedCount = data.filter((a: Activity) => a.status === 'draft').length;
        
        setStats({
          totalActivities: data.length,
          pendingVerifications: pendingCount,
          verifiedActivities: verifiedCount,
          rejectedActivities: rejectedCount,
          unsubmittedActivities: unsubmittedCount
        });
        
      } catch (error) {
        console.error("Error fetching activities:", error);
        setError("Failed to load activities. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [user, statusFilter, typeFilter, studentFilter, mentorFilter]);

  // Filter activities based on search term
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = searchTerm === "" || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.verified_by_name && activity.verified_by_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper function to get the verification status considering both naming conventions
  const getVerificationStatus = (activity: Activity): string => {
    return activity.verification_status || activity.status || 'pending';
  };

  // Helper function to render status badge
  const renderStatusBadge = (activity: Activity) => {
    const status = getVerificationStatus(activity);
    
    switch (status) {
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />Verified
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
          <AlertCircle className="h-3 w-3 mr-1" />Pending
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          <XCircle className="h-3 w-3 mr-1" />Rejected
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
          Not Submitted
        </Badge>;
    }
  };

  // Reset filters to default
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setStudentFilter("all");
    setMentorFilter("all");
    setCurrentPage(1);
  };

  // Export activities data
  const exportActivities = () => {
    try {
      const headers = ['Title', 'Student', 'Type', 'Date', 'Duration (mins)', 'Status', 'Verified By'];
      
      const csvRows = [
        headers.join(','),
        ...filteredActivities.map(activity => [
          `"${activity.title.replace(/"/g, '""')}"`,
          `"${activity.student_name.replace(/"/g, '""')}"`,
          activity.activity_type,
          formatDate(activity.date_completed),
          activity.duration_minutes,
          activity.verification_status || 'Not Submitted',
          activity.verified_by_name || 'N/A'
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `activities_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Activities data has been exported as CSV."
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting activities data.",
        variant: "destructive"
      });
    }
  };

  // Helper function to safely format dates
  const safeFormatDate = (date?: string): string => {
    if (!date) return "—";
    return formatDate(date);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Activities Management</h1>
          <p className="text-muted-foreground">
            View and manage all student activities in the system
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button 
            onClick={() => router.push('/admin/activities/new')}
          >
            New Activity
          </Button>
          <Button 
            variant="outline" 
            onClick={exportActivities} 
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-3xl font-bold">{stats.totalActivities}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-9"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Unsubmitted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onValueChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="coursework">Coursework</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-60">
          <Select value={studentFilter} onValueChange={(value) => {
            setStudentFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-60">
          <Select value={mentorFilter} onValueChange={(value) => {
            setMentorFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by mentor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mentors</SelectItem>
              {mentors.map((mentor) => (
                <SelectItem key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      {/* Activities Table */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          {error}
        </div>
      )}
        
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading activities...</span>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.length > 0 ? (
                    paginatedActivities.map((activity) => (
                      <TableRow 
                        key={activity.id} 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => router.push(`/admin/activities/${activity.id}`)}
                      >
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>{activity.student_name}</TableCell>
                        <TableCell className="capitalize">{activity.activity_type || activity.type}</TableCell>
                        <TableCell>{safeFormatDate(activity.date_completed || activity.date)}</TableCell>
                        <TableCell>{activity.duration_minutes || activity.duration} mins</TableCell>
                        <TableCell>{renderStatusBadge(activity)}</TableCell>
                        <TableCell>{activity.verified_by_name || "—"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No activities found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 