import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery } from '@/lib/db';

// Get all CVs for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from the Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAuth(token);
    if (!decoded || (decoded.role === 'student' && decoded.id !== params.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all CVs for the student
    const pool = await getPool();
    const [cvs] = await pool.query(
      `SELECT 
        sc.id, sc.name, sc.template_id, sc.ats_score, 
        sc.created_at, sc.updated_at,
        ct.name as template_name,
        sc.is_ats_optimized as is_draft
      FROM student_cvs sc
      LEFT JOIN cv_templates ct ON sc.template_id = ct.id
      WHERE sc.student_id = ?
      ORDER BY sc.updated_at DESC`,
      [params.id]
    );

    return NextResponse.json(cvs);
  } catch (error) {
    console.error('Error fetching student CVs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create a new CV for a student
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get token from the Authorization header
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = await verifyAuth(token);
    if (!decoded || (decoded.role === 'student' && decoded.id !== params.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { name, template_id, content, html_content } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'CV name is required' }, { status: 400 });
    }

    // Get user's profile data to generate ATS score and pre-populate content
    const pool = await getPool();
    
    // Fetch user basic information
    const [userRows] = await pool.query(
      `SELECT name, email FROM users WHERE id = ?`,
      [params.id]
    );
    
    // Fetch user profile details
    const [profileRows] = await pool.query(
      `SELECT biography, preferred_job_type, phone, preferred_location 
       FROM user_profiles 
       WHERE user_id = ?`,
      [params.id]
    );
    
    // Fetch user education
    const [educationRows] = await pool.query(
      `SELECT institution, degree, field_of_study, start_date, end_date, description 
       FROM user_education 
       WHERE user_id = ? 
       ORDER BY end_date DESC`,
      [params.id]
    );
    
    // Fetch user experience
    const [experienceRows] = await pool.query(
      `SELECT title, company, location, start_date, end_date, description 
       FROM user_experience 
       WHERE user_id = ? 
       ORDER BY end_date DESC`,
      [params.id]
    );
    
    // Fetch user skills
    const [skillsRows] = await pool.query(
      `SELECT skill, level 
       FROM user_skills 
       WHERE user_id = ?`,
      [params.id]
    );
    
    // Create structured content based on user data
    const userData = userRows[0] || {};
    const profileData = profileRows[0] || {};
    
    // Prepare initial CV content
    const initialContent = {
      personal: {
        name: userData.name || '',
        title: profileData.preferred_job_type || '',
        email: userData.email || '',
        phone: profileData.phone || '',
        location: profileData.preferred_location || '',
        summary: profileData.biography || ''
      },
      education: Array.isArray(educationRows) 
        ? educationRows.map((edu: any) => ({
            degree: edu.degree || '',
            institution: edu.institution || '',
            location: '',
            year: edu.end_date ? (new Date(edu.end_date).getFullYear().toString()) : 
                  (edu.start_date ? (new Date(edu.start_date).getFullYear().toString() + ' - Present') : ''),
            description: edu.description || ''
          }))
        : [],
      experience: Array.isArray(experienceRows)
        ? experienceRows.map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            period: exp.end_date 
              ? `${new Date(exp.start_date).getFullYear()} - ${new Date(exp.end_date).getFullYear()}`
              : `${new Date(exp.start_date).getFullYear()} - Present`,
            description: exp.description || ''
          }))
        : [],
      skills: Array.isArray(skillsRows)
        ? skillsRows.map((skill: any) => ({
            name: skill.skill || '',
            level: skill.level || 'intermediate'
          }))
        : [],
      projects: []
    };
    
    // Generate HTML for the initialized content
    let initialHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin-bottom: 5px;">${initialContent.personal?.name || 'Your Name'}</h1>
          <p style="margin: 0; color: #666;">${initialContent.personal?.title || 'Professional Title'}</p>
          <p style="margin: 5px 0; color: #666;">
            ${initialContent.personal?.email || 'email@example.com'} | 
            ${initialContent.personal?.phone || '(123) 456-7890'} | 
            ${initialContent.personal?.location || 'City, Country'}
          </p>
        </header>
        
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Summary</h2>
          <p>${initialContent.personal?.summary || 'Professional summary goes here.'}</p>
        </section>
    `;
    
    // Add education section if exists
    if (initialContent.education && initialContent.education.length > 0) {
      initialHtml += `
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Education</h2>
          <ul style="list-style-type: none; padding: 0;">
      `;
      
      initialContent.education.forEach((edu: any) => {
        initialHtml += `
          <li style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${edu.degree || 'Degree'}</strong>
              <span>${edu.year || 'Year'}</span>
            </div>
            <div>${edu.institution || 'Institution'}</div>
            <div style="font-style: italic; color: #666;">${edu.location || 'Location'}</div>
          </li>
        `;
      });
      
      initialHtml += `
          </ul>
        </section>
      `;
    }
    
    // Add experience section if exists
    if (initialContent.experience && initialContent.experience.length > 0) {
      initialHtml += `
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Experience</h2>
          <ul style="list-style-type: none; padding: 0;">
      `;
      
      initialContent.experience.forEach((exp: any) => {
        initialHtml += `
          <li style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${exp.title || 'Job Title'}</strong>
              <span>${exp.period || 'Time Period'}</span>
            </div>
            <div>${exp.company || 'Company'}, ${exp.location || 'Location'}</div>
            <p>${exp.description || 'Job description'}</p>
          </li>
        `;
      });
      
      initialHtml += `
          </ul>
        </section>
      `;
    }
    
    // Add skills section if exists
    if (initialContent.skills && initialContent.skills.length > 0) {
      initialHtml += `
        <section style="margin-bottom: 20px;">
          <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
      `;
      
      initialContent.skills.forEach((skill: any) => {
        initialHtml += `
          <span style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;">
            ${skill.name || 'Skill'}
          </span>
        `;
      });
      
      initialHtml += `
          </div>
        </section>
      `;
    }
    
    initialHtml += `
      </div>
    `;
    
    // Use initialContent if no content was provided
    const finalContent = content && Object.keys(content).length > 0 
      ? content 
      : initialContent;
      
    // Use initialHtml if no html_content was provided
    const finalHtml = html_content || initialHtml;
    
    // Calculate ATS score based on content coverage (simple simulation for now)
    // Count the number of fields that have content
    let filledFields = 0;
    let totalFields = 0;
    
    // Count personal fields
    const personalFields = finalContent.personal ? Object.values(finalContent.personal).filter(Boolean).length : 0;
    filledFields += personalFields;
    totalFields += finalContent.personal ? Object.keys(finalContent.personal).length : 0;
    
    // Count education fields
    if (Array.isArray(finalContent.education)) {
      finalContent.education.forEach((edu: any) => {
        filledFields += Object.values(edu).filter(Boolean).length;
        totalFields += Object.keys(edu).length;
      });
    }
    
    // Count experience fields
    if (Array.isArray(finalContent.experience)) {
      finalContent.experience.forEach((exp: any) => {
        filledFields += Object.values(exp).filter(Boolean).length;
        totalFields += Object.keys(exp).length;
      });
    }
    
    // Count skills
    filledFields += Array.isArray(finalContent.skills) ? finalContent.skills.length : 0;
    totalFields += 5; // We expect at least 5 skills for a good CV
    
    // Calculate ATS score
    const baseScore = totalFields > 0 ? Math.floor((filledFields / totalFields) * 70) : 70;
    let atsScore = Math.min(baseScore + Math.floor(Math.random() * 20), 100); // Base score + bonus
    
    if (finalContent.personal?.name && 
        finalContent.personal?.email && 
        finalContent.personal?.summary &&
        finalContent.education && finalContent.education.length > 0 &&
        finalContent.experience && finalContent.experience.length > 0) {
      // Ensure a minimum score of 75 if essential fields are completed
      atsScore = Math.max(atsScore, 75);
    }

    // Convert content to JSON string if it's an object
    const contentString = typeof finalContent === 'object' ? JSON.stringify(finalContent) : finalContent;
    
    // Create new CV
    const result = await runQuery(
      `INSERT INTO student_cvs 
        (student_id, name, template_id, content, html_content, ats_score, is_ats_optimized) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.id,
        name,
        template_id || null,
        contentString || '{}',
        finalHtml || '<div>CV content will appear here</div>',
        atsScore,
        atsScore >= 90 ? 1 : 0 // Optimized if score is 90 or above
      ]
    );

    return NextResponse.json({
      message: 'CV created successfully',
      id: result.lastID,
      ats_score: atsScore
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating student CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 