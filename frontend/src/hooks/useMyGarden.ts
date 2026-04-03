import { useEffect, useState } from 'react';
import { getMyGardenApi } from '@/lib/api/gardens';
import { getPlantsApi } from '@/lib/api/plants';
import { getApiError } from '@/lib/apiClient';
import type { GardenPublic, PlantPublic } from '@/lib/api/types';

interface MyGardenState {
  garden: GardenPublic | null;
  plants: PlantPublic[];
  isLoading: boolean;
  error: string | null;
}

export function useMyGarden(): MyGardenState {
  const [state, setState] = useState<MyGardenState>({
    garden: null,
    plants: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const garden = await getMyGardenApi();
        const { data: plants } = await getPlantsApi(garden.id);
        setState({ garden, plants, isLoading: false, error: null });
      } catch (err) {
        setState({ garden: null, plants: [], isLoading: false, error: getApiError(err) });
      }
    }
    load();
  }, []);

  return state;
}
