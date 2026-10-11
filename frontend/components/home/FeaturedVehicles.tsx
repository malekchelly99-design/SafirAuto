'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Vehicle } from '@/types';
import { vehiclesApi } from '@/lib/api';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { SkeletonGrid } from '@/components/ui/SkeletonCard';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehiclesApi.list({ featured: true, page_size: 6 })
      .then(data => setVehicles(data.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
         <div className="flex items-end justify-between mb-12">
           <ScrollReveal direction="left" distance={30} once={false}>
           <div>
             <div className="flex items-center gap-3 mb-4">
               <span className="w-8 h-px bg-[#eab308]" />
               <span className="text-[#eab308] text-xs tracking-[0.35em] uppercase font-bold">SÉlection du Moment</span>
             </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white dark:text-white tracking-tight">
               VÉHICULES<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#eab308]">D&apos;EXCEPTION</span>
             </h2>
           </div>
           </ScrollReveal>
           <ScrollReveal direction="right" distance={30} once={false}>
           <Link
             href="/vehicules"
             className="hidden sm:inline-flex items-center gap-2 text-[#eab308] text-sm font-black tracking-wider hover:gap-3 transition-all"
           >
             VOIR TOUT <ArrowRight className="w-4 h-4" />
           </Link>
           </ScrollReveal>
         </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 text-gray-300 dark:text-gray-500">
            <p className="text-lg">Aucun vÉhicule disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {vehicles.map((v, i) => (
              <ScrollReveal key={v.id} direction="up" distance={15} delay={i * 80} once={false}>
                <VehicleCard vehicle={v} />
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link href="/vehicules" className="btn-orange inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black tracking-widest">
            VOIR TOUT LE CATALOGUE <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

