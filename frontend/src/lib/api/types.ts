// ─── Auth / User ─────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  created_at: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// ─── Garden ──────────────────────────────────────────────────────────────────

export interface GardenPublic {
  id: string;
  name: string;
  garden_code: string;
  created_by: string;
  owner_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GardenWithOwner extends GardenPublic {
  owner_name: string | null;
  owner_email: string | null;
  plant_count: number;
}

// ─── Library Plant ───────────────────────────────────────────────────────────

export interface LibraryPlantPublic {
  id: string;
  common_name: string;
  latin_name: string;
  reference: string | null;
  overview: string | null;
  spring_care: string | null;
  summer_care: string | null;
  autumn_care: string | null;
  winter_care: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface LibraryPlantsPublic {
  data: LibraryPlantPublic[];
  count: number;
}

// ─── Plant ───────────────────────────────────────────────────────────────────

export interface PlantPublic {
  id: string;
  common_name: string;
  latin_name: string;
  reference: string | null;
  overview: string | null;
  spring_care: string | null;
  summer_care: string | null;
  autumn_care: string | null;
  winter_care: string | null;
  image_url: string | null;
  garden_id: string;
  library_plant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlantsPublic {
  data: PlantPublic[];
  count: number;
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface ApiMessage {
  message: string;
}
