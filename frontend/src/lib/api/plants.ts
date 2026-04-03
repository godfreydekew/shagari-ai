import apiClient from "@/lib/apiClient";
import type { ApiMessage, PlantPublic, PlantsPublic } from "./types";

export interface PlantPayload {
  common_name: string;
  latin_name: string;
  reference?: string | null;
  overview?: string | null;
  spring_care?: string | null;
  summer_care?: string | null;
  autumn_care?: string | null;
  winter_care?: string | null;
  image_url?: string | null;
  library_plant_id?: string | null;
}

export async function getPlantsApi(gardenId: string): Promise<PlantsPublic> {
  const { data } = await apiClient.get<PlantsPublic>(`/gardens/${gardenId}/plants/`);
  return data;
}

export async function createPlantApi(
  gardenId: string,
  payload: PlantPayload
): Promise<PlantPublic> {
  const { data } = await apiClient.post<PlantPublic>(`/gardens/${gardenId}/plants/`, payload);
  return data;
}

export async function createPlantFromLibraryApi(
  gardenId: string,
  libraryPlantId: string
): Promise<PlantPublic> {
  const { data } = await apiClient.post<PlantPublic>(
    `/gardens/${gardenId}/plants/from-library`,
    { library_plant_id: libraryPlantId }
  );
  return data;
}

export async function updatePlantApi(
  gardenId: string,
  plantId: string,
  payload: Partial<PlantPayload>
): Promise<PlantPublic> {
  const { data } = await apiClient.patch<PlantPublic>(
    `/gardens/${gardenId}/plants/${plantId}`,
    payload
  );
  return data;
}

export async function deletePlantApi(gardenId: string, plantId: string): Promise<ApiMessage> {
  const { data } = await apiClient.delete<ApiMessage>(
    `/gardens/${gardenId}/plants/${plantId}`
  );
  return data;
}
