/**
 * Script to preserve verification tables in the database initialization
 */

const fs = require('fs');
const path = require('path');

// Path to the init-database.js file
const initDbPath = path.join(__dirname, 'init-database.js');

try {
  // Read the file
  const content = fs.readFileSync(initDbPath, 'utf8');
  
  // Find the list of tables to keep
  const tableListRegex = /WHERE type='table' AND name NOT IN \(([^)]+)\)/;
  const match = content.match(tableListRegex);
  
  if (!match) {
    console.error('Could not find the list of tables to preserve in init-database.js');
    process.exit(1);
  }
  
  // Current list of tables
  const currentList = match[1];
  
  // Add verification tables to the list
  const updatedList = currentList.replace(
    "'sqlite_sequence', 'user_education', 'user_experience', 'qualifications'", 
    "'sqlite_sequence', 'user_education', 'user_experience', 'qualifications', 'sessions', 'activities', 'competencies', 'student_competencies', 'session_verifications', 'activity_verifications', 'competency_verifications', 'profile_verifications', 'mentor_students'"
  );
  
  // Replace the list in the content
  const updatedContent = content.replace(tableListRegex, `WHERE type='table' AND name NOT IN (${updatedList})`);
  
  // Write the updated content back to the file
  fs.writeFileSync(initDbPath, updatedContent, 'utf8');
  
  console.log('Successfully updated init-database.js to preserve verification tables');
  
} catch (error) {
  console.error('Error updating init-database.js:', error.message);
  process.exit(1);
} 