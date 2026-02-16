'use client';

import { createProfile, updateProfile } from '@/app/actions';
import { Profile } from '@/lib/db';
import Link from 'next/link';

export default function ProfileForm({ profile, currentUserRole }: { profile?: any, currentUserRole?: string }) {
  const isEditing = !!profile;
  const action = isEditing ? updateProfile.bind(null, profile.id) : createProfile;

  return (
    <form action={action} className="glass-card animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
        {isEditing ? 'Edit Profile' : 'Create New Profile'}
      </h2>

      {isEditing && profile.photo_url && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <img
            src={profile.photo_url}
            alt="Profile Photo"
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
          />
        </div>
      )}

      <div className="input-group">
        <label className="input-label" htmlFor="photo">Profile Photo</label>
        <input className="input-field" type="file" id="photo" name="photo" accept="image/*" />
      </div>

      <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id="is_driver"
          name="is_driver"
          defaultChecked={profile?.is_driver === 1}
          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
        />
        <label htmlFor="is_driver" style={{ color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }}>
          This person is a Driver
        </label>
      </div>



      {(currentUserRole === 'ADMIN' || currentUserRole === 'COMMAND_CENTER') && (
        <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Access & Security</h3>

          <div className="input-group">
            <label className="input-label" htmlFor="role">System Role</label>
            <select className="input-field" id="role" name="role" defaultValue={profile?.role || 'VOLUNTEER'}>
              <option value="VOLUNTEER">Bus Incharge (Limited Access)</option>
              {currentUserRole === 'ADMIN' && <option value="COMMAND_CENTER">Command Center (Dashboard Access)</option>}
              {currentUserRole === 'ADMIN' && <option value="ADMIN">Administrator (Full Access)</option>}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">
              {profile ? "Reset Password (leave blank to keep current)" : "Set Password (Optional)"}
            </label>
            <input
              className="input-field"
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
            />
          </div>
        </div>
      )}

      <div className="input-group">
        <label className="input-label" htmlFor="name">Full Name</label>
        <input className="input-field" type="text" id="name" name="name" required defaultValue={profile?.name} placeholder="Jane Doe" />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="email">Email Address <span style={{ opacity: 0.5, fontSize: '0.8em' }}>(Optional)</span></label>
        <input className="input-field" type="email" id="email" name="email" defaultValue={profile?.email} placeholder="jane@example.com" />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="phone">Phone Number</label>
        <input
          className="input-field"
          type="tel"
          id="phone"
          name="phone"
          defaultValue={profile?.phone}
          placeholder="9876543210"
          maxLength={10}
          pattern="[0-9]{10}"
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10);
          }}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="alternate_phone">Alternate Phone Number <span style={{ opacity: 0.5, fontSize: '0.8em' }}>(Optional)</span></label>
        <input
          className="input-field"
          type="tel"
          id="alternate_phone"
          name="alternate_phone"
          defaultValue={profile?.alternate_phone}
          placeholder="9876543210"
          maxLength={10}
          pattern="[0-9]{10}"
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 10);
          }}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="dob">Date of Birth <span style={{ opacity: 0.5, fontSize: '0.8em' }}>(Optional)</span></label>
        <input className="input-field" type="date" id="dob" name="dob" defaultValue={profile?.dob} />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="bio">Short Bio <span style={{ opacity: 0.5, fontSize: '0.8em' }}>(Optional)</span></label>
        <textarea
          className="input-field"
          id="bio"
          name="bio"
          rows={4}
          defaultValue={profile?.bio}
          placeholder="Write a little bit about yourself..."
          style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {isEditing ? 'Save Changes' : 'Create Profile'}
        </button>
        <Link href="/" className="btn btn-secondary" style={{ flex: 1 }}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
