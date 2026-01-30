import React from 'react';
import { Heart, MessageCircle, MapPin, Globe, Instagram, Facebook, Star, Zap, CheckCircle2 } from 'lucide-react';
import { Business, PlanType } from '../types';

interface BusinessCardProps {
  business: Business;
  onLike: (id: string) => void;
  compact?: boolean;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onLike, compact = false }) => {
  
  // Definir estilos según el plan
  const getPlanStyles = () => {
    switch (business.plan) {
      case PlanType.PREMIUM:
        return {
          container: "border-yellow-500/50 shadow-yellow-500/20 shadow-xl hover:shadow-yellow-500/40 hover:border-yellow-400",
          badge: "bg-gradient-to-r from-yellow-600 to-amber-600 text-white",
          icon: <Star className="w-3 h-3 fill-white text-white mr-1" />,
          label: "DESTACADO"
        };
      case PlanType.PRO:
        return {
          container: "border-indigo-500/50 shadow-indigo-500/20 shadow-lg hover:shadow-indigo-500/40 hover:border-indigo-400",
          badge: "bg-indigo-600 text-white",
          icon: <Zap className="w-3 h-3 fill-white text-white mr-1" />,
          label: "PRO"
        };
      case PlanType.INICIAL:
        return {
          container: "border-cyan-500/40 shadow-cyan-500/10 shadow-md hover:shadow-cyan-500/20 hover:border-cyan-400",
          badge: "bg-cyan-700 text-white",
          icon: <CheckCircle2 className="w-3 h-3 text-white mr-1" />,
          label: "INICIAL"
        };
      default: // FREE
        return {
          container: "border-gray-800 hover:border-gray-700 shadow-lg hover:shadow-2xl",
          badge: "hidden",
          icon: null,
          label: ""
        };
    }
  };

  const styles = getPlanStyles();

  return (
    <div className={`bg-gray-900 rounded-2xl transition-all duration-300 overflow-hidden border flex flex-col ${compact ? '' : 'h-full'} group relative ${styles.container}`}>
      
      {/* Badge de Plan (Solo Pro, Premium e Inicial) */}
      {business.plan !== PlanType.FREE && (
        <div className="absolute top-0 left-0 z-20">
          <div className={`${styles.badge} px-3 py-1 rounded-br-xl text-xs font-bold shadow-lg flex items-center`}>
            {styles.icon}
            {styles.label}
          </div>
        </div>
      )}

      {/* Image Container - Increased height slightly in compact mode (h-28 is approx 112px, ~16px more than h-24) */}
      <div className={`relative ${compact ? 'h-28' : 'h-48'} overflow-hidden bg-gray-800`}>
        <img 
          src={business.imageUrl} 
          alt={business.name} 
          // OPTIMIZACIÓN DE RENDIMIENTO: Lazy loading y decodificación asíncrona
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale';
          }}
        />
        <div className={`absolute ${compact ? 'top-1 right-1' : 'top-4 right-4'}`}>
          <span className="bg-gray-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-indigo-400 border border-gray-700">
            {business.category}
          </span>
        </div>
      </div>
      
      {/* Content Container - REMOVED flex-grow in compact mode to prevent stretching */}
      <div className={`${compact ? 'p-3' : 'p-5'} ${compact ? '' : 'flex-grow'} flex flex-col`}>
        <div className={`flex justify-between items-start ${compact ? 'mb-1' : 'mb-2'}`}>
          <h3 className={`font-bold text-gray-100 leading-tight group-hover:text-indigo-400 transition-colors pr-2 ${compact ? 'text-sm' : 'text-lg'}`}>{business.name}</h3>
          <button 
            onClick={() => onLike(business.id)}
            className="text-gray-500 hover:text-pink-500 transition-colors flex items-center gap-1 group/like flex-shrink-0"
          >
            <span className="text-xs group-hover/like:text-pink-500 font-medium">{business.likes}</span>
            <Heart className={`w-5 h-5 ${business.likes > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
          </button>
        </div>

        {business.location && (
          <div className={`flex items-center text-gray-400 ${compact ? 'text-[10px] mb-1' : 'text-sm mb-3'}`}>
            <MapPin className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} mr-1 text-gray-500`} />
            {business.location}
          </div>
        )}

        {/* Description - REMOVED flex-grow in compact mode */}
        <p className={`text-gray-400 font-light ${compact ? 'text-xs line-clamp-2 mb-0' : 'text-sm line-clamp-3 mb-4 flex-grow'}`}>
          {business.description}
        </p>

        {/* Footer - REMOVED mt-auto in compact mode (changed to mt-2) to avoid pushing to bottom */}
        <div className={`border-t border-gray-800 ${compact ? 'pt-2 mt-2' : 'pt-4 mt-auto'}`}>
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                {business.website && (
                  <a href={business.website} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-indigo-400 transition-colors" title="Sitio Web">
                    <Globe className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </a>
                )}
                {business.instagram && (
                   <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-pink-500 transition-colors" title="Instagram">
                   <Instagram className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
                 </a>
                )}
                 {business.facebook && (
                   <a href={`https://facebook.com/${business.facebook}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition-colors" title="Facebook">
                   <Facebook className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
                 </a>
                )}
             </div>

            <a 
              href={`https://wa.me/${business.whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center rounded-xl transition-all shadow-lg gap-1 transform hover:-translate-y-0.5
                ${compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'}
                font-semibold
                ${business.plan === PlanType.PREMIUM 
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-yellow-900/20' 
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-900/20'}`}
            >
              <MessageCircle className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;