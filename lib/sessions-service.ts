'use client';

import { Session } from '@/types/session';

// Initial sample data for testing
const sampleSessions: Session[] = [
  {
    id: 1,
    date: '2023-05-15',
    timeSpent: '90',
    ageGroup: 'Primary (7-11)',
    organization: 'West Elementary School',
    topic: 'Introduction to Algebra',
    positives: 'Students showed strong engagement with the interactive exercises',
    developments: 'Need to provide more time for individual practice',
    supervisorFeedback: 'Good classroom management and clear explanations',
    status: 'completed'
  },
  {
    id: 2,
    date: '2023-05-22',
    timeSpent: '120',
    ageGroup: 'Secondary (11-16)',
    organization: 'Riverdale High School',
    topic: 'Scientific Method',
    positives: 'Excellent group discussion and critical thinking activities',
    developments: 'Could improve timing on the practical demonstration',
    supervisorFeedback: 'Well-structured lesson with clear learning objectives',
    status: 'pending'
  },
  {
    id: 3,
    date: '2023-06-01',
    timeSpent: '60',
    ageGroup: 'Early Years (0-5)',
    organization: 'Sunshine Preschool',
    topic: 'Colors and Shapes',
    positives: 'Children were highly engaged with the hands-on activities',
    developments: 'Transition between activities could be smoother',
    supervisorFeedback: 'Pending',
    status: 'pending'
  }
];

// Storage key for sessions
const SESSIONS_STORAGE_KEY = 'teaching-sessions-data';

/**
 * Initialize the sessions database
 * This checks if sessions data already exists in localStorage,
 * and if not, it initializes it with sample data
 */
export function initSessionsData(): void {
  // Only run on client
  if (typeof window === 'undefined') return;

  // Initialize if not already set
  if (!localStorage.getItem(SESSIONS_STORAGE_KEY)) {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sampleSessions));
    console.log('Sessions database initialized with sample data');
  }
}

/**
 * Reset the sessions database to sample data (for development)
 */
export function resetSessionsData(): void {
  // Only run on client
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sampleSessions));
  console.log('Sessions database reset to sample data');
}

/**
 * Get all sessions
 */
export function getAllSessions(): Session[] {
  // Only run on client
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!data) {
      initSessionsData();
      return sampleSessions;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving sessions data:', error);
    return [];
  }
}

/**
 * Get a specific session by ID
 */
export function getSessionById(id: number): Session | null {
  const sessions = getAllSessions();
  return sessions.find(session => session.id === id) || null;
}

/**
 * Add a new session
 */
export function addSession(sessionData: Omit<Session, 'id'>): Session {
  const sessions = getAllSessions();
  
  // Generate a new ID
  const newId = sessions.length > 0 
    ? Math.max(...sessions.map(s => s.id)) + 1 
    : 1;
    
  const newSession = { ...sessionData, id: newId };
  
  // Add to list and save
  const updatedSessions = [...sessions, newSession];
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
  
  return newSession;
}

/**
 * Update an existing session
 */
export function updateSession(id: number, sessionData: Partial<Session>): Session | null {
  const sessions = getAllSessions();
  const index = sessions.findIndex(session => session.id === id);
  
  if (index === -1) return null;
  
  // Update the session
  const updatedSession = { ...sessions[index], ...sessionData };
  sessions[index] = updatedSession;
  
  // Save the updated list
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  
  return updatedSession;
}

/**
 * Delete a session
 */
export function deleteSession(id: number): boolean {
  const sessions = getAllSessions();
  const filteredSessions = sessions.filter(session => session.id !== id);
  
  if (filteredSessions.length === sessions.length) {
    return false; // Session not found
  }
  
  // Save the updated list
  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filteredSessions));
  
  return true;
}

/**
 * Provide feedback on a session (e.g., from a mentor or supervisor)
 */
export function provideFeedback(id: number, feedback: string): Session | null {
  return updateSession(id, { supervisorFeedback: feedback });
}

/**
 * Mark a session as completed
 */
export function completeSession(id: number): Session | null {
  return updateSession(id, { status: 'completed' });
}

/**
 * Get stats about sessions (total hours, age groups, etc.)
 */
export function getSessionStats() {
  const sessions = getAllSessions();
  
  // Calculate total hours
  const totalMinutes = sessions.reduce((total, session) => {
    return total + parseInt(session.timeSpent);
  }, 0);
  
  const totalHours = (totalMinutes / 60).toFixed(1);
  
  // Count unique age groups
  const ageGroups = new Set(sessions.map(session => session.ageGroup));
  
  // Count sessions by status
  const completedSessions = sessions.filter(session => session.status === 'completed').length;
  const pendingSessions = sessions.filter(session => session.status === 'pending').length;
  
  return {
    totalHours,
    uniqueAgeGroups: ageGroups.size,
    totalSessions: sessions.length,
    completedSessions,
    pendingSessions
  };
} 