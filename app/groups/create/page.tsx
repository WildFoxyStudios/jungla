'use client';

import { useState } from 'react';
import { groupApi } from '@/lib/api-groups';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Lock, Globe, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PrivacyType = 'public' | 'private' | 'secret';

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyType>('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('session_token');
      if (!token) {
        setError('Debes iniciar sesión para crear un grupo');
        return;
      }

      const group = await groupApi.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        privacy,
      }, token);

      router.push(`/groups/${group.id}`);
    } catch (error: any) {
      console.error('Error creating group:', error);
      setError(error.response?.data?.error || 'Error al crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Link href="/groups">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a grupos
          </Button>
        </Link>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Crear grupo</h1>
              <p className="text-gray-600">Crea un espacio para compartir con personas que comparten tus intereses</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre del grupo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Desarrolladores Web"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{name.length}/100 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito de tu grupo..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Privacidad</label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={privacy === 'public'}
                    onChange={(e) => setPrivacy(e.target.value as PrivacyType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Público</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Cualquiera puede ver el grupo, los miembros y las publicaciones
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacy === 'private'}
                    onChange={(e) => setPrivacy(e.target.value as PrivacyType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Privado</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Solo los miembros pueden ver las publicaciones. Cualquiera puede solicitar unirse
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="privacy"
                    value="secret"
                    checked={privacy === 'secret'}
                    onChange={(e) => setPrivacy(e.target.value as PrivacyType)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Secreto</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Solo los miembros invitados pueden encontrar el grupo y ver las publicaciones
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/groups')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading || !name.trim()}
              >
                {loading ? 'Creando...' : 'Crear grupo'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
