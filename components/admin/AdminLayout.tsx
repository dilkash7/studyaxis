'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.localStorage.removeItem('token');
        router.push('/admin/login');
        return;
      }
      try {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok && !cancelled) {
          localStorage.removeItem('token');
          router.push('/admin/login');
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('token');
          router.push('/admin/login');
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [router, pathname]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full animate-in slide-in-from-left duration-300">
            <Sidebar />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-48px] w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 relative z-30">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <TopBar title={title} />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}