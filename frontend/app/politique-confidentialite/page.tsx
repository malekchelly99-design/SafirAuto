import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PolitiquePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-3xl font-black text-white dark:text-white mb-8">POLITIQUE DE CONFIDENTIALITÉ</h1>
          <div className="space-y-6">
            <section><h2 className="text-white dark:text-white font-bold text-lg mb-2">Collecte des donnÉes</h2><p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed">CapAuto collecte uniquement les donnÉes nÉcessaires au traitement de vos demandes : nom, email, tÉlÉphone et messages. Ces donnÉes sont conservÉes 3 ans.</p></section>
            <section><h2 className="text-white dark:text-white font-bold text-lg mb-2">Vos droits (RGPD)</h2><p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed">ConformÉment au RGPD, vous disposez d&apos;un droit d&apos;accÉs, de rectification et de suppression de vos donnÉes. Contactez-nous É: privacy@capauto.fr</p></section>
            <section><h2 className="text-white dark:text-white font-bold text-lg mb-2">Cookies</h2><p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed">Ce site utilise uniquement des cookies fonctionnels essentiels (prÉfÉrences utilisateur). Aucun cookie publicitaire tiers n&apos;est utilisÉ.</p></section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

