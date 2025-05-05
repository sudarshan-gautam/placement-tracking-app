'use client';

export interface UserProfile {
  id: number;
  name: string;
  role: 'student' | 'mentor' | 'admin';
  email: string;
  avatar?: string;
  graduationYear?: number;
  degree?: string;
  skills: string[];
  interests: string[];
  experience: {
    title: string;
    organization: string;
    duration: string;
    description: string;
  }[];
  qualifications: {
    title: string;
    institution: string;
    year: number;
    grade?: string;
  }[];
  biography?: string;
  preferredLocations?: string[];
  preferredJobTypes?: string[];
}

// Sample user profiles with different backgrounds and skill sets
export const userProfiles: UserProfile[] = [
  // Education Students
  {
    id: 1,
    name: 'Emma Wilson',
    role: 'student',
    email: 'emma.wilson@student.edu',
    avatar: '/avatars/emma.png',
    graduationYear: 2023,
    degree: 'Bachelor of Education (Primary)',
    skills: ['Classroom Management', 'Curriculum Planning', 'Assessment', 'Communication', 'Differentiated Instruction'],
    interests: ['Primary Education', 'Literacy', 'Educational Technology', 'Inclusive Education'],
    experience: [
      {
        title: 'Teaching Assistant (Placement)',
        organization: 'Hillside Primary School',
        duration: 'Jan 2023 - Apr 2023',
        description: 'Supported Year 2 class teacher with lesson delivery, small group interventions, and classroom management.'
      },
      {
        title: 'Volunteer Reading Mentor',
        organization: 'City Library',
        duration: 'Sep 2021 - Jun 2022',
        description: 'Led weekly reading sessions with children aged 6-8 to develop literacy skills and love of reading.'
      }
    ],
    qualifications: [
      {
        title: 'Bachelor of Education (Primary)',
        institution: 'University of Manchester',
        year: 2023,
        grade: 'First Class Honours (Expected)'
      },
      {
        title: 'A-Levels',
        institution: 'Manchester Academy',
        year: 2019,
        grade: 'ABB in English, Psychology, History'
      }
    ],
    biography: 'Final year education student passionate about creating engaging learning environments for primary-aged children. Particularly interested in literacy development and inclusive education approaches.',
    preferredLocations: ['Manchester, UK', 'Liverpool, UK', 'Leeds, UK'],
    preferredJobTypes: ['Full-time', 'Part-time']
  },
  {
    id: 2,
    name: 'James Chen',
    role: 'student',
    email: 'james.chen@student.edu',
    avatar: '/avatars/james.png',
    graduationYear: 2023,
    degree: 'PGCE Secondary Science',
    skills: ['Science Education', 'Laboratory Management', 'GCSE Preparation', 'Practical Demonstrations', 'Assessment'],
    interests: ['Physics Education', 'STEM Outreach', 'Educational Research', 'Technology in Science Teaching'],
    experience: [
      {
        title: 'Science Teacher Trainee',
        organization: 'Oakridge Academy',
        duration: 'Sep 2022 - Present',
        description: 'Teaching Physics, Chemistry and Biology at KS3 and KS4 levels. Planning and delivering engaging science lessons with practical components.'
      },
      {
        title: 'Research Assistant',
        organization: 'University Physics Department',
        duration: 'Jun 2021 - Aug 2022',
        description: 'Assisted with laboratory experiments and data analysis for departmental research projects.'
      }
    ],
    qualifications: [
      {
        title: 'PGCE Secondary Science',
        institution: 'University College London',
        year: 2023,
        grade: 'In Progress'
      },
      {
        title: 'BSc Physics',
        institution: 'Imperial College London',
        year: 2021,
        grade: '2:1'
      }
    ],
    biography: 'Science graduate transitioning to teaching through PGCE program. Passionate about making science accessible and engaging for all students through hands-on learning experiences.',
    preferredLocations: ['London, UK', 'Cambridge, UK', 'Oxford, UK'],
    preferredJobTypes: ['Full-time']
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    role: 'student',
    email: 'sarah.johnson@student.edu',
    avatar: '/avatars/sarah.png',
    graduationYear: 2022,
    degree: 'BA Early Childhood Studies',
    skills: ['Early Years Foundation Stage', 'Child Development', 'Play-based Learning', 'Observation', 'Safeguarding'],
    interests: ['Early Intervention', 'Child Psychology', 'Outdoor Learning', 'Parental Engagement'],
    experience: [
      {
        title: 'Nursery Practitioner',
        organization: 'Little Learners Nursery',
        duration: 'Sep 2022 - Present',
        description: 'Working with children aged 2-4 years, planning activities aligned with EYFS framework and conducting observations of child development.'
      },
      {
        title: 'Placement Student',
        organization: 'Sunshine Day Care',
        duration: 'Jan 2022 - May 2022',
        description: 'Completed final year placement supporting the delivery of early years provision and implementing learning through play activities.'
      }
    ],
    qualifications: [
      {
        title: 'BA Early Childhood Studies',
        institution: 'University of Bristol',
        year: 2022,
        grade: '2:1'
      },
      {
        title: 'Level 3 Diploma in Childcare',
        institution: 'Bristol College',
        year: 2019
      }
    ],
    biography: 'Early years educator with a strong belief in the importance of child-led learning and creating enabling environments. Seeking progression into early years leadership roles.',
    preferredLocations: ['Bristol, UK', 'Bath, UK', 'Cardiff, UK'],
    preferredJobTypes: ['Full-time', 'Part-time']
  },
  
  // Teaching Support Graduates
  {
    id: 4,
    name: 'Mohammed Ali',
    role: 'student',
    email: 'mohammed.ali@student.edu',
    avatar: '/avatars/mohammed.png',
    graduationYear: 2023,
    degree: 'Foundation Degree in Supporting Teaching and Learning',
    skills: ['Student Support', 'Classroom Assistance', 'SEN Support', 'Behavior Management', 'Administrative Support'],
    interests: ['Special Educational Needs', 'Inclusive Practices', 'Behavior Intervention', 'Educational Psychology'],
    experience: [
      {
        title: 'Teaching Assistant (Part-time)',
        organization: 'Greenfield Primary School',
        duration: 'Jan 2022 - Present',
        description: 'Supporting students with diverse learning needs, assisting class teacher with resources and providing targeted interventions for struggling readers.'
      },
      {
        title: 'Youth Worker',
        organization: 'Community Center',
        duration: 'Jun 2020 - Dec 2021',
        description: 'Planned and delivered after-school activities for children aged 8-13, focusing on team building and social skills development.'
      }
    ],
    qualifications: [
      {
        title: 'Foundation Degree in Supporting Teaching and Learning',
        institution: 'Birmingham City University',
        year: 2023,
        grade: 'Distinction (Expected)'
      },
      {
        title: 'Level 3 Supporting Teaching and Learning in Schools',
        institution: 'Birmingham College',
        year: 2021
      }
    ],
    biography: 'Dedicated teaching assistant with particular interest in supporting children with additional needs. Committed to creating inclusive learning environments where all children can thrive.',
    preferredLocations: ['Birmingham, UK', 'Coventry, UK', 'Wolverhampton, UK'],
    preferredJobTypes: ['Full-time', 'Part-time']
  },
  {
    id: 5,
    name: 'Priya Patel',
    role: 'student',
    email: 'priya.patel@student.edu',
    avatar: '/avatars/priya.png',
    graduationYear: 2022,
    degree: 'BA Education Studies',
    skills: ['Mentoring', 'Behavior Management', 'Relationship Building', 'Intervention Planning', 'Student Support'],
    interests: ['Alternative Education', 'Youth Engagement', 'Mental Health Support', 'Educational Sociology'],
    experience: [
      {
        title: 'Learning Mentor',
        organization: 'Phoenix Secondary School',
        duration: 'Sep 2022 - Present',
        description: 'Supporting vulnerable students in improving attendance, behavior and academic engagement through one-to-one and small group mentoring.'
      },
      {
        title: 'Education Support Volunteer',
        organization: 'Refugee Support Network',
        duration: 'Jan 2021 - Jul 2022',
        description: 'Provided educational support to young refugees and asylum seekers, helping with homework and English language development.'
      }
    ],
    qualifications: [
      {
        title: 'BA Education Studies',
        institution: 'Liverpool Hope University',
        year: 2022,
        grade: '2:1'
      },
      {
        title: 'Level 3 Counselling Skills',
        institution: 'Online Academy',
        year: 2021
      }
    ],
    biography: 'Education graduate with strong commitment to supporting young people facing barriers to education. Particularly interested in the intersection of education and social justice.',
    preferredLocations: ['Liverpool, UK', 'Manchester, UK', 'Preston, UK'],
    preferredJobTypes: ['Full-time']
  },
  
  // Higher Education Specialists
  {
    id: 6,
    name: 'Dr. Thomas Reynolds',
    role: 'student',
    email: 'thomas.reynolds@student.edu',
    avatar: '/avatars/thomas.png',
    graduationYear: 2021,
    degree: 'PhD Computer Science',
    skills: ['Computer Science', 'Teaching', 'Research', 'Software Engineering', 'AI/Machine Learning'],
    interests: ['Educational Technology', 'Computer Science Education', 'AI Applications', 'Remote Learning'],
    experience: [
      {
        title: 'Associate Lecturer',
        organization: 'Metropolitan University',
        duration: 'Sep 2021 - Present',
        description: 'Teaching undergraduate modules in programming and software development. Supporting students with projects and providing feedback on assessments.'
      },
      {
        title: 'Research Assistant',
        organization: 'University of Northern England',
        duration: 'Sep 2018 - Aug 2021',
        description: 'Conducted research in machine learning applications while completing PhD. Published three papers in peer-reviewed journals.'
      }
    ],
    qualifications: [
      {
        title: 'PhD Computer Science',
        institution: 'University of Northern England',
        year: 2021
      },
      {
        title: 'MSc Computer Science',
        institution: 'University of Leeds',
        year: 2018,
        grade: 'Distinction'
      },
      {
        title: 'BSc Computer Science',
        institution: 'University of Leeds',
        year: 2017,
        grade: 'First Class Honours'
      }
    ],
    biography: 'Computer scientist transitioning from industry to academia. Passionate about teaching programming and developing innovative approaches to computer science education.',
    preferredLocations: ['Manchester, UK', 'Leeds, UK', 'Sheffield, UK'],
    preferredJobTypes: ['Full-time', 'Part-time']
  },
  {
    id: 7,
    name: 'Elena Kowalski',
    role: 'student',
    email: 'elena.kowalski@student.edu',
    avatar: '/avatars/elena.png',
    graduationYear: 2020,
    degree: 'PhD Economics',
    skills: ['Economics', 'Research', 'Academic Leadership', 'Grant Writing', 'Statistical Analysis'],
    interests: ['Behavioral Economics', 'Economic Education', 'Public Policy', 'International Development'],
    experience: [
      {
        title: 'Postdoctoral Researcher',
        organization: 'London School of Economics',
        duration: 'Jan 2021 - Present',
        description: 'Conducting independent research in behavioral economics and collaborating on department-wide research initiatives. Teaching undergraduate seminars.'
      },
      {
        title: 'Teaching Fellow',
        organization: 'University College London',
        duration: 'Sep 2018 - Dec 2020',
        description: 'Delivered lectures and seminars for undergraduate economics courses while completing PhD research.'
      }
    ],
    qualifications: [
      {
        title: 'PhD Economics',
        institution: 'University College London',
        year: 2020
      },
      {
        title: 'MSc Economics',
        institution: 'London School of Economics',
        year: 2016,
        grade: 'Distinction'
      },
      {
        title: 'BSc Economics',
        institution: 'University of Warsaw',
        year: 2015,
        grade: 'First Class'
      }
    ],
    biography: 'Research economist with teaching experience and publications in leading journals. Seeking to transition to a permanent academic position focused on economic education and research.',
    preferredLocations: ['London, UK', 'Oxford, UK', 'Cambridge, UK'],
    preferredJobTypes: ['Full-time']
  },
  
  // Physical Education Specialists
  {
    id: 8,
    name: 'Marcus Johnson',
    role: 'student',
    email: 'marcus.johnson@student.edu',
    avatar: '/avatars/marcus.png',
    graduationYear: 2023,
    degree: 'BSc Sports Science with QTS',
    skills: ['Sports Coaching', 'Physical Education', 'Event Organization', 'Team Leadership', 'Assessment'],
    interests: ['Sport Psychology', 'Athletic Development', 'Inclusive PE', 'Outdoor Education'],
    experience: [
      {
        title: 'PE Teacher Trainee',
        organization: 'Westside Secondary School',
        duration: 'Sep 2022 - Present',
        description: 'Teaching PE across all key stages as part of final placement. Coaching school football and athletics teams and helping organize sports day events.'
      },
      {
        title: 'Sports Coach',
        organization: 'Community Sports Foundation',
        duration: 'Jun 2020 - Aug 2022',
        description: 'Part-time coach delivering football, basketball and athletics sessions for children aged 7-14 in after-school and holiday programs.'
      }
    ],
    qualifications: [
      {
        title: 'BSc Sports Science with QTS',
        institution: 'Liverpool John Moores University',
        year: 2023,
        grade: '2:1 (Expected)'
      },
      {
        title: 'FA Level 2 Coaching Certificate',
        institution: 'Football Association',
        year: 2021
      },
      {
        title: 'First Aid Certification',
        institution: 'St John Ambulance',
        year: 2022
      }
    ],
    biography: 'Trainee PE teacher with coaching experience across multiple sports. Committed to promoting physical activity for all students regardless of ability level and using sport to build confidence and character.',
    preferredLocations: ['Liverpool, UK', 'Manchester, UK', 'Chester, UK'],
    preferredJobTypes: ['Full-time']
  },
  {
    id: 9,
    name: 'Kayla Williams',
    role: 'student',
    email: 'kayla.williams@student.edu',
    avatar: '/avatars/kayla.png',
    graduationYear: 2021,
    degree: 'BSc Sport Coaching',
    skills: ['Athletics Coaching', 'Competition Organization', 'Talent Development', 'Performance Analysis', 'Physical Education'],
    interests: ['Elite Sport Development', 'Athletic Performance', 'Sports Psychology', 'Youth Coaching'],
    experience: [
      {
        title: 'Athletics Coach',
        organization: 'Regional Athletics Academy',
        duration: 'Jan 2022 - Present',
        description: 'Coaching junior athletes in sprints and jumps. Developing training programs and supporting athletes in regional and national competitions.'
      },
      {
        title: 'PE Teaching Assistant',
        organization: 'Hillcrest School',
        duration: 'Sep 2021 - Dec 2021',
        description: 'Supported PE department with lesson delivery and extracurricular activities, focusing on athletics and basketball programs.'
      }
    ],
    qualifications: [
      {
        title: 'BSc Sport Coaching',
        institution: 'Cardiff Metropolitan University',
        year: 2021,
        grade: 'First Class Honours'
      },
      {
        title: 'UK Athletics Level 2 Coach',
        institution: 'UK Athletics',
        year: 2020
      },
      {
        title: 'Performance Analysis Certificate',
        institution: 'Sports Coach UK',
        year: 2022
      }
    ],
    biography: 'Former competitive athlete transitioning to coaching and teaching. Experienced in developing young talent and passionate about creating pathways for athletes to reach their potential.',
    preferredLocations: ['Cardiff, UK', 'Bristol, UK', 'Swansea, UK'],
    preferredJobTypes: ['Full-time', 'Part-time']
  },
  
  // Education Technology Specialist
  {
    id: 10,
    name: 'Daniel Foster',
    role: 'student',
    email: 'daniel.foster@student.edu',
    avatar: '/avatars/daniel.png',
    graduationYear: 2022,
    degree: 'MSc Educational Technology',
    skills: ['Digital Learning', 'Teacher Training', 'Learning Platforms', 'Resource Development', 'Instructional Design'],
    interests: ['Blended Learning', 'EdTech Innovation', 'Digital Accessibility', 'Online Assessment'],
    experience: [
      {
        title: 'Digital Learning Specialist',
        organization: 'Educational Publishing Company',
        duration: 'Sep 2022 - Present',
        description: 'Developing digital learning resources and providing consultation to schools on technology implementation. Delivering teacher training on effective use of digital tools.'
      },
      {
        title: 'Technology Integration Coach',
        organization: 'International School',
        duration: 'Jan 2020 - Aug 2022',
        description: 'Supported teachers in implementing technology-enhanced learning experiences. Managed the school\'s learning management system and provided technical training.'
      }
    ],
    qualifications: [
      {
        title: 'MSc Educational Technology',
        institution: 'University College London',
        year: 2022,
        grade: 'Distinction'
      },
      {
        title: 'BSc Computer Science',
        institution: 'University of Cambridge',
        year: 2018,
        grade: '2:1'
      },
      {
        title: 'Google Certified Educator Level 2',
        institution: 'Google',
        year: 2021
      }
    ],
    biography: 'Educational technologist with a background in computer science and classroom experience. Passionate about empowering educators to effectively integrate technology to enhance teaching and learning.',
    preferredLocations: ['Cambridge, UK', 'London, UK', 'Oxford, UK'],
    preferredJobTypes: ['Full-time', 'Remote']
  }
];

export default userProfiles; 