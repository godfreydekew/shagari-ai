import { Home, Leaf, MessageCircle, Settings, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const clientNav = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/plants', icon: Leaf, label: 'My Plants' },
  { to: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { to: '/booklet', icon: Home, label: 'Handbook' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: Home, label: 'Gardens', exact: true },
  { to: '/admin/plants', icon: Leaf, label: 'Plant Library' },
  { to: '/admin/chat', icon: MessageCircle, label: 'AI Chat' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function DesktopSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const items = isAdminRoute ? adminNav : clientNav;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl garden-gradient flex items-center justify-center">
            <Leaf className="text-primary-foreground" size={18} />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground leading-tight">Shagari Garden Management</h1>
            <p className="text-[10px] text-muted-foreground tracking-wide">{isAdminRoute ? 'Admin Panel' : 'Your garden companion'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const active = item.to === '/admin'
            ? location.pathname === '/admin' || location.pathname.startsWith('/admin/gardens')
            : location.pathname.startsWith(item.to);

          return (
            <NavLink key={item.to} to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                active ? 'text-primary bg-secondary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}>
              {active && (
                <motion.div layoutId="sidebar-indicator"
                  className="absolute left-0 w-1 h-6 rounded-r-full bg-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
              )}
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full garden-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
