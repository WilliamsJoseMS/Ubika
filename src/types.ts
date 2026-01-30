import { createContext } from 'react';

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  VISITOR = 'VISITOR'
}

export enum BusinessStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAUSED = 'PAUSED'
}

export enum PlanType {
  FREE = 'FREE',
  INICIAL = 'INICIAL',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  liked_business_ids?: string[];
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  whatsapp: string;
  location?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  status: BusinessStatus;
  likes: number;
  createdAt: string;
  plan: PlanType;
  planExpiresAt?: string | null;
  adminNote?: string;
  liked_by_user?: boolean;
}

export interface PlanConfig {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

export interface LandingContent {
  id?: number;
  hero_title: string;
  hero_description: string;
  hero_image: string;
  cta_text: string;
  app_name?: string;
  app_logo?: string;
  admin_whatsapp?: string;
  plans?: Record<PlanType, PlanConfig>;
}

export interface BusinessContextType {
  businesses: Business[];
  currentUser: User | null;
  landingContent: LandingContent | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateBusiness: (id: string, data: Partial<Business>) => Promise<void>;
  createBusiness: (data: Partial<Business>) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  deleteBusiness: (id: string) => Promise<boolean>;
  updateLandingContent: (data: Partial<LandingContent>) => Promise<void>;
}
