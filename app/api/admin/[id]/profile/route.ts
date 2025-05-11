import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import { getPool, runQuery, getOne } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get updated user data with profile information
    const pool = await getPool();
    const [userData] = await pool.query(
      'SELECT u.*, p.biography as bio, p.education, p.graduation_year, p.preferred_job_type, p.preferred_location, p.phone, p.secondary_email, p.social_media, p.profileImage FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?',
      [params.id]
    );

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Starting admin profile PATCH handler for id:', params.id);
    
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.log('No token provided in request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Verifying authentication token');
    const decoded = await verifyAuth(token);
    console.log('Token verification result:', decoded ? { id: decoded.id, role: decoded.role } : 'Failed');
    
    if (!decoded || decoded.id !== params.id || decoded.role.toLowerCase() !== 'admin') {
      console.log('Authorization failed, decoded role does not match admin or ID does not match params ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authorization successful, processing request body');
    const requestBody = await request.json();
    console.log('Request body:', requestBody);
    
    // We map bio from frontend to biography in the database
    const { bio, education, graduation_year, preferred_job_type, preferred_location, name, phone, secondary_email, social_media, profileImage } = requestBody;

    // Check if email is being updated
    if (secondary_email) {
      // Validate secondary email is not already in use as primary email
      const pool = await getPool();
      const [existingPrimaryEmail] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [secondary_email, params.id]
      );
      
      if (existingPrimaryEmail && (existingPrimaryEmail as any[]).length > 0) {
        console.log('Secondary email already exists as a primary email for another user');
        return NextResponse.json({ 
          error: 'Secondary email already exists as a primary email for another user' 
        }, { status: 400 });
      }
      
      // First, get the user's current secondary email
      const [currentSecEmail] = await pool.query(
        'SELECT secondary_email FROM user_profiles WHERE user_id = ?',
        [params.id]
      );
      
      // If the secondary email is the same as what they already have, skip the validation
      const currentSecondaryEmail = currentSecEmail && 
                                   (currentSecEmail as any[]).length > 0 && 
                                   (currentSecEmail as any[])[0].secondary_email;
                                   
      if (currentSecondaryEmail !== secondary_email) {
        // Only validate if they're trying to change to a different secondary email
        // Validate secondary email is not already in use by another user
        const [existingSecondaryEmail] = await pool.query(
          'SELECT user_id FROM user_profiles WHERE secondary_email = ? AND user_id != ?',
          [secondary_email, params.id]
        );
        
        if (existingSecondaryEmail && (existingSecondaryEmail as any[]).length > 0) {
          console.log('Secondary email already exists for another user');
          return NextResponse.json({ 
            error: 'Secondary email already exists for another user' 
          }, { status: 400 });
        }
      } else {
        console.log('Secondary email unchanged, skipping validation');
      }
    }
    
    // Check if phone is being updated
    if (phone) {
      // Validate phone is not already in use by another user
      const pool = await getPool();
      
      // First, get the user's current phone number
      const [currentPhoneNumber] = await pool.query(
        'SELECT phone FROM user_profiles WHERE user_id = ?',
        [params.id]
      );
      
      // If the phone number is the same as what they already have, skip the validation
      const currentPhone = currentPhoneNumber && 
                          (currentPhoneNumber as any[]).length > 0 && 
                          (currentPhoneNumber as any[])[0].phone;
                          
      if (currentPhone !== phone) {
        // Only validate if they're trying to change to a different phone number
        const [existingPhone] = await pool.query(
          'SELECT user_id FROM user_profiles WHERE phone = ? AND user_id != ?',
          [phone, params.id]
        );
        
        if (existingPhone && (existingPhone as any[]).length > 0) {
          console.log('Phone number already exists for another user');
          return NextResponse.json({ 
            error: 'Phone number already exists for another user' 
          }, { status: 400 });
        }
      } else {
        console.log('Phone number unchanged, skipping validation');
      }
    }

    // Update user table with basic name info only
    console.log('Updating users table with name');
    await runQuery(
      'UPDATE users SET name = ?, updated_at = datetime("now") WHERE id = ?',
      [name || null, params.id]
    );

    // Parse social media if it's provided as a JSON string
    let socialMediaObj = social_media;
    if (typeof social_media === 'string') {
      try {
        socialMediaObj = JSON.parse(social_media);
      } catch (error) {
        console.error('Error parsing social media JSON:', error);
      }
    }
    
    // Convert social media to JSON string for storage
    const socialMediaStr = socialMediaObj ? JSON.stringify(socialMediaObj) : null;

    // Check if profile exists
    console.log('Checking if user profile exists');
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [params.id]
    );
    console.log('Profile check result:', rows ? `Found ${(rows as any[]).length} rows` : 'No rows found');

    // Update or create user profile with additional fields
    if (rows && (rows as any[]).length > 0) {
      // Update existing profile
      console.log('Updating existing user profile');
      await runQuery(
        'UPDATE user_profiles SET biography = ?, education = ?, graduation_year = ?, preferred_job_type = ?, preferred_location = ?, phone = ?, secondary_email = ?, social_media = ?, profileImage = ? WHERE user_id = ?',
        [
          bio || null, // Store bio content in biography field
          education || null,
          graduation_year ? parseInt(graduation_year as string) : null,
          preferred_job_type || null,
          preferred_location || null,
          phone || null,
          secondary_email || null,
          socialMediaStr,
          profileImage || null,
          params.id
        ]
      );
    } else {
      // Create new profile
      console.log('Creating new user profile');
      await runQuery(
        'INSERT INTO user_profiles (user_id, biography, education, graduation_year, preferred_job_type, preferred_location, phone, secondary_email, social_media, profileImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          params.id,
          bio || null, // Store bio content in biography field
          education || null,
          graduation_year ? parseInt(graduation_year as string) : null,
          preferred_job_type || null,
          preferred_location || null,
          phone || null,
          secondary_email || null,
          socialMediaStr,
          profileImage || null
        ]
      );
    }

    // Get updated user data
    console.log('Fetching updated user data');
    const [updatedUser] = await pool.query(
      'SELECT u.*, p.biography as bio, p.education, p.graduation_year, p.preferred_job_type, p.preferred_location, p.phone, p.secondary_email, p.social_media, p.profileImage FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?',
      [params.id]
    );
    console.log('Updated user data fetched successfully');

    return NextResponse.json(updatedUser[0] || {});
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 