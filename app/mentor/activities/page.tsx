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
import { Loader2, Search, Filter, Clock, FileText, User, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
  verified_by_name?: string;
};

type Student = {
  id: string;
  name: string;
};

export default function MentorActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    pendingVerifications: 0,
    verifiedActivities: 0,
    rejectedActivities: 0
  });

  // Fetch assigned students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;
      
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        const response = await fetch('/api/students', { headers });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch students: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("Failed to load students. Please try again.");
      }
    };
    
    fetchStudents();
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
        
        // Fetch activities data
        const response = await fetch(`/api/activities?${queryParams.toString()}`, {
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
        
        setStats({
          totalActivities: data.length,
          pendingVerifications: pendingCount,
          verifiedActivities: verifiedCount,
          rejectedActivities: rejectedCount
        });
        
      } catch (error) {
        console.error("Error fetching activities:", error);
        setError("Failed to load activities. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [user, statusFilter, typeFilter, studentFilter]);

  // Filter activities based on search term
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = searchTerm === "" || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Helper function to render status badge
  const renderStatusBadge = (status?: string) => {
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
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Student Activities</h1>
          <p className="text-muted-foreground">
            View and manage activities submitted by your assigned students
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => router.push('/mentor/activities/new')}
          >
            New Activity
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
                <p className="text-3xl font-bold">{stats.pendingVerifications}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Activities</p>
                <p className="text-3xl font-bold">{stats.verifiedActivities}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected Activities</p>
                <p className="text-3xl font-bold">{stats.rejectedActivities}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            prefix={<Search className="h-4 w-4 mr-2 text-gray-400" />}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
        
        <div className="w-full sm:w-48">
          <Select value={studentFilter} onValueChange={setStudentFilter}>
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
        
        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Activities table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading activities...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <TableRow 
                      key={activity.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        router.push(`/mentor/activities/${activity.id}`);
                      }}
                    >
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{activity.student_name}</TableCell>
                      <TableCell className="capitalize">{activity.activity_type}</TableCell>
                      <TableCell>{formatDate(activity.date_completed)}</TableCell>
                      <TableCell>{activity.duration_minutes} min</TableCell>
                      <TableCell>{renderStatusBadge(activity.verification_status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-lg font-medium text-gray-500">No activities found</p>
                        <p className="text-sm text-gray-400">No activities match your current filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 