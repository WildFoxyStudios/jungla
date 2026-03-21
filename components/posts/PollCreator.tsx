'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Plus, Clock } from 'lucide-react';

interface PollCreatorProps {
  onCancel: () => void;
  onSave: (pollData: PollData) => void;
}

export interface PollData {
  question: string;
  options: string[];
  allows_multiple_answers: boolean;
  duration_hours?: number;
}

export default function PollCreator({ onCancel, onSave }: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowsMultiple, setAllowsMultiple] = useState(false);
  const [duration, setDuration] = useState<number | undefined>(24);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const validOptions = options.filter(o => o.trim().length > 0);
    if (question.trim().length === 0 || validOptions.length < 2) {
      alert('Por favor completa la pregunta y al menos 2 opciones');
      return;
    }

    onSave({
      question: question.trim(),
      options: validOptions,
      allows_multiple_answers: allowsMultiple,
      duration_hours: duration,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Crear encuesta</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Question */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Pregunta
        </label>
        <Input
          placeholder="¿Cuál es tu pregunta?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
        />
      </div>

      {/* Options */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Opciones
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder={`Opción ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                maxLength={100}
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {options.length < 10 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={addOption}
            className="mt-2 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Agregar opción
          </Button>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-3 pt-2 border-t">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allowsMultiple}
            onChange={(e) => setAllowsMultiple(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Permitir múltiples respuestas</span>
        </label>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Duración de la encuesta
          </label>
          <select
            value={duration || ''}
            onChange={(e) =>
              setDuration(e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Sin límite</option>
            <option value="1">1 hora</option>
            <option value="6">6 horas</option>
            <option value="12">12 horas</option>
            <option value="24">1 día</option>
            <option value="168">1 semana</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          Crear encuesta
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
