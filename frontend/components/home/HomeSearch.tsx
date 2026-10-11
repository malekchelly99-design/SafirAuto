'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { vehiclesApi } from '@/lib/api';

const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
const BODY_TYPES = ['SUV', 'Berline', 'Coupé', 'Cabriolet', 'Break', 'Sportive'];

function Select({
  label, value, options, onChange, placeholder,
}: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <label className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase px-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-[#1a1d23] border border-white/10 text-white rounded-xl px-4 py-3 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all cursor-pointer"
        >
          <option value="">{placeholder || 'Tous'}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function HomeSearch() {
  const router = useRouter();
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    vehiclesApi.filterOptions().then(d => setBrands(d.brands || []));
  }, []);

  useEffect(() => {
    if (brand) {
      vehiclesApi.filterOptions(brand).then(d => setModels(d.models || []));
      setModel('');
    } else {
      setModels([]);
      setModel('');
    }
  }, [brand]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (brand)    params.set('brand', brand);
    if (model)    params.set('model', model);
    if (fuelType) params.set('fuel_type', fuelType);
    if (bodyType) params.set('body_type', bodyType);
    if (maxPrice) params.set('max_price', maxPrice);
    router.push(`/vehicules?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative z-10 -mt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-[#1a1d23] rounded-2xl shadow-xl border border-white/5 overflow-hidden">

          {/* Header bar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#1c2026]">
            <div className="w-7 h-7 bg-[#eab308] rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-black text-sm tracking-widest uppercase">Trouver votre véhicule</span>
            <span className="ml-auto text-xs text-gray-400 hidden sm:block">
              Affinez votre recherche ou <button onClick={() => router.push('/vehicules')} className="text-[#eab308] hover:underline font-medium">voir tout le catalogue</button>
            </span>
          </div>

          {/* Filters row */}
          <div className="p-5">
            <div className="flex flex-col lg:flex-row gap-3 items-end">

              {/* Marque */}
              <Select
                label="Marque"
                value={brand}
                options={brands}
                onChange={setBrand}
                placeholder="Toutes les marques"
              />

              {/* Modèle */}
              <Select
                label="Modèle"
                value={model}
                options={models}
                onChange={setModel}
                placeholder={brand ? 'Tous les modèles' : 'Choisir une marque'}
              />

              {/* Carburant */}
              <Select
                label="Carburant"
                value={fuelType}
                options={FUEL_TYPES}
                onChange={setFuelType}
                placeholder="Tous"
              />

              {/* Carrosserie */}
              <Select
                label="Carrosserie"
                value={bodyType}
                options={BODY_TYPES}
                onChange={setBodyType}
                placeholder="Tous"
              />

              {/* Prix max */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <label className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase px-1">Prix max (€)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sans limite"
                  className="w-full bg-[#1a1d23] border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all placeholder-gray-400"
                />
              </div>

              {/* Search button */}
              <div className="flex flex-col gap-1.5 flex-shrink-0 w-full lg:w-auto">
                <span className="text-[10px] text-transparent font-bold tracking-[0.2em] uppercase px-1 hidden lg:block">&#8203;</span>
                <button
                  onClick={handleSearch}
                  className="w-full lg:w-auto flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl bg-[#eab308] hover:bg-[#ca8a04] text-white font-black text-sm tracking-widest transition-all shadow-md hover:shadow-lg hover:shadow-2a2f3a active:scale-[0.98] whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  RECHERCHER
                </button>
              </div>
            </div>

            {/* Quick filter tags */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50">
              <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mr-1">Populaire :</span>
              {[
                { label: 'SUV Premium', params: 'body_type=SUV' },
                { label: 'Hybride', params: 'fuel_type=Hybride' },
                { label: 'Électrique', params: 'fuel_type=Électrique' },
                { label: 'Porsche', params: 'brand=Porsche' },
                { label: 'Ferrari', params: 'brand=Ferrari' },
                { label: 'Lamborghini', params: 'brand=Lamborghini' },
              ].map(({ label, params }) => (
                <button
                  key={label}
                  onClick={() => router.push(`/vehicules?${params}`)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#23272e] text-gray-300 hover:bg-[#eab308] hover:text-white transition-all border border-white/10 hover:border-[#eab308]"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

