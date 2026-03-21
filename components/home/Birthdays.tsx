'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cake } from 'lucide-react';

interface Birthday {
  id: string;
  username: string;
  full_name: string;
  is_today: boolean;
}

export default function Birthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    const mockBirthdays: Birthday[] = [
      {
        id: '1',
        username: 'carlos.ruiz',
        full_name: 'Carlos Ruiz',
        is_today: true,
      },
      {
        id: '2',
        username: 'sofia.martinez',
        full_name: 'Sofía Martínez',
        is_today: true,
      },
    ];
    setBirthdays(mockBirthdays);
  };

  if (birthdays.length === 0) return null;

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Cake className="w-6 h-6 text-blue-600" />
        <h3 className="font-semibold text-gray-700">Cumpleaños</h3>
      </div>
      <div className="space-y-2">
        {birthdays.map((birthday) => (
          <p key={birthday.id} className="text-sm">
            Hoy es el cumpleaños de{' '}
            <span className="font-semibold">{birthday.full_name}</span>
          </p>
        ))}
      </div>
    </Card>
  );
}
