'use client';

import { useState, useEffect } from 'react';
import { updateTripProgress, quickUpdateTripDetails } from '@/app/actions';
import SearchableSelect from './SearchableSelect';

export default function DashboardTripStatusForm({ 
  trip, 
  statuses, 
  subStatuses, 
  hasEditPermission,
  volunteers = [],
  drivers = [],
  vehicles = [],
  onSuccess
}: { 
  trip: any, 
  statuses: any[], 
  subStatuses: any[], 
  hasEditPermission: boolean,
  volunteers?: any[],
  drivers?: any[],
  vehicles?: any[],
  onSuccess?: () => void
}) {
  const [status, setStatus] = useState(trip.status);
  const [subStatus, setSubStatus] = useState(trip.sub_status || '');
  const [breakdownIssue, setBreakdownIssue] = useState(trip.breakdown_issue || '');
  const [notes, setNotes] = useState(trip.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const [volunteerId, setVolunteerId] = useState<number | null>(trip.volunteer_id);
  const [driverId, setDriverId] = useState<number | null>(trip.driver_id);
  const [vehicleReg, setVehicleReg] = useState(trip.vehicle_registration || ''); // This might need ID if we change logic, but existing used reg string
  // vehicleReg is string, but SearchableSelect usually works with IDs. 
  // For vehicles, let's map registration to ID if possible, OR adapt SearchableSelect.
  // Actually, SearchableSelect options need ID and Name.
  // Vehicles prop is likely [{id, registration, ...}].
  // Let's check vehicle prop structure passed from page.tsx. It comes from getVehicles(). 
  // Assuming getVehicles returns {id, registration, ...}.
  
  // We need to handle vehicle selection which currently expects registration string in DB but usually ID is better.
  // quickUpdateTripDetails uses vehicle_registration string to find/create.
  // But SearchableSelect works with IDs.
  // Let's use vehicle ID if available, but for now we might need to find the vehicle by reg to get ID.
  
  const [passengers, setPassengers] = useState(trip.passengers_boarded || 0);
  const [wheelchairs, setWheelchairs] = useState(trip.wheelchairs_boarded || 0);

  // Prepare options for SearchableSelect
  const volunteerOptions = volunteers.map(v => ({ id: v.id, name: v.name, phone: v.phone, alternate_phone: v.alternate_phone }));
  const driverOptions = drivers.map(d => ({ id: d.id, name: d.name, phone: d.phone, alternate_phone: d.alternate_phone }));
  // Vehicle options needs name property
  const vehicleOptions = vehicles.map(v => ({ id: v.id, name: v.registration, phone: v.make_model }));

  // Find initial vehicle ID from registration
  // We need to do this because trip has vehicle_registration but SearchableSelect uses ID
  const initialVehicle = vehicles.find(v => v.registration === trip.vehicle_registration);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | string>(initialVehicle ? initialVehicle.id : '');

  const availableSubStatuses = subStatuses.filter(ss => ss.linked_status === status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // We need to pass vehicle_registration to quickUpdateTripDetails
      // Find registration from selectedVehicleId
      let finalReg = vehicleReg;
      if (selectedVehicleId) {
        const v = vehicles.find(veh => veh.id == selectedVehicleId);
        if (v) finalReg = v.registration;
      }

      await updateTripProgress(trip.id, status, subStatus, breakdownIssue);
      await quickUpdateTripDetails(trip.id, volunteerId, driverId, finalReg, passengers, wheelchairs, notes);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Failed to update trip progress and details");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      
      {/* Inline Trip Editor */}
      
      {/* Notes Field (Moved Above Assignments) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Trip Notes / Remarks</h4>
        {hasEditPermission ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this trip..."
            rows={2}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        ) : (
          <div style={{ 
            padding: '10px', 
            borderRadius: '6px', 
            border: '1px solid #e2e8f0', 
            backgroundColor: '#f8fafc',
            color: notes ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontStyle: notes ? 'normal' : 'italic',
            whiteSpace: 'pre-wrap'
          }}>
            {notes || 'No notes added.'}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
        
        {/* Assignees */}
        {hasEditPermission ? (
          <>
            <div>
              <SearchableSelect
                label="Bus Incharge"
                name="volunteer_id"
                options={volunteerOptions}
                value={volunteerId || ''}
                onChange={(val) => setVolunteerId(val ? Number(val) : null)}
                placeholder="Select Incharge"
                addNewLabel="+ Add New Incharge"
              />
            </div>
            
            <div>
              <SearchableSelect
                label="Driver"
                name="driver_id"
                options={driverOptions}
                value={driverId || ''}
                onChange={(val) => setDriverId(val ? Number(val) : null)}
                placeholder="Select Driver"
                addNewLabel="+ Add New Driver"
              />
            </div>
            
            <div>
               <SearchableSelect
                label="Vehicle"
                name="vehicle_id" // We'll handle logic to extract reg
                options={vehicleOptions}
                value={selectedVehicleId}
                onChange={(val) => setSelectedVehicleId(val)}
                placeholder="Select Vehicle"
                type="vehicle"
                addNewLabel="+ Add New Vehicle"
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', height: '42px' }}>
              <span title="Bus Incharge" style={{ color: 'var(--text-primary)' }}>🙋 {trip.volunteer_name || 'Unassigned'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', height: '42px' }}>
              <span title="Driver" style={{ color: 'var(--text-primary)' }}>👨‍✈️ {trip.driver_name || 'Unassigned'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', height: '42px' }}>
              <span title="Vehicle" style={{ color: 'var(--text-primary)' }}>🚌 {trip.vehicle_registration || 'Unassigned'}</span>
            </div>
          </>
        )}

        {/* Counters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bbf7d0', height: '42px' }}>
            <span title="Passengers" style={{ color: '#166534', fontWeight: 600 }}>👥</span>
            {hasEditPermission ? (
              <input type="number" min="0" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="trip-inline-input" style={{ border: 'none', background: 'transparent', color: '#166534', fontWeight: 600, width: '50px', textAlign: 'center' }} />
            ) : (
              <span style={{ color: '#166534', fontWeight: 600 }}>{trip.passengers_boarded || 0}</span>
            )}
            <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.8rem' }}>pax</span>
          </div>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe', height: '42px' }}>
            <span title="Wheelchairs" style={{ color: '#1e40af', fontWeight: 600 }}>♿</span>
            {hasEditPermission ? (
              <input type="number" min="0" value={wheelchairs} onChange={(e) => setWheelchairs(Number(e.target.value))} className="trip-inline-input" style={{ border: 'none', background: 'transparent', color: '#1e40af', fontWeight: 600, width: '50px', textAlign: 'center' }} />
            ) : (
              <span style={{ color: '#1e40af', fontWeight: 600 }}>{trip.wheelchairs_boarded || 0}</span>
            )}
          </div>
        </div>

      </div>

      {/* Progress Status Editor */}
      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>Update Status</h4>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select 
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setSubStatus(''); // reset sub status when main status changes
          }}
          disabled={!hasEditPermission || isUpdating} 
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: hasEditPermission && !isUpdating ? 'white' : '#f1f5f9' }}
        >
          {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <select 
          value={subStatus}
          onChange={(e) => setSubStatus(e.target.value)}
          disabled={!hasEditPermission || isUpdating} 
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: hasEditPermission && !isUpdating ? 'white' : '#f1f5f9' }}
        >
          <option value="">-- Sub-Status --</option>
          {availableSubStatuses.map(ss => <option key={ss.id} value={ss.name}>{ss.name}</option>)}
        </select>

        {status === 'Breakdown' && (
          <input
            type="text"
            placeholder="Breakdown Details..."
            value={breakdownIssue}
            onChange={(e) => setBreakdownIssue(e.target.value)}
            disabled={!hasEditPermission || isUpdating}
            list="breakdown-options-inline"
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: hasEditPermission && !isUpdating ? 'white' : '#f1f5f9', minWidth: '200px' }}
          />
        )}
        <datalist id="breakdown-options-inline">
          <option value="Tire / Puncture" />
          <option value="Engine Overheating" />
          <option value="Battery / Electrical" />
          <option value="Brake Failure" />
          <option value="Accident / Collision" />
          <option value="Fuel Empty" />
          <option value="Unknown Cause" />
        </datalist>

        {hasEditPermission && (
          <button type="submit" disabled={isUpdating} className="btn nav-btn command-center-btn" style={{ padding: '8px 16px', margin: 0, opacity: isUpdating ? 0.7 : 1 }}>
            {isUpdating ? 'Updating...' : 'Update Progress'}
          </button>
        )}
      </div>

    </form>
  );
}
