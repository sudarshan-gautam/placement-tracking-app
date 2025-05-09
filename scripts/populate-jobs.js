const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Sample jobs to add to the database
const SAMPLE_JOBS = [
  {
    title: "Primary School Teacher",
    description: "Looking for passionate primary education teachers with experience in modern teaching methods.",
    location: "London, UK",
    requirements: "Bachelor degree in Education",
    salary_range: "£28,000 - £35,000",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Special Educational Needs Coordinator",
    description: "Join our team supporting students with special educational needs. Training provided.",
    location: "Manchester, UK",
    requirements: "Experience with special needs education",
    salary_range: "£22,000 - £26,000",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Mathematics Tutor",
    description: "Experienced mathematics tutor needed for evening sessions with secondary school students.",
    location: "Remote",
    requirements: "Strong mathematics background",
    salary_range: "£20/hour",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Secondary Science Teacher",
    description: "Science teacher needed for GCSE and A-level classes in a leading secondary school.",
    location: "Birmingham, UK",
    requirements: "Degree in a Science subject; PGCE or QTS",
    salary_range: "£30,000 - £40,000",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Early Years Foundation Stage Teacher",
    description: "EYFS teacher required for a friendly, supportive primary school in Leeds.",
    location: "Leeds, UK",
    requirements: "Early Childhood Education qualification",
    salary_range: "£26,000 - £32,000",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Head of Mathematics",
    description: "Lead the mathematics department in a high-performing secondary school.",
    location: "Birmingham, UK",
    requirements: "Minimum 5 years teaching experience in Mathematics",
    salary_range: "£42,000 - £50,000",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "English Teacher - Sixth Form Specialist",
    description: "English specialist to teach A-level and prepare students for university applications.",
    location: "Leeds, UK",
    requirements: "Experience teaching A-level English Literature",
    salary_range: "£32,000 - £42,000",
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Director of Sixth Form",
    description: "Strategic leadership role to oversee the school's sixth form provision.",
    location: "Edinburgh, UK",
    requirements: "Senior leadership experience in secondary education",
    salary_range: "£50,000 - £60,000",
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Teaching Assistant",
    description: "Support teachers in delivering lessons and assisting students with special needs.",
    location: "Birmingham, UK",
    requirements: "Experience working with children",
    salary_range: "£18,000 - £22,000",
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Learning Mentor",
    description: "Provide academic and pastoral support to students requiring additional assistance.",
    location: "Liverpool, UK", 
    requirements: "Experience in mentoring or counseling",
    salary_range: "£20,000 - £25,000",
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "ICT Teacher",
    description: "Teach Information and Communications Technology from KS3 to GCSE level.",
    location: "Manchester, UK",
    requirements: "Computer Science or IT qualification",
    salary_range: "£28,000 - £36,000",
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "School Business Manager",
    description: "Oversee financial management, HR, and administration for a growing primary school.",
    location: "London, UK",
    requirements: "Experience in school administration or business management",
    salary_range: "£35,000 - £45,000",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Physical Education Teacher",
    description: "Teach PE across all key stages and coordinate extracurricular sports activities.",
    location: "Glasgow, UK",
    requirements: "PE teaching qualification",
    salary_range: "£26,000 - £34,000",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Music Teacher",
    description: "Teach music theory and practice, and coordinate school performances and events.",
    location: "Cardiff, UK",
    requirements: "Music degree and teaching qualification",
    salary_range: "£27,000 - £35,000",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Modern Foreign Languages Teacher",
    description: "Teach French and Spanish to students from Year 7 to GCSE level.",
    location: "Bristol, UK",
    requirements: "Fluency in French and Spanish, teaching qualification",
    salary_range: "£28,000 - £38,000",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Special Education Assistant",
    description: "Support children with special educational needs in mainstream classroom settings.",
    location: "Manchester, UK",
    requirements: "SEN experience or qualification",
    salary_range: "£19,000 - £24,000",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "School Librarian",
    description: "Manage the school library, promote reading, and support literacy across the curriculum.",
    location: "Edinburgh, UK",
    requirements: "Library qualification or experience",
    salary_range: "£22,000 - £28,000",
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "School Counselor",
    description: "Provide counseling services to students experiencing emotional or behavioral difficulties.",
    location: "London, UK",
    requirements: "Counseling qualification and experience working with young people",
    salary_range: "£30,000 - £40,000",
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Art and Design Teacher",
    description: "Teach Art and Design from KS3 to A-level, inspiring creativity and artistic expression.",
    location: "Newcastle, UK",
    requirements: "Art degree and teaching qualification",
    salary_range: "£28,000 - £36,000",
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    title: "Geography Teacher",
    description: "Teach Geography up to A-level standard in a high-achieving secondary school.",
    location: "Leeds, UK",
    requirements: "Geography degree and teaching qualification",
    salary_range: "£29,000 - £38,000",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  }
];

async function populateJobs() {
  try {
    console.log('Starting job population...');
    
    // Open database connection
    const dbPath = path.resolve('./database.sqlite');
    console.log('Database file exists at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Check current job count
    const jobCount = await db.get("SELECT COUNT(*) as count FROM jobs");
    console.log(`Current jobs count: ${jobCount.count}`);
    
    // Add sample jobs
    console.log('Adding sample jobs...');
    const insertStmt = `
      INSERT INTO jobs (
        id, 
        title, 
        description, 
        location, 
        requirements, 
        salary_range, 
        deadline, 
        status, 
        created_at, 
        updated_at
      ) VALUES (
        lower(hex(randomblob(16))), 
        ?, ?, ?, ?, ?, ?, ?, 
        datetime('now'), 
        datetime('now')
      )
    `;
    
    let addedCount = 0;
    for (const job of SAMPLE_JOBS) {
      try {
        await db.run(insertStmt, [
          job.title,
          job.description,
          job.location,
          job.requirements,
          job.salary_range,
          job.deadline,
          job.status
        ]);
        addedCount++;
      } catch (err) {
        console.error(`Error adding job "${job.title}":`, err);
      }
    }
    
    // Verify new job count
    const newJobCount = await db.get("SELECT COUNT(*) as count FROM jobs");
    console.log(`New jobs count: ${newJobCount.count}`);
    console.log(`Successfully added ${addedCount} jobs`);
    
    await db.close();
    console.log('Job population completed successfully!');
    
  } catch (error) {
    console.error('Error populating jobs:', error);
  }
}

// Run the populate function
populateJobs(); 