export const dynamic = 'force-dynamic';
import { getVehicle } from '@/app/actions';
import VehicleForm from '@/components/VehicleForm';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Vehicle',
};

export default async function EditVehiclePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const vehicle = await getVehicle(Number(params.id));

  if (!vehicle) {
    notFound();
  }

  return (
    <>
      <VehicleForm vehicle={vehicle} />
    </>
  );
}
