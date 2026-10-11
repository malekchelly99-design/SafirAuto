'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Hero slides — different cars for CapAuto
const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=90&auto=format&fit=crop',
    brand: 'Lamborghini',
    model: 'Huracán EVO',
    tag: 'Supercar · 640 ch',
    headline: ['VITESSE', 'PASSION', 'PRESTIGE'],
    sub: 'L\'âme du sport automobile italien',
  },
  {
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1920&q=90&auto=format&fit=crop',
    brand: 'Aston Martin',
    model: 'DB11 Volante',
    tag: 'Grand Tourisme · 510 ch',
    headline: ['ÉLÉGANCE', 'BRITANNIQUE', 'ABSOLUE'],
    sub: 'Le grand tourisme à son apogée',
  },
  {
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920&q=90&auto=format&fit=crop',
    brand: 'Rolls-Royce',
    model: 'Ghost',
    tag: 'Berline de Luxe · 571 ch',
    headline: ['LE SUMMUM', 'DU LUXE', 'AUTOMOBILE'],
    sub: 'Quand l\'opulence rencontre la performance',
  },
  {
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=90&auto=format&fit=crop',
    brand: 'Bentley',
    model: 'Continental GT Speed',
    tag: 'Grand Tourer · 659 ch',
    headline: ['PUISSANCE', 'RAFFINEMENT', 'LÉGENDE'],
    sub: 'L\'art de voyager avec panache',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  };

  const next = () => go((current + 1) % SLIDES.length);
  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    intervalRef.current = setInterval(next, 7000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const slide = SLIDES[current];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Background image with cinematic overlay ── */}
      <div className="absolute inset-0">
        {/* Base dark */}
        <div className="absolute inset-0 bg-[#050506] z-0" />

        {/* Car image */}
        <div className={`absolute inset-0 z-[1] transition-opacity duration-700 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          <Image
            src={slide.image}
            alt={`${slide.brand} ${slide.model}`}
            fill
            priority
            className="object-cover object-center scale-105"
            sizes="100vw"
            quality={95}
          />
        </div>

        {/* Cinematic layered overlays */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#050506] via-transparent to-[#050506]/30" />
        {/* Red accent glow — bottom right */}
        <div className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_60%_50%_at_80%_70%,rgba(220,38,38,0.18)_0%,transparent_60%)]" />
        {/* Vignette */}
        <div className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_50%,rgba(0,0,0,0.5)_100%)]" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 z-[4] opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating orbs — red tint */}
        <div className="absolute z-[3] top-1/4 left-1/4 w-64 h-64 bg-[#eab308]/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute z-[3] top-1/3 right-1/4 w-48 h-48 bg-[#eab308]/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute z-[3] bottom-1/4 left-1/3 w-56 h-56 bg-[#1a1d23]/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 lg:pt-0">
        <div className="min-h-screen lg:min-h-0 flex flex-col justify-center pb-32 lg:pb-0 max-w-3xl">

          {/* Slide tag */}
          <div className={`flex items-center gap-3 mb-6 transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <span className="w-10 h-px bg-[#eab308]" />
            <span className="text-[#eab308] text-xs tracking-[0.35em] uppercase font-bold">
              {slide.brand} · {slide.tag}
            </span>
          </div>

          {/* Headline */}
          <div className={`mb-6 transition-all duration-500 delay-75 ${animating ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
            <h1 className="font-black tracking-tight leading-[0.92]">
              <span className="block text-white text-5xl sm:text-6xl lg:text-7xl xl:text-[88px]">
                {slide.headline[0]}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] via-[#eab308] to-[#eab308] text-5xl sm:text-6xl lg:text-7xl xl:text-[88px]">
                {slide.headline[1]}
              </span>
              <span className="block text-white/85 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mt-1">
                {slide.headline[2]}
              </span>
            </h1>
            <p className="text-gray-300 text-lg lg:text-xl font-light italic mt-3">
              {slide.sub}
            </p>
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-14 transition-all duration-500 delay-150 ${animating ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
            <Link
              href="/vehicules"
              className="btn-orange inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-black tracking-widest shadow-[0_8px_30px_rgba(220,38,38,0.4)]"
            >
              VOIR LE CATALOGUE
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="btn-outline inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm font-black tracking-widest"
            >
              NOUS CONTACTER
            </Link>
          </div>

          {/* Stats */}
          <div className={`flex items-center gap-6 sm:gap-10 pt-8 border-t border-white/10 transition-all duration-500 delay-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
            {[
              { value: '25+', label: 'Marques Premium' },
              { value: '300+', label: 'Véhicules' },
              { value: '10 ans', label: "D'expérience" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl lg:text-3xl font-black text-white">{value}</div>
                <div className="text-gray-400 text-xs tracking-wider uppercase mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Slide nav arrows ── */}
      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1a1d23]/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#eab308] hover:border-[#eab308] transition-all"
        aria-label="Précédent"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#1a1d23]/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#eab308] hover:border-[#eab308] transition-all"
        aria-label="Suivant"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── Slide dots ── */}
      <div className="absolute bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-1.5 bg-[#eab308]'
                : 'w-1.5 h-1.5 bg-[#1a1d23]/30 hover:bg-[#1a1d23]/60'
            }`}
          />
        ))}
      </div>

      {/* ── Current slide label bottom-right ── */}
      <div className="absolute bottom-24 lg:bottom-12 right-6 lg:right-10 z-20 text-right hidden sm:block">
        <p className="text-white font-black text-sm tracking-wide">{slide.brand}</p>
        <p className="text-gray-400 text-xs">{slide.model}</p>
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-24 lg:bottom-12 left-6 lg:left-10 z-20 hidden sm:flex items-center gap-2 text-xs text-gray-500 font-mono">
        <span className="text-white font-bold">{String(current + 1).padStart(2, '0')}</span>
        <span className="w-8 h-px bg-[#1a1d23]/20" />
        <span>{String(SLIDES.length).padStart(2, '0')}</span>
      </div>

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </section>
  );
}

