import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/layout/Hero';
import HomeSearch from '@/components/home/HomeSearch';
import FeaturedVehicles from '@/components/home/FeaturedVehicles';
import CinematicBanner from '@/components/home/CinematicBanner';
import SecondBanner from '@/components/home/SecondBanner';
import GalleryStrip from '@/components/home/GalleryStrip';
import BrandsSection from '@/components/home/BrandsSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialSection from '@/components/home/TestimonialSection';
import CTASection from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'SafirAuto — Concessionnaire de Prestige',
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* 1. Full-screen cinematic hero with carousel */}
        <Hero />

        {/* 2. Advanced search bar floating above fold */}
        <HomeSearch />

        {/* 3. Featured vehicles grid */}
        <FeaturedVehicles />

        {/* 4. Mercedes AMG GT63S full-width cinematic banner */}
        <CinematicBanner />

        {/* 5. Scrollable car gallery strip */}
        <GalleryStrip />

        {/* 6. Porsche / Ferrari / Lamborghini split banners */}
        <SecondBanner />

        {/* 7. Brand logos */}
        <BrandsSection />

        {/* 8. Animated stats */}
        <StatsSection />

        {/* 9. Testimonials */}
        <TestimonialSection />

        {/* 10. Final CTA */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

