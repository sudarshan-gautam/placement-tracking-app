'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
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
  Send 
} from 'lucide-react';
import Link from 'next/link';

// Sample job data - in a real app, this would come from an API
const jobsData = [
  {
    id: 1,
    title: 'Primary School Teacher',
    organization: 'London City School',
    location: 'London, UK',
    type: 'Full-time',
    posted: '2023-07-10',
    match: 85,
    salary: '£28,000 - £35,000',
    applicationDeadline: '2023-08-15',
    startDate: 'September 2023',
    description: 'Experienced primary school teacher needed for Year 3 class. Responsibilities include curriculum planning, assessment, and creating an engaging learning environment.',
    aboutOrganization: 'London City School is a vibrant primary school committed to providing a nurturing and stimulating environment where children can thrive academically and personally.',
    responsibilities: [
      'Plan and deliver engaging lessons aligned with the national curriculum',
      'Assess and monitor student progress and provide regular feedback',
      'Create a positive and inclusive classroom environment',
      'Collaborate with colleagues and participate in staff development',
      'Communicate effectively with parents and guardians',
    ],
    requirements: [
      { id: 1, text: 'Bachelor\'s degree in Education', essential: true, met: true },
      { id: 2, text: 'Qualified Teacher Status (QTS)', essential: true, met: true },
      { id: 3, text: 'Minimum 2 years teaching experience', essential: true, met: false },
      { id: 4, text: 'Strong classroom management skills', essential: true, met: true },
      { id: 5, text: 'Experience with assessment for learning', essential: false, met: true },
      { id: 6, text: 'Ability to differentiate instruction', essential: false, met: true },
    ],
    benefits: [
      'Competitive salary package',
      'Continuous professional development opportunities',
      'Supportive work environment',
      'Pension scheme',
      'School holidays',
    ],
    applicationProcess: 'Submit your CV and a cover letter explaining your interest and suitability for the role. Shortlisted candidates will be invited for an interview and a teaching demonstration.',
  },
  {
    id: 2,
    title: 'Secondary Science Teacher',
    organization: 'Oakridge Academy',
    location: 'Manchester, UK',
    type: 'Full-time',
    posted: '2023-07-05',
    match: 72,
    salary: '£30,000 - £42,000',
    applicationDeadline: '2023-08-10',
    startDate: 'September 2023',
    description: 'Passionate Science teacher needed to teach Biology, Chemistry, and Physics at KS3 and KS4 levels. The ideal candidate will inspire students to develop a love for scientific inquiry.',
    aboutOrganization: 'Oakridge Academy is a high-performing secondary school with excellent facilities for science education, including well-equipped laboratories and a strong STEM focus.',
    responsibilities: [
      'Teach Biology, Chemistry, and Physics at KS3 and KS4 levels',
      'Prepare students for GCSE examinations',
      'Develop and implement engaging practical experiments',
      'Monitor and evaluate student progress',
      'Contribute to the development of the science curriculum',
    ],
    requirements: [
      { id: 1, text: 'Bachelor\'s degree in a Science subject', essential: true, met: true },
      { id: 2, text: 'Qualified Teacher Status (QTS)', essential: true, met: true },
      { id: 3, text: 'Experience teaching all three sciences at KS3 and KS4', essential: true, met: false },
      { id: 4, text: 'Strong practical teaching skills', essential: true, met: true },
      { id: 5, text: 'Experience with GCSE exam preparation', essential: false, met: false },
    ],
    benefits: [
      'Competitive salary based on experience',
      'Extensive professional development opportunities',
      'Modern teaching facilities',
      'Supportive department team',
      'Teachers\' pension scheme',
    ],
    applicationProcess: 'Apply with your CV, cover letter, and the contact details of two professional references. Shortlisted candidates will be invited for an interview, which will include a teaching demonstration.',
  },
];

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    availability: '',
    additionalInfo: '',
  });

  useEffect(() => {
    // In a real app, this would be an API call
    const jobId = parseInt(params.id);
    const foundJob = jobsData.find(j => j.id === jobId);
    
    if (foundJob) {
      setJob(foundJob);
    }
    setLoading(false);
  }, [params.id]);

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    // In a real app, this would call an API to save/unsave the job
  };

  const handleApplyClick = () => {
    setShowApplicationForm(true);
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
    // In a real app, this would submit the application to an API
    alert('Your application has been submitted!');
    setShowApplicationForm(false);
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
  const metRequirements = job.requirements.filter((req: any) => req.met).length;
  const totalRequirements = job.requirements.length;
  const metEssentialRequirements = job.requirements.filter((req: any) => req.essential && req.met).length;
  const totalEssentialRequirements = job.requirements.filter((req: any) => req.essential).length;
  
  const matchPercentage = Math.round((metRequirements / totalRequirements) * 100);
  const essentialMatchPercentage = Math.round((metEssentialRequirements / totalEssentialRequirements) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-40">
      {/* Back button */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/jobs" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
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
                  <Calendar className="h-4 w-4 mr-1" />
                  Posted: {new Date(job.posted).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveJob}
                className={`p-2 rounded-full ${
                  isSaved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-blue-100 hover:text-blue-600`}
              >
                <Bookmark className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {job.match}% Match
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Salary: {job.salary}
            </div>
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
            </div>
          </div>
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
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">About {job.organization}</h3>
              <p className="text-gray-700 mb-6">{job.aboutOrganization}</p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Key Responsibilities</h3>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                {job.responsibilities.map((responsibility: string, index: number) => (
                  <li key={index} className="text-gray-700">{responsibility}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Benefits</h3>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                {job.benefits.map((benefit: string, index: number) => (
                  <li key={index} className="text-gray-700">{benefit}</li>
                ))}
              </ul>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Application Process</h3>
              <p className="text-gray-700">{job.applicationProcess}</p>
            </CardContent>
          </Card>
          
          {/* Application Form */}
          {showApplicationForm && (
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitApplication}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Letter
                      </label>
                      <textarea
                        name="coverLetter"
                        value={applicationData.coverLetter}
                        onChange={handleApplicationChange}
                        rows={6}
                        className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Explain why you're interested in this position and how your skills and experience make you a good fit."
                        required
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <input
                        type="text"
                        name="availability"
                        value={applicationData.availability}
                        onChange={handleApplicationChange}
                        className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="When can you start? Any constraints on your availability?"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Information
                      </label>
                      <textarea
                        name="additionalInfo"
                        value={applicationData.additionalInfo}
                        onChange={handleApplicationChange}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Any other information you'd like to share with the employer?"
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowApplicationForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Submit Application
                      </button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column - Requirements and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirements Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Overall Match</span>
                  <span className="text-sm font-medium text-gray-700">{matchPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      matchPercentage >= 80 ? 'bg-green-500' : 
                      matchPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${matchPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Essential Requirements</span>
                  <span className="text-sm font-medium text-gray-700">{essentialMatchPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      essentialMatchPercentage >= 80 ? 'bg-green-500' : 
                      essentialMatchPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${essentialMatchPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-3">
                  {job.requirements.map((req: any) => (
                    <li key={req.id} className="flex items-start">
                      {req.met ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${req.essential ? 'font-medium' : ''}`}>
                        {req.text}
                        {req.essential && (
                          <span className="ml-1 text-xs font-medium text-red-600">(Essential)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {!showApplicationForm && (
                  <button
                    onClick={handleApplyClick}
                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </button>
                )}
                
                <button
                  onClick={handleSaveJob}
                  className={`w-full flex justify-center items-center px-4 py-2 ${
                    isSaved 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-white border border-gray-300 text-gray-700'
                  } rounded-md hover:bg-blue-50`}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Key Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Application Deadline</p>
                        <p className="text-sm">{new Date(job.applicationDeadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm">{job.startDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 