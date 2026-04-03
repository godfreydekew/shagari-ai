import apiClient from "@/lib/apiClient";
import type { ApiMessage, LibraryPlantPublic, LibraryPlantsPublic } from "./types";

export interface LibraryPlantPayload {
  common_name: string;
  latin_name: string;
  reference?: string | null;
  overview?: string | null;
  spring_care?: string | null;
  summer_care?: string | null;
  autumn_care?: string | null;
  winter_care?: string | null;
  image_url?: string | null;
}

export async function getLibraryPlantsApi(): Promise<LibraryPlantsPublic> {
  const { data } = await apiClient.get<LibraryPlantsPublic>("/library-plants/");
  return data;
}

export async function getLibraryPlantApi(plantId: string): Promise<LibraryPlantPublic> {
  const { data } = await apiClient.get<LibraryPlantPublic>(`/library-plants/${plantId}`);
  return data;
}

export async function createLibraryPlantApi(
  payload: LibraryPlantPayload
): Promise<LibraryPlantPublic> {
  const { data } = await apiClient.post<LibraryPlantPublic>("/library-plants/", payload);
  return data;
}

export async function updateLibraryPlantApi(
  plantId: string,
  payload: Partial<LibraryPlantPayload>
): Promise<LibraryPlantPublic> {
  const { data } = await apiClient.patch<LibraryPlantPublic>(
    `/library-plants/${plantId}`,
    payload
  );
  return data;
}

export async function deleteLibraryPlantApi(plantId: string): Promise<ApiMessage> {
  const { data } = await apiClient.delete<ApiMessage>(`/library-plants/${plantId}`);
  return data;
}
