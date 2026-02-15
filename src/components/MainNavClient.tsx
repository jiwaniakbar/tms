'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainNavClient({ role, permissions }: { role: string, permissions?: any }) {
  // Helper to check view permission
  const canView = (moduleCode: string) => {
    // If no permission object (legacy or super admin override?), maybe allow?
    // But for RBAC, if role is present, use it.
    // If role is SUPER_ADMIN, always true.
    if (role === 'SUPER_ADMIN') return true;
    if (!permissions) return false; 
    return !!permissions[moduleCode]?.view;
  };
  const pathname = usePathname();

  return (
    <nav className="header-nav" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      
      {canView('dashboard') && (
        <Link 
          href="/dashboard" 
          className="btn nav-btn command-center-btn"
        >
          Command Center
        </Link>
      )}

      {canView('users') && (
        <Link 
          href="/" 
          className={`btn nav-btn ${pathname === '/' ? 'active' : ''}`}
        >Bus Incharges</Link>
      )}

      {canView('vehicles') && (
        <Link 
          href="/vehicles" 
          className={`btn nav-btn ${pathname.startsWith('/vehicles') ? 'active' : ''}`}
        >
          Vehicles
        </Link>
      )}

      {canView('trips') && (
        <Link 
          href="/trips" 
        className={`btn nav-btn ${pathname === '/trips' || pathname.startsWith('/trips/') ? 'active' : ''}`}
      >
        Trips
      </Link>
      )}

      {canView('trips') && (
        <Link 
          href="/manage-trips" 
          className={`btn nav-btn ${pathname.startsWith('/manage-trips') ? 'active' : ''}`}
          style={{ borderColor: '#3b82f6', color: '#60a5fa' }}
        >
          Manage Trips
        </Link>
      )}
    </nav>
  );
}
