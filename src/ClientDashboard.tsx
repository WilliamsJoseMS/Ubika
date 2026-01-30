import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from './context/AppContext';
import { Business, BusinessStatus, PlanType, PlanConfig } from './types';
import { CATEGORIES } from './constants';
import { Save, AlertTriangle, Eye, Activity, MessageCircle, Clock, Bell, Smartphone, Palette, Megaphone, ArrowRight, X, Check, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import BusinessCard from './components/BusinessCard';
import { supabase } from './lib/supabaseClient';
import { useToast } from './context/ToastContext';

const COUNTRY_CODES = [
  { code: '54', label: 'Argentina (+54)' },
  { code: '591', label: 'Bolivia (+591)' },
  { code: '55', label: 'Brasil (+55)' },
  { code: '1', label: 'Canadá/USA (+1)' },
  { code: '56', label: 'Chile (+56)' },
  { code: '57', label: 'Colombia (+57)' },
  { code: '506', label: 'Costa Rica (+506)' },
  { code: '53', label: 'Cuba (+53)' },
  { code: '593', label: 'Ecuador (+593)' },
  { code: '503', label: 'El Salvador (+503)' },
  { code: '34', label: 'España (+34)' },
  { code: '502', label: 'Guatemala (+502)' },
  { code: '504', label: 'Honduras (+504)' },
  { code: '52', label: 'México (+52)' },
  { code: '505', label: 'Nicaragua (+505)' },
  { code: '507', label: 'Panamá (+507)' },
  { code: '595', label: 'Paraguay (+595)' },
  { code: '51', label: 'Perú (+51)' },
  { code: '1', label: 'Puerto Rico (+1)' },
  { code: '598', label: 'Uruguay (+598)' },
  { code: '58', label: 'Venezuela (+58)' },
];

type ServiceType = 'APP' | 'DESIGN' | 'ADS' | null;

const ClientDashboard: React.FC = () => {
  const { currentUser, businesses, updateBusiness, createBusiness, landingContent } = useContext(AppContext);
  const toast = useToast();
  
  // Find user's business
  const myBusiness = businesses.find(b => b.ownerId === currentUser?.id);
  
  const [formData, setFormData] = useState<Partial<Business>>({
    name: '',
    category: CATEGORIES[0],
    description: '',
    imageUrl: '',
    whatsapp: '',
    location: '',
    website: '',
    instagram: '',
    facebook: '',
  });

  // Local state for splitting phone number
  const [whatsappPrefix, setWhatsappPrefix] = useState('52'); // Default Mexico
  const [whatsappLocal, setWhatsappLocal] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SERVICE REQUEST LOGIC ---
  const [activeService, setActiveService] = useState<ServiceType>(null);
  
  // Service Forms State
  const [appRequest, setAppRequest] = useState({ type: 'Tienda Online', budget: '$5 - $20', details: '' });
  const [designRequest, setDesignRequest] = useState({ type: 'Logo Profesional', style: 'Minimalista', details: '' });
  const [adsRequest, setAdsRequest] = useState({ plan: PlanType.PRO, duration: '1 Mes' });

  // Initialize form with existing business data
  useEffect(() => {
    if (myBusiness) {
      setFormData(myBusiness);
      
      // Parse existing WhatsApp number
      if (myBusiness.whatsapp) {
          const foundPrefix = COUNTRY_CODES.find(c => myBusiness.whatsapp.startsWith(c.code));
          if (foundPrefix) {
              setWhatsappPrefix(foundPrefix.code);
              setWhatsappLocal(myBusiness.whatsapp.slice(foundPrefix.code.length));
          } else {
              setWhatsappLocal(myBusiness.whatsapp);
          }
      }
    }
  }, [myBusiness]);

  // Sync Prefix/Local changes to formData.whatsapp
  useEffect(() => {
      const cleanLocal = whatsappLocal.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, whatsapp: `${whatsappPrefix}${cleanLocal}` }));
  }, [whatsappPrefix, whatsappLocal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FILE UPLOAD HANDLERS ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    await processFile(file);
  };

  const processFile = async (file: File | undefined) => {
    if (!currentUser) {
      toast.addToast('Debes iniciar sesión para subir una imagen.', 'error');
      return;
    }
    if (!file || !file.type.startsWith('image/')) {
      if (file) {
        toast.addToast('Por favor sube un archivo de imagen válido (PNG, JPG).', 'error');
      }
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;

      let { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: data.publicUrl }));
      toast.addToast('Imagen subida correctamente.', 'success');

    } catch (error: any) {
      console.error("Error al subir imagen:", error);
      toast.addToast(`Error al subir la imagen: ${error.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !formData.description) {
        toast.addToast('Por favor completa los campos requeridos (Nombre, Descripción, WhatsApp).', 'error');
        return;
    }
    try {
        if (myBusiness) {
            // Al editar, cambiamos el estado a PENDING para que el admin lo revise de nuevo
            await updateBusiness(myBusiness.id, { ...formData, status: BusinessStatus.PENDING });
            toast.addToast('¡Cambios enviados a revisión!', 'success');
        } else {
            await createBusiness({
                ...formData,
                ownerId: currentUser?.id,
                plan: PlanType.FREE 
            });
            toast.addToast('¡Listado creado! Esperando aprobación del administrador.', 'success');
        }
    } catch (err) {
        toast.addToast('Algo salió mal.', 'error');
    }
  };

  // --- WHATSAPP GENERATOR LOGIC ---
  const handleServiceRequest = (service: ServiceType) => {
      const adminPhone = landingContent?.admin_whatsapp || ''; 
      if (!adminPhone) {
          toast.addToast("El número del administrador no está configurado.", 'error');
          return;
      }

      const clientName = currentUser?.name || 'Cliente';
      const businessName = formData.name || 'Mi Negocio';
      let text = '';

      const header = `Hola *Williams Josè*, soy *${clientName}* del negocio *${businessName}*.\n\n`;

      if (service === 'APP') {
          text = `${header}🚀 *SOLICITUD DE APP*\n\n` +
                 `📱 *Tipo:* ${appRequest.type}\n` +
                 `💰 *Presupuesto:* ${appRequest.budget}\n` +
                 `📝 *Detalles:* ${appRequest.details || 'N/A'}\n\n` +
                 `Me gustaría recibir asesoría personalizada.`;
      } else if (service === 'DESIGN') {
          text = `${header}🎨 *SOLICITUD DE DISEÑO*\n\n` +
                 `🖌️ *Servicio:* ${designRequest.type}\n` +
                 `✨ *Estilo:* ${designRequest.style}\n` +
                 `📝 *Ideas:* ${designRequest.details || 'N/A'}\n\n` +
                 `Quedo atento a los paquetes disponibles.`;
      } else if (service === 'ADS') {
           const selectedPlan = landingContent?.plans?.[adsRequest.plan];
           const price = selectedPlan?.price || 'Consultar';
           
           text = `${header}📢 *SOLICITUD DE PUBLICIDAD / PLAN*\n\n` +
                 `💎 *Plan Interesado:* ${selectedPlan?.title || adsRequest.plan}\n` +
                 `💵 *Precio:* ${price}\n` +
                 `⏱️ *Duración:* ${adsRequest.duration}\n\n` +
                 `Deseo activar este plan para mejorar mi visibilidad.`;
      }

      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/${adminPhone}?text=${encodedText}`, '_blank');
      setActiveService(null); // Close modal
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
        case BusinessStatus.APPROVED: return 'Aprobado';
        case BusinessStatus.PENDING: return 'Pendiente';
        case BusinessStatus.REJECTED: return 'Rechazado';
        case BusinessStatus.PAUSED: return 'Pausado';
        default: return status;
    }
  };

  const previewBusiness: Business = {
      id: 'preview',
      ownerId: currentUser?.id || 'preview',
      name: formData.name || 'Nombre del Negocio',
      category: formData.category || CATEGORIES[0],
      description: formData.description || 'Aquí aparecerá la descripción de tu negocio...',
      imageUrl: formData.imageUrl || 'https://placehold.co/400',
      whatsapp: formData.whatsapp || '',
      location: formData.location,
      website: formData.website,
      instagram: formData.instagram,
      facebook: formData.facebook,
      status: BusinessStatus.APPROVED,
      likes: myBusiness?.likes || 0,
      createdAt: new Date().toISOString(),
      plan: myBusiness?.plan || PlanType.FREE
  };

  const adminWhatsapp = landingContent?.admin_whatsapp || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
            Panel de Control
          </h2>
          <p className="mt-1 text-gray-400 text-sm">Gestiona tu presencia digital y solicita nuevos servicios.</p>
        </div>
      </div>

      {!myBusiness && (
         <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-8">
         <div className="flex">
           <div className="flex-shrink-0">
             <AlertTriangle className="h-5 w-5 text-blue-400" aria-hidden="true" />
           </div>
           <div className="ml-3">
             <p className="text-sm text-blue-200">
               Aún no has creado un listado. ¡Completa el formulario abajo para comenzar!
             </p>
           </div>
         </div>
       </div>
      )}

      {/* Notifications */}
      {myBusiness?.adminNote && (
          <div className="bg-amber-900/30 border-l-4 border-amber-500 p-4 mb-8 rounded-r-xl animate-fade-in">
            <div className="flex">
                <div className="flex-shrink-0">
                    <Bell className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-200">Mensaje del Sistema</h3>
                    <p className="text-sm text-amber-100 mt-1">
                        {myBusiness.adminNote}
                    </p>
                </div>
            </div>
          </div>
      )}

      {/* Stats Grid */}
      {myBusiness && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-lg rounded-2xl p-5">
              <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500/20 rounded-xl p-3">
                    <Activity className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">Estado</dt>
                      <dd className="mt-1">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border
                          ${myBusiness.status === BusinessStatus.APPROVED ? 'bg-green-900/50 text-green-200 border-green-800' : 
                            myBusiness.status === BusinessStatus.PENDING ? 'bg-yellow-900/50 text-yellow-200 border-yellow-800' :
                            'bg-gray-800 text-gray-300 border-gray-700'}`}>
                          {getStatusLabel(myBusiness.status)}
                        </span>
                      </dd>
                    </dl>
                  </div>
              </div>
           </div>
           <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-lg rounded-2xl p-5">
              <div className="flex items-center">
                  <div className="flex-shrink-0 bg-pink-500/20 rounded-xl p-3">
                    <Eye className="h-6 w-6 text-pink-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">Interacciones</dt>
                      <dd className="text-lg font-bold text-white mt-1">{myBusiness.likes}</dd>
                    </dl>
                  </div>
              </div>
           </div>
           <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-lg rounded-2xl p-5 relative">
              <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gray-700/50 rounded-xl p-3">
                    <Save className="h-6 w-6 text-gray-300" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-400 truncate">Plan Actual</dt>
                      <dd className="text-lg font-bold text-white mt-1">{myBusiness.plan}</dd>
                    </dl>
                  </div>
              </div>
              {myBusiness.planExpiresAt && (
                   <div className="mt-3 flex items-center text-xs text-orange-300 bg-orange-900/20 px-2 py-1 rounded-lg border border-orange-900/50">
                       <Clock className="w-3 h-3 mr-1" />
                       Vence: {new Date(myBusiness.planExpiresAt).toLocaleDateString()}
                   </div>
              )}
           </div>
        </div>
      )}

      {/* --- SERVICES & EXPANSION HUB --- */}
      <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-indigo-500" />
              Centro de Servicios & Expansión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card: Apps */}
              <div 
                onClick={() => setActiveService('APP')}
                className="group cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border border-indigo-500/30 hover:border-indigo-500 rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              >
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                          <Smartphone className="w-8 h-8 text-indigo-400" />
                      </div>
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded border border-indigo-500/30">Desde $5</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Desarrollo de Apps</h4>
                  <p className="text-sm text-gray-400 mb-4">Creamos la app perfecta para tu tienda, taller o servicio. Tecnología intuitiva.</p>
                  <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Solicitar Cotización <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
              </div>

              {/* Card: Design */}
              <div 
                 onClick={() => setActiveService('DESIGN')}
                 className="group cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-500/30 hover:border-purple-500 rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              >
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                          <Palette className="w-8 h-8 text-purple-400" />
                      </div>
                      <span className="text-xs font-bold text-purple-300 bg-purple-900/50 px-2 py-1 rounded border border-purple-500/30">Packs Disponibles</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Diseño Gráfico</h4>
                  <p className="text-sm text-gray-400 mb-4">Logos, Flyers, Banners y Branding completo para destacar en redes.</p>
                  <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Ver Opciones <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
              </div>

              {/* Card: Ads */}
              <div 
                 onClick={() => setActiveService('ADS')}
                 className="group cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/30 hover:border-green-500 rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              >
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                          <Megaphone className="w-8 h-8 text-green-400" />
                      </div>
                      <span className="text-xs font-bold text-green-300 bg-green-900/50 px-2 py-1 rounded border border-green-500/30">Alta Visibilidad</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Publicidad & Planes</h4>
                  <p className="text-sm text-gray-400 mb-4">Difusión masiva en WhatsApp y posicionamiento destacado en el directorio.</p>
                  <div className="flex items-center text-green-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      Mejorar Plan <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
              </div>
          </div>

          {/* SERVICE REQUEST FORM (Expandable/Modal Logic) */}
          {activeService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
                      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              {activeService === 'APP' && <Smartphone className="w-5 h-5 text-indigo-500" />}
                              {activeService === 'DESIGN' && <Palette className="w-5 h-5 text-purple-500" />}
                              {activeService === 'ADS' && <Megaphone className="w-5 h-5 text-green-500" />}
                              
                              {activeService === 'APP' && 'Solicitar App a Medida'}
                              {activeService === 'DESIGN' && 'Solicitar Diseño Gráfico'}
                              {activeService === 'ADS' && 'Mejorar Plan / Publicidad'}
                          </h3>
                          <button onClick={() => setActiveService(null)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
                              <X className="w-6 h-6" />
                          </button>
                      </div>
                      
                      <div className="p-6 space-y-4">
                          {/* APP FORM */}
                          {activeService === 'APP' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de App</label>
                                      <select 
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                                        value={appRequest.type}
                                        onChange={(e) => setAppRequest({...appRequest, type: e.target.value})}
                                      >
                                          <option>Tienda Online / E-commerce</option>
                                          <option>Gestión de Taller</option>
                                          <option>Sistema de Reservas</option>
                                          <option>Catálogo Digital</option>
                                          <option>Educación / Cursos</option>
                                          <option>Otro</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">Presupuesto Estimado</label>
                                      <select 
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                                        value={appRequest.budget}
                                        onChange={(e) => setAppRequest({...appRequest, budget: e.target.value})}
                                      >
                                          <option>$5 - $20 BCV (Básico)</option>
                                          <option>$20 - $50 BCV (Intermedio)</option>
                                          <option>$50+ BCV (Avanzado)</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">Detalles de la idea</label>
                                      <textarea 
                                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white h-24"
                                          placeholder="Describe brevemente qué necesitas que haga la app..."
                                          value={appRequest.details}
                                          onChange={(e) => setAppRequest({...appRequest, details: e.target.value})}
                                      />
                                  </div>
                              </>
                          )}

                          {/* DESIGN FORM */}
                          {activeService === 'DESIGN' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">¿Qué necesitas?</label>
                                      <select 
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                                        value={designRequest.type}
                                        onChange={(e) => setDesignRequest({...designRequest, type: e.target.value})}
                                      >
                                          <option>Logo Profesional</option>
                                          <option>Flyer Publicitario</option>
                                          <option>Banner para Redes</option>
                                          <option>Tarjeta de Presentación Digital</option>
                                          <option>Paquete Completo de Branding</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">Estilo Preferido</label>
                                      <select 
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                                        value={designRequest.style}
                                        onChange={(e) => setDesignRequest({...designRequest, style: e.target.value})}
                                      >
                                          <option>Minimalista y Moderno</option>
                                          <option>Llamativo y Colorido</option>
                                          <option>Serio y Corporativo</option>
                                          <option>Urbano / Tech</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">Detalles / Colores</label>
                                      <textarea 
                                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white h-24"
                                          placeholder="Colores de marca, referencias o textos a incluir..."
                                          value={designRequest.details}
                                          onChange={(e) => setDesignRequest({...designRequest, details: e.target.value})}
                                      />
                                  </div>
                              </>
                          )}

                          {/* ADS FORM */}
                          {activeService === 'ADS' && (
                              <>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">Selecciona un Plan</label>
                                      <div className="grid grid-cols-1 gap-3">
                                          {[PlanType.INICIAL, PlanType.PRO, PlanType.PREMIUM].map((pType) => {
                                              const pConfig = landingContent?.plans?.[pType];
                                              if(!pConfig) return null;
                                              const isSelected = adsRequest.plan === pType;
                                              return (
                                                  <div 
                                                    key={pType}
                                                    onClick={() => setAdsRequest({...adsRequest, plan: pType as PlanType})}
                                                    className={`cursor-pointer p-3 rounded-xl border flex justify-between items-center transition-all ${isSelected ? 'bg-indigo-900/40 border-indigo-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-750'}`}
                                                  >
                                                      <div>
                                                          <span className={`block font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{pConfig.title}</span>
                                                          <span className="text-xs text-gray-400">{pConfig.price} {pConfig.period}</span>
                                                      </div>
                                                      {isSelected && <Check className="w-5 h-5 text-indigo-400" />}
                                                  </div>
                                              )
                                          })}
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-gray-400 mb-1">Duración</label>
                                      <select 
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                                        value={adsRequest.duration}
                                        onChange={(e) => setAdsRequest({...adsRequest, duration: e.target.value})}
                                      >
                                          <option>1 Mes</option>
                                          <option>3 Meses (Descuento)</option>
                                          <option>6 Meses</option>
                                      </select>
                                  </div>
                              </>
                          )}
                          
                          <button
                            onClick={() => handleServiceRequest(activeService)}
                            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all transform hover:-translate-y-1
                                ${activeService === 'APP' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30' : ''}
                                ${activeService === 'DESIGN' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/30' : ''}
                                ${activeService === 'ADS' ? 'bg-green-600 hover:bg-green-500 shadow-green-500/30' : ''}
                            `}
                          >
                              <MessageCircle className="w-5 h-5" />
                              Solicitar por WhatsApp
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 shadow-xl rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-6 border-b border-gray-800 pb-4">Editar Detalles del Listado</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-400">Nombre del Negocio *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm bg-gray-800 border-gray-700 rounded-lg text-white p-2.5"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-400">Categoría *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full py-2.5 px-3 border border-gray-700 bg-gray-800 text-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-400">Descripción *</label>
                            <textarea
                                name="description"
                                rows={3}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm bg-gray-800 border-gray-700 rounded-lg text-white p-2.5"
                            />
                        </div>

                        {/* --- FILE UPLOAD AREA START --- */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Imagen de Portada / Logo *</label>
                            <div 
                                className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all group relative
                                    ${isUploading ? 'border-indigo-500 bg-indigo-900/20' : isDragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 hover:bg-gray-800/50 hover:border-indigo-500'}
                                    ${!isUploading && 'cursor-pointer'}
                                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <div className="text-center text-white">
                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
                                        <p className="mt-2 text-sm font-medium">Subiendo imagen...</p>
                                    </div>
                                ) : formData.imageUrl ? (
                                    <div className="relative w-full h-48 group-hover:opacity-90 transition-opacity">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-lg" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                                            <p className="text-white font-bold flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Cambiar Imagen</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, imageUrl: ''}); }}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-500 z-10"
                                            title="Eliminar imagen"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center py-4">
                                        <div className="mx-auto h-12 w-12 text-gray-500 group-hover:text-indigo-400 transition-colors bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div className="flex text-sm text-gray-400 justify-center">
                                            <span className="relative cursor-pointer bg-transparent rounded-md font-bold text-indigo-400 hover:text-indigo-300 focus-within:outline-none">
                                                Sube un archivo
                                            </span>
                                            <p className="pl-1">o arrastra y suelta</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                                    </div>
                                )}
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                            </div>
                        </div>
                        {/* --- FILE UPLOAD AREA END --- */}

                         <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-400">Número de WhatsApp *</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-700 bg-gray-800 text-gray-400 sm:text-sm">
                                    <select
                                        value={whatsappPrefix}
                                        onChange={(e) => setWhatsappPrefix(e.target.value)}
                                        className="h-full py-0 pl-3 pr-7 border-transparent bg-transparent text-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-l-lg sm:text-sm cursor-pointer"
                                        style={{ minWidth: '80px' }}
                                    >
                                        {COUNTRY_CODES.map((country) => (
                                            <option key={`${country.code}-${country.label}`} value={country.code} className="bg-gray-900 text-white">
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                </span>
                                <input
                                    type="text"
                                    name="whatsappLocal"
                                    required
                                    placeholder="5512345678"
                                    value={whatsappLocal}
                                    onChange={(e) => setWhatsappLocal(e.target.value)}
                                    className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-800 border-gray-700 text-white border-l-0"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Selecciona tu país e ingresa el número sin el código (+).</p>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-400">Ciudad / Ubicación</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm bg-gray-800 border-gray-700 rounded-lg text-white p-2.5"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-400">Sitio Web</label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} className="mt-1 block w-full sm:text-sm bg-gray-800 border-gray-700 rounded-lg text-white p-2.5" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-400">Usuario Instagram</label>
                            <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="mt-1 block w-full sm:text-sm bg-gray-800 border-gray-700 rounded-lg text-white p-2.5" />
                        </div>
                         <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-400">Usuario Facebook</label>
                            <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} className="mt-1 block w-full sm:text-sm bg-gray-800 border-gray-700 rounded-lg text-white p-2.5" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-800">
                        <button
                            type="submit"
                            className="ml-3 inline-flex justify-center py-2.5 px-6 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5"
                        >
                            Guardar Listado
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* Interactive Preview Section */}
        <div className="lg:col-span-1">
             <div className="sticky top-24">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white">Vista Previa</h3>
                    <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded-lg border border-green-900/50 animate-pulse">
                        En Vivo
                    </span>
                 </div>
                 
                 {/* Business Card Preview - Now Interactive */}
                 <div className="transform transition-all duration-300 hover:scale-[1.02] max-w-sm mx-auto">
                    <BusinessCard 
                        business={previewBusiness} 
                        onLike={() => {}} // Dummy like function
                        compact={true} // Reduces vertical height
                    />
                 </div>

                 <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                     <p className="text-sm text-gray-400 text-center flex flex-col gap-2">
                         <span>👇</span>
                         <span>Prueba tus enlaces haciendo clic en los botones de <strong>WhatsApp</strong> y <strong>Redes Sociales</strong> arriba.</span>
                     </p>
                 </div>
             </div>
        </div>
      </div>

      {/* FLOATING SUPPORT CHAT BUTTON */}
      {adminWhatsapp && (
          <a
            href={`https://wa.me/${adminWhatsapp}?text=Hola Admin, necesito ayuda con mi negocio: ${formData.name || 'Nuevo Negocio'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 group flex items-center justify-center p-4 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-500 transition-all duration-300 hover:scale-110"
            title="Chat con Soporte / Admin"
          >
             <MessageCircle className="w-8 h-8" />
             <span className="absolute right-full mr-4 bg-white text-gray-900 px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                Chat con Soporte
             </span>
          </a>
      )}
    </div>
  );
};

export default ClientDashboard;