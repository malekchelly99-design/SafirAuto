'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Brand } from '@/types';
import { brandsApi } from '@/lib/api';
import { ArrowRight } from 'lucide-react';

export default function MarquesPage() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => { brandsApi.list().then(setBrands); }, []);

  const getLogoSrc = (logo?: string) => {
    if (!logo) return null;
    if (logo.startsWith('http')) return logo;
    return `http://localhost:8000${logo}`;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="bg-[#23272e] dark:bg-[#111114] border-b border-black/10 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-6 h-px bg-[#eab308]" />
              <span className="text-[#eab308] text-xs tracking-[0.3em] uppercase font-bold">Nos Partenaires</span>
            </div>
            <h1 className="text-4xl font-black text-white dark:text-white">NOS MARQUES</h1>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map(b => {
              const logoSrc = getLogoSrc(b.logo);
              return (
                <Link
                  key={b.slug}
                  href={`/marques/${b.slug}`}
                  className="group bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-2xl p-8 hover:border-[#eab308]/30 transition-all hover:-translate-y-1"
                >
                  {/* Circle logo */}
                  <div                   className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#eab308]/20 group-hover:border-[#eab308] transition-colors bg-gray-200 dark:bg-[#1c1c21] flex items-center justify-center mb-5 flex-shrink-0">
                    {logoSrc ? (
                      <Image
                        src={logoSrc}
                        alt={b.name}
                        fill
                        className="object-contain p-2"
                        sizes="64px"
                      />
                    ) : (
                      <span className="text-[#eab308] font-black text-2xl">{b.name[0]}</span>
                    )}
                  </div>

                  <h2 className="text-white dark:text-white font-black text-xl mb-1 group-hover:text-[#eab308] transition-colors">
                    {b.name}
                  </h2>
                  {b.country && (
                    <p className="text-gray-300 dark:text-gray-500 text-sm mb-3">{b.country}</p>
                  )}
                  {b.description && (
                    <p className="text-gray-300 dark:text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                      {b.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[#eab308] text-xs font-black uppercase tracking-wider">
                    Voir les véhicules <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

