import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-3xl font-black text-white dark:text-white mb-8">MENTIONS LÉGALES</h1>
          <div className="prose dark:prose-invert max-w-none space-y-6">
            <section><h2 className="text-white dark:text-white font-bold text-lg mb-2">Éditeur du site</h2><p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed">SafirAuto SAS É Capital de 500 000 É É 12 Avenue des Champs-ÉlysÉes, 75008 Paris É SIRET: 123 456 789 00010 É TVA: FR00123456789</p></section>
            <section><h2 className="text-white dark:text-white font-bold text-lg mb-2">HÉbergement</h2><p className="text-gray-300 dark:text-gray-400 text-sm">Ce site est hÉbergÉ sur des serveurs sÉcurisÉs en France.</p></section>
            <section><h2 className="text-white dark:text-white font-bold text-lg mb-2">PropriÉtÉ intellectuelle</h2><p className="text-gray-300 dark:text-gray-400 text-sm leading-relaxed">L&apos;ensemble du contenu de ce site (textes, images, logos) est protÉgÉ par le droit d&apos;auteur. Toute reproduction est interdite sans autorisation prÉalable.</p></section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

