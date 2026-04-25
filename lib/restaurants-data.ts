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
  description?: string;          // 1-2 sentence editorial blurb for the card
  reviewSummary?: string;        // crowdsourced review snapshot (Yelp/Google)
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
// Addresses, phones and hours from Yelp / restaurant websites / koshernear.me.
export const restaurantsDefaults: Restaurant[] = [
  // ============ MEAT ============
  t('r-prime-avenue', 'Prime Avenue', 'meat', 'chk', {
    address: '377 Kingston Ave, Brooklyn, NY 11213',
    phone: '718-576-6665',
    hours: 'Su-Th 11am-1am · F 11am-3pm · Sa 9pm-1am',
    cuisine: 'Steakhouse · Asian Fusion',
    priceRange: '$$$',
    goodFor: ['dinner', 'date-night'],
    description: 'Upscale CHK steakhouse merging Prime Sandwich & Prime Wok — grilled meats and Asian-fusion fare.',
  }),
  t('r-mendys', "Mendy's Deli", 'meat', 'chk', {
    address: '792 Eastern Pkwy, Brooklyn, NY 11213',
    cuisine: 'Deli · American · Catering',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
    description: 'Classic CHK deli with sandwiches, soups and full catering for events.',
  }),
  t('r-machane-yehuda', 'Machane Yehuda', 'meat', 'chk', {
    address: '250 Kingston Ave, Brooklyn, NY 11213',
    cuisine: 'Israeli · Middle Eastern',
    goodFor: ['lunch', 'dinner'],
    description: 'CHK Israeli/Middle Eastern eatery — shawarma, falafel and Mediterranean grill.',
  }),
  t('r-josephs-dream-burger', "Joseph's Dream Burger", 'meat', 'chk', {
    address: '333 Kingston Ave, Brooklyn, NY 11213',
    phone: '718-840-3228',
    hours: 'Su-Th 12pm-1am',
    cuisine: 'Burgers',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'family'],
    description: 'Two-story CHK burger joint known for gourmet kosher burgers and chicken sandwiches.',
  }),
  t('r-house-of-glatt', 'House of Glatt', 'meat', 'chk', {
    address: '385 Kingston Ave, Brooklyn, NY 11225',
    phone: '718-467-9411',
    website: 'https://thehouseofglatt.com/',
    cuisine: 'Deli · Butcher · Take-out',
    goodFor: ['lunch', 'dinner', 'takeout'],
    description: '40+ year CHK butcher and full-service deli with takeout and Shabbos specials.',
  }),
  t('r-holy-schnitzel', 'Holy Schnitzel', 'meat', 'chk', {
    address: '262 Kingston Ave, Brooklyn, NY 11213',
    cuisine: 'Schnitzel · Fast Casual',
    website: 'https://holyschnitzel.com/holy-finder/holy-schnitzel-crown-heights/',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
    description: 'Schnitzel-focused fast-casual chain that took over the former Carbon space in 2024.',
  }),
  t('r-boeuf-and-bun', 'Boeuf & Bun', 'meat', 'chk', {
    address: '271 Kingston Ave, Brooklyn, NY 11213',
    cuisine: 'Burgers',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'family'],
    description: 'CHK burger spot with both classic and creative burger combinations.',
  }),
  t('r-butcher-grill-house', 'Butcher Grill House', 'meat', 'chk', {
    address: '411 Troy Ave, Brooklyn, NY 11213',
    phone: '347-770-4042',
    hours: 'Su-Th 5pm-10:30pm',
    cuisine: 'Steakhouse · Farm-to-Table',
    website: 'https://chbutchergrillhouse.com/',
    priceRange: '$$$',
    goodFor: ['dinner', 'date-night'],
    description: 'Upscale CHK farm-to-table steakhouse by Chef Ben Davidov.',
  }),
  t('r-pita-point', 'Pita Point', 'meat', 'chk', {
    address: '508 Marion St, Brooklyn, NY 11233',
    phone: '347-414-5570',
    cuisine: 'Middle Eastern · Falafel',
    priceRange: '$',
    goodFor: ['lunch', 'takeout'],
    description: 'CHK glatt pita shop — salatim, grilled meats and falafel.',
  }),
  t('r-mama-kitchen', 'Mama Kitchen', 'meat', 'chk', {
    address: '419 Utica Ave, Brooklyn, NY 11213',
    cuisine: 'Home-Style',
    goodFor: ['lunch', 'dinner', 'takeout'],
    description: 'CHK home-style meat kitchen — comfort meals and takeout.',
  }),
  t('r-kt2', 'KT2', 'meat', 'chk', {
    address: '333 Kingston Ave, Brooklyn, NY 11213',
    cuisine: 'Israeli · Mediterranean',
    goodFor: ['lunch', 'dinner'],
    description: 'Casual CHK Israeli/Mediterranean spot on Kingston.',
  }),
  t('r-meat', 'MEAT', 'meat', 'ou', {
    address: '123 Kingston Ave (corner Bergen St), Brooklyn, NY 11213',
    cuisine: 'High-End Steakhouse',
    website: 'https://mdr.meatny.com/',
    hashgachaNote: 'OU Glatt',
    priceRange: '$$$',
    goodFor: ['dinner', 'date-night', 'cocktails'],
    description: 'High-end OU Glatt steakhouse — refined chops, dry-aged steaks, full bar.',
  }),
  t('r-gruit', "GRÜIT by Abe's", 'meat', 'ok', {
    address: '252 Empire Blvd, Brooklyn, NY 11225',
    cuisine: 'Gastropub · American',
    priceRange: '$$$',
    goodFor: ['dinner', 'date-night', 'cocktails'],
    description: 'OK-certified kosher gastropub on Empire — elevated American with cocktails.',
  }),
  t('r-alenbi', 'Alenbi', 'meat', 'ok', {
    address: '887 Nostrand Ave, Brooklyn, NY 11225',
    cuisine: 'Israeli · Mediterranean',
    goodFor: ['lunch', 'dinner'],
    description: 'OK-certified Israeli/Mediterranean restaurant on Nostrand.',
  }),
  t('r-abes-corner', "Abe's Corner", 'meat', 'rabbi-matusof', {
    address: '670 Rogers Ave, Brooklyn, NY 11226',
    cuisine: 'American',
    goodFor: ['lunch', 'dinner', 'takeout'],
    description: 'Casual American kosher under Rabbi Matusof.',
  }),
  t('r-izzys-smokehouse', "Izzy's Brooklyn Smokehouse", 'meat', 'ok', {
    address: '397 Troy Ave, Brooklyn, NY 11213',
    website: 'https://izzyssmokehouse.com/',
    cuisine: 'American BBQ · Smokehouse',
    priceRange: '$$$',
    goodFor: ['lunch', 'dinner', 'date-night', 'family'],
    description: 'Award-winning OK-certified Texas-style kosher BBQ smokehouse.',
  }),

  // ============ DAIRY ============
  t('r-mozzarella', 'Crown Heights Mozzarella', 'dairy', 'chk', {
    address: '265 Troy Ave, Brooklyn, NY 11213',
    website: 'https://chmozzarella.com/',
    cuisine: 'Italian · Brunch · Pizza',
    hashgachaNote: 'Cholov Yisroel, Pas Yisroel, Yoshon',
    priceRange: '$$',
    goodFor: ['breakfast', 'brunch', 'lunch', 'dinner', 'family'],
    description: 'Italian dairy brunch + dinner — pizza, pastas, and house-pulled mozzarella.',
  }),
  t('r-ricotta-coffee', 'Ricotta Coffee', 'dairy', 'chk', {
    address: '513 Albany Ave, Brooklyn, NY 11203',
    phone: '347-365-5177',
    hours: 'Su-F 8:30am-4pm',
    cuisine: 'Italian Cafe · Coffee',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'tea', 'lunch', 'dessert'],
    description: 'CHK Italian-style cafe specializing in coffee, paninis and ricotta pastries.',
  }),
  t('r-chocolatte', 'Chocolatte', 'dairy', 'chk', {
    address: '792 Eastern Pkwy, Brooklyn, NY 11213',
    cuisine: 'Coffee · Desserts · Chocolate',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['coffee', 'tea', 'dessert', 'breakfast'],
    description: 'CHK chocolate-and-coffee shop next to Mendy\'s — desserts, drinks, gifts.',
  }),
  t('r-bread-and-dairy', 'Bread & Dairy Cafe', 'dairy', 'chk', {
    address: '368 Kingston Ave, Brooklyn, NY 11213',
    phone: '718-576-6664',
    cuisine: 'Cafe · Breakfast · Salads',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee', 'tea'],
    description: 'Sister to Prime Avenue — kiosk-order CHK dairy cafe with breakfast and pastries.',
  }),
  t('r-almah-cafe-utica', 'Almah Cafe', 'dairy', 'chk', {
    address: '87 Utica Ave, Brooklyn, NY 11213',
    cuisine: 'Cafe · Brunch · Mediterranean',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee', 'tea', 'date-night'],
    description: 'Brunch-leaning CHK Mediterranean cafe known for shakshuka and pastries.',
  }),
  t('r-almah-cafe-albany', 'Almah Cafe — Albany', 'dairy', 'chk', {
    address: 'Albany Ave, Crown Heights',
    cuisine: 'Cafe · Brunch',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
    description: 'Second Albany Ave Almah location — same brunch menu, different street.',
  }),
  t('r-bunch-o-bagels', "Bunch O' Bagels", 'dairy', 'chk', {
    address: '361 Troy Ave, Brooklyn, NY 11213',
    phone: '718-604-0634',
    hours: 'Su-Th 7am-4pm · F 7am-1pm · Sa closed',
    website: 'https://bunchobagels.com/',
    cuisine: 'Bagels · Breakfast',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
    description: 'CHK bagel shop with hand-rolled bagels and breakfast sandwiches.',
  }),
  t('r-holesome-bagels', 'Holesome Bagels', 'dairy', 'chk', {
    address: '333 Kingston Ave, Brooklyn, NY 11213',
    phone: '347-955-5300',
    cuisine: 'Bagels · Catering · Cafe',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
    description: 'Bustling CHK bagel shop — house-baked bagels, breakfast, pizza and salads.',
  }),
  t('r-brooklyn-artisan-bakehouse', 'Brooklyn Artisan Bakehouse', 'dairy', 'ok', {
    address: '529 E New York Ave, Brooklyn, NY 11225',
    cuisine: 'Bakery · Cafe',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'tea', 'lunch', 'dessert'],
    description: 'OK-certified bakery + dairy cafe with sourdough breads and pastries.',
  }),
  t('r-kingston-pizza', 'Kingston Pizza', 'pizza', 'chk', {
    address: '313 Kingston Ave, Brooklyn, NY 11213',
    website: 'https://www.kosherpizzach.com/',
    cuisine: 'Pizza · Italian',
    priceRange: '$',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
    description: 'Kingston Ave classic — slow-fermented pizza dough plus falafel.',
  }),
  t('r-bouote', "Bou'ote", 'dairy', 'ok', {
    address: '302 Troy Ave, Brooklyn, NY 11213',
    cuisine: 'Cafe · Dairy',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'brunch', 'lunch', 'coffee'],
    description: 'OK-certified dairy cafe sharing a Troy Ave space with Patis bakery.',
  }),
  t('r-patis', 'Patis', 'dairy', 'ou', {
    address: '302 Troy Ave, Brooklyn, NY 11213',
    cuisine: 'French Bakery · Pastries',
    hashgachaNote: 'OU(D), Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'tea', 'dessert'],
    description: 'OU-certified French-style bakery — viennoiserie, croissants and pastries.',
  }),
  t('r-koshertown-dairy', 'Koshertown Supermarket Dairy', 'dairy', 'chk', {
    address: '469 Albany Ave, Brooklyn, NY 11213',
    cuisine: 'Supermarket Dairy Café',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'lunch', 'takeout', 'coffee'],
    description: 'In-store dairy café and prepared-food counter at Koshertown supermarket.',
  }),

  // ============ PIZZA ============
  t('r-pizza-crust', 'Pizza Crust', 'pizza', 'chk', {
    address: '313 Kingston Ave, Brooklyn, NY 11213',
    website: 'https://www.kosherpizzach.com/',
    cuisine: 'Pizza',
    priceRange: '$',
    goodFor: ['lunch', 'dinner', 'takeout', 'family'],
    description: 'CHK pizzeria — 24-hour slow-fermented dough plus falafel.',
  }),
  t('r-biarritz', 'Biarritz Kosher Pizza & Wine Bar', 'pizza', 'vkm', {
    address: '270 Kingston Ave, Brooklyn, NY 11213',
    cuisine: 'Pizza · Wine Bar · Dairy',
    hashgachaNote: 'Guided by Rabbi Tzvi Altusky',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'date-night', 'cocktails'],
    notes: 'Switched from CHK to VKM in May 2025. Took over former Basil location.',
    description: 'Wood-fired pizzeria with a wine bar in the former Basil space.',
  }),

  // ============ PARVE / FISH / SUSHI ============
  t('r-sushi-spot', 'Sushi Spot', 'sushi', 'chk', {
    address: '426 Kingston Ave, Brooklyn, NY 11225',
    phone: '718-756-4040',
    website: 'https://www.sushispot2.com/',
    cuisine: 'Sushi · Parve',
    priceRange: '$$',
    goodFor: ['lunch', 'dinner', 'takeout', 'date-night'],
    description: 'CHK sushi bar — rolls and poke bowls for quick service and delivery.',
  }),
  t('r-noribar', 'Noribar', 'sushi', 'chk', {
    address: '326 Kingston Ave, Brooklyn, NY 11213',
    phone: '347-705-8777',
    cuisine: 'Sushi · Parve',
    goodFor: ['lunch', 'dinner', 'takeout'],
    description: 'CHK pareve sushi — Asian-fusion bowls and rolls.',
  }),
  t('r-shabbos-fish-market', 'Shabbos Fish Market', 'fish', 'chk', {
    address: '417 Kingston Ave, Brooklyn, NY 11225',
    phone: '347-533-6004',
    cuisine: 'Fish Market',
    goodFor: ['takeout'],
    description: 'CHK fish market — salmon, carp, whitefish and Shabbos staples.',
  }),
  t('r-batyam', 'BatYam', 'fish', 'chk', {
    cuisine: 'Fish Market',
    goodFor: ['takeout'],
    description: 'Crown Heights kosher fish market under CHK.',
  }),

  // ============ BAKERIES & SWEETS ============
  t('r-kingston-bake-shop', 'Kingston Bake Shop', 'bakery', 'chk', {
    address: '380 Kingston Ave, Brooklyn, NY 11213',
    cuisine: 'Bakery · Dairy Cafe',
    hashgachaNote: 'Cholov Yisroel',
    goodFor: ['breakfast', 'coffee', 'dessert', 'takeout'],
    description: 'CHK Kingston Ave bakery — challahs, cakes and dairy café items.',
  }),
  t('r-splendid-cafe', 'Splendid Cafe & Pastry', 'bakery', 'chk', {
    cuisine: 'Bakery · Cafe · Pastries',
    goodFor: ['breakfast', 'coffee', 'tea', 'dessert'],
    description: 'CHK pastry shop noted for donuts and dessert pastries.',
  }),
  t('r-albany-bake-shop', 'Albany Bake Shop', 'bakery', 'chk', {
    address: 'Albany Ave, Crown Heights',
    cuisine: 'Bakery',
    goodFor: ['breakfast', 'coffee', 'dessert', 'takeout'],
    description: 'Neighborhood CHK bakery on Albany Ave.',
  }),
  t('r-lubavitch-matzah', 'Lubavitch Matzah Bakery', 'matzah', 'chk', {
    address: '460 Albany Ave, Brooklyn, NY 11213',
    phone: '718-778-7914',
    website: 'https://lubavitchmatzah.com/',
    cuisine: 'Shmurah Matzah',
    goodFor: ['takeout'],
    notes: 'Hand Shmurah Matzah for Pesach. Operating since 1954.',
    description: 'Crown Heights\' historic shmurah matzah bakery — hand-baked since 1954.',
  }),
  t('r-tov-products', 'Tov Products', 'matzah', 'chk', {
    cuisine: 'Matzah Bakery',
    goodFor: ['takeout'],
    description: 'CHK matzah and Passover product distributor.',
  }),
  t('r-sweet-expressions-troy', 'Sweet Expressions — Troy', 'ice-cream', 'chk', {
    address: 'Troy Ave, Crown Heights',
    cuisine: 'Ice Cream · Sweets',
    goodFor: ['dessert', 'family'],
    description: 'CHK ice cream and candy spot on Troy Ave.',
  }),
  t('r-sweet-expressions-kingston', 'Sweet Expressions — Kingston', 'ice-cream', 'chk', {
    address: 'Kingston Ave, Crown Heights',
    cuisine: 'Ice Cream',
    goodFor: ['dessert', 'family'],
    description: 'Sister Kingston Ave ice cream location.',
  }),

  // ============ CATERERS / VENUES ============
  t('r-smadar-events', 'Smadar Events', 'catering', 'chk', {
    cuisine: 'Party Planner · Catering',
    description: 'CHK-certified party planner and event designer in Crown Heights.',
  }),
  t('r-table-one-catering', 'Table One Catering', 'catering', 'chk', {
    phone: '917-324-6276',
    cuisine: 'Catering',
    description: 'CHK kosher caterer blending classic and modern menus for events.',
  }),
  t('r-ben-sion-kohen', 'Ben Sion Kohen', 'catering', 'chk', {
    address: '564 East New York Ave, Brooklyn, NY 11225',
    phone: '718-382-5687',
    cuisine: 'Catering · Sephardic',
    description: 'Family-owned glatt-kosher caterer (since 1979) — Sephardic/Persian menus.',
  }),
  t('r-razag-ballroom', 'Razag Ballroom', 'venue', 'chk', {
    address: '739 East New York Ave, Brooklyn, NY 11203',
    phone: '718-773-3300',
    hours: 'Su-Th 9am-3pm · F 9am-12pm',
    cuisine: 'Event Hall · Simcha Venue',
    description: '9,000-sq-ft Crown Heights ballroom for weddings and large simchas with in-house catering.',
  }),

  // ============ BUTCHERS / MEAT SUPPLIERS ============
  t('r-770-glatt', '770 Glatt', 'butcher', 'chk', {
    cuisine: 'Glatt Meat & Poultry',
    goodFor: ['takeout'],
    description: 'CHK glatt-kosher butcher serving the Lubavitch community near 770.',
  }),
  t('r-generation-7', 'Generation 7', 'butcher', 'chk', {
    cuisine: 'Glatt Meat & Poultry',
    goodFor: ['takeout'],
    description: 'CHK butcher shop in Crown Heights.',
  }),
  t('r-rubashkins', "Rubashkin's Meat Store", 'butcher', 'chk', {
    address: '4310 14th Ave, Brooklyn, NY 11219',
    phone: '718-436-5511',
    website: 'https://rubashkinsmeatstore.com/',
    cuisine: 'Glatt Butcher',
    goodFor: ['takeout'],
    description: 'Long-standing CHK glatt butcher (since 1953) — beef, poultry and deli.',
  }),
];
