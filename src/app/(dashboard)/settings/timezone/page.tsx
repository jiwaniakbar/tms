export const dynamic = 'force-dynamic';
import { getAppSetting } from '@/app/actions';
import TimezoneSettings from '@/components/TimezoneSettings';

export const metadata = {
  title: 'Timezone Settings',
};

export default async function TimezonePage() {
  const timezone = await getAppSetting('timezone') || 'Asia/Kolkata';

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>
        Timezone Configuration
      </h2>
      <TimezoneSettings initialTimezone={timezone} />
    </div>
  );
}
