import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Leaf, MessageCircle, Loader2 } from "lucide-react";
import { getPlantsApi } from "@/lib/api/plants";
import { getMyGardenApi } from "@/lib/api/gardens";
import { getApiError } from "@/lib/apiClient";
import type { PlantPublic } from "@/lib/api/types";
import ImageLightbox from "@/components/ui/ImageLightbox";

const tabs = ["Overview", "Care Guide"];

const seasonLabel: Record<string, string> = {
  spring: "🌱 Spring",
  summer: "☀️ Summer",
  autumn: "🍂 Autumn",
  winter: "❄️ Winter",
};

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Overview");
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [plant, setPlant] = useState<PlantPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Garden ID may be passed via navigation state (from PlantList/Dashboard)
        // or we fetch the user's garden fresh
        let gardenId: string = location.state?.gardenId;
        if (!gardenId) {
          const garden = await getMyGardenApi();
          gardenId = garden.id;
        }
        const { data: plants } = await getPlantsApi(gardenId);
        const found = plants.find((p) => p.id === id) ?? null;
        if (!found) {
          setError("Plant not found in your garden");
        } else {
          setImageError(false);
          setPlant(found);
        }
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, location.state]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Leaf className="text-muted-foreground/20" size={48} />
        <p className="text-muted-foreground">{error ?? "Plant not found"}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-primary font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  const careFields: { key: keyof PlantPublic; season: string }[] = [
    { key: "spring_care", season: "spring" },
    { key: "summer_care", season: "summer" },
    { key: "autumn_care", season: "autumn" },
    { key: "winter_care", season: "winter" },
  ];

  return (
    <div className="page-enter max-w-2xl mx-auto pb-24">
      {/* Hero */}
      <div className="relative h-48 md:h-64 garden-gradient-soft flex items-center justify-center">
        {plant.image_url && !imageError ? (
          <button
            type="button"
            onClick={() => setShowZoom(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-secondary/40"
            title="Click to zoom image"
          >
            <img
              src={plant.image_url}
              alt={plant.common_name}
              className="w-full h-full object-contain p-3"
              onError={() => setImageError(true)}
            />
          </button>
        ) : (
          <Leaf className="text-primary/20" size={80} />
        )}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center garden-shadow"
          title="Go back"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
      </div>

      <div className="px-4 md:px-8 -mt-6 relative z-10 space-y-5">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-botanical p-5"
        >
          <h1 className="text-xl font-display font-bold text-foreground">
            {plant.common_name}
          </h1>
          <p className="text-sm italic text-muted-foreground">
            {plant.latin_name}
          </p>
          {plant.reference && (
            <p className="text-xs text-muted-foreground mt-1">
              📚 {plant.reference}
            </p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card rounded-xl p-1 garden-shadow">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? "garden-gradient text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Overview" && (
              <div className="card-botanical p-5">
                {plant.overview ? (
                  <p className="text-sm text-foreground leading-relaxed">
                    {plant.overview}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No overview available for this plant yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "Care Guide" && (
              <div className="space-y-3">
                {careFields.map(({ key, season }) => {
                  const content = plant[key] as string | null;
                  return (
                    <div
                      key={season}
                      className="card-botanical overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSeason(
                            expandedSeason === season ? null : season,
                          )
                        }
                        className="w-full p-4 flex items-center justify-between text-left"
                      >
                        <span className="text-sm font-semibold text-foreground capitalize">
                          {seasonLabel[season]}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {expandedSeason === season ? "−" : "+"}
                        </span>
                      </button>
                      <AnimatePresence>
                        {expandedSeason === season && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                              {content ||
                                "No care instructions for this season yet."}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Chat */}
      <button
        type="button"
        onClick={() => navigate("/chat")}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full garden-gradient garden-shadow-lg flex items-center justify-center text-primary-foreground z-40 hover:opacity-90 active:scale-95 transition-all"
        title="Open AI Chat"
      >
        <MessageCircle size={24} />
      </button>

      <ImageLightbox
        open={showZoom && Boolean(plant.image_url) && !imageError}
        src={plant.image_url}
        alt={plant.common_name}
        onClose={() => setShowZoom(false)}
      />
    </div>
  );
}
