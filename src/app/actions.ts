'use server';

import { getDb, Profile, Vehicle, Trip, TripSubStatus } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { writeFile } from 'fs/promises';
import path from 'path';

function calculateAge(dobStr: string): number | null {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

async function savePhoto(photo: File | null): Promise<string | undefined> {
  if (!photo || photo.size === 0) return undefined;

  const bytes = await photo.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = photo.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

  await writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

import bcrypt from 'bcryptjs';
export async function createProfile(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const dob = formData.get('dob') as string;
  const bio = formData.get('bio') as string;
  const photo = formData.get('photo') as File | null;
  const is_driver = formData.get('is_driver') ? 1 : 0;
  const alternate_phone = formData.get('alternate_phone') as string;

  const age = calculateAge(dob);
  const photo_url = await savePhoto(photo);

  const stmt = getDb().prepare(`
    INSERT INTO profiles (name, email, phone, dob, age, bio, photo_url, is_driver, alternate_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    stmt.run(name, email || null, phone, dob || null, age, bio || null, photo_url || null, is_driver, alternate_phone || null);
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error('Email already exists');
    }
    throw err;
  }

  revalidatePath('/');
  redirect('/');
}

export async function createQuickProfile(name: string, phone: string, alternate_phone?: string): Promise<{ success: boolean; id?: number; error?: string; phone?: string; alternate_phone?: string }> {
  try {
    const stmt = getDb().prepare(`
      INSERT INTO profiles (name, phone, alternate_phone)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(name, phone, alternate_phone || null);

    // Invalidate everything so the SearchableSelects pick up the new option
    revalidatePath('/trips/create');
    revalidatePath('/trips/[id]/edit', 'page');
    revalidatePath('/trips');

    return { success: true, id: Number(result.lastInsertRowid), phone, alternate_phone };
  } catch (err: any) {
    console.error("Delete trip error", err);
    return { success: false, error: err.message };
  }
}

export async function updateQuickProfile(id: number, name: string, phone: string, alternate_phone?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stmt = getDb().prepare(`
      UPDATE profiles
      SET name = ?, phone = ?, alternate_phone = ?
      WHERE id = ?
    `);
    stmt.run(name, phone, alternate_phone || null, id);

    // Invalidate everything so the SearchableSelects pick up the edited option
    revalidatePath('/trips/create');
    revalidatePath('/trips/[id]/edit', 'page');
    revalidatePath('/trips');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProfile(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const dob = formData.get('dob') as string;
  const bio = formData.get('bio') as string;
  const photo = formData.get('photo') as File | null;
  const is_driver = formData.get('is_driver') ? 1 : 0;
  const alternate_phone = formData.get('alternate_phone') as string;

  const role = formData.get('role') as string;
  const password = formData.get('password') as string;

  const age = calculateAge(dob);
  const photo_url = await savePhoto(photo);

  let password_hash = null;
  if (password) {
    password_hash = bcrypt.hashSync(password, 10);
  }

  const updates = [
    'name = @name',
    'email = @email',
    'phone = @phone',
    'dob = @dob',
    'age = @age',
    'bio = @bio',
    'is_driver = @is_driver',
    'alternate_phone = @alternate_phone'
  ];

  const params: any = {
    name,
    email: email || null,
    phone,
    dob: dob || null,
    age,
    bio: bio || null,
    is_driver,
    alternate_phone: alternate_phone || null,
    id
  };

  if (photo_url) {
    updates.push('photo_url = @photo_url');
    params.photo_url = photo_url;
  }

  if (role) {
    updates.push('role = @role');
    params.role = role;
  }

  if (password_hash) {
    updates.push('password_hash = @password_hash');
    params.password_hash = password_hash;
  }

  const stmt = getDb().prepare(`
    UPDATE profiles
    SET ${updates.join(', ')}
    WHERE id = @id
  `);

  stmt.run(params);

  revalidatePath('/');
  revalidatePath(`/profile/${id}`);
  redirect('/');
}

export async function getProfiles(search?: string): Promise<Profile[]> {
  if (search) {
    const term = `%${search}%`;
    const stmt = getDb().prepare('SELECT * FROM profiles WHERE name LIKE ? OR phone LIKE ? ORDER BY created_at DESC');
    return stmt.all(term, term) as Profile[];
  }
  const stmt = getDb().prepare('SELECT * FROM profiles ORDER BY created_at DESC');
  return stmt.all() as Profile[];
}

export async function getProfile(id: number): Promise<Profile | undefined> {
  const stmt = getDb().prepare('SELECT * FROM profiles WHERE id = ?');
  return stmt.get(id) as Profile | undefined;
}

// --- VEHICLE ACTIONS ---

export async function createVehicle(formData: FormData) {
  const type = formData.get('type') as string;
  const registration = formData.get('registration') as string;
  const capacity = Number(formData.get('capacity'));
  const make_model = formData.get('make_model') as string;
  const status = formData.get('status') as string;

  const stmt = getDb().prepare(`
    INSERT INTO vehicles (type, registration, capacity, make_model, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  try {
    stmt.run(type, registration, capacity, make_model, status);
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error('Registration number already exists');
    }
    throw err;
  }

  revalidatePath('/vehicles');
  redirect('/vehicles');
}

export async function updateVehicle(id: number, formData: FormData) {
  const type = formData.get('type') as string;
  const registration = formData.get('registration') as string;
  const capacity = Number(formData.get('capacity'));
  const make_model = formData.get('make_model') as string;
  const status = formData.get('status') as string;

  const stmt = getDb().prepare(`
    UPDATE vehicles
    SET type = ?, registration = ?, capacity = ?, make_model = ?, status = ?
    WHERE id = ?
  `);

  stmt.run(type, registration, capacity, make_model, status, id);

  revalidatePath('/vehicles');
  revalidatePath(`/vehicles/${id}`);
  redirect('/vehicles');
}

export async function getVehicles(search?: string): Promise<Vehicle[]> {
  if (search) {
    const term = `%${search}%`;
    const stmt = getDb().prepare('SELECT * FROM vehicles WHERE type LIKE ? OR registration LIKE ? OR make_model LIKE ? ORDER BY created_at DESC');
    return stmt.all(term, term, term) as Vehicle[];
  }
  const stmt = getDb().prepare('SELECT * FROM vehicles ORDER BY created_at DESC');
  return stmt.all() as Vehicle[];
}

export async function getVehicle(id: number): Promise<Vehicle | undefined> {
  const stmt = getDb().prepare('SELECT * FROM vehicles WHERE id = ?');
  return stmt.get(id) as Vehicle | undefined;
}

// --- TRIP ACTIONS ---

export type TripWithDetails = Trip & {
  volunteer_name?: string;
  volunteer_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_registration?: string;
};

export async function createTrip(formData: FormData) {
  const session = await getSession();
  if (session?.role !== 'SUPER_ADMIN' && session?.role_id) {
    const { getRolePermissions } = await import('@/lib/rbac-server');
    const permissions = await getRolePermissions(session.role_id);
    if (!permissions['trips']?.edit) {
      throw new Error('Unauthorized. You do not have permission to create trips.');
    }
  }
  const route_code = formData.get('route_code') as string;
  const origin_id = formData.get('origin_id') ? Number(formData.get('origin_id')) : null;
  const origin_venue_id = formData.get('origin_venue_id') ? Number(formData.get('origin_venue_id')) : null;
  const destination_id = formData.get('destination_id') ? Number(formData.get('destination_id')) : null;
  const destination_venue_id = formData.get('destination_venue_id') ? Number(formData.get('destination_venue_id')) : null;
  const region_id = formData.get('region_id') ? Number(formData.get('region_id')) : null;
  const start_time = formData.get('start_time') as string;
  const end_time = formData.get('end_time') as string;
  const vehicle_id = formData.get('vehicle_id') ? Number(formData.get('vehicle_id')) : null;
  const volunteer_id = formData.get('volunteer_id') ? Number(formData.get('volunteer_id')) : null;
  const driver_id = formData.get('driver_id') ? Number(formData.get('driver_id')) : null;
  const status = formData.get('status') as string || 'Planned';
  const sub_status = formData.get('sub_status') as string || 'Scheduled';
  const passengers_boarded = parseInt(formData.get('passengers_boarded') as string) || 0;
  const wheelchairs_boarded = parseInt(formData.get('wheelchairs_boarded') as string) || 0;
  const breakdown_issue = formData.get('breakdown_issue') as string || null;

  const notes = formData.get('notes') as string || null;

  const stmt = getDb().prepare('INSERT INTO trips (route_code, origin_id, destination_id, origin_venue_id, destination_venue_id, region_id, start_time, end_time, vehicle_id, volunteer_id, driver_id, status, sub_status, breakdown_issue, passengers_boarded, wheelchairs_boarded, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');

  const result = stmt.run(route_code, origin_id, destination_id, origin_venue_id, destination_venue_id, region_id, start_time, end_time, vehicle_id, volunteer_id, driver_id, status, sub_status, breakdown_issue, passengers_boarded, wheelchairs_boarded, notes);
  const newTripId = result.lastInsertRowid;

  // Log initial status to history
  const historyStmt = getDb().prepare(`
    INSERT INTO trip_status_history (trip_id, status, sub_status, breakdown_issue)
    VALUES (?, ?, ?, ?)
  `);
  historyStmt.run(newTripId, status, sub_status, breakdown_issue);

  // Automatically mark the selected volunteer as a driver
  if (driver_id) {
    const dStmt = getDb().prepare('UPDATE profiles SET is_driver = 1 WHERE id = ?');
    dStmt.run(driver_id);
  }

  revalidatePath('/trips');
  if (formData.get('no_redirect') === 'true') { return { success: true, error: undefined }; }
  redirect('/trips');
}

export async function updateTrip(id: number, formData: FormData) {
  const session = await getSession();
  if (session?.role !== 'SUPER_ADMIN' && session?.role_id) {
    const { getRolePermissions } = await import('@/lib/rbac-server');
    const permissions = await getRolePermissions(session.role_id);
    if (!permissions['trips']?.edit) {
      throw new Error('Unauthorized. You do not have permission to edit trips.');
    }
  }
  const route_code = formData.get('route_code') as string;
  const origin = formData.get('origin') as string;
  const destination = formData.get('destination') as string;
  const start_time = formData.get('start_time') as string;
  const end_time = formData.get('end_time') as string;
  const vehicle_id = formData.get('vehicle_id') ? Number(formData.get('vehicle_id')) : null;
  const volunteer_id = formData.get('volunteer_id') ? Number(formData.get('volunteer_id')) : null;
  const driver_id = formData.get('driver_id') ? Number(formData.get('driver_id')) : null;
  const status = formData.get('status') as string || 'Planned';
  const sub_status = formData.get('sub_status') as string || 'Scheduled';
  const passengers_boarded = parseInt(formData.get('passengers_boarded') as string) || 0;
  const wheelchairs_boarded = parseInt(formData.get('wheelchairs_boarded') as string) || 0;
  const breakdown_issue = formData.get('breakdown_issue') as string || null;

  // Auto-save locations
  const locStmt = getDb().prepare('INSERT OR IGNORE INTO locations (name) VALUES (?)');
  if (origin) locStmt.run(origin);
  if (destination) locStmt.run(destination);

  // Fetch current trip to check for status changes
  const checkStmt = getDb().prepare('SELECT status, sub_status, breakdown_issue FROM trips WHERE id = ?');
  const currentTrip = checkStmt.get(id) as { status: string; sub_status: string; breakdown_issue: string | null } | undefined;

  const origin_id = formData.get('origin_id') ? Number(formData.get('origin_id')) : null;
  const origin_venue_id = formData.get('origin_venue_id') ? Number(formData.get('origin_venue_id')) : null;
  const destination_id = formData.get('destination_id') ? Number(formData.get('destination_id')) : null;
  const destination_venue_id = formData.get('destination_venue_id') ? Number(formData.get('destination_venue_id')) : null;
  const region_id = formData.get('region_id') ? Number(formData.get('region_id')) : null;
  const notes = formData.get('notes') as string || null;

  const stmt = getDb().prepare('UPDATE trips SET route_code = ?, origin_id = ?, destination_id = ?, origin_venue_id = ?, destination_venue_id = ?, region_id = ?, start_time = ?, end_time = ?, vehicle_id = ?, volunteer_id = ?, driver_id = ?, status = ?, sub_status = ?, breakdown_issue = ?, passengers_boarded = ?, wheelchairs_boarded = ?, notes = ? WHERE id = ?');

  stmt.run(route_code, origin_id, destination_id, origin_venue_id, destination_venue_id, region_id, start_time, end_time, vehicle_id, volunteer_id, driver_id, status, sub_status, breakdown_issue, passengers_boarded, wheelchairs_boarded, notes, id);

  // If status, sub_status, or breakdown_issue changed, log to history
  if (
    currentTrip &&
    (currentTrip.status !== status || currentTrip.sub_status !== sub_status || currentTrip.breakdown_issue !== breakdown_issue)
  ) {
    const historyStmt = getDb().prepare(`
      INSERT INTO trip_status_history (trip_id, status, sub_status, breakdown_issue)
      VALUES (?, ?, ?, ?)
    `);
    historyStmt.run(id, status, sub_status, breakdown_issue);
  }

  // Automatically mark the selected volunteer as a driver
  if (driver_id) {
    const dStmt = getDb().prepare('UPDATE profiles SET is_driver = 1 WHERE id = ?');
    dStmt.run(driver_id);
  }

  revalidatePath('/trips');
  revalidatePath(`/trips/${id}`);
  if (formData.get('no_redirect') === 'true') { return { success: true, error: undefined }; }
  redirect('/trips');
}

export async function getLocations(region_id?: number | null): Promise<any[]> {
  let query = `
    SELECT id, name, region_id, 'Location' as type FROM locations
    UNION ALL
    SELECT id * -1 as id, name || ' (Event)' as name, region_id, 'Event' as type FROM events
  `;
  let params: any[] = [];

  if (region_id) {
    query = `
      SELECT id, name, region_id, 'Location' as type FROM locations WHERE region_id = ?
      UNION ALL
      SELECT id * -1 as id, name || ' (Event)' as name, region_id, 'Event' as type FROM events WHERE region_id = ?
    `;
    params.push(region_id, region_id);
  }

  query += ' ORDER BY name ASC';

  const stmt = getDb().prepare(query);
  return stmt.all(...params) as any[];
}

export async function getTrips(search?: string, region_id?: number | null, limit?: number, offset?: number, dashboardMode?: boolean): Promise<any[]> {
  let baseQuery = `
    SELECT trips.*, 
           v.name as volunteer_name, v.phone as volunteer_phone,
           d.name as driver_name, d.phone as driver_phone,
           vehicles.registration as vehicle_registration,
           COALESCE(loc_o.name, ven_o.name) as origin_name,
           COALESCE(loc_d.name, ven_d.name) as destination_name,
           ven_o.name as origin_venue_name,
           ven_d.name as destination_venue_name
    FROM trips 
    LEFT JOIN profiles v ON trips.volunteer_id = v.id 
    LEFT JOIN profiles d ON trips.driver_id = d.id 
    LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
    LEFT JOIN locations loc_o ON trips.origin_id = loc_o.id
    LEFT JOIN locations loc_d ON trips.destination_id = loc_d.id
    LEFT JOIN venues ven_o ON trips.origin_venue_id = ven_o.id OR loc_o.venue_id = ven_o.id
    LEFT JOIN venues ven_d ON trips.destination_venue_id = ven_d.id OR loc_d.venue_id = ven_d.id
  `;

  let conditions: string[] = [];
  let params: any[] = [];

  if (region_id) {
    conditions.push('trips.region_id = ?');
    params.push(region_id);
  }

  if (dashboardMode) {
    // Only display active monitor types, or recently completed/cancelled ones to save massive memory
    conditions.push(`(trips.status IN ('Active', 'Arriving', 'Scheduled', 'Breakdown') OR (trips.status IN ('Completed', 'Cancelled', 'Planned') AND trips.start_time > datetime('now', '-7 days')))`);
  }

  if (search) {
    const terms = search.trim().split(/\s+/);
    terms.forEach(t => {
      const term = `%${t}%`;
      conditions.push('(trips.route_code LIKE ? OR loc_o.name LIKE ? OR loc_d.name LIKE ? OR ven_o.name LIKE ? OR ven_d.name LIKE ? OR v.name LIKE ? OR v.phone LIKE ? OR d.name LIKE ? OR d.phone LIKE ? OR vehicles.registration LIKE ? OR trips.start_time LIKE ?)');
      params.push(term, term, term, term, term, term, term, term, term, term, term);
    });
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  baseQuery += ' ORDER BY trips.start_time DESC';

  if (limit !== undefined && offset !== undefined) {
    baseQuery += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }

  const stmt = getDb().prepare(baseQuery);
  return stmt.all(...params) as any[];
}

export async function getTripsCount(search?: string, region_id?: number | null, dashboardMode?: boolean): Promise<number> {
  let baseQuery = 'SELECT COUNT(*) as count FROM trips';

  let conditions: string[] = [];
  let params: any[] = [];

  // Only join other tables if we are searching, because search requires checking names
  if (search) {
    baseQuery += `
      LEFT JOIN profiles v ON trips.volunteer_id = v.id 
      LEFT JOIN profiles d ON trips.driver_id = d.id 
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
      LEFT JOIN locations loc_o ON trips.origin_id = loc_o.id
      LEFT JOIN locations loc_d ON trips.destination_id = loc_d.id
      LEFT JOIN venues ven_o ON trips.origin_venue_id = ven_o.id OR loc_o.venue_id = ven_o.id
      LEFT JOIN venues ven_d ON trips.destination_venue_id = ven_d.id OR loc_d.venue_id = ven_d.id
    `;
  }

  if (region_id) {
    conditions.push('trips.region_id = ?');
    params.push(region_id);
  }

  if (dashboardMode) {
    conditions.push(`(trips.status IN ('Active', 'Arriving', 'Scheduled', 'Breakdown') OR (trips.status IN ('Completed', 'Cancelled', 'Planned') AND trips.start_time > datetime('now', '-1 day')))`);
  }

  if (search) {
    const terms = search.trim().split(/\s+/);
    terms.forEach(t => {
      const term = `%${t}%`;
      conditions.push('(trips.route_code LIKE ? OR loc_o.name LIKE ? OR loc_d.name LIKE ? OR ven_o.name LIKE ? OR ven_d.name LIKE ? OR v.name LIKE ? OR v.phone LIKE ? OR d.name LIKE ? OR d.phone LIKE ? OR vehicles.registration LIKE ? OR trips.start_time LIKE ?)');
      params.push(term, term, term, term, term, term, term, term, term, term, term);
    });
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  const stmt = getDb().prepare(baseQuery);
  const row = stmt.get(...params) as { count: number };
  return row.count;
}

export async function getTrip(id: number): Promise<any | undefined> {
  const stmt = getDb().prepare(`
    SELECT trips.*, 
           loc_o.name as origin_name,
           loc_d.name as destination_name,
           ven_o.name as origin_venue_name,
           ven_d.name as destination_venue_name
    FROM trips 
    LEFT JOIN locations loc_o ON trips.origin_id = loc_o.id
    LEFT JOIN locations loc_d ON trips.destination_id = loc_d.id
    LEFT JOIN venues ven_o ON trips.origin_venue_id = ven_o.id OR loc_o.venue_id = ven_o.id
    LEFT JOIN venues ven_d ON trips.destination_venue_id = ven_d.id OR loc_d.venue_id = ven_d.id
    WHERE trips.id = ?
  `);
  return stmt.get(id) as any | undefined;
}

// --- TRIP SUB-STATUS ACTIONS ---

export async function getTripStatuses() {
  const stmt = getDb().prepare('SELECT * FROM trip_statuses ORDER BY sort_order ASC');
  return stmt.all() as { id: number, name: string, passenger_count_required: number, sort_order: number }[];
}

export async function createTripStatus(formData: FormData) {
  const name = formData.get('name') as string;
  const passenger_count_required = formData.get('passenger_count_required') === 'true' ? 1 : 0;
  const sort_order = Number(formData.get('sort_order')) || 0;

  const stmt = getDb().prepare('INSERT INTO trip_statuses (name, passenger_count_required, sort_order) VALUES (?, ?, ?)');
  try {
    const info = stmt.run(name, passenger_count_required, sort_order);
    return { success: true, id: info.lastInsertRowid };
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Status name already exists' };
    }
    return { success: false, error: err.message };
  }
}

export async function updateTripStatus(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const passenger_count_required = formData.get('passenger_count_required') === 'true' ? 1 : 0;
  const sort_order = Number(formData.get('sort_order')) || 0;

  const getOld = getDb().prepare('SELECT name FROM trip_statuses WHERE id = ?').get(id) as { name: string };

  const stmt = getDb().prepare('UPDATE trip_statuses SET name = ?, passenger_count_required = ?, sort_order = ? WHERE id = ?');

  try {
    getDb().transaction(() => {
      stmt.run(name, passenger_count_required, sort_order, id);

      // Cascade this name change to sub-statuses and active trips
      if (getOld && getOld.name !== name) {
        getDb().prepare('UPDATE trip_sub_statuses SET linked_status = ? WHERE linked_status = ?').run(name, getOld.name);
        getDb().prepare('UPDATE trips SET status = ? WHERE status = ?').run(name, getOld.name);
      }
    })();
    return { success: true };
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Status name already exists' };
    }
    return { success: false, error: err.message };
  }
}

export async function deleteTripStatus(id: number) {
  const getOld = getDb().prepare('SELECT name FROM trip_statuses WHERE id = ?').get(id) as { name: string };
  try {
    getDb().prepare('DELETE FROM trip_statuses WHERE id = ?').run(id);
    // Optionally un-link sub-statuses
    if (getOld) {
      getDb().prepare('UPDATE trip_sub_statuses SET linked_status = "" WHERE linked_status = ?').run(getOld.name);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getTripSubStatuses(): Promise<TripSubStatus[]> {
  const stmt = getDb().prepare('SELECT * FROM trip_sub_statuses ORDER BY sort_order ASC');
  return stmt.all() as TripSubStatus[];
}

export async function createTripSubStatus(formData: FormData) {
  const name = formData.get('name') as string;
  const linked_status = formData.get('linked_status') as string;
  const sort_order = Number(formData.get('sort_order')) || 0;

  const stmt = getDb().prepare('INSERT INTO trip_sub_statuses (name, linked_status, sort_order) VALUES (?, ?, ?)');

  try {
    stmt.run(name, linked_status, sort_order);
    return { success: true };
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Sub-status name already exists' };
    }
    return { success: false, error: err.message };
  }

  revalidatePath('/settings/statuses');
  revalidatePath('/trips/create');
  revalidatePath('/trips');
}

export async function deleteTripSubStatus(id: number) {
  const stmt = getDb().prepare('DELETE FROM trip_sub_statuses WHERE id = ?');
  stmt.run(id);

  revalidatePath('/settings/statuses');
  revalidatePath('/trips/create');
  revalidatePath('/trips');
}

// App Settings
export async function getAppSetting(key: string): Promise<string | null> {
  const stmt = getDb().prepare('SELECT value FROM app_settings WHERE key = ?');
  const result = stmt.get(key) as { value: string } | undefined;
  return result ? result.value : null;
}

export async function updateTimezone(timezone: string) {
  const stmt = getDb().prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
  stmt.run('timezone', timezone);
  revalidatePath('/dashboard');
  revalidatePath('/settings/statuses');
}

export async function updateTripSubStatus(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const linked_status = formData.get('linked_status') as string;
  const sort_order = Number(formData.get('sort_order')) || 0;

  const stmt = getDb().prepare('UPDATE trip_sub_statuses SET name = ?, linked_status = ?, sort_order = ? WHERE id = ?');

  try {
    stmt.run(name, linked_status, sort_order, id);
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Sub-status name already exists' };
    }
    return { success: false, error: err.message };
  }

  revalidatePath('/settings/statuses');
  revalidatePath('/trips/create');
  revalidatePath('/trips');
  return { success: true };
}

export async function createQuickVehicle(registration: string, type: string, capacity: number): Promise<{ success: boolean; id?: number; error?: string; registration?: string }> {
  try {
    const stmt = getDb().prepare(`
      INSERT INTO vehicles (type, registration, capacity, make_model)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(type, registration, capacity || 0, '');

    return {
      success: true,
      id: Number(result.lastInsertRowid),
      registration
    };
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'A vehicle with this registration already exists' };
    }
    return { success: false, error: err.message };
  }
}

export async function updateQuickVehicle(id: number, registration: string, type: string, capacity: number) {
  try {
    const stmt = getDb().prepare('UPDATE vehicles SET registration = ?, type = ?, capacity = ? WHERE id = ?');
    stmt.run(registration, type, capacity || 0, id);
    return { success: true };
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Registration number already exists.' };
    }
    return { success: false, error: 'Database error occurred' };
  }
}

export async function getVolunteerTrips(location_id: number): Promise<any[]> {
  let query = `
    SELECT trips.*, 
           v.name as volunteer_name, v.phone as volunteer_phone,
           d.name as driver_name, d.phone as driver_phone,
           vehicles.registration as vehicle_registration,
           COALESCE(loc_o.name, ven_o.name) as origin_name,
           COALESCE(loc_d.name, ven_d.name) as destination_name,
           ven_o.name as origin_venue_name,
           ven_d.name as destination_venue_name
    FROM trips 
    LEFT JOIN profiles v ON trips.volunteer_id = v.id 
    LEFT JOIN profiles d ON trips.driver_id = d.id 
    LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
    LEFT JOIN locations loc_o ON trips.origin_id = loc_o.id
    LEFT JOIN locations loc_d ON trips.destination_id = loc_d.id
    LEFT JOIN venues ven_o ON trips.origin_venue_id = ven_o.id OR loc_o.venue_id = ven_o.id
    LEFT JOIN venues ven_d ON trips.destination_venue_id = ven_d.id OR loc_d.venue_id = ven_d.id
    WHERE trips.origin_id = ? OR trips.destination_id = ? OR trips.origin_venue_id = ? OR trips.destination_venue_id = ?
    ORDER BY trips.start_time DESC
  `;

  const stmt = getDb().prepare(query);
  return stmt.all(location_id, location_id, location_id, location_id) as any[];
}


export async function updateTripProgress(id: number, status: string, sub_status?: string, breakdown_issue?: string) {
  const safeSubStatus = sub_status || ''; // Empty string instead of null for constraint
  const safeBreakdownIssue = breakdown_issue || null;

  const stmt = getDb().prepare('UPDATE trips SET status = ?, sub_status = ?, breakdown_issue = ? WHERE id = ?');
  stmt.run(status, safeSubStatus, safeBreakdownIssue, id);

  // Log to history
  const historyStmt = getDb().prepare(`
    INSERT INTO trip_status_history (trip_id, status, sub_status, breakdown_issue)
    VALUES (?, ?, ?, ?)
  `);
  historyStmt.run(id, status, safeSubStatus, safeBreakdownIssue);

  revalidatePath('/my-location-trips');
  revalidatePath('/trips');
}

export async function getHierarchyData() {
  const regions = getDb().prepare('SELECT * FROM regions').all();
  const venues = getDb().prepare('SELECT * FROM venues').all();
  const locations = getDb().prepare('SELECT * FROM locations').all();
  return { regions, venues, locations };
}

// Trips Delete
export async function deleteTrip(id: number) {
  const session = await getSession();
  if (session?.role !== 'SUPER_ADMIN' && session?.role_id) {
    const { getRolePermissions } = await import('@/lib/rbac-server');
    const permissions = await getRolePermissions(session.role_id);
    if (!permissions['trips']?.edit) {
      return { success: false, error: 'Unauthorized. You do not have permission to delete trips.' };
    }
  }

  try {
    // Clean up history FIRST due to foreign key constraints
    getDb().prepare('DELETE FROM trip_status_history WHERE trip_id = ?').run(id);
    const stmt = getDb().prepare('DELETE FROM trips WHERE id = ?');
    stmt.run(id);

    revalidatePath('/trips');
    revalidatePath('/manage-trips');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- RBAC ACTIONS ---

export async function getRoles() {
  const stmt = getDb().prepare('SELECT * FROM roles ORDER BY name ASC');
  return stmt.all() as any[];
}

export async function createRole(name: string, description: string) {
  try {
    const stmt = getDb().prepare('INSERT INTO roles (name, description) VALUES (?, ?)');
    const info = stmt.run(name, description);
    revalidatePath('/settings/roles');
    return { success: true, id: info.lastInsertRowid };
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: 'Role name already exists' };
    }
    return { success: false, error: err.message };
  }
}

export async function deleteRole(id: number) {
  const check = getDb().prepare('SELECT is_system_role FROM roles WHERE id = ?').get(id) as any;
  if (check && check.is_system_role) {
    return { success: false, error: 'Cannot delete system roles' };
  }

  try {
    const stmt = getDb().prepare('DELETE FROM roles WHERE id = ?');
    stmt.run(id);
    revalidatePath('/settings/roles');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateRolePermissions(roleId: number, permissions: { module_code: string, can_view: boolean, can_edit: boolean }[]) {
  const insert = getDb().prepare(`
    INSERT INTO role_permissions (role_id, module_code, can_view, can_edit)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(role_id, module_code) DO UPDATE SET
    can_view = excluded.can_view,
    can_edit = excluded.can_edit
  `);

  try {
    const runTransaction = getDb().transaction(() => {
      for (const p of permissions) {
        insert.run(roleId, p.module_code, p.can_view ? 1 : 0, p.can_edit ? 1 : 0);
      }
    });
    runTransaction();

    revalidatePath('/settings/roles');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function quickUpdateTripDetails(
  id: number, 
  volunteer_id: number | null, 
  driver_id: number | null, 
  vehicle_registration: string, 
  passengers: number, 
  wheelchairs: number,
  notes?: string
) {
  // Try to find the vehicle by registration or create it
  let vehicle_id = null;
  if (vehicle_registration.trim()) {
    const reg = vehicle_registration.trim();
    const v = getDb().prepare('SELECT id FROM vehicles WHERE registration = ?').get(reg) as { id: number } | undefined;
    if (v) {
      vehicle_id = v.id;
    } else {
      const info = getDb().prepare('INSERT INTO vehicles (registration, type, make, capacity) VALUES (?, ?, ?, ?)').run(reg, 'Unknown', 'Unknown', 0);
      vehicle_id = info.lastInsertRowid;
    }
  }

  const stmt = getDb().prepare(`
    UPDATE trips 
    SET volunteer_id = ?, driver_id = ?, vehicle_id = ?, passengers_boarded = ?, wheelchairs_boarded = ?, notes = ?
    WHERE id = ?
  `);
  stmt.run(volunteer_id, driver_id, vehicle_id, passengers, wheelchairs, notes || '', id);

  revalidatePath('/my-location-trips');
  revalidatePath('/trips');
  revalidatePath('/dashboard');
  revalidatePath('/manage-trips');
}
