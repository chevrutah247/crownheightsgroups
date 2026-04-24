// Data and types for manually-updated store specials.
// For stores that don't have a scrapable API, admin enters data via /admin/store-specials.

export interface ManualSpecial {
  id: string;
  name: string;
  brand?: string;
  size?: string;
  priceSale: string; // e.g. "2.99"
  priceWas?: string; // e.g. "10.99"
  endsAt?: string; // ISO date YYYY-MM-DD
  category?: string;
  note?: string; // e.g. "[KFP]"
}

export interface ManualStore {
  id: 'kahans' | 'koltuv' | 'marketplace';
  name: string;
  logo?: string; // path under /images or emoji fallback
  logoEmoji?: string;
  address?: string;
  phone?: string;
  referenceUrl?: string; // where admin fetches weekly specials from
  updateInstructions?: string; // for the email reminder
  specials: ManualSpecial[];
  updatedAt?: string; // ISO datetime
  updatedBy?: string; // email
}

const DEFAULT_END = '2026-04-27';
const END_MAY_25 = '2026-05-25';
const END_APR_30 = '2026-04-30';
const END_MAY_11 = '2026-05-11';

// 74 items from Kahan's circular (weekend of 04/22/2026)
const kahansSpecials: ManualSpecial[] = [
  // Drinks
  { id: 'kh-snapple-apple', name: 'Apple', brand: 'Snapple', size: '16 fl oz', priceSale: '0.99', priceWas: '2.00', endsAt: DEFAULT_END, category: 'Drinks' },
  { id: 'kh-snapple-lemon', name: 'Lemon Tea Glass Bottle', brand: 'Snapple', size: '16 fl oz', priceSale: '0.99', priceWas: '2.00', endsAt: DEFAULT_END, category: 'Drinks' },
  { id: 'kh-snapple-peach', name: 'Peach Tea', brand: 'Snapple', size: '16 fl oz', priceSale: '0.99', priceWas: '2.00', endsAt: DEFAULT_END, category: 'Drinks' },
  { id: 'kh-snapple-kiwi', name: 'Kiwi Strawberry', brand: 'Snapple', size: '16 fl oz', priceSale: '0.99', priceWas: '2.00', endsAt: DEFAULT_END, category: 'Drinks' },
  { id: 'kh-tropicana-nopulp', name: 'Pure Premium No Pulp Orange Juice', brand: 'Tropicana', size: '46 fl oz', priceSale: '4.99', priceWas: '5.69', endsAt: END_MAY_25, category: 'Drinks' },
  { id: 'kh-tropicana-lowacid', name: 'Pure Premium Low Acid 100% Orange Juice', brand: 'Tropicana', size: '46 fl oz', priceSale: '4.99', priceWas: '5.69', endsAt: END_MAY_25, category: 'Drinks' },
  { id: 'kh-tropicana-somepulp', name: 'Orange Juice Some Pulp', brand: 'Tropicana', size: '46 fl oz', priceSale: '4.99', priceWas: '5.69', endsAt: END_MAY_25, category: 'Drinks' },
  { id: 'kh-tropicana-lotspulp', name: 'Orange Juice Lots Of Pulp', brand: 'Tropicana', size: '46 fl oz', priceSale: '4.99', priceWas: '5.69', endsAt: END_MAY_25, category: 'Drinks' },
  { id: 'kh-tropicana-calvitlots', name: 'Orange Juice Calcium + Vitamin D Lots Of Pulp', brand: 'Tropicana', size: '46 fl oz', priceSale: '4.99', priceWas: '5.69', endsAt: END_MAY_25, category: 'Drinks' },
  { id: 'kh-tropicana-calvitno', name: 'Orange Juice No Pulp Calcium + Vitamin D', brand: 'Tropicana', size: '46 fl oz', priceSale: '4.99', priceWas: '5.69', endsAt: END_MAY_25, category: 'Drinks' },
  { id: 'kh-tropicana-grapefruit', name: 'Pure Premium Red Grapefruit Juice', brand: 'Tropicana', size: '46 fl oz', priceSale: '4.99', priceWas: '5.69', endsAt: END_MAY_25, category: 'Drinks' },
  { id: 'kh-minutemaid-lemonade', name: 'Lemonade Mini Cans 10 ct', brand: 'Minute Maid', size: '10 ct', priceSale: '10.99', priceWas: '11.49', endsAt: '2033-01-01', category: 'Drinks' },

  // Candy & Snacks
  { id: 'kh-reeses', name: 'Plant Based Peanut Butter Cups', brand: "Reese's", size: '1.4 oz', priceSale: '1.49', priceWas: '3.69', endsAt: END_APR_30, category: 'Candy & Snacks' },
  { id: 'kh-loacker', name: 'Maxi Chocolate Crispy Wafer w/ Cream Filling', brand: 'Loacker', size: '7.05 oz', priceSale: '5.49', priceWas: '5.99', endsAt: END_MAY_25, category: 'Candy & Snacks' },
  { id: 'kh-hoffmans-pizza', name: 'Pizza Snaps Crispy Pockets w/ Pizza Filling', brand: "Hoffman's", size: '20 oz', priceSale: '9.49', priceWas: '10.49', endsAt: DEFAULT_END, category: 'Candy & Snacks' },
  { id: 'kh-ungers-corn', name: 'Whole Sweet Kernel Corn', brand: "Unger's", size: '15 oz', priceSale: '1.59', priceWas: '1.89', endsAt: DEFAULT_END, category: 'Pantry' },
  { id: 'kh-kineret-cookiedough', name: 'Chocolate Chip Cookie Dough', brand: 'Kineret', size: '24 oz', priceSale: '5.99', priceWas: '6.99', endsAt: DEFAULT_END, category: 'Frozen' },
  { id: 'kh-kleins-mango', name: 'Natural Dried Mango', brand: "Klein's Naturals", size: '7 oz', priceSale: '6.99', priceWas: '9.69', endsAt: END_MAY_11, category: 'Candy & Snacks' },
  { id: 'kh-bisno-cremeos', name: "Chocolate Creme O's Cookies", brand: 'Bisno', size: '8.5 oz', priceSale: '1.59', priceWas: '1.99', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-bisno-danish', name: 'Classic Danish Butter Flavor Cookies', brand: 'Bisno', size: '4 oz', priceSale: '1.49', priceWas: '1.99', endsAt: DEFAULT_END, category: 'Cookies' },

  // Sizgit
  { id: 'kh-sizgit-gfbw', name: 'Gluten Free Black & White Cookies', brand: 'Sizgit', size: '8 oz', priceSale: '2.99', priceWas: '11.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-sizgit-blueberry', name: 'Blueberry Mini Muffins', brand: 'Sizgit', size: '10.5 oz', priceSale: '2.99', priceWas: '10.69', endsAt: DEFAULT_END, category: 'Cakes', note: 'KFP' },
  { id: 'kh-sizgit-chinese', name: 'Gluten Free Chinese Cookies', brand: 'Sizgit', size: '7 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP · Gluten Free' },
  { id: 'kh-sizgit-marble-drizz', name: 'Gluten Free Drizzled Marble Cookies', brand: 'Sizgit', size: '7 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP · Gluten Free' },
  { id: 'kh-sizgit-almondhorn', name: 'Chocolate Dipped Almond Horn Cookies', brand: 'Sizgit', size: '7 oz', priceSale: '2.99', priceWas: '12.69', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-sizgit-bw', name: 'Black & White Cookies', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-sizgit-choco', name: 'Chocolate Chip Cookies', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP' },
  { id: 'kh-sizgit-fancy', name: 'Fancy Sandwich Cookies', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-sizgit-pass-sand', name: 'Passover Assorted Sandwich Cookies', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP' },
  { id: 'kh-sizgit-sprinkle', name: 'Sprinkle Cookies', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-sizgit-7layer-choc', name: 'Seven Layer Chocolate Cake', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-sizgit-carrot', name: 'Carrot Mini Muffin 12 pk', brand: 'Sizgit', size: '12 pk', priceSale: '2.99', priceWas: '10.69', endsAt: DEFAULT_END, category: 'Cakes', note: 'KFP' },
  { id: 'kh-sizgit-rainbow', name: 'Rainbow Cookies', brand: 'Sizgit', size: '12 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP' },
  { id: 'kh-sizgit-leaf', name: 'Gluten Free Chocolate Leaf Cookies', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP · Gluten Free' },
  { id: 'kh-sizgit-babyfingers', name: 'Baby Fingers Cookies', brand: 'Sizgit', size: '4 oz', priceSale: '2.99', priceWas: '5.39', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP' },
  { id: 'kh-sizgit-7layer', name: 'Seven Layer Cake', brand: 'Sizgit', size: '10 oz', priceSale: '2.99', priceWas: '10.69', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-sizgit-sponge', name: 'Sponge Loaf Cake', brand: 'Sizgit', size: '12 oz', priceSale: '2.99', priceWas: '9.99', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-sizgit-marble-loaf', name: 'Marble Loaf Cake', brand: 'Sizgit', size: '12 oz', priceSale: '2.99', priceWas: '9.99', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-sizgit-jellyroll', name: 'Raspberry Jelly Roll Cake', brand: 'Sizgit', size: '14 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-sizgit-wrapped', name: 'Individually Wrapped Cookies Brownie Filled', brand: 'Sizgit', size: '8 oz', priceSale: '2.99', priceWas: '11.99', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-sizgit-babybulk', name: 'Passover Baby Fingers Bulk', brand: 'Sizgit', size: '24 oz', priceSale: '3.99', priceWas: '17.99', endsAt: DEFAULT_END, category: 'Cookies' },

  // Oberlander
  { id: 'kh-ober-confetti', name: 'Snackables Confetti Cookies', brand: 'Oberlander', size: '5.5 oz', priceSale: '2.99', priceWas: '4.29', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-ober-deluxe-white', name: 'Deluxe White Seven Layer Cake', brand: 'Oberlander', size: '14 oz', priceSale: '2.99', priceWas: '13.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'KFP' },
  { id: 'kh-ober-choc-wgf', name: 'Chocolate Chip Cookies Wheat & Gluten Free', brand: 'Oberlander', size: '10 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-brownies', name: 'Wheat & Gluten Free Chocolate Brownies', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cakes', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-babyfingers', name: 'Gluten Free Baby Fingers', brand: 'Oberlander', size: '2 lb', priceSale: '3.99', priceWas: '16.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-ober-kracowsky', name: 'Nut Kracowsky Wheat & Gluten Free', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-sugfree-marble', name: 'Sugar Free Marble Loaf', brand: 'Oberlander', size: '7 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'Sugar Free' },
  { id: 'kh-ober-sandwich-wgf', name: 'Wheat & Gluten Free Sandwich Cookies', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-coconut', name: 'Coconut Macaroons', brand: 'Oberlander', size: '10 oz', priceSale: '2.99', priceWas: '6.39', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-ober-mac-choco', name: 'Macaroons Chocolate Gluten Free', brand: 'Oberlander', size: '10 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-ober-raspberry', name: 'Deluxe Raspberry Roll', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '13.99', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-ober-deluxe-choc-7', name: 'Deluxe Chocolate Seven Layer', brand: 'Oberlander', size: '14 oz', priceSale: '2.99', priceWas: '13.99', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-ober-gf-sponge', name: 'Gluten Free Sponge Loaf', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'Gluten Free' },
  { id: 'kh-ober-kichel', name: 'Wheat Free & Gluten Free Sugar Kichel', brand: 'Oberlander', size: '4 oz', priceSale: '2.99', priceWas: '8.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-assorted-wgf', name: 'Assorted Cookies Wheat & Gluten Free', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-rainbow-wgf', name: 'Rainbow Cookies Wheat & Gluten Free', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-chocfinger', name: 'Chocolate Fingers', brand: 'Oberlander', size: '4 oz', priceSale: '2.99', priceWas: '5.69', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-ober-bw-wgf', name: 'Black & White Cookies Wheat & Gluten Free', brand: 'Oberlander', size: '10 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },
  { id: 'kh-ober-choc-loaf', name: 'Chocolate Loaf', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'KFP' },
  { id: 'kh-ober-choc-leaf-wgf', name: 'Wheat & Gluten Free Chocolate Leaf', brand: 'Oberlander', size: '12 oz', priceSale: '2.99', priceWas: '13.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'Wheat & Gluten Free' },

  // Hagadda
  { id: 'kh-hag-brownie-cake', name: 'Gluten Free Chocolate Brownie Cake', brand: 'Hagadda', size: '16 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cakes', note: 'Gluten Free' },
  { id: 'kh-hag-choc-chip', name: 'Chocolate Chip Cookies', brand: 'Hagadda', size: '8 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-hag-coconut-gf', name: 'Gluten Free Coconut Macaroons', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-hag-choc-mac', name: 'Chocolate Macaroons', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-hag-assorted-gf', name: 'Assorted Cookies Gluten Free', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-hag-sprinkle-gf', name: 'Sprinkle Cookies Gluten Free', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '14.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-hag-7layer-choc', name: 'Seven Layer Chocolate Cake', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '11.99', endsAt: DEFAULT_END, category: 'Cakes' },
  { id: 'kh-hag-layercake', name: 'Gluten Free Layer Cake', brand: 'Hagadda', size: '28 oz', priceSale: '2.99', priceWas: '26.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'Gluten Free' },
  { id: 'kh-hag-dipped-coconut', name: 'Chocolate Dipped Coconut Macaroon', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-hag-white-7layer', name: 'Gluten Free White Seven Layer Cake', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '11.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'Gluten Free' },
  { id: 'kh-hag-sponge-gf', name: 'Gluten Free Sponge Loaf Cake', brand: 'Hagadda', size: '11 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'KFP · Gluten Free' },
  { id: 'kh-hag-marble-gf', name: 'Gluten Free Marble Cake', brand: 'Hagadda', size: '11 oz', priceSale: '2.99', priceWas: '10.99', endsAt: DEFAULT_END, category: 'Cakes', note: 'Gluten Free' },
  { id: 'kh-hag-fancy-gf', name: 'Fancy Gluten Free Sandwich Cookies', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-hag-leaf-gf', name: 'Leaf Cookies Gluten Free', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-hag-rainbow', name: 'Rainbow Cookies', brand: 'Hagadda', size: '12 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cookies' },
  { id: 'kh-hag-bw-gf', name: 'Black & White Cookies Gluten Free', brand: 'Hagadda', size: '10 oz', priceSale: '2.99', priceWas: '13.69', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },
  { id: 'kh-hag-chocbaby-gf', name: 'Chocolate Baby Fingers Gluten Free', brand: 'Hagadda', size: '4 oz', priceSale: '2.99', priceWas: '5.99', endsAt: DEFAULT_END, category: 'Cookies', note: 'Gluten Free' },

  // Bloom's
  { id: 'kh-bloom-linzer', name: 'Premium Linzer Tart Cookies', brand: "Bloom's", size: '10 oz', priceSale: '2.99', priceWas: '11.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP' },
  { id: 'kh-bloom-chocchip', name: 'Premium Chocolate Chip Cookies', brand: "Bloom's", size: '10 oz', priceSale: '2.99', priceWas: '11.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP' },
  { id: 'kh-bloom-bw', name: 'Premium Black & White Cookies', brand: "Bloom's", size: '10 oz', priceSale: '2.99', priceWas: '11.49', endsAt: DEFAULT_END, category: 'Cookies', note: 'KFP' },

  // Other
  { id: 'kh-royal-tuna', name: 'Tuna Deluxe', brand: 'Royal CRC', size: '7 oz', priceSale: '3.49', priceWas: '4.99', endsAt: '2033-09-26', category: 'Pantry' },
  { id: 'kh-raskins-herring', name: 'Old Fashioned Schmaltz Herring', brand: "Raskin's", size: '12 oz', priceSale: '7.99', priceWas: '8.99', endsAt: '2033-08-16', category: 'Dairy & Deli' },
];

export const manualStoresDefaults: ManualStore[] = [
  {
    id: 'kahans',
    name: "Kahan's Superette",
    logo: '/images/kahanskosher-logo.svg',
    logoEmoji: '🛒',
    address: '317 Kingston Ave, Crown Heights',
    phone: '(718) 756-2999',
    referenceUrl: 'https://www.kahanskosher.com/specials',
    updateInstructions: 'Visit kahanskosher.com/specials and copy the current week\'s deals.',
    specials: kahansSpecials,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'koltuv',
    name: 'Kol Tuv',
    logoEmoji: '🛍️',
    address: 'Crown Heights',
    referenceUrl: 'https://www.koltuvgrocery.com/',
    updateInstructions: 'Visit koltuvgrocery.com and copy the current week\'s specials.',
    specials: [],
    updatedAt: undefined,
  },
  {
    id: 'marketplace',
    name: 'Market Place',
    logoEmoji: '🏬',
    address: 'Crown Heights',
    referenceUrl: '',
    updateInstructions: 'Get this week\'s flyer from the store and enter items below.',
    specials: [],
    updatedAt: undefined,
  },
];
