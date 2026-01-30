import { createContext } from 'react';
import { BusinessContextType } from '../types';

// Contexto único y centralizado
export const AppContext = createContext<BusinessContextType>({} as BusinessContextType);