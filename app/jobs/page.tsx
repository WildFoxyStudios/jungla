'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, MapPin, DollarSign, Building2, Clock, Bookmark, Filter, ChevronRight, Star, Globe } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  salary_range: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'remote' | 'hybrid';
  description: string;
  requirements: string[];
  posted_at: string;
  is_featured?: boolean;
  is_remote?: boolean;
  applicants_count: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [location, setLocation] = useState('');

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'full_time', label: 'Tiempo completo' },
    { id: 'part_time', label: 'Medio tiempo' },
    { id: 'remote', label: 'Remoto' },
    { id: 'contract', label: 'Contrato' },
  ];

  useEffect(() => {
    loadJobs();
  }, [activeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Mock jobs data
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Desarrollador Frontend React',
          company: 'TechCorp',
          company_logo: '/api/placeholder/50/50',
          location: 'Ciudad de México',
          salary_range: '$40,000 - $60,000 MXN',
          job_type: 'full_time',
          description: 'Buscamos un desarrollador frontend con experiencia en React, TypeScript y TailwindCSS para unirse a nuestro equipo.',
          requirements: ['3+ años React', 'TypeScript', 'TailwindCSS', 'Next.js'],
          posted_at: new Date(Date.now() - 86400000).toISOString(),
          is_featured: true,
          is_remote: false,
          applicants_count: 45,
        },
        {
          id: '2',
          title: 'Diseñador UX/UI',
          company: 'Creative Studio',
          company_logo: '/api/placeholder/50/50',
          location: 'Remoto',
          salary_range: '$35,000 - $50,000 MXN',
          job_type: 'remote',
          description: 'Únete a nuestro equipo de diseño. Buscamos alguien apasionado por crear experiencias de usuario excepcionales.',
          requirements: ['Figma', 'Adobe XD', 'Diseño responsive', 'Prototipado'],
          posted_at: new Date(Date.now() - 172800000).toISOString(),
          is_featured: true,
          is_remote: true,
          applicants_count: 32,
        },
        {
          id: '3',
          title: 'Gerente de Marketing Digital',
          company: 'Marketing Pro',
          location: 'Guadalajara',
          salary_range: '$50,000 - $70,000 MXN',
          job_type: 'full_time',
          description: 'Lidera nuestras estrategias de marketing digital y redes sociales.',
          requirements: ['5+ años experiencia', 'SEO/SEM', 'Analytics', 'Gestión de equipos'],
          posted_at: new Date(Date.now() - 259200000).toISOString(),
          applicants_count: 28,
        },
        {
          id: '4',
          title: 'Analista de Datos',
          company: 'DataInsights',
          location: 'Monterrey',
          salary_range: '$45,000 - $65,000 MXN',
          job_type: 'hybrid',
          description: 'Analiza grandes volúmenes de datos para generar insights de negocio.',
          requirements: ['SQL', 'Python', 'Power BI', 'Estadística'],
          posted_at: new Date(Date.now() - 345600000).toISOString(),
          is_remote: false,
          applicants_count: 19,
        },
        {
          id: '5',
          title: 'Soporte Técnico',
          company: 'IT Solutions',
          location: 'Remoto',
          salary_range: '$20,000 - $30,000 MXN',
          job_type: 'remote',
          description: 'Brinda soporte técnico a clientes y resuelve incidencias.',
          requirements: ['Atención al cliente', 'Resolución de problemas', 'Inglés intermedio'],
          posted_at: new Date(Date.now() - 432000000).toISOString(),
          applicants_count: 67,
        },
        {
          id: '6',
          title: 'Project Manager',
          company: 'Agile Teams',
          location: 'Ciudad de México',
          salary_range: '$55,000 - $80,000 MXN',
          job_type: 'full_time',
          description: 'Gestiona proyectos de desarrollo de software con metodologías ágiles.',
          requirements: ['Scrum/Agile', 'Gestión de proyectos', 'Comunicación', 'Jira'],
          posted_at: new Date(Date.now() - 518400000).toISOString(),
          is_featured: true,
          applicants_count: 41,
        },
      ];

      // Filter by job type
      const filtered = activeFilter === 'all' 
        ? mockJobs 
        : mockJobs.filter(j => j.job_type === activeFilter || (activeFilter === 'remote' && j.is_remote));

      setJobs(filtered);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const formatPostedDate = (date: string) => {
    const posted = new Date(date);
    const now = new Date();
    const days = Math.floor((now.getTime() - posted.getTime()) / 86400000);
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return posted.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full_time': return 'Tiempo completo';
      case 'part_time': return 'Medio tiempo';
      case 'contract': return 'Contrato';
      case 'remote': return 'Remoto';
      default: return type;
    }
  };

  const featuredJobs = jobs.filter(j => j.is_featured);
  const regularJobs = jobs.filter(j => !j.is_featured);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Empleos</h1>
              <p className="text-sm text-gray-600">Encuentra tu próximo trabajo</p>
            </div>
          </div>
          <Link href="/jobs/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Publicar empleo
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <Card className="mx-4 p-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleos, empresas o palabras clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ubicación"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="px-6">Buscar</Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
            <button className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Más filtros
            </button>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="mx-4 text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando empleos...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card className="mx-4 p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">No se encontraron empleos</h2>
            <p className="text-gray-600">Intenta con diferentes filtros o búsqueda</p>
          </Card>
        ) : (
          <div className="mx-4 space-y-4">
            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Destacados
                </h2>
                <div className="space-y-3">
                  {featuredJobs.map(job => (
                    <Card key={job.id} className="p-5 border-l-4 border-l-blue-600 hover:shadow-lg transition">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {job.company[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg hover:text-blue-600 cursor-pointer">{job.title}</h3>
                              <p className="text-gray-600 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {job.company}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleSaveJob(job.id)}
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <Bookmark className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}`} />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary_range}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatPostedDate(job.posted_at)}
                            </span>
                            {job.is_remote && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Globe className="w-4 h-4" />
                                Remoto
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 mt-3 line-clamp-2">{job.description}</p>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-2">
                              {job.requirements.slice(0, 3).map((req, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                  {req}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">{job.applicants_count} postulantes</span>
                              <Button>Aplicar ahora</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Jobs */}
            {regularJobs.length > 0 && (
              <div className={featuredJobs.length > 0 ? 'mt-6' : ''}>
                {featuredJobs.length > 0 && (
                  <h2 className="font-semibold text-gray-600 mb-3">Más empleos</h2>
                )}
                <div className="space-y-3">
                  {regularJobs.map(job => (
                    <Card key={job.id} className="p-4 hover:shadow-md transition">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {job.company[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold hover:text-blue-600 cursor-pointer">{job.title}</h3>
                              <p className="text-sm text-gray-600">{job.company}</p>
                            </div>
                            <button
                              onClick={() => toggleSaveJob(job.id)}
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <Bookmark className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}`} />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {job.salary_range}
                            </span>
                            <span>{formatPostedDate(job.posted_at)}</span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">{job.applicants_count} postulantes</span>
                            <Button size="sm" variant="outline">Ver detalles</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
