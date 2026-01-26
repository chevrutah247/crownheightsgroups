import { Location, Category, Group, Suggestion, BannerConfig, ServiceCategory, ServiceContact, EmergencyContact } from './types';

// Sample Locations
export const locations: Location[] = [
  { id: '1', neighborhood: 'Crown Heights', city: 'Brooklyn', state: 'New York', country: 'USA', status: 'approved' },
  { id: '2', neighborhood: 'Williamsburg', city: 'Brooklyn', state: 'New York', country: 'USA', status: 'approved' },
  { id: '3', neighborhood: 'Flatbush', city: 'Brooklyn', state: 'New York', country: 'USA', status: 'approved' },
  { id: '4', neighborhood: 'Boro Park', city: 'Brooklyn', state: 'New York', country: 'USA', status: 'approved' },
  { id: '5', neighborhood: 'Monsey', city: 'Ramapo', state: 'New York', country: 'USA', status: 'approved' },
  { id: '6', neighborhood: 'Lakewood', city: 'Lakewood', state: 'New Jersey', country: 'USA', status: 'approved' },
];

// Sample Categories
export const categories: Category[] = [
  { id: '1', name: 'Community', slug: 'community', icon: '👥' },
  { id: '2', name: 'Business & Jobs', slug: 'business-jobs', icon: '💼' },
  { id: '3', name: 'Education', slug: 'education', icon: '📚' },
  { id: '4', name: 'Events', slug: 'events', icon: '📅' },
  { id: '5', name: 'Health & Wellness', slug: 'health-wellness', icon: '🏥' },
  { id: '6', name: 'Real Estate', slug: 'real-estate', icon: '🏠' },
  { id: '7', name: 'Kids & Family', slug: 'kids-family', icon: '👨‍👩‍👧‍👦' },
  { id: '8', name: 'Food & Dining', slug: 'food-dining', icon: '🍽️' },
  { id: '9', name: 'Services', slug: 'services', icon: '🔧' },
  { id: '10', name: 'Torah & Learning', slug: 'torah-learning', icon: '📖' },
  { id: '11', name: 'Buy & Sell', slug: 'buy-sell', icon: '🛒' },
  { id: '12', name: 'Rides & Carpool', slug: 'rides-carpool', icon: '🚗' },
];

// Sample Groups
export const groups: Group[] = [
  {
    id: '1',
    title: 'Crown Heights Community Updates',
    description: 'Stay updated with the latest news, events and announcements in Crown Heights. A central hub for our community.',
    whatsappLink: 'https://chat.whatsapp.com/example1',
    categoryId: '1',
    locationId: '1',
    language: 'English',
    tags: ['news', 'updates', 'community'],
    status: 'approved',
    clicksCount: 1523,
    createdAt: '2024-01-15',
    isPinned: true,
    pinnedOrder: 1
  },
  {
    id: '2',
    title: 'CH Jobs & Opportunities',
    description: 'Job postings, business opportunities, and career advice for Crown Heights residents.',
    whatsappLink: 'https://chat.whatsapp.com/example2',
    categoryId: '2',
    locationId: '1',
    language: 'English',
    tags: ['jobs', 'employment', 'business'],
    status: 'approved',
    clicksCount: 982,
    createdAt: '2024-01-20',
    isPinned: true,
    pinnedOrder: 1
  },
  {
    id: '3',
    title: 'Crown Heights Moms',
    description: 'A supportive group for mothers in Crown Heights. Share tips, arrange playdates, and connect with other moms.',
    whatsappLink: 'https://chat.whatsapp.com/example3',
    categoryId: '7',
    locationId: '1',
    language: 'English',
    tags: ['moms', 'parenting', 'kids'],
    status: 'approved',
    clicksCount: 756,
    createdAt: '2024-02-01',
    isPinned: true,
    pinnedOrder: 1
  },
  {
    id: '4',
    title: 'CH Real Estate Listings',
    description: 'Apartments for rent, homes for sale, and roommate searches in Crown Heights area.',
    whatsappLink: 'https://chat.whatsapp.com/example4',
    categoryId: '6',
    locationId: '1',
    language: 'English',
    tags: ['apartments', 'rentals', 'housing'],
    status: 'approved',
    clicksCount: 1245,
    createdAt: '2024-02-10',
    isPinned: true,
    pinnedOrder: 1
  },
  {
    id: '5',
    title: 'Daily Shiurim & Learning',
    description: 'Daily Torah classes, shiurim schedules, and learning partnerships in Crown Heights.',
    whatsappLink: 'https://chat.whatsapp.com/example5',
    categoryId: '10',
    locationId: '1',
    language: 'English',
    tags: ['torah', 'shiurim', 'learning'],
    status: 'approved',
    clicksCount: 634,
    createdAt: '2024-02-15',
    isPinned: true,
    pinnedOrder: 1
  },
  {
    id: '6',
    title: 'CH Buy & Sell',
    description: 'Buy, sell, and trade items within the Crown Heights community. Furniture, electronics, clothing and more.',
    whatsappLink: 'https://chat.whatsapp.com/example6',
    categoryId: '11',
    locationId: '1',
    language: 'English',
    tags: ['marketplace', 'buy', 'sell'],
    status: 'approved',
    clicksCount: 2103,
    createdAt: '2024-02-20',
    isPinned: true,
    pinnedOrder: 1
  },
  {
    id: '7',
    title: 'Carpool to Manhattan',
    description: 'Daily carpool coordination between Crown Heights and Manhattan. Share rides and save money.',
    whatsappLink: 'https://chat.whatsapp.com/example7',
    categoryId: '12',
    locationId: '1',
    language: 'English',
    tags: ['carpool', 'commute', 'rides'],
    status: 'approved',
    clicksCount: 445,
    createdAt: '2024-03-01'
  },
  {
    id: '8',
    title: 'CH Events & Simchos',
    description: 'Community events, simchos, and celebrations in Crown Heights. Never miss a special occasion.',
    whatsappLink: 'https://chat.whatsapp.com/example8',
    categoryId: '4',
    locationId: '1',
    language: 'English',
    tags: ['events', 'simchos', 'celebrations'],
    status: 'approved',
    clicksCount: 867,
    createdAt: '2024-03-05'
  },
  {
    id: '9',
    title: 'Williamsburg Community',
    description: 'General community group for Williamsburg residents. News, updates, and discussions.',
    whatsappLink: 'https://chat.whatsapp.com/example9',
    categoryId: '1',
    locationId: '2',
    language: 'English',
    status: 'approved',
    clicksCount: 1102,
    createdAt: '2024-03-10'
  },
  {
    id: '10',
    title: 'Lakewood Jobs Board',
    description: 'Employment opportunities and job postings in the Lakewood area.',
    whatsappLink: 'https://chat.whatsapp.com/example10',
    categoryId: '2',
    locationId: '6',
    language: 'English',
    status: 'approved',
    clicksCount: 789,
    createdAt: '2024-03-15'
  },
  {
    id: '11',
    title: 'CH Health & Medical',
    description: 'Health tips, doctor recommendations, and medical resources for Crown Heights.',
    whatsappLink: 'https://chat.whatsapp.com/example11',
    categoryId: '5',
    locationId: '1',
    language: 'English',
    status: 'approved',
    clicksCount: 321,
    createdAt: '2024-03-20'
  },
  {
    id: '12',
    title: 'Crown Heights Food Deals',
    description: 'Restaurant deals, food specials, and dining recommendations in Crown Heights.',
    whatsappLink: 'https://chat.whatsapp.com/example12',
    categoryId: '8',
    locationId: '1',
    language: 'English',
    status: 'approved',
    clicksCount: 556,
    createdAt: '2024-03-25'
  },
  {
    id: '13',
    title: 'Tanya Daily Study',
    description: 'Join our daily Tanya study group. We follow the Chitas schedule and discuss each day\'s portion.',
    whatsappLink: 'https://chat.whatsapp.com/example13',
    categoryId: '10',
    locationId: '1',
    language: 'English',
    tags: ['tanya', 'chitas', 'chassidus'],
    status: 'approved',
    clicksCount: 412,
    createdAt: '2024-03-28'
  },
  {
    id: '14',
    title: 'Gemara Shiur - Evenings',
    description: 'Evening Gemara learning group for men. Currently studying Bava Metzia.',
    whatsappLink: 'https://chat.whatsapp.com/example14',
    categoryId: '10',
    locationId: '1',
    language: 'English',
    tags: ['gemara', 'talmud', 'shiur'],
    status: 'approved',
    clicksCount: 289,
    createdAt: '2024-04-01'
  },
];

// Sample Suggestions (pending)
export const suggestions: Suggestion[] = [
  {
    id: '1',
    type: 'group',
    payload: {
      title: 'CH Tutoring Services',
      description: 'Connect tutors and students in Crown Heights',
      whatsappLink: 'https://chat.whatsapp.com/newgroup1',
      categoryId: '3',
      locationId: '1',
    },
    status: 'pending',
    contactEmail: 'user@example.com',
    createdAt: '2024-04-01'
  },
  {
    id: '2',
    type: 'location',
    payload: {
      neighborhood: 'Marine Park',
      city: 'Brooklyn',
      state: 'New York',
      country: 'USA',
    },
    status: 'pending',
    createdAt: '2024-04-02'
  },
];

// Banner Configuration
export const bannerConfig: BannerConfig = {
  enabled: true,
  title: '🎉 Welcome to Crown Heights Groups!',
  text: 'Find and join WhatsApp groups in your community.',
  buttonText: 'Learn More',
  buttonLink: '/about'
};

// Emergency Contacts (always visible at top)
export const emergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Hatzolah',
    phone: '718-230-1000',
    icon: '🚑',
    color: '#e53e3e',
    order: 1
  },
  {
    id: '2',
    name: 'Shomrim',
    phone: '718-774-3333',
    icon: '🛡️',
    color: '#3182ce',
    order: 2
  },
  {
    id: '3',
    name: 'Chaveirim',
    phone: '718-431-8181',
    icon: '🚗',
    color: '#38a169',
    order: 3
  },
];

// Service Categories (professions)
export const serviceCategories: ServiceCategory[] = [
  { id: '1', name: 'Plumber', nameRu: 'Сантехник', slug: 'plumber', icon: '🔧', order: 1 },
  { id: '2', name: 'Electrician', nameRu: 'Электрик', slug: 'electrician', icon: '⚡', order: 2 },
  { id: '3', name: 'Taxi / Driver', nameRu: 'Таксист', slug: 'taxi', icon: '🚕', order: 3 },
  { id: '4', name: 'SIM Cards', nameRu: 'СИМ-карты', slug: 'sim-cards', icon: '📱', order: 4 },
  { id: '5', name: 'Notary', nameRu: 'Нотариус', slug: 'notary', icon: '📜', order: 5 },
  { id: '6', name: 'Locksmith', nameRu: 'Локсмит', slug: 'locksmith', icon: '🔐', order: 6 },
  { id: '7', name: 'Musicians', nameRu: 'Музыканты', slug: 'musicians', icon: '🎵', order: 7 },
  { id: '8', name: 'Tile Worker', nameRu: 'Плиточник', slug: 'tile', icon: '🧱', order: 8 },
  { id: '9', name: 'Glass Worker', nameRu: 'Стекольщик', slug: 'glass', icon: '🪟', order: 9 },
  { id: '10', name: 'Painter', nameRu: 'Маляр', slug: 'painter', icon: '🎨', order: 10 },
  { id: '11', name: 'Carpenter', nameRu: 'Плотник', slug: 'carpenter', icon: '🪚', order: 11 },
  { id: '12', name: 'HVAC / AC', nameRu: 'Кондиционеры', slug: 'hvac', icon: '❄️', order: 12 },
  { id: '13', name: 'Cleaning', nameRu: 'Уборка', slug: 'cleaning', icon: '🧹', order: 13 },
  { id: '14', name: 'Moving', nameRu: 'Переезды', slug: 'moving', icon: '📦', order: 14 },
  { id: '15', name: 'Handyman', nameRu: 'Мастер на все руки', slug: 'handyman', icon: '🛠️', order: 15 },
];

// Sample Service Contacts
export const serviceContacts: ServiceContact[] = [
  {
    id: '1',
    name: 'Moshe Plumbing',
    phone: '718-555-0101',
    categoryId: '1',
    description: 'Emergency plumbing services 24/7. Licensed and insured.',
    languages: ['English', 'Hebrew', 'Russian'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-10',
    isPinned: true
  },
  {
    id: '2',
    name: 'David Electric',
    phone: '718-555-0102',
    secondPhone: '347-555-0102',
    categoryId: '2',
    description: 'Residential and commercial electrical work.',
    languages: ['English', 'Hebrew'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    name: 'Crown Heights Taxi',
    phone: '718-555-0103',
    categoryId: '3',
    description: 'Airport transfers, local rides, long distance.',
    languages: ['English', 'Russian'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-15',
    isPinned: true
  },
  {
    id: '4',
    name: 'Shmuel SIM Cards',
    phone: '718-555-0104',
    categoryId: '4',
    description: 'Prepaid SIM cards, international plans, phone repairs.',
    languages: ['English', 'Hebrew', 'Yiddish'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-18'
  },
  {
    id: '5',
    name: 'Notary Public - Sarah',
    phone: '718-555-0105',
    categoryId: '5',
    description: 'Mobile notary services. Available evenings and Sundays.',
    languages: ['English', 'Russian'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-20'
  },
  {
    id: '6',
    name: 'Quick Lock Service',
    phone: '718-555-0106',
    categoryId: '6',
    description: '24/7 lockout service, lock installation and repair.',
    languages: ['English', 'Hebrew'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-22',
    isPinned: true
  },
  {
    id: '7',
    name: 'Simcha Band',
    phone: '718-555-0107',
    categoryId: '7',
    description: 'Live music for weddings, bar mitzvahs, and events.',
    languages: ['English', 'Hebrew'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-25'
  },
  {
    id: '8',
    name: 'Pro Tile Installation',
    phone: '718-555-0108',
    categoryId: '8',
    description: 'Kitchen and bathroom tile work. Free estimates.',
    languages: ['English', 'Russian'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-01-28'
  },
  {
    id: '9',
    name: 'Crystal Glass Works',
    phone: '718-555-0109',
    categoryId: '9',
    description: 'Window repair, glass doors, mirrors, custom glass.',
    languages: ['English'],
    locationId: '1',
    status: 'approved',
    createdAt: '2024-02-01'
  },
];

// Helper functions for services
export function getServiceCategoryById(id: string): ServiceCategory | undefined {
  return serviceCategories.find(c => c.id === id);
}

export function getServiceCategoryBySlug(slug: string): ServiceCategory | undefined {
  return serviceCategories.find(c => c.slug === slug);
}

export function getApprovedServiceContacts(): ServiceContact[] {
  return serviceContacts.filter(c => c.status === 'approved');
}

export function getServiceContactsByCategory(categoryId: string): ServiceContact[] {
  return serviceContacts.filter(c => c.categoryId === categoryId && c.status === 'approved');
}

// Helper functions
export function getLocationById(id: string): Location | undefined {
  return locations.find(l => l.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

export function getApprovedGroups(): Group[] {
  return groups.filter(g => g.status === 'approved');
}

export function getGroupsByLocation(locationId: string): Group[] {
  return groups.filter(g => g.locationId === locationId && g.status === 'approved');
}

export function getGroupsByCategory(categoryId: string): Group[] {
  return groups.filter(g => g.categoryId === categoryId && g.status === 'approved');
}

export function getApprovedLocations(): Location[] {
  return locations.filter(l => l.status === 'approved');
}

export function getPendingSuggestions(): Suggestion[] {
  return suggestions.filter(s => s.status === 'pending');
}

// Stats
export function getStats() {
  return {
    totalGroups: groups.filter(g => g.status === 'approved').length,
    totalLocations: locations.filter(l => l.status === 'approved').length,
    totalCategories: categories.length,
    pendingSuggestions: suggestions.filter(s => s.status === 'pending').length,
    totalClicks: groups.reduce((sum, g) => sum + g.clicksCount, 0),
  };
}
