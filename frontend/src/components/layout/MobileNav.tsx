import { Home, Leaf, MessageCircle, Bell, Menu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/plants', icon: Leaf, label: 'Plants' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/more', icon: Menu, label: 'More' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around py-2.5">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative min-w-[44px] min-h-[44px] justify-center">
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-2.5 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon
                size={22}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
