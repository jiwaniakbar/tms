'use server';
import { getDb } from '@/lib/db';

export async function createRegion(name: string): Promise<{success: boolean, id?: number, error?: string}> {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO regions (name) VALUES (?)');
    const info = stmt.run(name);
    return { success: true, id: Number(info.lastInsertRowid) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createVenue(name: string, region_id: number): Promise<{success: boolean, id?: number, error?: string}> {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO venues (name, region_id) VALUES (?, ?)');
    const info = stmt.run(name, region_id);
    return { success: true, id: Number(info.lastInsertRowid) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createLocation(name: string, venue_id: number | null, region_id: number): Promise<{success: boolean, id?: number, error?: string}> {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO locations (name, venue_id, region_id) VALUES (?, ?, ?)');
    const info = stmt.run(name, venue_id, region_id);
    return { success: true, id: Number(info.lastInsertRowid) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function createEvent(name: string, region_id: number) {
  const db = getDb();
  try {
    const stmt = db.prepare('INSERT INTO events (name, region_id) VALUES (?, ?)');
    const info = stmt.run(name, region_id);
    return { success: true, id: Number(info.lastInsertRowid) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteEntity(table: string, id: number) {
  if (!['regions', 'venues', 'locations'].includes(table)) return { success: false, error: 'Invalid table' };
  
  const db = getDb();
  
  try {
    db.pragma('foreign_keys = ON');
    
    if (table === 'regions') {
      const tripsCount = db.prepare('SELECT COUNT(*) as c FROM trips WHERE region_id = ?').get(id) as {c: number};
      if (tripsCount && tripsCount.c > 0) throw new Error(`Cannot delete Region. It has ${tripsCount.c} active Trips attached.`);
    }

    if (table === 'locations') {
      const tripsO = db.prepare('SELECT COUNT(*) as c FROM trips WHERE origin_id = ?').get(id) as {c: number};
      const tripsD = db.prepare('SELECT COUNT(*) as c FROM trips WHERE destination_id = ?').get(id) as {c: number};
      if ((tripsO && tripsO.c > 0) || (tripsD && tripsD.c > 0)) {
         throw new Error('Cannot delete this Location/Drop-off. It is currently acting as an Origin or Destination for an existing Trip.');
      }
    }

    const deleteTx = db.transaction(() => {
      if (table === 'regions') {
        const venues = db.prepare('SELECT id FROM venues WHERE region_id = ?').all(id) as {id: number}[];
        for (const ven of venues) {
           db.prepare('DELETE FROM locations WHERE venue_id = ?').run(ven.id);
        }
        db.prepare('DELETE FROM venues WHERE region_id = ?').run(id);
        db.prepare('DELETE FROM locations WHERE region_id = ? AND venue_id IS NULL').run(id);
        db.prepare('DELETE FROM regions WHERE id = ?').run(id);
        
      } else if (table === 'venues') {
        const tripsO = db.prepare('SELECT COUNT(*) as c FROM trips WHERE origin_venue_id = ?').get(id) as {c: number};
        const tripsD = db.prepare('SELECT COUNT(*) as c FROM trips WHERE destination_venue_id = ?').get(id) as {c: number};
        if ((tripsO && tripsO.c > 0) || (tripsD && tripsD.c > 0)) {
           throw new Error('Cannot delete this Venue. Trips are currently routed directly to it.');
        }
        db.prepare('DELETE FROM locations WHERE venue_id = ?').run(id);
        db.prepare('DELETE FROM venues WHERE id = ?').run(id);
        
      } else {
        db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      }
    });
    
    deleteTx();
    return { success: true };
  } catch (e: any) {
    if (e.message.includes('FOREIGN KEY constraint')) {
      return { success: false, error: 'Cannot delete: this item contains active trips or is protected by critical system data.' };
    }
    return { success: false, error: e.message };
  }
}
export async function updateEntity(table: string, id: number, name: string) {
  
  const db = getDb();
  
  try {
    const stmt = db.prepare(`UPDATE ${table} SET name = ? WHERE id = ?`);
    stmt.run(name, id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

