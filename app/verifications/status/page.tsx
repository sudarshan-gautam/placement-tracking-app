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
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Type definitions for verification items
type Verification = {
  id: string;
  verification_type?: string;
  verification_status: string;
  feedback?: string;
  verified_by_name?: string;
  title?: string;
  date_obtained?: string;
  date?: string;
  date_completed?: string;
  competency_name?: string;
  level?: string;
};

export default function StudentVerificationsStatusPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<{
    qualifications: Verification[];
    sessions: Verification[];
    activities: Verification[];
    competencies: Verification[];
    profile: Verification | null;
  }>({
    qualifications: [],
    sessions: [],
    activities: [],
    competencies: [],
    profile: null
  });

  // Fetch student's verifications data
  useEffect(() => {
    const fetchVerifications = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Prepare auth header
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
        
        // Build query string with status filter if not "all"
        const getQueryParams = () => {
          if (statusFilter !== 'all') {
            return `?status=${statusFilter}`;
          }
          return '';
        };
        
        // Fetch qualifications
        const qualificationsResponse = await fetch(`/api/verifications?type=qualifications${getQueryParams()}`, { headers });
        if (!qualificationsResponse.ok) {
          throw new Error(`Failed to fetch qualifications: ${qualificationsResponse.status} ${qualificationsResponse.statusText}`);
        }
        const qualificationsData = await qualificationsResponse.json();
        
        // Fetch sessions
        const sessionsResponse = await fetch(`/api/verifications?type=sessions${getQueryParams()}`, { headers });
        if (!sessionsResponse.ok) {
          throw new Error(`Failed to fetch sessions: ${sessionsResponse.status} ${sessionsResponse.statusText}`);
        }
        const sessionsData = await sessionsResponse.json();
        
        // Fetch activities
        const activitiesResponse = await fetch(`/api/verifications?type=activities${getQueryParams()}`, { headers });
        if (!activitiesResponse.ok) {
          throw new Error(`Failed to fetch activities: ${activitiesResponse.status} ${activitiesResponse.statusText}`);
        }
        const activitiesData = await activitiesResponse.json();
        
        // Fetch competencies
        const competenciesResponse = await fetch(`/api/verifications?type=competencies${getQueryParams()}`, { headers });
        if (!competenciesResponse.ok) {
          throw new Error(`Failed to fetch competencies: ${competenciesResponse.status} ${competenciesResponse.statusText}`);
        }
        const competenciesData = await competenciesResponse.json();
        
        // Fetch profile verification
        const profileResponse = await fetch(`/api/verifications?type=profiles${getQueryParams()}`, { headers });
        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.status} ${profileResponse.statusText}`);
        }
        const profileData = await profileResponse.json();
        
        setVerifications({
          qualifications: qualificationsData?.qualifications || [],
          sessions: sessionsData?.sessions || [],
          activities: activitiesData?.activities || [],
          competencies: competenciesData?.competencies || [],
          profile: profileData?.profiles && profileData.profiles.length > 0 ? profileData.profiles[0] : null
        });
      } catch (error) {
        console.error("Error fetching verifications:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch verifications");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVerifications();
  }, [user, statusFilter]);

  // Filter verifications based on search term
  const getFilteredVerifications = (type: 'qualifications' | 'sessions' | 'activities' | 'competencies') => {
    if (!searchTerm) return verifications[type];
    
    const searchLower = searchTerm.toLowerCase();
    
    return verifications[type].filter(item => {
      // Common search on status and feedback
      if (
        (item.verification_status?.toLowerCase().includes(searchLower)) ||
        (item.feedback?.toLowerCase().includes(searchLower))
      ) {
        return true;
      }
      
      // Type-specific fields
      switch (type) {
        case "qualifications":
          return Boolean(item.title?.toLowerCase().includes(searchLower));
        
        case "sessions":
          return Boolean(item.title?.toLowerCase().includes(searchLower));
        
        case "activities":
          return Boolean(item.title?.toLowerCase().includes(searchLower));
        
        case "competencies":
          return Boolean(item.competency_name?.toLowerCase().includes(searchLower));
        
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Verification Status</h1>
          <p className="text-muted-foreground">
            Track the status of your qualification, activity, session, and competency verifications
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

      {/* Search bar */}
      <div className="mb-6">
        <Input
          placeholder="Search verifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Display error message if there's an error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading verification status...</span>
        </div>
      ) : (
        <Tabs defaultValue="qualifications">
          <TabsList className="mb-6">
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Qualifications Tab */}
          <TabsContent value="qualifications">
            <Card>
              <CardHeader>
                <CardTitle>Qualification Verifications</CardTitle>
                <CardDescription>
                  Status of your qualification verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date Obtained</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredVerifications("qualifications").length > 0 ? (
                      getFilteredVerifications("qualifications").map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="font-medium">{q.title}</TableCell>
                          <TableCell>{q.date_obtained ? formatDate(q.date_obtained) : "N/A"}</TableCell>
                          <TableCell>{renderStatusBadge(q.verification_status)}</TableCell>
                          <TableCell>{q.verified_by_name || "—"}</TableCell>
                          <TableCell>{q.feedback || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No qualification verifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Session Verifications</CardTitle>
                <CardDescription>
                  Status of your teaching session verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredVerifications("sessions").length > 0 ? (
                      getFilteredVerifications("sessions").map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.title}</TableCell>
                          <TableCell>{s.date ? formatDate(s.date) : "N/A"}</TableCell>
                          <TableCell>{renderStatusBadge(s.verification_status)}</TableCell>
                          <TableCell>{s.verified_by_name || "—"}</TableCell>
                          <TableCell>{s.feedback || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No session verifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Activity Verifications</CardTitle>
                <CardDescription>
                  Status of your activity verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date Completed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredVerifications("activities").length > 0 ? (
                      getFilteredVerifications("activities").map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell>{a.date_completed ? formatDate(a.date_completed) : "N/A"}</TableCell>
                          <TableCell>{renderStatusBadge(a.verification_status)}</TableCell>
                          <TableCell>{a.verified_by_name || "—"}</TableCell>
                          <TableCell>{a.feedback || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No activity verifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competencies Tab */}
          <TabsContent value="competencies">
            <Card>
              <CardHeader>
                <CardTitle>Competency Verifications</CardTitle>
                <CardDescription>
                  Status of your competency verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competency</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredVerifications("competencies").length > 0 ? (
                      getFilteredVerifications("competencies").map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.competency_name}</TableCell>
                          <TableCell className="capitalize">{c.level}</TableCell>
                          <TableCell>{renderStatusBadge(c.verification_status)}</TableCell>
                          <TableCell>{c.verified_by_name || "—"}</TableCell>
                          <TableCell>{c.feedback || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No competency verifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Verification Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Verification</CardTitle>
                <CardDescription>
                  Status of your profile verification request
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verifications.profile ? (
                  <div className="grid gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {renderStatusBadge(verifications.profile.verification_status)}
                    </div>
                    {verifications.profile.verified_by_name && (
                      <div>
                        <span className="font-medium">Verified By:</span> {verifications.profile.verified_by_name}
                      </div>
                    )}
                    {verifications.profile.feedback && (
                      <div>
                        <span className="font-medium">Feedback:</span>
                        <p className="mt-1 text-gray-700">{verifications.profile.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center py-4">No profile verification request found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 