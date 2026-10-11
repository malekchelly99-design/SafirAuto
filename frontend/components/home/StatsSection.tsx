'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollReveal, { StaggeredReveal } from '@/components/ui/ScrollReveal';

const STATS = [
  { value: 200, suffix: '+', label: 'VÉhicules disponibles', description: 'En stock, prÉts É livrer' },
  { value: 20, suffix: '+', label: 'Marques premium', description: 'Les plus grandes signatures' },
  { value: 15, suffix: ' ans', label: "D'expÉrience", description: "Expertise et passion automobile" },
  { value: 98, suffix: '%', label: 'Clients satisfaits', description: 'Excellence de service' },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = target / steps;
          let count = 0;
          const interval = setInterval(() => {
            count += increment;
            if (count >= target) {
              setCurrent(target);
              clearInterval(interval);
            } else {
              setCurrent(Math.floor(count));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{current}{suffix}</span>;
}

export default function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#eab308]/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[#eab308]/3 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>
      <div className="max-w-[1440px] mx-auto">
        <ScrollReveal direction="up" distance={30}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/5 dark:bg-[#1a1d23]/5 rounded-2xl overflow-hidden border border-black/10 dark:border-white/5">
            {STATS.map(({ value, suffix, label, description }, i) => (
              <div key={label} className="bg-[#1c2026] dark:bg-[#111114] px-6 py-10 text-center">
                <div className="text-5xl lg:text-6xl font-black text-white dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:to-[#eab308] mb-2">
                  <AnimatedNumber target={value} suffix={suffix} />
                </div>
                <div className="text-white dark:text-white font-bold text-sm tracking-wide mb-1">{label}</div>
                <div className="text-gray-300 dark:text-gray-500 text-xs">{description}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

