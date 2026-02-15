'use client';

import { useState } from 'react';
import { Region, Venue, Location } from '@/lib/db';
import { createRegion, createVenue, createLocation, deleteEntity } from './actions';

import { updateEntity } from './actions';

export default function HierarchyManagerClient({ 
  initialRegions, 
  initialVenues, 
  initialLocations, 
  userRole 
}: { 
  initialRegions: Region[], 
  initialVenues: Venue[], 
  initialLocations: Location[],
  userRole: string
}) {
  const [regions, setRegions] = useState(initialRegions);
  const [venues, setVenues] = useState(initialVenues);
  const [locations, setLocations] = useState(initialLocations);
  const [expandedRegions, setExpandedRegions] = useState<number[]>([]);
  
  const toggleRegion = (id: number) => {
    setExpandedRegions(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  async function handleAddRegion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    try {
      const result = await createRegion(name);
      if (result.success) {
        setRegions([...regions, { id: Number(result.id!), name, created_at: new Date().toISOString() }]);
        (e.target as HTMLFormElement).reset();
      } else { alert(result.error); }
    } catch (err: any) { alert(err.message); }
  }

  async function handleAddVenue(e: React.FormEvent<HTMLFormElement>, regionId: number) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    try {
      const result = await createVenue(name, regionId);
      if (result.success) {
        setVenues([...venues, { id: Number(result.id!), name, region_id: regionId, created_at: new Date().toISOString() }]);
        (e.target as HTMLFormElement).reset();
      } else { alert(result.error); }
    } catch (err: any) { alert(err.message); }
  }

  async function handleAddRegionLocation(e: React.FormEvent<HTMLFormElement>, regionId: number) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    try {
      const result = await createLocation(name, null, regionId);
      if (result.success) {
        setLocations([...locations, { id: Number(result.id!), name, venue_id: null, region_id: regionId, created_at: new Date().toISOString() }]);
        (e.target as HTMLFormElement).reset();
      } else { alert(result.error); }
    } catch (err: any) { alert(err.message); }
  }

  async function handleAddDropoff(e: React.FormEvent<HTMLFormElement>, venueId: number, regionId: number) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    try {
      const result = await createLocation(name, venueId, regionId);
      if (result.success) {
        setLocations([...locations, { id: Number(result.id!), name, venue_id: venueId, region_id: regionId, created_at: new Date().toISOString() }]);
        (e.target as HTMLFormElement).reset();
      } else { alert(result.error); }
    } catch (err: any) { alert(err.message); }
  }

  async function handleEdit(table: string, id: number, currentName: string, setter: any, list: any[]) {
    const newName = prompt('Enter new name:', currentName);
    if (!newName || newName === currentName) return;
    try {
      const res = await updateEntity(table, id, newName);
      if (res.success) {
        setter(list.map(item => item.id === id ? { ...item, name: newName } : item));
      } else {
        alert(res.error);
      }
    } catch (err: any) { alert(err.message); }
  }

  async function handleDelete(type: string, id: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const result = await deleteEntity(type, id);
      if (result.success) {
        if (type === 'regions') {
          setRegions(r => r.filter(x => x.id !== id));
          setVenues(v => v.filter(x => x.region_id !== id));
          setLocations(l => l.filter(x => x.region_id !== id));
        }
        if (type === 'venues') {
          setVenues(v => v.filter(x => x.id !== id));
          setLocations(l => l.filter(x => x.venue_id !== id));
        }
        if (type === 'locations') setLocations(l => l.filter(x => x.id !== id));
      } else {
        alert(result.error);
      }
    } catch (err: any) { alert(err.message); }
  }

  
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      

      {userRole === 'SUPER_ADMIN' && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          
          <form onSubmit={handleAddRegion} style={{ display: 'flex', gap: '12px' }}>
            <input name="name" placeholder="e.g. Western India" required style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} />
            <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}>+ Add Region</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {regions.map(region => (
          <div key={region.id} style={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderLeft: '6px solid #1e40af', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedRegions.includes(region.id) ? '24px' : '0' }}>
              <div 
                onClick={() => toggleRegion(region.id)} 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: expandedRegions.includes(region.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s', color: '#64748b', fontSize: '12px'
                }}>
                  ▶
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{region.name}</h2>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Region ID: {region.id}</span>
                </div>
              </div>
              
              {userRole === 'SUPER_ADMIN' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit('regions', region.id, region.name, setRegions, regions)} style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>Edit Region</button>
                  <button onClick={() => handleDelete('regions', region.id)} style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>Delete Region</button>
                </div>
              )}
            </div>

            {expandedRegions.includes(region.id) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', animation: 'fadeIn 0.3s ease-in-out' }}>
                
                {/* Left Column: Region Locations */}
                <div style={{ paddingRight: '32px', borderRight: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>📍 Pickup Locations</h3>
                  
                  <form onSubmit={(e) => handleAddRegionLocation(e, region.id)} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input name="name" placeholder="New Pickup Location..." required style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem' }}>+ Add</button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {locations.filter(l => l.region_id === region.id && l.venue_id === null).map(loc => (
                      <div key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontWeight: 500, color: '#1e293b', flex: 1 }}>{loc.name}</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button onClick={() => handleEdit('locations', loc.id, loc.name, setLocations, locations)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
                          <button onClick={() => handleDelete('locations', loc.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Venues Hierarchy */}
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#3b82f6', borderBottom: '2px solid #bfdbfe', paddingBottom: '8px' }}>🎉 Event Venues</h3>
                  
                  <form onSubmit={(e) => handleAddVenue(e, region.id)} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input name="name" placeholder="Create Event Venue..." required style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #bfdbfe' }} />
                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9rem' }}>+ Venue</button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {venues.filter(v => v.region_id === region.id).map(venue => (
                      <div key={venue.id} style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '1.05rem', flex: 1 }}>{venue.name}</span>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => handleEdit('venues', venue.id, venue.name, setVenues, venues)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Edit Venue</button>
                            <button onClick={() => handleDelete('venues', venue.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Delete Venue</button>
                          </div>
                        </div>

                        {/* Drop-offs */}
                        <form onSubmit={(e) => handleAddDropoff(e, venue.id, region.id)} style={{ display: 'flex', gap: '8px', marginBottom: '10px', paddingLeft: '8px', borderLeft: '2px dashed #93c5fd' }}>
                          <input name="name" placeholder="Add Sub-Drop-off (e.g. Gate 1)" required style={{ flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #93c5fd', fontSize: '0.85rem' }} />
                          <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#60a5fa', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.85rem' }}>+ Drop-off</button>
                        </form>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '8px', borderLeft: '2px dashed #93c5fd' }}>
                          {locations.filter(l => l.venue_id === venue.id).map(dropoff => (
                            <div key={dropoff.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #bfdbfe', fontSize: '0.8rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                              <span style={{color: '#1e3a8a', fontWeight: 500}}>{dropoff.name}</span>
                              <button onClick={() => handleEdit('locations', dropoff.id, dropoff.name, setLocations, locations)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold', marginLeft: '4px' }}>✎</button>
                              <button onClick={() => handleDelete('locations', dropoff.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold', marginLeft: '4px' }}>✕</button>
                            </div>
                          ))}
                          {locations.filter(l => l.venue_id === venue.id).length === 0 && (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No drop-offs assigned. Trips will route to the Main Venue directly.</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {venues.filter(v => v.region_id === region.id).length === 0 && (
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>No Event Venues configured for this region.</div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}

        {regions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
            No Regions registered. Create your first cluster to map locations and events.
          </div>
        )}
      </div>
    </div>
  );
}
