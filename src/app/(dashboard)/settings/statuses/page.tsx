export const dynamic = 'force-dynamic';
import { getTripStatuses, getTripSubStatuses } from '@/app/actions';
import TripWorkflowManager from '@/components/TripWorkflowManager';

export const metadata = {
  title: 'Trip Progress Settings',
};

export default async function StatusesPage() {
  const coreStatuses = await getTripStatuses();
  const subStatuses = await getTripSubStatuses();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          Trip Progression Workflow
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Manage your top-level milestone statuses (e.g. Scheduled, Active) and define custom sub-statuses under each to track granular progress points.
        </p>
        <TripWorkflowManager coreStatuses={coreStatuses} subStatuses={subStatuses} />
      </div>
    </div>
  );
}
