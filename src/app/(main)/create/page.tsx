export const dynamic = 'force-dynamic';
import ProfileForm from '@/components/ProfileForm';
import { getSession } from '@/lib/auth';

export const metadata = {
  title: 'Create Profile',
};

export default async function CreateProfilePage() {
  const session = await getSession();
  return (
    <>
      <ProfileForm currentUserRole={session?.role} />
    </>
  );
}
