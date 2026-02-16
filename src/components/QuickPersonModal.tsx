'use client';

import { useState, useEffect } from 'react';
import { createQuickProfile, updateQuickProfile } from '@/app/actions';

interface QuickPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: number, name: string, phone: string, mode: 'add' | 'edit') => void;
  defaultName?: string;
  mode?: 'add' | 'edit';
  initialData?: { id: number; name: string; phone: string; alternate_phone?: string };
}

export default function QuickPersonModal({
  isOpen,
  onClose,
  onSuccess,
  defaultName = '',
  mode = 'add',
  initialData
}: QuickPersonModalProps) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name);
        setPhone(initialData.phone || '');
        setAlternatePhone(initialData.alternate_phone || '');
      } else {
        setName(defaultName);
        setPhone('');
        setAlternatePhone('');
      }
      setError('');
    }
  }, [isOpen, mode, initialData, defaultName]);

  if (!isOpen) return null;

  async function handleSubmit(e?: React.MouseEvent) {
    if (e) e.preventDefault();
    if (!name || !phone) {
      setError('Please provide a name and phone number');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (mode === 'edit' && initialData) {
        const result = await updateQuickProfile(initialData.id, name, phone, alternatePhone);
        if (result.success) {
          onSuccess(initialData.id, name, phone, 'edit');
        } else {
          setError(result.error || 'Failed to update person');
        }
      } else {
        const result = await createQuickProfile(name, phone, alternatePhone);
        if (result.success && result.id) {
          onSuccess(result.id, name, phone, 'add');
        } else {
          setError(result.error || 'Failed to create person');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="glass-card animate-in" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1E1E1E', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>
          {mode === 'edit' ? 'Edit Person Details' : 'Quick Add Person'}
        </h2>

        {error && (
          <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="quick_name" style={{ color: '#e2e8f0' }}>Full Name</label>
            <input
              className="input-field"
              type="text"
              id="quick_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="quick_phone" style={{ color: '#e2e8f0' }}>Phone Number</label>
            <input
              className="input-field"
              type="tel"
              id="quick_phone"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setPhone(val);
              }}
              placeholder="9876543210"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="quick_alternate_phone" style={{ color: '#e2e8f0' }}>Alternate Phone (Optional)</label>
            <input
              className="input-field"
              type="tel"
              id="quick_alternate_phone"
              value={alternatePhone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setAlternatePhone(val);
              }}
              placeholder="9876543210"
              maxLength={10}
              pattern="[0-9]{10}"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1, padding: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save & Select'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
