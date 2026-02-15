'use client';

import { useState } from 'react';
import { createQuickVehicle, updateQuickVehicle } from '@/app/actions';
import { useEffect } from 'react';

export default function QuickAddVehicleModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'add',
  initialData
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: number, name: string) => void;
  mode?: 'add' | 'edit';
  initialData?: { id: number; name: string; phone?: string };
}) {
  const [registration, setRegistration] = useState('');
  const [type, setType] = useState('Bus');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        const match = initialData.name.match(/^(.+?)(?: \((.*)\))?$/);
        setRegistration(match?.[1] || initialData.name);
        setType(match?.[2] || 'Bus');
        setCapacity(initialData.phone ? parseInt(initialData.phone).toString() : '');
      } else {
        setRegistration('');
        setType('Bus');
        setCapacity('');
      }
      setError('');
    }
  }, [isOpen, mode, initialData]);


  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!registration.trim()) {
      setError('Registration is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const capNum = capacity ? parseInt(capacity) : 0;
      const res = mode === 'edit' && initialData 
        ? await updateQuickVehicle(initialData.id, registration, type, capNum) 
        : await createQuickVehicle(registration, type, capNum);
      if (res.success) {
        const returnId = mode === 'edit' && initialData ? initialData.id : (res as any).id;
        onSuccess(returnId!, registration);
        setRegistration('');
        setType('Bus');
        setCapacity('');
      } else {
        setError(res.error || 'Failed to add vehicle');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card animate-in" style={{
        width: '100%', maxWidth: '400px',
        backgroundColor: 'var(--surface)', padding: '24px', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.2rem', color: '#64748b'
          }}
        >
          ✕
        </button>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
          {mode === 'edit' ? 'Edit Vehicle' : 'Quick Add Vehicle'}
        </h2>

        {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group" onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e as any); }}>
            <label className="filter-label">Registration Number*</label>
            <input 
              type="text" 
              className="input-field"
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())} style={{ textTransform: 'uppercase' }}
              placeholder="e.g. MH12-AB1234"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="filter-label" htmlFor="type">Vehicle Type</label>
            <select 
              className="input-field" 
              id="type" 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
            >
              <option value="Bus">Bus</option>
              <option value="Minibus">Minibus</option>
              <option value="Private Car">Private Car</option>
              <option value="Taxi">Taxi</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Minivan">Minivan</option>
              <option value="Truck">Truck</option>
              <option value="Auto">Auto</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group">
            <label className="filter-label">Capacity (Seats - Optional)</label>
            <input 
              type="number" 
              className="input-field"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 40"
              disabled={loading}
              min="0"
            />
          </div>

          <button 
            type="button" 
            onClick={handleSubmit} 
            className="btn btn-primary" 
            style={{ marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Add Vehicle')}
          </button>
        </div>
      </div>
    </div>
  );
}
