import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Region, Venue, Location, getDb } from '@/lib/db';
import HierarchyManagerClient from './HierarchyManagerClient';

export const dynamic = 'force-dynamic';

export default async function HierarchyPage() {
  const session = await getSession();
  
  if (session?.role !== 'SUPER_ADMIN' && session?.role !== 'REGION_ADMIN') {
    return notFound();
  }

  const db = getDb();
  
  let regionsStmt = 'SELECT * FROM regions ORDER BY id ASC';
  let venuesStmt = 'SELECT * FROM venues ORDER BY id ASC';
  let locationsStmt = 'SELECT * FROM locations ORDER BY id ASC';
  
  // If REGION_ADMIN, they can only see their own region hierarchy
  if (session.role === 'REGION_ADMIN' && session.region_id) {
    regionsStmt = `SELECT * FROM regions WHERE id = \${session.region_id} ORDER BY id ASC`;
    venuesStmt = `SELECT * FROM venues WHERE region_id = ${session.region_id} ORDER BY id ASC`;
    locationsStmt = `SELECT * FROM locations WHERE region_id = \${session.region_id} ORDER BY id ASC`;
  }

  const regions = db.prepare(regionsStmt).all() as Region[];
  const venues = db.prepare(venuesStmt).all() as Venue[];
  const locations = db.prepare(locationsStmt).all() as Location[];
  
  // db.close(); // Database is a singleton now, do not close

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>Spatial Hierarchy</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Configure Regions, Venues, and specific mapping Locations.</p>
      </div>
      
      <HierarchyManagerClient 
        initialRegions={regions} 
        initialVenues={venues} 
        initialLocations={locations}
         
        userRole={session.role}
      />
    </div>
  );
}

