'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Save, Send, X, Upload, Trash2, GripVertical, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { adminVehiclesApi } from '@/lib/api';
import { Vehicle } from '@/types';

const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Autre'];
const TRANSMISSIONS = ['Automatique', 'Manuelle', 'SÉquentielle'];
const BODY_TYPES = ['SUV', 'Berline', 'CoupÉ', 'Cabriolet', 'Break', 'Sportive', 'Citadine', 'Monospace', 'Utilitaire'];
const CONDITIONS = ['Neuf', 'Occasion', 'Collection', 'DÉmonstration'];
const BADGES = ['', 'NOUVEAUTÉ', 'PROMOTION', 'COUP DE CÉUR', 'EXCLUSIVITÉ'];

const EQUIPMENT_GROUPS = {
  'Confort': ['SiÉges chauffants', 'SiÉges ventilÉs', 'SiÉges massants', 'Climatisation automatique', 'Toit panoramique', 'Toit ouvrant', 'DÉmarrage sans clÉ'],
  'Technologie': ['Apple CarPlay', 'Android Auto', 'Navigation GPS', 'Bluetooth', 'USB', 'Recharge sans fil', 'Head-up display', 'CamÉra 360É', 'CamÉra de recul'],
  'SÉcuritÉ': ['RÉgulateur adaptatif', 'Surveillance angle mort', 'Freinage automatique', 'Assistant de voie', 'Aide au stationnement'],
  'Audio': ['Bose', 'Burmester', 'Bang & Olufsen', 'Harman Kardon', 'Bowers & Wilkins', 'Naim Audio', 'Meridian Audio'],
  'Performance': ['4 roues motrices', 'DiffÉrentiel sport', 'Suspension adaptative', 'Échappement sport', 'Freins carbone-cÉramique', 'Sport Chrono'],
};

const POPULAR_BRANDS = ['Porsche', 'Ferrari', 'Lamborghini', 'Mercedes-Benz', 'BMW', 'Audi', 'Bentley', 'Aston Martin', 'McLaren', 'Range Rover', 'Maserati', 'Rolls-Royce', 'Bugatti', 'Pagani', 'Koenigsegg'];

interface VehicleFormProps {
  initialData?: Vehicle;
  vehicleId?: string;
}

const EMPTY: Partial<Vehicle> = {
  status: 'BROUILLON',
  currency: 'EUR',
  condition: 'Occasion',
  fuel_type: 'Essence',
  transmission: 'Automatique',
  body_type: 'SUV',
  warranty: false,
  service_history: false,
  accident_history: false,
  imported: false,
  featured: false,
  equipment: [],
  images: [],
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#16161a] border border-white/5 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-[#1a1d23]/2 transition-colors"
      >
        <h3 className="text-white font-bold tracking-wide flex items-center gap-2">
          <span className="w-1 h-4 bg-[#eab308] rounded" />
          {title}
        </h3>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1.5">
        {label}{required && <span className="text-[#eab308] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = "input-dark w-full px-3 py-2.5 rounded-lg text-sm";
const SELECT = "input-dark w-full px-3 py-2.5 rounded-lg text-sm appearance-none";

export default function VehicleForm({ initialData, vehicleId }: VehicleFormProps) {
  const router = useRouter();
  const [data, setData] = useState<Partial<Vehicle>>(initialData || EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!vehicleId;

  const update = (key: keyof Vehicle, value: unknown) => {
    setData(d => ({ ...d, [key]: value }));
  };

  const toggleEquipment = (item: string) => {
    const eq = data.equipment || [];
    const idx = eq.indexOf(item);
    if (idx === -1) update('equipment', [...eq, item]);
    else update('equipment', eq.filter(e => e !== item));
  };

  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (!vehicleId) {
      // No vehicle yet É queue locally with preview URLs
      setPendingFiles(prev => [...prev, ...fileArray]);
      // Show local previews immediately
      const localPreviews = fileArray.map(f => URL.createObjectURL(f));
      update('images', [...(data.images || []), ...localPreviews]);
      return;
    }

    setUploadLoading(true);
    setError('');
    try {
      const result = await adminVehiclesApi.uploadImages(vehicleId, fileArray);
      update('images', result.images);
      update('primary_image', result.primary_image);
    } catch {
      setError('Erreur lors de l\'upload des images.');
    } finally {
      setUploadLoading(false);
    }
  }, [vehicleId, data.images]);

  const handleDeleteImage = async (index: number) => {
    if (!vehicleId) return;
    try {
      const result = await adminVehiclesApi.deleteImage(vehicleId, index);
      update('images', result.images);
      update('primary_image', result.primary_image);
    } catch { setError('Erreur lors de la suppression.'); }
  };

  const handleSetPrimary = async (index: number) => {
    if (!vehicleId || !data.images) return;
    const reordered = [...data.images];
    const [img] = reordered.splice(index, 1);
    reordered.unshift(img);
    try {
      const result = await adminVehiclesApi.reorderImages(vehicleId, reordered);
      update('images', result.images);
      update('primary_image', result.primary_image);
    } catch {}
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...data };
      // Clear local blob preview URLs before saving É server will set real ones after upload
      if (pendingFiles.length > 0) {
        payload.images = [];
        payload.primary_image = '';
      }
      if (publish) payload.status = 'PUBLIÉ';

      if (isEdit && vehicleId) {
        await adminVehiclesApi.update(vehicleId, payload);
        // Upload any newly-selected files on edit page
        if (pendingFiles.length > 0) {
          setUploadLoading(true);
          try {
            const result = await adminVehiclesApi.uploadImages(vehicleId, pendingFiles);
            update('images', result.images);
            update('primary_image', result.primary_image);
            setPendingFiles([]);
          } finally {
            setUploadLoading(false);
          }
        }
        setSuccess(publish ? 'VÉhicule publiÉ avec succÉs !' : 'VÉhicule mis É jour.');
        if (publish) router.push('/admin/vehicules');
      } else {
        // Create vehicle first
        const created = await adminVehiclesApi.create(payload);
        // Then immediately upload any pending files
        if (pendingFiles.length > 0) {
          setUploadLoading(true);
          try {
            const result = await adminVehiclesApi.uploadImages(created.id, pendingFiles);
            setPendingFiles([]);
            setSuccess('VÉhicule crÉÉ avec photos. Vous pouvez continuer É modifier.');
            // Redirect to edit page so further uploads work
            router.push(`/admin/vehicules/${created.id}`);
          } finally {
            setUploadLoading(false);
          }
        } else {
          setSuccess('VÉhicule crÉÉ. Vous pouvez maintenant uploader les photos.');
          router.push(`/admin/vehicules/${created.id}`);
        }
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, unknown> } };
      setError(JSON.stringify(err?.response?.data || 'Erreur lors de la sauvegarde.'));
    } finally {
      setSaving(false);
    }
  };

  const getImgUrl = (img: string) => {
    if (!img) return '/images/car-placeholder.jpg';
    if (img.startsWith('blob:')) return img;  // local preview
    if (img.startsWith('http')) return img;
    return `http://localhost:8000${img}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            {isEdit ? 'MODIFIER LE VÉHICULE' : 'AJOUTER UN VÉHICULE'}
          </h1>
          {isEdit && data.reference && (
            <p className="text-gray-300 text-sm mt-0.5 font-mono">{data.reference}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline px-4 py-2.5 rounded-xl text-sm font-black tracking-wide"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black bg-[#1c1c21] border border-white/10 text-gray-300 hover:text-white transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            Brouillon
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-orange flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black tracking-wide disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {isEdit ? 'ENREGISTRER' : 'PUBLIER'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="bg-[#2a2f3a]/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-900/20 border border-green-800/50 text-green-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}

      {/* A É Informations principales */}
      <Section title="A É Informations principales">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Marque" required>
            <input list="brands-list" value={data.brand || ''} onChange={e => update('brand', e.target.value)} placeholder="ex: Porsche" className={INPUT} />
            <datalist id="brands-list">{POPULAR_BRANDS.map(b => <option key={b} value={b} />)}</datalist>
          </Field>
          <Field label="ModÉle" required>
            <input value={data.model || ''} onChange={e => update('model', e.target.value)} placeholder="ex: 911 Carrera" className={INPUT} />
          </Field>
          <Field label="Version">
            <input value={data.version || ''} onChange={e => update('version', e.target.value)} placeholder="ex: 4S PDK" className={INPUT} />
          </Field>
          <Field label="AnnÉe" required>
            <input type="number" value={data.year || ''} onChange={e => update('year', Number(e.target.value))} min="1990" max="2030" placeholder="2024" className={INPUT} />
          </Field>
          <Field label="État" required>
            <select value={data.condition || ''} onChange={e => update('condition', e.target.value)} className={SELECT}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Type de vÉhicule" required>
            <select value={data.body_type || ''} onChange={e => update('body_type', e.target.value)} className={SELECT}>
              {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Prix (É)" required>
            <input type="number" value={data.price || ''} onChange={e => update('price', Number(e.target.value))} placeholder="180000" className={INPUT} />
          </Field>
          <Field label="Prix prÉcÉdent (É)">
            <input type="number" value={data.old_price || ''} onChange={e => update('old_price', Number(e.target.value) || null)} placeholder="200000" className={INPUT} />
          </Field>
          <Field label="Badge">
            <select value={data.badge || ''} onChange={e => update('badge', e.target.value)} className={SELECT}>
              {BADGES.map(b => <option key={b} value={b}>{b || 'Aucun'}</option>)}
            </select>
          </Field>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => update('featured', !data.featured)}
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${data.featured ? 'bg-[#eab308]' : 'bg-[#333]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#1a1d23] transition-transform ${data.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-gray-300 text-sm">Mis en avant</span>
            </label>
          </div>
        </div>
      </Section>

      {/* B É CaractÉristiques */}
      <Section title="B É CaractÉristiques techniques">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="KilomÉtrage" required>
            <input type="number" value={data.mileage || ''} onChange={e => update('mileage', Number(e.target.value))} placeholder="15000" className={INPUT} />
          </Field>
          <Field label="Carburant" required>
            <select value={data.fuel_type || ''} onChange={e => update('fuel_type', e.target.value)} className={SELECT}>
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Transmission" required>
            <select value={data.transmission || ''} onChange={e => update('transmission', e.target.value)} className={SELECT}>
              {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Puissance (ch)">
            <input type="number" value={data.horsepower || ''} onChange={e => update('horsepower', Number(e.target.value))} placeholder="480" className={INPUT} />
          </Field>
          <Field label="CylindrÉe (L)">
            <input type="number" step="0.1" value={data.engine_size || ''} onChange={e => update('engine_size', Number(e.target.value))} placeholder="3.0" className={INPUT} />
          </Field>
          <Field label="Nbre de cylindres">
            <input type="number" value={data.cylinders || ''} onChange={e => update('cylinders', Number(e.target.value))} placeholder="6" className={INPUT} />
          </Field>
          <Field label="Nbre de portes">
            <input type="number" value={data.doors || ''} onChange={e => update('doors', Number(e.target.value))} placeholder="4" className={INPUT} />
          </Field>
          <Field label="Nbre de places">
            <input type="number" value={data.seats || ''} onChange={e => update('seats', Number(e.target.value))} placeholder="4" className={INPUT} />
          </Field>
          <Field label="Nbre de propriÉtaires">
            <input type="number" value={data.owners_count || ''} onChange={e => update('owners_count', Number(e.target.value))} placeholder="1" className={INPUT} />
          </Field>
        </div>
      </Section>

      {/* C É Couleurs */}
      <Section title="C É Couleurs & sellerie" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Couleur extÉrieure">
            <input value={data.exterior_color || ''} onChange={e => update('exterior_color', e.target.value)} placeholder="Noir Jet" className={INPUT} />
          </Field>
          <Field label="Couleur intÉrieure">
            <input value={data.interior_color || ''} onChange={e => update('interior_color', e.target.value)} placeholder="Caramel" className={INPUT} />
          </Field>
          <Field label="Sellerie">
            <input value={data.upholstery || ''} onChange={e => update('upholstery', e.target.value)} placeholder="Cuir pleine fleur" className={INPUT} />
          </Field>
        </div>
      </Section>

      {/* D É Historique */}
      <Section title="D É Historique & garantie" defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="1Ére immatriculation">
            <input value={data.first_registration || ''} onChange={e => update('first_registration', e.target.value)} placeholder="01/2024" className={INPUT} />
          </Field>
          <Field label="Pays d'origine">
            <input value={data.country_origin || ''} onChange={e => update('country_origin', e.target.value)} placeholder="Allemagne" className={INPUT} />
          </Field>
          <Field label="DurÉe garantie (mois)">
            <input type="number" value={data.warranty_months || ''} onChange={e => update('warranty_months', Number(e.target.value))} placeholder="12" className={INPUT} />
          </Field>
          {[
            { key: 'warranty', label: 'Garantie' },
            { key: 'service_history', label: 'Carnet entretien' },
            { key: 'accident_history', label: 'AccidentÉ' },
            { key: 'imported', label: 'VÉhicule importÉ' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => update(key as keyof Vehicle, !data[key as keyof Vehicle])}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${data[key as keyof Vehicle] ? 'bg-[#eab308]' : 'bg-[#333]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#1a1d23] transition-transform ${data[key as keyof Vehicle] ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              <span className="text-gray-300 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* E É Équipements */}
      <Section title="E É Équipements" defaultOpen={false}>
        <div className="space-y-5">
          {Object.entries(EQUIPMENT_GROUPS).map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase mb-2">{group}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => {
                  const selected = (data.equipment || []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40'
                          : 'bg-[#1c1c21] text-gray-500 hover:text-gray-300 border border-white/5'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase mb-2">Équipement personnalisÉ</p>
            <input
              placeholder="Ajouter un Équipement et appuyer sur EntrÉe"
              className={INPUT}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) { toggleEquipment(val); (e.target as HTMLInputElement).value = ''; }
                }
              }}
            />
          </div>
        </div>
      </Section>

      {/* F É Description */}
      <Section title="F É Description & titre" defaultOpen={false}>
        <div className="space-y-4">
          <Field label="Titre de l'annonce">
            <input value={data.title || ''} onChange={e => update('title', e.target.value)} placeholder="Porsche 911 GTS Cabriolet É Exemplaire d'exception" className={INPUT} />
          </Field>
          <Field label="Description courte">
            <textarea rows={2} value={data.short_description || ''} onChange={e => update('short_description', e.target.value)} placeholder="Description courte pour les rÉsultats de recherche..." className={`${INPUT} resize-none`} />
          </Field>
          <Field label="Description complÉte">
            <textarea rows={6} value={data.description || ''} onChange={e => update('description', e.target.value)} placeholder="Description dÉtaillÉe du vÉhicule..." className={`${INPUT} resize-none`} />
          </Field>
        </div>
      </Section>

      {/* G É Images */}
      <Section title="G É Photos du vÉhicule">
        {/* Hidden file input É controlled via ref */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleImageUpload(e.target.files);
            }
            // Reset so same file can be selected again
            e.target.value = '';
          }}
        />

        {/* Status banner */}
        {!vehicleId && pendingFiles.length === 0 && (
          <div className="bg-[#1c1c21] border border-white/10 text-gray-400 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <span className="text-[#eab308]">?</span>
            SÉlectionnez vos photos maintenant É elles seront uploadÉes automatiquement lors de la sauvegarde.
          </div>
        )}
        {!vehicleId && pendingFiles.length > 0 && (
          <div className="bg-green-900/20 border border-green-800/50 text-green-400 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <Check className="w-4 h-4" />
            {pendingFiles.length} photo{pendingFiles.length > 1 ? 's' : ''} sÉlectionnÉe{pendingFiles.length > 1 ? 's' : ''} É seront uploadÉes É la sauvegarde.
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) handleImageUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-5 cursor-pointer select-none ${
            dragOver
              ? 'border-[#eab308] bg-[#eab308]/5'
              : 'border-white/10 hover:border-[#eab308]/50 hover:bg-[#eab308]/3'
          }`}
        >
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-3">Glissez vos photos ici ou</p>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="btn-outline px-5 py-2.5 rounded-lg text-sm font-black tracking-widest"
          >
            SÉLECTIONNER DES FICHIERS
          </button>
          <p className="text-gray-300 text-xs mt-3">JPEG, PNG, WebP É Max 10 MB par image</p>
          {uploadLoading && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-4 h-4 border-2 border-[#333] border-t-[#eab308] rounded-full animate-spin" />
              <p className="text-[#eab308] text-sm">Upload en cours...</p>
            </div>
          )}
        </div>

        {/* Image grid */}
        {data.images && data.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.images.map((img, i) => (
              <div key={i} className={`relative group rounded-xl overflow-hidden aspect-[4/3] ${i === 0 ? 'ring-2 ring-[#eab308]' : ''}`}>
                <Image
                  src={getImgUrl(img)}
                  alt={`Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                  unoptimized={img.startsWith('blob:')}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(i)}
                      title="DÉfinir comme principale"
                      className="text-white hover:text-[#eab308] bg-black/50 rounded-lg p-1.5 text-xs font-bold"
                    >
                      ?
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (vehicleId) {
                        handleDeleteImage(i);
                      } else {
                        // Remove from pending + preview
                        const newImages = [...(data.images || [])];
                        newImages.splice(i, 1);
                        update('images', newImages);
                        setPendingFiles(prev => {
                          const next = [...prev];
                          next.splice(i, 1);
                          return next;
                        });
                      }
                    }}
                    className="text-white hover:text-red-400 bg-black/50 rounded-lg p-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-[#eab308] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Principale
                  </span>
                )}
                {img.startsWith('blob:') && (
                  <span className="absolute top-1.5 right-1.5 bg-black/60 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    En attente
                  </span>
                )}
              </div>
            ))}
            {/* Add more button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-white/10 hover:border-[#eab308]/50 flex flex-col items-center justify-center gap-2 text-gray-300 hover:text-[#eab308] transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs font-bold">Ajouter</span>
            </button>
          </div>
        )}
      </Section>

      {/* Bottom save bar */}
      <div className="flex items-center justify-between bg-[#16161a] border border-white/5 rounded-2xl px-6 py-4 sticky bottom-4">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">Statut:</span>
          <select
            value={data.status || 'BROUILLON'}
            onChange={e => update('status', e.target.value)}
            className="bg-[#1c1c21] border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-sm"
          >
            {['BROUILLON', 'PUBLIÉ', 'RÉSERVÉ', 'VENDU', 'ARCHIVÉ'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black bg-[#1c1c21] border border-white/10 text-gray-300 hover:text-white disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-orange flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black tracking-wide disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {saving ? 'En cours...' : 'PUBLIER L\'ANNONCE'}
          </button>
        </div>
      </div>
    </div>
  );
}

