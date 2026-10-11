'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, Check, X, Camera, Upload, Save } from 'lucide-react';
import { brandsApi } from '@/lib/api';
import { Brand } from '@/types';
import { slugify } from '@/lib/utils';

// -- Helpers ------------------------------------------------------------------

function getLogoUrl(logo?: string): string | null {
  if (!logo) return null;
  if (logo.startsWith('blob:') || logo.startsWith('http')) return logo;
  return `http://localhost:8000${logo}`;
}

// -- Logo circle É click to replace -------------------------------------------

interface LogoCircleProps {
  brand: Brand;
  onUploaded: (slug: string, logoUrl: string) => void;
  size?: 'sm' | 'lg';
}

function LogoCircle({ brand, onUploaded, size = 'sm' }: LogoCircleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(getLogoUrl(brand.logo));
  const [hover, setHover] = useState(false);

  const dim = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm';
  const camDim = size === 'lg' ? 'w-6 h-6' : 'w-3.5 h-3.5';

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      alert('Format non supportÉ. Utilisez JPEG, PNG, WebP ou SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5 MB).');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const result = await brandsApi.uploadLogo(brand.slug, file);
      setPreview(getLogoUrl(result.logo));
      onUploaded(brand.slug, result.logo);
    } catch {
      // Revert preview on error
      setPreview(getLogoUrl(brand.logo));
      alert('Erreur lors de l\'upload du logo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [brand.slug, brand.logo, onUploaded]);

  return (
    <div className="relative flex-shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        title="Changer le logo"
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`relative ${dim} rounded-full overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${
          uploading
            ? 'border-[#eab308] animate-pulse'
            : hover
            ? 'border-[#eab308] shadow-[0_0_12px_rgba(220,38,38,0.4)]'
            : 'border-[#eab308]/30 hover:border-[#eab308]'
        } bg-[#1c1c21]`}
      >
        {/* Logo image or initial */}
        {preview ? (
          <Image
            src={preview}
            alt={brand.name}
            fill
            className="object-contain p-1"
            sizes={size === 'lg' ? '64px' : '40px'}
            unoptimized={preview.startsWith('blob:')}
          />
        ) : (
          <span className={`absolute inset-0 flex items-center justify-center font-black text-[#eab308]`}>
            {brand.name[0]}
          </span>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity duration-200 ${hover && !uploading ? 'opacity-100' : 'opacity-0'}`}>
          <Camera className={`${camDim} text-white`} />
        </div>

        {/* Upload spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className={`${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} border-2 border-[#333] border-t-[#eab308] rounded-full animate-spin`} />
          </div>
        )}
      </button>

      {/* Small camera badge */}
      {!uploading && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#eab308] border border-[#111114] flex items-center justify-center pointer-events-none">
          <Camera className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
}

// -- Edit row modal ------------------------------------------------------------

interface EditModalProps {
  brand: Brand;
  onSave: (slug: string, data: Partial<Brand>) => void;
  onClose: () => void;
  onLogoUploaded: (slug: string, logoUrl: string) => void;
}

function EditModal({ brand, onSave, onClose, onLogoUploaded }: EditModalProps) {
  const [form, setForm] = useState({
    name: brand.name,
    country: brand.country || '',
    description: brand.description || '',
    featured: brand.featured || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(brand.slug, form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#16161a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-white font-bold text-lg">Modifier la marque</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Logo upload + name */}
          <div className="flex items-center gap-5">
            <LogoCircle brand={brand} onUploaded={onLogoUploaded} size="lg" />
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1.5">Logo</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Cliquez sur le cercle pour uploader un logo.<br />
                JPEG, PNG, WebP ou SVG É Max 5 MB
              </p>
            </div>
          </div>

          {/* Fields */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Nom de la marque *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Pays d&apos;origine</label>
            <input
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              placeholder="ex: Allemagne"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none"
              placeholder="Description courte de la marque..."
            />
          </div>

          {/* Featured toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-[#1c1c21] rounded-xl">
            <div>
              <p className="text-gray-200 text-sm font-semibold">Mise en avant</p>
              <p className="text-gray-300 text-xs">Afficher sur la page d&apos;accueil</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
              className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${form.featured ? 'bg-[#eab308]' : 'bg-[#333]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#1a1d23] shadow transition-transform ${form.featured ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="btn-outline px-5 py-2.5 rounded-xl text-sm font-black">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="btn-orange flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'ENREGISTRER'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Main page -----------------------------------------------------------------

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '', country: '', description: '', featured: false,
  });
  const newLogoInputRef = useRef<HTMLInputElement>(null);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    brandsApi.list().then(setBrands).finally(() => setLoading(false));
  }, []);

  // Called when a logo is uploaded for an existing brand
  const handleLogoUploaded = useCallback((slug: string, logoUrl: string) => {
    setBrands(prev => prev.map(b => b.slug === slug ? { ...b, logo: logoUrl } : b));
  }, []);

  const handleUpdate = async (slug: string, data: Partial<Brand>) => {
    const updated = await brandsApi.update(slug, data);
    setBrands(prev => prev.map(b => b.slug === slug ? { ...b, ...updated } : b));
    setEditingBrand(null);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Supprimer cette marque dÉfinitivement ?')) return;
    await brandsApi.delete(slug);
    setBrands(prev => prev.filter(b => b.slug !== slug));
  };

  const handleCreate = async () => {
    if (!newBrand.name) return;
    setSaving(true);
    try {
      const created = await brandsApi.create({
        ...newBrand,
        slug: slugify(newBrand.name),
      });
      // If a logo was selected, upload it now
      if (newLogoFile) {
        try {
          const result = await brandsApi.uploadLogo(created.slug, newLogoFile);
          created.logo = result.logo;
        } catch {}
      }
      setBrands(prev => [...prev, created]);
      setNewBrand({ name: '', country: '', description: '', featured: false });
      setNewLogoFile(null);
      setNewLogoPreview(null);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleNewLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewLogoFile(file);
    setNewLogoPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">MARQUES</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} marques</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-orange flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black"
        >
          <Plus className="w-4 h-4" /> AJOUTER
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#16161a] border border-[#eab308]/30 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold text-base mb-5">Nouvelle marque</h3>

          <div className="flex items-start gap-5 mb-5">
            {/* Logo picker for new brand */}
            <div className="flex-shrink-0">
              <input
                ref={newLogoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleNewLogoSelect}
              />
              <button
                type="button"
                onClick={() => newLogoInputRef.current?.click()}
                title="Ajouter un logo"
                className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 hover:border-[#eab308] bg-[#1c1c21] flex items-center justify-center overflow-hidden transition-all group relative"
              >
                {newLogoPreview ? (
                  <Image
                    src={newLogoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-300 group-hover:text-[#eab308] transition-colors">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold tracking-wider">LOGO</span>
                  </div>
                )}
              </button>
              {newLogoPreview && (
                <button
                  type="button"
                  onClick={() => { setNewLogoFile(null); setNewLogoPreview(null); }}
                  className="mt-1.5 w-full text-center text-gray-300 hover:text-red-400 text-[10px]"
                >
                  Supprimer
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-300 font-bold tracking-widest uppercase block mb-1">Nom *</label>
                <input
                  value={newBrand.name}
                  onChange={e => setNewBrand(v => ({ ...v, name: e.target.value }))}
                  placeholder="ex: Porsche"
                  className="input-dark px-3 py-2.5 rounded-lg text-sm w-full"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-300 font-bold tracking-widest uppercase block mb-1">Pays</label>
                <input
                  value={newBrand.country}
                  onChange={e => setNewBrand(v => ({ ...v, country: e.target.value }))}
                  placeholder="ex: Allemagne"
                  className="input-dark px-3 py-2.5 rounded-lg text-sm w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-gray-300 font-bold tracking-widest uppercase block mb-1">Description</label>
                <input
                  value={newBrand.description}
                  onChange={e => setNewBrand(v => ({ ...v, description: e.target.value }))}
                  placeholder="Description courte"
                  className="input-dark px-3 py-2.5 rounded-lg text-sm w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setNewBrand(v => ({ ...v, featured: !v.featured }))}
                className={`w-10 h-6 rounded-full relative transition-colors ${newBrand.featured ? 'bg-[#eab308]' : 'bg-[#333]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#1a1d23] shadow transition-transform ${newBrand.featured ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
              <span className="text-gray-300 text-sm">Mise en avant</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAdd(false); setNewLogoFile(null); setNewLogoPreview(null); }}
                className="btn-outline px-5 py-2.5 rounded-xl text-sm font-black"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !newBrand.name}
                className="btn-orange flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                CrÉer la marque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brands table */}
      <div className="bg-[#16161a] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 skeleton rounded w-32" />
                  <div className="h-2.5 skeleton rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase">Marque</th>
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase hidden md:table-cell">Pays</th>
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase hidden lg:table-cell">Description</th>
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase">En avant</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {brands.map(b => (
                <tr key={b.slug} className="hover:bg-[#1a1d23]/[0.02] transition-colors group">
                  {/* Brand column with clickable logo */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <LogoCircle brand={b} onUploaded={handleLogoUploaded} size="sm" />
                      <div>
                        <p className="text-white font-bold text-sm">{b.name}</p>
                        <p className="text-gray-300 text-xs font-mono">{b.slug}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-400 text-sm hidden md:table-cell">
                    {b.country || <span className="text-gray-200">É</span>}
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-gray-500 text-sm truncate max-w-xs">
                      {b.description || <span className="text-gray-200">É</span>}
                    </p>
                  </td>

                  {/* Featured toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUpdate(b.slug, { featured: !b.featured })}
                      className={`w-10 h-5.5 rounded-full relative transition-colors ${b.featured ? 'bg-[#eab308]' : 'bg-[#333]'}`}
                      title={b.featured ? 'Retirer de la sÉlection' : 'Mettre en avant'}
                    >
                      <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-[#1a1d23] shadow transition-transform ${b.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingBrand(b)}
                        title="Modifier"
                        className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-[#1a1d23]/5 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.slug)}
                        title="Supprimer"
                        className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-[#1a1d23]/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {brands.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-300">
                    Aucune marque. Cliquez sur &laquo; Ajouter &raquo; pour commencer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editingBrand && (
        <EditModal
          brand={editingBrand}
          onSave={handleUpdate}
          onClose={() => setEditingBrand(null)}
          onLogoUploaded={handleLogoUploaded}
        />
      )}
    </div>
  );
}

