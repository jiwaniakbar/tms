
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsNavClient({ permissions, role }: { permissions?: any, role?: string }) {
  const pathname = usePathname();
  
  const canView = (moduleCode: string) => {
    if (role === 'SUPER_ADMIN') return true;
    if (!permissions) return false; 
    return !!permissions[moduleCode]?.view;
  };

  return (
    <nav className="settings-nav-list">
      {canView('users') && (
        <Link href="/settings/users" className={`settings-nav-item ${pathname.includes('/users') ? 'active' : ''}`}>
          <span className="icon">🛡️</span> Users
        </Link>
      )}
      {canView('roles') && (
        <Link href="/settings/roles" className={`settings-nav-item ${pathname.includes('/roles') ? 'active' : ''}`}>
          <span className="icon">🔐</span> Roles
        </Link>
      )}
      {canView('settings') && (
        <>
          <Link href="/settings/timezone" className={`settings-nav-item ${pathname.includes('/timezone') ? 'active' : ''}`}>
            <span className="icon">🌍</span> Timezone
          </Link>
          <Link href="/settings/statuses" className={`settings-nav-item ${pathname.includes('/statuses') ? 'active' : ''}`}>
            <span className="icon">🚥</span> Trip Progress
          </Link>
          <Link href="/settings/regions" className={`settings-nav-item ${pathname.includes('/regions') ? 'active' : ''}`}>
            <span className="icon">🗺️</span> Regions & Locations
          </Link>
        </>
      )}
    </nav>
  );
}
