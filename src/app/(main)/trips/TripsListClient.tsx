'use client';
import Link from 'next/link';

import { deleteTrip } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardTripModal from '@/components/DashboardTripModal';
import RefreshControl from '@/components/RefreshControl';

export default function TripsListClient({
  trips,
  searchQuery,
  userRole,
  vehicles = [],
  volunteers = [],
  subStatuses = [],
  locations = [],
  statuses = [],
  hierarchy = null,
  currentPage = 1,
  totalPages = 1,
  hasEditPermission = true,
  defaultRegionId
}: {
  trips: any[];
  searchQuery: string;
  userRole: string;
  vehicles?: any[];
  volunteers?: any[];
  subStatuses?: any[];
  locations?: any[];
  statuses?: any[];
  hierarchy?: any;
  currentPage?: number;
  totalPages?: number;
  hasEditPermission?: boolean;
  defaultRegionId?: number | null;
}) {
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const router = useRouter();

  const [isCreating, setIsCreating] = useState(false);
  const [localTrips, setLocalTrips] = useState(trips);
  const [sortColumn, setSortColumn] = useState<string>('start_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedTrips = [...localTrips].sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];

    // Handle nested or formatted values
    if (sortColumn === 'status') {
      aVal = a.status;
      bVal = b.status;
    } else if (sortColumn === 'origin') {
      aVal = a.origin_name || a.origin;
      bVal = b.origin_name || b.origin;
    } else if (sortColumn === 'destination') {
      aVal = a.destination_name || a.destination;
      bVal = b.destination_name || b.destination;
    }

    if (!aVal) aVal = '';
    if (!bVal) bVal = '';

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Sync state if server trip prop changes

  useEffect(() => { setLocalTrips(trips); }, [trips]);


  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    return sortDirection === 'asc' ? <span style={{ marginLeft: '4px', color: '#3b82f6' }}>▲</span> : <span style={{ marginLeft: '4px', color: '#3b82f6' }}>▼</span>;
  };


  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q') as string;
    const url = hierarchy ? "/manage-trips" : "/trips";
    if (q) {
      router.push(`${url}?q=${encodeURIComponent(q)}`);
    } else {
      router.push(url);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      const res = await deleteTrip(id);
      if (res && res.error) {
        alert(res.error);
      } else {
        setLocalTrips(prev => prev.filter(t => t.id !== id));
        router.refresh(); /* Just to be safe */
      }
    }
  };

  return (
    <>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 8px 0' }}>All Trips</h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', margin: 0 }}>Manage and overview all active schedules across regions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <RefreshControl />
          {hasEditPermission && (
            hierarchy ? (
              <button onClick={() => setIsCreating(true)} style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
                + Schedule Trip
              </button>
            ) : (
              <Link href="/trips/create" style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
                + Schedule Trip
              </Link>
            )
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search Route Code, Location, Driver, or Bus Incharge..."
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Search</button>
        </form>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div className="trips-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th onClick={() => handleSort('route_code')} style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>ROUTE CODE {getSortIcon('route_code')}</th>
                  <th onClick={() => handleSort('status')} style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>STATUS {getSortIcon('status')}</th>
                  <th onClick={() => handleSort('start_time')} style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>DEPARTURE TIME {getSortIcon('start_time')}</th>
                  <th onClick={() => handleSort('origin')} style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>ORIGIN {getSortIcon('origin')}</th>
                  <th onClick={() => handleSort('destination')} style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>DESTINATION {getSortIcon('destination')}</th>
                  <th onClick={() => handleSort('vehicle_registration')} style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>ASSIGNMENTS {getSortIcon('vehicle_registration')}</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.9rem', whiteSpace: 'nowrap', userSelect: 'none' }}>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {sortedTrips.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>No trips found matching your current filters.</td>
                  </tr>
                )}
                {sortedTrips.map(trip => {
                  const sTime = new Date(trip.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

                  return (
                    <tr key={trip.id} onClick={() => setSelectedTrip(trip)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s' }}>
                      <td data-label="Route Code" style={{ padding: '16px' }}>
                        <div style={{ display: 'inline-block', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                          {trip.route_code}
                        </div>
                      </td>
                      <td data-label="Status" style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: trip.status === 'Completed' ? '#059669' : trip.status === 'Breakdown' ? '#dc2626' : '#2563eb', fontSize: '0.9rem' }}>{trip.status}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{trip.sub_status}</div>
                      </td>
                      <td data-label="Departure" style={{ padding: '16px', color: '#334155', fontSize: '0.9rem', fontWeight: 500 }}>
                        {sTime}
                      </td>
                      <td data-label="Routing" style={{ padding: '16px', maxWidth: '200px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.origin_name || trip.origin_id || trip.origin_venue_id || 'Unknown'}</div>
                        {trip.origin_venue_name && trip.origin_name !== trip.origin_venue_name && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.origin_venue_name}</div>
                        )}
                      </td>
                      <td data-label="" style={{ padding: '16px', maxWidth: '200px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.destination_name || trip.destination_id || trip.destination_venue_id || 'Unknown'}</div>
                        {trip.destination_venue_name && trip.destination_name !== trip.destination_venue_name && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.destination_venue_name}</div>
                        )}
                      </td>
                      <td data-label="Assignments" style={{ padding: '16px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>🚘 {trip.vehicle_registration || 'No Vehicle'}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>Bus Incharge: {trip.volunteer_name || '-'} {trip.volunteer_phone ? '(' + trip.volunteer_phone + ')' : ''}</span>
                        </div>
                      </td>
                      <td data-label="Notes" style={{ padding: '16px', maxWidth: '150px' }}>
                        {trip.notes ? (
                          <div title={trip.notes} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            {trip.notes}
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                      <td data-label="Actions" style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {hasEditPermission && (
                            <>
                              {hierarchy ? (
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedTrip(trip); }} style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                  Edit
                                </button>
                              ) : (
                                <Link href={`/trips/${trip.id}/edit`} style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                                  Edit
                                </Link>
                              )}
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(trip.id); }} style={{ padding: '6px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing Page {currentPage} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => router.push(window.location.pathname + '?page=' + (currentPage - 1) + (searchQuery ? '&q=' + encodeURIComponent(searchQuery) : ''))}
                disabled={currentPage <= 1}
                style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, backgroundColor: currentPage <= 1 ? '#e2e8f0' : 'white', border: '1px solid #cbd5e1', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', color: currentPage <= 1 ? '#94a3b8' : '#334155' }}
              >
                Previous
              </button>
              <button
                onClick={() => router.push(window.location.pathname + '?page=' + (currentPage + 1) + (searchQuery ? '&q=' + encodeURIComponent(searchQuery) : ''))}
                disabled={currentPage >= totalPages}
                style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, backgroundColor: currentPage >= totalPages ? '#e2e8f0' : 'white', border: '1px solid #cbd5e1', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', color: currentPage >= totalPages ? '#94a3b8' : '#334155' }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {(selectedTrip || isCreating) && hierarchy && (
          <DashboardTripModal
            isOpen={!!selectedTrip || isCreating}
            trip={selectedTrip}
            onClose={() => { setSelectedTrip(null); setIsCreating(false); router.refresh(); }}
            vehicles={vehicles}
            volunteers={volunteers}
            subStatuses={subStatuses}
            locations={locations}
            statuses={statuses}
            hierarchy={hierarchy}
            defaultRegionId={defaultRegionId}
          />
        )}
      </div>
    </>
  );
}
