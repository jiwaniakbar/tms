'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TripStatus } from '@/components/TripForm';
import { TripSubStatus } from '@/lib/db';
import { updateTripStatus, deleteTripStatus, createTripStatus, updateTripSubStatus, deleteTripSubStatus, createTripSubStatus } from '@/app/actions';

function SubStatusRow({ sub, core }: { sub: TripSubStatus, core: TripStatus }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(formData: FormData) {
    setSaving(true);
    formData.append('linked_status', core.name); // lock it to this core
    const res = await updateTripSubStatus(sub.id, formData);
    setSaving(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsEditing(false);
      router.refresh();
    }
  }

  if (isEditing) {
    return (
      <form action={handleSave} style={{ display: 'flex', gap: '8px', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '6px', alignItems: 'center' }}>
        <input type="text" name="name" defaultValue={sub.name} required style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        <input type="number" name="sort_order" defaultValue={sub.sort_order} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Order" />
        <button type="submit" disabled={saving} style={{ padding: '6px 12px', background: 'var(--accent)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Save</button>
        <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
      </form>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#64748b', fontSize: '0.8rem', width: '20px' }}>{sub.sort_order}</span>
        <span style={{ fontWeight: 500 }}>{sub.name}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem' }}>Edit</button>
        <form action={async () => {
          if (confirm('Delete this sub-status?')) {
            await deleteTripSubStatus(sub.id);
            router.refresh();
          }
        }}>
          <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
        </form>
      </div>
    </div>
  );
}

function CoreStatusBlock({ core, subStatuses }: { core: TripStatus, subStatuses: TripSubStatus[] }) {
  const router = useRouter();
  const [isEditingCore, setIsEditingCore] = useState(false);
  const [savingCore, setSavingCore] = useState(false);
  const [isAddingSub, setIsAddingSub] = useState(false);
  
  const mySubs = subStatuses.filter(s => s.linked_status === core.name).sort((a,b) => a.sort_order - b.sort_order);

  async function handleSaveCore(formData: FormData) {
    setSavingCore(true);
    const res = await updateTripStatus(core.id, formData);
    setSavingCore(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setIsEditingCore(false);
      router.refresh();
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header (Core Status) */}
      <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {isEditingCore ? (
          <form action={handleSaveCore} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="text" name="name" defaultValue={core.name} required style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }} />
              <input type="number" name="sort_order" defaultValue={core.sort_order} style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Sort" />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <input type="checkbox" name="passenger_count_required" value="true" defaultChecked={core.passenger_count_required === 1} style={{ width: '16px', height: '16px' }} />
              <span>Require Passenger Count to save (must be &gt; 0)?</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={savingCore} style={{ padding: '6px 16px', background: 'var(--accent)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Save</button>
              <button type="button" onClick={() => setIsEditingCore(false)} style={{ padding: '6px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{core.name}</h3>
                <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>Order: {core.sort_order}</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: core.passenger_count_required ? 'var(--accent)' : '#64748b', fontWeight: core.passenger_count_required ? 600 : 400 }}>
                {core.passenger_count_required ? 'Passengers Required (Y)' : 'Passengers Optional (N)'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setIsEditingCore(true)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Edit Core</button>
              <form action={async () => {
                  if (confirm('Delete this Core Status? This will detach its sub-statuses.')) {
                    await deleteTripStatus(core.id);
                    router.refresh();
                  }
              }}>
                <button type="submit" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>Delete</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Body (Sub-Statuses) */}
      <div style={{ padding: '0' }}>
        {mySubs.map(sub => <SubStatusRow key={sub.id} sub={sub} core={core} />)}
        
        {mySubs.length === 0 && !isAddingSub && (
          <div style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', fontStyle: 'italic' }}>No sub-statuses defined for this milestone.</div>
        )}
        
        {isAddingSub ? (
          <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>
            <form action={async (formData) => {
              formData.append('linked_status', core.name);
              const res = await createTripSubStatus(formData);
              if (res?.error) {
                alert(res.error);
              } else {
                setIsAddingSub(false);
                router.refresh();
              }
            }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" name="name" placeholder="New sub-status name" required style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              <input type="number" name="sort_order" defaultValue={(mySubs[mySubs.length-1]?.sort_order || 0) + 10} style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Sort" />
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Add</button>
              <button type="button" onClick={() => setIsAddingSub(false)} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
            </form>
          </div>
        ) : (
          <div style={{ padding: '12px 16px', borderTop: mySubs.length > 0 ? '1px solid #e2e8f0' : 'none' }}>
            <button onClick={() => setIsAddingSub(true)} style={{ background: 'none', border: '1px dashed #cbd5e1', width: '100%', padding: '8px', borderRadius: '6px', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
              + Add Sub-Status to {core.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TripWorkflowManager({ coreStatuses, subStatuses }: { coreStatuses: TripStatus[], subStatuses: TripSubStatus[] }) {
  const router = useRouter();
  const [isAddingCore, setIsAddingCore] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {coreStatuses.sort((a,b) => a.sort_order - b.sort_order).map(core => (
        <CoreStatusBlock key={core.id} core={core} subStatuses={subStatuses} />
      ))}

      {isAddingCore ? (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--accent)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Create New Core Milestone</h3>
          <form action={async (formData) => {
            await createTripStatus(formData);
            setIsAddingCore(false);
            router.refresh();
          }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Milestone Name</label>
                <input type="text" name="name" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ width: '100px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 500 }}>Sort Order</label>
                <input type="number" name="sort_order" defaultValue={(coreStatuses[coreStatuses.length-1]?.sort_order || 0) + 1} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '4px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input type="checkbox" name="passenger_count_required" value="true" style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 500 }}>Require Passenger Count to save this status (e.g. for Completed)?</span>
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" style={{ background: 'var(--accent)', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Create Milestone</button>
              <button type="button" onClick={() => setIsAddingCore(false)} style={{ background: '#e2e8f0', color: '#334155', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={() => setIsAddingCore(true)} style={{ padding: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
          + Add New Core Milestone
        </button>
      )}

      {/* Orphans / Errors */}
      {subStatuses.filter(s => !coreStatuses.some(c => c.name === s.linked_status)).length > 0 && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
          <h4 style={{ color: '#ef4444', margin: '0 0 12px 0' }}>Orphaned Sub-Statuses (Parent Missing)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {subStatuses.filter(s => !coreStatuses.some(c => c.name === s.linked_status)).map(sub => (
              <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{sub.name} (Linked to: {sub.linked_status})</span>
                <form action={async () => {
                  await deleteTripSubStatus(sub.id);
                  router.refresh();
                }}>
                  <button type="submit" style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
