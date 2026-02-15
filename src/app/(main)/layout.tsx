import DesktopToggle from '@/components/DesktopToggle';
import MainNavClient from '@/components/MainNavClient';

import { getSession } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <div className="app-container" >
      <header className="header app-header">
        <div className="header-title" style={{ margin: 0, gridColumn: '1', gridRow: '1' }}>Transport Management</div>
        
        <div className="header-utils" style={{ display: 'flex', gap: '8px', alignItems: 'center', gridColumn: '2', gridRow: '1', justifySelf: 'end' }}>
          <DesktopToggle />
          <LogoutButton />
        </div>

        {session && (
          <div className="header-user" style={{ gridColumn: '1 / -1', gridRow: '2', justifySelf: 'end', fontSize: '0.9rem', color: '#94a3b8', marginTop: '-4px', paddingRight: '4px' }}>
            {session.name}
          </div>
        )}

        <div className="header-nav-container" style={{ gridColumn: '1 / -1', gridRow: '3', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <MainNavClient role={session?.role || 'VOLUNTEER'} permissions={session?.permissions} />
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
