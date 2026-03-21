'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Search, MoreHorizontal } from 'lucide-react';

interface Contact {
  id: string;
  username: string;
  full_name: string;
  is_online: boolean;
  last_seen?: string;
}

export default function OnlineContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(() => {
      setContacts(prev => prev.map(c => ({
        ...c,
        is_online: Math.random() > 0.3,
      })));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchContacts = async () => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        username: 'laura.sanchez',
        full_name: 'Laura Sánchez',
        is_online: true,
      },
      {
        id: '2',
        username: 'diego.torres',
        full_name: 'Diego Torres',
        is_online: true,
      },
      {
        id: '3',
        username: 'paula.rivera',
        full_name: 'Paula Rivera',
        is_online: false,
        last_seen: '5 min',
      },
      {
        id: '4',
        username: 'miguel.castro',
        full_name: 'Miguel Castro',
        is_online: true,
      },
      {
        id: '5',
        username: 'carla.mendez',
        full_name: 'Carla Méndez',
        is_online: false,
        last_seen: '1 h',
      },
      {
        id: '6',
        username: 'roberto.diaz',
        full_name: 'Roberto Díaz',
        is_online: true,
      },
      {
        id: '7',
        username: 'isabel.moreno',
        full_name: 'Isabel Moreno',
        is_online: true,
      },
      {
        id: '8',
        username: 'fernando.vega',
        full_name: 'Fernando Vega',
        is_online: false,
        last_seen: '2 h',
      },
    ];
    setContacts(mockContacts);
  };

  const filteredContacts = contacts.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sticky top-16">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="font-semibold text-gray-700">Contactos</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <Video className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <Search className="w-4 h-4 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredContacts.map((contact) => (
          <Button
            key={contact.id}
            variant="ghost"
            className="w-full justify-start gap-3 px-2 py-2 h-auto relative group"
          >
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
              {contact.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{contact.full_name}</p>
              {!contact.is_online && contact.last_seen && (
                <p className="text-xs text-gray-500">{contact.last_seen}</p>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
