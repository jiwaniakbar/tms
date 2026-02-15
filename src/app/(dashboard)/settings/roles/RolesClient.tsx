'use client';

import { useState, useEffect } from 'react';
import { createRole, deleteRole, updateRolePermissions } from '@/app/actions';
import { APP_MODULES } from '@/lib/constants';

type PermissionSet = { [key: string]: { view: boolean; edit: boolean } };

export default function RolesClient({ 
  initialRoles, 
  initialPermissions 
}: { 
  initialRoles: any[], 
  initialPermissions: Record<number, PermissionSet>
}) {
  const [roles, setRoles] = useState(initialRoles);
  const [permissions, setPermissions] = useState(initialPermissions);
  // Auto-select Super Admin if it exists
  const superAdminRole = initialRoles.find(r => r.name === 'Super Admin');
  const [selectedroleId, setSelectedRoleId] = useState<number | null>(superAdminRole ? superAdminRole.id : null);

  // Fallback to auto-select if somehow state clears
  useEffect(() => {
    if (selectedroleId === null && roles.length > 0) {
      const sa = roles.find(r => r.name === 'Super Admin' || r.is_system_role === 1);
      if (sa) setSelectedRoleId(sa.id);
      else setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedroleId]);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  
  function toggleAll(type: 'view' | 'edit', state: boolean) {
    if (!selectedroleId || !activePerms) return;
    const newPerms = { ...activePerms };
    APP_MODULES.forEach(m => {
      if (!newPerms[m.code]) newPerms[m.code] = { view: false, edit: false };
      newPerms[m.code][type] = state;
      if (type === 'edit' && state) newPerms[m.code].view = true;
      if (type === 'view' && !state) newPerms[m.code].edit = false;
    });
    setPermissions({ ...permissions, [selectedroleId]: newPerms });
  }

  // Helper
  const activeRole = roles.find(r => r.id === selectedroleId);
  const isSuperAdmin = activeRole?.name === 'Super Admin';

  const activePerms = selectedroleId ? permissions[selectedroleId] : null;

  async function handleCreateRole() {
    if (!newRoleName) return;
    const res = await createRole(newRoleName, newRoleDesc);
    if (res.success && res.id) {
      setRoles([...roles, { id: res.id, name: newRoleName, description: newRoleDesc, is_system_role: 0 }]);
      setPermissions({ ...permissions, [Number(res.id)]: {} }); // Start cleanly
      setNewRoleName('');
      setNewRoleDesc('');
      setIsCreating(false);
      setSelectedRoleId(Number(res.id));
    } else {
      alert(res.error);
    }
  }

  async function handleDeleteRole(id: number) {
    if (!confirm('Are you sure you want to delete this role? This will unassign all users currently holding it.')) return;
    const res = await deleteRole(id);
    if (res.success) {
      setRoles(roles.filter(r => r.id !== id));
      if (selectedroleId === id) setSelectedRoleId(null);
    } else {
      alert(res.error);
    }
  }

  async function handlePermissionChange(moduleCode: string, type: 'view' | 'edit', checked: boolean) {
    if (!selectedroleId || !activePerms) return;

    const newPerms = { ...activePerms };
    if (!newPerms[moduleCode]) newPerms[moduleCode] = { view: false, edit: false };
    
    newPerms[moduleCode][type] = checked;
    
    // Auto-enable View if Edit is checked
    if (type === 'edit' && checked) {
      newPerms[moduleCode].view = true;
    }
    // Auto-disable Edit if View is unchecked
    if (type === 'view' && !checked) {
      newPerms[moduleCode].edit = false;
    }

    setPermissions({ ...permissions, [selectedroleId]: newPerms });
  }

  async function savePermissions() {
    if (!selectedroleId || !activePerms) return;
    
    const payload = Object.entries(activePerms).map(([code, p]) => ({
      module_code: code,
      can_view: p.view,
      can_edit: p.edit
    }));
    
    const res = await updateRolePermissions(selectedroleId, payload);
    if (res.success) {
      alert('Permissions saved successfully!');
    } else {
      alert('Failed to save permissions: ' + res.error);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* Sidebar: Role List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="section-title">Roles</h3>
          
        </div>

        {isCreating && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
            <input 
              className="input-field" 
              placeholder="Role Name" 
              value={newRoleName} 
              onChange={e => setNewRoleName(e.target.value)} 
              style={{ marginBottom: '8px' }}
            />
            <input 
              className="input-field" 
              placeholder="Description" 
              value={newRoleDesc} 
              onChange={e => setNewRoleDesc(e.target.value)} 
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCreateRole} className="btn btn-sm btn-primary">Save</button>
              <button onClick={() => setIsCreating(false)} className="btn btn-sm">Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {roles.map(role => (
            <div 
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              style={{ 
                padding: '10px 12px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                backgroundColor: selectedroleId === role.id ? '#eff6ff' : 'transparent',
                color: selectedroleId === role.id ? '#2563eb' : 'inherit',
                fontWeight: selectedroleId === role.id ? 600 : 400,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span>{role.name}</span>
              {!role.is_system_role && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => setIsCreating(true)} className="btn btn-outline" style={{ marginTop: '16px', width: '100%' }}>+ Create New Role</button>
      </div>

      {/* Main Area: Matrix */}
      <div className="card">
        {activeRole ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Permissions: {activeRole.name}</h2>
                <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>{activeRole.description || 'No description provided'}</p>
                {isSuperAdmin && <p style={{ color: '#6366f1', margin: '8px 0 0 0', fontSize: '0.85rem', fontWeight: 500 }}>System roles have global permissions and cannot be modified.</p>}
              </div>
              {!isSuperAdmin && <button onClick={savePermissions} className="btn btn-primary">Save Changes</button>}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#64748b' }}>Module</th>
                  {(() => {
    
    return <th style={{ textAlign: 'center', padding: '12px', width: '100px', color: '#64748b' }}>
      <div style={{ marginBottom: '4px' }}>View</div>
      {!isSuperAdmin && (
        <>
          <button onClick={() => toggleAll('view', true)} style={{ fontSize: '0.7rem', padding: '2px 6px', marginRight: '4px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}>All</button>
          <button onClick={() => toggleAll('view', false)} style={{ fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}>None</button>
        </>
      )}
    </th>;
  })()}
                  {(() => {
    
    return <th style={{ textAlign: 'center', padding: '12px', width: '100px', color: '#64748b' }}>
      <div style={{ marginBottom: '4px' }}>Edit</div>
      {!isSuperAdmin && (
        <>
          <button onClick={() => toggleAll('edit', true)} style={{ fontSize: '0.7rem', padding: '2px 6px', marginRight: '4px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}>All</button>
          <button onClick={() => toggleAll('edit', false)} style={{ fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}>None</button>
        </>
      )}
    </th>;
  })()}
                </tr>
              </thead>
              <tbody>
                {APP_MODULES.map(module => {
                  
                  const p = isSuperAdmin ? { view: true, edit: true } : (activePerms?.[module.code] || { view: false, edit: false });
                  return (
                    <tr key={module.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{module.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{module.description}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={p.view} 
                          disabled={isSuperAdmin}
                          onChange={(e) => handlePermissionChange(module.code, 'view', e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: isSuperAdmin ? 'not-allowed' : 'pointer', opacity: isSuperAdmin ? 0.5 : 1 }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={p.edit} 
                          disabled={isSuperAdmin}
                          onChange={(e) => handlePermissionChange(module.code, 'edit', e.target.checked)}
                          style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: isSuperAdmin ? 'not-allowed' : 'pointer', opacity: isSuperAdmin ? 0.5 : 1 }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Select a role to configure permissions
          </div>
        )}
      </div>

    </div>
  );
}
