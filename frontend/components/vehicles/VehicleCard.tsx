'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Fuel, Gauge, Zap, Calendar, Users, ArrowRight } from 'lucide-react';
import { Vehicle } from '@/types';
import { formatPrice, formatMileage, getVehicleImageUrl, localFavorites } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface VehicleCardProps {
  vehicle: Vehicle;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
}

export default function VehicleCard({ vehicle, onFavoriteToggle }: VehicleCardProps) {
  const [isFav, setIsFav] = useState(() => localFavorites.has(vehicle.id));
  const [imgError, setImgError] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = localFavorites.toggle(vehicle.id);
    const newState = newFavs.includes(vehicle.id);
    setIsFav(newState);
    onFavoriteToggle?.(vehicle.id, newState);
  };

  const imageUrl = imgError ? '/images/car-placeholder.jpg' : getVehicleImageUrl(vehicle);
  const detailUrl = `/vehicules/${vehicle.id}`;

  return (
    <article className="vehicle-card bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-xl overflow-hidden group">
      {/* Image */}
      <Link href={detailUrl} className="block relative overflow-hidden aspect-[16/10]">
        <div className="absolute inset-0 bg-gray-200 dark:bg-[#1c1c21]">
          <Image
            src={imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 dark:from-[#16161a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        {vehicle.badge && (
          <div className="absolute top-3 left-3">
            <Badge label={vehicle.badge} />
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={handleFavorite}
           className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-[#eab308]/20 hover:scale-110"
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
             className={`w-4 h-4 transition-colors ${isFav ? 'fill-[#eab308] text-[#eab308]' : 'text-gray-300 dark:text-white'}`}
          />
        </button>

        {/* Image counter */}
        {vehicle.images && vehicle.images.length > 1 && (
           <div className="absolute bottom-3 right-3 bg-black/10 dark:bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-medium">
            {vehicle.images.length} photos
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 lg:p-5">
        {/* Brand + model */}
        <div className="mb-3">
          <p className="text-[#eab308] text-[10px] font-black tracking-[0.2em] uppercase mb-1">
            {vehicle.brand}
          </p>
          <h3 className="text-white dark:text-white font-bold text-base lg:text-lg leading-tight">
            {vehicle.model}
          </h3>
          {vehicle.version && (
            <p className="text-gray-300 dark:text-gray-500 text-sm mt-0.5 truncate">{vehicle.version}</p>
          )}
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3 text-gray-300 dark:text-gray-400" />
            <span className="text-xs">{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Gauge className="w-3 h-3 text-gray-300 dark:text-gray-400" />
            <span className="text-xs">{formatMileage(vehicle.mileage)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Fuel className="w-3 h-3 text-gray-300 dark:text-gray-400" />
            <span className="text-xs">{vehicle.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Zap className="w-3 h-3 text-gray-300 dark:text-gray-400" />
            <span className="text-xs">{vehicle.horsepower ? `${vehicle.horsepower} ch` : vehicle.transmission}</span>
          </div>
          {vehicle.owners_count && (
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3 text-gray-300 dark:text-gray-400" />
              <span className="text-xs">{vehicle.owners_count} propriÉtaire{vehicle.owners_count > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 text-gray-300 dark:text-gray-400 text-center text-[10px]">?</span>
            <span className="text-xs">{vehicle.body_type}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-black/10 dark:border-white/5">
          <div>
            {vehicle.old_price && (
              <p className="text-gray-300 text-xs line-through mb-0.5">
                {formatPrice(vehicle.old_price)}
              </p>
            )}
            <p className="text-[#eab308] text-xl font-black tracking-tight">
              {formatPrice(vehicle.price)}
            </p>
          </div>
          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1.5 text-[#eab308] text-xs font-black tracking-wider uppercase hover:gap-2.5 transition-all group/link"
          >
            VOIR LE DÉTAIL
            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}

