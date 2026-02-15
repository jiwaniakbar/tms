'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNavClient({ role, permissions }: { role?: string, permissions?: any }) {
  // Helper to check view permission
  const canView = (moduleCode: string) => {
    if (role === 'SUPER_ADMIN') return true;
    if (!permissions) return false; 
    return !!permissions[moduleCode]?.view;
  };
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      {canView('dashboard') && (
        <Link href="/dashboard" className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}>
          <span className="icon">((•))</span> Command Center
        </Link>
      )}

      {canView('users') && (
        <Link href="/" className={`sidebar-link ${pathname === '/' ? 'active' : ''}`}>
          <span className="icon">👥</span> Bus Incharges
        </Link>
      )}

      {canView('vehicles') && (
        <Link href="/vehicles" className={`sidebar-link ${pathname.startsWith('/vehicles') ? 'active' : ''}`}>
          <span className="icon">🚌</span> Vehicles
        </Link>
      )}

      {canView('trips') && (
        <Link href="/trips" className={`sidebar-link ${pathname === '/trips' || pathname.startsWith('/trips/') ? 'active' : ''}`}>
          <span className="icon">🛣️</span> Trip Tracking
        </Link>
      )}

      {canView('trips') && (
        <Link href="/manage-trips" className={`sidebar-link ${pathname.startsWith('/manage-trips') ? 'active' : ''}`}>
          <span className="icon">🗺️</span> Manage Trips
        </Link>
      )}

      {/* RBAC for Settings is tricky. Let's assume settings module OR super admin */}
      {canView('settings') && (
        <Link href="/settings/users" className={`sidebar-link ${pathname.startsWith('/settings') || pathname.startsWith('/users') ? 'active' : ''}`}>
          <span className="icon">⚙️</span> Admin
        </Link>
      )}
      
      

      
    </nav>
  );
}
