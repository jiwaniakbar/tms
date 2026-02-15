'use client';

import { useState } from 'react';
import { updateTimezone } from '@/app/actions';

const timezones = [
  'Asia/Kolkata', // Default
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney'
];

export default function TimezoneSettings({ initialTimezone }: { initialTimezone: string }) {
  const [selected, setSelected] = useState(initialTimezone || 'Asia/Kolkata');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateTimezone(selected);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="input-group">
          <label className="filter-label" htmlFor="timezone">Default Timezone</label>
          <select 
            className="filter-select" 
            id="timezone" 
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>
                {tz === 'Asia/Kolkata' ? tz + ' (India Standard Time)' : tz}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={saving}
          style={{ alignSelf: 'flex-start' }}
        >
          {saving ? 'Saving...' : 'Save Timezone'}
        </button>
      </form>
  );
}
