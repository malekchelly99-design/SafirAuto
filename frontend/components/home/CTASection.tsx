import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-56 h-56 bg-[#eab308]/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#eab308]/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#eab308]/50 to-transparent animate-[line-scale_1.5s_ease-out_both]" />
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#eab308]/30 to-transparent animate-[line-scale_2s_ease-out_0.5s_both]" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <ScrollReveal direction="up" distance={30}>
          <span className="text-[#eab308] text-xs tracking-[0.35em] uppercase font-bold">Votre prochain vÉhicule</span>
          <h2 className="text-4xl lg:text-6xl font-black text-white dark:text-white mt-4 mb-6 tracking-tight">
            TROUVEZ VOTRE<br />
            <span className="text-[#eab308]">VÉHICULE IDÉAL</span>
          </h2>
          <p className="text-gray-300 dark:text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Notre Équipe d&apos;experts est É votre disposition pour vous guider vers le vÉhicule de vos rÉves.
            Financement, reprise, import É nous gÉrons tout.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ScrollReveal delay={100} direction="up" distance={15}>
              <Link href="/vehicules" className="btn-orange inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-black tracking-widest w-full sm:w-auto justify-center">
                EXPLORER LE CATALOGUE
                <ArrowRight className="w-4 h-4" />
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={200} direction="up" distance={15}>
              <Link href="/contact" className="btn-outline inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-black tracking-widest w-full sm:w-auto justify-center">
                <Phone className="w-4 h-4" />
                NOUS CONTACTER
              </Link>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

