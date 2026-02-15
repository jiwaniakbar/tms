'use client';

import { useState } from 'react';
import DashboardTripRow from './DashboardTripRow';
import DashboardTripModal from '@/components/DashboardTripModal';

export default function DashboardClient({ 
  dashboardTrips,
  allTrips = [],
  vehicles,
  volunteers,
  subStatuses,
  locations,
  statuses,
  hierarchy
}: {
  dashboardTrips: any[];
  allTrips?: any[];
  vehicles: any[];
  volunteers: any[];
  subStatuses: any[];
  locations: string[];
  statuses: any[];
  hierarchy: any;
}) {
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterRoute, setFilterRoute] = useState('All Routes');
  const [filterOrigin, setFilterOrigin] = useState('All Origins');
  const [filterDest, setFilterDest] = useState('All Destinations');

  const handleRowClick = (trip: any) => {
    setSelectedTrip(trip);
  };

  const handleCloseModal = () => {
    setSelectedTrip(null);
  };

  return (
    <>
          <div className={`dashboard-view-container ${isMaximized ? 'maximized' : ''}`} style={isMaximized ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'var(--background)', padding: '16px', display: 'flex', flexDirection: 'column' } : { display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 2 & 3. Compact Controls Layer */}
      <section className="dashboard-controls-layer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '8px' }}>
        
        <div className="filters-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flexGrow: 1, alignItems: 'center' }}>
          
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px', maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '7px', fontSize: '0.85rem', color: '#94a3b8' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filters:</span>
          </div>

          <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.85rem', minWidth: '120px' }}>
              <option value="All Statuses">All Statuses</option>
              {statuses.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <select className="filter-select" value={filterRoute} onChange={e => setFilterRoute(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.85rem', minWidth: '120px' }}>
              <option value="All Routes">All Routes</option>
              {Array.from(new Set(allTrips.map(t => t.route_code))).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <select className="filter-select" value={filterOrigin} onChange={e => setFilterOrigin(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.85rem', minWidth: '120px' }}>
              <option value="All Origins">All Origins</option>
              {Array.from(new Set([...allTrips, ...dashboardTrips].map(t => t.origin_name || t.origin_id || t.origin_venue_id || t.origin))).filter(Boolean).map(orig => (
                <option key={orig} value={orig}>{orig}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <select className="filter-select" value={filterDest} onChange={e => setFilterDest(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.85rem', minWidth: '120px' }}>
              <option value="All Destinations">All Destinations</option>
              {Array.from(new Set([...allTrips, ...dashboardTrips].map(t => t.destination_name || t.destination_id || t.destination_venue_id || t.destination))).filter(Boolean).map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List Toggle Layer */}
        <div className="view-toggles" style={{ margin: 0, flexShrink: 0, display: 'flex', height: '34px' }}>
          <button className="view-toggle active" style={{ padding: '4px 12px', fontSize: '0.85rem', height: '100%', display: 'flex', alignItems: 'center' }}>List View</button>
          <button className="view-toggle" style={{ padding: '4px 12px', fontSize: '0.85rem', height: '100%', display: 'flex', alignItems: 'center' }}>Map View</button>
          <button className="view-toggle" onClick={() => setIsMaximized(!isMaximized)} style={{ padding: '4px 12px', fontSize: '0.85rem', height: '100%', display: 'flex', alignItems: 'center', background: isMaximized ? 'var(--accent)' : '#f1f5f9', color: isMaximized ? 'white' : '#64748b' }}>
            {isMaximized ? '⤓ Restore' : '⤢ Maximize'}
          </button>
        </div>
      </section>
      
      <section className="trips-list-view" style={isMaximized ? { flex: 1, overflowY: 'auto' } : {}}>
        {dashboardTrips.length === 0 && (
           <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No active trips to monitor.</div>
        )}
        {dashboardTrips.filter(t => {
          if (filterStatus !== 'All Statuses' && t.status !== filterStatus) return false;
          if (filterRoute !== 'All Routes' && t.route_code !== filterRoute) return false;
          
          const tOrig = t.origin_name || t.origin_id || t.origin_venue_id || t.origin;
          if (filterOrigin !== 'All Origins' && tOrig != filterOrigin) return false;
          
          const tDest = t.destination_name || t.destination_id || t.destination_venue_id || t.destination;
          if (filterDest !== 'All Destinations' && tDest != filterDest) return false;

          if (!searchQuery) return true;
          const terms = searchQuery.toLowerCase().trim().split(/\s+/);
          
          const formattedDate = t.start_time ? new Date(t.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
          const str = [
            t.route_code, 
            t.origin_name || t.origin, 
            t.destination_name || t.destination,
            t.volunteer_name, 
            t.volunteer_phone, 
            t.driver_name, 
            t.driver_phone, 
            t.vehicle_registration,
            formattedDate,
            t.start_time
          ].filter(Boolean).join(' ').toLowerCase();
          return terms.every(term => str.includes(term));
        }).map(trip => (
          <DashboardTripRow 
            key={trip.id} 
            trip={trip} 
            onRowClick={() => handleRowClick(trip)} 
          />
        ))}
      </section>
    </div>

      {selectedTrip && (
        <DashboardTripModal 
          isOpen={!!selectedTrip}
          onClose={handleCloseModal}
          trip={selectedTrip}
          vehicles={vehicles}
          volunteers={volunteers}
          subStatuses={subStatuses}
          locations={locations}
          statuses={statuses}
          hierarchy={hierarchy}
        />
      )}
    </>
  );
}
