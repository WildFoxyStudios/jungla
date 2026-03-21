'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Building2, Calendar, Store, Gamepad2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Shortcut {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  link: string;
  type: 'page' | 'group' | 'game' | 'event' | 'marketplace';
}

export default function Shortcuts() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const mockShortcuts: Shortcut[] = [
      {
        id: '1',
        name: 'Emprendedores Unidos',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        link: '/groups/1',
        type: 'group',
      },
      {
        id: '2',
        name: 'Tecnología & Innovación',
        icon: Building2,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        link: '/pages/1',
        type: 'page',
      },
      {
        id: '3',
        name: 'Marketplace',
        icon: Store,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        link: '/marketplace',
        type: 'marketplace',
      },
      {
        id: '4',
        name: 'Gaming Zone',
        icon: Gamepad2,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        link: '/games',
        type: 'game',
      },
      {
        id: '5',
        name: 'Eventos Locales',
        icon: Calendar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        link: '/events',
        type: 'event',
      },
      {
        id: '6',
        name: 'Desarrolladores JS',
        icon: Users,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        link: '/groups/2',
        type: 'group',
      },
    ];
    setShortcuts(mockShortcuts);
  }, []);

  const visibleShortcuts = showAll ? shortcuts : shortcuts.slice(0, 4);

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
