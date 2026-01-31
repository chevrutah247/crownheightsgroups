export interface Location {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  status: 'approved' | 'pending';
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  nameRu?: string;
  slug: string;
  icon?: string;
  order?: number;
}

export interface Group {
  id: string;
  title: string;
  description: string;
  whatsappLink?: string;
  whatsappLinks?: string[];
  telegramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  websiteLink?: string;
  categoryId: string;
  locationId: string;
  language?: string;
  tags?: string[];
  status: 'approved' | 'pending' | 'rejected' | 'broken';
  clicksCount: number;
  createdAt: string;
  isPinned?: boolean;
  pinnedOrder?: number;
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

export interface ServiceCategory {
  id: string;
  name: string;
  nameRu?: string;
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
  // NEW: Image fields for business card / logo
  imageUrl?: string;      // Business card or main image
  logoUrl?: string;       // Small logo/icon
  address?: string;       // Physical address
  website?: string;       // Website URL
  email?: string;         // Contact email
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  icon: string;
  color: string;
  order: number;
}

export interface LocationSuggestion {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  suggestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
