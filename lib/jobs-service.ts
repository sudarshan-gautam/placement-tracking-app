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
  id: number;
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
  jobId: number;
  userId: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'interview' | 'offered' | 'rejected';
  dateApplied: string;
  coverLetter: string;
  additionalInfo?: string;
}

// Storage keys for localStorage
const JOBS_STORAGE_KEY = 'jobs-data';
const APPLICATIONS_STORAGE_KEY = 'job-applications-data';
const SAVED_JOBS_STORAGE_KEY = 'saved-jobs-data';
const USER_PROFILES_KEY = 'user-profiles-data';

/**
 * Create jobs with personalized match scores for each user
 */
function createPersonalizedJobsForUser(userId: number): Job[] {
  const user = userProfiles.find(u => u.id === userId);
  
  if (!user) {
    return enhancedJobData;
  }
  
  return enhancedJobData.map(job => {
    // Calculate match percentage based on user skills and job skills
    const matchPercentage = calculateJobMatch(user.skills, job.skills);
    
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
      
      // Create updated requirement
      return {
        ...req,
        met: hasMatchingSkill || hasMatchingQualification || 
             (req.text.includes('degree') && hasEducationDegree)
      };
    });
    
    // Calculate location match - prefer user's preferred locations
    const locationMatch = user.preferredLocations?.includes(job.location) ? 1 : 0;
    
    // Calculate job type match
    const jobTypeMatch = user.preferredJobTypes?.includes(job.type) ? 1 : 0;
    
    // Create a personalized job with adjusted match percentage
    return {
      ...job,
      match: matchPercentage,
      requirements: updatedRequirements
    };
  });
}

/**
 * Initialize the user profiles in localStorage 
 */
export function initUserProfiles(): void {
  // Only run on client
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(userProfiles));
  console.log('User profiles initialized:', userProfiles.length, 'profiles');
}

/**
 * Check if jobs data is initialized
 */
export function isJobsInitialized(): boolean {
  // Only run on client
  if (typeof window === 'undefined') return false;

  return localStorage.getItem(JOBS_STORAGE_KEY) !== null;
}

/**
 * Initialize the jobs database
 */
export function initJobsData(): void {
  // Only run on client
  if (typeof window === 'undefined') return;

  // Initialize user profiles if not already done
  if (!localStorage.getItem(USER_PROFILES_KEY)) {
    initUserProfiles();
  }

  // For demo purposes, use default user ID 1 for initial job data
  const defaultUserId = 1;
  const personalizedJobs = createPersonalizedJobsForUser(defaultUserId);
  
  // Initialize jobs with personalized data
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(personalizedJobs));
  console.log('Jobs database initialized with', personalizedJobs.length, 'personalized jobs');
  
  // Initialize applications if not exists
  if (!localStorage.getItem(APPLICATIONS_STORAGE_KEY)) {
    // Create some sample applications
    const sampleApplications = [
      {
        id: 1,
        jobId: 1,
        userId: 1,
        status: 'submitted',
        dateApplied: '2023-07-20',
        coverLetter: 'I am writing to apply for the Primary School Teacher position at London City School. With my Bachelor\'s degree in Education and classroom experience gained during placements, I believe I would be a valuable addition to your team...',
        additionalInfo: 'Available to start immediately\nI have additional experience in after-school programs and literacy intervention.'
      },
      {
        id: 2,
        jobId: 9,
        userId: 1,
        status: 'interview',
        dateApplied: '2023-07-15',
        coverLetter: 'I am excited to apply for the Teaching Assistant position at Greenfield Primary School. My experience working with children in both classroom and community settings has prepared me well for this role...',
        additionalInfo: 'Available from September 1st\nI have completed additional training in supporting children with special educational needs.'
      },
      {
        id: 3,
        jobId: 5,
        userId: 2,
        status: 'submitted',
        dateApplied: '2023-07-18',
        coverLetter: 'I am applying for the Secondary Science Teacher position at Oakridge Academy. With my background in Physics and current PGCE training, I am confident in my ability to inspire students in science education...',
        additionalInfo: 'Available to start in September\nParticularly interested in developing practical science curriculum.'
      }
    ] as JobApplication[];
    
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(sampleApplications));
    console.log('Job applications database initialized with sample data');
  }
  
  // Initialize saved jobs if not exists
  if (!localStorage.getItem(SAVED_JOBS_STORAGE_KEY)) {
    // Create some sample saved jobs
    const sampleSavedJobs = {
      1: [2, 3, 10], // User 1 saved jobs 2, 3, and 10
      2: [5, 6],     // User 2 saved jobs 5 and 6
      3: [2, 18]     // User 3 saved jobs 2 and 18
    };
    
    localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(sampleSavedJobs));
    console.log('Saved jobs database initialized with sample data');
  }
}

/**
 * Get all jobs
 */
export function getAllJobs(): Job[] {
  // Only run on client
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(JOBS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving jobs data:', error);
    return [];
  }
}

/**
 * Get personalized jobs for a specific user
 */
export function getJobsForUser(userId: number): Job[] {
  // Only run on client
  if (typeof window === 'undefined') return [];
  
  // Check if we already have jobs in storage
  const storedJobs = getAllJobs();
  
  // Create personalized jobs for this user
  const personalizedJobs = createPersonalizedJobsForUser(userId);
  
  // Store the personalized jobs (so they persist between page refreshes)
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(personalizedJobs));
  
  return personalizedJobs;
}

/**
 * Get a specific job by ID
 */
export function getJobById(id: number): Job | null {
  const jobs = getAllJobs();
  return jobs.find(job => job.id === id) || null;
}

/**
 * Update a job's match percentage for a specific user
 * based on their profile and skills
 */
export function updateJobMatch(jobId: number, userId: number, matchPercentage: number): Job | null {
  const jobs = getAllJobs();
  const index = jobs.findIndex(job => job.id === jobId);
  
  if (index === -1) return null;
  
  // Update the job's match percentage
  const updatedJob = { ...jobs[index], match: matchPercentage };
  jobs[index] = updatedJob;
  
  // Save the updated list
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  
  return updatedJob;
}

/**
 * Get all job applications
 */
export function getAllApplications(): JobApplication[] {
  // Only run on client
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving applications data:', error);
    return [];
  }
}

/**
 * Get applications for a specific user
 */
export function getUserApplications(userId: number): JobApplication[] {
  const applications = getAllApplications();
  return applications.filter(app => app.userId === userId);
}

/**
 * Check if user has applied to a specific job
 */
export function hasApplied(userId: number, jobId: number): boolean {
  const applications = getAllApplications();
  return applications.some(app => app.userId === userId && app.jobId === jobId);
}

/**
 * Add a new job application
 */
export function addJobApplication(application: Omit<JobApplication, 'id'>): JobApplication {
  const applications = getAllApplications();
  
  // Generate a new ID
  const newId = applications.length > 0 
    ? Math.max(...applications.map(a => a.id)) + 1 
    : 1;
    
  const newApplication = { ...application, id: newId } as JobApplication;
  
  // Add to list and save
  const updatedApplications = [...applications, newApplication];
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updatedApplications));
  
  return newApplication;
}

/**
 * Update an existing application
 */
export function updateApplication(id: number, data: Partial<JobApplication>): JobApplication | null {
  const applications = getAllApplications();
  const index = applications.findIndex(app => app.id === id);
  
  if (index === -1) return null;
  
  // Update the application
  const updatedApplication = { ...applications[index], ...data };
  applications[index] = updatedApplication;
  
  // Save the updated list
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
  
  return updatedApplication;
}

/**
 * Delete an application
 */
export function deleteApplication(id: number): boolean {
  const applications = getAllApplications();
  const filteredApplications = applications.filter(app => app.id !== id);
  
  if (filteredApplications.length === applications.length) {
    return false; // Application not found
  }
  
  // Save the updated list
  localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(filteredApplications));
  
  return true;
}

/**
 * Get saved jobs for a specific user
 */
export function getSavedJobs(userId: number): number[] {
  // Only run on client
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(SAVED_JOBS_STORAGE_KEY);
    const savedJobsMap = data ? JSON.parse(data) : {};
    return savedJobsMap[userId] || [];
  } catch (error) {
    console.error('Error retrieving saved jobs data:', error);
    return [];
  }
}

/**
 * Check if a job is saved by a user
 */
export function isJobSaved(userId: number, jobId: number): boolean {
  const savedJobs = getSavedJobs(userId);
  return savedJobs.includes(jobId);
}

/**
 * Toggle save/unsave a job for a user
 */
export function toggleSaveJob(userId: number, jobId: number): boolean {
  // Only run on client
  if (typeof window === 'undefined') return false;

  try {
    const data = localStorage.getItem(SAVED_JOBS_STORAGE_KEY);
    const savedJobsMap = data ? JSON.parse(data) : {};
    
    // Initialize user's saved jobs if not exists
    if (!savedJobsMap[userId]) {
      savedJobsMap[userId] = [];
    }
    
    const userSavedJobs = savedJobsMap[userId];
    const jobIndex = userSavedJobs.indexOf(jobId);
    
    // Toggle save/unsave
    if (jobIndex === -1) {
      // Job not saved, add it
      userSavedJobs.push(jobId);
    } else {
      // Job already saved, remove it
      userSavedJobs.splice(jobIndex, 1);
    }
    
    // Update saved jobs map
    savedJobsMap[userId] = userSavedJobs;
    localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(savedJobsMap));
    
    // Return true if the job is now saved, false if it was removed
    return jobIndex === -1;
  } catch (error) {
    console.error('Error toggling saved job:', error);
    return false;
  }
}

/**
 * Calculate job match percentage for a user based on their skills
 */
export function calculateJobMatch(userSkills: string[], jobSkills: string[]): number {
  if (!userSkills.length || !jobSkills.length) return 0;
  
  // Count how many job skills the user has
  const matchedSkills = jobSkills.filter(skill => 
    userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
  );
  
  // Calculate percentage
  return Math.round((matchedSkills.length / jobSkills.length) * 100);
}

/**
 * Reset jobs data to default sample data (for testing)
 */
export function resetJobsData(): void {
  const defaultUserId = 1;
  const personalizedJobs = createPersonalizedJobsForUser(defaultUserId);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(personalizedJobs));
}

/**
 * Add a new job
 */
export function addJob(job: Omit<Job, 'id'>): Job {
  const jobs = getAllJobs();
  
  // Generate a new ID
  const newId = jobs.length > 0 
    ? Math.max(...jobs.map(a => a.id)) + 1 
    : 1;
    
  const newJob = { ...job, id: newId } as Job;
  
  // Add to list and save
  const updatedJobs = [...jobs, newJob];
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
  
  return newJob;
}

/**
 * Update an existing job
 */
export function updateJob(id: number, data: Partial<Job>): Job | null {
  const jobs = getAllJobs();
  const index = jobs.findIndex(job => job.id === id);
  
  if (index === -1) return null;
  
  // Update the job
  const updatedJob = { ...jobs[index], ...data };
  jobs[index] = updatedJob;
  
  // Save the updated list
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  
  return updatedJob;
}

/**
 * Delete a job
 */
export function deleteJob(id: number): boolean {
  const jobs = getAllJobs();
  const filteredJobs = jobs.filter(job => job.id !== id);
  
  if (filteredJobs.length === jobs.length) {
    return false; // Job not found
  }
  
  // Save the updated list
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(filteredJobs));
  
  return true;
} 