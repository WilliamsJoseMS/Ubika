import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Shield, LogOut, MessageCircle } from 'lucide-react';
import { UserRole } from '../types';
import { AppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: { role: UserRole; name: string } | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { landingContent } = useContext(AppContext);

  const isActive = (path: string) => location.pathname === path;

  // Defaults if content hasn't loaded
  const appName = landingContent?.app_name || 'Ubika';
  const appLogo = landingContent?.app_logo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  const whatsappNumber = landingContent?.admin_whatsapp;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 font-sans">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <img src={appLogo} alt="Logo" className="w-9 h-9 object-contain rounded-md transition-transform group-hover:scale-110" />
                <span className="font-bold text-xl text-white tracking-tight">{appName}</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`${
                    isActive('/') ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                >
                  Inicio
                </Link>
                <Link
                  to="/directory"
                  className={`${
                    isActive('/directory') ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                >
                  Directorio
                </Link>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    Hola, <span className="font-semibold text-gray-200">{currentUser.name}</span>
                  </span>
                  
                  {currentUser.role === UserRole.ADMIN && (
                     <Link
                     to="/admin"
                     className="bg-gray-800 text-indigo-400 border border-gray-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 hover:text-indigo-300 transition-all flex items-center gap-2"
                   >
                     <Shield className="w-4 h-4" />
                     Admin
                   </Link>
                  )}

                  {currentUser.role === UserRole.CLIENT && (
                     <Link
                     to="/client"
                     className="bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl text-sm font-medium hover:bg-indigo-900/50 hover:text-indigo-200 transition-all flex items-center gap-2"
                   >
                     <User className="w-4 h-4" />
                     Mi Negocio
                   </Link>
                  )}

                  <button
                    onClick={onLogout}
                    className="text-gray-500 hover:text-red-400 p-2 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Entrar</Link>
                  <Link to="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5">
                    Únete
                  </Link>
                </div>
              )}
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              >
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden bg-gray-900 border-b border-gray-800`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-white bg-gray-800">Inicio</Link>
            <Link to="/directory" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600">Directorio</Link>
            
            {currentUser && (
              <>
                 {currentUser.role === UserRole.ADMIN && (
                   <Link to="/admin" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600">Panel Admin</Link>
                 )}
                 {currentUser.role === UserRole.CLIENT && (
                   <Link to="/client" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600">Mi Negocio</Link>
                 )}
                 <button onClick={onLogout} className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 hover:border-red-500">
                   Cerrar Sesión
                 </button>
              </>
            )}
            {!currentUser && (
               <Link to="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-indigo-400 hover:text-indigo-300 hover:bg-gray-800 hover:border-indigo-500">Iniciar Sesión / Registrarse</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-950 border-t border-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
             {whatsappNumber && (
                 <a 
                   href={`https://wa.me/${whatsappNumber}`} 
                   target="_blank" 
                   rel="noreferrer"
                   className="text-gray-500 hover:text-green-400 flex items-center gap-1 transition-colors"
                 >
                   <MessageCircle className="w-5 h-5" />
                   <span className="text-sm">Soporte</span>
                 </a>
             )}
            <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Facebook</span>
            <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Instagram</span>
          </div>
          <div className="mt-8 md:mt-0 md:order-1 flex flex-col md:flex-row gap-4 items-center">
            <p className="text-center text-base text-gray-600">&copy; {new Date().getFullYear()} {appName}. Todos los derechos reservados.</p>
            {!currentUser && (
              <Link to="/admin-login" className="text-xs text-gray-700 hover:text-indigo-400 transition-colors">
                Acceso Admin
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
