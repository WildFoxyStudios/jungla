'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, MessageSquare, Bell, Store, 
  Calendar, Radio, Settings, Search 
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/friends', icon: Users, label: 'Amigos' },
    { href: '/messages', icon: MessageSquare, label: 'Mensajes' },
    { href: '/marketplace', icon: Store, label: 'Marketplace' },
    { href: '/events', icon: Calendar, label: 'Eventos' },
    { href: '/live', icon: Radio, label: 'En Vivo' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden md:block">
                FaceBook Clone
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en Facebook Clone"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-6 h-6" />
                </Link>
              );
            })}

            {/* Notification Bell */}
            <NotificationBell />

            {/* Settings */}
            <Link
              href="/settings"
              className={`p-2 rounded-full transition ${
                pathname === '/settings'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Configuración"
            >
              <Settings className="w-6 h-6" />
            </Link>

            {/* Profile Avatar */}
            <Link
              href="/profile/me"
              className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition"
            >
              <span className="text-gray-700 font-semibold">U</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
