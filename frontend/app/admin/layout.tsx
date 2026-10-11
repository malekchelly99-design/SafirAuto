'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Car, Tag, Users, MessageSquare,
  Settings, LogOut, Bell, Search, Menu, X, 
  ChevronRight, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/Spinner';
import { messagesApi } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/vehicules', label: 'Véhicules', icon: Car },
  { href: '/admin/marques', label: 'Marques', icon: Tag },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/connexion');
  }, [loading, isAdmin, router]);

  // Fetch unread messages count
  useEffect(() => {
    if (isAdmin) {
      messagesApi.list().then(messages => {
        const count = messages.filter(m => !m.read).length;
        setUnreadCount(count);
      }).catch(() => setUnreadCount(0));
    }
  }, [isAdmin]);

  if (loading) return <PageLoader />;
  if (!isAdmin) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#1c2026] flex">
      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-62 bg-[#1a1d23] border-r border-white/10 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ width: '240px' }}>
        
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-300 transition-colors">
              <span className="text-gray-950 font-black text-base">S</span>
            </div>
            <div>
              <span className="text-white font-black tracking-wider text-sm uppercase block leading-tight">Sadir Auto</span>
              <span className="text-yellow-600 text-[9px] tracking-widest uppercase font-medium">Administration</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-gray-400 hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase px-3 mb-3">Principal</p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive(href, exact)
                  ? 'bg-yellow-400/15 text-yellow-700 border-l-2 border-yellow-500'
                  : 'text-gray-500 hover:text-white hover:bg-[#1c2026]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {href === '/admin/messages' && unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-black rounded-full min-w-[1.25rem] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {isActive(href, exact) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}

          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase px-3 mb-3">Système</p>
            <Link
              href="/admin/parametres"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive('/admin/parametres')
                  ? 'bg-yellow-400/15 text-yellow-700 border-l-2 border-yellow-500'
                  : 'text-gray-500 hover:text-white hover:bg-[#1c2026]'
              }`}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Paramètres
            </Link>
            <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-white hover:bg-[#1c2026] transition-all">
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              Voir le site
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1c2026]">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-950 text-xs font-black">{user?.first_name?.[0] || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user?.first_name || user?.username}</p>
              <p className="text-gray-400 text-[10px] truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-[#eab308] transition-colors" title="Déconnexion">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-[#1a1d23] border-b border-white/10 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-[#1c2026] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification bell */}
            <button className="relative p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-[#23272e] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            </button>

            {/* User badge */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-gray-950 text-xs font-black">{user?.first_name?.[0] || 'A'}</span>
              </div>
              <span className="text-gray-200 text-sm font-semibold">{user?.first_name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-[#1c2026]">
          {children}
        </main>
      </div>
    </div>
  );
}

