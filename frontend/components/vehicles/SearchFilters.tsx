'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { VehicleFilters } from '@/types';
import { vehiclesApi } from '@/lib/api';

const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Autre'];
const TRANSMISSIONS = ['Automatique', 'Manuelle', 'SÉquentielle'];
const BODY_TYPES = ['SUV', 'Berline', 'CoupÉ', 'Cabriolet', 'Break', 'Sportive', 'Citadine', 'Monospace', 'Utilitaire'];
const CONDITIONS = ['Neuf', 'Occasion', 'Collection', 'DÉmonstration'];
const EQUIPMENT_OPTIONS = [
  'Toit panoramique', 'Toit ouvrant', 'SiÉges chauffants', 'SiÉges ventilÉs', 'SiÉges massants',
  'Apple CarPlay', 'Android Auto', 'CamÉra 360É', 'CamÉra de recul', 'RÉgulateur adaptatif',
  'Head-up display', 'GPS', 'Bluetooth', 'Bose', 'Burmester', 'Bang & Olufsen', 'Harman Kardon',
  'Bowers & Wilkins', 'Naim Audio', '4 roues motrices', 'Suspension adaptative',
  'Freins carbone-cÉramique', 'DiffÉrentiel sport', 'Échappement sport',
];
const OWNERS = ['1', '2', '3'];

interface SearchFiltersProps {
  filters: VehicleFilters;
  onChange: (filters: VehicleFilters) => void;
  onReset: () => void;
  compact?: boolean; // hero search mode
}

function FilterSelect({ label, value, options, onChange, placeholder }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-dark w-full px-3 py-2.5 pr-8 rounded-lg text-sm appearance-none cursor-pointer"
        >
          <option value="">{placeholder || 'Tous'}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

function RangeInputs({ label, minKey, maxKey, minVal, maxVal, onChange, placeholder }: {
  label: string; minKey: string; maxKey: string; minVal: string; maxVal: string;
  onChange: (k: string, v: string) => void; placeholder?: [string, string];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={minVal}
          onChange={e => onChange(minKey, e.target.value)}
          placeholder={placeholder?.[0] || 'Min'}
          className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"
        />
        <input
          type="number"
          value={maxVal}
          onChange={e => onChange(maxKey, e.target.value)}
          placeholder={placeholder?.[1] || 'Max'}
          className="input-dark w-full px-3 py-2.5 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}

export default function SearchFilters({ filters, onChange, onReset, compact = false }: SearchFiltersProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [localFilters, setLocalFilters] = useState<VehicleFilters>(filters);
  const [showEquipment, setShowEquipment] = useState(false);

  useEffect(() => {
    vehiclesApi.filterOptions().then(data => setBrands(data.brands || []));
  }, []);

  useEffect(() => {
    if (localFilters.brand) {
      vehiclesApi.filterOptions(localFilters.brand).then(data => setModels(data.models || []));
    } else {
      setModels([]);
    }
  }, [localFilters.brand]);

  const update = useCallback((key: string, value: unknown) => {
    const updated = { ...localFilters, [key]: value || undefined };
    if (key === 'brand') updated.model = undefined;
    setLocalFilters(updated);
    onChange(updated);
  }, [localFilters, onChange]);

  const handleEquipmentToggle = (item: string) => {
    const current = localFilters.equipment ? localFilters.equipment.split(',').map(s => s.trim()).filter(Boolean) : [];
    const idx = current.indexOf(item);
    if (idx === -1) current.push(item);
    else current.splice(idx, 1);
    update('equipment', current.join(','));
  };

  const selectedEquipment = localFilters.equipment
    ? localFilters.equipment.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const hasFilters = Object.values(localFilters).some(v => v !== undefined && v !== '');

  const handleReset = () => {
    setLocalFilters({});
    setModels([]);
    onReset();
  };

  if (compact) {
    // -- Hero compact search -----------------------------------------------
    return (
      <div className="bg-[#23272e] dark:bg-[#111114]/95 backdrop-blur-xl border border-black/10 dark:border-white/8 rounded-2xl p-4 lg:p-6 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
          <FilterSelect label="Marque" value={localFilters.brand || ''} options={brands} onChange={v => update('brand', v)} />
          <FilterSelect label="ModÉle" value={localFilters.model || ''} options={models} onChange={v => update('model', v)} placeholder={localFilters.brand ? 'Tous les modÉles' : 'Choisir une marque'} />
          <FilterSelect label="Carburant" value={localFilters.fuel_type || ''} options={FUEL_TYPES} onChange={v => update('fuel_type', v)} />
          <FilterSelect label="Type" value={localFilters.body_type || ''} options={BODY_TYPES} onChange={v => update('body_type', v)} />
          <div className="flex items-end">
            <a
              href={`/vehicules?${new URLSearchParams(Object.fromEntries(Object.entries(localFilters).filter(([,v]) => v !== undefined && v !== '').map(([k,v]) => [k, String(v)]))).toString()}`}
              className="btn-orange w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black tracking-widest"
            >
              <Search className="w-4 h-4" />
              RECHERCHER
            </a>
          </div>
        </div>
      </div>
    );
  }

  // -- Full sidebar filter ------------------------------------------------
  return (
    <aside className="bg-[#23272e] dark:bg-[#111114] border border-black/10 dark:border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#eab308]" />
          <span className="text-white dark:text-white font-bold text-sm tracking-wide">FILTRES</span>
        </div>
        {hasFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#eab308] transition-colors"
          >
            <X className="w-3 h-3" />
            RÉinitialiser
          </button>
        )}
      </div>

      <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Search */}
        <div>
           <label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-1.5">Recherche</label>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 dark:text-gray-500" />
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={e => update('search', e.target.value)}
              placeholder="Marque, modÉle..."
              className="input-dark w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Brand */}
        <FilterSelect label="Marque" value={localFilters.brand || ''} options={brands} onChange={v => update('brand', v)} />

        {/* Model */}
        <FilterSelect
          label="ModÉle"
          value={localFilters.model || ''}
          options={models}
          onChange={v => update('model', v)}
          placeholder={localFilters.brand ? 'Tous les modÉles' : 'SÉlectionner une marque'}
        />

        {/* Price */}
        <RangeInputs
          label="Prix (É)"
          minKey="min_price" maxKey="max_price"
          minVal={String(localFilters.min_price || '')} maxVal={String(localFilters.max_price || '')}
          onChange={update}
          placeholder={['0', '1 000 000']}
        />

        {/* Year */}
        <RangeInputs
          label="AnnÉe"
          minKey="min_year" maxKey="max_year"
          minVal={String(localFilters.min_year || '')} maxVal={String(localFilters.max_year || '')}
          onChange={update}
          placeholder={['2000', '2024']}
        />

        {/* Mileage */}
        <RangeInputs
          label="KilomÉtrage"
          minKey="min_mileage" maxKey="max_mileage"
          minVal={String(localFilters.min_mileage || '')} maxVal={String(localFilters.max_mileage || '')}
          onChange={update}
          placeholder={['0', '200 000']}
        />

        {/* Fuel */}
        <div>
          <label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-2">Carburant</label>
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map(f => (
              <button
                key={f}
                onClick={() => update('fuel_type', localFilters.fuel_type === f ? '' : f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  localFilters.fuel_type === f
                    ? 'bg-[#eab308] text-white'
                    : 'bg-gray-200 dark:bg-[#1c1c21] text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white border border-black/10 dark:border-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div>
          <label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-2">Transmission</label>
          <div className="flex flex-wrap gap-2">
            {TRANSMISSIONS.map(t => (
              <button
                key={t}
                onClick={() => update('transmission', localFilters.transmission === t ? '' : t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  localFilters.transmission === t
                    ? 'bg-[#eab308] text-white'
                    : 'bg-gray-200 dark:bg-[#1c1c21] text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white border border-black/10 dark:border-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body type */}
        <div>
          <label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-2">Carrosserie</label>
          <div className="flex flex-wrap gap-2">
            {BODY_TYPES.map(b => (
              <button
                key={b}
                onClick={() => update('body_type', localFilters.body_type === b ? '' : b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  localFilters.body_type === b
                    ? 'bg-[#eab308] text-white'
                    : 'bg-gray-200 dark:bg-[#1c1c21] text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white border border-black/10 dark:border-white/5'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Condition */}
        <FilterSelect label="État du vÉhicule" value={localFilters.condition || ''} options={CONDITIONS} onChange={v => update('condition', v)} />

        {/* Horsepower */}
        <RangeInputs
          label="Puissance (ch)"
          minKey="min_horsepower" maxKey="max_horsepower"
          minVal={String(localFilters.min_horsepower || '')} maxVal={String(localFilters.max_horsepower || '')}
          onChange={update}
          placeholder={['100', '1000']}
        />

        {/* Owners */}
        <div>
          <label className="text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase block mb-2">Nbre de propriÉtaires</label>
          <div className="flex gap-2">
            {OWNERS.map(o => (
              <button
                key={o}
                onClick={() => update('owners_count', localFilters.owners_count === Number(o) ? undefined : Number(o))}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                  localFilters.owners_count === Number(o)
                    ? 'bg-[#eab308] text-white'
                    : 'bg-gray-200 dark:bg-[#1c1c21] text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white border border-black/10 dark:border-white/5'
                }`}
              >
                {o === '3' ? '3+' : o}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <button
            onClick={() => setShowEquipment(!showEquipment)}
            className="w-full flex items-center justify-between text-[10px] text-gray-300 dark:text-gray-500 font-bold tracking-widest uppercase mb-2"
          >
            <span>Équipements {selectedEquipment.length > 0 && <span className="text-[#eab308]">({selectedEquipment.length})</span>}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showEquipment ? 'rotate-180' : ''}`} />
          </button>
          {showEquipment && (
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_OPTIONS.map(eq => (
                <button
                  key={eq}
                  onClick={() => handleEquipmentToggle(eq)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedEquipment.includes(eq)
                      ? 'bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40'
                      : 'bg-gray-200 dark:bg-[#1c1c21] text-gray-300 dark:text-gray-500 hover:text-gray-200 dark:hover:text-gray-300 border border-black/10 dark:border-white/5'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

