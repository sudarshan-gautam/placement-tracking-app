import { database } from '@/lib/db';

// User operations
export async function updateUserProfile(userId: string, data: { profileImage?: string }) {
  try {
    // Prepare query
    const query = 'UPDATE users SET profileImage = ? WHERE id = ?';
    await database.runQuery(query, [data.profileImage, userId]);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
}

// Job operations
export async function getJobsByLocation(location: string) {
  try {
    return await database.getAll(
      'SELECT * FROM jobs WHERE location LIKE ?',
      [`%${location}%`]
    );
  } catch (error) {
    console.error('Error getting jobs by location:', error);
    return [];
  }
}

export async function getJobsByStatus(status: string) {
  try {
    return await database.getAll(
      'SELECT * FROM jobs WHERE status = ?',
      [status]
    );
  } catch (error) {
    console.error('Error getting jobs by status:', error);
    return [];
  }
}

export async function createJob(jobData: {
  title: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  location?: string;
  deadline?: string;
  status?: 'active' | 'closed' | 'draft';
}) {
  try {
    const id = generateUUID();
    const now = new Date().toISOString();
    const status = jobData.status || 'active';
    
    await database.runQuery(
      `INSERT INTO jobs (
        id, title, description, requirements, salary_range, 
        location, deadline, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        jobData.title, 
        jobData.description, 
        jobData.requirements || null, 
        jobData.salary_range || null,
        jobData.location || null,
        jobData.deadline || null,
        status,
        now,
        now
      ]
    );
    
    return { success: true, id };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error };
  }
}

export async function updateJob(id: string, jobData: {
  title?: string;
  description?: string;
  requirements?: string;
  salary_range?: string;
  location?: string;
  deadline?: string;
  status?: 'active' | 'closed' | 'draft';
}) {
  try {
    const job = await database.getJobById(id);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }
    
    // Prepare update values
    const updates = Object.entries(jobData)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`);
    
    if (updates.length === 0) {
      return { success: true, message: 'No changes to apply' };
    }
    
    // Add updated_at timestamp
    updates.push('updated_at = ?');
    
    // Prepare values array with same order as updates
    const values = Object.entries(jobData)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);
    
    // Add updated_at value and job id
    values.push(new Date().toISOString());
    values.push(id);
    
    // Execute query
    await database.runQuery(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error updating job:', error);
    return { success: false, error };
  }
}

export async function deleteJob(id: string) {
  try {
    await database.runQuery(
      'DELETE FROM jobs WHERE id = ?',
      [id]
    );
    return { success: true };
  } catch (error) {
    console.error('Error deleting job:', error);
    return { success: false, error };
  }
}

// Helper function to generate UUID for new records
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 