import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import UserManagementClient from './UserManagementClient';
import Database from 'better-sqlite3';
import { getLocations } from '@/app/actions';
import path from 'path';
import { User, Region, Location } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getSession();
  
  if (session?.role !== 'SUPER_ADMIN') {
    return notFound();
  }

  const dbPath = path.join(process.cwd(), 'sqlite.db');
  const db = new Database(dbPath);
  
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.role_id, u.region_id, u.location_id, u.created_at, r.name as region_name, 
           COALESCE(l.name, ev.name || ' (Event)') as location_name 
    FROM users u
    LEFT JOIN regions r ON u.region_id = r.id
    LEFT JOIN locations l ON u.location_id = l.id AND u.location_id > 0
    LEFT JOIN events ev ON (u.location_id * -1) = ev.id AND u.location_id < 0
    ORDER BY u.created_at DESC
  `).all() as (User & { region_name?: string, location_name?: string })[];

  const regions = db.prepare('SELECT * FROM regions').all() as Region[];
  const roles = db.prepare('SELECT * FROM roles ORDER BY name ASC').all();
  // getLocations strips venue_id, so we query directly here
  const locations = db.prepare('SELECT id, name, region_id, venue_id FROM locations').all() as Location[];
  
  db.close();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>System Users</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Manage administrator, dispatch, and bus incharge login access.</p>
        </div>
      </div>
      
      <UserManagementClient initialUsers={users} regions={regions} locations={locations} availableRoles={roles} />
    </div>
  );
}
