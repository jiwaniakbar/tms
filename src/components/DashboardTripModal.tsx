'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTrip } from '@/app/actions';
import TripForm from './TripForm';

export default function DashboardTripModal({
  isOpen,
  onClose,
  trip,
  vehicles,
  volunteers,
  subStatuses,
  locations,
  statuses,
  hierarchy,
  defaultRegionId
}: {
  isOpen: boolean;
  onClose: () => void;
  trip?: any;
  vehicles: any[];
  volunteers: any[];
  subStatuses: any[];
  locations: string[];
  statuses: any[];
  hierarchy: any;
  defaultRegionId?: number | null;
}) {
  const router = useRouter();
  const [isReadOnly, setIsReadOnly] = useState(!!trip);
  
  // reset state when trip changes
  useEffect(() => {
    setIsReadOnly(!!trip);
  }, [trip]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      const res = await deleteTrip(trip.id);
      if (res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
        onClose();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        borderRadius: '16px',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          zIndex: 10,
          background: '#0f172a', /* Solid header for better visibility */
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          color: 'white'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            {trip ? 'Trip View' : 'Schedule Trip'}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {trip && isReadOnly && (
              <>
                <button 
                  onClick={handleDelete}
                  style={{ padding: '6px 12px', borderRadius: '6px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Delete
                </button>
                <button 
                  onClick={() => setIsReadOnly(false)}
                  style={{ padding: '6px 12px', borderRadius: '6px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  Edit
                </button>
              </>
            )}
            {trip && !isReadOnly && (
              <button 
                onClick={() => setIsReadOnly(true)}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#64748b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
              >
                Cancel Edit
              </button>
            )}
            <button 
              onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              color: '#64748b',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >×</button>
          </div>
        </div>
        
        {/* We reuse the main TripForm, but override the padding and remove its wrapping header if needed */}
        <div style={{ padding: '0 24px 24px 24px', marginTop: '-20px' }}>
          <TripForm 
            trip={trip} 
            isReadOnly={isReadOnly} 
            vehicles={vehicles} 
            volunteers={volunteers} 
            subStatuses={subStatuses} 
            locations={locations} statuses={statuses} hierarchy={hierarchy}
            defaultRegionId={defaultRegionId}
            onSuccess={() => { router.refresh(); onClose(); }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
