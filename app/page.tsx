'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin' | 'superadmin'; }
interface Category { id: string; name: string; icon: string; slug: string; order?: number; }

const partners = [
  { name: 'ShabbatHub', url: 'https://shabbathub.com', logoUrl: '/images/shabbathub-logo.png', desc: 'Shabbat hospitality' },
  { name: 'Ed On The Go', url: 'https://edonthego.org', logoUrl: '/images/edonthego-logo.png', desc: 'Jewish education' },
  { name: 'GetAShidduch', url: 'https://getashidduch.org', logoUrl: '/images/getashidduch-logo.png', desc: 'Matchmaking platform' },
  { name: 'Chevrutah', url: 'https://chevrutah.org', logoUrl: '/images/chevrutah-logo.png', desc: 'Torah study partners' },
  { name: 'NURIT', url: 'https://nurit.vercel.app', logoUrl: '/images/nurit-logo.png', desc: 'Community project' },
  { name: 'Custom Glass Brooklyn', url: 'https://customglassbrooklyn.com', logoUrl: null, logo: '🪟', desc: 'Glass services' },
];

const quickAccessItems = [
  { title: 'Store Specials', icon: '🏷️', color: '#059669', href: '/specials', desc: 'Compare grocery prices', isStatic: true, isNew: true },
  { title: 'Classifieds', icon: '📋', color: '#16a34a', href: '/classifieds', desc: 'Buy, sell, housing, jobs', isStatic: true },
  { title: 'WhatsApp Groups', icon: '👥', color: '#25D366', href: '/groups', desc: 'All community groups', isStatic: true },
  { title: 'Services', icon: '🔧', color: '#2563eb', href: '/services', desc: 'Local professionals', isStatic: true },
  { title: 'Jobs', icon: '💼', color: '#7c3aed', keywords: ['job', 'business', 'career', 'work'], desc: 'Job listings & career' },
  { title: 'Housing', icon: '🏠', color: '#ea580c', keywords: ['real estate', 'housing', 'apartment', 'rent'], desc: 'Apartments & rooms' },
  { title: 'Buy & Sell', icon: '🛒', color: '#16a34a', keywords: ['buy', 'sell', 'marketplace', 'sale'], desc: 'Marketplace' },
  { title: 'Events', icon: '📅', color: '#dc2626', href: '/events', desc: 'Community events', isStatic: true },
  { title: 'Torah Learning', icon: '📚', color: '#7c3aed', href: '/torah-groups', desc: 'Torah study groups', isStatic: true },
  { title: 'Free / Gemach', icon: '🆓', color: '#0891b2', href: '/gemach', desc: 'Free loans & resources', isStatic: true },
  { title: 'Rides', icon: '🚗', color: '#4f46e5', keywords: ['ride', 'carpool', 'travel'], desc: 'Carpool & rides' },
  { title: 'News', icon: '📰', color: '#b91c1c', href: '/news', desc: 'Community news', isStatic: true },
  { title: 'Synagogues', icon: '🕍', color: '#1e3a5f', href: '/shuls', desc: 'Shuls, Kollel, Beit Midrash, Mikvahs', isStatic: true },
  { title: 'Yeshiva Directory', icon: '📚', color: '#1a5c3a', href: '/yeshivas', desc: 'Schools worldwide', isStatic: true },
  { title: 'Store Specials', icon: '🏷️', color: '#059669', href: '/specials', desc: 'Compare grocery prices', isStatic: true, isNew: true },
];

const addItems = [
  { title: 'Post Ad', icon: '📋', color: '#16a34a', href: '/add/classified', desc: 'Sell, rent, hire, find' },
  { title: 'Add Group', icon: '👥', color: '#25D366', href: '/add/group', desc: 'WhatsApp, Telegram, FB' },
  { title: 'Add Charity', icon: '💝', color: '#e11d48', href: '/add/charity', desc: 'Fundraising campaign' },
  { title: 'Add Event', icon: '🎉', color: '#f59e0b', href: '/add/event', desc: 'Simcha, Shiur, Farbrengen' },
  { title: 'Add Business', icon: '🏪', color: '#8b5cf6', href: '/add/business', desc: 'Local business listing' },
  { title: 'Host Shabbos', icon: '🕯️', color: '#c9a227', href: '/add/shabbos', desc: 'Invite guests for Shabbat' },
  { title: 'Post News', icon: '📰', color: '#dc2626', href: '/add/news', desc: 'Community announcement' },
];

const categoryGroups = [
  { label: '🏘️ Community & Living', color: '#1e3a5f', keywords: ['jewish community', 'torah', 'chesed', 'volunteering', 'singles', 'shidduch', 'women', 'men', 'minyan', 'shuls', 'mitzvah'] },
  { label: '💰 Business & Jobs', color: '#16a34a', keywords: ['jobs', 'business', 'service'] },
  { label: '🏠 Housing & Real Estate', color: '#ea580c', keywords: ['real estate', 'long-term', 'short-term', 'parking'] },
  { label: '🛒 Buy, Sell & Free', color: '#7c3aed', keywords: ['buy', 'sell', 'free', 'giveaway', 'shmira', 'free food'] },
  { label: '🎉 Events & Entertainment', color: '#dc2626', keywords: ['events', 'humor', 'fun', 'music', 'entertainment', 'sports'] },
  { label: '📚 Education & Family', color: '#0891b2', keywords: ['kids', 'education', 'babysitting'] },
  { label: '🚗 Transport & Travel', color: '#4f46e5', keywords: ['car', 'rides', 'carpool', 'travel'] },
  { label: '📰 News & Tech', color: '#b91c1c', keywords: ['news', 'tech', 'gadgets'] },
  { label: '🏡 Lifestyle', color: '#059669', keywords: ['health', 'wellness', 'food', 'recipes', 'home', 'garden', 'fashion', 'beauty', 'pets'] },
  { label: '📋 Other', color: '#6b7280', keywords: ['other'] },
];

const SUPERADMIN_EMAIL = 'chevrutah24x7@gmail.com';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState({ groups: 0, services: 0, users: 0, businesses: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [jewishDate, setJewishDate] = useState<string>('');
  const [parsha, setParsha] = useState<string>('');
  const [holidayCountdowns, setHolidayCountdowns] = useState<Array<{ label: string; date: string; days: number }>>([]);
  const [omerDay, setOmerDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isSuperAdmin = user?.email === SUPERADMIN_EMAIL;

  const toggleSection = (label: string) => {
    setExpandedSections(prev => 
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const getCategoriesForSection = (section: typeof categoryGroups[0]) => {
    return categories.filter(cat => {
      const catName = cat.name.toLowerCase();
      const catSlug = cat.slug?.toLowerCase() || '';
      return section.keywords.some(keyword => 
        catName.includes(keyword.toLowerCase()) || catSlug.includes(keyword.toLowerCase())
      );
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getUncategorized = () => {
    const allGrouped = new Set<string>();
    categoryGroups.forEach(section => {
      getCategoriesForSection(section).forEach(cat => allGrouped.add(cat.id));
    });
    return categories.filter(cat => !allGrouped.has(cat.id));
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { setIsAuthenticated(false); return; }
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) { setIsAuthenticated(true); setUser({ name: data.user.name, email: data.user.email, role: data.user.role }); }
        else { localStorage.clear(); setIsAuthenticated(false); }
      } catch (error) { setIsAuthenticated(false); }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, servicesRes, usersRes, catsRes, bizRes] = await Promise.all([
          fetch('/api/admin/groups'),
          fetch('/api/admin/services'),
          fetch('/api/admin/users'),
          fetch('/api/admin/group-categories'),
          fetch('/api/business')
        ]);
        const groups = await groupsRes.json();
        const services = await servicesRes.json();
        const users = await usersRes.json();
        const cats = await catsRes.json();
        const businesses = await bizRes.json();
        
        const approvedGroups = Array.isArray(groups) ? groups.filter((g: any) => g.status === 'approved') : [];
        setStats({
          groups: approvedGroups.length,
          services: Array.isArray(services) ? services.length : 0,
          users: Array.isArray(users) ? users.length : 0,
          businesses: Array.isArray(businesses) ? businesses.length : 0
        });
        
        if (Array.isArray(cats)) setCategories(cats);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchJewishInfo = async () => {
      try {
        const today = new Date();
        const dateRes = await fetch('https://www.hebcal.com/converter?cfg=json&gy=' + today.getFullYear() + '&gm=' + (today.getMonth() + 1) + '&gd=' + today.getDate() + '&g2h=1');
        const dateData = await dateRes.json();
        if (dateData.hebrew) setJewishDate(dateData.hebrew);

        // Sefirat HaOmer — parse from Hebcal events (e.g. "17th day of the Omer")
        if (Array.isArray(dateData.events)) {
          const omerEvent = dateData.events.find((e: string) => typeof e === 'string' && /day of the Omer/i.test(e));
          if (omerEvent) {
            const m = omerEvent.match(/(\d+)\w*\s+day of the Omer/i);
            if (m) {
              const d = parseInt(m[1], 10);
              if (d >= 1 && d <= 49) setOmerDay(d);
            }
          }
        }
        
        const parshaRes = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=5110302&M=on');
        const parshaData = await parshaRes.json();
        const parshaItem = parshaData.items?.find((item: any) => item.category === 'parashat');
        if (parshaItem) setParsha(parshaItem.title);

        const years = [today.getFullYear(), today.getFullYear() + 1];
        const eventResponses = await Promise.all(
          years.map((year) =>
            fetch(`https://www.hebcal.com/hebcal?cfg=json&maj=on&min=on&mod=on&year=${year}&month=x&i=off`)
              .then((r) => r.json())
              .catch(() => ({ items: [] }))
          )
        );

        const allItems = eventResponses.flatMap((r: any) => (Array.isArray(r?.items) ? r.items : []));
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const getNextEvent = (matcher: (title: string) => boolean) => {
          const candidates = allItems
            .filter((item: any) => typeof item?.title === 'string' && typeof item?.date === 'string')
            .filter((item: any) => matcher(item.title))
            .map((item: any) => ({ ...item, d: new Date(item.date) }))
            .filter((item: any) => !Number.isNaN(item.d.getTime()))
            .filter((item: any) => item.d >= startOfToday)
            .sort((a: any, b: any) => a.d.getTime() - b.d.getTime());
          return candidates[0];
        };

        const countFromToday = (date: Date) => Math.ceil((date.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

        // Standard holidays available in Hebcal events feed
        const holidayMatchers: Array<{ label: string; match: (t: string) => boolean }> = [
          { label: 'Pesach', match: (t) => t === 'pesach i' || t === 'pesach' },
          { label: 'Lag BaOmer', match: (t) => t.includes('lag b') && t.includes('omer') },
          { label: 'Shavuot', match: (t) => t === 'shavuot i' || t === 'shavuot' },
          { label: "Tisha B'Av", match: (t) => t.includes("tish") && t.includes("av") && !t.includes('shabbat') },
          { label: 'Rosh Hashana', match: (t) => t === 'rosh hashana' || t === 'rosh hashana i' || t === 'rosh hashanah' || t === 'rosh hashanah i' },
          { label: 'Yom Kippur', match: (t) => t === 'yom kippur' },
          { label: 'Sukkot', match: (t) => t === 'sukkot i' || t === 'sukkot' },
          { label: 'Simchat Torah', match: (t) => t.includes('simchat torah') },
          { label: 'Chanukah', match: (t) => t.includes('chanukah') && t.includes('1 candle') },
        ];

        const nextEvents: Array<{ label: string; date: Date; days: number }> = [];

        for (const h of holidayMatchers) {
          const ev = getNextEvent((title) => h.match(title.toLowerCase()));
          if (ev) {
            nextEvents.push({ label: h.label, date: ev.d, days: countFromToday(ev.d) });
          }
        }

        // Chabad-specific Hebrew dates (not in Hebcal default events)
        // hm format expected by Hebcal converter: "Tamuz", "Kislev", "Sh'vat"
        const chabadDates: Array<{ label: string; hm: string; hd: number }> = [
          { label: '3 Tammuz (Yahrzeit Rebbe)', hm: 'Tamuz', hd: 3 },
          { label: '12 Tammuz (Chag HaGeula)', hm: 'Tamuz', hd: 12 },
          { label: '19 Kislev (Chag HaGeula)', hm: 'Kislev', hd: 19 },
          { label: '10 Shvat (Yahrzeit Rayatz)', hm: "Sh'vat", hd: 10 },
        ];

        const currentHy: number | undefined = dateData.hy;
        if (currentHy) {
          const chabadResults = await Promise.all(
            chabadDates.map(async (c) => {
              for (const hy of [currentHy, currentHy + 1]) {
                try {
                  const res = await fetch(
                    `https://www.hebcal.com/converter?cfg=json&hy=${hy}&hm=${encodeURIComponent(c.hm)}&hd=${c.hd}&h2g=1&strict=1`
                  );
                  const j = await res.json();
                  if (j?.gy && j?.gm && j?.gd) {
                    const d = new Date(j.gy, j.gm - 1, j.gd);
                    if (!Number.isNaN(d.getTime()) && d >= startOfToday) {
                      return { label: c.label, date: d, days: countFromToday(d) };
                    }
                  }
                } catch {}
              }
              return null;
            })
          );

          chabadResults.forEach((r) => {
            if (r) nextEvents.push(r);
          });
        }

        // Sort by date and show only the single nearest upcoming holiday
        const sorted = nextEvents
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 1)
          .map((e) => ({
            label: e.label,
            date: e.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            days: e.days,
          }));

        setHolidayCountdowns(sorted);
      } catch (error) { console.error('Failed to fetch Jewish info:', error); }
    };
    fetchJewishInfo();
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const getCategoryLink = (item: typeof quickAccessItems[0]): string => {
    if (item.isStatic && item.href) return item.href;
    if (!item.keywords) return '/groups';
    for (const keyword of item.keywords) {
      const match = categories.find(c => 
        c.name.toLowerCase().includes(keyword.toLowerCase()) ||
        c.slug.toLowerCase().includes(keyword.toLowerCase())
      );
      if (match) return '/groups?category=' + match.slug;
    }
    return '/groups';
  };

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  const today = new Date();
  const gregorianDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', color: 'white', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            🏠 Crown Heights Community Hub
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
            Your one-stop resource for everything in the community
          </p>
          
          {/* Jewish Date & Parsha Widget */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'inline-block' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📅 Today</div>
                <div style={{ fontWeight: 'bold' }}>{gregorianDate}</div>
              </div>
              {jewishDate && (
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>✡️ Hebrew Date</div>
                  <div style={{ fontWeight: 'bold' }}>{jewishDate}</div>
                </div>
              )}
              {parsha && (
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📖 This Shabbos</div>
                  <div style={{ fontWeight: 'bold' }}>{parsha}</div>
                </div>
              )}
              {holidayCountdowns.map((holiday) => (
                <div key={holiday.label}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {holiday.label} ({holiday.date})
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    {holiday.days <= 0 ? 'Today' : `${holiday.days} day${holiday.days === 1 ? '' : 's'} left`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.groups}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>👥 Groups</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.services}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>🔧 Services</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.businesses}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>🏪 Businesses</div>
            </div>
            {isSuperAdmin && (
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.users}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>👑 Members</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* 🕯️ SEFIRAT HAOMER BLOCK (auto-shown only during Omer period) */}
        {omerDay !== null && (() => {
          const sefirotHebrew = [
            '', // index 0
            'חסד שבחסד', 'גבורה שבחסד', 'תפארת שבחסד', 'נצח שבחסד', 'הוד שבחסד', 'יסוד שבחסד', 'מלכות שבחסד',
            'חסד שבגבורה', 'גבורה שבגבורה', 'תפארת שבגבורה', 'נצח שבגבורה', 'הוד שבגבורה', 'יסוד שבגבורה', 'מלכות שבגבורה',
            'חסד שבתפארת', 'גבורה שבתפארת', 'תפארת שבתפארת', 'נצח שבתפארת', 'הוד שבתפארת', 'יסוד שבתפארת', 'מלכות שבתפארת',
            'חסד שבנצח', 'גבורה שבנצח', 'תפארת שבנצח', 'נצח שבנצח', 'הוד שבנצח', 'יסוד שבנצח', 'מלכות שבנצח',
            'חסד שבהוד', 'גבורה שבהוד', 'תפארת שבהוד', 'נצח שבהוד', 'הוד שבהוד', 'יסוד שבהוד', 'מלכות שבהוד',
            'חסד שביסוד', 'גבורה שביסוד', 'תפארת שביסוד', 'נצח שביסוד', 'הוד שביסוד', 'יסוד שביסוד', 'מלכות שביסוד',
            'חסד שבמלכות', 'גבורה שבמלכות', 'תפארת שבמלכות', 'נצח שבמלכות', 'הוד שבמלכות', 'יסוד שבמלכות', 'מלכות שבמלכות',
          ];
          const weeks = Math.floor(omerDay / 7);
          const extraDays = omerDay % 7;
          const weekDayText = omerDay >= 7
            ? `${weeks} week${weeks > 1 ? 's' : ''}${extraDays > 0 ? ` + ${extraDays} day${extraDays > 1 ? 's' : ''}` : ''}`
            : '';
          return (
            <section style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #4a1d6e 100%)',
              borderRadius: '20px',
              padding: '1.75rem 2rem',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(74,29,110,0.35)',
              border: '1px solid rgba(251,191,36,0.25)',
            }}>
              {/* decorative glow circles */}
              <div style={{ position: 'absolute', top: '-60px', right: '10%', width: '220px', height: '220px', background: '#a855f7', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-50px', left: '15%', width: '180px', height: '180px', background: '#f59e0b', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }} />

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Day counter circle */}
                <div style={{
                  flexShrink: 0,
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(168,85,247,0.2))',
                  border: '3px solid rgba(251,191,36,0.45)',
                  boxShadow: '0 0 40px rgba(168,85,247,0.25)',
                }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'Georgia, serif', lineHeight: 1 }}>{omerDay}</span>
                  <span style={{ color: '#d8b4fe', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.3rem' }}>of the Omer</span>
                </div>

                {/* Content */}
                <div style={{ flex: '1 1 320px', minWidth: 0, textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(168,85,247,0.18)',
                    border: '1px solid rgba(168,85,247,0.35)',
                    color: '#d8b4fe',
                    padding: '4px 14px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '0.8rem',
                  }}>
                    Sefirat HaOmer · ספירת העומר
                  </div>
                  <h2 style={{
                    margin: '0 0 0.5rem 0',
                    color: 'white',
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    fontFamily: 'Georgia, serif',
                    direction: 'rtl',
                  }}>
                    {sefirotHebrew[omerDay]}
                  </h2>
                  <p style={{ color: 'rgba(216,180,254,0.85)', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>
                    Today is <strong style={{ color: '#fbbf24' }}>{omerDay}</strong> day{omerDay > 1 ? 's' : ''} of the Omer
                    {weekDayText && <span style={{ opacity: 0.85 }}> &nbsp;({weekDayText})</span>}
                  </p>
                  {/* Progress bar */}
                  <div style={{ maxWidth: '420px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(216,180,254,0.6)', marginBottom: '4px' }}>
                      <span>Sefirat HaOmer</span>
                      <span>{omerDay}/49</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(88,28,135,0.5)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(omerDay / 49) * 100}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #a855f7)',
                        borderRadius: '999px',
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* 📱 CONNECT2KEHILLA BANNER */}
        <section style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          <style>{`
            @keyframes c2k-pulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.55), 0 8px 28px rgba(30,58,95,0.25); transform: scale(1); }
              50% { box-shadow: 0 0 0 14px rgba(59,130,246,0), 0 10px 32px rgba(30,58,95,0.3); transform: scale(1.01); }
            }
            @keyframes c2k-shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes c2k-ring {
              0%, 100% { transform: rotate(-8deg); }
              10%, 30% { transform: rotate(14deg); }
              20%, 40% { transform: rotate(-14deg); }
              50% { transform: rotate(0deg); }
            }
            .c2k-banner { animation: c2k-pulse 2.2s ease-in-out infinite; }
            .c2k-banner:hover { transform: translateY(-3px) scale(1.01) !important; }
            .c2k-phone { animation: c2k-ring 2.5s ease-in-out infinite; display: inline-block; transform-origin: center; }
            .c2k-cta {
              background: linear-gradient(90deg, #ffd700 0%, #fbbf24 25%, #ffffff 50%, #fbbf24 75%, #ffd700 100%);
              background-size: 200% 100%;
              animation: c2k-shimmer 2.8s linear infinite;
            }
            .c2k-chip {
              background: rgba(255,255,255,0.14);
              border: 1px solid rgba(255,255,255,0.28);
              color: #fff;
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 0.72rem;
              font-weight: 700;
              letter-spacing: 0.3px;
              white-space: nowrap;
              backdrop-filter: blur(4px);
            }
            .c2k-chip-menu {
              background: linear-gradient(135deg, #fde047, #f59e0b);
              border: 1px solid rgba(255,255,255,0.6);
              color: #0f172a;
              padding: 4px 12px;
              border-radius: 999px;
              font-size: 0.75rem;
              font-weight: 800;
              letter-spacing: 0.5px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(251,191,36,0.45);
              animation: c2k-menu-bounce 1.6s ease-in-out infinite;
            }
            @keyframes c2k-menu-bounce {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-2px) scale(1.06); }
            }
            @keyframes c2k-new-blink {
              0%, 49% {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                box-shadow: 0 2px 18px rgba(239,68,68,0.9), 0 0 0 0 rgba(239,68,68,0.75);
                transform: scale(1.06);
              }
              50%, 100% {
                background: linear-gradient(135deg, #fde047, #facc15);
                color: #7f1d1d;
                box-shadow: 0 2px 22px rgba(250,204,21,0.95), 0 0 0 10px rgba(250,204,21,0);
                transform: scale(1.14);
              }
            }
            .c2k-new-badge {
              animation: c2k-new-blink 0.75s steps(2, end) infinite;
              transform-origin: left center;
            }
            .c2k-phone-bg { opacity: 0.95; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.45)); }
            @media (max-width: 860px) {
              .c2k-phone-bg { display: none; }
            }
            @keyframes kosher-screen-blink {
              0%, 49% { fill: #0f172a; }
              50%, 100% { fill: #1e293b; }
            }
            @keyframes kosher-start-blink {
              0%, 49% { opacity: 1; fill: #fde047; }
              50%, 100% { opacity: 0.25; fill: #facc15; }
            }
            @keyframes kosher-number-pulse {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0.55; }
            }
            .kosher-screen { animation: kosher-screen-blink 0.8s steps(2, end) infinite; }
            .kosher-start-text { animation: kosher-start-blink 0.55s steps(2, end) infinite; }
            .kosher-number-text { animation: kosher-number-pulse 0.8s steps(2, end) infinite; }
            .c2k-chip-start {
              border: 1.5px solid rgba(255,255,255,0.8);
              color: white;
              padding: 5px 14px;
              border-radius: 999px;
              font-size: 0.8rem;
              font-weight: 900;
              letter-spacing: 0.6px;
              white-space: nowrap;
              animation: c2k-start-blink 0.6s steps(2, end) infinite;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            @keyframes c2k-start-blink {
              0%, 49% {
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                transform: scale(1);
                box-shadow: 0 2px 10px rgba(34,197,94,0.55);
              }
              50%, 100% {
                background: linear-gradient(135deg, #fde047, #f59e0b);
                color: #14532d;
                transform: scale(1.12);
                box-shadow: 0 2px 14px rgba(250,204,21,0.85);
              }
            }
          `}</style>
          <a
            href="https://www.connect2kehilla.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div
              className="c2k-banner"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #2563eb 75%, #3b82f6 100%)',
                borderRadius: '20px',
                padding: '1.5rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                border: '2px solid rgba(255,255,255,0.25)',
                transition: 'transform 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Kosher phone with live screen showing phone number + blinking START */}
              <svg
                className="c2k-phone-bg"
                aria-hidden="true"
                viewBox="0 0 140 260"
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(-4deg)',
                  height: '240px',
                  width: '130px',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              >
                {/* Phone body */}
                <rect x="4" y="4" width="132" height="252" rx="18" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                {/* Speaker grill at top */}
                <rect x="52" y="11" width="36" height="3" rx="1.5" fill="#475569" />
                {/* Screen area — subtly blinking */}
                <rect className="kosher-screen" x="12" y="22" width="116" height="104" rx="6" stroke="#334155" strokeWidth="1" />
                {/* Green header bar */}
                <rect x="12" y="22" width="116" height="18" rx="6" fill="#059669" />
                <rect x="12" y="32" width="116" height="8" fill="#059669" />
                <text x="70" y="34" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">Connect2Kehilla</text>
                {/* Phone number — pulsing */}
                <text className="kosher-number-text" x="70" y="62" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif">(888)</text>
                <text className="kosher-number-text" x="70" y="78" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif">516-3399</text>
                {/* Divider */}
                <line x1="30" y1="90" x2="110" y2="90" stroke="#334155" strokeWidth="1" />
                {/* START — strongly blinking */}
                <text className="kosher-start-text" x="70" y="114" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="2">START</text>
                {/* 4x3 keypad with numbers */}
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2].map((col) => {
                    const labels = ['1','2','3','4','5','6','7','8','9','*','0','#'];
                    const label = labels[row * 3 + col];
                    return (
                      <g key={`k-${row}-${col}`}>
                        <rect
                          x={22 + col * 32}
                          y={140 + row * 26}
                          width="26"
                          height="20"
                          rx="5"
                          fill="#334155"
                          stroke="#475569"
                          strokeWidth="0.6"
                        />
                        <text
                          x={35 + col * 32}
                          y={154 + row * 26}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="10"
                          fontWeight="600"
                          fontFamily="system-ui, sans-serif"
                        >
                          {label}
                        </text>
                      </g>
                    );
                  })
                )}
              </svg>

              <span className="c2k-new-badge" style={{
                position: 'absolute',
                top: '10px',
                left: '16px',
                fontSize: '0.78rem',
                fontWeight: 900,
                padding: '6px 16px',
                borderRadius: '999px',
                letterSpacing: '1.2px',
                zIndex: 3,
                whiteSpace: 'nowrap',
                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
              }}>⚡ NEW · KOSHER PHONE SERVICE ⚡</span>

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.1rem', flex: '1 1 320px', minWidth: 0, marginTop: '1rem' }}>
                <span className="c2k-phone" style={{ fontSize: '2.6rem', lineHeight: 1 }}>📱</span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{
                    margin: '0 0 0.35rem 0',
                    fontSize: '1.3rem',
                    color: 'white',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                  }}>
                    Connect2Kehilla — Text <span style={{ color: '#ffd700' }}>(888) 516-3399</span>
                  </h3>
                  <p style={{
                    margin: '0 0 0.6rem 0',
                    color: 'rgba(255,255,255,0.92)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}>
                    Find businesses, minyanim, jobs, zmanim & more — all by text message
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                    <span className="c2k-chip-start">🚀 TEXT START</span>
                    <span className="c2k-chip-menu">💬 TEXT MENU</span>
                    <span className="c2k-chip">PLUMBER + ZIP</span>
                    <span className="c2k-chip">PIZZA + ZIP</span>
                    <span className="c2k-chip">ZMANIM + ZIP</span>
                  </div>
                </div>
              </div>

              <div
                className="c2k-cta"
                style={{
                  color: '#0f172a',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '25px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(255,215,0,0.35)',
                  letterSpacing: '0.3px',
                }}
              >
                Visit Site →
              </div>
            </div>
          </a>
        </section>

        {/* 💍 SHIDDUCH BANNER */}
        <section style={{ marginBottom: '1.5rem' }}>
          <style>{`
            @keyframes shimmer-border {
              0%, 100% { border-color: #f472b6; box-shadow: 0 0 15px rgba(244,114,182,0.4), inset 0 0 15px rgba(244,114,182,0.1); }
              25% { border-color: #c084fc; box-shadow: 0 0 20px rgba(192,132,252,0.5), inset 0 0 20px rgba(192,132,252,0.1); }
              50% { border-color: #fb923c; box-shadow: 0 0 25px rgba(251,146,60,0.5), inset 0 0 25px rgba(251,146,60,0.1); }
              75% { border-color: #facc15; box-shadow: 0 0 20px rgba(250,204,21,0.5), inset 0 0 20px rgba(250,204,21,0.1); }
            }
            @keyframes confetti-float {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(-20px) rotate(360deg); opacity: 0.3; }
            }
            .shidduch-banner { animation: shimmer-border 3s ease-in-out infinite; }
            .shidduch-banner:hover { transform: translateY(-3px) !important; }
            .confetti-piece { animation: confetti-float 2s ease-in-out infinite alternate; display: inline-block; }
          `}</style>
          <a href="https://getashidduch.org" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
            <div
              className="shidduch-banner"
              style={{
                background: 'linear-gradient(135deg, #831843 0%, #be185d 30%, #9333ea 70%, #6d28d9 100%)',
                borderRadius: '20px',
                padding: '1.5rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                border: '3px solid #f472b6',
                transition: 'transform 0.3s',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '1.5rem', pointerEvents: 'none' }}>
                <span className="confetti-piece" style={{ animationDelay: '0s' }}>🎊</span>
                <span className="confetti-piece" style={{ animationDelay: '0.5s' }}>✨</span>
              </div>
              <div style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '1.5rem', pointerEvents: 'none' }}>
                <span className="confetti-piece" style={{ animationDelay: '0.3s' }}>💍</span>
                <span className="confetti-piece" style={{ animationDelay: '0.8s' }}>🎊</span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.4rem', color: 'white', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  💍 Shidduch — Find Your Match!
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                  GetAShidduch.org — Free matchmaking service for the Jewish community
                </p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#831843',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
              }}>
                Get Started →
              </div>
            </div>
          </a>
        </section>

        {/* 🏷️ STORE SPECIALS BANNER */}
        <section style={{ marginBottom: '1.5rem' }}>
          <Link href="/specials" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
              borderRadius: '20px',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              animation: 'pulse-glow 2s ease-in-out infinite',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                letterSpacing: '1px',
                animation: 'bounce-badge 1.5s ease-in-out infinite',
              }}>NEW</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.5rem' }}>🏷️</span>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'white', fontWeight: 'bold' }}>Store Specials — Price Comparison</h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>Compare weekly deals from KosherTown, Kosher Family & Empire Kosher</p>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#065f46',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
              }}>
                Compare Now →
              </div>
            </div>
          </Link>
        </section>

        {/* 📚 TORAH LEARNING BANNER */}
        <section style={{ marginBottom: '1.5rem' }}>
          <a href="https://www.torahmates.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
              borderRadius: '20px',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <img src="https://www.oorah.org/img/logos/TMLogo.png" alt="TorahMates" style={{ height: '50px', objectFit: 'contain' }} />
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: 'white', fontWeight: 'bold' }}>Want to Learn Torah?</h3>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>Free one-on-one learning with a partner • Any level • Any topic</p>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#1e3a5f',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontSize: '1rem',
                whiteSpace: 'nowrap'
              }}>
                Sign Up Free →
              </div>
            </div>
          </a>
        </section>

        {/* 🎰 LOTTERY POOL BANNER */}
        <section style={{ marginBottom: '2.5rem' }}>
          <Link href="/lottery" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
              borderRadius: '20px',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', 
                    color: '#1a1a2e', 
                    padding: '0.35rem 0.7rem', 
                    borderRadius: '6px', 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>MEGA MILLIONS</span>
                  <span style={{ color: '#ffd700', fontSize: '1rem', fontWeight: 'bold' }}>+</span>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #E31837 0%, #C41230 100%)', 
                    color: 'white', 
                    padding: '0.35rem 0.7rem', 
                    borderRadius: '6px', 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem',
                    fontStyle: 'italic',
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>POWERBALL</span>
                </div>
                <div>
                  <h3 style={{ 
                    color: '#ffd700', 
                    margin: '0 0 0.25rem 0', 
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    Community Lottery Pool
                  </h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                    Mega Millions + Powerball • From $2/week • Win Together!
                  </p>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#1e3a5f',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontSize: '1rem',
                whiteSpace: 'nowrap'
              }}>
                Join Now →
              </div>
            </div>
          </Link>
        </section>
        
        {/* ADD SECTION */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center', color: '#1e3a5f' }}>
            ➕ Share With The Community
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {addItems.map(item => (
              <Link 
                key={item.title} 
                href={item.href}
                style={{ 
                  textDecoration: 'none',
                  display: 'block',
                  background: item.color + '15',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '2px solid ' + item.color + '40',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h3 style={{ color: item.color, margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{item.title}</h3>
                <p style={{ color: '#666', margin: 0, fontSize: '0.75rem' }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Access Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>🔍 Explore Our Community</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {quickAccessItems.map(item => (
              <Link
                key={item.title}
                href={getCategoryLink(item)}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  background: (item as any).isNew ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'white',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: (item as any).isNew ? '0 0 12px rgba(5,150,105,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                  border: '2px solid ' + ((item as any).isNew ? item.color + '60' : item.color + '20'),
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  textAlign: 'center',
                  position: 'relative',
                  animation: (item as any).isNew ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                }}
              >
                {(item as any).isNew && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                    letterSpacing: '0.5px',
                    animation: 'bounce-badge 1.5s ease-in-out infinite',
                  }}>NEW</span>
                )}
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h3 style={{ color: item.color, margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ color: '#666', margin: 0, fontSize: '0.8rem' }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* All Categories - Collapsible Dropdowns */}
        {categories.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📁 All Group Categories</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categoryGroups.map(section => {
                const sectionCats = getCategoriesForSection(section);
                if (sectionCats.length === 0) return null;
                const isExpanded = expandedSections.includes(section.label);
                
                return (
                  <div key={section.label} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => toggleSection(section.label)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1.25rem',
                        background: isExpanded ? section.color + '10' : 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: section.color,
                        transition: 'background 0.2s',
                      }}
                    >
                      <span>{section.label}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          background: section.color + '20', 
                          color: section.color, 
                          padding: '2px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {sectionCats.length}
                        </span>
                        <span style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                          transition: 'transform 0.2s',
                          fontSize: '0.8rem'
                        }}>
                          ▼
                        </span>
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div style={{ 
                        padding: '0.75rem 1.25rem', 
                        background: '#fafafa',
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        {sectionCats.map(cat => (
                          <Link
                            key={cat.id}
                            href={'/groups?category=' + cat.slug}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'white',
                              borderRadius: '20px',
                              textDecoration: 'none',
                              color: '#333',
                              fontSize: '0.9rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              transition: 'box-shadow 0.2s, transform 0.2s',
                            }}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Uncategorized items */}
              {getUncategorized().length > 0 && (() => {
                const uncats = getUncategorized();
                const isExpanded = expandedSections.includes('__uncategorized__');
                return (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => toggleSection('__uncategorized__')}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1.25rem',
                        background: isExpanded ? '#6b728010' : 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span>📋 More Categories</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: '#6b728020', color: '#6b7280', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{uncats.length}</span>
                        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.8rem' }}>▼</span>
                      </span>
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '0.75rem 1.25rem', background: '#fafafa', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                        {uncats.map(cat => (
                          <Link key={cat.id} href={'/groups?category=' + cat.slug} style={{ padding: '0.5rem 1rem', background: 'white', borderRadius: '20px', textDecoration: 'none', color: '#333', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* Partners Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🤝 Community Partners</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {partners.map(partner => (
              <a 
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                {(partner as any).logoUrl ? (
                  <img src={(partner as any).logoUrl} alt={partner.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>{(partner as any).logo}</span>
                )}
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{partner.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{partner.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Resources Row */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <a href="https://www.chabad.org/parshah" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📖</div>
              <div style={{ fontWeight: 'bold' }}>Weekly Parsha</div>
            </div>
          </a>
          <a href="https://www.chabad.org/calendar/zmanim.htm" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🕐</div>
              <div style={{ fontWeight: 'bold' }}>Zmanim</div>
            </div>
          </a>
          <a href="https://www.chabad.org/dailystudy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: 'bold' }}>Daily Study</div>
            </div>
          </a>
          <Link href="/news" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📰</div>
              <div style={{ fontWeight: 'bold' }}>News</div>
            </div>
          </Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
