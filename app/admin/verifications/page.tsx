"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// Define verification type
type Verification = {
  id: string;
  verification_type: string;
  verification_status: string;
  feedback?: string;
  verified_by_name?: string;
  student_id?: string;
  student_name?: string;
  user_id?: string;
  user_name?: string;
  // Qualification specific
  title?: string;
  issuing_organization?: string;
  date_obtained?: string;
  type?: string;
  // Session specific
  date?: string;
  start_time?: string;
  end_time?: string;
  reflection?: string;
  session_status?: string;
  // Competency specific
  level?: string;
  competency_id?: string;
  competency_name?: string;
  competency_category?: string;
  // Profile specific
  user_email?: string;
  user_role?: string;
};

// Define counts type
type VerificationCounts = {
  qualifications: number;
  sessions: number;
  competencies: number;
  profiles: number;
  total: number;
};

export default function AdminVerificationsPage() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<Record<string, Verification[]>>({
    qualifications: [],
    sessions: [],
    competencies: [],
    profiles: []
  });
  const [counts, setCounts] = useState<VerificationCounts>({
    qualifications: 0,
    sessions: 0,
    competencies: 0,
    profiles: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [currentTab, setCurrentTab] = useState("qualifications");
  const [studentFilter, setStudentFilter] = useState("all");
  const [students, setStudents] = useState<{id: string, name: string}[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    qualifications: 1,
    sessions: 1,
    competencies: 1,
    profiles: 1
  });
  const itemsPerPage = 5;

  // Fetch students for the filter dropdown
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
      }
    };
    
    fetchStudents();
  }, [user]);

  // Fetch verifications data
  useEffect(() => {
    const fetchVerifications = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Build query params
        let queryParams = new URLSearchParams();
        queryParams.append('type', 'all');
        
        if (statusFilter !== 'all') {
          queryParams.append('status', statusFilter);
        }
        
        if (studentFilter && studentFilter !== 'all') {
          queryParams.append('studentId', studentFilter);
        }
        
        // Fetch verifications data
        const response = await fetch(`/api/verifications?${queryParams.toString()}`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch verifications: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Update state with fetched data
        setVerifications({
          qualifications: data.qualifications || [],
          sessions: data.sessions || [],
          competencies: data.competencies || [],
          profiles: data.profiles || []
        });
        
        // Update counts
        setCounts(data.counts || {
          qualifications: 0,
          sessions: 0,
          competencies: 0,
          profiles: 0,
          total: 0
        });
        
      } catch (error) {
        console.error("Error fetching verifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVerifications();
  }, [user, statusFilter, studentFilter]);

  // Filter verifications based on search term
  const getFilteredVerifications = (type: string) => {
    const items = verifications[type] || [];
    
    if (!searchTerm) return items;
    
    const searchLower = searchTerm.toLowerCase();
    
    return items.filter(item => {
      // Common fields first
      const studentName = item.student_name || item.user_name || "";
      
      if (studentName.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Type-specific fields
      switch (type) {
        case "qualifications":
        return (
            (item.title?.toLowerCase().includes(searchLower) || false) ||
            (item.issuing_organization?.toLowerCase().includes(searchLower) || false) ||
            (item.type?.toLowerCase().includes(searchLower) || false)
          );
        
        case "sessions":
        return (
            (item.title?.toLowerCase().includes(searchLower) || false) ||
            (item.reflection?.toLowerCase().includes(searchLower) || false)
          );
          
        case "competencies":
        return (
            (item.competency_name?.toLowerCase().includes(searchLower) || false) ||
            (item.competency_category?.toLowerCase().includes(searchLower) || false) ||
            (item.level?.toLowerCase().includes(searchLower) || false)
          );
          
        case "profiles":
        return (
            (item.user_email?.toLowerCase().includes(searchLower) || false) ||
            (item.user_role?.toLowerCase().includes(searchLower) || false)
        );
          
      default:
          return false;
      }
    });
  };

  // Helper function to render verification status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Verified</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Reset filters to default
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("pending");
    setStudentFilter("all");
  };
  
  // Get paginated data
  const getPaginatedData = (type: string) => {
    const filteredData = getFilteredVerifications(type);
    const page = currentPage[type];
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };
  
  // Calculate total pages for pagination
  const getTotalPages = (type: string) => {
    const filteredData = getFilteredVerifications(type);
    return Math.ceil(filteredData.length / itemsPerPage);
  };
  
  // Handle page change
  const handlePageChange = (type: string, page: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [type]: page
    }));
  };
  
  // Render pagination controls
  const renderPagination = (type: string) => {
    const totalPages = getTotalPages(type);
    const currentPageNumber = currentPage[type];
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(type, Math.max(1, currentPageNumber - 1))}
          disabled={currentPageNumber === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPageNumber} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(type, Math.min(totalPages, currentPageNumber + 1))}
          disabled={currentPageNumber === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Verifications Management</h1>
          <p className="text-muted-foreground">
            Review and process verification requests across the platform
          </p>
      </div>
      </div>
      
      {/* Status filter tabs */}
      <div className="mb-6">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
                  </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search verifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
        <div className="w-full sm:w-60">
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All students</SelectItem>
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
                
      {/* Dashboard cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Qualifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.qualifications}</div>
            <p className="text-xs text-muted-foreground">pending verifications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.sessions}</div>
            <p className="text-xs text-muted-foreground">pending verifications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Competencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.competencies}</div>
            <p className="text-xs text-muted-foreground">pending verifications</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{counts.profiles}</div>
            <p className="text-xs text-muted-foreground">pending verifications</p>
          </CardContent>
        </Card>
                </div>
                
      {/* Main content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading verifications...</span>
              </div>
      ) : (
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="w-full max-w-2xl mx-auto mb-6">
            <TabsTrigger value="qualifications" className="flex-1">
              Qualifications
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex-1">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="competencies" className="flex-1">
              Competencies
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex-1">
              Profiles
            </TabsTrigger>
          </TabsList>

          {/* Qualifications Tab */}
          <TabsContent value="qualifications">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Date Obtained</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData("qualifications").length > 0 ? (
                      getPaginatedData("qualifications").map((qual) => (
                        <TableRow 
                          key={qual.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            window.location.href = `/admin/verifications/qualifications/${qual.id}`;
                          }}
                        >
                          <TableCell>{qual.student_name}</TableCell>
                          <TableCell className="font-medium">{qual.title}</TableCell>
                          <TableCell>{qual.issuing_organization}</TableCell>
                          <TableCell>{qual.date_obtained ? formatDate(qual.date_obtained) : "N/A"}</TableCell>
                          <TableCell>{renderStatusBadge(qual.verification_status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No qualifications found matching the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination("qualifications")}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Session Verifications</CardTitle>
                <CardDescription>
                  Confirm and approve completed student mentoring sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData("sessions").length > 0 ? (
                      getPaginatedData("sessions").map((s) => (
                        <TableRow 
                          key={s.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            window.location.href = `/admin/verifications/sessions/${s.id}`;
                          }}
                        >
                          <TableCell className="font-medium">{s.title}</TableCell>
                          <TableCell>{s.student_name}</TableCell>
                          <TableCell>{s.date ? formatDate(s.date) : "N/A"}</TableCell>
                          <TableCell>{renderStatusBadge(s.verification_status || "pending")}</TableCell>
                          <TableCell>{s.verified_by_name || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No session verifications found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination("sessions")}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competencies Tab */}
          <TabsContent value="competencies">
            <Card>
              <CardHeader>
                <CardTitle>Competency Verifications</CardTitle>
                <CardDescription>
                  Validate student competency level claims across different skill areas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competency</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData("competencies").length > 0 ? (
                      getPaginatedData("competencies").map((c) => (
                        <TableRow 
                          key={c.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            window.location.href = `/admin/verifications/competencies/${c.id}`;
                          }}
                        >
                          <TableCell className="font-medium">{c.competency_name}</TableCell>
                          <TableCell>{c.competency_category}</TableCell>
                          <TableCell className="capitalize">{c.level}</TableCell>
                          <TableCell>{c.student_name}</TableCell>
                          <TableCell>{renderStatusBadge(c.verification_status || "pending")}</TableCell>
                          <TableCell>{c.verified_by_name || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No competency verifications found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination("competencies")}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profiles Tab */}
          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <CardTitle>Profile Verifications</CardTitle>
                <CardDescription>
                  Verify student profiles and identity documentation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPaginatedData("profiles").length > 0 ? (
                      getPaginatedData("profiles").map((p) => (
                        <TableRow 
                          key={p.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            window.location.href = `/admin/verifications/profiles/${p.id}`;
                          }}
                        >
                          <TableCell className="font-medium">{p.user_name}</TableCell>
                          <TableCell>{p.user_email}</TableCell>
                          <TableCell className="capitalize">{p.user_role}</TableCell>
                          <TableCell>{renderStatusBadge(p.verification_status)}</TableCell>
                          <TableCell>{p.verified_by_name || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No profile verifications found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination("profiles")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
  );
} 