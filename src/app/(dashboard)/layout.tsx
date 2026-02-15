import './dashboard.css';
import DashboardLayoutClient from './DashboardLayoutClient';

import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <DashboardLayoutClient role={session?.role || 'COMMAND_CENTER'} permissions={session?.permissions}>
      {children}
    </DashboardLayoutClient>
  );
}