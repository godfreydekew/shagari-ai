import { Link } from 'react-router-dom';
import { BookOpen, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const moreItems = [
  { to: '/booklet', icon: BookOpen, label: 'My Garden Handbook', desc: 'View your personalised plant guide' },
  { to: '/profile', icon: Settings, label: 'Profile & Settings', desc: 'Account, notifications, and more' },
];

export default function MorePage() {
  return (
    <div className="page-enter max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <h1 className="text-2xl font-display font-bold text-foreground">More</h1>
      <div className="space-y-3">
        {moreItems.map((item, i) => (
          <Link key={item.to} to={item.to}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-botanical-interactive p-5 flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="text-primary" size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="text-muted-foreground/40" size={18} />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
