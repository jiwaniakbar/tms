import './settings.css';
import { getSession } from '@/lib/auth';
import SettingsNavClient from '@/components/SettingsNavClient';
import { redirect } from 'next/navigation';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="settings-container">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <div className="dashboard-header-titles">
          <h1>Administration</h1>
          <p className="subtitle">Configuration options for the Transport Management ecosystem.</p>
        </div>
      </header>

      <div className="settings-page-grid">
        {/* Settings Navigation */}
        <aside className="settings-nav-sidebar">
          <SettingsNavClient role={session.role} permissions={session.permissions} />
        </aside>

        {/* Selected Settings Content */}
        <div className="settings-content-area">
          {children}
        </div>
      </div>
    </div>
  );
}
