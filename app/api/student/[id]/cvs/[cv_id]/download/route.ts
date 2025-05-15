import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool } from '@/lib/db';
import puppeteer from 'puppeteer';

// Download CV as PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, cv_id: string } }
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

    // Get the CV data
    const pool = await getPool();
    const [cvs] = await pool.query(
      `SELECT 
        sc.id, sc.name, sc.html_content, sc.content
      FROM student_cvs sc
      WHERE sc.id = ? AND sc.student_id = ?`,
      [params.cv_id, params.id]
    );

    if (!cvs || cvs.length === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const cv = cvs[0];
    
    // Parse content if it's a JSON string
    let contentObj = {};
    try {
      if (typeof cv.content === 'string') {
        contentObj = JSON.parse(cv.content);
      } else if (typeof cv.content === 'object') {
        contentObj = cv.content;
      }
    } catch (error) {
      console.error('Error parsing CV content:', error);
    }
    
    // Generate fallback HTML if the HTML content is missing or just contains placeholder text
    const isHtmlContentEmpty = !cv.html_content || 
                              cv.html_content.includes('CV content will appear here') ||
                              cv.html_content.includes('Your CV content will appear here');
    
    let finalHtmlContent = cv.html_content;
    
    if (isHtmlContentEmpty && contentObj && typeof contentObj === 'object') {
      // Generate HTML from content object
      const personal = contentObj.personal || {};
      
      finalHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <header style="text-align: center; margin-bottom: 20px;">
            <h1 style="margin-bottom: 5px;">${personal.name || 'Your Name'}</h1>
            <p style="margin: 0; color: #666;">${personal.title || 'Professional Title'}</p>
            <p style="margin: 5px 0; color: #666;">
              ${personal.email || 'email@example.com'} | 
              ${personal.phone || '(123) 456-7890'} | 
              ${personal.location || 'City, Country'}
            </p>
          </header>
          
          <section style="margin-bottom: 20px;">
            <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Summary</h2>
            <p>${personal.summary || 'Professional summary goes here.'}</p>
          </section>
      `;
      
      // Add education section if exists
      const education = Array.isArray(contentObj.education) ? contentObj.education : [];
      if (education.length > 0) {
        finalHtmlContent += `
          <section style="margin-bottom: 20px;">
            <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Education</h2>
            <ul style="list-style-type: none; padding: 0;">
        `;
        
        education.forEach((edu: any) => {
          finalHtmlContent += `
            <li style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between;">
                <strong>${edu.degree || 'Degree'}</strong>
                <span>${edu.year || 'Year'}</span>
              </div>
              <div>${edu.institution || 'Institution'}</div>
              <div style="font-style: italic; color: #666;">${edu.location || 'Location'}</div>
              ${edu.description ? `<p>${edu.description}</p>` : ''}
            </li>
          `;
        });
        
        finalHtmlContent += `
            </ul>
          </section>
        `;
      }
      
      // Add experience section if exists
      const experience = Array.isArray(contentObj.experience) ? contentObj.experience : [];
      if (experience.length > 0) {
        finalHtmlContent += `
          <section style="margin-bottom: 20px;">
            <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Experience</h2>
            <ul style="list-style-type: none; padding: 0;">
        `;
        
        experience.forEach((exp: any) => {
          finalHtmlContent += `
            <li style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between;">
                <strong>${exp.title || 'Job Title'}</strong>
                <span>${exp.period || 'Time Period'}</span>
              </div>
              <div>${exp.company || 'Company'}${exp.location ? `, ${exp.location}` : ''}</div>
              ${exp.description ? `<p>${exp.description}</p>` : ''}
            </li>
          `;
        });
        
        finalHtmlContent += `
            </ul>
          </section>
        `;
      }
      
      // Add skills section if exists
      const skills = Array.isArray(contentObj.skills) ? contentObj.skills : [];
      if (skills.length > 0) {
        finalHtmlContent += `
          <section style="margin-bottom: 20px;">
            <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Skills</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
        `;
        
        skills.forEach((skill: any) => {
          finalHtmlContent += `
            <span style="background-color: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 0.9em;">
              ${skill.name || 'Skill'}
            </span>
          `;
        });
        
        finalHtmlContent += `
            </div>
          </section>
        `;
      }
      
      // Add projects section if exists
      const projects = Array.isArray(contentObj.projects) ? contentObj.projects : [];
      if (projects.length > 0) {
        finalHtmlContent += `
          <section style="margin-bottom: 20px;">
            <h2 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Projects</h2>
            <ul style="list-style-type: none; padding: 0;">
        `;
        
        projects.forEach((project: any) => {
          finalHtmlContent += `
            <li style="margin-bottom: 10px;">
              <strong>${project.name || 'Project Name'}</strong>
              ${project.description ? `<p>${project.description}</p>` : ''}
            </li>
          `;
        });
        
        finalHtmlContent += `
            </ul>
          </section>
        `;
      }
      
      finalHtmlContent += `
        </div>
      `;
    }
    
    // If we still don't have valid HTML content, provide a default template
    if (!finalHtmlContent || finalHtmlContent.trim() === '') {
      finalHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center;">
          <h1 style="color: #333;">CV Content</h1>
          <p style="color: #666; font-size: 16px;">This CV appears to be empty or incomplete. Please edit your CV and try downloading again.</p>
        </div>
      `;
    }
    
    // Add CSS styling to make the CV look better
    const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.5;
            background-color: white;
          }
          h1, h2, h3 {
            color: #2563eb;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          section {
            margin-bottom: 1.5rem;
          }
          section h2 {
            font-size: 18px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          ul {
            padding-left: 20px;
            list-style-type: none;
          }
          .contact-info {
            text-align: center;
            color: #4b5563;
            font-size: 14px;
          }
          .section-content {
            padding-left: 1rem;
          }
          .job-title {
            font-weight: bold;
          }
          .date-range {
            color: #6b7280;
            font-size: 0.9rem;
          }
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .skill-tag {
            background-color: #f3f4f6;
            border-radius: 15px;
            padding: 4px 12px;
            font-size: 13px;
          }
          p {
            margin: 0.5rem 0;
          }
          li {
            margin-bottom: 0.5rem;
          }
        </style>
      </head>
      <body>
        ${finalHtmlContent}
      </body>
      </html>
    `;

    // Generate PDF from HTML
    let browser;
    try {
      console.log('Launching browser for PDF generation');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set the viewport size
      await page.setViewport({
        width: 1024,
        height: 1280,
        deviceScaleFactor: 1,
      });
      
      console.log('Setting page content');
      // Set the HTML content of the page with a longer timeout
      await page.setContent(styledHtml, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Add additional page settings
      await page.emulateMediaType('screen');
      
      console.log('Generating PDF');
      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
      });
      
      console.log('PDF generated successfully');
      
      // Return the PDF as a response
      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${cv.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`
        }
      });
    } catch (error) {
      console.error('Error in PDF generation:', error);
      return NextResponse.json({ error: 'Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
    } finally {
      // Ensure browser is closed even if there's an error
      if (browser) {
        console.log('Closing browser');
        await browser.close();
      }
    }
  } catch (error) {
    console.error('Error generating CV PDF:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
} 