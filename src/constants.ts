import { Business, BusinessStatus, PlanType, UserRole, User } from './types';

export const CATEGORIES = [
  // --- FARMACIAS Y SALUD ---
  "Farmacias",
  "Farmacias de Turno",
  "Ópticas",
  "Laboratorios Clínicos",
  "Ortopedias",
  "Suplementos y Vitaminas",
  
  // --- CARNICERÍAS Y PRODUCTOS CÁRNICOS ---
  "Carnicería (Res, Cerdo, Pollo)",
  "Charcutería y Embutidos",
  "Mataderos y Distribuidores",
  "Pollerías",
  "Pesca y Mariscos Frescos",
  
  // --- SUPERMERCADOS Y ABARROTES ---
  "Supermercados",
  "Minimercados",
  "Tiendas de Barrio",
  "Licorerías",
  "Tiendas Orgánicas",
  
  // --- ROPA, BISUTERÍA Y CALZADO ---
  "Ropa para Damas",
  "Ropa para Caballeros",
  "Ropa para Niños",
  "Bisutería y Accesorios",
  "Calzado y Zapatos",
  "Ropa Deportiva",
  "Ropa Interior y Lencería",
  
  // --- SERVICIOS DE STREAMING Y CONTENIDO DIGITAL ---
  "Streamers en Twitch/YouTube",
  "Creadores de TikTok/Instagram",
  "Agencias de Marketing Digital",
  "Productores de Podcast",
  "Editores de Video/Audio",
  
  // --- REPARACIONES Y MANTENIMIENTO ---
  "Electricistas",
  "Plomeros",
  "Cerrajeros",
  "Pintores",
  "Técnicos de Aire Acondicionado",
  
  // --- BELLEZA Y CUIDADO PERSONAL ---
  "Peluquerías",
  "Barberías",
  "Uñas (Manicure/Pedicure)",
  "Depilación",
  "Maquillaje Profesional",
  
  // --- COMIDA RÁPIDA Y DELIVERY ---
  "Pizzerías",
  "Hamburgueserías",
  "Comida China",
  "Comida Mexicana",
  "Comida Internacional",
  "Servicios de Delivery (Glovo, Uber Eats)",
  "Cafeterías de Especialidad",
  
  // --- MASCOTAS ---
  "Veterinarias",
  "Tiendas de Mascotas",
  "Peluquería Canina",
  "Guarderías de Mascotas",
  "Adiestradores",
  
  // --- TALLERES Y CAPACITACIÓN ---
  "Talleres de Carpintería",
  "Costura y Confección",
  "Reparación de Celulares",
  "Cursos de Cocina",
  "Talleres de Arte",
  
  // --- EVENTOS Y CELEBRACIONES ---
  "Salones de Fiestas",
  "Fotógrafos y Video",
  "Catering",
  "Decoración de Eventos",
  "Animadores y Payasos",
  
  // --- AGRICULTURA Y JARDINERÍA ---
  "Viveros",
  "Insumos Agrícolas",
  "Jardinería y Paisajismo",
  "Ferretería Agrícola",
  "Productos Orgánicos Locales",
  
  // --- SERVICIOS FINANCIEROS ---
  "Bancos",
  "Cooperativas",
  "Casas de Cambio",
  "Préstamos Personales",
  "Asesoría Fiscal",
  
  // --- ARTESANÍAS Y MANUALIDADES ---
  "Artesanías Locales",
  "Manualidades para Regalo",
  "Materiales para Scrapbooking",
  "Joyería Artesanal",
  "Cerámica y Barro",
  
  // --- TURISMO Y HOSPEDAJE ---
  "Hoteles y Hostales",
  "Agencias de Viajes",
  "Guías Turísticos",
  "Alquiler de Vehículos",
  "Tours Locales",
  
  // --- SERVICIOS DIGITALES Y STREAMING ---
  "Venta de Cuentas de Streaming (Netflix, Disney+, Spotify)",
  "Suscripciones Digitales",
  "Plataformas de Entretenimiento",
  "Canales de IPTV",
  "Servidores de Películas/Series",
  
  // --- SOFTWARE Y APPS PREMIUM ---
  "Software de Oficina (Microsoft 365, Adobe Creative Cloud)",
  "Aplicaciones Móviles Premium",
  "Licencias de Antivirus y Seguridad",
  "Herramientas de Diseño y Edición",
  "Plataformas de Negocios y Productividad",
  
  // --- SERVICIOS PROFESIONALES ---
  "Abogados",
  "Contadores",
  "Arquitectos",
  "Ingenieros",
  "Diseñadores Gráficos",
  "Desarrolladores Web/Apps",
  
  // --- TRANSPORTE Y LOGÍSTICA ---
  "Transporte de Pasajeros",
  "Mudanzas",
  "Mensajería",
  "Logística y Distribución",
  
  // --- CONSTRUCCIÓN E INMOBILIARIA ---
  "Constructoras",
  "Inmobiliarias",
  "Materiales de Construcción",
  "Arquitectura e Interiorismo",
  "Mantenimiento de Edificios",
  
  // --- EDUCACIÓN Y FORMACIÓN ---
  "Colegios y Escuelas",
  "Institutos Técnicos",
  "Universidades",
  "Cursos Online",
  "Tutores Privados",
  "Idiomas",
  
  // --- DEPORTES Y RECREACIÓN ---
  "Gimnasios",
  "Clubes Deportivos",
  "Tiendas de Deportes",
  "Piscinas",
  "Parques de Diversiones",
  
  // --- SALUD MENTAL Y BIENESTAR ---
  "Psicólogos",
  "Terapeutas",
  "Coaches de Vida",
  "Yoga y Meditación",
  "Centros de Bienestar",
  
  // --- TECNOLOGÍA Y ELECTRÓNICA ---
  "Tiendas de Electrónica",
  "Reparación de Computadoras",
  "Venta de Celulares",
  "Videojuegos",
  "Centros de Copiado e Impresión",
  
  // --- SERVICIOS PARA EL HOGAR ---
  "Limpieza del Hogar",
  "Jardinería Doméstica",
  "Niñeras y Cuidadores",
  "Cocineros a Domicilio",
  "Lavanderías",
  
  // --- COMUNICACIONES Y MEDIOS ---
  "Agencias de Publicidad",
  "Estudios de Fotografía",
  "Productoras Audiovisuales",
  "Periódicos y Revistas",
  "Radios Locales",
  
  // --- ENERGÍA Y SERVICIOS PÚBLICOS ---
  "Compañías Eléctricas",
  "Proveedores de Agua",
  "Gas Natural",
  "Energías Renovables",
  "Telecomunicaciones",
  
  // --- SERVICIOS ESPECIALIZADOS ---
  "Traductores e Intérpretes",
  "Investigadores Privados",
  "Organizadores de Eventos",
  "Asesores de Negocios",
  "Consultores IT",
  
  // --- COMERCIO ELECTRÓNICO ---
  "Tiendas Online",
  "Marketplaces",
  "Dropshipping",
  "Logística E-commerce",
  "Marketing Digital",
  
  // --- SERVICIOS GUBERNAMENTALES ---
  "Registros Civiles",
  "Trámites Municipales",
  "Oficinas Gubernamentales",
  "Servicios Consulares",
  "Permisos y Licencias",
  
  // --- SERVICIOS RELIGIOSOS ---
  "Iglesias y Templos",
  "Centros Espirituales",
  "Libros y Artículos Religiosos",
  "Eventos Religiosos",
  "Asesoría Espiritual",
  
  // --- INDUSTRIA Y MANUFACTURA ---
  "Fábricas",
  "Talleres Industriales",
  "Maquinaria Pesada",
  "Insumos Industriales",
  "Control de Calidad",
  
  // --- SERVICIOS DE EMERGENCIA ---
  "Ambulancias",
  "Bomberos",
  "Policía",
  "Rescate",
  "Centros de Emergencia",
  
  // --- SERVICIOS ESPECIALES ---
  "Trajes de Etiqueta",
  "Alquiler de Vestidos",
  "Joyeros",
  "Relojerías",
  "Antigüedades",
  
  // --- CULTURA Y ENTRETENIMIENTO ---
  "Cines y Teatros",
  "Museos y Galerías",
  "Bibliotecas",
  "Conciertos",
  "Festivales",
  
  // --- SERVICIOS AUTOMOTRICES ---
  "Talleres Mecánicos",
  "Lavado de Autos",
  "Venta de Autos",
  "Repuestos",
  "Llantas y Rines",
  
  // --- SERVICIOS DE LIMPIEZA ---
  "Limpieza de Oficinas",
  "Control de Plagas",
  "Limpieza Industrial",
  "Aseo de Vidrios",
  "Limpieza Profunda",
  
  // --- SERVICIOS DE SEGURIDAD ---
  "Empresas de Seguridad",
  "Alarmas y Cámaras",
  "Vigilancia Privada",
  "Investigación de Fraudes",
  "Custodia de Valores",
  
  // --- SERVICIOS MARÍTIMOS ---
  "Marinas",
  "Alquiler de Botes",
  "Pesca Deportiva",
  "Turismo Marítimo",
  "Reparación de Embarcaciones",
  
  // --- SERVICIOS AÉREOS ---
  "Aerolíneas",
  "Aeropuertos",
  "Escuelas de Aviación",
  "Chárter Privado",
  "Mantenimiento Aeronáutico",
  
  // --- OTRAS CATEGORÍAS ---
  "Otros",
  "Sin Categoría",
  "Nuevos Negocios",
  "Promociones Especiales",
  "Recomendados"
] as const;

export const CATEGORY_GROUPS = {
  "Salud y Farmacias": [
    "Farmacias", "Farmacias de Turno", "Ópticas", "Laboratorios Clínicos", 
    "Ortopedias", "Suplementos y Vitaminas"
  ],
  "Alimentos y Bebidas": [
    "Carnicería (Res, Cerdo, Pollo)", "Charcutería y Embutidos", "Mataderos y Distribuidores", 
    "Pollerías", "Pesca y Mariscos Frescos", "Supermercados", "Minimercados", "Tiendas de Barrio",
    "Licorerías", "Tiendas Orgánicas", "Pizzerías", "Hamburgueserías", "Comida China",
    "Comida Mexicana", "Comida Internacional", "Cafeterías de Especialidad"
  ],
  "Ropa y Moda": [
    "Ropa para Damas", "Ropa para Caballeros", "Ropa para Niños", "Bisutería y Accesorios",
    "Calzado y Zapatos", "Ropa Deportiva", "Ropa Interior y Lencería"
  ],
  "Servicios Digitales": [
    "Streamers en Twitch/YouTube", "Creadores de TikTok/Instagram", "Agencias de Marketing Digital",
    "Productores de Podcast", "Editores de Video/Audio", "Venta de Cuentas de Streaming (Netflix, Disney+, Spotify)",
    "Suscripciones Digitales", "Plataformas de Entretenimiento", "Canales de IPTV", "Servidores de Películas/Series"
  ],
  "Reparaciones y Mantenimiento": [
    "Electricistas", "Plomeros", "Cerrajeros", "Pintores", "Técnicos de Aire Acondicionado",
    "Reparación de Celulares", "Reparación de Computadoras", "Talleres Mecánicos"
  ],
  "Belleza y Cuidado": [
    "Peluquerías", "Barberías", "Uñas (Manicure/Pedicure)", "Depilación", "Maquillaje Profesional"
  ],
  "Mascotas": [
    "Veterinarias", "Tiendas de Mascotas", "Peluquería Canina", "Guarderías de Mascotas", "Adiestradores"
  ],
  "Educación y Talleres": [
    "Talleres de Carpintería", "Costura y Confección", "Cursos de Cocina", "Talleres de Arte",
    "Colegios y Escuelas", "Institutos Técnicos", "Universidades", "Cursos Online", "Tutores Privados", "Idiomas"
  ],
  "Eventos y Celebraciones": [
    "Salones de Fiestas", "Fotógrafos y Video", "Catering", "Decoración de Eventos", "Animadores y Payasos"
  ],
  "Servicios Profesionales": [
    "Abogados", "Contadores", "Arquitectos", "Ingenierios", "Diseñadores Gráficos", 
    "Desarrolladores Web/Apps", "Traductores e Intérpretes", "Investigadores Privados",
    "Asesores de Negocios", "Consultores IT"
  ],
  "Turismo y Viajes": [
    "Hoteles y Hostales", "Agencias de Viajes", "Guías Turísticos", "Alquiler de Vehículos", "Tours Locales"
  ],
  "Software y Tecnología": [
    "Software de Oficina (Microsoft 365, Adobe Creative Cloud)", "Aplicaciones Móviles Premium",
    "Licencias de Antivirus y Seguridad", "Herramientas de Diseño y Edición", "Plataformas de Negocios y Productividad"
  ],
  "Transporte y Logística": [
    "Transporte de Pasajeros", "Mudanzas", "Mensajería", "Logística y Distribución", "Alquiler de Vehículos"
  ],
  "Agricultura y Jardinería": [
    "Viveros", "Insumos Agrícolas", "Jardinería y Paisajismo", "Ferretería Agrícola", "Productos Orgánicos Locales"
  ]
};

export const POPULAR_CATEGORIES = [
  "Farmacias", "Supermercados", "Restaurantes", "Peluquerías", "Electricistas",
  "Plomeros", "Talleres Mecánicos", "Veterinarias", "Tiendas de Ropa", "Reparación de Celulares",
  "Cursos Online", "Gimnasios", "Hoteles", "Agencias de Viajes", "Mudanzas"
];

export const MOCK_USERS: Record<string, User> = {
  ADMIN: {
    id: 'u-admin',
    name: 'Administrador del Sistema',
    email: 'admin@ubika.com',
    role: UserRole.ADMIN
  },
  CLIENT: {
    id: 'u-client-1',
    name: 'Juan Pérez',
    email: 'juan@panaderia.com',
    role: UserRole.CLIENT,
    businessId: 'b-1'
  }
};

export const INITIAL_BUSINESSES: Business[] = [
  // Negocios existentes con categorías actualizadas...
  {
    id: 'b-premium-1',
    ownerId: 'u-p1',
    name: 'GastroPub "El Alquimista"',
    category: 'Comida Internacional',
    description: 'Experiencia culinaria de autor. Coctelería molecular y platos fusionados en el corazón de la ciudad. Música en vivo los fines de semana.',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    whatsapp: '15559998888',
    location: 'Zona Rosa, Av. Principal',
    status: BusinessStatus.APPROVED,
    likes: 342,
    createdAt: '2023-08-15T10:00:00Z',
    plan: PlanType.PREMIUM,
    instagram: 'elalquimista_pub',
    website: 'https://alquimista.example.com',
    facebook: 'elalquimistabarycocina'
  },
  {
    id: 'b-premium-2',
    ownerId: 'u-p2',
    name: 'Constructora & Diseño Skyline',
    category: 'Arquitectura e Interiorismo',
    description: 'Arquitectura moderna y remodelaciones de lujo. Transformamos tus espacios con los mejores materiales y un equipo de arquitectos premiados.',
    imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    whatsapp: '15557776666',
    location: 'Torres Ejecutivas',
    status: BusinessStatus.APPROVED,
    likes: 215,
    createdAt: '2023-09-01T09:00:00Z',
    plan: PlanType.PREMIUM,
    website: 'https://skyline.example.com'
  },
  {
    id: 'b-premium-3',
    ownerId: 'u-p3',
    name: 'Elite Fitness Center',
    category: 'Gimnasios',
    description: 'El gimnasio más completo de la región. Entrenadores personales, área de CrossFit, piscina climatizada y spa incluido.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    whatsapp: '15551113333',
    location: 'Plaza Central',
    status: BusinessStatus.APPROVED,
    likes: 189,
    createdAt: '2023-10-10T08:00:00Z',
    plan: PlanType.PREMIUM,
    instagram: 'elite_fitness_ok'
  },
  // ... otros negocios existentes actualizados con nuevas categorías
];