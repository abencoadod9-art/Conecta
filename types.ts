
export type UserRole = 'PROFESSIONAL' | 'CLIENT' | 'VENDOR';

export interface Location {
  country: string;
  province: string;
  city: string;
  coordinates?: { lat: number; lng: number };
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  specialty: string;
  location: Location;
  bio: string;
  rating: number;
  reviewCount: number;
  portfolio: string[];
  badges: string[];
  availability: 'FULL_TIME' | 'FREELANCE' | 'REMOTE' | 'HYBRID';
  hourlyRate?: number;
  experienceYears: number;
  avatar: string;
  coverImage: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'PHYSICAL' | 'DIGITAL' | 'COURSE';
  category: string;
  images: string[];
  rating: number;
  stock: number;
  vendorId: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'TEXT' | 'PROPOSAL' | 'FILE';
  metadata?: any;
}

export enum ContractStatus {
  NEGOTIATING = 'NEGOTIATING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Contract {
  id: string;
  clientId: string;
  professionalId: string;
  serviceName: string;
  scope: string;
  price: number;
  deadline: string;
  status: ContractStatus;
  termsAcceptedByClient: boolean;
  termsAcceptedByProfessional: boolean;
}
