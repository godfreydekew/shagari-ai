import { useAuth } from "@/contexts/AuthContext";
import { updateMeApi, updatePasswordApi, deleteMeApi } from "@/lib/api/auth";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Bell,
  LogOut,
  Lock,
  Trash2,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  // Change password
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      await updateMeApi({ full_name: newName.trim() });
      await refreshUser();
      setEditingName(false);
      toast.success("Name updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPw(true);
    try {
      await updatePasswordApi(currentPw, newPw);
      toast.success("Password updated");
      setShowPwForm(false);
      setCurrentPw("");
      setNewPw("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMeApi();
      toast.success("Account deleted");
      logout();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete account");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">
        Profile & Settings
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-botanical p-6 text-center"
      >
        <div className="w-16 h-16 rounded-full garden-gradient flex items-center justify-center mx-auto mb-3 text-2xl text-primary-foreground font-bold font-display">
          {user?.name.charAt(0)}
        </div>
        {editingName ? (
          <div className="flex items-center justify-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <button
              onClick={handleSaveName}
              disabled={savingName}
              className="text-primary hover:text-primary/80"
            >
              {savingName ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
            </button>
            <button
              onClick={() => {
                setEditingName(false);
                setNewName(user?.name || "");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {user?.name}
            </h2>
            <button
              onClick={() => setEditingName(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
      </motion.div>

      <div className="space-y-3">
        <div className="card-botanical p-4 flex items-center gap-3">
          <Mail size={18} className="text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </div>

        {user?.address && (
          <div className="card-botanical p-4 flex items-center gap-3">
            <MapPin size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium text-foreground">
                {user.address}
              </p>
            </div>
          </div>
        )}

        <div className="card-botanical p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Reminders</p>
              <p className="text-sm font-medium text-foreground">
                Push notifications
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full relative transition-colors ${notifications ? "bg-primary" : "bg-border"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${notifications ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card-botanical p-4">
        <button
          onClick={() => setShowPwForm(!showPwForm)}
          className="flex items-center gap-3 text-sm font-medium text-foreground w-full"
        >
          <Lock size={18} className="text-primary" />
          Change Password
        </button>
        {showPwForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleChangePassword}
            className="mt-4 space-y-3"
          >
            <input
              type="password"
              placeholder="Current password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border-0 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border-0 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <button
              type="submit"
              disabled={savingPw}
              className="pill-button garden-gradient text-primary-foreground font-semibold text-sm w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingPw && <Loader2 size={16} className="animate-spin" />}{" "}
              Update Password
            </button>
          </motion.form>
        )}
      </div>

      {/* Delete Account */}
      <div className="card-botanical p-4 border border-destructive/20">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-3 text-sm font-medium text-destructive w-full"
          >
            <Trash2 size={18} /> Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-destructive font-medium">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="pill-button bg-destructive text-destructive-foreground text-sm font-medium flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}{" "}
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="pill-button bg-secondary text-secondary-foreground text-sm font-medium flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Shagari Garden Management v1.0.0
        </p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-destructive font-medium"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
