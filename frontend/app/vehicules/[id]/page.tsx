'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Heart, Share2, ChevronLeft, ChevronRight,
  Maximize2, X, Phone, Mail, Calendar, MapPin,
  Gauge, Fuel, Zap, Users, Settings, Shield, Check, Info
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VehicleChat from '@/components/vehicles/VehicleChat';
import { PageLoader } from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { Vehicle } from '@/types';
import { vehiclesApi, messagesApi } from '@/lib/api';
import { formatPrice, formatMileage, getVehicleImageUrl, localFavorites } from '@/lib/utils';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', subject: 'Demande d\'information' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    vehiclesApi.get(id)
      .then(v => {
        setVehicle(v);
        setIsFav(localFavorites.has(v.id));
      })
      .catch(() => router.push('/vehicules'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <PageLoader />;
  if (!vehicle) return null;

  const images = vehicle.images?.length ? vehicle.images : [vehicle.primary_image].filter(Boolean) as string[];
  const currentImg = images[activeImg] || '';

  const getImgUrl = (img: string) => {
    if (!img) return '/images/car-placeholder.jpg';
    if (img.startsWith('http')) return img;
    return `http://localhost:8000${img}`;
  };

  const handleFav = () => {
    localFavorites.toggle(vehicle.id);
    setIsFav(!isFav);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await messagesApi.create({
        ...formData,
        vehicle_id: vehicle.id,
        vehicle_ref: `${vehicle.brand} ${vehicle.model} ${vehicle.version || ''}`.trim(),
      });
      setSent(true);
    } catch {} finally { setSending(false); }
  };

  const SPECS = [
    { icon: Calendar, label: 'Année', value: vehicle.year },
    { icon: Gauge, label: 'Kilométrage', value: vehicle.mileage ? formatMileage(vehicle.mileage) : '-' },
    { icon: Fuel, label: 'Carburant', value: vehicle.fuel_type },
    { icon: Settings, label: 'Transmission', value: vehicle.transmission },
    { icon: Zap, label: 'Puissance', value: vehicle.horsepower ? `${vehicle.horsepower} ch` : '-' },
    { icon: Info, label: 'Cylindrée', value: vehicle.engine_size ? `${vehicle.engine_size} L` : '-' },
    { icon: Users, label: 'Carrosserie', value: vehicle.body_type },
    { icon: MapPin, label: 'Couleur ext.', value: vehicle.exterior_color || '-' },
    { icon: MapPin, label: 'Couleur int.', value: vehicle.interior_color || '-' },
    { icon: Users, label: 'Propriétaires', value: vehicle.owners_count ? `${vehicle.owners_count}` : '-' },
    { icon: Shield, label: 'État', value: vehicle.condition },
    { icon: MapPin, label: 'Origine', value: vehicle.country_origin || '-' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Breadcrumb */}
        <div className="bg-[#23272e] dark:bg-[#111114] border-b border-black/10 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-3">
          <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-xs text-gray-300 dark:text-gray-500">
            <Link href="/" className="hover:text-white dark:hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/vehicules" className="hover:text-white dark:hover:text-white transition-colors">Véhicules</Link>
            <span>/</span>
            <span className="text-gray-200 dark:text-gray-300">{vehicle.brand} {vehicle.model}</span>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-300 dark:text-gray-500 hover:text-white dark:hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux véhicules
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
            {/* Left — Gallery + Details */}
            <div className="space-y-6">
              {/* Gallery */}
              <div className="bg-[#23272e] dark:bg-[#16161a] rounded-2xl overflow-hidden border border-black/10 dark:border-white/5">
                {/* Main image */}
                <div className="relative aspect-[16/9] bg-gray-200 dark:bg-[#1c1c21] group">
                  {currentImg ? (
                    <Image
                      src={getImgUrl(currentImg)}
                      alt={`${vehicle.brand} ${vehicle.model} - Photo ${activeImg + 1}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1280px) 100vw, 70vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <span>Photo non disponible</span>
                    </div>
                  )}

                  {/* Badge */}
                  {vehicle.badge && (
                    <div className="absolute top-4 left-4">
                      <Badge label={vehicle.badge} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {images.length > 1 && (
                      <button
                        onClick={() => setFullscreen(true)}
                        className="w-9 h-9 bg-black/10 dark:bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-[#eab308]/20 hover:text-white"
                        >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleFav}
                      className={`w-9 h-9 rounded-lg backdrop-blur-sm flex items-center justify-center transition-colors ${isFav ? 'bg-[#eab308]' : 'bg-black/10 dark:bg-black/60 hover:bg-[#eab308]/20'}`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-white text-white' : 'text-white'}`} />
                    </button>
                    <button className="w-9 h-9 bg-black/10 dark:bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-[#eab308]/20 hover:text-white">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImg(a => (a - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/10 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#eab308]/20 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                        >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setActiveImg(a => (a + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/10 dark:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#eab308]/20 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                       >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/10 dark:bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        {activeImg + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`relative flex-shrink-0 w-20 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[#eab308]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <Image src={getImgUrl(img)} alt="" fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {vehicle.description && (
              <div className="bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-2xl p-6">
                <h2 className="text-white dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#eab308] rounded" />
                  Description
                </h2>
                <p className="text-gray-300 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">{vehicle.description}</p>
                </div>
              )}

              {/* Specifications */}
              <div className="bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-2xl p-6">
                <h2 className="text-white dark:text-white font-bold text-lg mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#eab308] rounded" />
                  Caractéristiques
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {SPECS.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-gray-200 dark:bg-[#1c1c21] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-3.5 h-3.5 text-[#eab308]" />
                        <span className="text-gray-300 dark:text-gray-500 text-xs uppercase tracking-wider font-medium">{label}</span>
                      </div>
                      <span className="text-white dark:text-white font-semibold text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>

                {/* History indicators */}
                <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-black/10 dark:border-white/5">
                  {[
                    { condition: vehicle.service_history, trueLabel: 'Carnet entretien OK', falseLabel: 'Sans carnet' },
                    { condition: !vehicle.accident_history, trueLabel: 'Non accidenté', falseLabel: 'Accidenté' },
                    { condition: !vehicle.imported, trueLabel: 'Origine France', falseLabel: 'Véhicule importé' },
                    { condition: vehicle.warranty, trueLabel: `Garantie ${vehicle.warranty_months} mois`, falseLabel: 'Sans garantie' },
                  ].map(({ condition, trueLabel, falseLabel }, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        condition ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50' : 'bg-gray-200 dark:bg-gray-800/50 text-gray-200 dark:text-gray-500 border border-gray-300 dark:border-gray-700/50'
                      }`}
                    >
                      {condition ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {condition ? trueLabel : falseLabel}
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              {vehicle.equipment && vehicle.equipment.length > 0 && (
                <div className="bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-2xl p-6">
                  <h2 className="text-white dark:text-white font-bold text-lg mb-5 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#eab308] rounded" />
                    Équipements ({vehicle.equipment.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {vehicle.equipment.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5">
                        <Check className="w-3.5 h-3.5 text-[#eab308] flex-shrink-0" />
                        <span className="text-gray-300 dark:text-gray-300 text-sm">{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Chat box ── */}
              <VehicleChat
                vehicleId={vehicle.id}
                vehicleRef={`${vehicle.brand} ${vehicle.model}${vehicle.version ? ' ' + vehicle.version : ''}`}
              />
            </div>

            {/* Right — Price + Contact */}
            <div className="space-y-5">
              {/* Price card */}
              <div className="bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-2xl p-6 sticky top-24">
                <div className="mb-1">
                  <span className="text-[#eab308] text-xs font-black tracking-[0.2em] uppercase">{vehicle.brand}</span>
                </div>
                <h1 className="text-white dark:text-white font-black text-2xl leading-tight mb-1">
                  {vehicle.model}
                  {vehicle.version && <span className="text-gray-300 dark:text-gray-400 font-normal text-lg ml-2">{vehicle.version}</span>}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-300 dark:text-gray-500 mb-6">
                  <span>{vehicle.year}</span>
                  <span>·</span>
                  <span>{formatMileage(vehicle.mileage)}</span>
                  <span>·</span>
                  <span>{vehicle.fuel_type}</span>
                </div>

                {vehicle.old_price && (
                   <p className="text-gray-300 dark:text-gray-500 text-sm line-through mb-1">{formatPrice(vehicle.old_price)}</p>
                )}
                <p className="text-[#eab308] text-4xl font-black tracking-tight mb-2">{formatPrice(vehicle.price)}</p>
                {vehicle.old_price && (
                   <p className="text-green-600 dark:text-green-400 text-sm font-bold mb-4">
                    Économie: {formatPrice(vehicle.old_price - vehicle.price)}
                  </p>
                )}

                  <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/5">
                  <button
                    onClick={() => setContactOpen(true)}
                    className="btn-orange w-full py-3.5 rounded-xl text-sm font-black tracking-widest flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    DEMANDER DES INFORMATIONS
                  </button>
                  <a
                    href="tel:+33142000000"
                    className="btn-outline w-full py-3.5 rounded-xl text-sm font-black tracking-widest flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    ÊTRE RAPPELÉ
                  </a>
                  <Link
                    href="/contact"
                    className="w-full py-3 rounded-xl text-sm font-bold text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    PRENDRE RENDEZ-VOUS
                  </Link>
                </div>

                {/* Quick specs */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/5">
                  {[
                    { label: 'Transmission', value: vehicle.transmission },
                    { label: 'Puissance', value: vehicle.horsepower ? `${vehicle.horsepower} ch` : '-' },
                    { label: 'Carrosserie', value: vehicle.body_type },
                    { label: 'Couleur', value: vehicle.exterior_color || '-' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-gray-200 dark:text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div className="bg-gray-200 dark:bg-[#16161a]/50 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-xs text-gray-200 dark:text-gray-500 text-center">
                Réf: <span className="text-gray-500 dark:text-gray-400 font-mono">{vehicle.reference}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Contact modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setContactOpen(false)} />
           <div className="relative bg-[#1a1d23] dark:bg-[#16161a] border border-black/10 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-white dark:text-white font-bold text-lg">Demande d&apos;information</h3>
               <button onClick={() => setContactOpen(false)} className="text-gray-300 dark:text-gray-500 hover:text-white dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-200 dark:bg-[#1c1c21] rounded-xl p-3 mb-5 text-sm">
              <p className="text-[#eab308] font-bold">{vehicle.brand} {vehicle.model}</p>
              <p className="text-gray-300 dark:text-gray-400">{vehicle.version} · {formatPrice(vehicle.price)}</p>
            </div>

            {sent ? (
              <div className="text-center py-8">
                 <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-white dark:text-white font-bold text-lg mb-2">Message envoyé !</p>
                <p className="text-gray-300 dark:text-gray-400 text-sm">Notre équipe vous contactera sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <input required value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} placeholder="Votre nom *" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                <input required type="email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} placeholder="Email *" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                <input value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))} placeholder="Téléphone" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                <select value={formData.subject} onChange={e => setFormData(f => ({...f, subject: e.target.value}))} className="input-dark w-full px-4 py-3 rounded-xl text-sm">
                  <option>Demande d&apos;information</option>
                  <option>Prise de rendez-vous</option>
                  <option>Demande de rappel</option>
                  <option>Demande de financement</option>
                </select>
                <textarea required rows={3} value={formData.message} onChange={e => setFormData(f => ({...f, message: e.target.value}))} placeholder="Votre message *" className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none" />
                <button type="submit" disabled={sending} className="btn-orange w-full py-3.5 rounded-xl text-sm font-black tracking-widest disabled:opacity-60">
                  {sending ? 'Envoi...' : 'ENVOYER'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen gallery */}
      {fullscreen && (
         <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setFullscreen(false)}>
           <button className="absolute top-4 right-4 text-white hover:text-[#eab308] p-2"><X className="w-6 h-6" /></button>
           <button onClick={e => { e.stopPropagation(); setActiveImg(a => (a - 1 + images.length) % images.length); }} className="absolute left-4 text-white hover:text-[#eab308] p-2">
             <ChevronLeft className="w-8 h-8" />
           </button>
           <div className="relative w-full max-w-5xl max-h-[80vh] aspect-video">
             {currentImg && <Image src={getImgUrl(currentImg)} alt="" fill className="object-contain" />}
           </div>
           <button onClick={e => { e.stopPropagation(); setActiveImg(a => (a + 1) % images.length); }} className="absolute right-4 text-white hover:text-[#eab308] p-2">
             <ChevronRight className="w-8 h-8" />
           </button>
           <div className="absolute bottom-4 text-white/60 dark:text-white/60 text-sm">{activeImg + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}
