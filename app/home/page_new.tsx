'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Home,
  Users,
  Video,
  Store,
  UserCircle,
  Bell,
  MessageCircle,
  Search,
  Menu,
  LogOut,
  Bookmark,
  Clock,
  TrendingUp,
} from 'lucide-react';
import PostCreator from '@/components/posts/PostCreator';
import PostFeed from '@/components/posts/PostFeed';

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 flex-1">
              <div className="text-blue-600 font-bold text-2xl">f</div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en Facebook"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="px-8 py-6 rounded-lg hover:bg-gray-100">
                <Home className="w-6 h-6" />
              </Button>
              <Button variant="ghost" className="px-8 py-6 rounded-lg hover:bg-gray-100">
                <Users className="w-6 h-6" />
              </Button>
              <Button variant="ghost" className="px-8 py-6 rounded-lg hover:bg-gray-100">
                <Video className="w-6 h-6" />
              </Button>
              <Button variant="ghost" className="px-8 py-6 rounded-lg hover:bg-gray-100">
                <Store className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <Button variant="ghost" size="sm" className="rounded-full bg-gray-100 w-10 h-10 p-0">
                <Menu className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full bg-gray-100 w-10 h-10 p-0">
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full bg-gray-100 w-10 h-10 p-0">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full bg-gray-200 w-10 h-10 p-0">
                <UserCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-14">
        <div className="max-w-7xl mx-auto flex gap-4 px-4 py-4">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-16 space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserCircle className="w-6 h-6" />
                </div>
                <span className="font-medium">{user?.username}</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                <Users className="w-9 h-9 p-2 rounded-lg bg-blue-100 text-blue-600" />
                <span>Amigos</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                <Clock className="w-9 h-9 p-2 rounded-lg bg-blue-100 text-blue-600" />
                <span>Recuerdos</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                <Bookmark className="w-9 h-9 p-2 rounded-lg bg-purple-100 text-purple-600" />
                <span>Guardado</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                <TrendingUp className="w-9 h-9 p-2 rounded-lg bg-green-100 text-green-600" />
                <span>Más reciente</span>
              </Button>
              <hr className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-2 text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          </aside>

          <main className="flex-1 max-w-2xl mx-auto">
            <PostCreator />
            <PostFeed />
          </main>

          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-16">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-3">Contactos</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <span className="text-sm">Contacto 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gray-200" />
                    <span className="text-sm">Contacto 2</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
