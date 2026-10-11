'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchFilters from '@/components/vehicles/SearchFilters';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { SkeletonGrid } from '@/components/ui/SkeletonCard';
import { Vehicle, VehicleFilters, PaginatedVehicles } from '@/types';
import { vehiclesApi } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { SlidersHorizontal, LayoutGrid, List, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Plus rÉcents' },
  { value: 'price', label: 'Prix croissant' },
  { value: '-price', label: 'Prix dÉcroissant' },
  { value: 'mileage', label: 'KilomÉtrage' },
  { value: '-horsepower', label: 'Puissance' },
];

function VehiclesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<VehicleFilters>(() => {
    const f: VehicleFilters = {};
    searchParams.forEach((v, k) => { (f as Record<string, unknown>)[k] = v; });
    return f;
  });

  const [data, setData] = useState<PaginatedVehicles | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await vehiclesApi.list({ ...filters, ordering, page, page_size: 12 });
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, ordering, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFiltersChange = (newFilters: VehicleFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
    router.push('/vehicules');
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        {/* Page header */}
        <div className="bg-[#23272e] dark:bg-[#111114] border-b border-black/10 dark:border-white/5 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-6 h-px bg-[#eab308]" />
              <span className="text-[#eab308] text-xs tracking-[0.3em] uppercase font-bold">Catalogue</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white dark:text-white">NOS VÉHICULES</h1>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar É desktop */}
            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <SearchFilters filters={filters} onChange={handleFiltersChange} onReset={handleReset} />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-black/10 dark:border-white/5">
                <div className="flex items-center gap-3">
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#16161a] border border-black/10 dark:border-white/8 rounded-lg text-sm text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtres {activeFilterCount > 0 && <span className="bg-[#eab308] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
                  </button>
                  <p className="text-gray-300 dark:text-gray-400 text-sm">
                    {loading ? 'É' : <><span className="text-white dark:text-white font-bold">{formatNumber(data?.count || 0)}</span> vÉhicule{(data?.count || 0) > 1 ? 's' : ''}</>}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <select
                    value={ordering}
                    onChange={e => { setOrdering(e.target.value); setPage(1); }}
                    className="input-dark px-3 py-2 rounded-lg text-sm min-w-[160px]"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  {/* View toggle */}
                  <div className="hidden sm:flex items-center gap-1 bg-gray-200 dark:bg-[#16161a] border border-black/10 dark:border-white/8 rounded-lg p-1">
                    <button onClick={() => setView('grid')} className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-[#eab308] text-white' : 'text-gray-300 dark:text-gray-500 hover:text-white dark:hover:text-white'}`}>
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setView('list')} className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-[#eab308] text-white' : 'text-gray-300 dark:text-gray-500 hover:text-white dark:hover:text-white'}`}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active filters chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {Object.entries(filters).map(([k, v]) => {
                    if (!v) return null;
                    const labels: Record<string, string> = {
                      brand: 'Marque', model: 'ModÉle', fuel_type: 'Carburant',
                      transmission: 'Transmission', body_type: 'Carrosserie',
                      condition: 'État', min_price: 'Prix min', max_price: 'Prix max',
                      min_year: 'AnnÉe min', max_year: 'AnnÉe max', search: 'Recherche',
                    };
                    return (
                      <span key={k} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eab308]/15 border border-[#eab308]/30 rounded-full text-xs text-[#eab308]">
                        {labels[k] || k}: {String(v)}
                        <button onClick={() => { const f = { ...filters }; delete (f as Record<string, unknown>)[k]; handleFiltersChange(f); }}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  <button onClick={handleReset} className="text-gray-300 dark:text-gray-500 hover:text-white dark:hover:text-white text-xs underline">
                    Tout effacer
                  </button>
                </div>
              )}

              {/* Vehicle grid/list */}
              {loading ? (
                <SkeletonGrid count={12} />
              ) : data?.results.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-6xl mb-4">??</div>
                  <h3 className="text-white dark:text-white font-bold text-xl mb-2">Aucun vÉhicule trouvÉ</h3>
                  <p className="text-gray-300 dark:text-gray-500 mb-6">Modifiez vos critÉres de recherche</p>
                  <button onClick={handleReset} className="btn-orange px-6 py-3 rounded-xl text-sm font-black tracking-widest">
                    RÉinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className={view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'space-y-4'
                }>
                  {data?.results.map(v => <VehicleCard key={v.id} vehicle={v} />)}
                </div>
              )}

              {/* Pagination */}
              {data && data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-black/20 dark:border-white/10 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(data.total_pages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                          p === page
                          ? 'bg-[#eab308] text-white'
                          : 'border border-black/20 dark:border-white/10 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                    disabled={page === data.total_pages}
                    className="p-2 rounded-lg border border-black/20 dark:border-white/10 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filters drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-80 bg-[#23272e] dark:bg-[#0d0d10] border-r border-black/10 dark:border-white/8 overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5 sticky top-0 bg-[#23272e] dark:bg-[#0d0d10] z-10">
                <span className="text-white dark:text-white font-bold">FILTRES</span>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <SearchFilters filters={filters} onChange={(f) => { handleFiltersChange(f); setMobileFiltersOpen(false); }} onReset={() => { handleReset(); setMobileFiltersOpen(false); }} />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1d23] dark:bg-[#0a0a0b]" />}>
      <VehiclesContent />
    </Suspense>
  );
}

