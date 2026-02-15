export const dynamic = 'force-dynamic';
import { getVehicles } from '@/app/actions';
import VehicleSearchForm from '@/components/VehicleSearchForm';
import Link from 'next/link';

export default async function VehiclesHome(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q;
  const vehicles = await getVehicles(query);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981'; // emerald
      case 'Maintenance': return '#f59e0b'; // amber
      case 'Out of Service': return '#ef4444'; // red
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <>
      <VehicleSearchForm />

      <Link href="/vehicles/create" className="btn btn-primary animate-in" style={{ animationDelay: '0.1s' }}>
        <span>+ Register New Vehicle</span>
      </Link>

      <div className="profiles-list animate-in" style={{ animationDelay: '0.2s' }}>
        {vehicles.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            No vehicles found. {query && `Try a different search term.`}
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <Link href={`/vehicles/${vehicle.id}/edit`} key={vehicle.id} className="glass-card profile-item">
              <div className="profile-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="profile-name" style={{ display: 'block' }}>{vehicle.registration}</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      color: getStatusColor(vehicle.status)
                    }}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="profile-meta" style={{ marginTop: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{vehicle.type}</span>
                    <span>•</span>
                    <span>{vehicle.make_model}</span>
                    <span>•</span>
                    <span>Seats: {vehicle.capacity}</span>
                  </div>
                </div>
                <span className="btn-icon" style={{ marginTop: '4px' }}>→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
