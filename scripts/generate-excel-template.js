const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create sample data
const sampleData = [
  { name: 'John Doe', email: 'john.doe@example.com', role: 'student', status: 'active', password: 'password123' },
  { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'mentor', status: 'active', password: 'password123' },
  { name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', password: 'password123' },
  { name: 'Robert Johnson', email: 'robert.johnson@example.com', role: 'student', status: 'pending', password: 'password123' },
  { name: 'Mary Williams', email: 'mary.williams@example.com', role: 'mentor', status: 'inactive', password: 'password123' }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert data to worksheet
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

// Make sure the directory exists
const outputDir = path.join(__dirname, '..', 'public', 'templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write to file
const outputPath = path.join(outputDir, 'user_import_template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Excel template created successfully at: ${outputPath}`); 