// Crown Heights kosher restaurants, cafes, bakeries, caterers — with hashgacha info.
// Seed data compiled from chkosher.org/listings (Beis Din Crown Heights / CHK),
// crownheights.info, yeahthatskosher, and totallyjewishtravel (April 2026).
// Admin can add/edit/remove via /admin/restaurants.

export type RestaurantType =
  | 'meat'
  | 'dairy'
  | 'parve'
  | 'fish'
  | 'pizza'
  | 'bakery'
  | 'sushi'
  | 'ice-cream'
  | 'catering'
  | 'butcher'
  | 'matzah'
  | 'grocery'
  | 'venue';

export type HashgachaId =
  | 'chk' // Beis Din Crown Heights — CHK
  | 'ou'
  | 'ok'
  | 'star-k'
  | 'kof-k'
  | 'crc-chicago'
  | 'vaad-queens'
  | 'vaad-five-towns'
  | 'crc-williamsburg'
  | 'vkm' // Vaad Kashrus Mehadrin
  | 'national-kosher'
  | 'other';

export interface Hashgacha {
  id: HashgachaId;
  name: string;       // display name
  shortName: string;  // badge abbreviation
  fullName: string;   // formal full name
  website?: string;
  description?: string;
  color: string;      // badge color
  isLocal?: boolean;  // Crown Heights local
}

export const hashgachas: Record<HashgachaId, Hashgacha> = {
  'chk': {
    id: 'chk',
    name: 'CHK',
    shortName: 'CHK',
    fullName: 'Beis Din of Crown Heights — Vaad Hakashrus (CHK)',
    website: 'https://chkosher.org/',
    description: 'The local Crown Heights Rabbinical Court Vaad Hakashrus.',
    color: '#1e3a5f',
    isLocal: true,
  },
  'ou': {
    id: 'ou',
    name: 'OU',
    shortName: 'OU',
    fullName: 'Orthodox Union',
    website: 'https://oukosher.org/restaurants',
    color: '#1d4ed8',
  },
  'ok': {
    id: 'ok',
    name: 'OK',
    shortName: 'OK',
    fullName: 'OK Kosher Certification',
    website: 'https://ok.org/restaurant-guide',
    color: '#0891b2',
  },
  'star-k': {
    id: 'star-k',
    name: 'Star-K',
    shortName: 'Star-K',
    fullName: 'Star-K Kosher Certification',
    website: 'https://star-k.org/retail-establishments',
    color: '#b45309',
  },
  'kof-k': {
    id: 'kof-k',
    name: 'Kof-K',
    shortName: 'Kof-K',
    fullName: 'Kof-K Kosher Supervision',
    website: 'https://kof-k.org/RestaurantSearch.aspx',
    color: '#7c3aed',
  },
  'crc-chicago': {
    id: 'crc-chicago',
    name: 'cRc',
    shortName: 'cRc',
    fullName: 'Chicago Rabbinical Council (cRc)',
    website: 'https://consumer.crckosher.org/kosher-establishments',
    color: '#0e7490',
  },
  'vaad-queens': {
    id: 'vaad-queens',
    name: 'Vaad Queens',
    shortName: 'VQ',
    fullName: 'Vaad Harabonim of Queens',
    website: 'https://queensvaad.org/kashrus/certified-establishments',
    color: '#047857',
  },
  'vaad-five-towns': {
    id: 'vaad-five-towns',
    name: 'Vaad 5T',
    shortName: 'V5T',
    fullName: 'Vaad Hakashrus of the Five Towns & Far Rockaway',
    website: 'https://vaadhakashrus.org/establishments',
    color: '#16a34a',
  },
  'crc-williamsburg': {
    id: 'crc-williamsburg',
    name: 'CRC Williamsburg',
    shortName: 'CRC-W',
    fullName: 'Central Rabbinical Congress — Williamsburg',
    website: 'https://crckashrus.org/',
    color: '#9f1239',
  },
  'vkm': {
    id: 'vkm',
    name: 'VKM',
    shortName: 'VKM',
    fullName: 'Vaad Kashrus Mehadrin (Rabbi Tzvi Altusky)',
    color: '#6d28d9',
  },
  'national-kosher': {
    id: 'national-kosher',
    name: 'National Kosher',
    shortName: 'NK',
    fullName: 'National Kosher Supervision (Rabbi Aaron D. Mehlman)',
    color: '#c2410c',
  },
  'other': {
    id: 'other',
    name: 'Other',
    shortName: 'Other',
    fullName: 'Other hashgacha — see notes',
    color: '#64748b',
  },
};

export interface Restaurant {
  id: string;
  name: string;
  type: RestaurantType;
  hashgacha: HashgachaId;
  hashgachaNote?: string;        // e.g. "Dairy — CHK" details
  address?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  cuisine?: string;              // e.g. "American BBQ", "Israeli", "Italian"
  priceRange?: '$' | '$$' | '$$$';
  hours?: string;
  image?: string;
  notes?: string;                // "Closed on Shabbos", etc.
  area?: string;                 // default "Crown Heights"
  status: 'active' | 'closed';
}

// Seed list — Crown Heights establishments (April 2026).
// Addresses filled where commonly known; admin can correct via UI.
export const restaurantsDefaults: Restaurant[] = [
  // --- CHK Meat ---
  { id: 'r-prime-avenue', name: 'Prime Avenue', type: 'meat', hashgacha: 'chk', cuisine: 'Steakhouse', area: 'Crown Heights', status: 'active' },
  { id: 'r-mendys', name: "Mendy's", type: 'meat', hashgacha: 'chk', cuisine: 'American · Catering', area: 'Crown Heights', status: 'active', notes: 'Also offers catering' },
  { id: 'r-machane-yehuda', name: 'Machane Yehuda', type: 'meat', hashgacha: 'chk', cuisine: 'Israeli', area: 'Crown Heights', status: 'active' },
  { id: 'r-josephs-dream-burger', name: "Joseph's Dream Burger", type: 'meat', hashgacha: 'chk', cuisine: 'Burgers', area: 'Crown Heights', status: 'active' },
  { id: 'r-house-of-glatt', name: 'House of Glatt', type: 'meat', hashgacha: 'chk', cuisine: 'American · Take-out', area: 'Crown Heights', status: 'active' },
  { id: 'r-holy-schnitzel', name: 'Holy Schnitzel', type: 'meat', hashgacha: 'chk', address: '262 Kingston Ave, Crown Heights', cuisine: 'Schnitzel · Fast Casual', website: 'https://holyschnitzel.com/holy-finder/holy-schnitzel-crown-heights/', area: 'Crown Heights', status: 'active' },
  { id: 'r-boeuf-and-bun', name: 'Boeuf & Bun', type: 'meat', hashgacha: 'chk', cuisine: 'Burgers', area: 'Crown Heights', status: 'active' },
  { id: 'r-butcher-grill-house', name: 'Butcher Grill House', type: 'meat', hashgacha: 'chk', cuisine: 'Grill', area: 'Crown Heights', status: 'active' },
  { id: 'r-pita-point', name: 'Pita Point', type: 'meat', hashgacha: 'chk', cuisine: 'Middle Eastern', area: 'Crown Heights', status: 'active' },

  // --- CHK Dairy ---
  { id: 'r-ricotta-coffee', name: 'Ricotta Coffee', type: 'dairy', hashgacha: 'chk', cuisine: 'Cafe · Italian', area: 'Crown Heights', status: 'active' },
  { id: 'r-chocolatte', name: 'Chocolatte', type: 'dairy', hashgacha: 'chk', cuisine: 'Coffee · Desserts', area: 'Crown Heights', status: 'active' },
  { id: 'r-bread-and-dairy', name: 'Bread & Dairy Cafe', type: 'dairy', hashgacha: 'chk', cuisine: 'Cafe · Breakfast', area: 'Crown Heights', status: 'active' },
  { id: 'r-almah-cafe', name: 'Almah Cafe', type: 'dairy', hashgacha: 'chk', cuisine: 'Cafe · Brunch', area: 'Crown Heights', status: 'active' },
  { id: 'r-almah-cafe-albany', name: 'Almah Cafe — Albany', type: 'dairy', hashgacha: 'chk', address: 'Albany Ave, Crown Heights', cuisine: 'Cafe · Brunch', area: 'Crown Heights', status: 'active' },
  { id: 'r-bunch-o-bagels', name: "Bunch O' Bagels", type: 'dairy', hashgacha: 'chk', cuisine: 'Bagels', area: 'Crown Heights', status: 'active' },
  { id: 'r-holesome-bagels', name: 'Holesome Bagels', type: 'dairy', hashgacha: 'chk', cuisine: 'Bagels · Catering', area: 'Crown Heights', status: 'active' },
  { id: 'r-brooklyn-artisan-bakehouse', name: 'Brooklyn Artisan Bakehouse', type: 'dairy', hashgacha: 'chk', cuisine: 'Bakery · Cafe', area: 'Crown Heights', status: 'active' },
  { id: 'r-kingston-pizza', name: 'Kingston Pizza', type: 'dairy', hashgacha: 'chk', cuisine: 'Pizza', area: 'Crown Heights', status: 'active' },
  { id: 'r-kingston-bake-shop', name: 'Kingston Bake Shop', type: 'bakery', hashgacha: 'chk', cuisine: 'Bakery · Dairy', area: 'Crown Heights', status: 'active' },
  { id: 'r-mozzarella', name: 'Crown Heights Mozzarella', type: 'dairy', hashgacha: 'chk', address: '265 Troy Ave, Crown Heights', website: 'https://chmozzarella.com/', cuisine: 'Italian · Brunch', notes: 'Cholov Yisroel, Pas Yisroel, Yoshon', area: 'Crown Heights', status: 'active' },

  // --- CHK Pareve / Fish / Sushi ---
  { id: 'r-sushi-spot', name: 'Sushi Spot', type: 'sushi', hashgacha: 'chk', website: 'https://www.sushispot2.com/', cuisine: 'Sushi · Parve', area: 'Crown Heights', status: 'active' },
  { id: 'r-noribar', name: 'Noribar — Crown Heights', type: 'sushi', hashgacha: 'chk', cuisine: 'Sushi · Parve', area: 'Crown Heights', status: 'active' },
  { id: 'r-shabbos-fish-market', name: 'Shabbos Fish Market', type: 'fish', hashgacha: 'chk', cuisine: 'Fish Market', area: 'Crown Heights', status: 'active' },
  { id: 'r-batyam', name: 'BatYam', type: 'fish', hashgacha: 'chk', cuisine: 'Fish Market', area: 'Crown Heights', status: 'active' },

  // --- CHK Pizza ---
  { id: 'r-pizza-crust', name: 'Pizza Crust', type: 'pizza', hashgacha: 'chk', cuisine: 'Pizza', area: 'Crown Heights', status: 'active' },

  // --- CHK Bakeries & Sweets ---
  { id: 'r-splendid-cafe', name: 'Splendid Cafe & Pastry', type: 'bakery', hashgacha: 'chk', cuisine: 'Bakery · Cafe', area: 'Crown Heights', status: 'active' },
  { id: 'r-albany-bake-shop', name: 'Albany Bake Shop', type: 'bakery', hashgacha: 'chk', address: 'Albany Ave, Crown Heights', cuisine: 'Bakery', area: 'Crown Heights', status: 'active' },
  { id: 'r-lubavitch-matzah', name: 'Lubavitch Matzah Bakery', type: 'matzah', hashgacha: 'chk', cuisine: 'Matzah · Shmurah', area: 'Crown Heights', status: 'active' },
  { id: 'r-tov-products', name: 'Tov Products', type: 'matzah', hashgacha: 'chk', cuisine: 'Matzah Bakery', area: 'Crown Heights', status: 'active' },
  { id: 'r-sweet-expressions-troy', name: 'Sweet Expressions — Troy Avenue', type: 'ice-cream', hashgacha: 'chk', address: 'Troy Ave, Crown Heights', cuisine: 'Ice Cream · Sweets', area: 'Crown Heights', status: 'active' },
  { id: 'r-sweet-expressions-kingston', name: 'Sweet Expressions — Kingston Avenue', type: 'ice-cream', hashgacha: 'chk', address: 'Kingston Ave, Crown Heights', cuisine: 'Ice Cream', area: 'Crown Heights', status: 'active' },

  // --- CHK Caterers / Venues ---
  { id: 'r-smadar-events', name: 'Smadar Events', type: 'catering', hashgacha: 'chk', cuisine: 'Party Planner · Catering', area: 'Crown Heights', status: 'active' },
  { id: 'r-table-one-catering', name: 'Table One Catering', type: 'catering', hashgacha: 'chk', cuisine: 'Catering', area: 'Crown Heights', status: 'active' },
  { id: 'r-ben-sion-kohen', name: 'Ben Sion Kohen', type: 'catering', hashgacha: 'chk', cuisine: 'Catering', area: 'Crown Heights', status: 'active' },
  { id: 'r-razag-ballroom', name: 'Razag Ballroom', type: 'venue', hashgacha: 'chk', cuisine: 'Event Hall', area: 'Crown Heights', status: 'active' },

  // --- CHK Butchers / Meat Suppliers ---
  { id: 'r-770-glatt', name: '770 Glatt', type: 'butcher', hashgacha: 'chk', cuisine: 'Meat & Poultry', area: 'Crown Heights', status: 'active' },
  { id: 'r-generation-7', name: 'Generation 7', type: 'butcher', hashgacha: 'chk', cuisine: 'Meat & Poultry', area: 'Crown Heights', status: 'active' },
  { id: 'r-rubashkins', name: "Rubashkin's Meat Store", type: 'butcher', hashgacha: 'chk', cuisine: 'Butcher', area: 'Crown Heights', status: 'active' },

  // --- Non-CHK establishments in Crown Heights ---
  {
    id: 'r-izzys-smokehouse',
    name: "Izzy's Brooklyn Smokehouse",
    type: 'meat',
    hashgacha: 'ok',
    address: '397 Troy Ave, Crown Heights',
    website: 'https://izzyssmokehouse.com/',
    cuisine: 'American BBQ · Smokehouse',
    priceRange: '$$$',
    area: 'Crown Heights',
    status: 'active',
  },
  {
    id: 'r-biarritz',
    name: 'Biarritz Kosher Pizza & Wine Bar',
    type: 'pizza',
    hashgacha: 'vkm',
    hashgachaNote: 'Guided by Rabbi Tzvi Altusky',
    address: 'Kingston Ave, Crown Heights',
    cuisine: 'Pizza · Wine Bar · Dairy',
    notes: 'Switched from CHK to VKM in May 2025',
    area: 'Crown Heights',
    status: 'active',
  },
];
