import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '@/lib/api';
import { Leaf, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/sonner';
import botanicalHero from '@/assets/botanical-hero.jpg';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      toast.success('Password reset successfully. Please sign in.');
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img src={botanicalHero} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="card-botanical p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl garden-gradient flex items-center justify-center mb-4 garden-shadow-lg">
              <Leaf className="text-primary-foreground" size={28} />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your new password</p>
          </div>

          {!token ? (
            <p className="text-sm text-destructive text-center">Invalid reset link. Please request a new one.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all pr-12"
                    placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full pill-button garden-gradient text-primary-foreground font-semibold text-sm garden-shadow-lg hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Reset Password
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
