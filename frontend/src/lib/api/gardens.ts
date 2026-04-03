import apiClient from "@/lib/apiClient";
import type { ApiMessage, GardenPublic, GardenWithOwner } from "./types";

export async function getMyGardenApi(): Promise<GardenPublic> {
  const { data } = await apiClient.get<GardenPublic>("/gardens/my");
  return data;
}

export async function getGardensApi(): Promise<GardenWithOwner[]> {
  const { data } = await apiClient.get<GardenWithOwner[]>("/gardens/");
  return data;
}

export async function getGardenApi(gardenId: string): Promise<GardenWithOwner> {
  const { data } = await apiClient.get<GardenWithOwner>(`/gardens/${gardenId}`);
  return data;
}

export async function createGardenApi(name: string): Promise<GardenPublic> {
  const { data } = await apiClient.post<GardenPublic>("/gardens/", { name });
  return data;
}

export async function updateGardenApi(
  gardenId: string,
  name: string
): Promise<GardenPublic> {
  const { data } = await apiClient.patch<GardenPublic>(`/gardens/${gardenId}`, { name });
  return data;
}

export async function deleteGardenApi(gardenId: string): Promise<ApiMessage> {
  const { data } = await apiClient.delete<ApiMessage>(`/gardens/${gardenId}`);
  return data;
}
