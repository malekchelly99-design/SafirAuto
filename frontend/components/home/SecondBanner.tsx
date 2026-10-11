import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Star, Wrench } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function SecondBanner() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left É Porsche dark card */}
        <ScrollReveal direction="left" distance={30} once={false}>
        <div className="relative overflow-hidden rounded-3xl min-h-[380px] flex flex-col justify-end group">
          <Image
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=90&auto=format&fit=crop"
            alt="Porsche 911"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="50vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          <div className="relative z-10 p-8">
            <span className="text-[#eab308] text-[10px] font-black tracking-[0.4em] uppercase block mb-2">IcÉne Sportive</span>
            <h3 className="text-white font-black text-4xl leading-tight mb-3">
              Porsche<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#eab308]">911 GTS</span>
            </h3>
            <p className="text-gray-300 text-sm mb-5 max-w-xs leading-relaxed">
              La perfection sportive depuis 1963. Chaque 911 est une Éuvre d&apos;ingÉnierie É l&apos;État pur.
            </p>
            <Link href="/vehicules?brand=Porsche" className="inline-flex items-center gap-2 text-white text-sm font-black tracking-wider hover:text-[#eab308] transition-colors">
              EXPLORER <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        </ScrollReveal>

        {/* Right É Two stacked cards */}
        <div className="flex flex-col gap-6">

          {/* Ferrari */}
          <ScrollReveal direction="right" distance={30} delay={100} once={false}>
          <div className="relative overflow-hidden rounded-3xl flex-1 min-h-[175px] group">
            <Image
              src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=90&auto=format&fit=crop"
              alt="Ferrari"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="50vw"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

            <div className="relative z-10 p-6 h-full flex flex-col justify-center">
              <span className="text-[#eab308] text-[10px] font-black tracking-[0.4em] uppercase block mb-1.5">Passion Italienne</span>
              <h3 className="text-white font-black text-2xl mb-2">Ferrari<br /><span className="text-[#eab308]">Roma Spider</span></h3>
              <Link href="/vehicules?brand=Ferrari" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-bold transition-colors mt-1">
                DÉCOUVRIR <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          </ScrollReveal>

          {/* Lamborghini */}
          <ScrollReveal direction="right" distance={30} delay={200} once={false}>
          <div className="relative overflow-hidden rounded-3xl flex-1 min-h-[175px] group">
            <Image
              src="https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=900&q=90&auto=format&fit=crop"
              alt="Lamborghini"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="50vw"
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

            <div className="relative z-10 p-6 h-full flex flex-col justify-center">
              <span className="text-[#eab308] text-[10px] font-black tracking-[0.4em] uppercase block mb-1.5">Supercar Ultime</span>
              <h3 className="text-white font-black text-2xl mb-2">Lamborghini<br /><span className="text-[#eab308]">Urus S</span></h3>
              <Link href="/vehicules?brand=Lamborghini" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-bold transition-colors mt-1">
                DÉCOUVRIR <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}

