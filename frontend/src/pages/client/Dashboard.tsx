import { useAuth } from "@/contexts/AuthContext";
import { useMyGarden } from "@/hooks/useMyGarden";
import { getUKSeason } from "@/data/mockData";
import { motion } from "framer-motion";
import {
  Leaf,
  FileText,
  ChevronRight,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const season = getUKSeason();
  const { garden, plants, isLoading, error } = useMyGarden();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const preview = plants.slice(0, 6);

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-7">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          {greeting}, {user?.name.split(" ")[0]} 🌿
        </h1>
        {garden && (
          <p className="text-sm text-muted-foreground mt-1">{garden.name}</p>
        )}
      </motion.div>

      {/* Season Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-botanical p-5 garden-gradient-soft"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{season.emoji}</span>
          <div>
            <h3 className="font-display font-semibold text-foreground">
              {season.season} in Your Garden
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {season.tip}
            </p>
          </div>
        </div>
      </motion.div>

      {/* My Plants */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            My Garden
          </h2>
          {plants.length > 0 && (
            <Link
              to="/plants"
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        )}

        {!isLoading && error && (
          <div className="card-botanical p-5 text-center">
            <Leaf className="mx-auto text-muted-foreground/20 mb-3" size={40} />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!isLoading && !error && plants.length === 0 && (
          <div className="card-botanical p-5 text-center">
            <Leaf className="mx-auto text-muted-foreground/20 mb-3" size={40} />
            <p className="text-sm text-muted-foreground">
              No plants in your garden yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Your GardenKeeper team will add plants to your garden
            </p>
          </div>
        )}

        {!isLoading && plants.length > 0 && (
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {preview.map((plant, i) => (
                <Link
                  key={plant.id}
                  to={`/plants/${plant.id}`}
                  state={{ gardenId: garden?.id }}
                  className="min-w-[140px] max-w-[140px]"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="card-botanical-interactive p-4 active:scale-[0.98]"
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
                        <Leaf className="text-primary/30" size={32} />
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
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
          </div>
        )}
      </motion.div>

      {/* Digital Booklet */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/booklet"
          className="block card-botanical-interactive p-5 garden-gradient-soft"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center garden-shadow shrink-0">
              <FileText className="text-primary" size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">
                Your Garden Handbook
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                View or download your personalised plant guide
              </p>
            </div>
            <ChevronRight className="text-muted-foreground" size={18} />
          </div>
        </Link>
      </motion.div>

      {/* Floating Chat Button */}
      <button
        type="button"
        onClick={() => navigate("/chat")}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full garden-gradient garden-shadow-lg flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all z-40"
        title="Open AI Chat"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
