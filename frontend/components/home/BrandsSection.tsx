'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Brand } from '@/types';
import { brandsApi } from '@/lib/api';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const BRAND_COLORS: Record<string, string> = {
  'Porsche': '#c00',
  'Ferrari': '#c00',
  'Lamborghini': '#d4a900',
  'Mercedes-Benz': '#888',
  'BMW': '#1c69d4',
  'Audi': '#888',
  'Bentley': '#006a4e',
  'Aston Martin': '#094d27',
  'McLaren': '#eab308',
  'Range Rover': '#2c4a2e',
  'Maserati': '#003366',
};

export default function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    brandsApi.list().then(data => setBrands(data.slice(0, 8)));
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#23272e] dark:bg-[#0d0d10]">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <ScrollReveal direction="left" distance={30} once={false}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#eab308]" />
              <span className="text-[#eab308] text-xs tracking-[0.35em] uppercase font-bold">Les Meilleures Marques</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white dark:text-white tracking-tight">
              NOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#eab308]">MARQUES</span>
            </h2>
          </div>
          </ScrollReveal>
          <ScrollReveal direction="right" distance={30} once={false}>
          <Link href="/marques" className="hidden sm:inline-flex items-center gap-2 text-[#eab308] text-sm font-black tracking-wider hover:gap-3 transition-all">
            TOUTES LES MARQUES <ArrowRight className="w-4 h-4" />
          </Link>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
          {brands.map((brand, i) => (
            <ScrollReveal key={brand.slug} direction="up" distance={20} delay={i * 80} once={false}>
              <Link
                href={`/marques/${brand.slug}`}
                className="group relative bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#eab308]/30 hover:bg-gray-200 dark:hover:bg-[#1c1c21] transition-all duration-300 min-h-[120px]"
              >
              {/* Brand logo or initial */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 transition-colors group-hover:border-[#eab308] relative flex-shrink-0"
                style={{ borderColor: brand.logo ? '#333' : (BRAND_COLORS[brand.name] || '#333'), background: brand.logo ? '#1c1c21' : `${BRAND_COLORS[brand.name] || '#333'}20` }}
              >
                {brand.logo ? (
                  <Image
                    src={brand.logo.startsWith('http') ? brand.logo : `http://localhost:8000${brand.logo}`}
                    alt={brand.name}
                    fill
                    className="object-contain p-1"
                    sizes="48px"
                  />
                ) : (
                  <span className="text-white font-black text-xl">{brand.name[0]}</span>
                )}
              </div>
                 <span className="text-white dark:text-white font-bold text-sm text-center tracking-wide group-hover:text-[#eab308] transition-colors">
                {brand.name}
              </span>
              {brand.country && (
                 <span className="text-gray-300 dark:text-gray-500 text-xs">{brand.country}</span>
              )}
            </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

