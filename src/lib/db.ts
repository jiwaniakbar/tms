import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Singleton instance
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbPath = process.env.SQLITE_FILE || path.join(process.cwd(), 'sqlite.db');
  const dbDir = path.dirname(dbPath);



  try {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('synchronous = NORMAL'); // Faster WAL writes, safe for most use cases
    console.log('Database opened successfully.');

    // Initialize schema on first connection
    initDb(dbInstance);

    return dbInstance;
  } catch (e) {
    console.error('FAILED to open database:', e);
    throw e;
  }
}

// Define Profile Type
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  role_id: number | null;
  region_id: number | null;
  location_id: number | null;
  created_at: string;
}

export interface Region {
  id: number;
  name: string;
  created_at: string;
}

export interface Venue {
  id: number;
  name: string;
  region_id: number;
  created_at: string;
}

export interface Event {
  id: number;
  name: string;
  region_id: number;
  created_at: string;
}

export interface Location {
  id: number;
  name: string;
  venue_id: number | null;
  region_id: number;
  created_at: string;
}

export interface Profile {

  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  age: number | null;
  bio: string;
  photo_url?: string;
  is_driver: number; // 0 for No, 1 for Yes
  location_id: number | null;
  created_at: string;
}

// Define Vehicle Type
export interface Vehicle {
  id: number;
  type: string; // Bus, Private Car, Taxi, Ambulance, etc.
  registration: string;
  capacity: number;
  make_model: string;
  status: string; // Active, Maintenance, Out of Service
  created_at: string;
}

// Define Trip Type
export interface Trip {
  id: number;
  route_code: string;
  origin_id: number | null;
  destination_id: number | null;
  origin_venue_id: number | null;
  destination_venue_id: number | null;
  region_id: number | null;
  start_time: string;
  end_time: string;
  vehicle_id: number | null;
  volunteer_id: number | null;
  driver_id: number | null;
  status: string; // Planned, Active, Cancelled, Completed, Breakdown
  sub_status: string; // Ready for onboarding, Enroute, At pit stop, Within 1 km of destination, Arrived, Parked
  breakdown_issue?: string;
  passengers_boarded: number;
  wheelchairs_boarded: number;
  created_at: string;
}

// Define Trip Status Type
export interface TripStatus {
  id: number;
  name: string;
  passenger_count_required: number; // 0 or 1
  sort_order: number;
}

// Define Trip Sub-Status Type
// Define Trip Sub-Status Type
export interface TripSubStatus {
  id: number;
  name: string;
  linked_status: string; // The core status it maps to (e.g., Active)
  sort_order: number;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system_role: number;
}

export interface RolePermission {
  id: number;
  role_id: number;
  module_code: string;
  can_view: number;
  can_edit: number;
}

// Database initialization function
export function initDb(db: Database.Database) {
  // Create Core Database Schema

  const createAppSettingsTableQuery = `
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
  db.exec(createAppSettingsTableQuery);
  
  // Insert default timezone if not exists
  const checkTz = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('timezone');
  if (!checkTz) {
    db.prepare('INSERT INTO app_settings (key, value) VALUES (?, ?)').run('timezone', 'Asia/Kolkata');
  }

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      dob TEXT,
      age INTEGER,
      bio TEXT,
      photo_url TEXT,
      is_driver INTEGER DEFAULT 0,
      location_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.exec(createTableQuery);

  // Default tables are now correctly initialized.
  try {
    db.exec('ALTER TABLE profiles ADD COLUMN photo_url TEXT');
    console.log('Added photo_url column to profiles table.');
  } catch (err) {
    // Column likely already exists
  }

  try {
    db.exec('ALTER TABLE profiles ADD COLUMN is_driver INTEGER DEFAULT 0');
    console.log('Added is_driver column to profiles table.');
  } catch (err) {
    // Column likely already exists
  }

  const createVehiclesTableQuery = `
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      registration TEXT NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      make_model TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.exec(createVehiclesTableQuery);

  const createTripsTableQuery = `
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_code TEXT NOT NULL,
      origin_id INTEGER,
      destination_id INTEGER,
      origin_venue_id INTEGER,
      destination_venue_id INTEGER,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      vehicle_id INTEGER,
      volunteer_id INTEGER,
      driver_id INTEGER,
      region_id INTEGER,
      status TEXT NOT NULL DEFAULT 'Planned',
      sub_status TEXT NOT NULL DEFAULT 'Scheduled',
      breakdown_issue TEXT,
      passengers_boarded INTEGER DEFAULT 0,
      wheelchairs_boarded INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
      FOREIGN KEY (volunteer_id) REFERENCES profiles (id),
      FOREIGN KEY (driver_id) REFERENCES profiles (id)
    )
  `;
  db.exec(createTripsTableQuery);

  try {
    db.exec('ALTER TABLE trips ADD COLUMN wheelchairs_boarded INTEGER DEFAULT 0');
  } catch (error) {
    // Column might already exist, ignore
  }


  // Add driver_id column if it doesn't exist (for existing trips tables)
  try {
    db.exec('ALTER TABLE trips ADD COLUMN driver_id INTEGER REFERENCES profiles(id)');
    console.log('Added driver_id column to trips table.');
  } catch (err) {
    // Column likely already exists
  }

  try {
    db.exec('ALTER TABLE trips ADD COLUMN breakdown_issue TEXT');
    console.log('Added breakdown_issue column to trips table.');
  } catch (err) {
    // Column likely already exists
  }

  try {
    db.exec('ALTER TABLE trips ADD COLUMN region_id INTEGER REFERENCES regions(id)');
    console.log('Added region_id column to trips table.');
  } catch (err) {
    // Column likely already exists
  }

  const createTripStatusHistoryTableQuery = `
    CREATE TABLE IF NOT EXISTS trip_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      sub_status TEXT NOT NULL,
      breakdown_issue TEXT,
      passengers_boarded INTEGER DEFAULT 0,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips (id)
    )
  `;
  db.exec(createTripStatusHistoryTableQuery);

  

  const createRegionsTableQuery = `
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.exec(createRegionsTableQuery);

  const createEventsTableQuery = `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (region_id) REFERENCES regions (id)
    )
  `;
  db.exec(createEventsTableQuery);

  const createEventVenuesTableQuery = `
    CREATE TABLE IF NOT EXISTS event_venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      event_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id)
    )
  `;
  db.exec(createEventVenuesTableQuery);

  const createVenuesTableQuery = `
    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (region_id) REFERENCES regions (id)
    )
  `;
  db.exec(createVenuesTableQuery);

  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'VOLUNTEER',
      region_id INTEGER,
      location_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.exec(createUsersTableQuery);

  // events table moved up


  const createLocationsTableQuery = `
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      venue_id INTEGER,
      region_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (venue_id) REFERENCES venues (id),
      FOREIGN KEY (region_id) REFERENCES regions (id)
    )
  `;
  db.exec(createLocationsTableQuery);

  
  const createTripStatusesTableQuery = `
    CREATE TABLE IF NOT EXISTS trip_statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      passenger_count_required INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    )
  `;
  db.exec(createTripStatusesTableQuery);

  // Seed default core statuses if table is empty
  try {
    const insertStatus = db.prepare('INSERT OR IGNORE INTO trip_statuses (name, passenger_count_required, sort_order) VALUES (?, ?, ?)');
    insertStatus.run('Scheduled', 0, 1);
    insertStatus.run('Active', 0, 2);
    insertStatus.run('Arriving', 0, 3);
    insertStatus.run('Completed', 1, 4); // Suggest completed needs passenger count
    insertStatus.run('Breakdown', 0, 5);
    insertStatus.run('Cancelled', 0, 6);
  } catch (err) {
    console.error('Error seeding trip_statuses:', err);
  }

  const createTripSubStatusesTableQuery = `
    CREATE TABLE IF NOT EXISTS trip_sub_statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      linked_status TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;
  db.exec(createTripSubStatusesTableQuery);

  // Seed default trip sub-statuses if empty
  try {
    const insertStmt = db.prepare('INSERT OR IGNORE INTO trip_sub_statuses (name, linked_status, sort_order) VALUES (?, ?, ?)');
    insertStmt.run('Scheduled', 'Planned', 10);
    insertStmt.run('Ready for onboarding', 'Planned', 20);
    insertStmt.run('Enroute', 'Active', 30);
    insertStmt.run('At pit stop', 'Active', 40);
    insertStmt.run('Within 1 km of destination', 'Active', 50);
    insertStmt.run('Perimeter - 1 km', 'Active', 55);
    insertStmt.run('Arriving', 'Active', 60);
    insertStmt.run('Arrived', 'Completed', 60);
    insertStmt.run('Parked', 'Completed', 70);
    console.log('Seeded default trip sub-statuses.');
  } catch (err) {
    console.error('Error seeding trip_sub_statuses:', err);
  }

  
  // --- RBAC TABLES ---

  const createRolesTableQuery = `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      is_system_role INTEGER DEFAULT 0 -- 1 for core roles that cannot be deleted (e.g. Super Admin)
    )
  `;
  db.exec(createRolesTableQuery);

  const createRolePermissionsTableQuery = `
    CREATE TABLE IF NOT EXISTS role_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      module_code TEXT NOT NULL,
      can_view INTEGER DEFAULT 0,
      can_edit INTEGER DEFAULT 0,
      FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
      UNIQUE(role_id, module_code)
    )
  `;
  db.exec(createRolePermissionsTableQuery);

  // Add role_id to users/profiles if not exists
  try {
    db.exec('ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id)');
    console.log('Added role_id column to users table.');
  } catch (err) {
    // Column likely exists
  }
  
  // Seed initial roles if empty
  try {
    const insertRole = db.prepare('INSERT OR IGNORE INTO roles (name, description, is_system_role) VALUES (?, ?, ?)');
    insertRole.run('Super Admin', 'Full access to everything', 1);
    insertRole.run('Region Admin', 'Full access to regional data', 1);
    insertRole.run('Dispatcher', 'Can manage trips and vehicles', 0);
    insertRole.run('Bus Incharge', 'Can view trips and update active status', 0);
    insertRole.run('Volunteer', 'Base access', 0);
    console.log('Seeded default roles.');
  } catch (err) {
    console.error('Error seeding roles:', err);
  }

  // Seed default superadmin if users table is empty
  try {
    const superAdminRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('Super Admin') as { id: number } | undefined;
    if (superAdminRole) {
      // Default password: admin123
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const insertUser = db.prepare(`
          INSERT INTO users (name, email, password_hash, role, role_id) 
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(email) DO NOTHING
        `);
      insertUser.run('Super Admin', 'admin@transport.com', hashedPassword, 'SUPER_ADMIN', superAdminRole.id);
      console.log('Seeded default superadmin user: admin@transport.com / admin123');
    }
  } catch (err) {
    console.error('Error seeding superadmin:', err);
  }

  // --- PERFORMANCE INDEXES ---
  const indexQueries = [
    'CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time)',
    'CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_volunteer_id ON trips(volunteer_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_origin_id ON trips(origin_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON trips(destination_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_origin_venue_id ON trips(origin_venue_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_destination_venue_id ON trips(destination_venue_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_region_id ON trips(region_id)',
    'CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email)',
    'CREATE INDEX IF NOT EXISTS idx_vehicles_registration ON vehicles(registration)'
  ];

  for (const query of indexQueries) {
    db.exec(query);
  }

  console.log('Database and profiles/vehicles/trips/statuses tables initialized.');
}



