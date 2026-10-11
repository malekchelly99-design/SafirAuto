'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminVehiclesApi } from '@/lib/api';
import { Vehicle } from '@/types';
import VehicleForm from '@/components/admin/VehicleForm';
import { PageLoader } from '@/components/ui/Spinner';

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminVehiclesApi.get(id)
      .then(setVehicle)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!vehicle) return <div className="p-8 text-gray-500">Véhicule non trouvé.</div>;

  return <VehicleForm initialData={vehicle} vehicleId={id} />;
}
