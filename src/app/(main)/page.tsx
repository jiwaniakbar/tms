export const dynamic = 'force-dynamic';
import { getProfiles } from '@/app/actions';
import SearchForm from '@/components/SearchForm';
import Link from 'next/link';

export default async function Home(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q;
  const profiles = await getProfiles(query);

  return (
    <>
      <SearchForm />

      <Link href="/create" className="btn btn-primary animate-in" style={{ animationDelay: '0.1s' }}>
        <span>+ Add New Profile</span>
      </Link>

      <div className="profiles-list animate-in" style={{ animationDelay: '0.2s' }}>
        {profiles.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            No profiles found. {query && `Try a different search term.`}
          </div>
        ) : (
          profiles.map((profile) => (
            <Link href={`/profile/${profile.id}/edit`} key={profile.id} className="glass-card profile-item">
              <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.name} style={{ flexShrink: 0, minWidth: '48px', minHeight: '48px', width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
                ) : (
                  <div style={{ flexShrink: 0, minWidth: '48px', minHeight: '48px', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <span className="profile-name" style={{ display: 'block' }}>{profile.name}</span>
                  <div className="profile-meta" style={{ marginTop: '4px' }}>
                    <span>{profile.phone || "No Mobile"}</span>
                    <span>•</span>
                    <span>Age: {profile.age}</span>
                  </div>
                </div>
                <span className="btn-icon">→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
