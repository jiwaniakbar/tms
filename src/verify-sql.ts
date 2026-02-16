
import { getDb } from './lib/db';

async function main() {
  console.log('Verifying SQL statements in src/app/actions.ts...');
  
  try {
    const db = getDb();
    
    // 1. UPDATE trips statement from lines 349-353
    console.log('Testing UPDATE trips statement...');
    const stmt1 = db.prepare(`
      UPDATE trips
      SET route_code = ?, origin_id = ?, destination_id = ?, origin_venue_id = ?, destination_venue_id = ?, region_id = ?, start_time = ?, end_time = ?, vehicle_id = ?, volunteer_id = ?, driver_id = ?, status = ?, sub_status = ?, breakdown_issue = ?, passengers_boarded = ?, wheelchairs_boarded = ?
      WHERE id = ?
    `);
    console.log('✅ UPDATE trips statement prepared successfully.');

    // 2. INSERT trips statement
    console.log('Testing INSERT trips statement...');
    const stmt2 = db.prepare(`
      INSERT INTO trips (route_code, origin_id, destination_id, origin_venue_id, destination_venue_id, region_id, start_time, end_time, vehicle_id, volunteer_id, driver_id, status, sub_status, breakdown_issue, passengers_boarded, wheelchairs_boarded)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    console.log('✅ INSERT trips statement prepared successfully.');

    // 3. INSERT role_permissions statement (lines 808-814)
    console.log('Testing INSERT role_permissions statement...');
    const stmt3 = db.prepare(`
      INSERT INTO role_permissions (role_id, module_code, can_view, can_edit)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(role_id, module_code) DO UPDATE SET
      can_view = excluded.can_view,
      can_edit = excluded.can_edit
    `);
    console.log('✅ INSERT role_permissions statement prepared successfully.');
    
  } catch (err: any) {
    console.error('❌ SQL Compilation Failed:', err.message);
    process.exit(1);
  }
}

main();
