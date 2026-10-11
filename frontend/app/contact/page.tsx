'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Phone, Mail, MapPin, Clock, Check, Send } from 'lucide-react';
import { messagesApi } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Demande d\'information', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await messagesApi.create(form);
      setSent(true);
    } catch {} finally { setSending(false); }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <div className="bg-[#23272e] dark:bg-[#111114] border-b border-black/10 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-3 mb-2"><span className="w-6 h-px bg-[#eab308]" /><span className="text-[#eab308] text-xs tracking-[0.3em] uppercase font-bold">Nous écrire</span></div>
            <h1 className="text-4xl font-black text-white dark:text-white">CONTACT</h1>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-white dark:text-white font-bold text-xl mb-5">Nous trouver</h2>
                {[
                  { icon: MapPin, title: 'Adresse', content: '12 Avenue des Champs-ÉlysÉes\n75008 Paris, France' },
                  { icon: Phone, title: 'TÉlÉphone', content: '+33 1 42 00 00 00' },
                  { icon: Mail, title: 'Email', content: 'contact@capauto.fr' },
                  { icon: Clock, title: 'Horaires', content: 'LunÉVen : 9hÉ19h\nSamedi : 10hÉ18h' },
                ].map(({ icon: Icon, title, content }) => (
                <div key={title} className="flex gap-4 p-4 bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-xl mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#eab308]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#eab308]" />
                      </div>
                      <div>
                        <p className="text-gray-300 dark:text-gray-500 text-xs uppercase tracking-wide mb-0.5">{title}</p>
                        <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-line">{content}</p>
                      </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-2xl p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-900/30 border border-green-800/50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-white dark:text-white font-black text-2xl mb-2">Message envoyÉ !</h3>
                  <p className="text-gray-300 dark:text-gray-400">Notre Équipe vous rÉpondra dans les 24h.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-white dark:text-white font-bold text-xl mb-6">Envoyez-nous un message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Nom complet *</label><input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-dark w-full px-4 py-3 rounded-xl text-sm" /></div>
                      <div><label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Email *</label><input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-dark w-full px-4 py-3 rounded-xl text-sm" /></div>
                    </div>
                    <div><label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-1.5">TÉlÉphone</label><input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-dark w-full px-4 py-3 rounded-xl text-sm" /></div>
                    <div><label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Sujet</label>
                      <select value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} className="input-dark w-full px-4 py-3 rounded-xl text-sm appearance-none">
                        {['Demande d\'information', 'Prise de rendez-vous', 'Vente de mon vÉhicule', 'Demande de financement', 'Autre'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Message *</label><textarea required rows={5} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none" /></div>
                    <button type="submit" disabled={sending} className="btn-orange w-full py-4 rounded-xl text-sm font-black tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
                      <Send className="w-4 h-4" />
                      {sending ? 'Envoi...' : 'ENVOYER LE MESSAGE'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

