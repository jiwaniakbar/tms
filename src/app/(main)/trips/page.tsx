import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { getTrips } from '@/app/actions';
import TripSearchForm from '@/components/TripSearchForm';
import Link from 'next/link';
import { getRolePermissions } from '@/lib/rbac-server';
import { notFound } from 'next/navigation';

export default async function TripsHome(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q;
  const session = await getSession();

  let hasViewPermission = false;
  let hasEditPermission = false;

  if (session?.role === 'SUPER_ADMIN') {
    hasViewPermission = true;
    hasEditPermission = true;
  } else if (session?.role_id) {
    const permissions = await getRolePermissions(session.role_id);
    hasViewPermission = !!permissions['trips']?.view;
    hasEditPermission = !!permissions['trips']?.edit;
  }

  if (!hasViewPermission) {
    return notFound();
  }

  const region_id = session?.role === 'SUPER_ADMIN' || session?.role === 'COMMAND_CENTER' ? null : session?.region_id;
  const limit = 100; // Keep Mobile feed reasonably sized
  const offset = 0;
  
  const isRegionAdmin = session?.role_id !== 1 && session?.role !== 'SUPER_ADMIN' && session?.role !== 'COMMAND_CENTER';
  const trips: any[] = await getTrips(query, region_id, limit, offset, false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
         <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Trips</h1>
      </div>

      <TripSearchForm />

      {hasEditPermission && (
        <div style={{ display: 'flex', gap: '12px', animationDelay: '0.1s', marginBottom: '16px' }} className="animate-in">
          <Link href="/trips/create" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <span>+ Schedule Trip</span>
          </Link>
        </div>
      )}

      <div className="profiles-list animate-in" style={{ animationDelay: '0.2s' }}>
        {trips.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            No trips found. {query && `Try a different search term.`}
          </div>
        ) : (
          trips.map((trip) => {
            const innerContent = (
              <div className="profile-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      {trip.sub_status}
                    </span>
                    {trip.status === 'Breakdown' && trip.breakdown_issue && (
                      <span style={{
                        marginTop: '2px',
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
                      <strong>{trip.origin_name || trip.origin_id || trip.origin_venue_id || 'Unknown'}</strong>
                      {trip.origin_venue_name && trip.origin_name !== trip.origin_venue_name && <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>({trip.origin_venue_name})</span>}
                      
                      <span style={{ color: 'var(--text-secondary)' }}>→</span>
                      
                      <strong>{trip.destination_name || trip.destination_id || trip.destination_venue_id || 'Unknown'}</strong>
                      {trip.destination_venue_name && trip.destination_name !== trip.destination_venue_name && <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>({trip.destination_venue_name})</span>}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatDate(trip.start_time)} - {formatDate(trip.end_time)}
                    </div>

                    <div style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span title="Bus Incharge" style={{ color: 'var(--text-primary)' }}>🙋 {trip.volunteer_name || 'Unassigned'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span title="Driver" style={{ color: 'var(--text-primary)' }}>👨‍✈️ {trip.driver_name || 'Unassigned'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span title="Vehicle" style={{ color: 'var(--text-primary)' }}>🚌 {trip.vehicle_registration || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {hasEditPermission && <span className="btn-icon" style={{color: 'var(--accent)'}}>→</span>}
              </div>
            );

            if (hasEditPermission) {
              return (
                <Link href={`/trips/${trip.id}/edit`} key={trip.id} className="glass-card profile-item">
                  {innerContent}
                </Link>
              );
            } else {
              return (
                <div key={trip.id} className="glass-card profile-item" style={{ cursor: 'default' }}>
                  {innerContent}
                </div>
              );
            }
          })
        )}
      </div>
    </>
  );
}
