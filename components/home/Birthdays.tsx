'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cake } from 'lucide-react';
import { friendsApi } from '@/lib/api-friends';
import Link from 'next/link';

interface Birthday {
  id: string;
  username: string;
  full_name: string;
  birth_date?: string;
  is_today: boolean;
}

export default function Birthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      const friends = await friendsApi.getFriends({ limit: 100 });
      
      const today = new Date();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
      
      const birthdaysToday = friends
        .filter(friend => {
          if (!friend.full_name) return false;
          const birthDate = new Date();
          return birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDay;
        })
        .map(friend => ({
          id: friend.id,
          username: friend.username,
          full_name: friend.full_name,
          is_today: true,
        }));
      
      setBirthdays(birthdaysToday);
    } catch (error) {
      console.error('Error loading birthdays:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Cake className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-gray-700">Cumpleaños</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </Card>
    );
  }

  if (birthdays.length === 0) return null;

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Cake className="w-6 h-6 text-blue-600" />
        <h3 className="font-semibold text-gray-700">Cumpleaños</h3>
      </div>
      <div className="space-y-2">
        {birthdays.map((birthday) => (
          <Link key={birthday.id} href={`/profile/${birthday.id}`}>
            <p className="text-sm hover:underline cursor-pointer">
              Hoy es el cumpleaños de{' '}
              <span className="font-semibold">{birthday.full_name}</span>
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
