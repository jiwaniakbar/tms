'use server';

import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { getRolePermissions } from '@/lib/rbac-server';
import { cookies } from 'next/headers';
import path from 'path';
import { redirect } from 'next/navigation';

export async function authenticate(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return 'Email and password must be provided.';
  }

  let sessionToken = null;
  let userRole = null;

  try {
    const db = getDb();
    
    // Find the user
    // Find the user from the dedicated users table
    const stmt = db.prepare('SELECT id, role, role_id, password_hash, name, region_id, location_id FROM users WHERE email = ?');
    const user = stmt.get(email) as any;

    if (!user) {
      return 'Invalid credentials.';
    }

    if (!user.password_hash) {
      return 'Account requires administrator password reset.';
    }

    // Verify Password
    const passwordsMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordsMatch) {
      return 'Invalid credentials.';
    }

        // Fetch RBAC Permissions if role_id exists
    let permissions = {};
    if (user.role_id) {
       permissions = await getRolePermissions(user.role_id);
    }

    // Generate JWT
    const payload = { 
      id: user.id, 
      role: user.role, 
      role_id: user.role_id,
      name: user.name,
      region_id: user.region_id,
      location_id: user.location_id,
      permissions
    };
    
    sessionToken = await encrypt(payload);
    userRole = user.role;

  } catch (error: any) {
    console.error('Login Error:', error?.message || error);
    return 'Database error occurred. Please contact an administrator.';
  }

  // Set Cookie and Redirect OUTSIDE try/catch so Next can intercept the thrown NEXT_REDIRECT error
  if (sessionToken) {
    (await cookies()).set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    // Redirect based on role
    // SUPER_ADMIN / COMMAND_CENTER -> /dashboard
    // REGION_ADMIN -> /manage-trips
    // BUS_INCHARGE / VOLUNTEER -> /my-location-trips
    switch (userRole) {
      case 'REGION_ADMIN':
        redirect('/manage-trips');
        break;
      case 'BUS_INCHARGE':
      case 'VOLUNTEER':
        redirect('/my-location-trips');
        break;
      case 'SUPER_ADMIN':
      case 'COMMAND_CENTER':
      default:
        redirect('/dashboard');
        break;
    }
  }

  return 'Unknown error during token generation';
}

export async function logout() {
  (await cookies()).set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });
  redirect('/login');
}
