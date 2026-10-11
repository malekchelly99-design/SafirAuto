'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const GALLERY = [
  {
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=85&auto=format&fit=crop',
    brand: 'Lamborghini', model: 'Huracán EVO', href: '/vehicules?brand=Lamborghini',
  },
  {
    img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=85&auto=format&fit=crop',
    brand: 'Bentley', model: 'Continental GT Speed', href: '/vehicules?brand=Bentley',
  },
  {
    img: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=85&auto=format&fit=crop',
    brand: 'Aston Martin', model: 'DB11 Volante', href: '/vehicules?brand=Aston+Martin',
  },
  {
    img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=85&auto=format&fit=crop',
    brand: 'Rolls-Royce', model: 'Ghost', href: '/vehicules?brand=Rolls-Royce',
  },
  {
    img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=85&auto=format&fit=crop',
    brand: 'Porsche', model: '911 Carrera GTS', href: '/vehicules?brand=Porsche',
  },
  {
    img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=85&auto=format&fit=crop',
    brand: 'Ferrari', model: 'Roma Spider', href: '/vehicules?brand=Ferrari',
  },
  {
    img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=85&auto=format&fit=crop',
    brand: 'BMW', model: 'M4 Competition', href: '/vehicules?brand=BMW',
  },
  {
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85&auto=format&fit=crop',
    brand: 'McLaren', model: '720S Spider', href: '/vehicules?brand=McLaren',
  },
];

export default function GalleryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 360 : -360, behavior: 'smooth' });
  };

  return (
    <section className="py-16 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-[1440px] mx-auto flex items-end justify-between">
          <ScrollReveal direction="left" distance={30} once={false}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-px bg-[#eab308]" />
                <span className="text-[#eab308] text-xs tracking-[0.35em] uppercase font-bold">Galerie</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white dark:text-white tracking-tight">
                L&apos;ART <span className="text-[#eab308]">AUTOMOBILE</span>
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" distance={30} once={false}>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 text-gray-300 dark:text-gray-400 hover:text-[#eab308] hover:border-[#eab308] flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 text-gray-300 dark:text-gray-400 hover:text-[#eab308] hover:border-[#eab308] flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-8 pb-4 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {GALLERY.map(({ img, brand, model, href }, i) => (
          <ScrollReveal key={`${brand}-${model}`} direction="up" distance={20} delay={i * 100} once={false}>
            <Link
              href={href}
              className="group relative flex-shrink-0 w-72 lg:w-80 aspect-[4/3] rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-[#eab308]/40 transition-all"
            >
              <Image
                src={img}
                alt={`${brand} ${model}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="320px"
                quality={85}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Red glow on hover */}
              <div className="absolute inset-0 bg-[#eab308]/0 group-hover:bg-[#eab308]/5 transition-colors duration-300" />

              {/* Labels */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[#eab308] text-[11px] font-black tracking-[0.2em] uppercase mb-0.5">{brand}</p>
                <p className="text-white font-bold text-base">{model}</p>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

