'use client';

import { useState } from 'react';

export default function DashboardTripRow({ trip, onRowClick }: { trip: any, onRowClick?: (trip: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  
  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.expand-toggle')) {
      e.stopPropagation();
      setExpanded(!expanded);
      return;
    }
    if (onRowClick) {
      onRowClick(trip);
    }
  };

  const isDelayed = new Date() > new Date(trip.end_time) && trip.status !== 'Completed';
  
  // Format Date gracefully: "Feb 08" "10:30"
  const startDate = new Date(trip.start_time);
  const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = new Date(trip.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className={`trip-item-card ${trip.status === 'Breakdown' ? 'highlight-breakdown' : ''}`}
      onClick={handleRowClick}
      style={{ 
        cursor: 'pointer', 
        marginBottom: '8px', 
        background: 'white', 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0',
        borderLeft: isDelayed ? '4px solid #ef4444' : trip.status === 'Breakdown' ? '4px solid #ef4444' : '4px solid transparent',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
        overflow: 'hidden' 
      }}
    >
      <div 
        className="trip-item-row" 
        style={{ 
          border: 'none', margin: 0, boxShadow: 'none', padding: '8px 16px',
          display: 'grid', 
          
          alignItems: 'center', 
          gap: '16px'
        }}
      >
        <div className="expand-toggle" style={{ cursor: 'pointer', padding: '4px' }}>
          <div className="arrow-icon" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', width: '20px', textAlign: 'center' }}>›</div>
        </div>
        
        {/* 1. Date & Time */}
        <div suppressHydrationWarning style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span suppressHydrationWarning style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dateStr}</span>
            {isDelayed && trip.status !== 'Breakdown' && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', padding: '1px 4px', borderRadius: '4px' }}>
                DELAY
              </span>
            )}
            {trip.status === 'Breakdown' && trip.breakdown_issue && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', padding: '1px 4px', borderRadius: '4px', whiteSpace: 'nowrap', maxWidth: '95px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={trip.breakdown_issue}>
                ⚠ {trip.breakdown_issue}
              </span>
            )}
          </div>
          <span suppressHydrationWarning style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span suppressHydrationWarning style={{color: 'var(--accent)', fontWeight: 500}}>{timeStr}</span> → <span suppressHydrationWarning>{endTimeStr}</span>
          </span>
        </div>

        {/* 2. Trip ID */}
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', backgroundColor: 'var(--surface-hover)', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{trip.route_code}</span>
        </div>

        {/* 3. Origin -> Destination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }} title={trip.origin_name || trip.origin_id || 'Unknown'}>{trip.origin_name || trip.origin_id || 'Unknown'}</span>
          <span style={{ color: 'var(--text-secondary)' }}>→</span>
          <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }} title={trip.destination_name || trip.destination_id || 'Unknown'}>{trip.destination_name || trip.destination_id || 'Unknown'}</span>
        </div>
        
        {/* 4. Bus Incharge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{opacity: 0.7, marginRight: '4px'}}>🙋</span>
            {trip.volunteer_name || 'No Bus Incharge'}
          </span>
          {trip.volunteer_phone && (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <span style={{opacity: 0.7, marginRight: '4px'}}>📞</span>
              {trip.volunteer_phone}
            </span>
          )}
        </div>

        {/* 5. Passengers & Wheelchairs */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }} title="Passengers">
            <span>👥</span><span style={{fontWeight: 600, color: 'var(--text-primary)'}}>{trip.passengers_boarded || 0}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }} title="Wheelchairs">
            <span>♿</span><span style={{fontWeight: 600, color: 'var(--text-primary)'}}>{trip.wheelchairs_boarded || 0}</span>
          </div>
        </div>

        {/* 6. Combined Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '4px' }}>
          <div className={`badge-status bg-${trip.status.toLowerCase()}`} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '2px', 
            padding: '4px 8px', 
            borderRadius: '6px',
            width: '100%',
            textAlign: 'center',
            minHeight: '28px'
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: '1' }}>{trip.status}</span>
            
            {trip.sub_status && trip.status !== 'Completed' && trip.status !== 'Cancelled' && (
              <span style={{ fontSize: '0.65rem', opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', lineHeight: '1' }}>
                {trip.sub_status}
              </span>
            )}
            
            
          </div>
        </div>
      </div>

      {/* 7. Truncated Notes (Collapsed View) */}
      {trip.notes && !expanded && (
        <div style={{ padding: '0 16px 8px 52px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', gridColumn: '1 / -1' }}>
          <span>📝</span>
          <span style={{ fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
            {trip.notes}
          </span>
        </div>
      )}

      {expanded && (
        <div className="trip-item-details" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.9rem' }}>
          {trip.notes && (
            <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
              <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</div>
              <div style={{ fontStyle: 'italic', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{trip.notes}</div>
            </div>
          )}
          <div>
            <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle Details</div>
            <div><strong>Registration:</strong> {trip.vehicle_registration || 'Unassigned'}</div>
            {trip.vehicle_type && <div><strong>Type:</strong> {trip.vehicle_type}</div>}
          </div>
          <div>
            <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Driver Details</div>
            <div><strong>Name:</strong> {trip.driver_name || 'Unassigned'}</div>
            {trip.driver_phone && <div><strong>Phone:</strong> 📞 {trip.driver_phone}</div>}
          </div>
          <div>
            <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bus Incharge Details</div>
            <div><strong>Name:</strong> {trip.volunteer_name || 'Unassigned'}</div>
            {trip.volunteer_phone && <div><strong>Phone:</strong> 📞 {trip.volunteer_phone}</div>}
          </div>
          <div>
            <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timeline</div>
            <div suppressHydrationWarning><strong>Start:</strong> <span suppressHydrationWarning>{new Date(trip.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span></div>
            <div suppressHydrationWarning><strong>End:</strong> <span suppressHydrationWarning>{new Date(trip.end_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
