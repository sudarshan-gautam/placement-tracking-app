'use client';

// Define feedback type
export interface Feedback {
  id: number;
  author: string;
  role: string;
  date: string;
  content: string;
}

// Define activity type to align with database schema
export interface Activity {
  id: number | string;
  title: string;
  description: string;
  // Align the field names with DB schema
  activity_type: string;
  date_completed: string;
  duration_minutes: number;
  evidence_url?: string;
  // Allow both database status values and UI status values
  status: 'draft' | 'submitted' | 'completed' | 'verified' | 'pending' | 'rejected';
  verification_status?: 'pending' | 'verified' | 'rejected';
  student_id: string | number;
  student?: { id: string | number; name: string };
  student_name?: string;
  reflectionCompleted?: boolean;
  mentor_id?: string | number;
  mentor?: { id?: string | number; name?: string };
  verified_by?: string;
  verified_by_name?: string;
  feedback?: string | Feedback[];
  learning_outcomes?: string;
  feedback_comments?: string;
  created_at?: string;
  updated_at?: string;
  
  // Legacy/UI field names for backward compatibility
  type?: string;
  date?: string;
  duration?: string | number;
  location?: string;
  evidence?: string;
  reflection?: string;
  rejectionReason?: string;
  learningOutcomes?: string;
}

/**
 * Get all activities from the API
 * @returns Promise with activities array
 */
export async function getAllActivities(token?: string, userId?: string, userRole?: string): Promise<Activity[]> {
  try {
    // Create authentication headers using user data
    let authHeader = '';
    if (token) {
      authHeader = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/activities', {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-User-Role': userRole || '',
        'X-User-ID': userId || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.status}`);
    }
    
    const data = await response.json();
    const activities = data.activities || [];
    
    // Process activities to ensure compatibility with both DB field names and UI expectations
    return activities.map((activity: Activity) => {
      // Map database fields to UI fields if needed
      return {
        ...activity,
        // Ensure backward compatibility by adding UI-expected fields
        type: activity.activity_type || activity.type,
        date: activity.date_completed || activity.date,
        duration: activity.duration_minutes || activity.duration,
        // Use verification_status for UI status if available
        status: activity.verification_status || activity.status
      };
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

/**
 * Get a specific activity by ID
 * @param id The ID of the activity
 */
export async function getActivityById(id: number | string, token?: string): Promise<Activity | null> {
  try {
    // Create authentication headers using user data
    let authHeader = '';
    if (token) {
      authHeader = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/activities/${id}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch activity: ${response.status}`);
    }
    
    const data = await response.json();
    return data.activity || null;
  } catch (error) {
    console.error('Error fetching activity:', error);
    return null;
  }
}

/**
 * Get all activities for a specific student
 * @param studentId The ID of the student
 */
export async function getStudentActivities(studentId: number | string, token?: string): Promise<Activity[]> {
  try {
    // Create authentication headers using user data
    let authHeader = '';
    if (token) {
      authHeader = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/activities?studentId=${studentId}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-User-Role': 'admin', // Admin role to access other student's data
        'X-User-ID': ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch student activities: ${response.status}`);
    }
    
    const data = await response.json();
    return data.activities || [];
  } catch (error) {
    console.error('Error fetching student activities:', error);
    return [];
  }
}

/**
 * Add a new activity
 * @param activity The activity to add
 */
export async function addActivity(activity: Omit<Activity, 'id'>, token?: string): Promise<Activity | null> {
  try {
    // Create authentication headers using user data
    let authHeader = '';
    if (token) {
      authHeader = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activity)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add activity: ${response.status}`);
    }
    
    const data = await response.json();
    return data.activity || null;
  } catch (error) {
    console.error('Error adding activity:', error);
    return null;
  }
}

/**
 * Update an existing activity
 * @param id The ID of the activity to update
 * @param activityData The updated activity data
 */
export async function updateActivity(
  id: number | string, 
  activityData: Partial<Activity>, 
  token?: string
): Promise<Activity | null> {
  try {
    // Create authentication headers using user data
    let authHeader = '';
    if (token) {
      authHeader = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/activities/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activityData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update activity: ${response.status}`);
    }
    
    const data = await response.json();
    return data.activity || null;
  } catch (error) {
    console.error('Error updating activity:', error);
    return null;
  }
}

/**
 * Delete an activity
 * @param id The ID of the activity to delete
 */
export async function deleteActivity(id: number | string, token?: string): Promise<boolean> {
  try {
    // Create authentication headers using user data
    let authHeader = '';
    if (token) {
      authHeader = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/activities/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete activity: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
}

/**
 * Change the status of an activity
 * @param id The ID of the activity
 * @param status The new status
 * @param reason Optional reason (required for rejected status)
 */
export async function changeActivityStatus(
  id: number | string, 
  status: 'verified' | 'pending' | 'rejected', 
  reason?: string,
  token?: string
): Promise<Activity | null> {
  // For rejected status, a reason is required
  if (status === 'rejected' && !reason) {
    throw new Error('A reason is required when rejecting an activity');
  }
  
  const updateData: Partial<Activity> = { status };
  if (reason) {
    updateData.rejectionReason = reason;
  }
  
  return updateActivity(id, updateData, token);
}

/**
 * Add a reflection to an activity
 * @param id The ID of the activity
 * @param reflection The reflection text
 */
export async function addReflection(
  id: number | string, 
  reflection: string,
  token?: string
): Promise<Activity | null> {
  return updateActivity(id, { 
    reflection, 
    reflectionCompleted: true 
  }, token);
}

/**
 * Get statistics about activities
 */
export async function getActivityStats(activities?: Activity[]) {
  try {
    // If activities are not provided, fetch them
    if (!activities) {
      activities = await getAllActivities();
    }
    
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
  } catch (error) {
    console.error('Error calculating activity stats:', error);
    return {
      totalActivities: 0,
      verifiedActivities: 0,
      pendingActivities: 0,
      rejectedActivities: 0,
      activityTypes: 0
    };
  }
}

/**
 * Reset the activities database back to the initial sample data
 * Useful for development and testing
 */
export function resetActivitiesData(): void {
  // This function is no longer needed as the data is now fetched from the API
} 