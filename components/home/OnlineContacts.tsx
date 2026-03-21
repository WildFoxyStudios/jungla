'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Search, MoreHorizontal } from 'lucide-react';
import { friendsApi, Friend } from '@/lib/api-friends';
import { useRouter } from 'next/navigation';

interface ContactWithStatus extends Friend {
  is_online?: boolean;
  last_seen?: string;
}

export default function OnlineContacts() {
  const [contacts, setContacts] = useState<ContactWithStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const friends = await friendsApi.getFriends({ limit: 50 });
      const contactsWithStatus = friends
        .filter(f => f.friendship_status === 'accepted')
        .map(f => ({
          ...f,
          is_online: Math.random() > 0.5,
          last_seen: Math.random() > 0.5 ? undefined : `${Math.floor(Math.random() * 60)} min`,
        }));
      setContacts(contactsWithStatus);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedContacts = filteredContacts.sort((a, b) => {
    if (a.is_online && !b.is_online) return -1;
    if (!a.is_online && b.is_online) return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="sticky top-16">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="font-semibold text-gray-700">Contactos</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-16">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="font-semibold text-gray-700">Contactos</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full w-8 h-8 p-0"
            onClick={() => router.push('/video-call')}
          >
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

      {sortedContacts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No hay contactos</p>
      ) : (
        <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
          {sortedContacts.map((contact) => (
            <Button
              key={contact.id}
              variant="ghost"
              className="w-full justify-start gap-3 px-2 py-2 h-auto relative group"
              onClick={() => router.push(`/messages?user=${contact.id}`)}
            >
              <div className="relative flex-shrink-0">
                {contact.profile_picture_url ? (
                  <img
                    src={contact.profile_picture_url}
                    alt={contact.full_name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {contact.full_name[0]}
                  </div>
                )}
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
      )}
    </div>
  );
}
