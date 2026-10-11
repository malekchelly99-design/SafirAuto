import Link from 'next/link';
import { Phone, Mail, MapPin, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1c2026] dark:bg-[#0d0d10] border-t border-black/10 dark:border-white/5 mt-24">
      {/* Red accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#eab308] to-transparent" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#eab308] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-lg">C</span>
              </div>
              <div>
                <span className="text-white dark:text-white font-black tracking-[0.12em] text-sm uppercase">CapAuto</span>
                <span className="text-[#eab308] text-[10px] tracking-[0.2em] uppercase block">L&apos;excellence automobile</span>
              </div>
            </div>
            <p className="text-gray-300 dark:text-gray-500 text-sm leading-relaxed mb-6">
              CapAuto, votre concessionnaire premium spécialisé dans la vente de véhicules de prestige.
              Plus de 10 ans d&apos;expertise au service des passionnés d&apos;automobiles.
            </p>
            <div className="flex items-center gap-3">
              {[Share2, Mail, Phone].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-black/5 dark:bg-[#1a1d23]/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-400 hover:text-[#eab308] hover:border-[#eab308]/50 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white dark:text-white font-bold text-xs tracking-widest uppercase mb-6">Navigation</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/vehicules', label: 'Véhicules' },
                { href: '/marques', label: 'Nos Marques' },
                { href: '/services', label: 'Services' },
                { href: '/a-propos', label: 'À Propos' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-300 dark:text-gray-500 hover:text-[#eab308] dark:hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white dark:text-white font-bold text-xs tracking-widest uppercase mb-6">Services</h3>
            <ul className="space-y-3">
              {[
                'Achat & Vente',
                'Reprise de véhicule',
                'Financement',
                'Import de véhicules',
                'Extension de garantie',
                'Livraison à domicile',
              ].map((s) => (
                <li key={s}>
                  <span className="text-gray-300 dark:text-gray-500 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white dark:text-white font-bold text-xs tracking-widest uppercase mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#eab308] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 dark:text-gray-500 text-sm">8 Boulevard des Voitures<br />06000 Nice, France</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#eab308] flex-shrink-0" />
                <a href="tel:+33493000000" className="text-gray-300 dark:text-gray-500 hover:text-[#eab308] dark:hover:text-white text-sm transition-colors">+33 4 93 00 00 00</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#eab308] flex-shrink-0" />
                <a href="mailto:contact@capauto.fr" className="text-gray-300 dark:text-gray-500 hover:text-[#eab308] dark:hover:text-white text-sm transition-colors">contact@capauto.fr</a>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-black/3 dark:bg-[#1a1d23]/3 rounded-lg border border-black/5 dark:border-white/5">
              <p className="text-gray-300 dark:text-gray-400 text-xs font-bold tracking-wide uppercase mb-1">Horaires</p>
              <p className="text-gray-300 dark:text-gray-500 text-xs">Lun–Ven : 9h00–19h00</p>
              <p className="text-gray-300 dark:text-gray-500 text-xs">Sam : 10h00–18h00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/5 dark:border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-300 dark:text-gray-500 text-xs">
            © {new Date().getFullYear()} CapAuto. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="text-gray-300 dark:text-gray-500 hover:text-[#eab308] dark:hover:text-gray-400 text-xs transition-colors">Mentions légales</Link>
            <span className="text-gray-400 dark:text-gray-200">·</span>
            <Link href="/politique-confidentialite" className="text-gray-300 dark:text-gray-500 hover:text-[#eab308] dark:hover:text-gray-400 text-xs transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

