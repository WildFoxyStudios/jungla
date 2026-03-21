'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Building2, Calendar, Store, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { pagesApi } from '@/lib/api-pages';
import { groupApi } from '@/lib/api-groups';

interface Shortcut {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  link: string;
  type: 'page' | 'group' | 'static';
}

export default function Shortcuts() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShortcuts();
  }, []);

  const fetchShortcuts = async () => {
    try {
      setLoading(true);
      const [pages, groups] = await Promise.all([
        pagesApi.getFollowedPages({ limit: 3 }).catch(() => []),
        groupApi.getMyGroups({ limit: 3 }).catch(() => []),
      ]);

      const staticShortcuts: Shortcut[] = [
        {
          id: 'marketplace',
          name: 'Marketplace',
          icon: Store,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          link: '/marketplace',
          type: 'static',
        },
        {
          id: 'events',
          name: 'Eventos',
          icon: Calendar,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          link: '/events',
          type: 'static',
        },
      ];

      const pageShortcuts: Shortcut[] = pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        icon: Building2,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: `/pages/${page.id}`,
        type: 'page' as const,
      }));

      const groupShortcuts: Shortcut[] = groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        link: `/groups/${group.id}`,
        type: 'group' as const,
      }));

      setShortcuts([...staticShortcuts, ...pageShortcuts, ...groupShortcuts]);
    } catch (error) {
      console.error('Error loading shortcuts:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibleShortcuts = showAll ? shortcuts : shortcuts.slice(0, 4);

  if (loading) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 py-1">
          <h2 className="text-gray-500 font-semibold text-sm">Tus accesos directos</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2 animate-pulse">
            <div className="w-9 h-9 rounded-lg bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (shortcuts.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <h2 className="text-gray-500 font-semibold text-sm">Tus accesos directos</h2>
      </div>

      {visibleShortcuts.map((shortcut) => {
        const Icon = shortcut.icon;
        return (
          <Link key={shortcut.id} href={shortcut.link}>
            <Button variant="ghost" className="w-full justify-start gap-3 px-2 py-2 h-auto">
              <div className={`w-9 h-9 rounded-lg ${shortcut.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${shortcut.color}`} />
              </div>
              <span className="text-sm font-medium truncate">{shortcut.name}</span>
            </Button>
          </Link>
        );
      })}

      {shortcuts.length > 4 && (
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-2"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              <ChevronUp className="w-9 h-9 p-2 rounded-lg bg-gray-100 text-gray-600" />
              <span>Ver menos</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-9 h-9 p-2 rounded-lg bg-gray-100 text-gray-600" />
              <span>Ver más</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
