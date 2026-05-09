'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, School, Users, MapPin,
  BookOpen, MessageSquare, Settings, UserCog,
  LogOut, DollarSign, Home, Zap, Star,
  Building2, Image, FileText, Tags, GraduationCap,
  ChevronLeft, ChevronRight, Menu, Sparkles,
  Bell, Newspaper, HelpCircle, Award, MessageCircle,
  ClipboardList,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface AdminPayload {
  role?: string;
  detailedPermissions?: Record<string, boolean>;
}

const allLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { href: '/admin/colleges', label: 'Colleges', icon: School, permission: 'colleges' },
  { href: '/admin/campuses', label: 'Campuses', icon: Building2, permission: 'campuses' },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, permission: 'courses' },
  { href: '/admin/fees', label: 'Fees', icon: DollarSign, permission: 'fees' },
  { href: '/admin/categories', label: 'Categories', icon: Tags, permission: 'categories' },
  { href: '/admin/media', label: 'Media', icon: Image, permission: 'media' },
  { href: '/admin/brochures', label: 'Brochures', icon: FileText, permission: 'brochures' },
  { href: '/admin/leads', label: 'CRM / Leads', icon: Users, permission: 'leads' },
  { href: '/admin/applications', label: 'Applications', icon: ClipboardList, permission: null },
  { href: '/admin/locations', label: 'Locations', icon: MapPin, permission: 'locations' },
  { href: '/admin/services', label: 'Services', icon: Star, permission: null },
  { href: '/admin/chatbot', label: 'Chatbot Q&A', icon: MessageSquare, permission: 'chatbot' },
  { href: '/admin/notices', label: 'Notice Board', icon: Bell, permission: null },
  { href: '/admin/blog', label: 'Blog / News', icon: Newspaper, permission: null },
  { href: '/admin/faqs', label: 'FAQ', icon: HelpCircle, permission: null },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageCircle, permission: null },
  { href: '/admin/scholarships', label: 'Scholarships', icon: Award, permission: null },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star, permission: null },
  { href: '/admin/quickadd', label: 'Quick Add', icon: Zap, permission: null },
  { href: '/admin/ocr', label: 'AI Scanner', icon: Sparkles, permission: null },
  { href: '/admin/student-records', label: 'Students', icon: GraduationCap, permission: 'studentRecords', superadminOnly: true },
  { href: '/admin/admins', label: 'Admin Team', icon: UserCog, permission: 'admins', superadminOnly: true },
  { href: '/admin/homepage', label: 'Homepage', icon: Home, permission: null },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [adminPayload, setAdminPayload] = useState<AdminPayload>({});

  useEffect(() => {
    setMounted(true);

    // Read collapse state
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') setCollapsed(true);

    // Decode JWT to get role/permissions
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminPayload(payload);
      } catch {}
    }
  }, []);

  if (!mounted) return <aside className="w-64 min-h-screen bg-gray-900" />;

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  };

  const handleLogout = async () => {
    await axios.delete('/api/auth');
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const isSuperAdmin = adminPayload.role === 'superadmin';

  const visibleLinks = allLinks.filter((link) => {
    // Superadmin sees everything
    if (isSuperAdmin) return true;
    // Hide superadmin-only links from non-superadmins
    if (link.superadminOnly) return false;
    // No specific permission required
    if (!link.permission) return true;
    // Check detailed permissions
    return adminPayload.detailedPermissions?.[link.permission] !== false;
  });

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} min-h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 shrink-0 relative`}>
      {/* Header */}
      <div className={`${collapsed ? 'px-3' : 'px-6'} py-5 border-b border-gray-700/50 flex items-center gap-3`}>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-green-400 tracking-tight">StudyAxis</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {visibleLinks.map(({ href, label, icon: Icon, superadminOnly }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl transition-all text-sm font-medium group
                ${isActive
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <Icon size={18} className={`shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {!collapsed && (
                <span className="truncate flex-1">{label}</span>
              )}
              {!collapsed && superadminOnly && (
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">SA</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-700/50">
        <button onClick={handleLogout}
          className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-3 rounded-xl text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition w-full text-sm font-medium`}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}