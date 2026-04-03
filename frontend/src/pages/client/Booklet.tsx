import { useAuth } from "@/contexts/AuthContext";
import { useMyGarden } from "@/hooks/useMyGarden";
import { FileText, Leaf, Loader2 } from "lucide-react";
import GardenBookletView from "@/components/handbook/GardenBookletView";

export default function Booklet() {
  const { user } = useAuth();
  const { garden, plants, isLoading, error } = useMyGarden();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Leaf className="text-muted-foreground/20" size={48} />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <FileText className="mx-auto text-muted-foreground/20" size={48} />
        <p className="text-muted-foreground">
          Your handbook will appear here once plants are added to your garden.
        </p>
      </div>
    );
  }

  return (
    <GardenBookletView
      title={garden?.name ?? "My Garden"}
      subtitle={`${plants.length} plants · Your personalised handbook`}
      generatedFor={user?.name ?? "Garden owner"}
      plants={plants}
    />
  );
}
