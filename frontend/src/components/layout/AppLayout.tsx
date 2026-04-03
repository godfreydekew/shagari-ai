import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import MobileNav from './MobileNav';
import AdminMobileNav from './AdminMobileNav';
import DesktopSidebar from './DesktopSidebar';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ROUTES = ['/', '/login'];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show spinner while token is being validated on first load
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Not logged in — public routes render without chrome, protected routes redirect
  if (!user) {
    if (PUBLIC_ROUTES.includes(location.pathname)) {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="print:hidden">
        <DesktopSidebar />
      </div>
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <div className="print:hidden">
        {isAdminRoute ? <AdminMobileNav /> : <MobileNav />}
      </div>
    </div>
  );
}
