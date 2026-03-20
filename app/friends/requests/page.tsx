'use client';

import { useEffect, useState } from 'react';
import { friendsApi, Friend } from '@/lib/api-friends';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, X, Check } from 'lucide-react';
import Link from 'next/link';

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await friendsApi.getFriendRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      await friendsApi.acceptRequest(friendshipId);
      setRequests(requests.filter((r) => r.friendship_id !== friendshipId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      await friendsApi.rejectRequest(friendshipId);
      setRequests(requests.filter((r) => r.friendship_id !== friendshipId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Solicitudes de amistad</h1>

          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No tienes solicitudes pendientes</p>
              <Link href="/friends/suggestions">
                <Button className="mt-4">Ver sugerencias</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.friendship_id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {request.profile_picture_url ? (
                      <img
                        src={request.profile_picture_url}
                        alt={request.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-600">
                        {request.full_name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link href={`/profile/${request.id}`}>
                      <h3 className="font-semibold text-lg hover:underline">{request.full_name}</h3>
                    </Link>
                    <p className="text-gray-600">@{request.username}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAccept(request.friendship_id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aceptar
                    </Button>
                    <Button
                      onClick={() => handleReject(request.friendship_id)}
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
