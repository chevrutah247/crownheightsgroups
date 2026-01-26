export interface Location {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  status: 'approved' | 'pending';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Group {
  id: string;
  title: string;
  description: string;
  whatsappLink: string;
  categoryId: string;
  locationId: string;
  language?: string;
  tags?: string[];
  status: 'approved' | 'pending' | 'rejected';
  clicksCount: number;
  createdAt: string;
  isPinned?: boolean;
  pinnedOrder?: number; // Lower number = higher priority
}

export interface Suggestion {
  id: string;
  type: 'group' | 'location';
  payload: any;
  status: 'pending' | 'approved' | 'rejected';
  contactEmail?: string;
  createdAt: string;
}

export interface BannerConfig {
  enabled: boolean;
  title: string;
  text: string;
  buttonText?: string;
  buttonLink?: string;
}

// Service/Professional contacts
export interface ServiceCategory {
  id: string;
  name: string;
  nameRu?: string; // Russian name
  slug: string;
  icon: string;
  order: number;
}

export interface ServiceContact {
  id: string;
  name: string;
  phone: string;
  secondPhone?: string;
  categoryId: string;
  description?: string;
  languages?: string[];
  locationId?: string;
  status: 'approved' | 'pending';
  createdAt: string;
  isPinned?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  icon: string;
  color: string;
  order: number;
}
