import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { getTrip, getVehicles, getProfiles, getTripSubStatuses, getLocations , getTripStatuses, getHierarchyData } from '@/app/actions';
import TripForm from '@/components/TripForm';
import { notFound } from 'next/navigation';
import { getRolePermissions } from '@/lib/rbac-server';

export const metadata = {
  title: 'Edit Trip',
};

export default async function EditTripPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (session?.role !== 'SUPER_ADMIN' && session?.role_id) {
    const permissions = await getRolePermissions(session.role_id);
    if (!permissions['trips']?.edit) {
      return <div style={{padding: '40px', textAlign: 'center'}}>Unauthorized. You do not have permission to edit trips.</div>;
    }
  }

  const params = await props.params;
  const trip = await getTrip(Number(params.id));

  if (!trip) {
    notFound();
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
      <TripForm trip={trip} vehicles={vehicles} volunteers={volunteers} subStatuses={subStatuses} locations={locations} statuses={statuses} defaultRegionId={region_id} hierarchy={hierarchy} />
    </>
  );
}
