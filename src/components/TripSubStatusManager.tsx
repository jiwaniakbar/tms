'use client';

import { createTripSubStatus, deleteTripSubStatus } from '@/app/actions';
import { TripSubStatus } from '@/lib/db';

import { useState } from 'react';

import { TripStatus } from '@/components/TripForm';

function StatusItem({ status, coreStatuses }: { status: TripSubStatus, coreStatuses: TripStatus[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(formData: FormData) {
    setSaving(true);
    const { updateTripSubStatus } = await import('@/app/actions');
    const res = await updateTripSubStatus(status.id, formData);
    setSaving(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <form action={handleSave} style={{ 
        display: 'flex', flexDirection: 'column', gap: '8px', 
        padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' 
      }}>
        <input className="filter-select" type="text" name="name" defaultValue={status.name} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        <select className="filter-select" name="linked_status" defaultValue={status.linked_status} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
          {coreStatuses.map(cs => (
            <option key={cs.id} value={cs.name}>{cs.name}</option>
          ))}
          {coreStatuses.length === 0 && <option value={status.linked_status}>{status.linked_status}</option>}
        </select>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input className="filter-select" type="number" name="sort_order" defaultValue={status.sort_order} style={{ width: "80px", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
          <div style={{ flex: 1 }}></div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Save</button>
          <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: '8px',
      cursor: 'pointer'
    }} onClick={(e) => {
      // Don't trigger edit if they clicked the delete button
      if ((e.target as HTMLElement).closest('.delete-btn')) return;
      setIsEditing(true);
    }}>
      <div>
        <strong style={{ display: 'block' }}>{status.name}</strong>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Linked to: {status.linked_status} (Order: {status.sort_order})
        </span>
      </div>
      <form action={async () => {
        const { deleteTripSubStatus } = await import('@/app/actions');
        await deleteTripSubStatus(status.id);
      }}>
        <button type="submit" className="btn-icon delete-btn" style={{ padding: '8px', color: '#ef4444' }} title="Delete">
          ✕
        </button>
      </form>
    </div>
  );
}

export default function TripSubStatusManager({ statuses, coreStatuses = [] }: { statuses: TripSubStatus[], coreStatuses?: TripStatus[] }) {

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <form action={createTripSubStatus} className="animate-in">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>
          Add Custom Trip Progress Status
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="filter-label" htmlFor="name">Progress Name</label>
            <input className="filter-select" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }} type="text" id="name" name="name" required placeholder="e.g. Delayed at border" />
          </div>

          <div className="input-group">
            <label className="filter-label" htmlFor="linked_status">Link to Core System Status</label>
            <select className="filter-select" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }} id="linked_status" name="linked_status" required defaultValue="Active">
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
          <option value="Arriving">Arriving</option>
              <option value="Completed">Completed</option>
              <option value="Breakdown">Breakdown</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="input-group">
            <label className="filter-label" htmlFor="sort_order">Sort Order (Lower appears first)</label>
            <input className="filter-select" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }} type="number" id="sort_order" name="sort_order" defaultValue="100" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
            + Add Progress Link
          </button>
        </div>
      </form>

      <div className="animate-in" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>
          Configured Progress Statuses
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {statuses.map((status) => (<StatusItem key={status.id} status={status} coreStatuses={coreStatuses} />))}
        </div>
      </div>
    </div>
  );
}
