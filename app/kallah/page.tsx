'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShidduchBanner } from '@/components/PromoBanners';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

const services = [
  { category: 'dresses', name: 'אורי גמח כלות', nameEn: 'Uri Gemach', nameRu: 'Ури Гемах', description: 'שמלות כלה, איפור וסירוק', descriptionEn: 'Wedding dresses, makeup & styling', descriptionRu: 'Свадебные платья, макияж и укладка', phone: '052-886-5665', location: 'Elad', locationHe: 'אלעד' },
  { category: 'dresses', name: 'ליאנה גמח שמלות', nameEn: 'Liana Gemach', nameRu: 'Лиана Гемах', description: 'שמלות כלה', descriptionEn: 'Wedding dresses', descriptionRu: 'Свадебные платья', phone: '054-3036065', location: 'Or Yehuda', locationHe: 'אור יהודה' },
  { category: 'dresses', name: 'בתי׳ה גמח שמלות', nameEn: 'Batya Gemach', nameRu: 'Батья Гемах', description: 'שמלות כלה', descriptionEn: 'Wedding dresses', descriptionRu: 'Свадебные платья', phone: '052-3003153', location: 'Israel', locationHe: 'ישראל' },
  { category: 'dresses', name: 'דבי גמח שמלות', nameEn: 'Debbie Gemach', nameRu: 'Дебби Гемах', description: 'שמלות כלה', descriptionEn: 'Wedding dresses', descriptionRu: 'Свадебные платья', phone: '050-2570570', location: "Ra'anana", locationHe: 'רעננה' },
  { category: 'dresses', name: 'גמח אפרת כהן ז"ל', nameEn: 'Efrat Cohen Memorial', nameRu: 'Памяти Эфрат Коэн', description: 'מעל 150 שמלות כלה ללא עלות', descriptionEn: '150+ wedding dresses free', descriptionRu: '150+ свадебных платьев бесплатно', phone: '050-7360770', location: 'Ramat Gan', locationHe: 'רמת גן' },
  { category: 'dresses', name: 'סמדר זאבי גמ"ח', nameEn: 'Smadar Zeevi', nameRu: 'Смадар Зееви', description: 'שמלות, זרים, ברכת כלה, אביזרים', descriptionEn: 'Dresses, bouquets, accessories', descriptionRu: 'Платья, букеты, аксессуары', phone: '050-9908775', location: 'Petah Tikva', locationHe: 'פתח תקווה' },
  { category: 'dresses', name: 'כל כלה - סלון חברתי', nameEn: 'Kol Kallah Social Salon', nameRu: 'Коль Кала - социальный салон', description: 'חבילה מלאה ב-800₪: שמלה, נעליים, אביזרים. 4,000 שמלות!', descriptionEn: 'Full package 800₪: dress, shoes, accessories. 4,000 dresses!', descriptionRu: 'Полный пакет 800₪: платье, туфли, аксессуары. 4000 платьев!', phone: '052-3339002', location: 'Petah Tikva', locationHe: 'פתח תקווה', address: 'הסדנה 8' },
  { category: 'dresses', name: 'חיה רוזן גמח כלות', nameEn: 'Chaya Rosen', nameRu: 'Хая Розен', description: 'שמלות כלה', descriptionEn: 'Wedding dresses', descriptionRu: 'Свадебные платья', phone: '054-6303085', location: 'Beer Sheva', locationHe: 'באר שבע' },
  { category: 'dresses', name: 'אלינור סלון כלות', nameEn: 'Elinor Bridal Salon', nameRu: 'Салон Элинор', description: 'גמח שמלות כלה', descriptionEn: 'Wedding dress gemach', descriptionRu: 'Гемах свадебных платьев', phone: '058-6276566', location: 'Dimona', locationHe: 'דימונה' },
  { category: 'dresses', name: 'קארין גמח נדוניה', nameEn: 'Karin Dowry Gemach', nameRu: 'Карин - приданое', description: 'נדוניה לכלות', descriptionEn: 'Dowry for brides', descriptionRu: 'Приданое для невест', phone: '050-9254946', location: 'Ramla', locationHe: 'רמלה' },
  { category: 'makeup', name: 'עמותת אחותי כלה', nameEn: 'Achoti Kallah Foundation', nameRu: 'Фонд Ахоти Кала', description: 'איפור כלות נזקקות בחינם - לזכר דנה גליק ז"ל', descriptionEn: 'Free makeup for brides - in memory of Dana Glick', descriptionRu: 'Бесплатный макияж - памяти Даны Глик', phone: '054-4563544', email: 'veredana79@gmail.com', location: 'Israel', locationHe: 'ישראל' },
  { category: 'makeup', name: 'בת-י׳ה כהן', nameEn: 'Batya Cohen', nameRu: 'Батья Коэн', description: 'איפור כלות, אמהות, מלוות - מחירי גמ״ח', descriptionEn: 'Makeup: brides, mothers - gemach prices', descriptionRu: 'Макияж: невесты, мамы - цены гемаха', phone: '054-7771487', location: 'All Israel', locationHe: 'כל הארץ' },
  { category: 'makeup', name: 'שרה כהן', nameEn: 'Sarah Cohen', nameRu: 'Сара Коэн', description: 'מאפרת ומעצבת שיער', descriptionEn: 'Makeup artist & hair stylist', descriptionRu: 'Визажист и парикмахер', phone: '054-6348117', location: 'Jerusalem area', locationHe: 'איזור ירושלים' },
  { category: 'guides', name: 'דליה - מדריכת כלות', nameEn: 'Dalia - Bridal Guide', nameRu: 'Далия - консультант', description: 'הדרכת כלות ללא תשלום', descriptionEn: 'Free bridal guidance', descriptionRu: 'Бесплатные консультации', phone: '050-9091212', location: 'Petah Tikva', locationHe: 'פתח תקווה' },
  { category: 'guides', name: 'נעמה - מדריכת כלות', nameEn: 'Naama - Bridal Guide', nameRu: 'Наама - консультант', description: 'הדרכת כלות', descriptionEn: 'Bridal guidance', descriptionRu: 'Консультации для невест', phone: '054-5571022', location: 'Israel', locationHe: 'ישראל' },
  { category: 'music', name: 'גמח תקליטן', nameEn: 'DJ Gemach', nameRu: 'Гемах DJ', description: '10 שנות ניסיון', descriptionEn: '10 years experience', descriptionRu: '10 лет опыта', phone: '054-8849344', location: 'Israel', locationHe: 'ישראל' },
  { category: 'music', name: 'DJ חרדי/דתי', nameEn: 'Religious DJ', nameRu: 'Религиозный DJ', description: 'תקליטן מספר 1 בציבור החרדי - מחיר עלות', descriptionEn: '#1 DJ in religious community - cost price', descriptionRu: 'DJ #1 в религиозном секторе - по себестоимости', phone: '050-4147386', location: 'Israel', locationHe: 'ישראל' },
  { category: 'accessories', name: 'עדנה גמח נדוניה', nameEn: 'Edna Dowry Gemach', nameRu: 'Эдна - приданое', description: 'נדוניה לכלות', descriptionEn: 'Dowry items', descriptionRu: 'Приданое', phone: '052-3121512', location: 'Israel', locationHe: 'ישראל' },
  { category: 'accessories', name: 'גמ"ח כסא כלה', nameEn: 'Bridal Chair Gemach', nameRu: 'Гемах кресла невесты', description: 'כסא כלה 200₪, ברכת כלה חינם, זרי כלה 150₪', descriptionEn: 'Bridal chair 200₪, blessing free, bouquets 150₪', descriptionRu: 'Кресло 200₪, благословение бесплатно, букеты 150₪', phone: '054-8405882', location: 'Bnei Brak', locationHe: 'בני ברק' },
  { category: 'accessories', name: 'גמח משמחי כלה', nameEn: 'Mesamchei Kallah', nameRu: 'Месамхей Кала', description: 'קשתות, זרי כלה, סלסלאות, ציוד לצילומים', descriptionEn: 'Arches, bouquets, baskets, photo props', descriptionRu: 'Арки, букеты, корзины, реквизит', phone: '050-3332729', location: 'Elad', locationHe: 'אלעד' },
  { category: 'accessories', name: 'אודליה - מזון ורהיטים', nameEn: 'Odelia - Food & Furniture', nameRu: 'Оделия - еда и мебель', description: 'גמח מזון ורהיטים', descriptionEn: 'Food & furniture gemach', descriptionRu: 'Гемах еды и мебели', phone: '050-7809882', location: 'Israel', locationHe: 'ישראל' },
  { category: 'barmitzvah', name: 'בר/בת מצווה ליתומים', nameEn: 'Bar Mitzvah for Orphans', nameRu: 'Бар Мицва для сирот', description: 'מסיבה באולם, עליה לתורה בכותל, תפילין מהודרות 1400₪, סידור, טלית צמר - הכל חינם!', descriptionEn: 'Hall celebration, Kotel aliyah, premium Tefillin, Siddur, Tallit - all FREE!', descriptionRu: 'Праздник в зале, подъём к Торе у Стены, тфилин, сидур, талит - всё БЕСПЛАТНО!', phone: '052-6087084', location: 'Israel', locationHe: 'ישראל' },
  { category: 'other', name: 'מירב', nameEn: 'Merav', nameRu: 'Мерав', description: 'עזרה לכלות', descriptionEn: 'Help for brides', descriptionRu: 'Помощь невестам', phone: '052-7740552', location: 'Israel', locationHe: 'ישראל' },
  { category: 'other', name: 'סבטלנה', nameEn: 'Svetlana', nameRu: 'Светлана', description: 'עזרה לכלות', descriptionEn: 'Help for brides', descriptionRu: 'Помощь невестам', phone: '073-2284301', location: 'Israel', locationHe: 'ישראל' },
];

const whatsappGroups = [
  { name: 'Sharon Region | איזור השרון', nameRu: 'Район Шарон', link: 'https://chat.whatsapp.com/E7eRabYWLRQGnPkMquS0rZ', icon: '🏖️' },
  { name: 'South Israel | דרום הארץ', nameRu: 'Юг Израиля', link: 'https://chat.whatsapp.com/DRik30vQyjnHQ9tf00l6NI', icon: '🏜️' },
  { name: 'Center & Jerusalem | מרכז וירושלים', nameRu: 'Центр и Иерусалим', link: 'https://chat.whatsapp.com/LS3RTBP5eNiLNcFtdEWu8s', icon: '🏛️' },
  { name: 'North Israel | צפון הארץ', nameRu: 'Север Израиля', link: 'https://chat.whatsapp.com/KiAAoqeOZ5fKu6ko2CenDF', icon: '🌲' },
];

const categories = [
  { id: 'all', name: 'All', nameHe: 'הכל', nameRu: 'Все', icon: '📋' },
  { id: 'dresses', name: 'Dresses', nameHe: 'שמלות', nameRu: 'Платья', icon: '👗' },
  { id: 'makeup', name: 'Makeup', nameHe: 'איפור', nameRu: 'Макияж', icon: '💄' },
  { id: 'guides', name: 'Guides', nameHe: 'מדריכות', nameRu: 'Консультации', icon: '👰' },
  { id: 'music', name: 'DJ', nameHe: 'תקליטן', nameRu: 'DJ', icon: '🎵' },
  { id: 'accessories', name: 'Accessories', nameHe: 'אביזרים', nameRu: 'Аксессуары', icon: '💍' },
  { id: 'barmitzvah', name: 'Bar Mitzvah', nameHe: 'בר מצווה', nameRu: 'Бар Мицва', icon: '🎉' },
  { id: 'other', name: 'Other', nameHe: 'אחר', nameRu: 'Другое', icon: '✨' },
];

export default function KallahPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [lang, setLang] = useState<'en' | 'he' | 'ru'>('en');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', location: '', description: '', category: 'dresses' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (token) {
      fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
        .then(r => r.json())
        .then(data => { if (data.valid) setUser(data.user); })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };
  const filteredServices = selectedCategory === 'all' ? services : services.filter(s => s.category === selectedCategory);
  const getText = (en: string, he: string, ru: string) => lang === 'he' ? he : lang === 'ru' ? ru : en;

  const handleSubmitSuggestion = async () => {
    if (!formData.name || !formData.phone) return;
    setSubmitStatus('loading');
    try {
      const res = await fetch('/api/suggestions/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${formData.name} - Hachnasat Kallah`,
          description: formData.description,
          phone: formData.phone,
          address: formData.location,
          categoryId: '1769518048408',
          submittedBy: user?.email || 'anonymous',
          tags: ['kallah', 'wedding', 'gemach']
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '', location: '', description: '', category: 'dresses' });
        setTimeout(() => { setShowSuggestForm(false); setSubmitStatus('idle'); }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <ShidduchBanner />
        {/* Hero with Image */}
       <div style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)', borderRadius: '20px', marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
  <img src="/images/huppah-banner.jpg" alt="Chuppah" style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center' }} />
  <div style={{ padding: '2rem' }}>
    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💍</div>
          <h1 style={{ fontSize: '2rem', color: '#831843', marginBottom: '0.5rem' }}>{getText('Hachnasat Kallah', 'הכנסת כלה', 'Гахнасат Кала')}</h1>
          <p style={{ color: '#9d174d', fontSize: '1.1rem', marginBottom: '1rem' }}>{getText('Helping brides marry with dignity and joy', 'מצווה גדולה לעזור לכלות להתחתן בכבוד ובשמחה', 'Заповедь помогать невестам выйти замуж достойно и радостно')}</p>
          <p style={{ color: '#be185d', fontSize: '0.9rem', fontStyle: 'italic' }}>{getText('📖 Talmud, Ketubot 67b — helping a bride is one of the highest forms of tzedakah', '📖 תלמוד, כתובות סז ע"ב - הכנסת כלה היא מצווה גדולה', '📖 Талмуд, Ктубот 67б — помощь невесте - высшая форма цдаки')}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {[{ code: 'en', label: '🇺🇸 EN' }, { code: 'he', label: '🇮🇱 עב' }, { code: 'ru', label: '🇷🇺 RU' }].map(l => (
              <button key={l.code} onClick={() => setLang(l.code as any)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: lang === l.code ? '#be185d' : 'white', color: lang === l.code ? 'white' : '#831843', cursor: 'pointer', fontWeight: lang === l.code ? 'bold' : 'normal' }}>{l.label}</button>
            ))}
          </div>

          {/* Back to Groups */}
          <Link href="/groups" style={{ display: 'inline-block', marginTop: '1rem', color: '#9d174d', fontSize: '0.9rem' }}>
            ← {getText('Back to all groups', 'חזרה לכל הקבוצות', 'Назад ко всем группам')}
          </Link>
        </div>
        </div>

        {/* Add Service Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={() => setShowSuggestForm(true)} style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ {getText('Add Your Service', 'הוסף שירות', 'Добавить услугу')}
          </button>
        </div>

        {/* Suggest Form Modal */}
        {showSuggestForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', color: '#831843' }}>{getText('Add Your Kallah Service', 'הוסף שירות לכלות', 'Добавить услугу для невест')}</h3>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {getText('Help brides worldwide! Add your gemach or service.', 'עזרו לכלות בכל העולם! הוסיפו את הגמ״ח או השירות שלכם.', 'Помогите невестам по всему миру! Добавьте свой гемах или услугу.')}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder={getText('Name / Business Name', 'שם / שם העסק', 'Имя / Название')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="tel" placeholder={getText('Phone Number', 'מספר טלפון', 'Телефон')} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="text" placeholder={getText('Location (City, Country)', 'מיקום (עיר, מדינה)', 'Локация (город, страна)')} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="dresses">{getText('Wedding Dresses', 'שמלות כלה', 'Свадебные платья')}</option>
                  <option value="makeup">{getText('Makeup & Hair', 'איפור ושיער', 'Макияж')}</option>
                  <option value="accessories">{getText('Accessories', 'אביזרים', 'Аксессуары')}</option>
                  <option value="music">{getText('DJ / Music', 'תקליטן', 'DJ / Музыка')}</option>
                  <option value="guides">{getText('Bridal Guide', 'מדריכת כלות', 'Консультант')}</option>
                  <option value="other">{getText('Other', 'אחר', 'Другое')}</option>
                </select>
                <textarea placeholder={getText('Description of services', 'תיאור השירותים', 'Описание услуг')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button onClick={() => setShowSuggestForm(false)} style={{ flex: 1, padding: '0.75rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {getText('Cancel', 'ביטול', 'Отмена')}
                </button>
                <button onClick={handleSubmitSuggestion} disabled={submitStatus === 'loading' || !formData.name || !formData.phone} style={{ flex: 1, padding: '0.75rem', background: submitStatus === 'success' ? '#10b981' : '#be185d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: (!formData.name || !formData.phone) ? 0.5 : 1 }}>
                  {submitStatus === 'loading' ? '...' : submitStatus === 'success' ? '✓' : getText('Submit', 'שלח', 'Отправить')}
                </button>
              </div>
              
              {submitStatus === 'success' && <p style={{ color: '#10b981', textAlign: 'center', marginTop: '1rem' }}>{getText('Thank you! Your service will be reviewed.', 'תודה! השירות יבדק בקרוב.', 'Спасибо! Ваша услуга будет проверена.')}</p>}
              {submitStatus === 'error' && <p style={{ color: '#dc2626', textAlign: 'center', marginTop: '1rem' }}>{getText('Error. Please try again.', 'שגיאה. נסו שוב.', 'Ошибка. Попробуйте снова.')}</p>}
            </div>
          </div>
        )}

        {/* WhatsApp Groups */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#1e3a5f' }}>{getText('📱 WhatsApp Groups by Region (Israel)', '📱 קבוצות וואטסאפ לפי אזור (ישראל)', '📱 WhatsApp группы по регионам (Израиль)')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {whatsappGroups.map((g, i) => (
              <a key={i} href={g.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#25D366', color: 'white', borderRadius: '12px', textDecoration: 'none' }}>
                <span style={{ fontSize: '2rem' }}>{g.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{lang === 'ru' ? g.nameRu : g.name}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{getText('Free items & help', 'דברים בחינם ועזרה', 'Бесплатные вещи')}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#1e3a5f' }}>{getText('📋 Services Directory', '📋 מדריך שירותים', '📋 Каталог услуг')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedCategory === cat.id ? '#be185d' : '#fce7f3', color: selectedCategory === cat.id ? 'white' : '#831843', cursor: 'pointer', fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' }}>{cat.icon} {getText(cat.name, cat.nameHe, cat.nameRu)}</button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredServices.map((service, index) => (
            <div key={index} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #fce7f3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#831843' }}>{getText(service.nameEn, service.name, service.nameRu)}</h3>
                <span style={{ padding: '2px 8px', background: '#fdf2f8', borderRadius: '4px', fontSize: '0.75rem', color: '#9d174d' }}>📍 {lang === 'he' ? service.locationHe : service.location}</span>
              </div>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0', minHeight: '40px' }}>{getText(service.descriptionEn, service.description, service.descriptionRu)}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href={`tel:${service.phone.replace(/-/g, '')}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#be185d', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>📞 {service.phone}</a>
                {service.email && <a href={`mailto:${service.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f3f4f6', color: '#374151', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>✉️ {service.email}</a>}
                {service.address && <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>📍 {service.address}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ color: '#831843', marginBottom: '1rem' }}>{getText('Know a bride who needs help?', 'מכירים כלה שצריכה עזרה?', 'Знаете невесту, которой нужна помощь?')}</h3>
          <p style={{ color: '#9d174d', marginBottom: '1.5rem' }}>{getText("Share this page! It's a great mitzvah.", 'שתפו את הדף הזה! מצווה גדולה להפיץ', 'Поделитесь этой страницей! Большая мицва.')}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/?text=${encodeURIComponent('💍 Hachnasat Kallah - Help for Brides | הכנסת כלה\nhttps://crownheightsgroups.com/kallah')}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.75rem 1.5rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>💬 {getText('Share on WhatsApp', 'שתפו בוואטסאפ', 'Поделиться')}</a>
            <Link href="/business" style={{ padding: '0.75rem 1.5rem', background: '#8b5cf6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>🏪 {getText('View in Business', 'צפו בעסקים', 'Смотреть в бизнесе')}</Link>
            <Link href="/groups" style={{ padding: '0.75rem 1.5rem', background: '#1e3a5f', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>👥 {getText('All Groups', 'כל הקבוצות', 'Все группы')}</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}