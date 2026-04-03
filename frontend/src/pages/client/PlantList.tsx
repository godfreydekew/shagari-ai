import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Leaf, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMyGarden } from "@/hooks/useMyGarden";

export default function PlantList() {
  const [search, setSearch] = useState("");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const { garden, plants, isLoading, error } = useMyGarden();

  const filtered = plants.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.common_name.toLowerCase().includes(q) ||
      p.latin_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <h1 className="text-2xl font-display font-bold text-foreground">
        My Plants
      </h1>

      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plants..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none garden-shadow"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-20">
          <Leaf className="mx-auto text-muted-foreground/20 mb-4" size={48} />
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((plant, i) => (
              <Link
                key={plant.id}
                to={`/plants/${plant.id}`}
                state={{ gardenId: garden?.id }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-botanical p-4 hover:garden-shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="w-full aspect-square rounded-xl bg-secondary flex items-center justify-center mb-3">
                    {plant.image_url && !brokenImages[plant.id] ? (
                      <img
                        src={plant.image_url}
                        alt={plant.common_name}
                        className="w-full h-full rounded-xl object-contain p-2"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [plant.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <Leaf className="text-primary/30" size={36} />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {plant.common_name}
                  </h3>
                  <p className="text-xs text-muted-foreground italic truncate">
                    {plant.latin_name}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && plants.length > 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">
                No plants match your search
              </p>
            </div>
          )}

          {plants.length === 0 && (
            <div className="text-center py-20">
              <Leaf
                className="mx-auto text-muted-foreground/20 mb-4"
                size={48}
              />
              <p className="text-muted-foreground">
                No plants in your garden yet
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Your GardenKeeper team will add plants to your garden
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
