import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { getVehicles, getProfiles, getTripSubStatuses, getLocations, getTripStatuses, getHierarchyData } from '@/app/actions';
import TripForm from '@/components/TripForm';
import { getRolePermissions } from '@/lib/rbac-server';

export const metadata = {
  title: 'Schedule Trip',
};

export default async function CreateTripPage() {
  const session = await getSession();

  if (session?.role !== 'SUPER_ADMIN' && session?.role_id) {
    const permissions = await getRolePermissions(session.role_id);
    if (!permissions['trips']?.edit) {
      return <div style={{padding: '40px', textAlign: 'center'}}>Unauthorized. You do not have permission to edit trips.</div>;
    }
  }

  const vehicles = await getVehicles();
  const volunteers = await getProfiles();
  const subStatuses = await getTripSubStatuses();
  const region_id = session?.region_id || undefined;
  const locations = await getLocations(region_id);
  const statuses = await getTripStatuses();
  const hierarchy = await getHierarchyData();

  return (
    <>
      <TripForm vehicles={vehicles} volunteers={volunteers} subStatuses={subStatuses} locations={locations} statuses={statuses} defaultRegionId={region_id} hierarchy={hierarchy} />
    </>
  );
}
