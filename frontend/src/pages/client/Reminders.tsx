import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Scissors, Sprout, Bell, Trash2, RotateCcw, Plus, X } from 'lucide-react';

type ReminderType = 'watering' | 'pruning' | 'feeding' | 'general';

interface Reminder {
  id: string;
  title: string;
  plantName: string;
  type: ReminderType;
  date: string;
  time: string;
  repeat: 'once' | 'weekly' | 'monthly';
  completed: boolean;
}

const typeIcons: Record<ReminderType, typeof Droplets> = {
  watering: Droplets, pruning: Scissors, feeding: Sprout, general: Bell,
};

const typeEmoji: Record<ReminderType, string> = {
  watering: '💧', pruning: '✂️', feeding: '🌱', general: '🍂',
};

export default function Reminders() {
  const [rems, setRems] = useState<Reminder[]>([]);
  const [view, setView] = useState<'upcoming' | 'completed'>('upcoming');
  const [showAdd, setShowAdd] = useState(false);

  const upcoming = rems.filter(r => !r.completed);
  const completed = rems.filter(r => r.completed);

  const toggleComplete = (id: string) => {
    setRems(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setRems(prev => prev.filter(r => r.id !== id));
  };

  const items = view === 'upcoming' ? upcoming : completed;

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">My Reminders</h1>
        <button type="button" onClick={() => setShowAdd(true)}
          className="pill-button garden-gradient text-primary-foreground text-sm font-medium flex items-center gap-1.5">
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex gap-1 bg-card rounded-xl p-1 garden-shadow">
        {(['upcoming', 'completed'] as const).map(v => (
          <button type="button" key={v} onClick={() => setView(v)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
              view === v ? 'garden-gradient text-primary-foreground' : 'text-muted-foreground'
            }`}>
            {v} ({v === 'upcoming' ? upcoming.length : completed.length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {items.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Bell className="mx-auto text-muted-foreground/20 mb-4" size={48} />
              <p className="text-sm text-muted-foreground">
                {view === 'upcoming' ? 'No upcoming reminders' : 'No completed reminders yet'}
              </p>
            </motion.div>
          )}
          {items.map((rem, i) => {
            const Icon = typeIcons[rem.type];
            return (
              <motion.div key={rem.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.04 }}
                className={`card-botanical p-4 flex items-center gap-3 ${rem.completed ? 'opacity-60' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-foreground ${rem.completed ? 'line-through' : ''}`}>{rem.title}</p>
                  <p className="text-xs text-muted-foreground">{rem.plantName} · {rem.date} at {rem.time}</p>
                  {rem.repeat !== 'once' && <span className="text-[10px] text-primary font-medium capitalize">{rem.repeat}</span>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => toggleComplete(rem.id)} title={rem.completed ? 'Mark incomplete' : 'Mark complete'}
                    className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                    {rem.completed ? <RotateCcw size={14} /> : <span className="text-xs">✓</span>}
                  </button>
                  <button type="button" onClick={() => deleteReminder(rem.id)} title="Delete reminder"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="w-full max-w-md bg-card rounded-t-3xl md:rounded-3xl p-6 space-y-4 garden-shadow-lg"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">New Reminder</h3>
                <button type="button" onClick={() => setShowAdd(false)} title="Close">
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
              <input placeholder="Reminder title"
                className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" title="Reminder date"
                  className="px-4 py-3 rounded-xl bg-secondary border-0 text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
                <input type="time" title="Reminder time"
                  className="px-4 py-3 rounded-xl bg-secondary border-0 text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none" />
              </div>
              <div className="flex gap-2">
                {(['watering', 'pruning', 'feeding', 'general'] as ReminderType[]).map(t => (
                  <button type="button" key={t}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-xs font-medium text-foreground capitalize hover:bg-primary hover:text-primary-foreground transition-colors">
                    {typeEmoji[t]} {t}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setShowAdd(false)}
                className="w-full pill-button garden-gradient text-primary-foreground font-semibold text-sm">
                Save Reminder
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
