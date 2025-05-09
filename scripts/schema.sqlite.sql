-- SQLite schema for placement tracking app

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'mentor', 'student')) NOT NULL,
    name TEXT NOT NULL,
    profileImage TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_range TEXT,
    location TEXT,
    deadline TEXT,
    status TEXT CHECK(status IN ('active', 'closed', 'draft')) DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')) DEFAULT 'pending',
    resume_url TEXT,
    cover_letter TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Student Profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course TEXT NOT NULL,
    graduation_year INTEGER,
    cgpa REAL,
    skills TEXT,
    projects TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Qualifications table
CREATE TABLE IF NOT EXISTS qualifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    description TEXT,
    date_obtained TEXT NOT NULL,
    expiry_date TEXT,
    certificate_url TEXT,
    type TEXT CHECK(type IN ('degree', 'certificate', 'license', 'course', 'other')) NOT NULL,
    verification_status TEXT CHECK(verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    verified_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT,
  item_type TEXT CHECK(item_type IN ('qualification', 'session', 'application', 'other')) NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teaching Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    location TEXT,
    session_type TEXT CHECK(session_type IN ('classroom', 'online', 'one-on-one', 'group', 'other')) NOT NULL,
    learner_age_group TEXT,
    subject TEXT,
    objectives TEXT,
    reflection TEXT,
    feedback TEXT,
    status TEXT CHECK(status IN ('planned', 'completed', 'cancelled')) DEFAULT 'planned',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Approvals table
CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    mentor_id TEXT,
    item_type TEXT CHECK(item_type IN ('qualification', 'session', 'competency', 'application', 'other')) NOT NULL,
    item_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    feedback TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default users with plain text passwords
-- admin@gmail.com / admin123
INSERT INTO users (id, email, password, role, name) VALUES
(lower(hex(randomblob(16))), 'admin@gmail.com', 'admin123', 'admin', 'Admin User');

-- student@gmail.com / student123
INSERT INTO users (id, email, password, role, name) VALUES
(lower(hex(randomblob(16))), 'student@gmail.com', 'student123', 'student', 'Student User');

-- mentor@gmail.com / mentor123
INSERT INTO users (id, email, password, role, name) VALUES
(lower(hex(randomblob(16))), 'mentor@gmail.com', 'mentor123', 'mentor', 'Mentor User');

-- Create triggers to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS users_updated_at AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS companies_updated_at AFTER UPDATE ON companies
BEGIN
    UPDATE companies SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS jobs_updated_at AFTER UPDATE ON jobs
BEGIN
    UPDATE jobs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS applications_updated_at AFTER UPDATE ON applications
BEGIN
    UPDATE applications SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS student_profiles_updated_at AFTER UPDATE ON student_profiles
BEGIN
    UPDATE student_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS qualifications_updated_at AFTER UPDATE ON qualifications
BEGIN
    UPDATE qualifications SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sessions_updated_at AFTER UPDATE ON sessions
BEGIN
    UPDATE sessions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS approvals_updated_at AFTER UPDATE ON approvals
BEGIN
    UPDATE approvals SET updated_at = datetime('now') WHERE id = NEW.id;
END; 