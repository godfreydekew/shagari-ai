import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Plus,
  Pencil,
  Trash2,
  Leaf,
  X,
  Upload,
  BookOpen,
  Search,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getGardenApi } from "@/lib/api/gardens";
import {
  getPlantsApi,
  createPlantApi,
  updatePlantApi,
  deletePlantApi,
  createPlantFromLibraryApi,
} from "@/lib/api/plants";
import { getLibraryPlantsApi } from "@/lib/api/libraryPlants";
import { getApiError } from "@/lib/apiClient";
import { deleteS3Image, uploadPlantImage } from "@/lib/s3";
import type { GardenWithOwner } from "@/lib/api/types";
import type { PlantPublic } from "@/lib/api/types";
import type { LibraryPlantPublic } from "@/lib/api/types";

const emptyForm = {
  latin_name: "",
  common_name: "",
  reference: "",
  overview: "",
  spring_care: "",
  summer_care: "",
  autumn_care: "",
  winter_care: "",
};

export default function ManageGarden() {
  const { gardenId } = useParams<{ gardenId: string }>();
  const navigate = useNavigate();

  const [garden, setGarden] = useState<GardenWithOwner | null>(null);
  const [plants, setPlants] = useState<PlantPublic[]>([]);
  const [library, setLibrary] = useState<LibraryPlantPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showPlantModal, setShowPlantModal] = useState(false);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantPublic | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [librarySearch, setLibrarySearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [addingFromLib, setAddingFromLib] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!gardenId) return;
    Promise.all([
      getGardenApi(gardenId),
      getPlantsApi(gardenId),
      getLibraryPlantsApi(),
    ])
      .then(([g, p, lib]) => {
        setGarden(g);
        setPlants(p.data);
        setLibrary(lib.data);
      })
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setIsLoading(false));
  }, [gardenId]);

  function copyCode() {
    if (!garden) return;
    navigator.clipboard.writeText(garden.garden_code);
    toast.success("Garden ID copied!");
  }

  function openAddNew() {
    setEditingPlant(null);
    setForm(emptyForm);
    setImageUrl(null);
    setShowPlantModal(true);
  }

  function openEdit(plant: PlantPublic) {
    setEditingPlant(plant);
    setForm({
      latin_name: plant.latin_name,
      common_name: plant.common_name,
      reference: plant.reference ?? "",
      overview: plant.overview ?? "",
      spring_care: plant.spring_care ?? "",
      summer_care: plant.summer_care ?? "",
      autumn_care: plant.autumn_care ?? "",
      winter_care: plant.winter_care ?? "",
    });
    setImageUrl(plant.image_url);
    setShowPlantModal(true);
  }

  async function handleImagePick(file: File | null) {
    if (!file || !gardenId) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Please upload JPG, PNG, WEBP or GIF images only.");
      return;
    }

    setUploadingImage(true);
    try {
      const uploadId =
        editingPlant?.id ?? `garden-${gardenId}-${crypto.randomUUID()}`;
      const uploadedUrl = await uploadPlantImage(uploadId, file);
      setImageUrl(uploadedUrl);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleRemoveImage() {
    if (!imageUrl) return;
    setImageUrl(null);
    toast.success("Image will be removed when you save changes.");
  }

  async function handleSave() {
    if (!form.latin_name.trim() || !gardenId) return;
    setSaving(true);
    const payload = {
      latin_name: form.latin_name.trim(),
      common_name: form.common_name.trim() || form.latin_name.trim(),
      reference: form.reference.trim() || null,
      overview: form.overview.trim() || null,
      spring_care: form.spring_care.trim() || null,
      summer_care: form.summer_care.trim() || null,
      autumn_care: form.autumn_care.trim() || null,
      winter_care: form.winter_care.trim() || null,
      image_url: imageUrl,
    };
    try {
      const previousImageUrl = editingPlant?.image_url ?? null;
      if (editingPlant) {
        const updated = await updatePlantApi(
          gardenId,
          editingPlant.id,
          payload,
        );
        setPlants((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        if (previousImageUrl && previousImageUrl !== payload.image_url) {
          await deleteS3Image(previousImageUrl).catch(() => undefined);
        }
        toast.success("Plant updated");
      } else {
        const created = await createPlantApi(gardenId, payload);
        setPlants((prev) => [...prev, created]);
        toast.success("Plant added");
      }
      setShowPlantModal(false);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function addFromLibrary(libPlant: LibraryPlantPublic) {
    if (!gardenId) return;
    setAddingFromLib(libPlant.id);
    try {
      const plant = await createPlantFromLibraryApi(gardenId, libPlant.id);
      setPlants((prev) => [...prev, plant]);
      toast.success(`${libPlant.common_name} added from library`);
      setShowLibraryPicker(false);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setAddingFromLib(null);
    }
  }

  async function handleDeletePlant(plantId: string) {
    if (!gardenId) return;
    setDeleting(plantId);
    try {
      const res = await deletePlantApi(gardenId, plantId);
      setPlants((prev) => prev.filter((p) => p.id !== plantId));
      setConfirmDelete(null);
      toast.success(res.message);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDeleting(null);
    }
  }

  const filteredLibrary = library.filter((p) => {
    const q = librarySearch.toLowerCase();
    return (
      p.common_name.toLowerCase().includes(q) ||
      p.latin_name.toLowerCase().includes(q)
    );
  });

  const alreadyInGarden = (libPlantId: string) =>
    plants.some((p) => p.library_plant_id === libPlantId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Garden not found
      </div>
    );
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="w-10 h-10 rounded-full bg-card garden-shadow flex items-center justify-center hover:bg-secondary transition-colors"
          title="Back to gardens"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-foreground">
            {garden.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-sm text-primary font-semibold">
              {garden.garden_code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Copy Garden ID"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Owner */}
      <div className="card-botanical p-4">
        {garden.owner_name ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full garden-gradient flex items-center justify-center text-primary-foreground text-sm font-bold">
              {garden.owner_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {garden.owner_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {garden.owner_email}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Awaiting owner — share the Garden ID with your client to let them
            sign up
          </p>
        )}
      </div>

      {/* Plants header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground">
          Plants ({plants.length})
        </h2>
        <div className="flex gap-2">
          <Link
            to={`/admin/gardens/${garden.id}/booklet`}
            className="pill-button bg-secondary text-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
          >
            <FileText size={16} /> Handbook
          </Link>
          <button
            type="button"
            onClick={() => {
              setLibrarySearch("");
              setShowLibraryPicker(true);
            }}
            className="pill-button bg-secondary text-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
          >
            <BookOpen size={16} /> From Library
          </button>
          <button
            type="button"
            onClick={openAddNew}
            className="pill-button garden-gradient text-primary-foreground text-sm font-medium flex items-center gap-1.5"
          >
            <Plus size={16} /> New Plant
          </button>
        </div>
      </div>

      {/* Plant grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {plants.map((plant, i) => (
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card-botanical p-4"
          >
            <div className="w-full aspect-[4/3] rounded-xl bg-secondary flex items-center justify-center mb-3">
              {plant.image_url ? (
                <img
                  src={plant.image_url}
                  alt={plant.common_name}
                  className="w-full h-full rounded-xl object-contain p-2"
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
            <div className="flex gap-1 mt-3">
              <button
                type="button"
                onClick={() => openEdit(plant)}
                className="flex-1 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground flex items-center justify-center gap-1 hover:bg-secondary/80 transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
              {confirmDelete === plant.id ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleDeletePlant(plant.id)}
                    disabled={deleting === plant.id}
                    className="py-1.5 px-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium disabled:opacity-60"
                  >
                    {deleting === plant.id ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      "Yes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="py-1.5 px-2 rounded-lg bg-secondary text-xs font-medium"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(plant.id)}
                  className="py-1.5 px-2 rounded-lg text-muted-foreground/50 text-xs flex items-center justify-center hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title={`Remove ${plant.common_name}`}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {plants.length === 0 && (
        <div className="text-center py-16">
          <Leaf className="mx-auto text-muted-foreground/20 mb-4" size={48} />
          <p className="text-muted-foreground">No plants in this garden yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Add from your library or create a new plant
          </p>
        </div>
      )}

      {/* Library Picker Modal */}
      <AnimatePresence>
        {showLibraryPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setShowLibraryPicker(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg bg-card rounded-t-3xl md:rounded-3xl p-6 space-y-4 garden-shadow-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">
                  Add from Plant Library
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLibraryPicker(false)}
                  title="Close"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search library..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border-0 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {filteredLibrary.map((plant) => {
                  const added = alreadyInGarden(plant.id);
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => !added && addFromLibrary(plant)}
                      disabled={added || addingFromLib === plant.id}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                        added
                          ? "opacity-50 cursor-not-allowed bg-secondary/50"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shrink-0 overflow-hidden">
                        {addingFromLib === plant.id ? (
                          <Loader2
                            size={18}
                            className="animate-spin text-primary"
                          />
                        ) : plant.image_url ? (
                          <img
                            src={plant.image_url}
                            alt={plant.common_name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Leaf className="text-primary/40" size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {plant.common_name}
                        </p>
                        <p className="text-xs text-muted-foreground italic truncate">
                          {plant.latin_name}
                        </p>
                      </div>
                      {added && (
                        <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                          Already added
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredLibrary.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    No plants found in library
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plant Add / Edit Modal */}
      <AnimatePresence>
        {showPlantModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end md:items-center justify-center overflow-y-auto"
            onClick={() => setShowPlantModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg bg-card rounded-t-3xl md:rounded-3xl p-6 space-y-4 garden-shadow-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">
                  {editingPlant ? "Edit Plant" : "Add New Plant"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPlantModal(false)}
                  title="Close"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              <label className="w-full h-32 rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-secondary/80 transition-colors overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Plant preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <>
                    {uploadingImage ? (
                      <Loader2
                        size={24}
                        className="text-muted-foreground animate-spin"
                      />
                    ) : (
                      <Upload size={24} className="text-muted-foreground" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {uploadingImage
                        ? "Uploading image..."
                        : "Upload plant image"}
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    void handleImagePick(e.target.files?.[0] ?? null);
                    e.currentTarget.value = "";
                  }}
                  disabled={uploadingImage || saving}
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => void handleRemoveImage()}
                  disabled={uploadingImage || saving}
                  className="text-xs text-destructive font-medium hover:underline disabled:opacity-60"
                >
                  Remove image
                </button>
              )}

              {[
                {
                  key: "latin_name",
                  label: "Latin name *",
                  placeholder: "e.g. Rosa 'The Generous Gardener'",
                },
                {
                  key: "common_name",
                  label: "Common name",
                  placeholder: "e.g. Climbing Rose",
                },
                {
                  key: "reference",
                  label: "Reference",
                  placeholder: "e.g. Peter Coats 2016",
                },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    {label}
                  </label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary border-0 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Overview
                </label>
                <textarea
                  value={form.overview}
                  onChange={(e) =>
                    setForm({ ...form, overview: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border-0 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none"
                  placeholder="Brief description shown to clients..."
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-foreground mb-3">
                  Seasonal Care
                </p>
                {(["spring", "summer", "autumn", "winter"] as const).map(
                  (s) => (
                    <div key={s} className="mb-3">
                      <label className="block text-xs font-medium text-foreground mb-1 capitalize">
                        {s === "spring"
                          ? "🌱"
                          : s === "summer"
                            ? "☀️"
                            : s === "autumn"
                              ? "🍂"
                              : "❄️"}{" "}
                        {s}
                      </label>
                      <textarea
                        value={form[`${s}_care` as keyof typeof form]}
                        onChange={(e) =>
                          setForm({ ...form, [`${s}_care`]: e.target.value })
                        }
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl bg-secondary border-0 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none"
                        placeholder={`${s} care instructions...`}
                      />
                    </div>
                  ),
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!form.latin_name.trim() || saving || uploadingImage}
                  className="flex-1 pill-button garden-gradient text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingPlant ? "Save Changes" : "Add Plant"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlantModal(false)}
                  className="pill-button bg-secondary text-secondary-foreground text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
