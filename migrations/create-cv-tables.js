/**
 * Migration to create CV and cover letter tables
 */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Create CV templates table (managed by admins)
  db.run(`
    CREATE TABLE IF NOT EXISTS cv_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      structure TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create cover letter templates table (managed by admins)
  db.run(`
    CREATE TABLE IF NOT EXISTS cover_letter_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'General',
      content TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create student CVs table (CVs created and saved by students)
  db.run(`
    CREATE TABLE IF NOT EXISTS student_cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      name TEXT NOT NULL,
      template_id INTEGER,
      content TEXT NOT NULL,
      html_content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_generated_at DATETIME,
      ats_score INTEGER DEFAULT 0,
      is_draft INTEGER DEFAULT 1,
      FOREIGN KEY (template_id) REFERENCES cv_templates(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // Create student cover letters table (Cover letters created and saved by students)
  db.run(`
    CREATE TABLE IF NOT EXISTS student_cover_letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      name TEXT NOT NULL, 
      template_id INTEGER,
      job_position TEXT,
      company_name TEXT,
      content TEXT NOT NULL,
      html_content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_generated_at DATETIME,
      ats_score INTEGER DEFAULT 0,
      is_draft INTEGER DEFAULT 1,
      FOREIGN KEY (template_id) REFERENCES cover_letter_templates(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `);

  // Add some default CV templates
  db.run(`
    INSERT INTO cv_templates (name, description, structure, creator_id)
    VALUES (
      'Standard Education CV',
      'A standard template suitable for teaching and education professionals',
      '{"sections": ["personal_info", "education", "experience", "skills", "qualifications", "references"]}',
      'system'
    )
  `);

  db.run(`
    INSERT INTO cv_templates (name, description, structure, creator_id)
    VALUES (
      'Modern Teaching CV',
      'A modern template highlighting teaching achievements and classroom experience',
      '{"sections": ["personal_info", "professional_summary", "teaching_experience", "education", "certifications", "skills", "achievements"]}',
      'system'
    )
  `);

  // Add some default cover letter templates
  db.run(`
    INSERT INTO cover_letter_templates (name, description, category, content, creator_id)
    VALUES (
      'Primary Education',
      'Cover letter template for primary education positions',
      'Education',
      '[Opening Paragraph]\n\nI am writing to express my interest in the [Position] role at [School/Organization]. With [X] years of experience in primary education and a passion for creating engaging learning environments, I believe my skills and qualifications make me an excellent candidate for this position.\n\n[Middle Paragraphs]\n\nThroughout my career, I have developed expertise in [Key Skill 1], [Key Skill 2], and [Key Skill 3]. My experience at [Previous School/Experience] has prepared me to [Specific Requirement from Job Description]. I am particularly proud of [Specific Achievement] which demonstrates my ability to [Relevant Skill].\n\nMy teaching philosophy centers on [Core Value], and I strive to [Teaching Approach]. I am committed to [Educational Goal] and believe that every child deserves [Educational Value].\n\n[Closing Paragraph]\n\nI am excited about the opportunity to bring my experience and enthusiasm to [School/Organization]. I would welcome the chance to discuss how my background, skills and teaching philosophy would be a good match for this position.\n\nThank you for your consideration.',
      'system'
    )
  `);

  db.run(`
    INSERT INTO cover_letter_templates (name, description, category, content, creator_id)
    VALUES (
      'Special Needs Education',
      'Cover letter template focused on special education needs and inclusive teaching',
      'Special Education',
      '[Opening Paragraph]\n\nI am writing to apply for the [Position] position at [School/Organization]. As a dedicated special education professional with [X] years of experience working with students with diverse learning needs, I am excited about the opportunity to contribute to your inclusive learning environment.\n\n[Middle Paragraphs]\n\nMy experience includes working with students with [Type of Special Needs], where I developed and implemented [Type of Program/Intervention]. I have expertise in [Specific Technique] and [Assessment Method], which has helped me successfully [Achievement with Students].\n\nI am particularly drawn to [School/Organization] because of your commitment to [School Value/Approach]. Your focus on [School Strength] aligns perfectly with my teaching philosophy of [Personal Teaching Philosophy].\n\n[Closing Paragraph]\n\nI am enthusiastic about the possibility of joining your team and contributing to the success of your students. I would welcome the opportunity to discuss how my background and qualifications would be valuable to your school community.\n\nThank you for considering my application.',
      'system'
    )
  `);

  console.log('CV and cover letter tables created successfully');
});

db.close(); 