import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { getVolunteerTrips } from '@/app/actions';
import { getRolePermissions } from '@/lib/rbac-server';
import Link from 'next/link';
import { getTripStatuses, getTripSubStatuses, getVehicles } from '@/app/actions';
import DashboardTripStatusForm from '@/components/DashboardTripStatusForm';
import DashboardTripList from '@/components/DashboardTripList';
import { getProfiles } from '@/app/actions';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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

export default async function MyLocationTripsPage() {
  const session = await getSession();
  
  if (session?.role !== 'VOLUNTEER' && session?.role !== 'SUPER_ADMIN' && session?.role !== 'REGION_ADMIN' && session?.role !== 'COMMAND_CENTER') {
    return notFound();
  }

  const roleId = session.role_id;
  let hasEditPermission = false;
  if (roleId) {
    const permissions = await getRolePermissions(roleId);
    if (!permissions['trip_tracking']?.view && session.role !== 'SUPER_ADMIN') {
      return notFound();
    }
    hasEditPermission = session.role === 'SUPER_ADMIN' || !!permissions['trip_tracking']?.edit;
  } else if (session.role === 'SUPER_ADMIN') {
    hasEditPermission = true;
  }

  const locationId = session.location_id;
  if (!locationId && session.role === 'VOLUNTEER') {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Unassigned</h2>
        <p>Your bus incharge profile is not assigned to a specific Location yet. Please contact an Administrator.</p>
      </div>
    );
  }

  const trips = locationId ? await getVolunteerTrips(locationId) : [];
  const statuses = await getTripStatuses();
  const subStatuses = await getTripSubStatuses();
  const allProfiles = await getProfiles(); // Could be separated by driver/incharge, but getting all profiles is robust for now
  const allVehicles = await getVehicles();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
         <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>My Station Trips</h1>
      </div>
      <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Showing active routes touching your assigned location.</p>

      <DashboardTripList
        trips={trips}
        statuses={statuses}
        subStatuses={subStatuses}
        volunteers={allProfiles}
        drivers={allProfiles}
        vehicles={allVehicles}
        hasEditPermission={hasEditPermission}
        locationId={locationId}
      />
    </>
  );
}
