'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, MapPin, Navigation } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
  hourly: { time: string; temp: number; icon: string }[];
  daily: { day: string; high: number; low: number; icon: string; condition: string }[];
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Ciudad de México');

  useEffect(() => {
    loadWeather();
  }, [location]);

  const loadWeather = async () => {
    try {
      setLoading(true);
      // Mock weather data - in production this would call a weather API
      const mockWeather: WeatherData = {
        location,
        temperature: 24,
        condition: 'Parcialmente nublado',
        humidity: 65,
        windSpeed: 12,
        visibility: 10,
        feelsLike: 26,
        hourly: [
          { time: 'Ahora', temp: 24, icon: 'cloud' },
          { time: '14:00', temp: 26, icon: 'sun' },
          { time: '15:00', temp: 27, icon: 'sun' },
          { time: '16:00', temp: 26, icon: 'cloud' },
          { time: '17:00', temp: 24, icon: 'cloud' },
          { time: '18:00', temp: 22, icon: 'cloud' },
        ],
        daily: [
          { day: 'Hoy', high: 27, low: 18, icon: 'cloud', condition: 'Parcialmente nublado' },
          { day: 'Mañana', high: 28, low: 19, icon: 'sun', condition: 'Soleado' },
          { day: 'Miércoles', high: 26, low: 17, icon: 'rain', condition: 'Lluvia ligera' },
          { day: 'Jueves', high: 25, low: 16, icon: 'cloud', condition: 'Nublado' },
          { day: 'Viernes', high: 27, low: 18, icon: 'sun', condition: 'Soleado' },
        ],
      };
      
      setWeather(mockWeather);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (icon: string, className: string = 'w-6 h-6') => {
    switch (icon) {
      case 'sun': return <Sun className={`${className} text-yellow-500`} />;
      case 'cloud': return <Cloud className={`${className} text-gray-500`} />;
      case 'rain': return <CloudRain className={`${className} text-blue-500`} />;
      case 'snow': return <CloudSnow className={`${className} text-blue-300`} />;
      default: return <Sun className={`${className} text-yellow-500`} />;
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-sm">{weather.location}</span>
        </div>
        <button className="text-gray-500 hover:text-blue-600">
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {getWeatherIcon('cloud', 'w-12 h-12')}
          <div>
            <div className="text-3xl font-bold">{weather.temperature}°</div>
            <div className="text-sm text-gray-600">{weather.condition}</div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div>Sensación térmica</div>
          <div className="font-semibold">{weather.feelsLike}°</div>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="flex justify-between mb-4 overflow-x-auto">
        {weather.hourly.map((hour, idx) => (
          <div key={idx} className="text-center min-w-[50px]">
            <div className="text-xs text-gray-500 mb-1">{hour.time}</div>
            {getWeatherIcon(hour.icon, 'w-6 h-6 mx-auto')}
            <div className="text-sm font-semibold mt-1">{hour.temp}°</div>
          </div>
        ))}
      </div>

      {/* Daily Forecast */}
      <div className="space-y-2 mb-4">
        {weather.daily.slice(1, 4).map((day, idx) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <span className="text-sm w-20">{day.day}</span>
            {getWeatherIcon(day.icon, 'w-5 h-5')}
            <span className="text-sm text-gray-600 flex-1 mx-3">{day.condition}</span>
            <div className="text-sm">
              <span className="font-semibold">{day.high}°</span>
              <span className="text-gray-500 ml-2">{day.low}°</span>
            </div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
        <div className="text-center">
          <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
          <div className="text-xs text-gray-500">Humedad</div>
          <div className="text-sm font-semibold">{weather.humidity}%</div>
        </div>
        <div className="text-center">
          <Wind className="w-4 h-4 mx-auto text-gray-500 mb-1" />
          <div className="text-xs text-gray-500">Viento</div>
          <div className="text-sm font-semibold">{weather.windSpeed} km/h</div>
        </div>
        <div className="text-center">
          <Eye className="w-4 h-4 mx-auto text-gray-500 mb-1" />
          <div className="text-xs text-gray-500">Visibilidad</div>
          <div className="text-sm font-semibold">{weather.visibility} km</div>
        </div>
      </div>
    </Card>
  );
}
