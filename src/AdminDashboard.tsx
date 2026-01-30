import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AppContext } from './context/AppContext';
import { Trash2, Settings, Save, Layout, ChevronDown, MessageCircle, CalendarClock, CreditCard, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import { BusinessStatus, PlanType, PlanConfig } from './types';
import { useToast } from './context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { businesses, updateBusiness, deleteBusiness, landingContent, updateLandingContent } = useContext(AppContext);
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');
  
  // Settings States
  const toast = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  
  // File Upload State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settingsForm, setSettingsForm] = useState({
      app_name: '',
      app_logo: '',
      admin_whatsapp: ''
  });

  const [plansForm, setPlansForm] = useState<Record<PlanType, PlanConfig> | undefined>(undefined);

  useEffect(() => {
      if (landingContent) {
          setSettingsForm({
              app_name: landingContent.app_name || '',
              app_logo: landingContent.app_logo || '',
              admin_whatsapp: landingContent.admin_whatsapp || ''
          });
          setPlansForm(landingContent.plans);
      }
  }, [landingContent]);

  const handleSaveSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      await updateLandingContent(settingsForm);
      toast.addToast('Configuración actualizada correctamente', 'success');
      setShowSettings(false);
  };

  const handleSavePlans = async (e: React.FormEvent) => {
      e.preventDefault();
      if (plansForm) {
          await updateLandingContent({ plans: plansForm });
          toast.addToast('Planes actualizados correctamente', 'success');
          setShowPlanEditor(false);
      }
  };

  // --- FILE UPLOAD HANDLERS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
        // Create local preview URL
        const objectUrl = URL.createObjectURL(file);
        setSettingsForm({ ...settingsForm, app_logo: objectUrl });
    } else if (file) {
        toast.addToast('Por favor sube un archivo de imagen válido (PNG, JPG).', 'error');
    }
  };

  const handlePlanChange = (planType: PlanType, field: keyof PlanConfig, value: any) => {
      if (!plansForm) return;
      
      setPlansForm({
          ...plansForm,
          [planType]: {
              ...plansForm[planType],
              [field]: value
          }
      });
  };

  const handleFeaturesChange = (planType: PlanType, text: string) => {
      if (!plansForm) return;
      const features = text.split('\n').filter(line => line.trim() !== '');
      setPlansForm({
          ...plansForm,
          [planType]: {
              ...plansForm[planType],
              features: features
          }
      });
  };

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: businesses.length,
      pending: businesses.filter(b => b.status === BusinessStatus.PENDING).length,
      approved: businesses.filter(b => b.status === BusinessStatus.APPROVED).length,
      totalLikes: businesses.reduce((acc, curr) => acc + curr.likes, 0)
    };
  }, [businesses]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    businesses.forEach(b => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [businesses]);

  const COLORS = ['#6366f1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const handleStatusChange = (id: string, status: BusinessStatus) => {
      updateBusiness(id, { status });
  };

  const handleBusinessPlanChange = (id: string, plan: PlanType) => {
      updateBusiness(id, { plan });
  };

  const handleExpirationChange = (id: string, dateStr: string) => {
      updateBusiness(id, { 
          planExpiresAt: dateStr || null,
          adminNote: dateStr ? `Tu plan estará vigente hasta el ${new Date(dateStr).toLocaleDateString()}` : undefined
      });
  };

  const handleDelete = async (id: string) => {
      if(window.confirm("¿Estás seguro de que deseas eliminar este listado? Esta acción es PERMANENTE y eliminará la imagen, los 'Me Gusta' y todos los datos asociados.")){
          const success = await deleteBusiness(id);
          if (success) {
            toast.addToast('Negocio eliminado permanentemente.', 'success');
          } else {
            toast.addToast('Error al eliminar el negocio. Revisa la consola para más detalles.', 'error');
          }
      }
  }

  const filteredList = businesses.filter(b => filterStatus === 'ALL' || b.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <div className="flex gap-3">
             <button 
                onClick={() => { setShowPlanEditor(!showPlanEditor); setShowSettings(false); }}
                className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-colors ${showPlanEditor ? 'bg-green-600 text-white border-green-500' : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'}`}
            >
                <CreditCard className="w-5 h-5" />
                Gestión de Planes
            </button>
            <button 
                onClick={() => { setShowSettings(!showSettings); setShowPlanEditor(false); }}
                className={`flex items-center gap-2 border px-4 py-2 rounded-xl transition-colors ${showSettings ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'}`}
            >
                <Settings className="w-5 h-5" />
                Configuración del Sitio
            </button>
        </div>
      </div>

      {/* Global Settings Panel */}
      {showSettings && (
          <div className="bg-gray-900 shadow-2xl rounded-2xl p-6 mb-10 border border-gray-800 animate-fade-in">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                  <Layout className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-xl font-semibold text-white">Identidad de la Aplicación</h2>
              </div>
              <form onSubmit={handleSaveSettings} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                      <label className="block text-sm font-medium text-gray-400">Nombre de la App</label>
                      <input 
                          type="text" 
                          value={settingsForm.app_name}
                          onChange={(e) => setSettingsForm({...settingsForm, app_name: e.target.value})}
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Ej: Mi Directorio Local"
                      />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-400">Número WhatsApp (Soporte)</label>
                      <input 
                          type="text" 
                          value={settingsForm.admin_whatsapp}
                          onChange={(e) => setSettingsForm({...settingsForm, admin_whatsapp: e.target.value})}
                          className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Ej: 5551234567"
                      />
                  </div>
                   
                   {/* App Logo Drag & Drop */}
                   <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Logo de la App</label>
                      <div 
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all group cursor-pointer relative
                                ${isDragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 hover:bg-gray-800/50 hover:border-indigo-500'}
                            `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {settingsForm.app_logo ? (
                                <div className="relative w-32 h-32 group-hover:opacity-90 transition-opacity">
                                    <img src={settingsForm.app_logo} alt="Logo Preview" className="w-full h-full object-contain rounded-lg bg-gray-800 p-2" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                                        <p className="text-white text-xs font-bold flex flex-col items-center gap-1">
                                            <ImageIcon className="w-4 h-4"/> Cambiar
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setSettingsForm({...settingsForm, app_logo: ''}); }}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-500 z-10"
                                        title="Eliminar logo"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center py-2">
                                    <div className="mx-auto h-10 w-10 text-gray-500 group-hover:text-indigo-400 transition-colors bg-gray-800 rounded-full flex items-center justify-center mb-2">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div className="flex text-sm text-gray-400 justify-center">
                                        <span className="relative cursor-pointer bg-transparent rounded-md font-bold text-indigo-400 hover:text-indigo-300 focus-within:outline-none">
                                            Sube un logo
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG transparente recomendado</p>
                                </div>
                            )}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </div>
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-3">
                       <button 
                          type="button" 
                          onClick={() => setShowSettings(false)}
                          className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800"
                       >
                          Cancelar
                       </button>
                       <button 
                          type="submit" 
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                       >
                          <Save className="w-4 h-4" />
                          Guardar Identidad
                       </button>
                  </div>
              </form>
          </div>
      )}

      {/* Plans Editor Panel */}
      {showPlanEditor && plansForm && (
          <div className="bg-gray-900 shadow-2xl rounded-2xl p-6 mb-10 border border-gray-800 animate-fade-in">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                  <CreditCard className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-semibold text-white">Editar Planes y Precios</h2>
              </div>
              <form onSubmit={handleSavePlans}>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {[PlanType.FREE, PlanType.INICIAL, PlanType.PRO, PlanType.PREMIUM].map((planType) => (
                          <div key={planType} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col h-full">
                              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 uppercase">
                                  {planType === PlanType.FREE ? <div className="w-3 h-3 rounded-full bg-gray-400 shadow-sm shadow-gray-400"></div> :
                                   planType === PlanType.INICIAL ? <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500"></div> :
                                   planType === PlanType.PRO ? <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500"></div> :
                                   <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500"></div>}
                                  Plan {planType}
                              </h3>
                              
                              <div className="space-y-4 flex-grow">
                                  <div>
                                      <label className="text-xs text-gray-400 font-semibold mb-1 block">Título Visible</label>
                                      <input 
                                          type="text" 
                                          value={plansForm[planType].title} 
                                          onChange={(e) => handlePlanChange(planType, 'title', e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                                      />
                                  </div>
                                  <div className="flex gap-2">
                                      <div className="flex-1">
                                          <label className="text-xs text-gray-400 font-semibold mb-1 block">Precio</label>
                                          <input 
                                              type="text" 
                                              value={plansForm[planType].price} 
                                              onChange={(e) => handlePlanChange(planType, 'price', e.target.value)}
                                              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                                          />
                                      </div>
                                      <div className="flex-1">
                                          <label className="text-xs text-gray-400 font-semibold mb-1 block">Periodo</label>
                                          <input 
                                              type="text" 
                                              value={plansForm[planType].period} 
                                              onChange={(e) => handlePlanChange(planType, 'period', e.target.value)}
                                              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                                          />
                                      </div>
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-400 font-semibold mb-1 block">Descripción Corta</label>
                                      <input 
                                          type="text" 
                                          value={plansForm[planType].description} 
                                          onChange={(e) => handlePlanChange(planType, 'description', e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                                      />
                                  </div>
                                   <div>
                                      <label className="text-xs text-gray-400 font-semibold mb-1 block">Texto del Botón (CTA)</label>
                                      <input 
                                          type="text" 
                                          value={plansForm[planType].buttonText} 
                                          onChange={(e) => handlePlanChange(planType, 'buttonText', e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                                          placeholder="Ej: Comenzar"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-400 font-semibold mb-1 block">Características (Una por línea)</label>
                                      <textarea 
                                          rows={6}
                                          value={plansForm[planType].features.join('\n')} 
                                          onChange={(e) => handleFeaturesChange(planType, e.target.value)}
                                          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-sm text-white font-mono leading-tight focus:ring-1 focus:ring-indigo-500"
                                      />
                                  </div>
                                  <div className="bg-gray-900 p-2 rounded-lg border border-gray-700">
                                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                                          <input 
                                              type="checkbox"
                                              checked={plansForm[planType].isPopular || false}
                                              onChange={(e) => handlePlanChange(planType, 'isPopular', e.target.checked)}
                                              className="rounded border-gray-600 text-indigo-600 bg-gray-900 w-4 h-4 focus:ring-0 focus:ring-offset-0"
                                          />
                                          <span>Marcar como "Popular"</span>
                                      </label>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-800">
                       <button 
                          type="button" 
                          onClick={() => setShowPlanEditor(false)}
                          className="px-6 py-2.5 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
                       >
                          Cancelar
                       </button>
                       <button 
                          type="submit" 
                          className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 shadow-lg shadow-green-900/20 flex items-center gap-2 font-bold transition-all transform hover:-translate-y-0.5"
                       >
                          <Save className="w-5 h-5" />
                          Guardar Cambios
                       </button>
                  </div>
              </form>
          </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-lg rounded-2xl p-5">
          <dt className="text-sm font-medium text-gray-400 truncate">Total de Listados</dt>
          <dd className="mt-1 text-3xl font-semibold text-white">{metrics.total}</dd>
        </div>
        <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-lg rounded-2xl p-5">
          <dt className="text-sm font-medium text-gray-400 truncate">Pendientes de Revisión</dt>
          <dd className="mt-1 text-3xl font-semibold text-amber-500">{metrics.pending}</dd>
        </div>
        <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-lg rounded-2xl p-5">
          <dt className="text-sm font-medium text-gray-400 truncate">Activos (Aprobados)</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-500">{metrics.approved}</dd>
        </div>
        <div className="bg-gray-900 border border-gray-800 overflow-hidden shadow-lg rounded-2xl p-5">
          <dt className="text-sm font-medium text-gray-400 truncate">Total de Me Gusta</dt>
          <dd className="mt-1 text-3xl font-semibold text-pink-500">{metrics.totalLikes}</dd>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg h-80">
          <h3 className="text-lg font-medium text-white mb-4">Listados por Categoría</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" fontSize={12} tickFormatter={(val) => val.slice(0, 10)} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg h-80">
            <h3 className="text-lg font-medium text-white mb-4">Distribución</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                         contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="bg-gray-900 border border-gray-800 shadow-lg rounded-2xl overflow-hidden mb-12">
        <div className="px-6 py-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-medium leading-6 text-white">Gestión de Clientes y Planes</h3>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block rounded-lg border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="ALL">Todos los Estados</option>
              <option value={BusinessStatus.PENDING}>Pendiente</option>
              <option value={BusinessStatus.APPROVED}>Aprobado</option>
              <option value={BusinessStatus.REJECTED}>Rechazado</option>
              <option value={BusinessStatus.PAUSED}>Pausado</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Negocio</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan & Vencimiento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {filteredList.map((business) => (
                <tr key={business.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full object-cover bg-gray-700" src={business.imageUrl} alt="" onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/40'} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{business.name}</div>
                        <div className="text-xs text-gray-500">{business.ownerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                        {/* Plan Selector */}
                        <div className="relative">
                            <select
                                value={business.plan}
                                onChange={(e) => handleBusinessPlanChange(business.id, e.target.value as PlanType)}
                                className={`block w-full pl-3 pr-8 py-1.5 text-xs font-bold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                                ${business.plan === PlanType.PREMIUM ? 'bg-purple-900/40 text-purple-300 border border-purple-700 hover:bg-purple-900/60 focus:ring-purple-500' :
                                    business.plan === PlanType.PRO ? 'bg-blue-900/40 text-blue-300 border border-blue-700 hover:bg-blue-900/60 focus:ring-blue-500' :
                                    business.plan === PlanType.INICIAL ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-700 hover:bg-cyan-900/60 focus:ring-cyan-500' :
                                    'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 focus:ring-gray-500'}`}
                            >
                                <option value={PlanType.FREE}>BÁSICO</option>
                                <option value={PlanType.INICIAL}>INICIAL</option>
                                <option value={PlanType.PRO}>PRO</option>
                                <option value={PlanType.PREMIUM}>PREMIUM</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                                <ChevronDown className="h-3 w-3" />
                            </div>
                        </div>
                        
                        {/* Expiration Date Input - Only visual if plan is not free or if setting cancellation */}
                        <div className="flex items-center gap-1">
                            <CalendarClock className="w-3 h-3 text-gray-500" />
                            <input 
                                type="date" 
                                className="bg-transparent border-0 border-b border-gray-700 text-xs text-gray-300 p-0 focus:ring-0 focus:border-indigo-500 w-full"
                                value={business.planExpiresAt?.split('T')[0] || ''}
                                onChange={(e) => handleExpirationChange(business.id, e.target.value)}
                                title="Fecha de Vencimiento del Plan"
                            />
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                        <select
                            value={business.status}
                            onChange={(e) => handleStatusChange(business.id, e.target.value as BusinessStatus)}
                            className={`block w-full pl-3 pr-8 py-1.5 text-xs font-bold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                                ${business.status === BusinessStatus.APPROVED ? 'bg-green-900/50 text-green-200 border-green-800 hover:bg-green-900/70' : 
                                business.status === BusinessStatus.PENDING ? 'bg-yellow-900/50 text-yellow-200 border-yellow-800 hover:bg-yellow-900/70' :
                                business.status === BusinessStatus.REJECTED ? 'bg-red-900/50 text-red-200 border-red-800 hover:bg-red-900/70' : 
                                'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                        >
                            <option value={BusinessStatus.PENDING}>Pendiente</option>
                            <option value={BusinessStatus.APPROVED}>Aprobado</option>
                            <option value={BusinessStatus.REJECTED}>Rechazado</option>
                            <option value={BusinessStatus.PAUSED}>Pausado</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                            <ChevronDown className="h-3 w-3" />
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(business.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                        {/* WhatsApp Contact for Admin */}
                        <a 
                            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}?text=Hola, te contacto desde la administración de BizConnect sobre tu negocio "${business.name}"`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-400 bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                            title="Chat por WhatsApp"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </a>

                        <button onClick={() => handleDelete(business.id)} className="text-gray-500 hover:text-red-400 bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Eliminar Listado">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
