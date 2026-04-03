import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Leaf,
  Copy,
  Trash2,
  Settings,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  createGardenApi,
  deleteGardenApi,
  getGardensApi,
} from "@/lib/api/gardens";
import { getApiError } from "@/lib/apiClient";
import type { GardenWithOwner } from "@/lib/api/types";

export default function AdminDashboard() {
  const [gardens, setGardens] = useState<GardenWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGardenName, setNewGardenName] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadGardens();
  }, []);

  async function loadGardens() {
    try {
      const data = await getGardensApi();
      setGardens(data);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newGardenName.trim()) return;
    setCreating(true);
    try {
      const garden = await createGardenApi(newGardenName.trim());
      // Reload to get full GardenWithOwner shape
      const updated = await getGardensApi();
      setGardens(updated);
      setNewGardenName("");
      setShowCreate(false);
      toast.success(`Garden created — ID: ${garden.garden_code}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteGardenApi(id);
      setGardens((prev) => prev.filter((g) => g.id !== id));
      setConfirmDelete(null);
      toast.success("Garden deleted");
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setDeleting(null);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Garden ID copied!");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Gardens
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="pill-button garden-gradient text-primary-foreground text-sm font-medium flex items-center gap-1.5"
        >
          <Plus size={16} /> Create Garden
        </button>
      </div>

      <div className="space-y-3">
        {gardens.map((garden, i) => (
          <motion.div
            key={garden.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-botanical p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {garden.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm text-primary font-semibold">
                    {garden.garden_code}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(garden.garden_code)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy Garden ID"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                <Leaf size={12} className="inline mr-1" />
                {garden.plant_count} plants
              </span>
            </div>

            {/* Owner */}
            <div className="mb-4">
              {garden.owner_name ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full garden-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
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
                  No owner yet
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link
                to={`/admin/gardens/${garden.id}`}
                className="pill-button bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
              >
                <Settings size={14} /> Manage Garden
              </Link>
              <Link
                to={`/admin/gardens/${garden.id}/booklet`}
                className="pill-button bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
              >
                <FileText size={14} /> Handbook
              </Link>
              {confirmDelete === garden.id ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(garden.id)}
                    disabled={deleting === garden.id}
                    className="pill-button bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-60"
                  >
                    {deleting === garden.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="pill-button bg-secondary text-secondary-foreground text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(garden.id)}
                  className="pill-button text-muted-foreground text-sm font-medium flex items-center gap-1.5 hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gardens.length === 0 && (
        <div className="text-center py-20">
          <Leaf className="mx-auto text-muted-foreground/20 mb-4" size={56} />
          <p className="text-muted-foreground mb-2">No gardens yet</p>
          <p className="text-sm text-muted-foreground/70">
            Create your first garden to get started
          </p>
        </div>
      )}

      {/* Create Garden Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md bg-card rounded-t-3xl md:rounded-3xl p-6 space-y-4 garden-shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">
                  Create Garden
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  title="Close"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Garden Name
                </label>
                <input
                  value={newGardenName}
                  onChange={(e) => setNewGardenName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. The Rose Cottage Garden"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                A unique Garden ID (GK-XXXX) will be generated automatically.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newGardenName.trim() || creating}
                className="w-full pill-button garden-gradient text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                Create Garden
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
