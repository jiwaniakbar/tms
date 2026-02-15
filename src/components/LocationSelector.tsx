'use client';

import { useState, useEffect } from 'react';

export default function LocationSelector({
  label,
  name,
  hierarchy,
  regionId,
  defaultLocationId,
  defaultVenueId,
  required = true,
  type,
  onTypeChange,
}: {
  label: string;
    name: string;
  hierarchy: any;
  regionId: number | '';
  defaultLocationId?: string;
  defaultVenueId?: string;
  required?: boolean;
    type?: 'region' | 'venue';
    onTypeChange?: (type: 'region' | 'venue') => void;
}) {
  const { venues, locations } = hierarchy;
  
  // Predict initial mode based on default data if not controlled
  let initialType: 'region' | 'venue' = 'region';
  let initialVenueId = defaultVenueId || '';
  let initialLocationId = defaultLocationId || '';

  if (defaultVenueId) {
     initialType = 'venue';
  } else if (defaultLocationId) {
     const loc = locations.find((l: any) => l.id.toString() === defaultLocationId.toString());
     if (loc && loc.venue_id) {
       initialType = 'venue';
       initialVenueId = loc.venue_id.toString();
     }
  }

  // Internal state for uncontrolled mode
  const [internalType, setInternalType] = useState<'region' | 'venue'>(initialType);
  const [venueId, setVenueId] = useState(initialVenueId);
  const [locationId, setLocationId] = useState(initialLocationId);

  // Use controlled type if provided, otherwise internal
  const currentType = type !== undefined ? type : internalType;

  const handleTypeChange = (newType: 'region' | 'venue') => {
    if (onTypeChange) {
      onTypeChange(newType);
    } else {
      setInternalType(newType);
    }
  };

  // Filter options based on region and selections
  const regionLocations = locations.filter((l: any) => l.region_id === Number(regionId) && l.venue_id === null);
  const availableVenues = venues.filter((v: any) => v.region_id === Number(regionId));
  const availableDropoffs = locations.filter((l: any) => l.venue_id === Number(venueId));

  // Auto-clear downstream selections if upstream changes
  useEffect(() => {
    // If we changed to 'region' mode, clear venueId and ensure locationId doesn't belong to a venue
    if (currentType === 'region') {
      setVenueId(''); 
      const loc = locations.find((l: any) => l.id.toString() === locationId);
      if (loc && loc.venue_id) setLocationId('');
    } else {
      // It's 'venue', if locationId belongs to a region location, clear it
      const loc = locations.find((l: any) => l.id.toString() === locationId);
      if (loc && !loc.venue_id) setLocationId('');
    }
  }, [currentType, regionId]);
  
  // Note: if type is 'venue', the trip MUST provide either a locationId (drop-off) OR a venueId 
  // We feed this through Hidden inputs to the Server Actions which accept `origin_venue_id` or `origin_id`

  const fieldPrefix = name.split('_')[0]; // "origin" or "destination"
  
  const venueInputName = `${fieldPrefix}_venue_id`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{label}</label>
      
      {!regionId ? (
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Please select a Region first.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ 
              fontSize: '0.85rem', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
                backgroundColor: currentType === 'region' ? '#e0f2fe' : '#f1f5f9', color: currentType === 'region' ? '#0369a1' : '#64748b', border: currentType === 'region' ? '1px solid #bae6fd' : '1px solid transparent'
            }}>
                <input type="radio" value="region" checked={currentType === 'region'} onChange={(e) => handleTypeChange(e.target.value as any)} style={{ display: 'none' }} />
              Pickup Location
            </label>
            <label style={{ 
              fontSize: '0.85rem', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s',
                backgroundColor: currentType === 'venue' ? '#e0f2fe' : '#f1f5f9', color: currentType === 'venue' ? '#0369a1' : '#64748b', border: currentType === 'venue' ? '1px solid #bae6fd' : '1px solid transparent'
            }}>
                <input type="radio" value="venue" checked={currentType === 'venue'} onChange={(e) => handleTypeChange(e.target.value as any)} style={{ display: 'none' }} />
              Event Venue
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {currentType === 'region' ? (
              <select 
                className="input-field" 
                value={locationId} 
                onChange={(e) => setLocationId(e.target.value)} 
                required={required} 
                style={{ flex: 1, minWidth: '200px' }}
              >
                <option value="" disabled>Select Pickup Location...</option>
                {regionLocations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            ) : (
              <>
                <select className="input-field" value={venueId} onChange={(e) => { setVenueId(e.target.value); setLocationId(''); }} required={required} style={{ flex: 1, minWidth: '150px' }}>
                  <option value="" disabled>Select Event Venue...</option>
                  {availableVenues.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>

                {availableDropoffs.length > 0 && (
                  <select className="input-field" value={locationId} onChange={(e) => setLocationId(e.target.value)} style={{ flex: 1, minWidth: '150px' }}>
                    <option value="">-- Main Venue (No Specific Gate/Drop-off) --</option>
                    {availableDropoffs.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                )}
              </>
            )}
          </div>

          {/* Hidden inputs to pass data back to Server Action */}
            {currentType === 'region' ? (
             <input type="hidden" name={name} value={locationId} required={required} />
          ) : (
             <>
                <input type="hidden" name={venueInputName} value={venueId} required={required} />
                {/* Only pass locationId if one is actually selected inside the Venue */}
                {locationId && <input type="hidden" name={name} value={locationId} />}
             </>
          )}

        </div>
      )}
    </div>
  );
}
