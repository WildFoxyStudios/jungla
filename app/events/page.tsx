'use client';

import { useState, useEffect } from 'react';
import { eventApi, type Event } from '@/lib/api-events';
import { Calendar, MapPin, Clock, Users, Plus } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await eventApi.getUserEvents(token);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'interested' | 'not_going') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await eventApi.rsvpEvent(eventId, status, token);
      await loadEvents();
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const now = new Date();
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return filter === 'upcoming' ? eventDate >= now : eventDate < now;
  });

  if (loading) {
    return <div className="p-8 text-center">Cargando eventos...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Crear evento
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setFilter('upcoming')}
            className={`flex-1 px-6 py-4 font-semibold ${
              filter === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`flex-1 px-6 py-4 font-semibold ${
              filter === 'past'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pasados
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay eventos {filter === 'upcoming' ? 'próximos' : 'pasados'}</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              {event.cover_photo_url && (
                <img
                  src={event.cover_photo_url}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(event.start_time).toLocaleString('es-ES', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {event.attendee_count || 0} personas interesadas
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRSVP(event.id, 'going')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Asistiré
                  </button>
                  <button
                    onClick={() => handleRSVP(event.id, 'interested')}
                    className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Me interesa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
