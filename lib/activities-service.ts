'use client';

import { activitiesData } from './sample-data';

// Define feedback type
export interface Feedback {
  id: number;
  author: string;
  role: string;
  date: string;
  content: string;
}

// Define activity type
export interface Activity {
  id: number;
  title: string;
  date: string;
  duration: string;
  type: string;
  status: 'verified' | 'pending' | 'rejected';
  reflectionCompleted: boolean;
  mentor: string;
  student: string;
  studentId: number;
  description: string;
  location: string;
  evidence: string;
  reflection?: string;
  rejectionReason?: string;
  feedback?: Feedback[];
}

// Storage key for activities
const ACTIVITIES_STORAGE_KEY = 'student-activities-data';

/**
 * Check if activities data is initialized
 */
export function isActivitiesInitialized(): boolean {
  // Only run on client
  if (typeof window === 'undefined') return false;

  return localStorage.getItem(ACTIVITIES_STORAGE_KEY) !== null;
}

/**
 * Initialize the activities database
 * This checks if activities data already exists in localStorage,
 * and if not, it initializes it with sample data
 */
export function initActivitiesData(): void {
  // Only run on client
  if (typeof window === 'undefined') return;

  // For testing: force reinitialization to ensure we always have fresh data
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activitiesData));
  console.log('Activities database reset with sample data:', activitiesData.length, 'activities');
}

/**
 * Get all activities
 */
export function getAllActivities(): Activity[] {
  // Only run on client
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving activities data:', error);
    return [];
  }
}

/**
 * Get activities for a specific student
 * @param studentId The ID of the student
 */
export function getStudentActivities(studentId: number): Activity[] {
  const activities = getAllActivities();
  return activities.filter(activity => activity.studentId === studentId);
}

/**
 * Add a new activity
 * @param activity The activity to add
 */
export function addActivity(activity: Omit<Activity, 'id'>): Activity {
  const activities = getAllActivities();
  
  // Generate a new ID
  const newId = activities.length > 0 
    ? Math.max(...activities.map(a => a.id)) + 1 
    : 1;
    
  const newActivity = { ...activity, id: newId } as Activity;
  
  // Add to list and save
  const updatedActivities = [...activities, newActivity];
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updatedActivities));
  
  return newActivity;
}

/**
 * Update an existing activity
 * @param id The ID of the activity to update
 * @param activityData The updated activity data
 */
export function updateActivity(id: number, activityData: Partial<Activity>): Activity | null {
  const activities = getAllActivities();
  const index = activities.findIndex(activity => activity.id === id);
  
  if (index === -1) return null;
  
  // Update the activity
  const updatedActivity = { ...activities[index], ...activityData };
  activities[index] = updatedActivity;
  
  // Save the updated list
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  
  return updatedActivity;
}

/**
 * Delete an activity
 * @param id The ID of the activity to delete
 */
export function deleteActivity(id: number): boolean {
  const activities = getAllActivities();
  const filteredActivities = activities.filter(activity => activity.id !== id);
  
  if (filteredActivities.length === activities.length) {
    return false; // Activity not found
  }
  
  // Save the updated list
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(filteredActivities));
  
  return true;
}

/**
 * Change the status of an activity
 * @param id The ID of the activity
 * @param status The new status
 * @param reason Optional reason (required for rejected status)
 */
export function changeActivityStatus(
  id: number, 
  status: 'verified' | 'pending' | 'rejected', 
  reason?: string
): Activity | null {
  // For rejected status, a reason is required
  if (status === 'rejected' && !reason) {
    throw new Error('A reason is required when rejecting an activity');
  }
  
  const updateData: Partial<Activity> = { status };
  if (reason) {
    updateData.rejectionReason = reason;
  }
  
  return updateActivity(id, updateData);
}

/**
 * Add a reflection to an activity
 * @param id The ID of the activity
 * @param reflection The reflection text
 */
export function addReflection(id: number, reflection: string): Activity | null {
  return updateActivity(id, { 
    reflection, 
    reflectionCompleted: true 
  });
}

/**
 * Get statistics about activities
 */
export function getActivityStats() {
  const activities = getAllActivities();
  
  // Count activities by status
  const verifiedActivities = activities.filter(activity => activity.status === 'verified').length;
  const pendingActivities = activities.filter(activity => activity.status === 'pending').length;
  const rejectedActivities = activities.filter(activity => activity.status === 'rejected').length;
  
  // Count unique activity types
  const activityTypes = new Set(activities.map(activity => activity.type)).size;
  
  return {
    totalActivities: activities.length,
    verifiedActivities,
    pendingActivities,
    rejectedActivities,
    activityTypes
  };
}

/**
 * Reset the activities database back to the initial sample data
 * Useful for development and testing
 */
export function resetActivitiesData(): void {
  localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activitiesData));
} 