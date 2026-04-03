import { motion } from "framer-motion";
import { Download, FileText, Leaf } from "lucide-react";
import { useMemo, useState } from "react";
import type { PlantPublic } from "@/lib/api/types";
import ImageLightbox from "@/components/ui/ImageLightbox";

interface GardenBookletViewProps {
  title: string;
  subtitle: string;
  plants: PlantPublic[];
  generatedFor: string;
}

const seasons: { key: keyof PlantPublic; label: string; emoji: string }[] = [
  { key: "spring_care", label: "Spring", emoji: "🌱" },
  { key: "summer_care", label: "Summer", emoji: "☀️" },
  { key: "autumn_care", label: "Autumn", emoji: "🍂" },
  { key: "winter_care", label: "Winter", emoji: "❄️" },
];

export default function GardenBookletView({ title, subtitle, plants, generatedFor }: GardenBookletViewProps) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const references = useMemo(() => plants.filter((p) => p.reference), [plants]);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          body * { visibility: hidden !important; }
          .booklet-print-root,
          .booklet-print-root * { visibility: visible !important; }
          .booklet-print-root { position: absolute; inset: 0; width: 100%; }
          .no-print { display: none !important; }
          .booklet-page { page-break-after: always; box-shadow: none !important; border-radius: 0 !important; }
          .booklet-cover { page-break-after: always; }
        }
      `}</style>

      <div className="booklet-print-root max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
        <div className="no-print flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="pill-button garden-gradient text-primary-foreground font-semibold text-sm flex items-center gap-2 garden-shadow-lg shrink-0"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="booklet-cover card-botanical garden-gradient p-10 text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-card/20 backdrop-blur mx-auto flex items-center justify-center">
            <FileText className="text-primary-foreground" size={36} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70">Garden Handbook</p>
            <h2 className="text-2xl font-display font-bold text-primary-foreground">{title}</h2>
            <p className="text-sm text-primary-foreground/80">Prepared for {generatedFor}</p>
          </div>
          <div className="pt-2 border-t border-primary-foreground/20 text-xs text-primary-foreground/60 space-y-0.5">
            <p>{plants.length} plants documented</p>
            <p>Generated {today}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-botanical p-6 space-y-3 print:break-after-page"
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Contents</h2>
          <ol className="space-y-2">
            {plants.map((plant, i) => (
              <li key={plant.id} className="flex items-baseline gap-3">
                <span className="text-xs tabular-nums text-muted-foreground w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <a href={`#plant-${plant.id}`} className="flex-1 flex items-baseline gap-2 no-underline group">
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{plant.common_name}</span>
                  <span className="flex-1 border-b border-dashed border-border/60 mb-0.5" />
                  <span className="text-xs italic text-muted-foreground shrink-0">{plant.latin_name}</span>
                </a>
              </li>
            ))}
            {references.length > 0 && (
              <li className="flex items-baseline gap-3 pt-1 border-t border-border/40">
                <span className="text-xs tabular-nums text-muted-foreground w-6 shrink-0">—</span>
                <a href="#references" className="text-sm text-foreground hover:text-primary transition-colors no-underline">References</a>
              </li>
            )}
          </ol>
        </motion.div>

        <div className="space-y-6">
          {plants.map((plant, i) => (
            <motion.div
              key={plant.id}
              id={`plant-${plant.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
              className="booklet-page card-botanical rounded-2xl garden-shadow overflow-hidden print:shadow-none print:rounded-none"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="p-5 border-b md:border-b-0 md:border-r border-border/50 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground tabular-nums">#{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="text-lg font-display font-bold text-foreground leading-tight">{plant.common_name}</h3>
                  <p className="text-sm italic text-muted-foreground">{plant.latin_name}</p>
                  <button
                    type="button"
                    onClick={() => plant.image_url && setLightbox({ src: plant.image_url, alt: plant.common_name })}
                    className="w-full aspect-[4/3] rounded-xl bg-secondary border border-border/50 overflow-hidden flex items-center justify-center"
                    disabled={!plant.image_url}
                    title={plant.image_url ? "Click to zoom image" : "No image available"}
                  >
                    {plant.image_url ? (
                      <img src={plant.image_url} alt={plant.common_name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Leaf className="text-primary/30" size={30} />
                    )}
                  </button>
                  <p className="text-[11px] text-muted-foreground">Tap image to zoom</p>
                </div>

                <div className="p-5 border-b md:border-b-0 md:border-r border-border/50">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Overview</h4>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {plant.overview || "No overview available for this plant yet."}
                  </p>
                </div>

                <div className="p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Seasonal Care</h4>
                  <div className="space-y-2">
                    {seasons.map(({ key, label, emoji }) => {
                      const text = plant[key] as string | null;
                      return (
                        <div key={key} className="rounded-lg bg-secondary/60 px-3 py-2 border border-border/40">
                          <p className="text-xs font-semibold text-foreground">{emoji} {label}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{text || "No care instructions."}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {references.length > 0 && (
          <motion.div
            id="references"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-botanical p-6 space-y-3 print:break-before-page"
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">References</h2>
            <ol className="space-y-2 list-decimal list-inside">
              {references.map((plant) => (
                <li key={plant.id} className="text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">{plant.common_name}</span>
                  {" ("}
                  <span className="italic">{plant.latin_name}</span>
                  {"). "}
                  {plant.reference}
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        <div className="no-print h-8" />
      </div>

      <ImageLightbox
        open={Boolean(lightbox)}
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? "Plant image"}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
