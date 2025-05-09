'use client';

import { enhancedJobData } from './enhanced-job-data';
import userProfiles from './user-profiles';

// Define types
export interface JobRequirement {
  id: number;
  text: string;
  essential: boolean;
  met: boolean;
}

export interface Job {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  posted: string;
  match: number;
  salary: string;
  applicationDeadline: string;
  startDate: string;
  description: string;
  aboutOrganization: string;
  responsibilities: string[];
  requirements: JobRequirement[];
  benefits: string[];
  applicationProcess: string;
  category: string;
  skills: string[];
}

export interface JobApplication {
  id: number;
  jobId: string;
  userId: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'interview' | 'offered' | 'rejected';
  dateApplied: string;
  coverLetter: string;
  additionalInfo?: string;
}

// In-memory storage for applications and saved jobs (will be replaced with API calls in production)
let applications: JobApplication[] = [];
let savedJobs: Record<string, number[]> = {};

/**
 * Create jobs with personalized match scores for each user
 */
async function createPersonalizedJobsForUser(userId: number, jobs: Job[]): Promise<Job[]> {
  const user = userProfiles.find(u => u.id === userId);
  
  if (!user) {
    return jobs;
  }
  
  const personalizedJobs = [];
  
  for (const job of jobs) {
    // Calculate match percentage based on user skills and job skills
    const matchPercentage = await calculateJobMatch(userId, job.skills);
    
    // Update requirement met flags based on user profile
    const updatedRequirements = job.requirements.map(req => {
      // This is a simplified matching logic - in a real app you'd have more sophisticated matching
      const keywords = req.text.toLowerCase().split(' ');
      const userSkillsLower = user.skills.map(s => s.toLowerCase());
      const userQualifications = user.qualifications.map(q => q.title.toLowerCase());
      
      // Check if any of the keywords match user skills or qualifications
      const hasMatchingSkill = keywords.some(keyword => 
        userSkillsLower.some(skill => skill.includes(keyword))
      );
      
      const hasMatchingQualification = keywords.some(keyword =>
        userQualifications.some(qual => qual.includes(keyword))
      );
      
      // For education jobs, check if they have appropriate degree
      const hasEducationDegree = user.degree?.toLowerCase().includes('education') || 
                               user.degree?.toLowerCase().includes('teaching');
      
      // Make sure met is always a boolean
      const isMet = !!(hasMatchingSkill || hasMatchingQualification || 
             (req.text.includes('degree') && hasEducationDegree));
      
      // Create updated requirement
      return {
        ...req,
        met: isMet
      };
    });
    
    // Create a personalized job with adjusted match percentage
    personalizedJobs.push({
      ...job,
      match: matchPercentage,
      requirements: updatedRequirements
    });
  }
  
  return personalizedJobs;
}

/**
 * Get all jobs with pagination support
 */
export async function getAllJobs(page = 1, limit = 10): Promise<{
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}> {
  try {
    const response = await fetch(`/api/jobs?page=${page}&limit=${limit}`);
    
    if (response.ok) {
      const data = await response.json();
      const dbJobs = data.jobs || [];
      const pagination = data.pagination || {
        total: dbJobs.length,
        page: 1,
        limit: dbJobs.length,
        pages: 1
      };
      
      // Transform DB jobs to match our UI format
      const transformedJobs = dbJobs.map((dbJob: any) => {
        // Parse requirements if it's a string
        let parsedRequirements: JobRequirement[] = [];
        if (dbJob.requirements) {
          try {
            // Try to parse the requirements if it's a JSON string
            const reqData = JSON.parse(dbJob.requirements);
            if (Array.isArray(reqData)) {
              parsedRequirements = reqData.map((req: any) => ({
                id: req.id || 1,
                text: req.text || 'Requirement',
                essential: req.essential || false,
                met: req.met === undefined ? false : req.met // Ensure met is always boolean
              }));
            } else {
              // If it's not an array, create a single requirement
              parsedRequirements = [{
                id: 1,
                text: dbJob.requirements,
                essential: true,
                met: false
              }];
            }
          } catch {
            // If parsing fails, create a basic requirement
            parsedRequirements = [
              { 
                id: 1, 
                text: dbJob.requirements, 
                essential: true, 
                met: false 
              }
            ];
          }
        } else {
          // Default requirement if none exists
          parsedRequirements = [
            { 
              id: 1, 
              text: 'Basic qualification', 
              essential: true, 
              met: false 
            }
          ];
        }
        
        // Process job skills array if it exists
        const jobSkills = Array.isArray(dbJob.skills) ? dbJob.skills : [];
        console.log(`Job ${dbJob.title} has ${jobSkills.length} skills from API:`, jobSkills);
        
        // Map database fields to UI fields with fallbacks for all properties
        return {
          id: typeof dbJob.id === 'string' ? dbJob.id : dbJob.id || Date.now().toString(),
          title: dbJob.title || '',
          organization: dbJob.company_name || dbJob.company || 'Education Organization',
          location: dbJob.location || 'Remote',
          type: dbJob.job_type || 'Full-time',
          posted: dbJob.created_at || dbJob.posted_at || new Date().toISOString().split('T')[0],
          match: dbJob.match || 0, // Use match from API if available, otherwise default to 0
          salary: dbJob.salary_range || '',
          applicationDeadline: dbJob.deadline || '',
          startDate: '', // Not in DB schema
          description: dbJob.description || '',
          aboutOrganization: `This organization is focused on providing quality education.`,
          responsibilities: ['Fulfill job duties as assigned'],
          requirements: parsedRequirements,
          benefits: ['Competitive salary'],
          applicationProcess: 'Apply with resume and cover letter',
          category: 'Education', // Default category
          skills: jobSkills // Use skills from API response
        } as Job;
      });
      
      return {
        jobs: transformedJobs,
        pagination
      };
    }
  } catch (error) {
    console.error('Error fetching jobs from API:', error);
  }
  
  // If API fails, return fallback data 
  console.log('Using fallback job data');
  return {
    jobs: enhancedJobData,
    pagination: {
      total: enhancedJobData.length,
      page: 1,
      limit: enhancedJobData.length,
      pages: 1
    }
  };
}

/**
 * Get personalized jobs for a specific user
 */
export async function getJobsForUser(userId: number, page = 1, limit = 10): Promise<{
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}> {
  try {
    // Get all jobs first
    const jobsData = await getAllJobs(page, limit);
    // Then personalize them for this user
    const personalizedJobs = await createPersonalizedJobsForUser(userId, jobsData.jobs);
    
    return {
      jobs: personalizedJobs,
      pagination: jobsData.pagination
    };
  } catch (error) {
    console.error('Error getting personalized jobs:', error);
    // Return fallback data
    return {
      jobs: enhancedJobData,
      pagination: {
        total: enhancedJobData.length,
        page: 1,
        limit: enhancedJobData.length,
        pages: 1
      }
    };
  }
}

/**
 * Get a specific job by ID
 */
export async function getJobById(id: number | string): Promise<Job | null> {
  try {
    // First try to get the job directly from the API
    const response = await fetch(`/api/jobs/${id}`);
    
    if (response.ok) {
      const dbJob = await response.json();
      
      // Parse and transform the job similar to getAllJobs
      // ... (transformation code would go here, similar to getAllJobs)
      
      // For simplicity, we'll just fetch all jobs and filter
      const jobs = await getAllJobs();
      return jobs.jobs.find((job: Job) => String(job.id) === String(id)) || null;
    }
  } catch (error) {
    console.error(`Error fetching job #${id}:`, error);
  }
  
  // Fallback to getting all jobs and filtering
  try {
    const jobs = await getAllJobs();
    return jobs.jobs.find((job: Job) => String(job.id) === String(id)) || null;
  } catch (error) {
    console.error(`Error finding job #${id} in all jobs:`, error);
    
    // Ultimate fallback - search in enhanced data
    return enhancedJobData.find(job => String(job.id) === String(id)) || null;
  }
}

/**
 * Update a job's match percentage for a specific user
 * based on their profile and skills
 */
export async function updateJobMatch(jobId: number, userId: number, matchPercentage: number): Promise<Job | null> {
  try {
    const job = await getJobById(jobId);
    if (!job) return null;
    
    const updatedJob = { ...job, match: matchPercentage };
    
    // In a real app, you would update this on the server
    // For now, we just return the updated job
    
    return updatedJob;
  } catch (error) {
    console.error(`Error updating job match for job #${jobId}:`, error);
    return null;
  }
}

/**
 * Get all jobs saved by a user
 */
export async function getSavedJobs(userId: number | string): Promise<number[]> {
  try {
    // Convert userId to string for consistency
    const userIdStr = String(userId);
    
    // First try to get from API
    try {
      const response = await fetch(`/api/student/${userIdStr}/saved-jobs`);
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.savedJobs)) {
          return data.savedJobs;
        }
      }
    } catch (apiError) {
      console.error('Error fetching saved jobs from API:', apiError);
    }
    
    // Return from in-memory storage if API fails
    return savedJobs[userIdStr] || [];
  } catch (error) {
    console.error(`Error getting saved jobs for user ${userId}:`, error);
    return [];
  }
}

/**
 * Check if a job is saved by a user
 */
export async function isJobSaved(userId: number | string, jobId: number | string): Promise<boolean> {
  try {
    const saved = await getSavedJobs(userId);
    // Use string comparison for compatibility
    return saved.some(id => String(id) === String(jobId));
  } catch (error) {
    console.error(`Error checking if job ${jobId} is saved by user ${userId}:`, error);
    return false;
  }
}

/**
 * Toggle a job's saved status
 */
export async function toggleSaveJob(userId: number | string, jobId: number | string): Promise<boolean> {
  try {
    // Convert userId to string for consistency
    const userIdStr = String(userId);
    
    if (!savedJobs[userIdStr]) {
      savedJobs[userIdStr] = [];
    }
    
    // Convert strings to consistent format for comparison
    const jobIdNum = typeof jobId === 'string' ? parseInt(jobId) : jobId;
    
    // Check if the job is already saved
    const isAlreadySaved = savedJobs[userIdStr].includes(jobIdNum);
    
    if (isAlreadySaved) {
      // Remove the job from saved list
      savedJobs[userIdStr] = savedJobs[userIdStr].filter(id => id !== jobIdNum);
    } else {
      // Add the job to saved list
      savedJobs[userIdStr].push(jobIdNum);
    }
    
    // Return the new saved status
    return !isAlreadySaved;
  } catch (error) {
    console.error(`Error toggling saved status for job ${jobId} and user ${userId}:`, error);
    return false;
  }
}

/**
 * Get all applications for all users
 */
export async function getAllApplications(): Promise<JobApplication[]> {
  try {
    const response = await fetch('/api/student/applications');
    
    if (response.ok) {
      const data = await response.json();
      return data.applications || [];
    }
  } catch (error) {
    console.error('Error fetching all applications:', error);
  }
  
  // If API fails, return empty array
  return [];
}

/**
 * Get applications for a specific user
 */
export async function getUserApplications(userId: number | string): Promise<JobApplication[]> {
  try {
    const response = await fetch(`/api/student/applications?studentId=${userId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.applications || [];
    }
  } catch (error) {
    console.error('Error fetching user applications:', error);
  }
  
  // If API fails, return empty array
  return [];
}

/**
 * Check if a user has already applied to a job
 */
export async function hasApplied(userId: number | string, jobId: number | string): Promise<boolean> {
  try {
    const userApps = await getUserApplications(userId);
    // Use string comparison for compatibility with different ID types
    return userApps.some(app => String(app.jobId) === String(jobId));
  } catch (error) {
    console.error(`Error checking if user ${userId} has applied to job ${jobId}:`, error);
    return false;
  }
}

/**
 * Submit a job application
 */
export async function addJobApplication(application: Omit<JobApplication, 'id'>): Promise<JobApplication | null> {
  try {
    const response = await fetch('/api/student/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: application.userId,
        jobId: application.jobId,
        coverLetter: application.coverLetter,
        additionalInfo: application.additionalInfo
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.application || null;
    }
  } catch (error) {
    console.error('Error submitting job application:', error);
  }
  
  return null;
}

/**
 * Update a job application
 */
export async function updateApplication(id: number, data: Partial<JobApplication>): Promise<JobApplication | null> {
  try {
    const response = await fetch('/api/student/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: id,
        status: data.status,
        coverLetter: data.coverLetter,
        additionalInfo: data.additionalInfo
      })
    });
    
    if (response.ok) {
      const responseData = await response.json();
      return responseData.application || null;
    }
  } catch (error) {
    console.error('Error updating job application:', error);
  }
  
  return null;
}

/**
 * Delete an application
 */
export function deleteApplication(id: number): boolean {
  const initialLength = applications.length;
  applications = applications.filter(app => app.id !== id);
  
  return applications.length < initialLength;
}

/**
 * Add a new job
 */
export async function addJob(job: Omit<Job, 'id'>): Promise<Job> {
  try {
    // Try to add the job via API
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.job;
      }
    } catch (apiError) {
      console.error('Error adding job via API:', apiError);
    }
    
    // If the API fails, create a new job locally with date-based ID
    const newJob: Job = {
      ...job,
      id: Date.now().toString(), // Convert to string for consistency
      match: 0
    };
    
    // Return the newly created job
    return newJob;
  } catch (error) {
    console.error('Error adding job:', error);
    
    // Return a basic job as fallback
    return {
      id: Date.now().toString(), // Convert to string for consistency
      title: job.title || 'New Job',
      organization: job.organization || 'Education Organization',
      location: job.location || 'Remote',
      type: job.type || 'Full-time',
      posted: new Date().toISOString().split('T')[0],
      match: 0,
      salary: job.salary || '',
      applicationDeadline: job.applicationDeadline || '',
      startDate: job.startDate || '',
      description: job.description || '',
      aboutOrganization: job.aboutOrganization || '',
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      applicationProcess: job.applicationProcess || '',
      category: job.category || 'Education',
      skills: job.skills || []
    };
  }
}

/**
 * Update an existing job
 */
export async function updateJob(id: number | string, data: Partial<Job>): Promise<Job | null> {
  try {
    const dbJob = {
      id: String(id),
      title: data.title,
      description: data.description,
      requirements: data.requirements ? JSON.stringify(data.requirements) : undefined,
      salary_range: data.salary,
      location: data.location,
      deadline: data.applicationDeadline,
      job_type: data.type
    };
    
    const response = await fetch('/api/jobs', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dbJob)
    });
    
    if (response.ok) {
      // For simplicity, we'll refetch the job
      return getJobById(id);
    }
    
    throw new Error('Failed to update job');
  } catch (error) {
    console.error(`Error updating job #${id}:`, error);
    
    // Try to get the current job and manually update it
    const currentJob = await getJobById(id);
    if (currentJob) {
      return { ...currentJob, ...data };
    }
    
    return null;
  }
}

/**
 * Delete a job
 */
export async function deleteJob(id: number | string): Promise<boolean> {
  try {
    const response = await fetch(`/api/jobs?id=${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      return true;
    }
    
    throw new Error('Failed to delete job');
  } catch (error) {
    console.error(`Error deleting job #${id}:`, error);
    return false;
  }
}

// Improved job match calculation using user skills from database
export async function calculateJobMatch(userId: number | string, jobSkills: string[]): Promise<number> {
  try {
    // Fetch user skills from the API
    const response = await fetch(`/api/user/skills?userId=${userId}`);
    
    if (response.ok) {
      const data = await response.json();
      const userSkills = data.skills || [];
      
      if (userSkills.length === 0 || jobSkills.length === 0) {
        return 0;
      }
      
      // Extract skill names
      const userSkillNames = userSkills.map((s: any) => s.skill.toLowerCase());
      const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
      
      // Count matching skills
      const matchingSkills = jobSkillsLower.filter(jobSkill => 
        userSkillNames.some((userSkill: string) => 
          userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
        )
      );
      
      // Calculate percentage
      return Math.round((matchingSkills.length / jobSkills.length) * 100);
    }
    
    // Fallback to simple calculation if API fails
    return 0;
  } catch (error) {
    console.error('Error calculating job match:', error);
    return 0;
  }
} 