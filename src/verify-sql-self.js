
const Database = require('better-sqlite3');
const path = require('path');

function getDb() {
  const dbPath = process.env.SQLITE_FILE || path.join(process.cwd(), 'sqlite.db');
  const db = new Database(dbPath);
  return db;
}

async function main() {
  console.log('Verifying SQL statements in src/app/actions.ts...');
  
  try {
    const db = getDb();
    
    // 1. UPDATE trips statement from lines 349-353
    console.log('Testing UPDATE trips statement...');
    try {
      db.prepare(`
        UPDATE trips
        SET route_code = ?, origin_id = ?, destination_id = ?, origin_venue_id = ?, destination_venue_id = ?, region_id = ?, start_time = ?, end_time = ?, vehicle_id = ?, volunteer_id = ?, driver_id = ?, status = ?, sub_status = ?, breakdown_issue = ?, passengers_boarded = ?, wheelchairs_boarded = ?
        WHERE id = ?
      `);
      console.log('✅ UPDATE trips statement prepared successfully.');
    } catch (e) {
      console.error('❌ UPDATE trips failed:', e.message);
    }

    // 2. INSERT trips statement
    console.log('Testing INSERT trips statement...');
    try {
      db.prepare(`
        INSERT INTO trips (route_code, origin_id, destination_id, origin_venue_id, destination_venue_id, region_id, start_time, end_time, vehicle_id, volunteer_id, driver_id, status, sub_status, breakdown_issue, passengers_boarded, wheelchairs_boarded)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      console.log('✅ INSERT trips statement prepared successfully.');
    } catch (e) {
      console.error('❌ INSERT trips failed:', e.message);
    }

    // 3. INSERT role_permissions statement (lines 808-814)
    console.log('Testing INSERT role_permissions statement...');
    try {
      db.prepare(`
        INSERT INTO role_permissions (role_id, module_code, can_view, can_edit)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(role_id, module_code) DO UPDATE SET
        can_view = excluded.can_view,
        can_edit = excluded.can_edit
      `);
      console.log('✅ INSERT role_permissions statement prepared successfully.');
    } catch (e) {
      console.error('❌ INSERT role_permissions failed:', e.message);
    }

    // 4. UPDATE quick update statement
    console.log('Testing UPDATE trips (quick update) statement...');
    try {
      db.prepare(`
        UPDATE trips 
        SET volunteer_id = ?, driver_id = ?, vehicle_id = ?, passengers_boarded = ?, wheelchairs_boarded = ?
        WHERE id = ?
      `);
      console.log('✅ UPDATE trips (quick) prepared successfully.');
    } catch (e) {
      console.error('❌ UPDATE trips (quick) failed:', e.message);
    }

    // 5. UPDATE trip progress statement (lines 723)
    console.log('Testing UPDATE trip progress statement...');
    try {
      db.prepare('UPDATE trips SET status = ?, sub_status = ?, breakdown_issue = ? WHERE id = ?');
      console.log('✅ UPDATE trip progress prepared successfully.');
    } catch (e) {
       console.error('❌ UPDATE trip progress failed:', e.message);
       // Check if columns exist
       const info = db.pragma('table_info(trips)');
       console.log('Trips columns:', info.map(c => c.name).join(', '));
    }
    
  } catch (err) {
    console.error('❌ Global Error:', err.message);
    process.exit(1);
  }
}

main();
