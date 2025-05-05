import { getPool } from './db';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

// User operations
export async function updateUserProfile(userId: string, data: { bio?: string; profileImage?: string; videoUrl?: string }) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  
  try {
    const [result] = await connection.query(
      'UPDATE users SET ? WHERE id = ?',
      [data, userId]
    );
    return result;
  } finally {
    connection.release();
  }
}

// Student operations
export async function getStudentQualifications(studentId: string) {
  return await db.qualification.findMany({
    where: {
      studentId: studentId
    },
    include: {
      type: true,
      grade: true
    }
  });
}

export async function getStudentSkills(studentId: string) {
  return await db.skill.findMany({
    where: {
      studentId: studentId
    },
    include: {
      category: true,
      level: true
    }
  });
}

export async function getStudentJobInterests(studentId: string) {
  return await db.jobInterest.findMany({
    where: {
      studentId: studentId
    },
    include: {
      job: true
    }
  });
}

// Mentor operations
export async function getMentorStudents(mentorId: string) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(`
      SELECT u.*, ma.start_date, ma.status as assignment_status
      FROM users u
      JOIN mentor_assignments ma ON u.id = ma.student_id
      WHERE ma.mentor_id = ? AND ma.status = 'active'
    `, [mentorId]);
    return rows;
  } finally {
    connection.release();
  }
}

export async function getPendingVerifications(mentorId: string) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(`
      SELECT av.*, sa.title as activity_title, sa.description as activity_description,
             u.name as student_name, u.email as student_email
      FROM activity_verifications av
      JOIN student_activities sa ON av.activity_id = sa.id
      JOIN users u ON sa.student_id = u.id
      WHERE av.mentor_id = ? AND av.status = 'pending'
      ORDER BY av.created_at DESC
    `, [mentorId]);
    return rows;
  } finally {
    connection.release();
  }
}

// Admin operations
export async function getSystemAccess(adminId: string) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.query(
      'SELECT * FROM system_access WHERE admin_id = ? ORDER BY last_accessed DESC',
      [adminId]
    );
    return rows;
  } finally {
    connection.release();
  }
}

// File upload operations
export async function saveFileUrl(userId: string, fileType: 'image' | 'video', fileUrl: string) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  
  try {
    const column = fileType === 'image' ? 'profileImage' : 'videoUrl';
    await connection.query(
      `UPDATE users SET ${column} = ? WHERE id = ?`,
      [fileUrl, userId]
    );
    return fileUrl;
  } finally {
    connection.release();
  }
} 