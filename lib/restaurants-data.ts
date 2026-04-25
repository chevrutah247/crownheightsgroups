// Crown Heights kosher restaurants, cafes, bakeries, caterers — with hashgacha info.
// Seed data compiled from chkosher.org/listings (Beis Din Crown Heights / CHK),
// koshercactus.com, crownheights.info, yeahthatskosher, totallyjewishtravel,
// reveriebrooklyn.com (April 2026).
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
  | 'venue'
  | 'vegan';

export type GoodFor =
  | 'breakfast'
  | 'brunch'
  | 'lunch'
  | 'dinner'
  | 'coffee'
  | 'tea'
  | 'dessert'
  | 'takeout'
  | 'delivery'
  | 'date-night'
  | 'family'
  | 'cocktails';

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
  | 'ikc' // International Kosher Council
  | 'rabbi-matusof'
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
  'ikc': {
    id: 'ikc',
    name: 'IKC',
    shortName: 'IKC',
    fullName: 'International Kosher Council',
    color: '#0d9488',
  },
  'rabbi-matusof': {
    id: 'rabbi-matusof',
    name: 'Rabbi Matusof',
    shortName: 'R.M.',
    fullName: 'Rabbi E. Matusof — private hashgacha',
    color: '#a16207',
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
  hashgachaNote?: string;        // e.g. "Cholov Yisroel, Pas Yisroel"
  address?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  cuisine?: string;              // e.g. "American BBQ", "Israeli", "Italian"
  priceRange?: '$' | '$$' | '$$$';
  hours?: string;
  goodFor?: GoodFor[];           // tags: breakfast/lunch/coffee/etc
  image?: string;
  notes?: string;                // "Closed on Shabbos", "Switched hashgacha", etc.
  area?: string;                 // default "Crown Heights"
  status: 'active' | 'closed';
}

// Helper to keep seed list compact
const t = (
  id: string,
  name: string,
  type: RestaurantType,
  hashgacha: HashgachaId,
  fields: Partial<Restaurant> = {}
): Restaurant => ({ id, name, type, hashgacha, area: 'Crown Heights', status: 'active', ...fields });

// Crown Heights establishments — April 2026.
// Many addresses, hours, and websites still need verification by admin.
export const restaurantsDefaults: Restaurant[] = [
  // ============ MEAT ============
  t('r-prime-avenue', 'Prime Avenue', 'meat', 'chk', {
    cuisine: 'Steakhouse', priceRange: '$$$',
    goodFor: ['dinner', 'date-night'],
  }),
  t('r-mendys', "Mendy's Deli", 'meat', 'chk', {
    address: '792 Eastern Pkwy, Crown Heights',
    cuisine: 'Deli · American · Catering',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
    notes: 'Also offers catering',
  }),
  t('r-machane-yehuda', 'Machane Yehuda', 'meat', 'chk', {
    cuisine: 'Israeli',
    goodFor: ['lunch', 'dinner'],
  }),
  t('r-josephs-dream-burger', "Joseph's Dream Burger", 'meat', 'chk', {
    cuisine: 'Burgers',
    goodFor: ['lunch', 'dinner', 'family'],
  }),
  t('r-house-of-glatt', 'House of Glatt', 'meat', 'chk', {
    cuisine: 'American · Take-out',
    goodFor: ['lunch', 'dinner', 'takeout'],
  }),
  t('r-holy-schnitzel', 'Holy Schnitzel', 'meat', 'chk', {
    address: '262 Kingston Ave, Crown Heights',
    cuisine: 'Schnitzel · Fast Casual',
    website: 'https://holyschnitzel.com/holy-finder/holy-schnitzel-crown-heights/',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
    notes: 'Moved into the former Carbon location in 2024',
  }),
  t('r-boeuf-and-bun', 'Boeuf & Bun', 'meat', 'chk', {
    address: '271 Kingston Ave, Crown Heights',
    cuisine: 'Burgers',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'family'],
  }),
  t('r-butcher-grill-house', 'Butcher Grill House', 'meat', 'chk', {
    cuisine: 'Steakhouse · Grill', priceRange: '$$$',
    goodFor: ['dinner', 'date-night'],
  }),
  t('r-pita-point', 'Pita Point', 'meat', 'chk', {
    cuisine: 'Middle Eastern · Falafel',
    priceRange: '$',
    goodFor: ['lunch', 'takeout'],
  }),
  t('r-mama-kitchen', 'Mama Kitchen', 'meat', 'chk', {
    address: '419 Utica Ave, Crown Heights',
    cuisine: 'Home-Style',
    goodFor: ['lunch', 'dinner', 'takeout'],
  }),
  t('r-kt2', 'KT2', 'meat', 'chk', {
    address: '333 Kingston Ave, Crown Heights',
    cuisine: 'Israeli · Mediterranean',
    goodFor: ['lunch', 'dinner'],
  }),
  t('r-meat', 'MEAT', 'meat', 'ou', {
    address: '123 Kingston Ave (corner Bergen St), Crown Heights',
    cuisine: 'High-End Steakhouse',
    website: 'https://mdr.meatny.com/',
    hashgachaNote: 'OU Glatt',
    priceRange: '$$$',
    goodFor: ['dinner', 'date-night', 'cocktails'],
  }),
  t('r-gruit', "GRÜIT by Abe's", 'meat', 'ok', {
    address: '252 Empire Blvd, Crown Heights',
    cuisine: 'Gastropub · American',
    priceRange: '$$$',
    goodFor: ['dinner', 'date-night', 'cocktails'],
  }),
  t('r-alenbi', 'Alenbi', 'meat', 'ok', {
    address: '887 Nostrand Ave, Crown Heights',
    cuisine: 'Israeli · Mediterranean',
    goodFor: ['lunch', 'dinner'],
  }),
  t('r-abes-corner', "Abe's Corner", 'meat', 'rabbi-matusof', {
    address: '670 Rogers Ave, Crown Heights',
    cuisine: 'American',
    goodFor: ['lunch', 'dinner', 'takeout'],
  }),
  t('r-izzys-smokehouse', "Izzy's Brooklyn Smokehouse", 'meat', 'ok', {
    address: '397 Troy Ave, Crown Heights',
    website: 'https://izzyssmokehouse.com/',
    cuisine: 'American BBQ · Smokehouse',
    priceRange: '$$$',
    goodFor: ['lunch', 'dinner', 'date-night', 'family'],
  }),

  // ============ DAIRY ============
  t('r-mozzarella', 'Crown Heights Mozzarella', 'dairy', 'chk', {
    address: '265 Troy Ave, Crown Heights',
    website: 'https://chmozzarella.com/',
    cuisine: 'Italian · Brunch · Pizza',
    hashgachaNote: 'Cholov Yisroel, Pas Yisroel, Yoshon',
    priceRange: '$$',
    goodFor: ['breakfast', 'brunch', 'lunch', 'dinner', 'family'],
  }),
  t('r-ricotta-coffee', 'Ricotta Coffee', 'dairy', 'chk', {
    cuisine: 'Italian Cafe',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'tea', 'lunch', 'dessert'],
  }),
  t('r-chocolatte', 'Chocolatte', 'dairy', 'chk', {
    address: '792 Eastern Pkwy, Crown Heights',
    cuisine: 'Coffee · Desserts · Chocolate',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['coffee', 'tea', 'dessert', 'breakfast'],
  }),
  t('r-bread-and-dairy', 'Bread & Dairy Cafe', 'dairy', 'chk', {
    cuisine: 'Cafe · Breakfast · Salads',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee', 'tea'],
  }),
  t('r-almah-cafe-utica', 'Almah Cafe', 'dairy', 'chk', {
    address: '87 Utica Ave, Crown Heights',
    cuisine: 'Cafe · Brunch · Mediterranean',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee', 'tea', 'date-night'],
  }),
  t('r-almah-cafe-albany', 'Almah Cafe — Albany', 'dairy', 'chk', {
    address: 'Albany Ave, Crown Heights',
    cuisine: 'Cafe · Brunch',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
  }),
  t('r-bunch-o-bagels', "Bunch O' Bagels", 'dairy', 'chk', {
    cuisine: 'Bagels · Breakfast',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
  }),
  t('r-holesome-bagels', 'Holesome Bagels', 'dairy', 'chk', {
    cuisine: 'Bagels · Catering · Cafe',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
  }),
  t('r-brooklyn-artisan-bakehouse', 'Brooklyn Artisan Bakehouse', 'dairy', 'ok', {
    address: '529 E New York Ave, Crown Heights',
    cuisine: 'Bakery · Cafe',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'tea', 'lunch', 'dessert'],
  }),
  t('r-kingston-pizza', 'Kingston Pizza', 'pizza', 'chk', {
    address: 'Kingston Ave, Crown Heights',
    cuisine: 'Pizza · Italian',
    priceRange: '$',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
  }),
  t('r-bouote', "Bou'ote", 'dairy', 'ok', {
    address: '302 Troy Ave, Crown Heights',
    cuisine: 'Cafe · Dairy',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
  }),
  t('r-patis', 'Patis', 'dairy', 'ou', {
    address: '302 Troy Ave, Crown Heights',
    cuisine: 'French Bakery · Pastries',
    hashgachaNote: 'OU(D), Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'tea', 'dessert'],
  }),
  t('r-koshertown-dairy', 'Koshertown Supermarket Dairy', 'dairy', 'chk', {
    address: '469 Albany Ave, Crown Heights',
    cuisine: 'Supermarket Dairy Café',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'lunch', 'takeout', 'coffee'],
  }),

  // ============ PIZZA ============
  t('r-pizza-crust', 'Pizza Crust', 'pizza', 'chk', {
    cuisine: 'Pizza',
    priceRange: '$',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
  }),
  t('r-biarritz', 'Biarritz Kosher Pizza & Wine Bar', 'pizza', 'vkm', {
    address: 'Kingston Ave, Crown Heights',
    cuisine: 'Pizza · Wine Bar · Dairy',
    hashgachaNote: 'Guided by Rabbi Tzvi Altusky',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'date-night', 'cocktails'],
    notes: 'Switched from CHK to VKM in May 2025. Took over former Basil location.',
  }),

  // ============ PARVE / FISH / SUSHI ============
  t('r-sushi-spot', 'Sushi Spot', 'sushi', 'chk', {
    website: 'https://www.sushispot2.com/',
    cuisine: 'Sushi · Parve',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'takeout', 'date-night'],
  }),
  t('r-noribar', 'Noribar', 'sushi', 'chk', {
    cuisine: 'Sushi · Parve',
    goodFor: ['lunch', 'dinner', 'takeout'],
  }),
  t('r-shabbos-fish-market', 'Shabbos Fish Market', 'fish', 'chk', {
    cuisine: 'Fish Market',
    goodFor: ['takeout'],
  }),
  t('r-batyam', 'BatYam', 'fish', 'chk', {
    cuisine: 'Fish Market',
    goodFor: ['takeout'],
  }),

  // ============ VEGAN ============
  t('r-reverie', 'Reverie', 'vegan', 'ikc', {
    cuisine: 'Vegan · Cocktail Bar · Modern',
    website: 'https://reveriebrooklyn.com/crown-heights-restaurants/',
    priceRange: '$$$',
    goodFor: ['dinner', 'date-night', 'cocktails', 'dessert'],
    notes: '100% plant-based. Part of City Roots Hospitality.',
  }),

  // ============ BAKERIES & SWEETS ============
  t('r-kingston-bake-shop', 'Kingston Bake Shop', 'bakery', 'chk', {
    address: '380 Kingston Ave, Crown Heights',
    cuisine: 'Bakery · Dairy Cafe',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'dessert', 'takeout'],
  }),
  t('r-splendid-cafe', 'Splendid Cafe & Pastry', 'bakery', 'chk', {
    cuisine: 'Bakery · Cafe · Pastries',
    goodFor: ['breakfast', 'coffee', 'tea', 'dessert'],
  }),
  t('r-albany-bake-shop', 'Albany Bake Shop', 'bakery', 'chk', {
    address: 'Albany Ave, Crown Heights',
    cuisine: 'Bakery',
    goodFor: ['breakfast', 'coffee', 'dessert', 'takeout'],
  }),
  t('r-lubavitch-matzah', 'Lubavitch Matzah Bakery', 'matzah', 'chk', {
    cuisine: 'Shmurah Matzah',
    goodFor: ['takeout'],
    notes: 'Hand Shmurah Matzah for Pesach',
  }),
  t('r-tov-products', 'Tov Products', 'matzah', 'chk', {
    cuisine: 'Matzah Bakery',
    goodFor: ['takeout'],
  }),
  t('r-sweet-expressions-troy', 'Sweet Expressions — Troy', 'ice-cream', 'chk', {
    address: 'Troy Ave, Crown Heights',
    cuisine: 'Ice Cream · Sweets',
    goodFor: ['dessert', 'family'],
  }),
  t('r-sweet-expressions-kingston', 'Sweet Expressions — Kingston', 'ice-cream', 'chk', {
    address: 'Kingston Ave, Crown Heights',
    cuisine: 'Ice Cream',
    goodFor: ['dessert', 'family'],
  }),

  // ============ CATERERS / VENUES ============
  t('r-smadar-events', 'Smadar Events', 'catering', 'chk', {
    cuisine: 'Party Planner · Catering',
  }),
  t('r-table-one-catering', 'Table One Catering', 'catering', 'chk', {
    cuisine: 'Catering',
  }),
  t('r-ben-sion-kohen', 'Ben Sion Kohen', 'catering', 'chk', {
    cuisine: 'Catering',
  }),
  t('r-razag-ballroom', 'Razag Ballroom', 'venue', 'chk', {
    cuisine: 'Event Hall · Simcha Venue',
  }),

  // ============ BUTCHERS / MEAT SUPPLIERS ============
  t('r-770-glatt', '770 Glatt', 'butcher', 'chk', {
    cuisine: 'Glatt Meat & Poultry',
    goodFor: ['takeout'],
  }),
  t('r-generation-7', 'Generation 7', 'butcher', 'chk', {
    cuisine: 'Glatt Meat & Poultry',
    goodFor: ['takeout'],
  }),
  t('r-rubashkins', "Rubashkin's Meat Store", 'butcher', 'chk', {
    cuisine: 'Glatt Butcher',
    goodFor: ['takeout'],
  }),

  // ============ CLOSED — kept for historical reference ============
  t('r-carbon', 'Carbon Charcoal Grill & Bar', 'meat', 'chk', {
    address: '262 Kingston Ave, Crown Heights',
    cuisine: 'Charcoal Grill',
    notes: 'CLOSED in 2024 after a 2-year run. Holy Schnitzel took over the location.',
    status: 'closed',
  }),
  t('r-basil', 'Basil Pizza & Wine Bar', 'pizza', 'ou', {
    address: '270 Kingston Ave, Crown Heights',
    cuisine: 'Pizza · Wine Bar · Dairy',
    notes: 'CLOSED. Replaced by Biarritz at the same location.',
    status: 'closed',
  }),
  t('r-gombos', "Gombo's Heimishe Bakery", 'bakery', 'chk', {
    address: 'Kingston Ave & President St, Crown Heights',
    cuisine: 'Heimishe Bakery',
    notes: 'CLOSED — lease ended, location was dismantled.',
    status: 'closed',
  }),
];
