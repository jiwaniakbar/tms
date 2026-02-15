'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';
import path from 'path';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role_id = formData.get('role_id') ? Number(formData.get('role_id')) : null;
  const region_id = formData.get('region_id') ? Number(formData.get('region_id')) : null;
  const location_id = formData.get('location_id') ? Number(formData.get('location_id')) : null;

  if (!name || !email || !password || !role_id) {
    throw new Error('Name, Email, Password, and Role are required fields.');
  }

  const db = getDb();

  try {
    const password_hash = bcrypt.hashSync(password, 10);
    
    const roleRow = db.prepare('SELECT name FROM roles WHERE id = ?').get(role_id) as any;
    const legacyRoleString = roleRow ? roleRow.name.toUpperCase().replace(' ', '_') : 'VOLUNTEER';
    
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, role_id, region_id, location_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(name, email, password_hash, legacyRoleString, role_id, region_id, location_id);
    revalidatePath('/settings/users');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user');
  }
}

export async function deleteUser(id: number) {
  const db = getDb();
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    revalidatePath('/settings/users');
    return { success: true };
  } catch(error) {
    throw new Error('Failed to delete user');
  }
}

export async function updateUser(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role_id = formData.get('role_id') ? Number(formData.get('role_id')) : null;
  const region_id = formData.get('region_id') ? Number(formData.get('region_id')) : null;
  const location_id = formData.get('location_id') ? Number(formData.get('location_id')) : null;

  if (!name || !email || !role_id) {
    throw new Error('Name, Email, and Role are required fields.');
  }

  const db = getDb();

  try {
    const roleRow = db.prepare('SELECT name FROM roles WHERE id = ?').get(role_id) as any;
    const legacyRoleString = roleRow ? roleRow.name.toUpperCase().replace(' ', '_') : 'VOLUNTEER';
    
    if (password) {
      const password_hash = bcrypt.hashSync(password, 10);
      const stmt = db.prepare(`
        UPDATE users 
        SET name = ?, email = ?, password_hash = ?, role = ?, role_id = ?, region_id = ?, location_id = ?
        WHERE id = ?
      `);
      stmt.run(name, email, password_hash, legacyRoleString, role_id, region_id, location_id, id);
    } else {
      const stmt = db.prepare(`
        UPDATE users 
        SET name = ?, email = ?, role = ?, role_id = ?, region_id = ?, location_id = ?
        WHERE id = ?
      `);
      stmt.run(name, email, legacyRoleString, role_id, region_id, location_id, id);
    }
    
    revalidatePath('/settings/users');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user');
  }
}
