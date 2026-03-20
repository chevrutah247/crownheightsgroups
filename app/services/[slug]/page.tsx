import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const serviceTypes: Record<string, {
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  icon: string;
  keywords: string[];
  faq: { q: string; a: string }[];
  tips: string[];
}> = {
  plumber: {
    title: 'Plumbers in Crown Heights',
    titleRu: 'Сантехники в Краун Хайтс',
    description: 'Find trusted Jewish plumbers in Crown Heights, Brooklyn. Emergency plumbing, drain cleaning, pipe repair, water heater installation. Available for Shabbos emergencies.',
    descriptionRu: 'Надёжные сантехники в Краун Хайтс. Аварийная сантехника, прочистка канализации, ремонт труб.',
    icon: '🔧',
    keywords: ['Crown Heights plumber', 'Brooklyn Jewish plumber', 'emergency plumbing Crown Heights', 'kosher plumber'],
    faq: [
      { q: 'Do you have plumbers available for Shabbos emergencies?', a: 'Yes, several of our listed plumbers handle Shabbos emergencies according to halachic guidelines for pikuach nefesh situations.' },
      { q: 'How quickly can a plumber arrive?', a: 'Most Crown Heights plumbers can arrive within 30-60 minutes for emergencies during business hours.' },
      { q: 'Do they provide free estimates?', a: 'Many plumbers offer free estimates for standard jobs. Call to confirm before scheduling.' },
    ],
    tips: ['Always get a written estimate before work begins', 'Ask about warranties on parts and labor', 'Check if they are licensed and insured in NYC'],
  },
  electrician: {
    title: 'Electricians in Crown Heights',
    titleRu: 'Электрики в Краун Хайтс',
    description: 'Licensed electricians in Crown Heights. Wiring, panel upgrades, outlet installation, lighting, Shabbos timers, and emergency electrical services.',
    descriptionRu: 'Лицензированные электрики в Краун Хайтс. Проводка, установка розеток, шаббатние таймеры.',
    icon: '⚡',
    keywords: ['Crown Heights electrician', 'Brooklyn Jewish electrician', 'Shabbos timer installation', 'emergency electrician'],
    faq: [
      { q: 'Can you install Shabbos timers?', a: 'Yes, our electricians are experienced with Shabbos timer installations and can set them up properly for your home.' },
      { q: 'Are your electricians NYC licensed?', a: 'All listed electricians hold proper NYC electrical licenses and insurance.' },
      { q: 'Do you handle commercial electrical work?', a: 'Yes, many of our electricians work on both residential and commercial projects including shuls and schools.' },
    ],
    tips: ['Never attempt DIY electrical work — it is dangerous and illegal in NYC', 'Make sure the electrician pulls permits for major work', 'Ask about energy-efficient upgrades'],
  },
  locksmith: {
    title: 'Locksmiths in Crown Heights',
    titleRu: 'Слесари в Краун Хайтс',
    description: 'Reliable locksmiths in Crown Heights. Lockouts, rekeying, new locks, high-security installations, and emergency service available 24/7.',
    descriptionRu: 'Надёжные слесари в Краун Хайтс. Вскрытие замков, перекодировка, установка новых замков, экстренный вызов 24/7.',
    icon: '🔑',
    keywords: ['Crown Heights locksmith', 'Brooklyn locksmith 24/7', 'emergency lockout Crown Heights', 'Jewish locksmith'],
    faq: [
      { q: 'Do you have 24/7 emergency lockout service?', a: 'Yes, several locksmiths offer 24/7 emergency service including Motzei Shabbos.' },
      { q: 'Can you install high-security locks?', a: 'Absolutely. Our locksmiths install Medeco, Mul-T-Lock, and other high-security brands.' },
      { q: 'How much does a lockout service cost?', a: 'Emergency lockout typically costs $75-150 depending on time and lock type.' },
    ],
    tips: ['Keep a spare key with a trusted neighbor', 'Consider a smart lock for keyless entry', 'Rekey locks when moving into a new apartment'],
  },
  handyman: {
    title: 'Handymen in Crown Heights',
    titleRu: 'Мастера на все руки в Краун Хайтс',
    description: 'Experienced handymen in Crown Heights for home repairs, furniture assembly, painting, drywall, shelving, and general maintenance.',
    descriptionRu: 'Опытные мастера на все руки в Краун Хайтс. Мелкий ремонт, сборка мебели, покраска, гипсокартон.',
    icon: '🛠️',
    keywords: ['Crown Heights handyman', 'Brooklyn home repair', 'Jewish handyman service', 'furniture assembly Crown Heights'],
    faq: [
      { q: 'What kind of jobs do handymen handle?', a: 'Everything from hanging shelves and assembling furniture to minor plumbing, painting, and drywall repair.' },
      { q: 'Do they work in apartments?', a: 'Yes, most of our handymen are experienced working in Crown Heights apartments and brownstones.' },
    ],
    tips: ['Have a clear list of tasks ready before the handyman arrives', 'Ask about hourly vs. flat-rate pricing'],
  },
  cleaning: {
    title: 'Cleaning Services in Crown Heights',
    titleRu: 'Уборка в Краун Хайтс',
    description: 'Professional cleaning services in Crown Heights. Regular house cleaning, Pesach cleaning, post-renovation cleanup, and move-in/move-out cleaning.',
    descriptionRu: 'Профессиональная уборка в Краун Хайтс. Регулярная уборка, уборка на Песах, после ремонта.',
    icon: '🧹',
    keywords: ['Crown Heights cleaning service', 'Pesach cleaning Brooklyn', 'Jewish house cleaning', 'deep cleaning Crown Heights'],
    faq: [
      { q: 'Do you offer Pesach cleaning?', a: 'Yes! Several cleaning services specialize in thorough Pesach cleaning, including kitchen, oven, and full-home deep clean.' },
      { q: 'How often should I schedule regular cleaning?', a: 'Most families in Crown Heights schedule weekly or bi-weekly cleaning, with extra sessions before Shabbos or Yom Tov.' },
    ],
    tips: ['Book Pesach cleaning early — schedules fill up fast', 'Prepare a checklist of priority areas', 'Ask about eco-friendly cleaning products'],
  },
  hvac: {
    title: 'HVAC Services in Crown Heights',
    titleRu: 'Отопление и кондиционеры в Краун Хайтс',
    description: 'HVAC services in Crown Heights. AC installation, heating repair, duct cleaning, and maintenance for homes and businesses.',
    descriptionRu: 'Отопление и кондиционеры в Краун Хайтс. Установка, ремонт, чистка вентиляции.',
    icon: '❄️',
    keywords: ['Crown Heights HVAC', 'AC repair Brooklyn', 'heating Crown Heights', 'air conditioning installation'],
    faq: [
      { q: 'When should I service my AC?', a: 'Schedule AC maintenance in early spring before the summer rush. Most units need annual service.' },
      { q: 'Can you install central air in a brownstone?', a: 'Yes, many HVAC technicians specialize in brownstone installations with ductless mini-split systems.' },
    ],
    tips: ['Change filters every 1-3 months', 'Schedule seasonal maintenance to avoid breakdowns', 'Consider a ductless mini-split for older buildings'],
  },
  taxi: {
    title: 'Taxi & Car Services in Crown Heights',
    titleRu: 'Такси в Краун Хайтс',
    description: 'Reliable taxi and car services in Crown Heights. Airport transfers, local rides, Shabbos pickup, and long-distance trips. Jewish-owned car services.',
    descriptionRu: 'Надёжное такси в Краун Хайтс. Трансферы в аэропорт, местные поездки, шаббатние перевозки.',
    icon: '🚕',
    keywords: ['Crown Heights taxi', 'Jewish car service Brooklyn', 'airport transfer Crown Heights', 'Shabbos pickup service'],
    faq: [
      { q: 'Can I book a ride to the airport?', a: 'Yes, most car services offer JFK, LaGuardia, and Newark airport transfers at flat rates.' },
      { q: 'Is there service on Motzei Shabbos?', a: 'Yes, several services resume immediately after Shabbos ends.' },
    ],
    tips: ['Book airport rides in advance for better rates', 'Ask about flat rates vs. metered rides', 'Check if they accept credit cards or only cash'],
  },
  glass: {
    title: 'Glass & Mirror Services in Crown Heights',
    titleRu: 'Стекло и зеркала в Краун Хайтс',
    description: 'Glass repair and installation in Crown Heights. Window replacement, mirrors, shower doors, glass shelving, and emergency board-up.',
    descriptionRu: 'Ремонт и установка стекла в Краун Хайтс. Замена окон, зеркала, душевые двери.',
    icon: '🪟',
    keywords: ['Crown Heights glass repair', 'window replacement Brooklyn', 'mirror installation', 'shower door Crown Heights'],
    faq: [
      { q: 'Can you replace a broken window same day?', a: 'Emergency window replacement is often available same day. Call for availability.' },
      { q: 'Do you install custom mirrors?', a: 'Yes, custom-cut mirrors for bathrooms, closets, and decorative purposes are available.' },
    ],
    tips: ['Measure your space carefully before ordering custom glass', 'Ask about tempered safety glass for shower doors', 'Get multiple quotes for large projects'],
  },
  moving: {
    title: 'Moving Services in Crown Heights',
    titleRu: 'Переезды в Краун Хайтс',
    description: 'Professional movers in Crown Heights. Local and long-distance moves, packing, storage, and furniture delivery. Experienced with walk-up buildings.',
    descriptionRu: 'Профессиональные грузчики в Краун Хайтс. Местные и междугородние переезды, упаковка, хранение.',
    icon: '📦',
    keywords: ['Crown Heights movers', 'Brooklyn moving service', 'Jewish movers', 'apartment moving Crown Heights'],
    faq: [
      { q: 'Do movers work on Fridays?', a: 'Most movers work Sundays through Fridays. Schedule early to finish before Shabbos.' },
      { q: 'Can they handle walk-up buildings?', a: 'Yes, Crown Heights movers are very experienced with brownstone walk-ups.' },
    ],
    tips: ['Book movers at least 2 weeks in advance', 'Declutter before moving to save time and money', 'Label boxes clearly by room'],
  },
  painter: {
    title: 'Painters in Crown Heights',
    titleRu: 'Маляры в Краун Хайтс',
    description: 'Professional painters in Crown Heights. Interior and exterior painting, wallpaper, drywall repair, and apartment turnover painting.',
    descriptionRu: 'Профессиональные маляры в Краун Хайтс. Внутренняя и внешняя покраска, обои, ремонт стен.',
    icon: '🎨',
    keywords: ['Crown Heights painter', 'Brooklyn house painting', 'apartment painting service', 'interior painter'],
    faq: [
      { q: 'How long does it take to paint an apartment?', a: 'A standard 2-bedroom apartment typically takes 1-2 days for a full interior paint job.' },
    ],
    tips: ['Choose paint colors in natural light', 'Ask about low-VOC paints for better air quality', 'Clear furniture away from walls before the painter arrives'],
  },
  'sim-cards': {
    title: 'SIM Cards & Cell Phone Services in Crown Heights',
    titleRu: 'SIM-карты и сотовая связь в Краун Хайтс',
    description: 'Kosher phone and SIM card services in Crown Heights. Filtered phones, prepaid plans, international calling, and phone repair.',
    descriptionRu: 'Кошерные телефоны и SIM-карты в Краун Хайтс. Фильтрованные телефоны, международные звонки.',
    icon: '📱',
    keywords: ['kosher phone Crown Heights', 'SIM card Brooklyn', 'filtered phone', 'Jewish cell phone service'],
    faq: [
      { q: 'What is a kosher phone?', a: 'A kosher phone has internet filtering or no internet access, meeting community standards for appropriate technology use.' },
    ],
    tips: ['Compare prepaid plans before committing to a contract', 'Ask about family plans for better rates'],
  },
  notary: {
    title: 'Notary Services in Crown Heights',
    titleRu: 'Нотариус в Краун Хайтс',
    description: 'Notary public services in Crown Heights. Document notarization, apostille, certified copies, and mobile notary services.',
    descriptionRu: 'Нотариальные услуги в Краун Хайтс. Заверение документов, апостиль, мобильный нотариус.',
    icon: '📋',
    keywords: ['Crown Heights notary', 'Brooklyn notary public', 'mobile notary service', 'document notarization'],
    faq: [
      { q: 'How much does notarization cost in NYC?', a: 'NYC notary fees are set by law at $2 per notarial act. Mobile notary services may charge an additional travel fee.' },
    ],
    tips: ['Bring valid government-issued photo ID', 'Do NOT sign the document before the notary — they need to witness your signature'],
  },
  musicians: {
    title: 'Musicians & Bands in Crown Heights',
    titleRu: 'Музыканты в Краун Хайтс',
    description: 'Jewish musicians and bands in Crown Heights for weddings, bar mitzvahs, farbrengens, and community events. One-man bands, DJs, and full orchestras.',
    descriptionRu: 'Еврейские музыканты в Краун Хайтс для свадеб, бар-мицв, фарбренгенов. Ди-джеи и оркестры.',
    icon: '🎵',
    keywords: ['Crown Heights musicians', 'Jewish wedding band Brooklyn', 'farbrengen music', 'bar mitzvah DJ Crown Heights'],
    faq: [
      { q: 'How early should I book musicians for a wedding?', a: 'Book at least 3-6 months in advance, especially during popular wedding seasons.' },
    ],
    tips: ['Ask for references from recent events', 'Discuss song list and style preferences in advance', 'Confirm equipment needs (sound system, microphones)'],
  },
  tile: {
    title: 'Tile Services in Crown Heights',
    titleRu: 'Плиточные работы в Краун Хайтс',
    description: 'Professional tile installation and repair in Crown Heights. Bathroom tiles, kitchen backsplash, floor tiling, and grout repair.',
    descriptionRu: 'Профессиональная укладка плитки в Краун Хайтс. Ванная, кухня, полы, ремонт затирки.',
    icon: '🔲',
    keywords: ['Crown Heights tile installer', 'Brooklyn bathroom tile', 'kitchen backsplash installation', 'tile repair'],
    faq: [
      { q: 'How long does a bathroom tile job take?', a: 'A standard bathroom retiling typically takes 2-4 days depending on size and complexity.' },
    ],
    tips: ['Choose slip-resistant tiles for bathrooms', 'Buy 10% extra tiles for cuts and future repairs', 'Seal grout after installation to prevent staining'],
  },
  carpenter: {
    title: 'Carpenters in Crown Heights',
    titleRu: 'Столяры в Краун Хайтс',
    description: 'Skilled carpenters in Crown Heights. Custom furniture, built-in shelving, sukkah building, closet systems, kitchen cabinets, and wood repair.',
    descriptionRu: 'Опытные столяры в Краун Хайтс. Мебель на заказ, полки, строительство сукки, кухонные шкафы.',
    icon: '🪚',
    keywords: ['Crown Heights carpenter', 'custom furniture Brooklyn', 'sukkah builder', 'Jewish carpenter Crown Heights'],
    faq: [
      { q: 'Can you build a sukkah?', a: 'Yes! Several carpenters specialize in sukkah construction, both portable and permanent structures.' },
      { q: 'Do you make custom built-ins?', a: 'Yes, custom shelving, closets, and built-in units are popular services.' },
    ],
    tips: ['Get detailed drawings before starting custom work', 'Ask about wood types and durability', 'Plan sukkah construction well before Sukkos'],
  },
};

export function generateStaticParams() {
  return Object.keys(serviceTypes).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = serviceTypes[params.slug];
  if (!service) return {};

  return {
    title: `${service.title} | Crown Heights Groups`,
    description: service.description,
    keywords: service.keywords,
    openGraph: {
      title: service.title,
      description: service.description,
      url: `https://www.crownheightsgroups.com/services/${params.slug}`,
    },
    alternates: { canonical: `https://www.crownheightsgroups.com/services/${params.slug}` },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = serviceTypes[params.slug];
  if (!service) notFound();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    areaServed: { '@type': 'Place', name: 'Crown Heights, Brooklyn, NY' },
    provider: { '@type': 'Organization', name: 'Crown Heights Groups' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4">
            <Link href="/services" className="text-blue-200 hover:text-white text-sm mb-4 inline-block">&larr; All Services</Link>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{service.icon}</span>
              <h1 className="text-3xl md:text-4xl font-bold">{service.title}</h1>
            </div>
            <p className="text-blue-100 text-lg max-w-2xl">{service.description}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Tips */}
          {service.tips.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tips for Hiring a {service.title.split(' in ')[0]}</h2>
              <ul className="space-y-3">
                {service.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* FAQ */}
          <section className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {service.faq.map((f, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{f.q}</h3>
                  <p className="text-gray-600 text-sm">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Need a {service.title.split(' in ')[0].toLowerCase()}?</h2>
            <p className="text-blue-700 text-sm mb-4">Browse our directory of trusted local professionals</p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              View All Services
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
