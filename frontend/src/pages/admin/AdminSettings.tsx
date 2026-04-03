import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Bell, LogOut, Lock } from 'lucide-react';
import { useState } from 'react';

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-botanical p-6 text-center">
        <div className="w-16 h-16 rounded-full garden-gradient flex items-center justify-center mx-auto mb-3 text-2xl text-primary-foreground font-bold font-display">
          {user?.name.charAt(0)}
        </div>
        <h2 className="text-lg font-display font-semibold text-foreground">{user?.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        <p className="text-xs text-primary mt-2 font-medium">Administrator</p>
      </motion.div>

      <div className="space-y-3">
        <div className="card-botanical p-4 flex items-center gap-3">
          <Mail size={18} className="text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="card-botanical p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Notifications</p>
              <p className="text-sm font-medium text-foreground">Push notifications</p>
            </div>
          </div>
          <button onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full relative transition-colors ${notifications ? 'bg-primary' : 'bg-border'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${notifications ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Shagari Garden Management v1.0.0</p>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-destructive font-medium">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
