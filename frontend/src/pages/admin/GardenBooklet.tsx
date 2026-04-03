import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { getApiError } from "@/lib/apiClient";
import { getGardenApi } from "@/lib/api/gardens";
import { getPlantsApi } from "@/lib/api/plants";
import type { GardenWithOwner, PlantPublic } from "@/lib/api/types";
import GardenBookletView from "@/components/handbook/GardenBookletView";

export default function GardenBooklet() {
  const { gardenId } = useParams<{ gardenId: string }>();
  const navigate = useNavigate();

  const [garden, setGarden] = useState<GardenWithOwner | null>(null);
  const [plants, setPlants] = useState<PlantPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gardenId) return;

    Promise.all([getGardenApi(gardenId), getPlantsApi(gardenId)])
      .then(([gardenData, plantsData]) => {
        setGarden(gardenData);
        setPlants(plantsData.data);
      })
      .catch((err) => setError(getApiError(err)))
      .finally(() => setIsLoading(false));
  }, [gardenId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !garden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Leaf className="text-muted-foreground/20" size={48} />
        <p className="text-muted-foreground">{error ?? "Garden not found"}</p>
        <button type="button" onClick={() => navigate(-1)} className="text-sm text-primary font-medium">
          Go back
        </button>
      </div>
    );
  }

  const generatedFor = garden.owner_name ?? "Garden owner";

  return (
    <div className="space-y-4">
      <div className="max-w-5xl mx-auto px-4 pt-6 md:px-8 md:pt-8">
        <button
          type="button"
          onClick={() => navigate(`/admin/gardens/${garden.id}`)}
          className="w-10 h-10 rounded-full bg-card garden-shadow flex items-center justify-center hover:bg-secondary transition-colors"
          title="Back to manage garden"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
      </div>

      <GardenBookletView
        title={garden.name}
        subtitle={`${plants.length} plants · Garden handbook preview`}
        generatedFor={generatedFor}
        plants={plants}
      />
    </div>
  );
}
