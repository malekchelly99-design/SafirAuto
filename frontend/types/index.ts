// ── Vehicle ────────────────────────────────────────────────────────────────

export type VehicleStatus = 'BROUILLON' | 'PUBLIÉ' | 'RÉSERVÉ' | 'VENDU' | 'ARCHIVÉ';
export type VehicleCondition = 'Neuf' | 'Occasion' | 'Collection' | 'Démonstration';
export type FuelType = 'Essence' | 'Diesel' | 'Hybride' | 'Électrique' | 'GPL' | 'Autre';
export type TransmissionType = 'Automatique' | 'Manuelle' | 'Séquentielle';
export type BodyType = 'SUV' | 'Berline' | 'Coupé' | 'Cabriolet' | 'Break' | 'Sportive' | 'Citadine' | 'Monospace' | 'Utilitaire';
export type BadgeType = 'NOUVEAUTÉ' | 'PROMOTION' | 'COUP DE CŒUR' | 'EXCLUSIVITÉ' | '';

export interface Vehicle {
  id: string;
  reference: string;
  status: VehicleStatus;
  brand: string;
  model: string;
  version?: string;
  year: number;
  condition: VehicleCondition;
  price: number;
  old_price?: number | null;
  currency: string;
  mileage: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  body_type: BodyType;
  horsepower?: number | null;
  engine_size?: number | null;
  cylinders?: number | null;
  doors?: number | null;
  seats?: number | null;
  owners_count?: number | null;
  first_registration?: string;
  country_origin?: string;
  exterior_color?: string;
  interior_color?: string;
  upholstery?: string;
  warranty?: boolean;
  warranty_months?: number | null;
  service_history?: boolean;
  accident_history?: boolean;
  imported?: boolean;
  title?: string;
  short_description?: string;
  description?: string;
  featured?: boolean;
  badge?: BadgeType;
  primary_image?: string;
  images?: string[];
  equipment?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedVehicles {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  results: Vehicle[];
}

// ── Vehicle Filters ─────────────────────────────────────────────────────────

export interface VehicleFilters {
  brand?: string;
  model?: string;
  condition?: VehicleCondition;
  body_type?: BodyType;
  fuel_type?: FuelType;
  transmission?: TransmissionType;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  min_mileage?: number;
  max_mileage?: number;
  min_horsepower?: number;
  max_horsepower?: number;
  owners_count?: number;
  featured?: boolean;
  search?: string;
  equipment?: string;
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// ── Brand ────────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  country?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

// ── Dashboard ────────────────────────────────────────────────────────────

export interface DashboardStats {
  vehicules_actifs: number;
  vehicules_vendus: number;
  vehicules_brouillon: number;
  vehicules_reserves: number;
  vehicules_total: number;
  vues_catalogue: number;
  demandes_clients: number;
  demandes_non_lues: number;
}

export interface ActivityItem {
  type: 'vehicle' | 'message';
  label: string;
  vehicle?: string;
  from?: string;
  timestamp: string;
}

// ── Message ──────────────────────────────────────────────────────────────

export interface MessageReply {
  id: string;
  text: string;
  author: string;
  role?: 'admin' | 'user';
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  vehicle_id?: string;
  vehicle_ref?: string;
  user_id?: string | null;
  read: boolean;
  replies: MessageReply[];
  created_at: string;
}

// ── Filter Options ───────────────────────────────────────────────────────

export interface FilterOptions {
  brands: string[];
  models?: string[];
}
