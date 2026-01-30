import React, { useState, useEffect, Suspense, lazy, useRef, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Business, User, UserRole, BusinessStatus, LandingContent, PlanType, BusinessContextType } from './types';
import Layout from './components/Layout';
import { Shield, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { AppContext } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

// --- LAZY LOADING ---
const DirectoryPage = lazy(() => import('./DirectoryPage'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const ClientDashboard = lazy(() => import('./ClientDashboard'));
const LandingPage = lazy(() => import('./LandingPage'));

// --- CONFIGURACIÓN ---
const ADMIN_EMAIL = 'williams.cuamo@gmail.com';

// --- CACHE KEYS ---
const LANDING_CONTENT_CACHE_KEY = 'ubika_landing_content_v2';
const BUSINESSES_CACHE_KEY = 'ubika_businesses_v2';
const USER_PROFILE_CACHE_KEY = 'ubika_user_profile_v2';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

// --- COMPONENTES AUXILIARES ---
// Utility for async timeouts mejorada
const promiseWithTimeout = <T,>(
  promise: Promise<T>, 
  ms: number, 
  operationName = 'operación',
  timeoutError = new Error(`Tiempo de espera agotado para ${operationName}`)
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    timeoutId = setTimeout(() => {
      console.warn(`⏰ Timeout después de ${ms}ms para ${operationName}`);
      reject(timeoutError);
    }, ms);
    
    promise.then(
      (res) => { 
        cleanup();
        resolve(res); 
      },
      (err) => { 
        cleanup();
        reject(err); 
      }
    ).catch((err) => {
      cleanup();
      reject(err);
    });
  });
};

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
    <p className="text-sm font-medium animate-pulse">Cargando aplicación...</p>
  </div>
);

const ConnectionErrorPage = ({ error, onRetry }: { error: string, onRetry: () => void }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-red-800 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Error de Conexión</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <div className="space-y-3">
          <button 
            onClick={onRetry}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
          >
            Reintentar
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
          >
            Volver al Inicio
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Si el problema persiste, verifica tu conexión a internet o intenta más tarde.
          <br />
          <span className="opacity-75 block mt-2">(Nota: Si usas la versión gratuita de Supabase, el proyecto podría estar pausado por inactividad. Reactívalo desde su panel).</span>
        </p>
      </div>
    </div>
  );
};

const AuthPage: React.FC<{ isAdminLogin?: boolean }> = ({ isAdminLogin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const safetyTimer = setTimeout(() => {
      if (isMounted.current && loading) {
        setLoading(false);
        setError("La operación está tardando demasiado. Por favor verifica tu conexión a internet.");
      }
    }, 25000);

    try {
      // Validación básica del email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error("Por favor ingresa un correo electrónico válido.");
      }

      if (isAdminLogin) {
        if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          throw new Error("⛔ ACCESO DENEGADO: Este panel es exclusivo para el Administrador Único.");
        }
      }

      const AUTH_TIMEOUT = 15000; // Reducido a 15 segundos

      if (isSignUp && !isAdminLogin) {
        if (!fullName.trim()) {
          throw new Error("Por favor ingresa tu nombre completo.");
        }
        console.log("📝 Intentando registro para:", email);
        const { data, error: signUpError } = await promiseWithTimeout(
          supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password.trim(),
            options: { 
              data: { 
                full_name: fullName.trim(), 
                role: 'CLIENT' 
              }
            }
          }),
          AUTH_TIMEOUT,
          'registro'
        );
        
        if (signUpError) {
          console.error("❌ Error en registro:", signUpError);
          if (signUpError.message.includes('User already registered')) {
            throw new Error("Este correo ya está registrado. Por favor inicia sesión.");
          } else if (signUpError.message.includes('Invalid email')) {
            throw new Error("Correo electrónico inválido. Por favor verifica.");
          } else if (signUpError.status === 422) {
            throw new Error("Datos inválidos. Verifica tu correo y contraseña.");
          } else {
            throw signUpError;
          }
        }
        
        if (data.user && !data.session) {
          if (isMounted.current) {
            setLoading(false);
            alert('✅ Registro exitoso. Por favor verifica tu correo electrónico para activar tu cuenta.');
            setIsSignUp(false);
            setEmail('');
            setPassword('');
          }
          return;
        }
      } else {
        console.log("🔐 Intentando login para:", email);
        const { data, error: signInError } = await promiseWithTimeout(
          supabase.auth.signInWithPassword({ 
            email: email.trim().toLowerCase(), 
            password: password.trim() 
          }),
          AUTH_TIMEOUT,
          'login'
        );
        
        if (signInError) {
          console.error("❌ Error en login:", signInError);
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error("Credenciales incorrectas. Verifica tu correo y contraseña.");
          } else if (signInError.message.includes('Email not confirmed')) {
            throw new Error("Por favor verifica tu correo electrónico antes de iniciar sesión.");
          } else {
            throw new Error("Error al iniciar sesión: " + signInError.message);
          }
        }
        
        if (!data.session) {
          throw new Error("No se pudo iniciar sesión. Por favor intenta nuevamente.");
        }
      }

      // Forzar actualización del estado global
      await login();
      
    } catch (err: any) {
      console.error("❌ Error en autenticación:", err);
      if (isMounted.current) {
        if (err.message.includes('Tiempo de espera agotado')) {
          setError("El servidor está respondiendo lentamente. Por favor intenta nuevamente.");
        } else {
          setError(err.message || 'Error de autenticación. Por favor intenta nuevamente.');
        }
        setLoading(false);
      }
    } finally {
      clearTimeout(safetyTimer);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 text-center relative overflow-hidden">
        {isAdminLogin && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>}
        
        <div className="mb-6 flex justify-center">
          <div className={`p-4 rounded-full ring-1 ${isAdminLogin ? 'bg-red-500/10 ring-red-500/30' : 'bg-indigo-500/10 ring-indigo-500/30'}`}>
            {isAdminLogin ? <Shield className={`w-10 h-10 ${isAdminLogin ? 'text-red-400' : 'text-indigo-400'}`} /> : <UserIcon className="w-10 h-10 text-indigo-400" />}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {isAdminLogin ? 'Acceso Administrativo' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
        </h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 text-sm p-3 rounded-lg mb-4 font-semibold flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 text-left">
          {isSignUp && !isAdminLogin && (
            <div>
              <label className="text-xs text-gray-400 font-bold ml-1">Nombre Completo</label>
              <input 
                type="text" 
                required 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="Tu nombre y apellido"
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 font-bold ml-1">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder={isAdminLogin ? "admin@email.com" : "tucorreo@ejemplo.com"}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-bold ml-1">Contraseña</label>
            <input 
              type="password" 
              required 
              minLength={6} 
              placeholder="Mínimo 6 caracteres" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-3 rounded-xl font-bold text-white transition-all flex justify-center items-center gap-2 ${isAdminLogin ? 'bg-red-600 hover:bg-red-500 disabled:bg-red-800' : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800'}`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Registrarse' : 'Ingresar')}
          </button>
        </form>

        {!isAdminLogin && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }} 
              className="text-sm text-gray-400 hover:text-white underline"
              disabled={loading}
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ 
  user: User | null, 
  loading: boolean, 
  allowedRoles: UserRole[], 
  children: React.ReactNode 
}> = ({ user, loading, allowedRoles, children }) => {
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    console.log(`⛔ Acceso denegado. Rol: ${user.role}, Permitidos: ${allowedRoles.join(', ')}`);
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Helper para manejo de caché con TTL
const cacheManager = {
  set(key: string, data: any, ttl = CACHE_TTL) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn(`⚠️ Error al guardar en caché (${key}):`, e);
    }
  },

  get(key: string): any | null {
    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;
      
      const item = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar si el caché ha expirado
      if (now - item.timestamp > item.ttl) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (e) {
      console.warn(`⚠️ Error al leer del caché (${key}):`, e);
      return null;
    }
  },

  remove(key: string) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn(`⚠️ Error al remover del caché (${key}):`, e);
    }
  },

  clearAll() {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('⚠️ Error al limpiar caché:', e);
    }
  }
};

const App: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [landingContent, setLandingContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const initialized = useRef(false);
  const loadingProfileForId = useRef<string | null>(null);
  const pendingOperations = useRef<Set<string>>(new Set());
  const lastAuthEventRef = useRef<string>('');

  useEffect(() => {
    if (!currentUser?.liked_business_ids) return;
    const likedIds = new Set(currentUser.liked_business_ids);
    setBusinesses(prevBusinesses =>
      prevBusinesses.map(business => {
        const isLiked = likedIds.has(business.id);
        if (business.liked_by_user !== isLiked) {
          return {
            ...business,
            liked_by_user: isLiked
          };
        }
        return business;
      })
    );
  }, [currentUser?.liked_business_ids]);

  // Efecto para actualizar el Favicon dinámicamente según el logo de la app
  useEffect(() => {
    if (landingContent?.app_logo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = landingContent.app_logo;
    }
  }, [landingContent]);

  // Función ligera para verificar conexión (Equivalente a SELECT 1)
  const checkConnection = async () => {
    // Intentamos obtener solo 1 ID de la tabla más ligera para "despertar" la base de datos
    // o verificar si está activa sin cargar todos los datos pesados.
    const { error } = await supabase.from('landing_content').select('id').limit(1).single();
    if (error) throw error;
  };

  useEffect(() => {
    isMounted.current = true;
    document.title = "Ubika";

    const initializeApp = async () => {
      console.log("🚀 App Montada. Iniciando secuencia de carga optimizada...");

      // 1. Cargar datos desde caché para una UI instantánea
      try {
        const cachedLanding = cacheManager.get(LANDING_CONTENT_CACHE_KEY);
        const cachedBusinesses = cacheManager.get(BUSINESSES_CACHE_KEY);
        const cachedUser = cacheManager.get(USER_PROFILE_CACHE_KEY);

        if (cachedLanding) {
          console.log("📦 Landing content cargado desde caché.");
          setLandingContent(cachedLanding);
        }
        if (cachedBusinesses) {
          console.log("📦 Negocios cargados desde caché.");
          setBusinesses(cachedBusinesses);
        }
        if (cachedUser) {
          console.log("👤 Perfil de usuario cargado desde caché.");
          setCurrentUser(cachedUser);
        }
      } catch (e) {
        console.warn("⚠️ Error al leer desde caché:", e);
      }

      // 1.5. Verificación de salud (Ping / Keep-Alive check)
      try {
        await promiseWithTimeout(
          checkConnection(),
          5000,
          'verificación_conexión'
        );
      } catch (error) {
        console.warn("⚠️ La base de datos podría estar dormida o pausada:", error);
        // No lanzamos error aquí para permitir que fetchInitialData intente y maneje el error UI
      }

      // 2. Obtener sesión actual de manera rápida
      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await promiseWithTimeout(
          sessionPromise,
          5000, // Solo 5 segundos para obtener sesión
          'obtener_sesión'
        );

        if (error) throw error;

        if (session?.user) {
          // Cargar perfil SIN timeout primero desde caché
          const userKey = `user_${session.user.id}`;
          if (!pendingOperations.current.has(userKey)) {
            pendingOperations.current.add(userKey);
            await loadUserProfile(session.user, true); // Primera carga rápida
            pendingOperations.current.delete(userKey);
          }
        }
      } catch (error) {
        console.warn("⚠️ No se pudo obtener sesión inicial rápidamente:", error);
      }

      // 3. Configurar el listener de autenticación (solo una vez)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted.current) return;
        
        // Prevenir eventos duplicados
        const eventKey = `${event}_${session?.user?.id || 'no_user'}`;
        if (lastAuthEventRef.current === eventKey) {
          console.log(`⏭️ Evento duplicado omitido: ${event}`);
          return;
        }
        lastAuthEventRef.current = eventKey;

        console.log(`🔄 Evento de Auth: ${event}, Sesión: ${!!session}`);

        if (session?.user) {
          const userKey = `user_${session.user.id}`;
          if (!pendingOperations.current.has(userKey)) {
            pendingOperations.current.add(userKey);
            await loadUserProfile(session.user, false); // Carga completa
            pendingOperations.current.delete(userKey);
          }
        } else {
          // Limpiar caché de usuario al cerrar sesión
          cacheManager.remove(USER_PROFILE_CACHE_KEY);
          setCurrentUser(null);
        }

        if (loading) {
          console.log("✅ Estado de sesión inicial resuelto. Finalizando carga principal.");
          setLoading(false);
        }
      });

      // 4. Cargar datos frescos en segundo plano
      fetchInitialData();

      // 5. Forzar fin de carga después de un tiempo máximo
      const maxLoadTime = setTimeout(() => {
        if (isMounted.current && loading) {
          console.log("⏰ Tiempo máximo de carga alcanzado. Mostrando UI.");
          setLoading(false);
        }
      }, 8000); // 8 segundos máximo

      return () => {
        console.log("🧹 Limpiando App y listener de autenticación.");
        isMounted.current = false;
        clearTimeout(maxLoadTime);
        subscription.unsubscribe();
      };
    };

    if (!initialized.current) {
      initialized.current = true;
      initializeApp();
    }

    return () => { isMounted.current = false; };
  }, []);

  const toggleLike = async (businessId: string) => {
    // --- Authenticated User Logic ---
    if (currentUser) {
      if (currentUser.businessId === businessId) {
        alert("No puedes dar 'Me Gusta' a tu propio negocio.");
        return;
      }

      const isCurrentlyLiked = !!currentUser.liked_business_ids?.includes(businessId);

      // Optimistic UI Update
      setCurrentUser(prev => {
        if (!prev) return null;
        const newLikedIds = isCurrentlyLiked
          ? prev.liked_business_ids?.filter(id => id !== businessId)
          : [...(prev.liked_business_ids || []), businessId];
        return { ...prev, liked_business_ids: newLikedIds };
      });
      setBusinesses(prev => prev.map(b => 
        b.id === businessId 
          ? { ...b, likes: isCurrentlyLiked ? b.likes - 1 : b.likes + 1 } 
          : b
      ));

      // Backend call
      const { error } = await supabase.rpc('toggle_like', { business_id_to_toggle: businessId });

      if (error) {
        console.error("Error al procesar el 'Me Gusta' (autenticado):", error);
        alert("Hubo un error al procesar tu 'Me Gusta'.");
        // Revert optimistic updates by refetching everything
        fetchInitialData();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await loadUserProfile(session.user, false);
      }
      return;
    }

    // --- Guest User Logic ---
    const GUEST_LIKES_KEY = 'guest_likes';
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    try {
      const guestLikes = JSON.parse(localStorage.getItem(GUEST_LIKES_KEY) || '{}');
      const lastLikeTimestamp = guestLikes[businessId];

      if (lastLikeTimestamp && (now - lastLikeTimestamp < twentyFourHours)) {
        alert('Ya has dado "Me Gusta" a este negocio en las últimas 24 horas.');
        return;
      }

      // Optimistic UI update for guest
      setBusinesses(prev => prev.map(b => 
        b.id === businessId ? { ...b, likes: b.likes + 1, liked_by_user: true } : b
      ));

      const { error } = await supabase.rpc('increment_like', { business_id_to_update: businessId });

      if (error) throw error;

      guestLikes[businessId] = now;
      localStorage.setItem(GUEST_LIKES_KEY, JSON.stringify(guestLikes));

    } catch (error) {
      console.error("Error en 'Me Gusta' de invitado:", error);
      alert("Hubo un error al procesar tu 'Me Gusta'.");
      await fetchInitialData(); // Revert on error
    }
  };

  const loadUserProfile = async (authUser: any, quickLoad = false) => {
    if (!isMounted.current || loadingProfileForId.current === authUser.id) {
      if (loadingProfileForId.current === authUser.id) {
        console.log(`⏳ Petición para perfil ${authUser.id} ya en curso. Omitiendo.`);
      }
      return;
    }

    loadingProfileForId.current = authUser.id;
    const operationId = `user_profile_${Date.now()}`;
    console.log(`👤 [${operationId}] Cargando perfil para: ${authUser.email} (quick: ${quickLoad})`);

    try {
      const isSystemAdmin = authUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (isSystemAdmin) {
        const adminUser = {
          id: authUser.id,
          email: authUser.email,
          name: 'Administrador',
          role: UserRole.ADMIN,
          liked_business_ids: []
        };
        if (isMounted.current) {
          setCurrentUser(adminUser);
          cacheManager.set(USER_PROFILE_CACHE_KEY, adminUser);
          console.log("👑 Usuario establecido como Admin");
        }
        return;
      }

      // Para usuarios CLIENT - estrategia optimizada
      if (quickLoad) {
        // Carga rápida: solo datos esenciales
        const quickProfile = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.email.split('@')[0],
          role: UserRole.CLIENT,
          businessId: null,
          liked_business_ids: []
        };

        if (isMounted.current) {
          setCurrentUser(quickProfile);
          console.log("⚡ Perfil rápido cargado");
        }

        // Programar carga completa en segundo plano
        setTimeout(() => {
          if (isMounted.current && currentUser?.id === authUser.id) {
            loadUserProfile(authUser, false);
          }
        }, 1000);
        return;
      }

      console.log("📋 Buscando perfil completo en base de datos...");

      // Carga completa con timeout ajustado
      // CORRECCIÓN: Ejecutar las consultas con await
      const profilePromise = supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
      const likesPromise = supabase.from('business_likes').select('business_id').eq('user_id', authUser.id).limit(100);

      // Ejecutar las promesas
      const combinedPromise = Promise.allSettled([
        profilePromise.then(({ data, error }) => ({ data, error })),
        likesPromise.then(({ data, error }) => ({ data, error }))
      ]);

      const [profileResult, likesResult] = await promiseWithTimeout(
        combinedPromise,
        10000, // 10 segundos para carga completa
        'carga_perfil_completo'
      );

      // Manejo de resultados de Promise.allSettled
      const profileData = profileResult.status === 'fulfilled' ? profileResult.value : { data: null, error: profileResult.reason };
      const likesDataResult = likesResult.status === 'fulfilled' ? likesResult.value : { data: null, error: likesResult.reason };

      const { data: profile, error } = profileData;
      const { data: likesData, error: likesError } = likesDataResult;

      // Si falla la carga de likes, no bloqueamos la app
      if (likesError) {
        console.warn("⚠️ No se pudieron cargar los 'Me Gusta':", likesError);
      }
      const likedBusinessIds = likesData ? likesData.map((l: any) => l.business_id) : [];

      let userData: User;

      if (error || !profile) {
        console.warn("🤔 Perfil no encontrado, creando uno nuevo...");
        userData = await createUserProfile(authUser);
        userData.liked_business_ids = likedBusinessIds;
      } else {
        userData = {
          id: authUser.id,
          email: authUser.email,
          name: profile.full_name || authUser.email.split('@')[0],
          role: UserRole.CLIENT,
          businessId: profile.business_id,
          liked_business_ids: likedBusinessIds
        };
        console.log("✅ Perfil completo encontrado");
      }

      if (isMounted.current) {
        setCurrentUser(userData);
        cacheManager.set(USER_PROFILE_CACHE_KEY, userData, 2 * 60 * 1000); // 2 minutos para perfil
        console.log("✅ Usuario establecido en estado");
      }

    } catch (e: any) {
      console.error(`❌ [${operationId}] Error cargando perfil de usuario:`, e.message);
      
      // No mostrar error si es un timeout, usar datos mínimos
      const fallbackUser = { 
        id: authUser.id, 
        name: authUser.email.split('@')[0] || 'Usuario', 
        email: authUser.email, 
        role: UserRole.CLIENT,
        liked_business_ids: []
      };
      
      if (isMounted.current) {
        setCurrentUser(fallbackUser);
        console.log("⚠️ Usuario establecido como fallback");
      }
    } finally {
      loadingProfileForId.current = null;
    }
  };

  const createUserProfile = async (authUser: any): Promise<User> => {
    console.log("🛠️ Creando perfil para:", authUser.email);
    
    try {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.email.split('@')[0],
          role: 'CLIENT'
        }])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error al crear perfil:", insertError);
        return {
          id: authUser.id,
          email: authUser.email,
          name: authUser.email.split('@')[0],
          role: UserRole.CLIENT,
          businessId: null
        };
      }

      console.log("✅ Perfil creado exitosamente");
      
      return {
        id: authUser.id,
        email: authUser.email,
        name: newProfile.full_name,
        role: UserRole.CLIENT,
        businessId: newProfile.business_id
      };
    } catch (error) {
      console.error("❌ Error creando perfil:", error);
      return {
        id: authUser.id,
        email: authUser.email,
        name: authUser.email.split('@')[0],
        role: UserRole.CLIENT,
        businessId: null
      };
    }
  };

  const fetchInitialData = async () => {
    const defaultContent: LandingContent = {
      app_name: "Williams Josè",
      cta_text: "Ver Servicios",
      hero_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
      hero_title: "Impulso Digital & Tecnología",
      admin_whatsapp: "584123456789",
      hero_description: "Transformamos tu negocio con Apps a Medida, Diseño Gráfico y Publicidad.",
      plans: {
        [PlanType.FREE]: { title: 'Básico', price: '$0', period: '/mes', buttonText: 'Gratis', description: 'Ideal para comenzar.', features: ['Listado Básico'] },
        [PlanType.INICIAL]: { title: 'Inicial', price: '$2', period: '/mes', buttonText: 'Comenzar', description: 'Visibilidad mejorada.', features: ['Listado Destacado'] },
        [PlanType.PRO]: { title: 'Profesional', price: '$5', period: '/mes', buttonText: 'Destacar', description: 'Para crecimiento.', features: ['Máxima exposición'] },
        [PlanType.PREMIUM]: { title: 'Empresarial', price: '$10', period: '/mes', buttonText: 'Maximizar', description: 'Todo incluido.', features: ['Publicidad Masiva'] }
      }
    };

    try {
      console.log("📊 Petición de datos frescos (landing y negocios)...");
      
      // CORRECCIÓN: Crear promesas que ejecuten las consultas
      const createLandingPromise = async () => {
        const { data, error } = await supabase.from('landing_content').select('*').single();
        return { data, error };
      };

      const createBusinessesPromise = async () => {
        const { data, error } = await supabase.from('businesses').select('*');
        return { data, error };
      };

      // Usar Promise.all para cargar en paralelo pero con timeout individual
      const fetchLanding = promiseWithTimeout(
        createLandingPromise(),
        8000,
        'carga_landing'
      );

      const fetchBusinesses = promiseWithTimeout(
        createBusinessesPromise(),
        10000,
        'carga_negocios'
      );

      const [landingResult, businessResult] = await Promise.allSettled([
        fetchLanding,
        fetchBusinesses
      ]);

      // Procesar landing content
      if (landingResult.status === 'fulfilled') {
        const { data: landingData, error: landingError } = landingResult.value;
        if (landingError) {
          console.log("⚠️ No se encontró contenido de landing, usando valores por defecto");
          if (isMounted.current) {
            setLandingContent(defaultContent);
            cacheManager.set(LANDING_CONTENT_CACHE_KEY, defaultContent);
          }
        } else if (isMounted.current) {
          const freshContent = landingData?.content || defaultContent;
          setLandingContent(freshContent);
          cacheManager.set(LANDING_CONTENT_CACHE_KEY, freshContent);
          console.log("✅ Landing content cargado");
        }
      } else {
        console.warn("⚠️ Falló carga de landing, usando caché/default");
        const cached = cacheManager.get(LANDING_CONTENT_CACHE_KEY);
        if (isMounted.current) {
          setLandingContent(cached || defaultContent);
        }
      }

      // Procesar negocios
      if (businessResult.status === 'fulfilled') {
        const { data: businessData, error: businessError } = businessResult.value;
        
        if (businessError) {
          console.error("❌ Error cargando negocios:", businessError);
          // Usar caché si existe
          const cached = cacheManager.get(BUSINESSES_CACHE_KEY);
          if (cached && isMounted.current) {
            setBusinesses(cached);
          }
        } else if (businessData && isMounted.current) {
          const mappedBusinesses = businessData.map((b: any) => ({
            id: b.id,
            ownerId: b.owner_id,
            name: b.name,
            category: b.category,
            description: b.description,
            imageUrl: b.image_url,
            whatsapp: b.whatsapp,
            location: b.location,
            website: b.website,
            instagram: b.instagram,
            facebook: b.facebook,
            status: b.status as BusinessStatus,
            likes: b.likes,
            createdAt: b.created_at,
            plan: b.plan as PlanType,
            planExpiresAt: b.plan_expires_at,
            adminNote: b.admin_note
          }));
          setBusinesses(mappedBusinesses);
          cacheManager.set(BUSINESSES_CACHE_KEY, mappedBusinesses);
          console.log(`✅ ${mappedBusinesses.length} negocios cargados`);
        }
      } else {
        console.warn("⚠️ Falló carga de negocios, usando caché");
        const cached = cacheManager.get(BUSINESSES_CACHE_KEY);
        if (cached && isMounted.current) {
          setBusinesses(cached);
        }
      }
    } catch (e: any) { 
      console.error("❌ Error en fetchInitialData:", e.message); 
      // Mantener datos en caché si existen
      if (isMounted.current) {
        const cachedLanding = cacheManager.get(LANDING_CONTENT_CACHE_KEY) || defaultContent;
        const cachedBusinesses = cacheManager.get(BUSINESSES_CACHE_KEY) || [];
        setLandingContent(cachedLanding);
        setBusinesses(cachedBusinesses);
      }
    }
  };

  const logout = async () => { 
    console.log("👋 Cerrando sesión...");
    await supabase.auth.signOut(); 
    setCurrentUser(null);
    cacheManager.remove(USER_PROFILE_CACHE_KEY);
    console.log("✅ Sesión cerrada");
  };
  
  const createBusiness = async (data: Partial<Business>) => { 
    if (!currentUser) return;
    try {
      const dbData = { 
        owner_id: currentUser.id, 
        name: data.name, 
        category: data.category, 
        description: data.description, 
        image_url: data.imageUrl, 
        whatsapp: data.whatsapp, 
        location: data.location, 
        website: data.website, 
        instagram: data.instagram, 
        facebook: data.facebook, 
        status: BusinessStatus.PENDING, 
        plan: PlanType.FREE 
      };
      const { data: inserted, error } = await supabase.from('businesses').insert([dbData]).select().single();
      
      if (error) throw error;
      
      if (inserted) {
        await fetchInitialData();
        alert("✅ Negocio creado correctamente. Esperando aprobación.");
      }
    } catch (error: any) {
      console.error("❌ Error creando negocio:", error);
      alert("❌ Error al crear: " + error.message);
    }
  };

  const updateBusiness = async (id: string, data: Partial<Business>) => { 
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.category !== undefined) dbData.category = data.category;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
    if (data.whatsapp !== undefined) dbData.whatsapp = data.whatsapp;
    if (data.location !== undefined) dbData.location = data.location;
    if (data.website !== undefined) dbData.website = data.website;
    if (data.instagram !== undefined) dbData.instagram = data.instagram;
    if (data.facebook !== undefined) dbData.facebook = data.facebook;
    if (data.status !== undefined) dbData.status = data.status;
    if (data.plan !== undefined) dbData.plan = data.plan;
    if (data.planExpiresAt !== undefined) dbData.plan_expires_at = data.planExpiresAt;
    if (data.adminNote !== undefined) dbData.admin_note = data.adminNote;

    const { error } = await supabase.from('businesses').update(dbData).eq('id', id);
    
    if (error) {
      console.error("❌ Error actualizando negocio:", error);
      alert("❌ Error al guardar cambios: " + error.message);
    } else {
      await fetchInitialData();
    }
  };

  const deleteBusiness = async (id: string): Promise<boolean> => {
    console.log(`🗑️ Iniciando eliminación completa para el negocio: ${id}`);
    const businessToDelete = businesses.find(b => b.id === id);

    if (!businessToDelete) {
      console.error(`❌ No se encontró el negocio con ID: ${id}`);
      return false;
    }

    try {
      // 1. Eliminar imagen de Supabase Storage
      if (businessToDelete.imageUrl && businessToDelete.imageUrl.includes('supabase.co')) {
        const path = businessToDelete.imageUrl.split('/business-images/')[1];
        if (path) {
          console.log(`🖼️ Eliminando imagen de storage: ${path}`);
          const { error: storageError } = await supabase.storage.from('business-images').remove([path]);
          if (storageError) {
            // No bloquear la eliminación si falla, pero registrar el error
            console.error("⚠️ Error al eliminar la imagen del storage:", storageError.message);
          }
        }
      }

      // 2. Actualizar perfil del propietario para desvincular el negocio
      if (businessToDelete.ownerId) {
        console.log(`👤 Desvinculando negocio del perfil: ${businessToDelete.ownerId}`);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ business_id: null })
          .eq('id', businessToDelete.ownerId);
        if (profileError) {
          console.error("⚠️ Error al actualizar el perfil del propietario:", profileError.message);
        }
      }

      // 3. Eliminar el registro del negocio (esto elimina en cascada los 'likes')
      console.log(`🗑️ Eliminando registro del negocio de la base de datos...`);
      const { error: deleteError } = await supabase.from('businesses').delete().eq('id', id);
      if (deleteError) throw deleteError;

      // 4. Actualizar estado y caché recargando los datos
      await fetchInitialData();

      console.log(`✅ Eliminación completa del negocio ${id} finalizada.`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error fatal durante la eliminación del negocio ${id}:`, error.message);
      return false;
    }
  };

  const updateLandingContent = async (data: Partial<LandingContent>) => { 
    const newContent = { ...landingContent, ...data };
    if (isMounted.current) {
      setLandingContent(newContent as LandingContent);
      cacheManager.set(LANDING_CONTENT_CACHE_KEY, newContent);
    }
    await supabase.from('landing_content').upsert({ id: 1, content: newContent });
  };

  const handleLogin = async () => {
    console.log("🔄 Forzando carga de sesión...");
    try {
      const { data: { session } } = await promiseWithTimeout(
        supabase.auth.getSession(),
        5000,
        'login_manual'
      );
      
      if (session?.user) {
        await loadUserProfile(session.user, false);
        return true;
      }
    } catch (error) {
      console.error("❌ Error forzando carga de sesión:", error);
    }
    return false;
  };

  const handleRetry = () => {
    setConnectionError(null);
    setLoading(true);
    // Limpiar cachés antes de reintentar
    cacheManager.remove(LANDING_CONTENT_CACHE_KEY);
    cacheManager.remove(BUSINESSES_CACHE_KEY);
    cacheManager.remove(USER_PROFILE_CACHE_KEY);
    window.location.reload();
  };

  const contextValue: BusinessContextType = {
    businesses, 
    currentUser, 
    landingContent,
    login: handleLogin, 
    logout,
    updateBusiness, 
    createBusiness, 
    toggleLike, 
    deleteBusiness, 
    updateLandingContent
  };

  if (connectionError) {
    return <ConnectionErrorPage error={connectionError} onRetry={handleRetry} />;
  }

  if (loading) {
    return <PageLoader />;
  }

  console.log("🚀 Renderizando App, usuario actual:", currentUser?.email || "No autenticado");

  return (
    <ToastProvider>
      <AppContext.Provider value={contextValue}>
        <HashRouter>
          <Layout currentUser={currentUser} onLogout={logout}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/login" element={
                  currentUser ? <Navigate replace to={currentUser.role === UserRole.ADMIN ? "/admin" : "/client"} /> : <AuthPage />
                } />
                <Route path="/admin-login" element={
                  currentUser ? <Navigate replace to={currentUser.role === UserRole.ADMIN ? "/admin" : "/client"} /> : <AuthPage isAdminLogin={true} />
                } />
                <Route path="/admin" element={
                  <ProtectedRoute 
                    user={currentUser} 
                    loading={loading} 
                    allowedRoles={[UserRole.ADMIN]}
                  >
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/client" element={
                  <ProtectedRoute 
                    user={currentUser} 
                    loading={loading} 
                    allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]}
                  >
                    <ClientDashboard />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </HashRouter>
      </AppContext.Provider>
    </ToastProvider>
  );
};

export default App;