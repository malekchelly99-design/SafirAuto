'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { Vehicle } from '@/types';
import { vehiclesApi } from '@/lib/api';
import { localFavorites } from '@/lib/utils';
import { Heart, ArrowRight } from 'lucide-react';

export default function FavoritesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = localFavorites.get();
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map(id => vehiclesApi.get(id).catch(() => null)))
      .then(results => setVehicles(results.filter(Boolean) as Vehicle[]))
      .finally(() => setLoading(false));
  }, []);

  const handleFavoriteToggle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="bg-[#23272e] dark:bg-[#111114] border-b border-black/10 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-3 mb-2"><Heart className="w-5 h-5 text-[#eab308]" /><span className="text-[#eab308] text-xs tracking-[0.3em] uppercase font-bold">Mes favoris</span></div>
            <h1 className="text-4xl font-black text-white dark:text-white">VÉHICULES FAVORIS</h1>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="text-center py-20 text-gray-300 dark:text-gray-500">Chargement...</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-24">
              <Heart className="w-16 h-16 text-gray-800 mx-auto mb-4" />
              <h3 className="text-white dark:text-white font-bold text-xl mb-2">Aucun favori pour l&apos;instant</h3>
              <p className="text-gray-300 dark:text-gray-500 mb-6">Parcourez notre catalogue et cliquez sur ? pour sauvegarder vos prÉfÉrÉs.</p>
              <Link href="/vehicules" className="btn-orange inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black">VOIR LE CATALOGUE <ArrowRight className="w-4 h-4" /></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} onFavoriteToggle={handleFavoriteToggle} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

