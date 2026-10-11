'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { brandsApi, vehiclesApi } from '@/lib/api';
import { Brand, Vehicle } from '@/types';

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    brandsApi.get(slug).then(setBrand);
    vehiclesApi.list({ brand: slug }).then(r => setVehicles(r.results));
  }, [slug]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="bg-[#23272e] dark:bg-[#111114] border-b border-black/10 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-[#e8720c]/10 border border-[#e8720c]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#e8720c] font-black text-3xl">{brand?.name[0]}</span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white dark:text-white">{brand?.name}</h1>
                {brand?.country && <p className="text-gray-300 dark:text-gray-500 mt-1">{brand.country} · {vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}</p>}
                {brand?.description && <p className="text-gray-300 dark:text-gray-400 text-sm mt-2 max-w-xl">{brand.description}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {vehicles.length === 0 ? (
            <div className="text-center py-20 text-gray-300 dark:text-gray-500">Aucun véhicule disponible pour cette marque.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
