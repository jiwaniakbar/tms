'use client';

import { createTripStatus, deleteTripStatus } from '@/app/actions';
import { TripStatus } from '@/components/TripForm';

import { useState } from 'react';

function StatusItem({ status }: { status: TripStatus }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(formData: FormData) {
    setSaving(true);
    const { updateTripStatus } = await import('@/app/actions');
    const res = await updateTripStatus(status.id, formData);
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
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Core Status Name</label>
        <input className="filter-select" type="text" name="name" defaultValue={status.name} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '4px' }}>
          <input type="checkbox" name="passenger_count_required" value="true" defaultChecked={status.passenger_count_required === 1} style={{ width: '16px', height: '16px' }} />
          <span>Require Passenger Count to save (must be &gt; 0)?</span>
        </label>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sort Order</label>
          <input className="filter-select" type="number" name="sort_order" defaultValue={status.sort_order} style={{ width: "80px", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="submit" disabled={saving} style={{ 
            padding: '6px 16px', 
            backgroundColor: 'var(--accent)', 
            color: 'white', 
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => setIsEditing(false)} style={{ 
            padding: '6px 16px', 
            backgroundColor: 'white', 
            color: 'var(--text-secondary)', 
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '12px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
      cursor: 'pointer'
    }}
    onClick={() => setIsEditing(true)}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{status.name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginTop: '4px' }}>
          <span>Order: {status.sort_order}</span>
          <span>•</span>
          <span style={{ color: status.passenger_count_required ? 'var(--accent)' : 'inherit', fontWeight: status.passenger_count_required ? 600 : 400 }}>
            {status.passenger_count_required ? 'Passengers Required (Y)' : 'Passengers Optional (N)'}
          </span>
        </div>
      </div>
      <form action={async () => {
        if (confirm('Are you sure you want to delete this status?')) {
          await deleteTripStatus(status.id);
        }
      }} onClick={(e) => e.stopPropagation()}>
        <button type="submit" style={{ 
          background: 'none', border: 'none', color: '#ef4444', 
          cursor: 'pointer', padding: '4px', fontSize: '1.2rem',
          lineHeight: 1
        }} title="Delete Status">×</button>
      </form>
    </div>
  );
}

export default function TripStatusManager({ statuses }: { statuses: TripStatus[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [working, setWorking] = useState(false);

  async function handleAdd(formData: FormData) {
    setWorking(true);
    const res = await createTripStatus(formData);
    setWorking(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsAdding(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {statuses.map(s => (
          <StatusItem key={s.id} status={s} />
        ))}
        {statuses.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            No Core Statuses Configured.
          </div>
        )}
      </div>

      {isAdding ? (
        <form action={handleAdd} style={{ 
          display: 'flex', flexDirection: 'column', gap: '12px', 
          padding: '16px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', marginTop: '8px'
        }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Core Status Name</label>
            <input className="filter-select" type="text" name="name" placeholder="e.g. Active" required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", marginTop: '4px' }} />
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '4px' }}>
            <input type="checkbox" name="passenger_count_required" value="true" style={{ width: '16px', height: '16px' }} />
            <span>Require Passenger Count to save (must be &gt; 0)?</span>
          </label>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sort Order</label>
            <input className="filter-select" type="number" name="sort_order" defaultValue={statuses.length + 1} style={{ width: "80px", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" disabled={working} style={{ 
              padding: '8px 16px', 
              backgroundColor: 'var(--accent)', 
              color: 'white', 
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              {working ? 'Saving...' : 'Add Status'}
            </button>
            <button type="button" onClick={() => setIsAdding(false)} style={{ 
              padding: '8px 16px', 
              backgroundColor: 'white', 
              color: 'var(--text-secondary)', 
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} style={{
          padding: '10px',
          backgroundColor: 'white',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          color: 'var(--accent)',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '8px'
        }}>
          + Add New Core Status
        </button>
      )}
    </div>
  );
}
