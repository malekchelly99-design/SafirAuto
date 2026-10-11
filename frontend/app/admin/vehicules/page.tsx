'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus, Search, MoreVertical, Eye, Edit, Trash2,
  Copy, Globe, EyeOff, Tag, CheckCircle, ChevronLeft, ChevronRight,
  Filter, LayoutGrid, List
} from 'lucide-react';
import { adminVehiclesApi } from '@/lib/api';
import { Vehicle, PaginatedVehicles } from '@/types';
import { formatPrice, formatMileage, getVehicleImageUrl, formatNumber } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';

const STATUS_TABS = ['Tous', 'PUBLIÉ', 'BROUILLON', 'RÉSERVÉ', 'VENDU', 'ARCHIVÉ'];

export default function AdminVehiclesPage() {
  const [data, setData] = useState<PaginatedVehicles | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: search || undefined,
        status: statusFilter !== 'Tous' ? statusFilter : undefined,
        page,
        page_size: 15,
        ordering: '-updated_at',
      };
      const result = await adminVehiclesApi.list(filters);
      setData(result);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleAction = async (vehicleId: string, action: 'publish' | 'unpublish' | 'sold' | 'reserved' | 'duplicate' | 'delete') => {
    setActionLoading(vehicleId);
    setOpenMenu(null);
    try {
      if (action === 'delete') {
        if (!confirm('Supprimer ce vÉhicule dÉfinitivement ?')) return;
        await adminVehiclesApi.delete(vehicleId);
      } else {
        await adminVehiclesApi.action(vehicleId, action);
      }
      fetchVehicles();
    } catch (e) { console.error(e); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">VÉHICULES</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data ? formatNumber(data.count) : 'É'} vÉhicule{(data?.count || 0) > 1 ? 's' : ''} au total
          </p>
        </div>
        <Link href="/admin/vehicules/nouveau" className="btn-orange inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black tracking-wide">
          <Plus className="w-4 h-4" />
          AJOUTER
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-[#16161a] border border-white/5 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher marque, modÉle..."
            className="input-dark w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[#1c1c21] border border-white/8 rounded-lg p-1">
            <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-[#eab308] text-white' : 'text-gray-500'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-[#eab308] text-white' : 'text-gray-500'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-[#eab308] text-white'
                : 'bg-[#16161a] border border-white/5 text-gray-500 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table / Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : view === 'list' ? (
        <div className="bg-[#16161a] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase">VÉhicule</th>
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase hidden md:table-cell">Prix</th>
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase hidden lg:table-cell">Km / AnnÉe</th>
                <th className="text-left px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase">Statut</th>
                <th className="px-4 py-3 text-[10px] text-gray-300 font-bold tracking-widest uppercase w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.results.map(v => (
                <tr key={v.id} className="hover:bg-[#1a1d23]/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#1c1c21] flex-shrink-0 relative">
                        <Image
                          src={getVehicleImageUrl(v)}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                          onError={() => {}}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{v.brand} {v.model}</p>
                        <p className="text-gray-500 text-xs truncate">{v.version || v.condition}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[#eab308] font-bold text-sm">{formatPrice(v.price)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-400 text-sm">{formatMileage(v.mileage)} É {v.year}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end relative">
                      {actionLoading === v.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <>
                          <Link href={`/admin/vehicules/${v.id}`} className="p-1.5 text-gray-300 hover:text-white rounded transition-colors" title="Modifier">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/vehicules/${v.id}`} target="_blank" className="p-1.5 text-gray-300 hover:text-white rounded transition-colors" title="Voir">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === v.id ? null : v.id)}
                              className="p-1.5 text-gray-300 hover:text-white rounded transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {openMenu === v.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-[#1c1c21] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                                {v.status !== 'PUBLIÉ' && (
                                  <button onClick={() => handleAction(v.id, 'publish')} className="flex items-center gap-2 w-full px-3 py-2.5 text-green-400 hover:bg-[#1a1d23]/5 text-sm">
                                    <Globe className="w-3.5 h-3.5" /> Publier
                                  </button>
                                )}
                                {v.status === 'PUBLIÉ' && (
                                  <button onClick={() => handleAction(v.id, 'unpublish')} className="flex items-center gap-2 w-full px-3 py-2.5 text-yellow-400 hover:bg-[#1a1d23]/5 text-sm">
                                    <EyeOff className="w-3.5 h-3.5" /> DÉpublier
                                  </button>
                                )}
                                <button onClick={() => handleAction(v.id, 'sold')} className="flex items-center gap-2 w-full px-3 py-2.5 text-gray-300 hover:bg-[#1a1d23]/5 text-sm">
                                  <CheckCircle className="w-3.5 h-3.5" /> Marquer vendu
                                </button>
                                <button onClick={() => handleAction(v.id, 'reserved')} className="flex items-center gap-2 w-full px-3 py-2.5 text-gray-300 hover:bg-[#1a1d23]/5 text-sm">
                                  <Tag className="w-3.5 h-3.5" /> RÉserver
                                </button>
                                <button onClick={() => handleAction(v.id, 'duplicate')} className="flex items-center gap-2 w-full px-3 py-2.5 text-gray-300 hover:bg-[#1a1d23]/5 text-sm">
                                  <Copy className="w-3.5 h-3.5" /> Dupliquer
                                </button>
                                <div className="border-t border-white/5" />
                                <button onClick={() => handleAction(v.id, 'delete')} className="flex items-center gap-2 w-full px-3 py-2.5 text-red-400 hover:bg-[#1a1d23]/5 text-sm">
                                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.results.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>Aucun vÉhicule trouvÉ</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.results.map(v => (
            <div key={v.id} className="bg-[#16161a] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors group">
              <div className="relative aspect-[16/10] bg-[#1c1c21]">
                <Image src={getVehicleImageUrl(v)} alt="" fill className="object-cover" sizes="25vw" />
                <div className="absolute top-2 left-2"><StatusBadge status={v.status} /></div>
              </div>
              <div className="p-3">
                <p className="text-[#eab308] text-[10px] font-black tracking-wider uppercase">{v.brand}</p>
                <p className="text-white font-bold text-sm truncate">{v.model} {v.version || ''}</p>
                <p className="text-[#eab308] font-bold text-sm mt-1">{formatPrice(v.price)}</p>
                <div className="flex gap-2 mt-3">
                  <Link href={`/admin/vehicules/${v.id}`} className="flex-1 btn-outline py-1.5 rounded-lg text-[11px] text-center font-bold">Modifier</Link>
                  <button
                    onClick={() => handleAction(v.id, v.status === 'PUBLIÉ' ? 'unpublish' : 'publish')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${v.status === 'PUBLIÉ' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'}`}
                  >
                    {v.status === 'PUBLIÉ' ? 'DÉpublier' : 'Publier'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-gray-500 text-sm">{formatNumber(data.count)} rÉsultats É Page {page} / {data.total_pages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(data.total_pages, p + 1))} disabled={page === data.total_pages}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Close menu on click outside */}
      {openMenu && <div className="fixed inset-0 z-0" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}

