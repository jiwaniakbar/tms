'use client';

import { createTrip, updateTrip, deleteTrip } from '@/app/actions';
import { Trip, Vehicle, Profile, TripSubStatus } from '@/lib/db';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import LocationSelector from './LocationSelector';

export interface TripStatus {
  id: number;
  name: string;
  passenger_count_required: number;
  sort_order: number;
}

export default function TripForm({ 
  trip, 
  vehicles, 
  volunteers, 
  subStatuses = [], 
  locations = [], 
  statuses = [], 
  hierarchy,
  defaultRegionId,
  onSuccess,
  onCancel,
  isReadOnly = false
}: { 
  trip?: any, 
  vehicles: any[], 
  volunteers: any[], 
  subStatuses?: any[], 
  locations?: any[], 
  statuses?: any[], 
  hierarchy?: any,
  defaultRegionId?: number | null,
  onSuccess?: () => void, 
  onCancel?: () => void,
isReadOnly?: boolean
}) {
  const isEditing = !!trip;
  const [isRoutingExpanded, setIsRoutingExpanded] = useState(!isEditing);
  
  // Set region state based on predefined trip origin, or user's assigned defaultRegionId
  // Set region state based on predefined trip origin, or user's assigned defaultRegionId
  const getInitialRegion = () => {
    if (trip && hierarchy) {
      if (trip.region_id) return trip.region_id;
      if (trip.origin_venue_id) {
         const v = hierarchy.venues.find((ev:any) => ev.id.toString() === trip.origin_venue_id.toString());
         if (v) return v.region_id;
      } else if (trip.origin_id) {
         const loc = hierarchy.locations.find((l:any) => l.id.toString() === trip.origin_id.toString());
         if (loc) {
           if (loc.region_id) return loc.region_id;
           if (loc.venue_id) {
             const v = hierarchy.venues.find((ev:any) => ev.id.toString() === loc.venue_id.toString());
             if (v) return v.region_id;
           }
         }
      }
    }
    return defaultRegionId || '';
  };

  const [regionId, setRegionId] = useState<number | ''>(getInitialRegion());
  
  // Determine initial types for Origin and Destination based on trip data
  const getInitialType = (locId?: number, venueId?: number) => {
    if (venueId) return 'venue';
    if (locId && hierarchy?.locations) {
      const loc = hierarchy.locations.find((l: any) => l.id == locId);
      if (loc && loc.venue_id) return 'venue';
    }
    return 'region';
  };

  const [originType, setOriginType] = useState<'region' | 'venue'>(getInitialType(trip?.origin_id, trip?.origin_venue_id));

  // For new trips (no trip data), default destination to 'venue' if origin is 'region', and vice versa.
  // For existing trips, trust the data.
  const [destinationType, setDestinationType] = useState<'region' | 'venue'>(() => {
    if (trip) {
      return getInitialType(trip?.destination_id, trip?.destination_venue_id);
    }
    // Default logic for new trips
    const initialOrigin = getInitialType(trip?.origin_id, trip?.origin_venue_id); // which is just 'region' usually
    return initialOrigin === 'region' ? 'venue' : 'region';
  });

  const handleOriginTypeChange = (newType: 'region' | 'venue') => {
    setOriginType(newType);
    // Auto-switch destination type
    if (newType === 'region') setDestinationType('venue');
    if (newType === 'venue') setDestinationType('region');
  };

  
  // Watch for dynamic defaultRegionId passing in on modals
  useEffect(() => {
    if (!trip && defaultRegionId) {
      setRegionId(defaultRegionId);
    }
  }, [defaultRegionId, trip]);
  const getNowInLocal = () => {
    const now = new Date();
    // Adjust for local timezone offset
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const getTodayAtMidnight = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    // Just YYYY-MM-DD
    const localDate = (new Date(now.getTime() - offset)).toISOString().slice(0, 10);
    return localDate;
  };

  // Using individual date and time fields.
  
  const vehicleOptions = vehicles.map(v => ({ id: v.id, name: `${v.registration}${v.make_model ? ` (${v.make_model})` : ''}` }));
  
  const action = async (formData: FormData) => {
    // Re-combine the date and time parts into ISO string for the database
    const startDate = formData.get('start_date_part');
    const startTime = formData.get('start_time_part') || '00:00';
    if (startDate) {
      formData.set('start_time', `${startDate}T${startTime}`);
    }

    const endDate = formData.get('end_date_part');
    const endTime = formData.get('end_time_part') || '00:00';
    if (endDate) {
      formData.set('end_time', `${endDate}T${endTime}`);
    }

    const coreStatusDef = statuses.find(s => s.name === currentStatus);
    if (coreStatusDef?.passenger_count_required) {
      if (passengersBoarded <= 0) {
        setError(`Passenger count is required to set status to ${currentStatus}`);
        return;
      }
    }

    if (onSuccess) {
      formData.set('no_redirect', 'true');
    }
    const fn = isEditing ? updateTrip.bind(null, trip.id) : createTrip;
    
    try {
      const res = await fn(formData);
      if (res?.success) {
        setError('');
        if (onSuccess) onSuccess();
      } else {
        setError(res?.error || 'Failed to save trip');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const [currentStatus, setCurrentStatus] = useState(trip?.status || 'Scheduled');
  const [currentSubStatus, setCurrentSubStatus] = useState(trip?.sub_status || 'Scheduled');
  const [passengersBoarded, setPassengersBoarded] = useState(trip?.passengers_boarded || 0);
  const [wheelchairsBoarded, setWheelchairsBoarded] = useState(trip?.wheelchairs_boarded || 0);
  const [error, setError] = useState('');

  // Sync Master Status when a sub-status is picked
  useEffect(() => {
    const selectedObj = subStatuses.find(s => s.name === currentSubStatus);
    if (selectedObj && selectedObj.linked_status) {
      if (selectedObj.linked_status !== currentStatus) {
        setCurrentStatus(selectedObj.linked_status);
      }
    }
  }, [currentSubStatus, subStatuses]);

  return (
    <form action={action} className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      
      {/* SECTION 1: Geography & Routing */}
      {isRoutingExpanded ? (
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>📍 Routing Information</h3>
            {isEditing && !isReadOnly && (
              <button 
                type="button" 
                onClick={() => setIsRoutingExpanded(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Collapse
              </button>
            )}
          </div>
          
        
        <div className="input-group" style={{ marginBottom: '16px' }}>
          <label className="input-label" htmlFor="route_code">Route Code</label>
          <input className="input-field" type="text" id="route_code" name="route_code" required defaultValue={trip?.route_code} placeholder="e.g. PNQ-001" style={{ maxWidth: '400px', width: '100%' }} />
        </div>

        {hierarchy && (
           <div className="input-group" style={{ marginBottom: '24px' }}>
             <label className="input-label" htmlFor="region_id" style={{ color: "#0f172a" }}>Region</label>
             <select 
               name="region_id_display" 
               className="input-field" 
               value={regionId} 
               onChange={(e) => setRegionId(Number(e.target.value))} 
               required 
               disabled={!!defaultRegionId} // Lock it if user is a Region Admin
               title={defaultRegionId ? "Region locked to your administrative boundaries" : ""}
               style={{ backgroundColor: defaultRegionId ? '#f1f5f9' : '#ffffff', maxWidth: '400px', width: '100%' }}
             >
               <option value="" disabled>Select Region</option>
               {hierarchy.regions.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
             </select>
             <input type="hidden" name="region_id" value={regionId} />
             {defaultRegionId && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Region locked to your administrative boundaries.</div>}
           </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="start_time" style={{ color: '#0f172a' }}>Start Time</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="input-field" 
                type="date" 
                id="start_date_part" 
                name="start_date_part" 
                required 
                defaultValue={trip?.start_time ? trip.start_time.split('T')[0] : getTodayAtMidnight()} 
                style={{ flex: 1 }}
              />
              <input 
                className="input-field" 
                type="time" 
                id="start_time_part" 
                name="start_time_part" 
                required
                defaultValue={trip?.start_time && trip.start_time.includes('T') ? trip.start_time.split('T')[1].substring(0,5) : getNowInLocal().split('T')[1]} 
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="end_time" style={{ color: '#0f172a' }}>Estimated End Time</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="input-field" 
                type="date" 
                id="end_date_part" 
                name="end_date_part" 
                required 
                defaultValue={trip?.end_time ? trip.end_time.split('T')[0] : getTodayAtMidnight()} 
                style={{ flex: 1 }}
              />
              <input 
                className="input-field" 
                type="time" 
                id="end_time_part" 
                name="end_time_part" 
                defaultValue={trip?.end_time && trip.end_time.includes('T') ? trip.end_time.split('T')[1].substring(0,5) : ''} 
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
           <div style={{ height: '100%' }}>
             <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '100%' }}>
                  <LocationSelector
                    label="📍 Origin"
                    name="origin_id"
                    hierarchy={hierarchy}
                    regionId={regionId}
                    defaultLocationId={trip?.origin_id?.toString()}
                    defaultVenueId={trip?.origin_venue_id?.toString()}
                    type={originType}
                    onTypeChange={handleOriginTypeChange}
                  />
               </div>
           </div>
           <div style={{ height: '100%' }}>
             <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '100%' }}>
                  <LocationSelector
                    label="🏁 Destination"
                    name="destination_id"
                    hierarchy={hierarchy}
                    regionId={regionId}
                    defaultLocationId={trip?.destination_id?.toString()}
                    defaultVenueId={trip?.destination_venue_id?.toString()}
                    type={destinationType}
                    onTypeChange={setDestinationType}
                  />
               </div>
           </div>
        </div>

      
        </div>
      ) : (
        <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
                <div style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '4px', fontWeight: 800 }}>{trip?.route_code || 'New Route'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#475569', fontSize: '1rem', marginBottom: '6px' }}>
              <span>{trip?.origin_name || trip?.origin_venue_name || trip?.origin}</span>
              <span style={{ color: '#94a3b8' }}>➔</span>
              <span>{trip?.destination_name || trip?.destination_venue_name || trip?.destination}</span>
            </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>📅 {trip?.start_time ? new Date(trip.start_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '').replace(/ /g, '-').replace(/-(\d{2}:\d{2})/, ' $1') : 'Unknown'}</span>
              {trip?.end_time && <span>🏁 {new Date(trip.end_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace(',', '').replace(/ /g, '-').replace(/-(\d{2}:\d{2})/, ' $1')}</span>}
            </div>
            {/* Hidden inputs to ensure data is submitted if not expanded */}
            <input type="hidden" name="route_code" value={trip?.route_code || ''} />
            <input type="hidden" name="region_id" value={trip?.region_id || ''} />
            <input type="hidden" name="origin_id" value={trip?.origin_id || ''} />
            <input type="hidden" name="origin_venue_id" value={trip?.origin_venue_id || ''} />
            <input type="hidden" name="destination_id" value={trip?.destination_id || ''} />
            <input type="hidden" name="destination_venue_id" value={trip?.destination_venue_id || ''} />
                {/* Hidden fields to ensure start_time/end_time are submitted when section is collapsed */}
                <input type="hidden" name="start_time" value={trip?.start_time || ''} />
                <input type="hidden" name="end_time" value={trip?.end_time || ''} />
          </div>
          {!isReadOnly && (
            <button 
              type="button" 
              onClick={() => setIsRoutingExpanded(true)}
              style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Edit Route
            </button>
          )}
        </div>
      )}

      {/* SECTION 3: Progress & Real-time Update (Elevated) */}
      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>📡 Trip Progress</h3>
        
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

            {/* Status Selection Refactor */}
            <div className="input-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="input-label" htmlFor="status" style={{ color: '#0f172a' }}>Status</label>
              <select
                className="input-field"
                id="status"
                name="status"
                required
                value={currentStatus}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setCurrentStatus(newStatus);
                  // Auto-select first sub-status if available, or just use the status itself
                  const availableSubs = subStatuses.filter(s => s.linked_status === newStatus).sort((a, b) => a.sort_order - b.sort_order);
                  if (availableSubs.length > 0) {
                    setCurrentSubStatus(availableSubs[0].name);
                  } else {
                    // For statuses like Breakdown/Cancelled that might not have sub-statuses
                    // We can reuse the status name as sub-status or keep it empty/default
                    // Legacy logic used 'Scheduled' as fallback, but let's try to be smarter
                    setCurrentSubStatus(newStatus);
                  }
                }}
                style={{ fontWeight: 600, color: '#3b82f6', backgroundColor: '#ffffff', height: '48px' }}
              >
                {statuses.sort((a: any, b: any) => a.sort_order - b.sort_order).map((s: any) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Sub-Status logic: Only show if there are sub-statuses for this core status OR if we want to allow free-text? No, strict for now. */}
            <div className="input-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="input-label" htmlFor="sub_status" style={{ color: '#0f172a' }}>Sub-Status / Detail</label>
              <select
                className="input-field"
                id="sub_status"
                name="sub_status"
                required
                value={currentSubStatus}
                onChange={(e) => setCurrentSubStatus(e.target.value)}
                style={{ fontWeight: 500, color: '#475569', backgroundColor: '#ffffff', height: '48px' }}
              >
                {subStatuses.filter(s => s.linked_status === currentStatus).sort((a, b) => a.sort_order - b.sort_order).map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
                {/* Fallback option if no sub-statuses exist for this core status */}
                {subStatuses.filter(s => s.linked_status === currentStatus).length === 0 && (
                  <option value={currentStatus}>{currentStatus}</option>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', flex: '0 1 auto', flexWrap: 'nowrap' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', height: '48px', backgroundColor: '#ffffff' }}>
                  <div style={{ padding: '0 12px', borderRight: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', height: '100%' }}>
                    👥 {statuses.find(s => s.name === currentStatus)?.passenger_count_required ? <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span> : ''}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassengersBoarded(Math.max(0, passengersBoarded - 1))}
                    style={{ width: '36px', backgroundColor: 'transparent', border: 'none', borderRight: '1px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 600, color: '#475569', cursor: 'pointer', height: '100%', outline: 'none' }}
                  >
                    -
                  </button>
                  <input
                    className="input-field"
                    type="number"
                    id="passengers_boarded"
                    name="passengers_boarded"
                    value={passengersBoarded}
                    onChange={e => setPassengersBoarded(parseInt(e.target.value) || 0)}
                    min="0" 
                    style={{ width: '50px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', fontSize: '1.1rem', fontWeight: 700, borderRadius: 0, height: '100%', padding: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => setPassengersBoarded(passengersBoarded + 1)}
                    style={{ width: '36px', backgroundColor: 'transparent', border: 'none', borderLeft: '1px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 600, color: '#475569', cursor: 'pointer', height: '100%', outline: 'none' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', height: '48px', backgroundColor: '#ffffff' }}>
                  <div style={{ padding: '0 12px', borderRight: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', height: '100%' }}>
                    ♿
                  </div>
                  <button
                    type="button"
                    onClick={() => setWheelchairsBoarded(Math.max(0, wheelchairsBoarded - 1))}
                    style={{ width: '36px', backgroundColor: 'transparent', border: 'none', borderRight: '1px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 600, color: '#475569', cursor: 'pointer', height: '100%', outline: 'none' }}
                  >
                    -
                  </button>
                  <input
                    className="input-field"
                    type="number"
                    id="wheelchairs_boarded"
                    name="wheelchairs_boarded"
                    value={wheelchairsBoarded}
                    onChange={e => setWheelchairsBoarded(parseInt(e.target.value) || 0)}
                    min="0" 
                    style={{ width: '40px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', fontSize: '1.1rem', fontWeight: 700, borderRadius: 0, height: '100%', padding: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => setWheelchairsBoarded(wheelchairsBoarded + 1)}
                    style={{ width: '36px', backgroundColor: 'transparent', border: 'none', borderLeft: '1px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 600, color: '#475569', cursor: 'pointer', height: '100%', outline: 'none' }}
                  >
                    +
                  </button>
                </div>
            </div>
          </div>


        </div>

        {/* Breakdown Context */}
        <div className="input-group" style={{ display: currentStatus === 'Breakdown' ? 'block' : 'none', marginTop: '16px', marginBottom: 0 }}>
          <label className="input-label" htmlFor="breakdown_issue" style={{ color: 'var(--danger)' }}>⚠️ Breakdown Category</label>
          <input 
            list="breakdown-options" 
            className="input-field" 
            id="breakdown_issue" 
            name="breakdown_issue" 
            defaultValue={trip?.breakdown_issue || ''} 
            placeholder="e.g. Flat Tire, Overheated" 
            style={{ borderColor: 'var(--danger)', backgroundColor: '#ffffff' }}
          />
          <datalist id="breakdown-options">
            <option value="Tire / Puncture" />
            <option value="Engine Overheating" />
            <option value="Battery / Electrical" />
            <option value="Brake Failure" />
            <option value="Accident / Collision" />
            <option value="Fuel Empty" />
            <option value="Unknown Cause" />
          </datalist>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assignments</h4>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <SearchableSelect 
              label="Assigned Vehicle"
              name="vehicle_id"
              type="vehicle"
              options={vehicleOptions}
              defaultValue={trip?.vehicle_id ?? undefined}
              placeholder="Search vehicles..."
              addNewLabel="+ Add New Vehicle"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <SearchableSelect
                label="Assigned Bus Incharge"
                name="volunteer_id"
                type="person"
                options={volunteers}
                defaultValue={trip?.volunteer_id ?? undefined}
                placeholder="-- Search Bus Incharges --"
                addNewLabel="+ Add New Bus Incharge"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <SearchableSelect
                label="Assigned Driver"
                name="driver_id"
                type="person"
                options={volunteers}
                defaultValue={trip?.driver_id ?? undefined}
                placeholder="-- Search Drivers --"
                addNewLabel="+ Add New Driver"
              />
            </div>
          </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0, marginTop: '16px' }}>
            <label className="input-label" htmlFor="notes">📝 Trip Notes / Remarks</label>
            <textarea
              className="input-field"
              id="notes"
              name="notes"
              rows={3}
              defaultValue={trip?.notes || ''}
              placeholder="Add any extra details, passenger requirements, or instructions..."
              style={{ minHeight: '80px', resize: 'vertical' }}
            />
        </div>
      </div>

      {/* Error Message Space */}
      {error && <div className="error-message" style={{ color: '#ef4444', fontWeight: 500, padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>{error}</div>}

      
      {!isReadOnly && (
        <>
          </>
      )}
      
      {!isReadOnly && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px', fontSize: '1.05rem', fontWeight: 600 }}>
            {trip ? 'Save Changes' : 'Create Trip'}
          </button>
          {onCancel ? (
            <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '14px', fontSize: '1.05rem', fontWeight: 600 }} onClick={onCancel}>Cancel</button>
          ) : (
            <Link href="/trips" className="btn" style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', textAlign: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cancel</Link>
          )}
        </div>
      )}
      </fieldset>
    </form>
  );
}
