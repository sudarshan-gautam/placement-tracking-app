'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Calendar, 
  Building, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Send,
  BookmarkCheck
} from 'lucide-react';
import Link from 'next/link';
import { 
  getJobById, 
  isJobSaved, 
  toggleSaveJob, 
  hasApplied,
  addJobApplication,
  getUserApplications,
  Job,
  JobApplication
} from '@/lib/jobs-service';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showApplicationForm = searchParams?.get('apply') === 'true';
  const viewApplication = searchParams?.get('application') === 'view';
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasUserApplied, setHasUserApplied] = useState(false);
  const [userApplication, setUserApplication] = useState<JobApplication | null>(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    availability: '',
    additionalInfo: '',
  });
  
  // Create a mock user for demo purposes if none exists
  const mockUser = user || { id: 1, role: 'student', name: 'Student User' };
  
  const isAdmin = mockUser?.role === 'admin';
  const isMentor = mockUser?.role === 'mentor';
  const isStudent = mockUser?.role === 'student';

  useEffect(() => {
    // Load job details and user-specific data
    const jobId = parseInt(params.id);
    const foundJob = getJobById(jobId);
    
    if (foundJob) {
      setJob(foundJob);
      
      // Check if job is saved by the user
      if (mockUser?.id) {
        const jobSaved = isJobSaved(mockUser.id, jobId);
        setIsSaved(jobSaved);
        
        // Check if user has already applied
        const applied = hasApplied(mockUser.id, jobId);
        setHasUserApplied(applied);
        
        // If user has applied, get their application
        if (applied) {
          const applications = getUserApplications(mockUser.id);
          const userApp = applications.find(app => app.jobId === jobId);
          if (userApp) {
            setUserApplication(userApp);
            // Pre-fill form with existing application data
            setApplicationData({
              coverLetter: userApp.coverLetter,
              availability: userApp.additionalInfo?.split('\n')[0] || '',
              additionalInfo: userApp.additionalInfo?.split('\n').slice(1).join('\n') || '',
            });
          }
        }
      }
    }
    setLoading(false);
  }, [params.id, mockUser?.id]);

  const handleSaveJob = () => {
    if (job && mockUser?.id) {
      const isNowSaved = toggleSaveJob(mockUser.id, job.id);
      setIsSaved(isNowSaved);
    }
  };

  const handleApplicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData({
      ...applicationData,
      [name]: value,
    });
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !mockUser?.id) return;
    
    // Format additional info to include availability
    const formattedAdditionalInfo = `${applicationData.availability}\n${applicationData.additionalInfo}`;
    
    // Create new application
    const newApplication = {
      jobId: job.id,
      userId: mockUser.id,
      status: 'submitted' as const,
      dateApplied: new Date().toISOString().split('T')[0],
      coverLetter: applicationData.coverLetter,
      additionalInfo: formattedAdditionalInfo
    };
    
    // Add application to storage
    const savedApplication = addJobApplication(newApplication);
    
    if (savedApplication) {
      setHasUserApplied(true);
      setUserApplication(savedApplication);
      alert('Your application has been submitted!');
      // Redirect to the job page with a view parameter
      router.push(`/jobs/${job.id}?application=view`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/jobs" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Calculate match indicators
  const metRequirements = job.requirements.filter((req) => req.met).length;
  const totalRequirements = job.requirements.length;
  const metEssentialRequirements = job.requirements.filter((req) => req.essential && req.met).length;
  const totalEssentialRequirements = job.requirements.filter((req) => req.essential).length;
  
  const matchPercentage = Math.round((metRequirements / totalRequirements) * 100);
  const essentialMatchPercentage = Math.round((metEssentialRequirements / totalEssentialRequirements) * 100);

  // Application view conditionally shows application form or details
  const renderApplicationSection = () => {
    if (hasUserApplied && userApplication) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Your Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-500">Status</div>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {userApplication.status.charAt(0).toUpperCase() + userApplication.status.slice(1)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Date Applied</div>
                <div className="text-sm">{new Date(userApplication.dateApplied).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Cover Letter</h3>
              <div className="p-4 bg-gray-50 rounded-md whitespace-pre-line">
                {userApplication.coverLetter}
              </div>
            </div>
            
            {userApplication.additionalInfo && (
              <div>
                <h3 className="text-md font-medium mb-2">Additional Information</h3>
                <div className="p-4 bg-gray-50 rounded-md whitespace-pre-line">
                  {userApplication.additionalInfo}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    } else if (showApplicationForm) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Apply for this Position</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitApplication}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter
                </label>
                <textarea
                  name="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={handleApplicationChange}
                  rows={8}
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Introduce yourself and explain why you're interested in this position and how your skills and experience make you a strong candidate."
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <input
                  type="text"
                  name="availability"
                  value={applicationData.availability}
                  onChange={handleApplicationChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="When could you start? Any specific availability constraints?"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={applicationData.additionalInfo}
                  onChange={handleApplicationChange}
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Any other information you'd like to share with the employer?"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Back button */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/jobs" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </div>

      {/* Application section - conditionally displayed */}
      <div className="max-w-4xl mx-auto">
        {renderApplicationSection()}
      </div>

      {/* Job Header */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {job.organization}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {job.type}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Posted: {new Date(job.posted).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Match Percentage */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-medium ${
              job.match >= 80 ? 'bg-green-500' : 
              job.match >= 60 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}>
              {job.match}%
              <span className="text-xs ml-0.5">match</span>
            </div>
          </div>
          
          {/* Student-specific actions */}
          {isStudent && (
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleSaveJob}
                className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                  isSaved ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save Job
                  </>
                )}
              </button>
              
              {!hasUserApplied ? (
                <Link
                  href={`/jobs/${job.id}?apply=true`}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply Now
                </Link>
              ) : (
                <Link
                  href={`/jobs/${job.id}?application=view`}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  View Application
                </Link>
              )}
              
              <button
                className="flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{job.description}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
                <ul className="space-y-3">
                  {job.requirements.map((requirement) => (
                    <li key={requirement.id} className="flex items-start">
                      {requirement.met ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <span className={requirement.essential ? 'font-medium' : ''}>
                          {requirement.text}
                        </span>
                        {requirement.essential && (
                          <span className="ml-2 text-xs font-medium text-red-500">Essential</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About the Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{job.aboutOrganization}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{job.applicationProcess}</p>
              
              {isStudent && !hasUserApplied && (
                <Link
                  href={`/jobs/${job.id}?apply=true`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply Now
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Job Info & Match */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Application Deadline</p>
                    <p className="font-medium">{new Date(job.applicationDeadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{job.startDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium">{job.type}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium">{job.salary}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isStudent && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Overall Match</span>
                    <span className="text-sm font-medium">{job.match}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        job.match >= 80 ? 'bg-green-500' : 
                        job.match >= 60 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${job.match}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Requirements Match</span>
                    <span className="text-sm font-medium">{matchPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        matchPercentage >= 80 ? 'bg-green-500' : 
                        matchPercentage >= 60 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${matchPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Essential Requirements</span>
                    <span className="text-sm font-medium">{essentialMatchPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        essentialMatchPercentage >= 80 ? 'bg-green-500' : 
                        essentialMatchPercentage >= 60 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${essentialMatchPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Skills Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Link to detailed match analysis */}
                <div className="mt-6">
                  <Link 
                    href={`/profile/job-match/${job.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    View Detailed Match Analysis
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Mentor-specific panel */}
          {isMentor && (
            <Card>
              <CardHeader>
                <CardTitle>Mentor Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                  >
                    Recommend to Students
                  </button>
                  <button
                    className="w-full flex items-center justify-center px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 text-sm font-medium"
                  >
                    Create Related Activity
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 