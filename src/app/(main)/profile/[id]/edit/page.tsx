export const dynamic = 'force-dynamic';
import { getProfile } from '@/app/actions';
import ProfileForm from '@/components/ProfileForm';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Profile',
};

export default async function EditProfilePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const params = await props.params;
  const profile = await getProfile(Number(params.id));

  if (!profile) {
    notFound();
  }

  return (
    <>
      <ProfileForm profile={profile} currentUserRole={session?.role} />
    </>
  );
}
