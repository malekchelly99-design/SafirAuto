import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'SafirAuto — L\'Excellence Automobile',
    template: '%s | SafirAuto',
  },
  description: 'SafirAuto, votre concessionnaire premium spécialisé dans la vente de véhicules de prestige — Porsche, Ferrari, Lamborghini, Bentley et bien plus.',
  keywords: ['SafirAuto', 'voitures de prestige', 'véhicules premium', 'concessionnaire', 'Porsche', 'Ferrari', 'Lamborghini', 'Bentley'],
  openGraph: {
    title: 'SafirAuto',
    description: 'L\'excellence automobile à votre portée',
    type: 'website',
    locale: 'fr_FR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable} data-theme="dark">
      <body className="bg-[#1a1d23] dark:bg-[#0d0f12] text-white dark:text-gray-100 antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

