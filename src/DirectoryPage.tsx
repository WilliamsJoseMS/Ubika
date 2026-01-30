import React, { useState, useContext, useMemo } from 'react';
import { Search, Filter, Sparkles, MapPin } from 'lucide-react';
import BusinessCard from './components/BusinessCard';
import { AppContext } from './context/AppContext';
import { BusinessStatus, PlanType } from './types';
import { CATEGORIES } from './constants';

const DirectoryPage: React.FC = () => {
  const { businesses, toggleLike } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedCity, setSelectedCity] = useState<string>('Todas');

  // Extract unique cities from approved businesses
  const cities = useMemo(() => {
      const locations = businesses
          .filter(b => b.status === BusinessStatus.APPROVED && b.location)
          .map(b => b.location?.trim())
          .filter((l): l is string => !!l && l.length > 0);
      
      return Array.from(new Set(locations)).sort();
  }, [businesses]);

  // Filter businesses: Must be APPROVED to show here
  // useMemo caches the result so it doesn't recalculate on every render unless dependencies change
  const filteredBusinesses = useMemo(() => {
      return businesses.filter((b) => {
        const isApproved = b.status === BusinessStatus.APPROVED;
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || b.category === selectedCategory;
        const matchesCity = selectedCity === 'Todas' || (b.location && b.location.trim() === selectedCity);

        return isApproved && matchesSearch && matchesCategory && matchesCity;
      });
  }, [businesses, searchTerm, selectedCategory, selectedCity]);

  // Sort by Plan Priority: Premium > Pro > Free
  const sortedBusinesses = useMemo(() => {
      return [...filteredBusinesses].sort((a, b) => {
        const planWeight = {
          [PlanType.PREMIUM]: 3,
          [PlanType.PRO]: 2,
          [PlanType.INICIAL]: 1.5,
          [PlanType.FREE]: 1
        };
        // Sort by Plan Weight (Descending), then by Likes (Descending)
        // Fixed type safety by casting or default checking
        const weightA = planWeight[a.plan] || 0;
        const weightB = planWeight[b.plan] || 0;

        if (weightB !== weightA) {
            return weightB - weightA;
        }
        return b.likes - a.likes;
      });
  }, [filteredBusinesses]);

  return (
    <div className="bg-gray-950 min-h-screen pb-12">
      {/* Header / Search Section */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Explora Negocios Locales
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Encuentra los mejores servicios y productos en tu área. Conecta directamente por WhatsApp.
            </p>
          </div>

          {/* 3 Filters Box */}
          <div className="max-w-5xl mx-auto bg-gray-800/50 p-4 rounded-3xl border border-gray-700 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Search Name */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 bg-gray-900 border border-gray-700 rounded-xl py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 2. Category Select */}
                <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full pl-10 pr-10 bg-gray-900 border border-gray-700 rounded-xl py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                    >
                        <option value="Todas">Todas las Categorías</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                {/* 3. City Select */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="block w-full pl-10 pr-10 bg-gray-900 border border-gray-700 rounded-xl py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                    >
                        <option value="Todas">Todas las Ciudades</option>
                        {cities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-200">
            {sortedBusinesses.length} Resultado{sortedBusinesses.length !== 1 ? 's' : ''} Encontrado{sortedBusinesses.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex items-center text-sm text-yellow-400 bg-yellow-900/10 px-3 py-1 rounded-lg border border-yellow-500/20">
             <Sparkles className="w-4 h-4 mr-2" />
             Ordenado por: Destacados (Premium)
          </div>
        </div>

        {sortedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedBusinesses.map((business) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                onLike={toggleLike}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-gray-900 rounded-2xl border border-dashed border-gray-800">
            <Search className="mx-auto h-16 w-16 text-gray-700" />
            <h3 className="mt-4 text-lg font-medium text-gray-200">No se encontraron negocios</h3>
            <p className="mt-2 text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryPage;
