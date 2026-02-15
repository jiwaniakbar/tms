export const dynamic = 'force-dynamic';
import VehicleForm from '@/components/VehicleForm';

export const metadata = {
  title: 'Register Vehicle',
};

export default function CreateVehiclePage() {
  return (
    <>
      <VehicleForm />
    </>
  );
}
