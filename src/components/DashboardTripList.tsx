'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardTripStatusForm from './DashboardTripStatusForm';

interface DashboardTripListProps {
  trips: any[];
  statuses: any[];
  subStatuses: any[];
  volunteers: any[];
  drivers: any[];
  vehicles: any[];
  hasEditPermission: boolean;
  locationId: number | null | undefined;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return '#10b981'; // emerald
    case 'Planned': return '#3b82f6'; // blue
    case 'Completed': return '#8b5cf6'; // purple
    case 'Breakdown': return '#f59e0b'; // amber/orange
    case 'Cancelled': return '#ef4444'; // red
    default: return 'var(--text-secondary)';
  }
};

function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function DashboardTripList({
  trips,
  statuses,
  subStatuses,
  volunteers,
  drivers,
  vehicles,
  hasEditPermission,
  locationId
}: DashboardTripListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);

  // Filter trips based on search term
  const filteredTrips = trips.filter(trip => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      trip.route_code?.toLowerCase().includes(term) ||
      trip.status?.toLowerCase().includes(term) ||
      trip.origin_name?.toLowerCase().includes(term) ||
      trip.destination_name?.toLowerCase().includes(term) ||
      trip.volunteer_name?.toLowerCase().includes(term) ||
      trip.driver_name?.toLowerCase().includes(term) ||
      trip.vehicle_registration?.toLowerCase().includes(term) ||
      trip.volunteer_phone?.toLowerCase().includes(term) ||
      trip.driver_phone?.toLowerCase().includes(term)
    );
  });

  const handleTripSuccess = () => {
    router.refresh(); // Refresh data to update summaries
  };

  const toggleExpand = (id: number) => {
    setExpandedTripId(prev => prev === id ? null : id);
  };

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search Route, Bus Incharge, Vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            fontSize: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            outline: 'none'
          }}
        />
      </div>

      <div className="profiles-list animate-in" style={{ animationDelay: '0.2s' }}>
        {filteredTrips.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            {search ? 'No trips found matching your search.' : 'No trips currently scheduled for your location.'}
          </div>
        ) : (
          filteredTrips.map(trip => {
            const isExpanded = expandedTripId === trip.id;

            return (
              <div key={trip.id} className="glass-card profile-item" style={{ transition: 'all 0.2s' }}>
                {/* Header - Click to Toggle */}
                <div
                  onClick={() => toggleExpand(trip.id)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '20px',
                    margin: '-20px',
                    marginBottom: '0',
                    borderRadius: 'var(--radius)',
                    transition: 'background-color 0.2s',
                    backgroundColor: isExpanded ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isExpanded ? 'rgba(59, 130, 246, 0.05)' : 'transparent'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className="profile-name" style={{ display: 'block', color: 'var(--accent)' }}>{trip.route_code}</span>
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        color: getStatusColor(trip.status),
                        border: `1px solid ${getStatusColor(trip.status)}`
                      }}>
                        {trip.status}
                      </span>
                      {trip.sub_status && (
                        <span style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic'
                        }}>
                          {trip.sub_status}
                        </span>
                      )}
                      {trip.status === 'Breakdown' && trip.breakdown_issue && (
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#f59e0b',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          Issue: {trip.breakdown_issue}
                        </span>
                      )}
                    </div>

                    <div className="profile-meta" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                        <strong style={{ color: trip.origin_id === locationId ? 'var(--accent)' : 'inherit' }}>{trip.origin_name || trip.origin_id || trip.origin_venue_id || 'Unknown'}</strong>
                        {trip.origin_venue_name && trip.origin_name !== trip.origin_venue_name && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({trip.origin_venue_name})</span>}

                        <span style={{ color: 'var(--text-secondary)' }}>→</span>

                        <strong style={{ color: trip.destination_id === locationId ? 'var(--accent)' : 'inherit' }}>{trip.destination_name || trip.destination_id || trip.destination_venue_id || 'Unknown'}</strong>
                        {trip.destination_venue_name && trip.destination_name !== trip.destination_venue_name && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({trip.destination_venue_name})</span>}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {formatDate(trip.start_time)} - {formatDate(trip.end_time)}
                      </div>

                      {/* Condensed Summary Row when Collapsed */}
                      {!isExpanded && (
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px', opacity: 0.8 }}>
                          <span>🚘 {trip.vehicle_registration || 'No Vehicle'}</span>
                          <span>•</span>
                          <span>🙋 {trip.volunteer_name || 'No Incharge'}</span>
                          <span>•</span>
                          <span>👥 {trip.passengers_boarded || 0} pax</span>
                          {trip.notes && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span style={{ fontSize: '0.9rem' }}>📝</span>
                              <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{trip.notes}</span>
                            </span>
                          )}
                          <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '0.7rem' }}>Click to Expand ▼</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s ease-in-out' }}>
                    <DashboardTripStatusForm
                      trip={trip}
                      statuses={statuses}
                      subStatuses={subStatuses}
                      hasEditPermission={hasEditPermission}
                      volunteers={volunteers}
                      drivers={drivers}
                      vehicles={vehicles}
                      onSuccess={handleTripSuccess}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
