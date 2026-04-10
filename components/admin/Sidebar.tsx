'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, School, Users, MapPin,
  BookOpen, MessageSquare, Settings, UserCog,
  LogOut, DollarSign, Home, Zap, Star
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/colleges', label: 'Colleges', icon: School },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/fees', label: 'Fees', icon: DollarSign },
  { href: '/admin/leads', label: 'CRM / Leads', icon: Users },
  { href: '/admin/locations', label: 'Locations', icon: MapPin },
  { href: '/admin/services', label: 'Services', icon: Star },
  { href: '/admin/chatbot', label: 'Chatbot Q&A', icon: MessageSquare },
  { href: '/admin/quickadd', label: 'Quick Add', icon: Zap },
  { href: '/admin/admins', label: 'Admin Team', icon: UserCog },
  { href: '/admin/homepage', label: 'Homepage', icon: Home },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await axios.delete('/api/auth');
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-green-400">StudyAxis</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm font-medium
              ${pathname === href
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-600 hover:text-white transition w-full text-sm font-medium">
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}