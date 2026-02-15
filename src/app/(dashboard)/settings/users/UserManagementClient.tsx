'use client';

import { useState } from 'react';
import { createUser, deleteUser, updateUser } from './actions';
import { useRouter } from 'next/navigation';
import { Region, Location, User } from '@/lib/db';

type UserDisplay = User & { region_name?: string, location_name?: string };

export default function UserManagementClient({ initialUsers, regions, locations, availableRoles }: { 
  initialUsers: UserDisplay[], 
  regions: Region[],
  locations: Location[],
  availableRoles: any[]
}) {
  const [users, setUsers] = useState<UserDisplay[]>(initialUsers);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const router = useRouter();

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (editingUserId) {
        await updateUser(editingUserId, formData);
        setEditingUserId(null);
      } else {
        await createUser(formData);
      }
      router.refresh();
      setIsAdding(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this user logic?')) return;
    try {
      await deleteUser(id);
      router.refresh();
    } catch (err: any) {
      alert('Failed to delete user.');
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingUserId(null); }} 
          style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          {isAdding ? 'Cancel' : '+ Add New System User'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{editingUserId ? 'Edit Account' : 'Provision New Account'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>Full Name</label>
              <input
                name="name"
                required
                defaultValue={editingUserId ? users.find(u => u.id === editingUserId)?.name : ''}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>Email (Login ID)</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={editingUserId ? users.find(u => u.id === editingUserId)?.email : ''}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>Password {editingUserId && '(Leave blank to keep unchanged)'}</label>
              <input
                name="password"
                type="password"
                required={!editingUserId}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>System Role</label>
              {/* Note: We map role_id to role name for display but inputs send IDs */}
              <select
                name="role_id"
                required
                key={editingUserId ? `edit-${editingUserId}` : 'new'} // Force re-render to reset default value
                defaultValue={editingUserId ? users.find(u => u.id === editingUserId)?.role_id || '' : ''}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="" disabled>-- Select a Role --</option>
                {availableRoles?.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>Restrict to Region (Optional)</label>
              <select 
                name="region_id" 
                key={editingUserId ? `edit-reg-${editingUserId}` : 'new-reg'}
                defaultValue={editingUserId ? users.find(u => u.id === editingUserId)?.region_id?.toString() || '' : selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- No Restriction (Global) --</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>Restrict to Location (Bus Incharges)</label>
              <select
                name="location_id"
                key={editingUserId ? `edit-loc-${editingUserId}` : 'new-loc'}
                defaultValue={editingUserId ? users.find(u => u.id === editingUserId)?.location_id?.toString() || '' : ''}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- No Restriction --</option>
                {locations
                  .filter(l => !selectedRegionId || l.region_id === Number(selectedRegionId))
                  .filter(l => !l.venue_id) 
                  .map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-start', padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Saving...' : (editingUserId ? 'Update Account' : 'Create Account')}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1.1rem', marginBottom: '4px' }}>{u.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{ padding: '4px 8px', background: u.role === 'SUPER_ADMIN' ? '#fef2f2' : '#f0f9ff', color: u.role === 'SUPER_ADMIN' ? '#991b1b' : '#0369a1', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${u.role === 'SUPER_ADMIN' ? '#fecaca' : '#bae6fd'}` }}>
                  {u.role.replace('_', ' ')}
                </span>
                {(u.region_name || u.location_name) && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {u.region_name ? `Reg: ${u.region_name}` : ''} 
                    {u.region_name && u.location_name ? ' | ' : ''}
                    {u.location_name ? `Loc: ${u.location_name}` : ''}
                  </span>
                )}
              </div>
              {u.role !== 'SUPER_ADMIN' && (
                <>
                  <button onClick={() => { setIsAdding(true); setEditingUserId(u.id); }} style={{ padding: '6px 12px', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => handleDelete(u.id)} style={{ padding: '6px 12px', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            No system users found.
          </div>
        )}
      </div>
    </div>
  );
}
