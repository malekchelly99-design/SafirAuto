import { Star } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const TESTIMONIALS = [
  {
    name: 'Alexandre Dubois',
    role: 'Chef d\'entreprise',
    text: 'Service exceptionnel, Équipe professionnelle et É l\'Écoute. Mon Porsche 911 GTS est absolument parfaite. Je recommande vivement SafirAuto.',
    rating: 5,
    vehicle: 'Porsche 911 GTS',
  },
  {
    name: 'Sophie Marchetti',
    role: 'Avocate',
    text: 'J\'ai trouvÉ la Ferrari Roma de mes rÉves grÉce É leur Équipe. Le processus d\'achat a ÉtÉ fluide, transparent et sans surprise. Un service 5 Étoiles.',
    rating: 5,
    vehicle: 'Ferrari Roma',
  },
  {
    name: 'Philippe Laurent',
    role: 'Entrepreneur',
    text: 'TroisiÉme achat chez SafirAuto. Toujours la mÉme qualitÉ, la mÉme attention aux dÉtails. Une confiance totale dans leur sÉlection.',
    rating: 5,
    vehicle: 'Bentley Continental GT',
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#23272e] dark:bg-[#0d0d10]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-14">
          <ScrollReveal direction="up" distance={20} once={false}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-[#eab308]" />
            <span className="text-[#eab308] text-xs tracking-[0.35em] uppercase font-bold">TÉmoignages</span>
            <span className="w-8 h-px bg-[#eab308]" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white dark:text-white">
            ILS NOUS FONT <span className="text-[#eab308]">CONFIANCE</span>
          </h2>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, text, rating, vehicle }, i) => (
            <ScrollReveal key={name} direction="up" distance={20} delay={i * 100} once={false}>
            <div className="bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-xl p-7 flex flex-col gap-4 hover:border-black/20 dark:hover:border-white/10 hover:shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_40px_rgba(220,38,38,0.1)] transition-all duration-300">
              <div className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#eab308] text-[#eab308]" />
                ))}
              </div>
          <p className="text-gray-300 dark:text-gray-300 text-sm leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
          <div className="flex items-center gap-3 pt-4 border-t border-black/10 dark:border-white/5">
            <div className="w-10 h-10 rounded-full bg-[#eab308]/20 border border-[#eab308]/30 flex items-center justify-center">
              <span className="text-[#eab308] font-black">{name[0]}</span>
            </div>
            <div>
              <p className="text-white dark:text-white font-bold text-sm">{name}</p>
              <p className="text-gray-300 dark:text-gray-500 text-xs">{role} É {vehicle}</p>
                </div>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

