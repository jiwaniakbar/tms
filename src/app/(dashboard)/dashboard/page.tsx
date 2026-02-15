export const dynamic = 'force-dynamic';
import { getTrips, getVehicles, getProfiles, getTripSubStatuses, getLocations, getTripStatuses, getHierarchyData } from '@/app/actions';
import DashboardClient from './DashboardClient';
import RefreshControl from '@/components/RefreshControl';

import { getSession } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { getRolePermissions } from '@/lib/rbac-server';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) redirect('/login');

  if (session.role !== 'SUPER_ADMIN') {
    const permissions = await getRolePermissions(session.role_id);
    if (!permissions['dashboard']?.view) {
      if (permissions['trips']?.view) {
        redirect('/manage-trips');
      } else {
        redirect('/my-location-trips');
      }
    }
  }

  // Fetch only relevant dashboard trips to save memory and DOM load
  const trips = await getTrips('', null, undefined, undefined, true);
    const vehicles = await getVehicles();
  const volunteers = await getProfiles();
  const subStatuses = await getTripSubStatuses();
  const locations = await getLocations();
  const statuses = await getTripStatuses();
  const hierarchy = await getHierarchyData();
  
  const activeStatusNames = statuses.map(s => s.name);
  const dashboardTrips = trips.filter(t => activeStatusNames.includes(t.status) || t.status === 'Planned');
  
  const statusOrder: { [key: string]: number } = { 'Breakdown': 1, 'Arriving': 2, 'Active': 3, 'Scheduled': 4, 'Completed': 5 };
  
  // Sort active trips by status priority
  dashboardTrips.sort((a, b) => {
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
  });
  
  
  const arrivingCount = dashboardTrips.filter(t => t.status === 'Arriving').length;
  const arrivingPax = dashboardTrips.filter(t => t.status === 'Arriving').reduce((sum, t) => sum + (t.passengers_boarded || 0), 0);
  
  const activeCount = dashboardTrips.filter(t => t.status === "Active").length;
  const activePax = dashboardTrips.filter(t => t.status === "Active").reduce((sum, t) => sum + (t.passengers_boarded || 0), 0);
  
  const breakdowns = dashboardTrips.filter(t => t.status === 'Breakdown').length;
  const breakdownPax = dashboardTrips.filter(t => t.status === 'Breakdown').reduce((sum, t) => sum + (t.passengers_boarded || 0), 0);
  
  const plannedCount = dashboardTrips.filter(t => t.status === 'Scheduled' || t.status === 'Planned').length;
  const plannedPax = dashboardTrips.filter(t => t.status === 'Scheduled' || t.status === 'Planned').reduce((sum, t) => sum + (t.passengers_boarded || 0), 0);
  
  const completedCount = dashboardTrips.filter(t => t.status === 'Completed').length;
  const completedPax = dashboardTrips.filter(t => t.status === 'Completed').reduce((sum, t) => sum + (t.passengers_boarded || 0), 0);

  const cancelledCount = trips.filter(t => t.status === 'Cancelled').length;
  const cancelledPax = trips.filter(t => t.status === 'Cancelled').reduce((sum, t) => sum + (t.passengers_boarded || 0), 0);

  const totalCount = trips.length;
  const totalPax = trips.reduce((sum, t) => sum + (t.passengers_boarded || 0), 0);

  return (
    <>

      <header className="dashboard-header">
        <div className="dashboard-header-titles">
          <h1>Command Center</h1>
          <p className="subtitle">War Room - Active Trip Monitoring</p>
        </div>

        <RefreshControl showAutoRefresh={true} />
      </header>

      {/* 1. Summary Cards Layer */}
      <section className="summary-grid">
        <div className="stat-card">
          <div className="stat-title">Breakdowns</div>
          <div className="stat-value breakdown">{breakdowns}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span>👥</span> {breakdownPax} pax</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Arriving</div>
          <div className="stat-value arriving">{arrivingCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span>👥</span> {arrivingPax} pax</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active</div>
          <div className="stat-value active">{activeCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span>👥</span> {activePax} pax</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Scheduled</div>
          <div className="stat-value approaching">{plannedCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span>👥</span> {plannedPax} pax</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed</div>
          <div className="stat-value parked">{completedCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span>👥</span> {completedPax} pax</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Cancelled</div>
          <div className="stat-value cancelled">{cancelledCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span>👥</span> {cancelledPax} pax</div>
        </div>
        <div className="stat-card" style={{ border: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div className="stat-title">Total Trips</div>
          <div className="stat-value total">{totalCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><span>👥</span> {totalPax} pax</div>
        </div>
      </section>



      

      {/* 4. Active Trips List Layer */}
      <DashboardClient
        hierarchy={hierarchy} 
        allTrips={trips} 
        dashboardTrips={dashboardTrips}
        vehicles={vehicles}
        volunteers={volunteers}
        subStatuses={subStatuses}
        locations={locations} statuses={statuses}
      />
    </>
  );
}
