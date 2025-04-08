-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS placement_tracking;
USE placement_tracking;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'mentor', 'student') NOT NULL,
    name VARCHAR(255) NOT NULL,
    profileImage VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Job Posts table
CREATE TABLE IF NOT EXISTS job_posts (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    deadline DATE,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    job_post_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    resume_url VARCHAR(255),
    cover_letter TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Student Profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    course VARCHAR(255) NOT NULL,
    graduation_year INT,
    cgpa DECIMAL(4,2),
    skills TEXT,
    projects TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default users with bcrypt hashed passwords
-- admin@gmail.com / admin123
INSERT INTO users (id, email, password, role, name) VALUES
(UUID(), 'admin@gmail.com', '$2b$10$864VLRtHZ5KDE68oUymnaesPcEY6.I85bwRI9kQeDRa4H/eC57586', 'admin', 'Admin User');

-- student@gmail.com / student123
INSERT INTO users (id, email, password, role, name) VALUES
(UUID(), 'student@gmail.com', '$2b$10$MlxnN8rXUaouMLMtBKvks.y//QghLHKPp/ve3653CYyum6wzN1vQS', 'student', 'Student User');

-- mentor@gmail.com / mentor123
INSERT INTO users (id, email, password, role, name) VALUES
(UUID(), 'mentor@gmail.com', '$2b$10$Pae6vFwnnqc8kPL.nX/ScewIjKHkLH6v3Ki6f2VZXQisJNQVcV0gG', 'mentor', 'Mentor User'); 