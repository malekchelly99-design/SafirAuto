import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Gauge, Calendar } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function CinematicBanner() {
  return (
    <section className="relative overflow-hidden my-8 mx-4 sm:mx-6 lg:mx-8 rounded-3xl min-h-[500px] lg:min-h-[600px] flex items-center">
      {/* Floating luxury orb */}
      <div className="absolute z-10 -top-20 -right-20 w-80 h-80 bg-[#eab308]/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

      {/* Background image — Lamborghini Huracán */}
      <Image
        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=90&auto=format&fit=crop"
        alt="Lamborghini Huracán EVO"
        fill
        className="object-cover object-center"
        sizes="100vw"
        quality={95}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/70 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_70%_50%,rgba(220,38,38,0.12)_0%,transparent_60%)]" />

      {/* Red accent line top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#eab308] via-[#eab308]/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-12 max-w-2xl">
        <ScrollReveal direction="left" distance={40}>
          {/* Tag */}
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-px bg-[#eab308]" />
            <span className="text-[#eab308] text-xs tracking-[0.4em] uppercase font-black">
              Coup de Cœur
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white font-black leading-[0.92] mb-4">
            <span className="block text-gray-400 text-lg font-medium tracking-widest uppercase mb-1">Lamborghini</span>
            <span className="block text-white text-5xl sm:text-6xl lg:text-7xl">Huracán EVO</span>
            <span className="block text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#eab308] font-black mt-1">
              Spyder
            </span>
          </h2>

          <p className="text-gray-300 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
            640 chevaux propulsés par un V10 atmosphérique. La supercar italienne qui redéfinit
            les sensations de conduite à ciel ouvert.
          </p>

          {/* Specs strip */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            {[
              { icon: Zap, value: '640 ch', label: 'Puissance' },
              { icon: Gauge, value: '3.1 s', label: '0 – 100 km/h' },
              { icon: Calendar, value: '2024', label: 'Année' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 bg-[#1a1d23]/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <Icon className="w-4 h-4 text-[#eab308]" />
                <div>
                  <p className="text-white font-black text-sm leading-none">{value}</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/vehicules?brand=Lamborghini"
              className="btn-orange inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black tracking-widest shadow-[0_8px_30px_rgba(220,38,38,0.4)]"
            >
              VOIR LES LAMBORGHINI
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-white text-sm font-bold tracking-wide transition-colors flex items-center gap-1.5"
            >
              Demander un essai <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Bottom red accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#eab308]/50 via-[#eab308]/20 to-transparent" />
    </section>
  );
}

