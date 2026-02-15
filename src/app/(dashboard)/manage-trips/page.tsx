import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import { getTrips, getTripsCount, getVehicles, getProfiles, getTripSubStatuses, getLocations, getTripStatuses, getHierarchyData } from '@/app/actions';
import TripsListClient from '../../(main)/trips/TripsListClient';
import { getRolePermissions } from '@/lib/rbac-server';

export default async function ManageTripsHome(props: {
  searchParams: Promise<{ q?: string, page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const pageParam = parseInt(searchParams.page || '1', 10);
  const page = isNaN(pageParam) ? 1 : pageParam;
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

  // Protect route
  if (!hasViewPermission) {
     return <div style={{padding: '40px', textAlign: 'center'}}>Unauthorized. You must be an Administrator.</div>;
  }
  
  const region_id = session?.role === 'SUPER_ADMIN' || session?.role === 'COMMAND_CENTER' ? null : session?.region_id || null;
  const limit = 50;
  const offset = (page - 1) * limit;
  // Deep search wildcard returns up to 100 on page 1 bypassing pagination for UX speed
  const fetchLimit = query ? 100 : limit;
  const fetchOffset = query ? 0 : offset;
  
  const isRegionAdmin = session?.role_id !== 1 && session?.role !== 'SUPER_ADMIN' && session?.role !== 'COMMAND_CENTER';
  
  const trips: any[] = await getTrips(query, region_id, fetchLimit, fetchOffset);
  const totalTrips = query ? trips.length : await getTripsCount(query, region_id);
  const totalPages = query ? 1 : Math.ceil(totalTrips / limit);
  const vehicles = await getVehicles();
  const volunteers = await getProfiles();
  const subStatuses = await getTripSubStatuses();
  const locations = await getLocations();
  const statuses = await getTripStatuses();
  const hierarchy = await getHierarchyData();

  return (
    <TripsListClient 
      currentPage={query ? 1 : page}
      totalPages={totalPages} 
      trips={trips} 
      searchQuery={query} 
      userRole={session.role} 
      vehicles={vehicles}
      volunteers={volunteers}
      subStatuses={subStatuses}
      locations={locations}
      statuses={statuses}
      hasEditPermission={hasEditPermission}
      hierarchy={hierarchy}
      defaultRegionId={isRegionAdmin && session?.region_id ? Number(session.region_id) : undefined}
    />
  );
}
