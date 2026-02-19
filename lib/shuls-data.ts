export interface Shul {
  id: string;
  name: string;
  address: string;
  crossStreets?: string;
  phone?: string;
  contactName?: string;
  entranceImageUrl?: string;
  interiorImageUrl?: string;
  photoSourceUrl?: string;
}

export interface ShulReview {
  id: string;
  shulId: string;
  authorName: string;
  authorEmail?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  moderatedAt?: string;
}

export const defaultShuls: Shul[] = [
  {
    id: '770-chabad-lubavitch-world-headquarters',
    name: '770 Chabad Lubavitch World Headquarters',
    address: '770 Eastern Pkwy',
    crossStreets: 'Kingston & Brooklyn',
    phone: '718-756-9159',
    entranceImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/770%20Eastern%20Parkway%20entrance.jpg',
    interiorImageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Partial%20view%20of%20synagogue%20at%20770%20eastern%20parkway.jpg',
    photoSourceUrl: 'https://commons.wikimedia.org/wiki/Category:770_Eastern_Parkway'
  },
  { id: 'agudas-israel', name: 'Agudas Israel', address: '456 Crown St', crossStreets: 'Kingston & Brooklyn', phone: '917-362-4901', contactName: 'Yossi Hurwitz' },
  {
    id: 'ahavas-achim-empire-shtiebel',
    name: 'Ahavas Achim (Empire Shtiebel)',
    address: '489 Empire Blvd',
    crossStreets: 'Brooklyn & NY Ave',
    phone: '718-778-1514',
    contactName: 'Chezy Posner',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_7912_176981356915407.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_21456_293351806032385.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'ahavas-chesed', name: 'Ahavas Chesed', address: '271 Kingston Ave', crossStreets: 'Lincoln & St Johns', phone: '404-402-2444', contactName: 'Shimmy Ash' },
  {
    id: 'ahavas-moische-maple-street',
    name: 'Ahavas Moische (Maple Street Shul / Itchkes)',
    address: '612 Maple St',
    crossStreets: 'Albany & Kingston',
    phone: '718-493-0055',
    contactName: 'E. Blachman',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_28330_20088139822089.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  {
    id: 'aliya-bais-laime',
    name: 'Aliya (Bais Laime)',
    address: '527 E New York Ave',
    crossStreets: 'Brooklyn & Kingston',
    phone: '917-513-7802',
    contactName: 'Moishe Feiglin',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_7728_18195304962054.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_6625_28841797717258.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'anshei-maaseh', name: 'Anshei Maaseh', address: '1466 Union St', crossStreets: 'Kingston & Albany' },
  { id: 'anshe-moshe', name: 'Anshe Moshe', address: '1334 Lincoln Pl', crossStreets: 'Schenectady & Utica' },
  { id: 'anshei-nelm', name: 'Anshei N.E.L.M.', address: '960 St Johns Pl', crossStreets: 'NY Ave & Brooklyn', phone: '718-735-2752', contactName: 'S. Strauss' },
  { id: 'anshe-rubushov', name: 'Anshe Rubushov', address: '691 Crown St', crossStreets: 'Schenectady & Troy', phone: '718-773-2137', contactName: 'Z. Gelertner' },
  {
    id: 'bais-binyamin-viznitz',
    name: 'Bais Binyamin (Viznitz)',
    address: '680 Montgomery St',
    crossStreets: 'Kingston & Albany',
    phone: '718-774-2429',
    contactName: 'L. Minkowics',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_22812_10012827732109.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_17087_4531318397922.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  {
    id: 'bais-eliezer-yitzchok',
    name: 'Bais Eliezer Yitzchok',
    address: '394 Kingston Ave',
    crossStreets: 'Crown & Montgomery',
    phone: '917-681-1384',
    contactName: 'K. Weinfeld',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_29934_29594163658350.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'bais-menachem-mendel', name: 'Bais Menachem Mendel', address: '770 Lefferts Ave', crossStreets: 'Schenectady & Troy', phone: '718-756-0375', contactName: 'Ili Betesh' },
  {
    id: 'bais-rivka-crown-heights-yeshiva',
    name: 'Bais Rivka (Crown Heights Yeshiva)',
    address: '310 Crown St',
    crossStreets: 'Nostrand & NY Ave',
    phone: '718-756-3236',
    contactName: 'M. Bogomilsky',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_14941_236371600620180.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_6676_13940316443966.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'cong-935-anshei-chabad', name: 'Cong 935 (Anshei Chabad)', address: '935 Eastern Pkwy', crossStreets: 'Troy & Albany', phone: '917-756-9872', contactName: 'D. Geisinsky' },
  { id: 'beis-levi-yitschok', name: 'Beis Levi Yitschok', address: '556 Crown St', crossStreets: 'Crown & Albany', phone: '917-327-9493', contactName: 'M. Lerman' },
  { id: 'bnei-solomon-zalman-frankel', name: 'Bnei Solomon Zalman-Frankel', address: '1699 President St', crossStreets: 'Utica & Rochester', phone: '718-604-0528', contactName: 'F. Caplan' },
  { id: 'bris-sholom-the-best-shul', name: 'Bris Sholom (The Best Shul)', address: '382 Crown St', crossStreets: 'NY Ave & Brooklyn', phone: '917-770-1830', contactName: 'Y. Best' },
  { id: 'chevra-ahavas-yisroel', name: 'Chevra Ahavas Yisroel', address: '304 Albany St', crossStreets: 'Lincoln & Eastern Pkwy', phone: '917-553-3426', contactName: 'C. Denebaum' },
  {
    id: 'chevra-shas',
    name: 'Chevra Shas',
    address: '398 Kingston Ave',
    crossStreets: 'Montgomery & Crown',
    phone: '718-773-2670',
    contactName: 'M. Gurary',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_10107_316672520431330.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  {
    id: 'chovevei-torah-murphy-shul',
    name: 'Chovevei Torah (Murphy Shul)',
    address: '885 Eastern Pkwy',
    crossStreets: 'Albany & Troy',
    phone: '718-773-1702',
    contactName: 'E. Zirkind',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_14660_167781978415119.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_20465_17631192144299.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'congregation-anash', name: 'Congregation Anash', address: '770 Montgomery St', crossStreets: 'Albany & Troy', phone: '718-756-1542', contactName: 'H. Zarchi' },
  {
    id: 'david-gershon',
    name: 'David Gershon',
    address: '450 New York Ave',
    crossStreets: 'Malbone & NY Ave',
    phone: '718-778-7268',
    contactName: 'C. Rubin',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_2339_102271830013736.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  {
    id: 'eliyahu-nachum-ada-israel-lefferts',
    name: 'Eliyahu Nachum (Ada Israel-Lefferts)',
    address: '672 Lefferts Ave',
    crossStreets: 'Albany & Troy',
    phone: '718-778-3972',
    contactName: 'C. Kuperman',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_27155_88823206426187.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  {
    id: 'free',
    name: 'F.R.E.E.',
    address: '1383 President St',
    crossStreets: 'Kingston & Brooklyn',
    phone: '917-915-2994',
    contactName: 'Y. Misholuvin',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_26923_15500279035910.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_28359_44052330813141.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  {
    id: 'hadar-hatorah',
    name: 'Hadar Hatorah',
    address: '824 Eastern Pkwy',
    crossStreets: 'Kingston & Albany',
    phone: '917-743-2268',
    contactName: 'Tzvi Lipchik',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_19262_2853626845833.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_6892_281061287930294.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  {
    id: 'kahal-chasidim',
    name: 'Kahal Chasidim',
    address: '1612 Carroll St',
    crossStreets: 'Schenectady & Troy',
    phone: '718-774-5786',
    contactName: 'M. Baumgarten'
  },
  {
    id: 'kollel-menachem',
    name: 'Kollel Menachem',
    address: '303 Kingston Ave',
    crossStreets: 'Kingston & Eastern Pkwy',
    phone: '718-363-9255',
    contactName: 'Noach Fox',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_30807_63922145204450.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'ktav-sofer', name: 'Ktav Sofer', address: '646 Empire Blvd', crossStreets: 'Albany & Kingston', phone: '718-493-7187' },
  { id: 'mayanot', name: 'Mayanot', address: 'Crown & Montgomery', phone: '718-774-0002', contactName: 'A. Silver' },
  {
    id: 'mercaz-dovrei-ivrit-sefard-chabad',
    name: 'Mercaz Dovrei Ivrit / Sefard Chabad',
    address: '845 Eastern Parkway',
    crossStreets: 'Albany & Kingston',
    phone: '718-753-5543',
    contactName: 'G. Avichzer',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_32545_168501149214505.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'minyan-avreichem', name: 'Minyan Avreichem', address: '647 Montgomery St', crossStreets: 'Kingston & Brooklyn', phone: '917-449-1919', contactName: 'Shmuel Pevzner' },
  { id: 'minyan-hakolel-shalom-center', name: 'Minyan Hakolel (Shalom Center)', address: '483 Albany Ave', crossStreets: 'Empire & Lefferts', phone: '718-363-0980', contactName: 'S. Singer' },
  { id: 'mishkan-menachem-jcm', name: 'Mishkan Menachem (JCM)', address: '792 Eastern Parkway', crossStreets: 'Eastern Pkwy & Kingston', phone: '347-992-4015', contactName: 'M. Gurary' },
  { id: 'ner-menachem', name: 'Ner Menachem', address: '560 Empire Blvd', crossStreets: 'Kingston & Brooklyn', phone: '718-774-0969', contactName: 'P. Korf' },
  { id: 'nossons-shul', name: 'Nossons Shul', address: '579 Brooklyn Ave', crossStreets: 'Midwood & Rutland', phone: '305-778-5472', contactName: 'C.Y. Wilhelm' },
  { id: 'oihel-noson', name: 'Oihel Noson', address: '580 Crown St', crossStreets: 'Albany & Troy', phone: '347-721-8657', contactName: 'S. Brook' },
  { id: 'persian-center', name: 'Persian Center', address: '828 Eastern Parkway', crossStreets: 'Kingston & Albany', phone: '718-778-3100', contactName: 'M. Cohen' },
  { id: 'rayim-ahuvim', name: 'Rayim Ahuvim', address: '1614 Carroll St', crossStreets: 'Schenectady & Utica', phone: '718-778-7076', contactName: 'M. Bronstein' },
  {
    id: 'reines',
    name: 'Reines',
    address: '417 Troy Ave',
    crossStreets: 'Empire & Montgomery',
    phone: '718-604-0764',
    contactName: 'A. Kirshenbaum',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_11911_263208299612.jpg',
    interiorImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_20253_206423055723291.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'sephardic-minyan', name: 'Sephardic Minyan', address: '936 Lincoln Pl', crossStreets: 'Brooklyn & New York', phone: '718-735-4551', contactName: 'Y. Bitton' },
  { id: 'the-lincoln-place-shul', name: 'The Lincoln Place Shul', address: '1185 Lincoln Pl', crossStreets: 'Troy & Albany', phone: '917-676-0980', contactName: 'M. Shushan' },
  { id: 'sosnowiec', name: 'Sosnowiec', address: '534 Crown St', crossStreets: 'Albany & Kingston', phone: '718-756-9217', contactName: 'E. Peirkarski' },
  { id: 'the-shul', name: 'The Shul', address: '481 Albany Ave', crossStreets: 'Empire & Lefferts', phone: '718-877-3528', contactName: 'L. Kaplan' },
  { id: 'the-besht-center', name: 'The Besht Center', address: '563 Empire Blvd', crossStreets: 'Kingston & Brooklyn', phone: '347-693-0486', contactName: 'Rabbi Shmuel Kuperman' },
  { id: 'the-crown-heights-shul', name: 'The Crown Heights Shul', address: '570 Crown St (3rd Fl)', crossStreets: 'Crown & Albany', phone: '917-837-5794', contactName: 'B. Levin' },
  { id: 'three-ninety-one-kingston', name: 'Three Ninety One Kingston', address: '391 Kingston Ave', crossStreets: 'Crown & Montgomery', phone: '347-522-0377', contactName: 'Avi Lesches' },
  {
    id: 'torah-utefilah-shain-cong-tiferes',
    name: 'Torah Utefilah (Shain Cong Tiferes)',
    address: '390 Kingston Ave',
    crossStreets: 'Crown & Montgomery',
    phone: '718-774-1111',
    contactName: 'E. Shain',
    entranceImageUrl: 'https://collive.com/wp-content/uploads/photos/2013/09/26930_13430_213461179229666.jpg',
    photoSourceUrl: 'https://collive.com/shuls-of-crown-heights/'
  },
  { id: 'unzer-shul', name: 'Unzer Shul', address: '1457 Union St', crossStreets: 'Kingston & Albany', phone: '347-314-9076', contactName: 'Y. Baumgarten' }
];

export const SHULS_SOURCE_URL = 'https://chcentral.org/resources/directory/shuls/';

export interface MikvahPlace {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  notes?: string;
  sourceUrl?: string;
}

export interface PlaceInfo {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  notes?: string;
  sourceUrl?: string;
}

export interface RebbePhoto {
  id: string;
  title: string;
  imageUrl: string;
  sourceUrl: string;
}

export const crownHeightsMikvahs: MikvahPlace[] = [
  {
    id: 'crown-heights-mikvah-womens',
    name: 'Crown Heights Mikvah (Women)',
    address: '1506 Union St, Brooklyn, NY 11213',
    phone: '718-604-8787',
    website: 'https://www.chmikvah.org/',
    email: 'info@chmikvah.org',
    notes: 'Automated reservations: 718-412-2012. Weekday entrance: Albany Ave.',
    sourceUrl: 'https://www.chmikvah.org/hours/contact/'
  },
  {
    id: 'crown-heights-keilim-mikvah',
    name: 'Crown Heights Keilim Mikvah',
    address: '369 Kingston Ave (side alley), Brooklyn, NY 11213',
    website: 'https://www.chkeilimmikvah.org/',
    email: 'chkeilimmikvah@gmail.com',
    notes: 'Open 24 hours (closed on Shabbos and Yom Tov).',
    sourceUrl: 'https://www.chkeilimmikvah.org/'
  }
];

export const crownHeightsKollels: PlaceInfo[] = [
  {
    id: 'kollel-menachem',
    name: 'Kollel Menachem',
    address: '303 Kingston Ave, Brooklyn, NY 11213',
    phone: '718-363-9255',
    notes: 'Central Chabad kollel in Crown Heights.',
    sourceUrl: 'https://chcentral.org/resources/directory/shuls/'
  },
  {
    id: 'minyan-hakolel',
    name: 'Minyan Hakolel (Shalom Center)',
    address: '483 Albany Ave, Brooklyn, NY 11213',
    phone: '718-363-0980',
    sourceUrl: 'https://chcentral.org/resources/directory/shuls/'
  },
  {
    id: 'minyan-avreichem',
    name: 'Minyan Avreichem',
    address: '647 Montgomery St, Brooklyn, NY 11213',
    phone: '917-449-1919',
    sourceUrl: 'https://chcentral.org/resources/directory/shuls/'
  }
];

export const rebbeHouse: PlaceInfo = {
  id: 'rebbe-house',
  name: 'The Rebbe’s House',
  address: '1304 President St, Brooklyn, NY 11213',
  notes: 'Historic home of the Rebbe and Rebbetzin. Open to visitors on selected dates.',
  sourceUrl: 'https://chcentral.org/visitors-guide/places-of-interest/'
};

export const rebbeLibrary: PlaceInfo = {
  id: 'rebbe-library',
  name: 'Library of Agudas Chassidei Chabad (Ohel Yosef Yitzchak Lubavitch)',
  address: '770 Eastern Parkway, Brooklyn, NY 11213',
  phone: '718-493-1537',
  website: 'https://www.chabadlibrary.org/',
  email: 'library@chabad.org',
  sourceUrl: 'https://www.chabadlibrary.org/'
};

export const rebbeHouseGallery: RebbePhoto[] = [
  {
    id: 'rebbe-house-collive',
    title: "The Rebbe's House (1304 President St)",
    imageUrl: 'https://collive.com/wp-content/uploads/2021/06/Untitled-19-1.jpg',
    sourceUrl: 'https://collive.com/rebbes-house-room-to-open-for-prayers-3/'
  },
  {
    id: 'photo-770-entrance',
    title: '770 Eastern Parkway Entrance',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/770%20Eastern%20Parkway%20entrance.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:770_Eastern_Parkway_entrance.jpg'
  },
  {
    id: 'photo-770-front',
    title: '770 Eastern Parkway',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/770%20Eastern%20Parkway.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:770_Eastern_Parkway.jpg'
  },
  {
    id: 'photo-770-front-door',
    title: '770 Front Door',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Eastern%20Parkway%20770%20-%20front%20door.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Eastern_Parkway_770_-_front_door.jpg'
  },
  {
    id: 'photo-770-interior',
    title: '770 Interior Synagogue',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Partial%20view%20of%20synagogue%20at%20770%20eastern%20parkway.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Partial_view_of_synagogue_at_770_eastern_parkway.jpg'
  },
  {
    id: 'photo-770-bridge-library',
    title: 'Bridge to Chabad Library',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bridge%20from%20770%20to%20Chabad%20library.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Category:770_Eastern_Parkway'
  }
];
