import { getDb } from '../lib/db';

async function run() {
  console.log('--- STARTING DB VERIFICATION ---');
  try {
    const db = getDb();
    console.log('✓ Database connection established via lazy singleton.');

    // Test simple query
    const result = db.prepare('SELECT 1 as val').get() as { val: number };
    console.log(`✓ Query test: SELECT 1 returned ${result.val}`);

    // Check tables existence (schema init check)
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);
    console.log('✓ Tables found:', tableNames.join(', '));

    if (!tableNames.includes('trips') || !tableNames.includes('users')) {
      throw new Error('Missing core tables (trips, users). Schema init failed?');
    }

    console.log('--- DB VERIFICATION PASSED ---');
  } catch (error) {
    console.error('!!! DB VERIFICATION FAILED !!!');
    console.error(error);
    process.exit(1);
  }
}

run();
