import { Vehicle } from '@/types';

export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('fr-FR').format(km) + ' km';
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function vehicleSlug(v: Vehicle): string {
  return `${slugify(v.brand)}-${slugify(v.model)}-${v.year}-${v.id.slice(0, 8)}`;
}

export function getVehicleImageUrl(v: Vehicle): string {
  const img = v.primary_image || (v.images && v.images[0]);
  if (!img) return '/images/car-placeholder.jpg';
  if (img.startsWith('http')) return img;
  return `http://localhost:8000${img}`;
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Il y a quelques secondes';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString('fr-FR');
}

export function getBadgeStyle(badge: string): string {
  switch (badge) {
    case 'NOUVEAUTÉ': return 'bg-blue-600 text-white';
    case 'PROMOTION': return 'bg-green-600 text-white';
    case 'COUP DE CŒUR': return 'bg-pink-600 text-white';
    case 'EXCLUSIVITÉ': return 'bg-yellow-400 text-black font-extrabold';
    default: return 'bg-gray-600 text-white';
  }
}

export function getStatusStyle(status: string): string {
  switch (status) {
    case 'PUBLIÉ': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
    case 'BROUILLON': return 'bg-gray-200 dark:bg-gray-800 text-gray-200 dark:text-gray-400 border border-gray-300 dark:border-gray-700';
    case 'VENDU': return 'bg-[#23272e] dark:bg-[#2a2f3a]/50 text-[#eab308] dark:text-[#eab308] border border-[#2a2f3a] dark:border-[#eab308]/30';
    case 'RÉSERVÉ': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
    case 'ARCHIVÉ': return 'bg-gray-200 dark:bg-gray-900 text-gray-200 dark:text-gray-500 border border-gray-300 dark:border-gray-800';
    default: return 'bg-gray-200 dark:bg-gray-800 text-gray-200 dark:text-gray-400';
  }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Local favorites (unauthenticated)
export const localFavorites = {
  get: (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('vdl_favorites') || '[]');
    } catch { return []; }
  },
  toggle: (id: string): string[] => {
    const favs = localFavorites.get();
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id);
    else favs.splice(idx, 1);
    localStorage.setItem('vdl_favorites', JSON.stringify(favs));
    return favs;
  },
  has: (id: string): boolean => localFavorites.get().includes(id),
};

