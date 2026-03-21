'use client';

import { useState, useEffect } from 'react';
import { settingsApi, type UserSettings } from '@/lib/api-settings';
import { 
  Shield, Lock, Eye, Users, Bell, Mail, 
  Globe, MessageSquare, Tag, Clock, Smartphone,
  Moon, Sun
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'security' | 'notifications' | 'appearance'>('privacy');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await settingsApi.getSettings(token);
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!settings) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const updated = await settingsApi.updateSettings({ [key]: value }, token);
      setSettings(updated);
    } catch (error) {
      console.error('Error updating setting:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando configuración...</div>;
  }

  if (!settings) {
    return <div className="p-8 text-center text-red-600">Error al cargar la configuración</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'privacy'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-5 h-5" />
            Privacidad
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="w-5 h-5" />
            Seguridad
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notificaciones
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 px-6 py-4 font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'appearance'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Moon className="w-5 h-5" />
            Apariencia
          </button>
        </div>
      </div>

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <SettingItem
            icon={<Sun className="w-5 h-5" />}
            title="Modo oscuro"
            description="Cambiar entre modo claro y oscuro"
          >
            <select
              value={settings.dark_mode || 'system'}
              onChange={(e) => updateSetting('dark_mode', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={saving}
            >
              <option value="system">Automático (sistema)</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </SettingItem>

          <SettingToggle
            icon={<Moon className="w-5 h-5" />}
            title="Reducir el brillo"
            description="Reducir el brillo automáticamente por la noche"
            value={settings.reduce_brightness || false}
            onChange={(value) => updateSetting('reduce_brightness', value)}
            disabled={saving}
          />

          <SettingItem
            icon={<Clock className="w-5 h-5" />}
            title="Tamaño de fuente"
            description="Ajustar el tamaño del texto en la aplicación"
          >
            <select
              value={settings.font_size || 'medium'}
              onChange={(e) => updateSetting('font_size', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={saving}
            >
              <option value="small">Pequeño</option>
              <option value="medium">Medio</option>
              <option value="large">Grande</option>
            </select>
          </SettingItem>

          <SettingToggle
            icon={<Eye className="w-5 h-5" />}
            title="Animaciones"
            description="Mostrar animaciones en la interfaz"
            value={settings.animations_enabled !== false}
            onChange={(value) => updateSetting('animations_enabled', value)}
            disabled={saving}
          />
        </div>
      )}

      {/* Privacy Settings */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <SettingItem
            icon={<Globe className="w-5 h-5" />}
            title="Visibilidad del perfil"
            description="Quién puede ver tu perfil completo"
          >
            <select
              value={settings.profile_visibility}
              onChange={(e) => updateSetting('profile_visibility', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={saving}
            >
              <option value="public">Público</option>
              <option value="friends">Solo amigos</option>
              <option value="private">Privado</option>
            </select>
          </SettingItem>

          <SettingItem
            icon={<Users className="w-5 h-5" />}
            title="Visibilidad de publicaciones"
            description="Quién puede ver tus publicaciones por defecto"
          >
            <select
              value={settings.post_visibility}
              onChange={(e) => updateSetting('post_visibility', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={saving}
            >
              <option value="public">Público</option>
              <option value="friends">Solo amigos</option>
              <option value="private">Solo yo</option>
            </select>
          </SettingItem>

          <SettingItem
            icon={<MessageSquare className="w-5 h-5" />}
            title="Mensajes"
            description="Quién puede enviarte mensajes"
          >
            <select
              value={settings.allow_messages}
              onChange={(e) => updateSetting('allow_messages', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={saving}
            >
              <option value="everyone">Todos</option>
              <option value="friends">Solo amigos</option>
              <option value="nobody">Nadie</option>
            </select>
          </SettingItem>

          <SettingToggle
            icon={<Users className="w-5 h-5" />}
            title="Solicitudes de amistad"
            description="Permitir que otros te envíen solicitudes de amistad"
            value={settings.allow_friend_requests}
            onChange={(value) => updateSetting('allow_friend_requests', value)}
            disabled={saving}
          />

          <SettingToggle
            icon={<Tag className="w-5 h-5" />}
            title="Etiquetas"
            description="Permitir que otros te etiqueten en publicaciones"
            value={settings.allow_tags}
            onChange={(value) => updateSetting('allow_tags', value)}
            disabled={saving}
          />

          <SettingToggle
            icon={<Eye className="w-5 h-5" />}
            title="Estado en línea"
            description="Mostrar cuando estás en línea"
            value={settings.show_online_status}
            onChange={(value) => updateSetting('show_online_status', value)}
            disabled={saving}
          />

          <SettingToggle
            icon={<Clock className="w-5 h-5" />}
            title="Última vez activo"
            description="Mostrar la última vez que estuviste activo"
            value={settings.show_last_seen}
            onChange={(value) => updateSetting('show_last_seen', value)}
            disabled={saving}
          />
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <SettingToggle
            icon={<Lock className="w-5 h-5" />}
            title="Autenticación de dos factores"
            description="Agrega una capa extra de seguridad a tu cuenta"
            value={settings.two_factor_enabled}
            onChange={(value) => updateSetting('two_factor_enabled', value)}
            disabled={saving}
          />

          <div className="border-t pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-semibold">Sesiones activas</h3>
                <p className="text-sm text-gray-600">Administra los dispositivos donde has iniciado sesión</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              Ver sesiones
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-semibold">Cambiar contraseña</h3>
                <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Cambiar contraseña
            </button>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <SettingToggle
            icon={<Mail className="w-5 h-5" />}
            title="Notificaciones por correo"
            description="Recibir notificaciones importantes por email"
            value={settings.email_notifications}
            onChange={(value) => updateSetting('email_notifications', value)}
            disabled={saving}
          />

          <SettingToggle
            icon={<Bell className="w-5 h-5" />}
            title="Notificaciones push"
            description="Recibir notificaciones en tiempo real en tu dispositivo"
            value={settings.push_notifications}
            onChange={(value) => updateSetting('push_notifications', value)}
            disabled={saving}
          />
        </div>
      )}
    </div>
  );
}

function SettingItem({ 
  icon, 
  title, 
  description, 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3 flex-1">
        <div className="text-gray-600 mt-1">{icon}</div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingToggle({
  icon,
  title,
  description,
  value,
  onChange,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SettingItem icon={icon} title={title} description={description}>
      <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </SettingItem>
  );
}
