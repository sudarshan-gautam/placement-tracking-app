import { NextResponse } from 'next/server';
import { getOne, runQuery, findUserByEmail, User } from '@/lib/db';

// GET: Get a specific user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const user = await getOne<User>('SELECT id, email, name, role, status, created_at, updated_at FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH: Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, password, role, status, adminPassword } = await request.json();
    
    // Check if at least one field is provided
    if (!name && !email && !password && !role && !status) {
      return NextResponse.json({ message: 'No data provided for update' }, { status: 400 });
    }
    
    // Admin password is required for any user update
    if (!adminPassword) {
      return NextResponse.json({ message: 'Admin password is required' }, { status: 401 });
    }
    
    // Get admin user and verify password
    const adminUser = await findUserByEmail('admin@gmail.com');
    if (!adminUser) {
      return NextResponse.json({ message: 'Admin user not found' }, { status: 401 });
    }
    
    // Simple string comparison instead of bcrypt
    const isValidPassword = adminPassword === adminUser.password;
    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid admin password' }, { status: 401 });
    }
    
    // Check if user exists
    const user = await getOne<User>('SELECT * FROM users WHERE id = ?', [params.id]);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Check if email is already in use by another user
    if (email && email !== user.email) {
      const existingUser = await getOne('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
      }
    }
    
    // Prepare the update object
    const updates: any = {};
    
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = password; // Store password directly
    
    // Validate role if provided
    if (role && !['admin', 'mentor', 'student'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }
    if (role) updates.role = role;
    
    // Validate status if provided
    if (status && !['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }
    if (status) updates.status = status;
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    // Construct the SQL query dynamically
    const updateFields = Object.keys(updates).map(field => `${field} = ?`).join(', ');
    const updateValues = Object.values(updates);
    
    // Add the user ID to the values array
    updateValues.push(params.id);
    
    // Execute the update query
    await runQuery(`UPDATE users SET ${updateFields} WHERE id = ?`, updateValues);
    
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user', error: (error as Error).message }, { status: 500 });
  }
}

// DELETE: Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Check if user exists
    const existingUser = await getOne<User>('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Delete user
    await runQuery('DELETE FROM users WHERE id = ?', [id]);
    
    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 