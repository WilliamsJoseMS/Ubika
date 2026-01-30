import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, Shield, Smartphone, Edit3, Save, Image as ImageIcon, RotateCcw, Palette, Megaphone, Globe, Code, Cpu, Hammer, ShoppingBag, Radio, UserPlus } from 'lucide-react';
import { AppContext } from './context/AppContext';
import { PlanType, UserRole, PlanConfig } from './types';

const LandingPage: React.FC = () => {
  const { landingContent, currentUser, updateLandingContent } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);

  // Default content fallback optimized for the Agency + Directory model
  const defaultContent = {
    hero_title: 'Impulso Digital & Tecnología',
    hero_description: 'Transformamos tu negocio con Apps a Medida desde $5, Diseño Gráfico Profesional y Publicidad Masiva. Todo en un solo lugar.',
    hero_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    cta_text: 'Ver Servicios'
  };

  const content = landingContent || defaultContent;
  const plans = landingContent?.plans;

  const [editForm, setEditForm] = useState(content);

  useEffect(() => {
    if (landingContent) {
        setEditForm(landingContent);
    }
  }, [landingContent]);

  const handleQuickSave = async () => {
      await updateLandingContent(editForm);
  };

  const handleSaveAndExit = async () => {
      await updateLandingContent(editForm);
      setIsEditing(false);
  };

  const handleCancel = () => {
      setEditForm(landingContent || defaultContent);
      setIsEditing(false);
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // Define explicit order for plans
  const PLAN_ORDER = [PlanType.FREE, PlanType.INICIAL, PlanType.PRO, PlanType.PREMIUM];

  return (
    <div className="bg-gray-950 relative font-sans">
      
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-fade-in-up">
          {isEditing ? (
             <>
                <button 
                  onClick={handleCancel}
                  className="bg-gray-800 text-gray-300 p-4 rounded-full shadow-lg border border-gray-600 hover:bg-gray-700 transition-all flex items-center justify-center gap-2 group"
                  title="Cancelar cambios"
                >
                  <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform" />
                </button>
                <button 
                  onClick={handleSaveAndExit}
                  className="bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-600/40 hover:bg-green-500 transition-all flex items-center justify-center gap-2 animate-bounce-subtle"
                  title="Guardar y Salir"
                >
                  <Save className="w-5 h-5" />
                </button>
             </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-600/40 hover:bg-indigo-500 transition-all flex items-center gap-2 border-2 border-indigo-400"
            >
              <Edit3 className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Editar Portada</span>
            </button>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-black overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 transition-opacity duration-500">
          <img
            className={`w-full h-full object-cover transition-all duration-500 ${isEditing ? 'opacity-20 blur-sm' : 'opacity-40'}`}
            src={isEditing ? editForm.hero_image : content.hero_image}
            alt="Fondo de Portada"
            onError={(e) => (e.target as HTMLImageElement).src = defaultContent.hero_image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-transparent to-gray-950/90"></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center sm:text-left z-10">
          
          {isEditing && (
              <div className="mb-8 p-4 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-indigo-500/50 max-w-2xl animate-fade-in shadow-2xl relative z-20">
                  <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">URL de Imagen de Fondo</label>
                  </div>
                  <input 
                      type="text" 
                      value={editForm.hero_image}
                      onChange={(e) => setEditForm({...editForm, hero_image: e.target.value})}
                      onBlur={handleQuickSave}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-600"
                      placeholder="https://ejemplo.com/imagen.jpg"
                  />
              </div>
          )}

          <div className="max-w-4xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
                <Cpu className="w-3 h-3" />
                Tecnología e Innovación
             </div>
             
             <div className="relative">
                {isEditing ? (
                     <div className="relative group">
                         <input
                            type="text"
                            value={editForm.hero_title}
                            onChange={(e) => setEditForm({...editForm, hero_title: e.target.value})}
                            onBlur={handleQuickSave}
                            className="w-full bg-transparent text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl border-b-2 border-dashed border-gray-600 focus:border-indigo-500 outline-none transition-all py-2"
                            placeholder="Escribe el título principal aquí..."
                        />
                     </div>
                ) : (
                    <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-2xl">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 pb-2">
                            {content.hero_title}
                        </span>
                    </h1>
                )}
             </div>

             <div className="mt-6 max-w-3xl">
                {isEditing ? (
                     <div className="relative group">
                        <textarea 
                            value={editForm.hero_description}
                            onChange={(e) => setEditForm({...editForm, hero_description: e.target.value})}
                            onBlur={handleQuickSave}
                            className="w-full bg-transparent text-xl text-gray-300 font-light leading-relaxed border-2 border-dashed border-gray-600 rounded-xl p-4 focus:border-indigo-500 focus:bg-gray-900/50 outline-none resize-none transition-all"
                            rows={4}
                            placeholder="Escribe la descripción aquí..."
                        />
                    </div>
                ) : (
                    <p className="text-xl text-gray-300 font-light leading-relaxed">
                        {content.hero_description}
                    </p>
                )}
             </div>

             <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:items-center">
                 <button
                    onClick={() => scrollToSection('services')}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-300 transform hover:-translate-y-1"
                 >
                    <Smartphone className="w-5 h-5 mr-2" />
                    {isEditing ? 'Ver Servicios (Botón)' : content.cta_text}
                 </button>
                 <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_25px_rgba(192,38,211,0.4)] hover:shadow-[0_0_35px_rgba(192,38,211,0.6)] transition-all duration-300 transform hover:-translate-y-1 border border-fuchsia-500/50"
                 >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Regístrate hoy
                 </Link>
             </div>
          </div>
        </div>
      </div>

      {/* Services Section - The "Dark Tech" Grid */}
      <div id="services" className="py-24 bg-gray-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">Soluciones Integrales</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                      Desde la creación de tu imagen hasta la herramienta tecnológica que gestiona tu negocio.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Service 1: Custom Apps */}
                  <div className="group relative bg-gray-900/50 border border-indigo-500/20 rounded-2xl p-6 hover:bg-gray-900 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-indigo-600/20 rounded-full blur-2xl group-hover:bg-indigo-600/30 transition-all"></div>
                      <Code className="w-10 h-10 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-white mb-2">Apps a Medida</h3>
                      <p className="text-sm text-gray-400 mb-4">
                          Desarrollo personalizado 100%. Tecnología con IA e intuitiva.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-2 mb-4">
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-indigo-500" /> Para Talleres y Tiendas</li>
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-indigo-500" /> Streaming y Educadores</li>
                      </ul>
                      <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                          <span className="text-xs text-gray-400">Desde</span>
                          <span className="text-xl font-bold text-indigo-400">$5 BCV</span>
                      </div>
                  </div>

                  {/* Service 2: Graphic Design */}
                  <div className="group relative bg-gray-900/50 border border-purple-500/20 rounded-2xl p-6 hover:bg-gray-900 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-purple-600/20 rounded-full blur-2xl group-hover:bg-purple-600/30 transition-all"></div>
                      <Palette className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-white mb-2">Diseño Gráfico</h3>
                      <p className="text-sm text-gray-400 mb-4">
                          Identidad visual que vende. Logos, Flyers y Banners de alto impacto.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-2 mb-4">
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-purple-500" /> Logos Profesionales</li>
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-purple-500" /> Flyers para Redes</li>
                      </ul>
                      <div className="mt-auto pt-4 border-t border-gray-800 flex justify-center">
                          <span className="text-sm font-medium text-purple-400">Consultar Packs</span>
                      </div>
                  </div>

                  {/* Service 3: Ads */}
                  <div className="group relative bg-gray-900/50 border border-green-500/20 rounded-2xl p-6 hover:bg-gray-900 hover:border-green-500/50 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-green-600/20 rounded-full blur-2xl group-hover:bg-green-600/30 transition-all"></div>
                      <Megaphone className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-white mb-2">Publicidad Masiva</h3>
                      <p className="text-sm text-gray-400 mb-4">
                          Difusión regional y nacional a través de cientos de grupos de WhatsApp.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-2 mb-4">
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-green-500" /> +670 Grupos Activos</li>
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-green-500" /> Segmentación por Nicho</li>
                      </ul>
                      <div className="mt-auto pt-4 border-t border-gray-800 flex justify-center">
                          <span className="text-sm font-medium text-green-400">Alta Efectividad</span>
                      </div>
                  </div>

                  {/* Service 4: Directory */}
                  <div className="group relative bg-gray-900/50 border border-cyan-500/20 rounded-2xl p-6 hover:bg-gray-900 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
                       <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-cyan-600/20 rounded-full blur-2xl group-hover:bg-cyan-600/30 transition-all"></div>
                      <Globe className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-white mb-2">Directorio Web</h3>
                      <p className="text-sm text-gray-400 mb-4">
                          Tu vitrina digital permanente. Planes gratuitos y premium para destacar.
                      </p>
                       <ul className="text-xs text-gray-500 space-y-2 mb-4">
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-cyan-500" /> SEO Local</li>
                          <li className="flex items-center"><Check className="w-3 h-3 mr-2 text-cyan-500" /> Enlace Directo a WhatsApp</li>
                      </ul>
                      <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                          <span className="text-xs text-gray-400">Planes</span>
                          <span className="text-sm font-bold text-cyan-400">GRATIS / PRO</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Target Sectors Banner */}
      <div className="py-12 bg-indigo-900/10 border-y border-indigo-900/30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-6">Desarrollamos Apps y Soluciones para</p>
              <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-80">
                   <div className="flex items-center gap-2 text-gray-300">
                       <Hammer className="w-5 h-5 text-gray-500" />
                       <span className="font-medium">Talleres (Mecánica, Electrónica, Carpintería)</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-300">
                       <ShoppingBag className="w-5 h-5 text-gray-500" />
                       <span className="font-medium">Tiendas (Ropa, Zapatos, Repuestos)</span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-300">
                       <Radio className="w-5 h-5 text-gray-500" />
                       <span className="font-medium">Streaming y Servicios Remotos</span>
                   </div>
                    <div className="flex items-center gap-2 text-gray-300">
                       <Smartphone className="w-5 h-5 text-gray-500" />
                       <span className="font-medium">Educadores y Emprendedores</span>
                   </div>
              </div>
          </div>
      </div>

      {/* Pricing / Directory Section */}
      <div id="pricing" className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                 <span className="inline-block py-1 px-3 rounded-full bg-gray-800 text-gray-400 text-xs font-bold mb-4 border border-gray-700">
                     SERVICIO DE DIRECTORIO
                 </span>
                <h2 className="text-3xl font-extrabold text-white text-center mb-4">
                Planes de Visibilidad
                </h2>
                <p className="text-center text-gray-400 max-w-2xl mx-auto">
                    Únete a nuestro directorio web y potencia tu alcance con nuestros paquetes de publicidad en WhatsApp.
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {plans && PLAN_ORDER.map((planType) => {
                    const plan = plans[planType];
                    if (!plan) return null;
                    
                    return (
                        <div 
                            key={planType}
                            className={`
                                rounded-2xl p-6 flex flex-col transition-all duration-300 relative
                                ${plan.isPopular 
                                    ? 'bg-gray-800 border-2 border-indigo-500 shadow-2xl z-10 scale-105' 
                                    : 'bg-gray-950 border border-gray-800 hover:border-gray-700'
                                }
                            `}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wide shadow-lg">
                                    Recomendado
                                </div>
                            )}
                            
                            <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 h-8">
                                {plan.description}
                            </p>
                            
                            <div className="mt-4 mb-6">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-xs font-medium text-gray-500 block">{plan.period}</span>
                            </div>
                            
                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <Check className={`flex-shrink-0 h-4 w-4 mt-0.5 ${plan.isPopular ? 'text-indigo-400' : 'text-gray-600'}`} />
                                        <span className="ml-3 text-sm text-gray-300 leading-snug">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link 
                                to="/login" 
                                className={`
                                    block w-full rounded-xl py-3 text-sm font-bold text-center transition-all
                                    ${plan.isPopular 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                                    }
                                `}
                            >
                                {plan.buttonText}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;