
const Database = require('better-sqlite3');
const path = require('path');

function getDb() {
  const dbPath = process.env.SQLITE_FILE || path.join(process.cwd(), 'sqlite.db');
  return new Database(dbPath);
}

function tryQuery(label, query) {
  console.log(`Testing: ${label}`);
  try {
    const db = getDb();
    db.prepare(query);
    console.log('✅ Prepared successfully.');
  } catch (e) {
    console.error(`❌ Error matching user report: '${e.message}'`);
  }
}

async function main() {
  console.log('Simulating SQL syntax errors...');
  
  // Case 1: Missing SET keyword
  tryQuery('Missing SET', 'UPDATE trips route_code = ? WHERE id = ?');

  // Case 2: SET before UPDATE (invalid syntax)
  tryQuery('SET before UPDATE', 'SET trips route_code = ? WHERE id = ?');

  // Case 3: WHERE before SET
  tryQuery('WHERE before SET', 'UPDATE trips WHERE id = ? SET route_code = ?');

  // Case 4: Extra comma before SET
  tryQuery('Comma before SET', 'UPDATE trips, SET route_code = ? WHERE id = ?');

  // Case 5: Table alias without AS (or with AS) in UPDATE (SQLite limitation?)
  tryQuery('Table Alias', 'UPDATE trips t SET route_code = ? WHERE id = ?');

  // Case 6: ON CONFLICT ... DO UPDATE (Missing SET)
  tryQuery('UPSERT Missing SET', 'INSERT INTO role_permissions (role_id) VALUES (?) ON CONFLICT(role_id) DO UPDATE can_view = excluded.can_view');

  // Case 7: ON CONFLICT ... DO UPDATE (SET present)
  tryQuery('UPSERT Correct', 'INSERT INTO role_permissions (role_id) VALUES (?) ON CONFLICT(role_id) DO UPDATE SET can_view = excluded.can_view');

  // Case 8: Extra characters
  tryQuery('Junk before SET', 'UPDATE trips junk SET route_code = ? WHERE id = ?');
}

main();
