'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import ShareButtons from '@/components/ShareButtons';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface ClickLimitState { remaining: number; clickedToday: string[]; }
interface Category { id: string; name: string; icon: string; slug: string; order?: number; }
interface Location { id: string; neighborhood: string; status: string; order?: number; }
interface Group { 
  id: string; title: string; description: string; categoryId: string; locationId: string; 
  language: string; status: string; clicksCount: number; isPinned?: boolean; tags?: string[]; imageUrl?: string;
  whatsappLinks?: string[]; whatsappLink?: string;
  telegramLink?: string; facebookLink?: string; twitterLink?: string; websiteLink?: string;
}

const AVAILABLE_TAGS = [
  { id: 'free-food', label: 'Free Food', icon: '🍕', color: '#dc2626' },
  { id: 'free-clothes', label: 'Free Clothes', icon: '👕', color: '#7c3aed' },
  { id: 'free-furniture', label: 'Free Furniture', icon: '🛋️', color: '#ea580c' },
  { id: 'free-stuff', label: 'Free Stuff', icon: '🆓', color: '#0891b2' },
  { id: 'jobs', label: 'Jobs', icon: '💼', color: '#2563eb' },
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#16a34a' },
  { id: 'ladies-only', label: 'Ladies Only', icon: '👩', color: '#ec4899' },
  { id: 'mens-only', label: 'Mens Only', icon: '👨', color: '#3b82f6' },
  { id: 'hebrew', label: 'Hebrew', icon: '🇮🇱', color: '#1d4ed8' },
  { id: 'yiddish', label: 'Yiddish', icon: '📜', color: '#854d0e' },
  { id: 'chesed', label: 'Chesed', icon: '💝', color: '#be185d' },
  { id: 'rides', label: 'Rides', icon: '🚗', color: '#4f46e5' },
  { id: 'kids', label: 'Kids', icon: '👶', color: '#f59e0b' },
  { id: 'seniors', label: 'Seniors', icon: '👴', color: '#6b7280' },
  { id: 'no-ads', label: 'No Ads', icon: '🚫', color: '#64748b' },
];

// Ad blocks to show between groups
const AD_BLOCKS = [
  {
    id: 'chevrutah-kids',
    title: 'Chevrutah KIDS',
    description: 'Weekly Torah newspaper for children. Subscribe for free delivery!',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
    icon: '📰',
    cta: 'Subscribe Free',
    link: 'https://shabbathub-v2.vercel.app/subscribe?pub=ea002e48-90d7-4e8b-9551-e63784cf4b88&lang=en',
    external: true,
  },
  {
    id: 'nyscreens',
    title: 'NY Screens',
    description: 'Digital advertising on screens in Crown Heights, Boro Park, Williamsburg',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    icon: '📺',
    cta: 'Contact for Advertising',
    link: 'https://www.nyscreens.com/',
    external: true,
  },
  {
    id: 'retail-digitals',
    title: 'Retail Digitals',
    description: 'ESL - Electronic Shelf Label System for retail stores',
    gradient: 'linear-gradient(135deg, #0f4c75 0%, #3282b8 100%)',
    icon: '🏷️',
    cta: 'Learn More',
    link: 'https://retaildigitals.com/',
    external: true,
  },
  {
    id: 'shower-door',
    title: 'Crown Heights Shower Door',
    description: 'Custom glass shower doors, mirrors, window repair. Quality craftsmanship.',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🚿',
    cta: 'Get a Quote',
    link: 'https://nyglassdoors.com',
    external: true,
  },
  {
    id: 'shabbathub',
    title: 'ShabbatHub',
    description: 'Largest archive of Shabbat materials. Newspapers, articles, educational content.',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    icon: '📚',
    cta: 'Browse Materials',
    link: 'https://shabbathub-v2.vercel.app/',
    external: true,
  },
  {
    id: 'education-on-the-go',
    title: 'Education on the Go',
    description: 'Jewish educational programs and resources. Learn anytime, anywhere.',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    icon: '🎓',
    cta: 'Start Learning',
    link: 'https://edonthego.org',
    external: true,
  },
  {
    id: 'weekly-updates',
    title: 'Get Weekly Updates',
    description: 'New groups, services, and community news delivered to your inbox every Sunday.',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    icon: '📧',
    cta: 'Subscribe',
    link: '#subscribe',
    external: false,
    isSubscribe: true,
  },
];

// Newsletter subscription component
function NewsletterBlock({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <div 
      style={{
        gridColumn: '1 / -1',
        background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap',
        boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem', background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '16px' }}>📧</div>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.25rem' }}>Get Weekly Updates</h3>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>New groups, services & community news every Sunday</p>
        </div>
      </div>
      <button
        onClick={onSubscribe}
        style={{
          background: 'white',
          color: '#ea580c',
          padding: '0.875rem 2rem',
          borderRadius: '50px',
          fontWeight: '700',
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Subscribe Free →
      </button>
    </div>
  );
}

// Ad block component
function AdBlock({ ad, onSubscribeClick }: { ad: typeof AD_BLOCKS[0]; onSubscribeClick?: () => void }) {
  if (ad.isSubscribe) {
    return <NewsletterBlock onSubscribe={onSubscribeClick || (() => {})} />;
  }
  
  return (
    <a
      href={ad.link}
      target={ad.external ? "_blank" : "_self"}
      rel={ad.external ? "noopener noreferrer" : undefined}
      style={{
        gridColumn: '1 / -1',
        background: ad.gradient,
        borderRadius: '20px',
        padding: '1.5rem 2rem',
        color: 'white',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
      }}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '50px',
        width: '150px',
        height: '150px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        <div style={{ 
          fontSize: '2.5rem', 
          background: 'rgba(255,255,255,0.2)', 
          padding: '0.75rem', 
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>{ad.icon}</div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>{ad.title}</h3>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', maxWidth: '400px' }}>{ad.description}</p>
        </div>
      </div>
      <span style={{
        background: 'rgba(255,255,255,0.25)',
        padding: '0.75rem 1.5rem',
        borderRadius: '50px',
        fontWeight: '600',
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}>
        {ad.cta} →
      </span>
    </a>
  );
}

export default function GroupsClient() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [user, setUser] = useState<UserInfo | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'alpha'>('popular');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [clickLimit, setClickLimit] = useState<ClickLimitState>({ remaining: 3, clickedToday: [] });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) return;
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) {
          setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
          setSubscribeEmail(data.user.email);
          const limitRes = await fetch(`/api/group-clicks?userId=${encodeURIComponent(data.user.email)}`);
          const limitData = await limitRes.json();
          setClickLimit({ remaining: limitData.remaining ?? 3, clickedToday: limitData.clickedToday || [] });
        } else {
          localStorage.clear();
        }
      } catch (error) { /* ignore */ }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, catsRes, locsRes] = await Promise.all([
          fetch('/api/admin/groups'),
          fetch('/api/admin/group-categories'),
          fetch('/api/admin/locations')
        ]);
        const [groupsData, catsData, locsData] = await Promise.all([groupsRes.json(), catsRes.json(), locsRes.json()]);
        if (Array.isArray(groupsData)) setAllGroups(groupsData.filter((g: Group) => g.status === 'approved'));
        if (Array.isArray(catsData)) {
          setCategories(catsData);
          if (categorySlug) {
            const cat = catsData.find((c: Category) => c.slug === categorySlug);
            if (cat) setSelectedCategory(cat.id);
          }
        }
        if (Array.isArray(locsData)) setLocations(locsData.filter((l: Location) => l.status === 'approved'));
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [categorySlug]);

  useEffect(() => {
    let result = [...allGroups];
    if (selectedLocation) result = result.filter(g => g.locationId === selectedLocation);
    if (selectedCategory) result = result.filter(g => g.categoryId === selectedCategory);
    if (selectedTags.length > 0) result = result.filter(g => g.tags && selectedTags.some(t => g.tags!.includes(t)));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const words = q.split(/\s+/);
      result = result.filter(g => {
        const title = g.title.toLowerCase();
        const cat = categories.find(c => c.id === g.categoryId);
        const catName = cat?.name?.toLowerCase() || '';
        return words.every(word => title.includes(word) || catName.includes(word));
      });
    }
    const pinned = result.filter(g => g.isPinned).sort((a, b) => ((a as any).pinnedOrder || 0) - ((b as any).pinnedOrder || 0));
    const regular = result.filter(g => !g.isPinned);
    if (sortBy === 'popular') regular.sort((a, b) => b.clicksCount - a.clicksCount);
    else if (sortBy === 'date') regular.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
    else regular.sort((a, b) => a.title.localeCompare(b.title));
    setFilteredGroups([...pinned, ...regular]);
  }, [allGroups, categories, selectedLocation, selectedCategory, searchQuery, sortBy, selectedTags]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const handleSubscribe = async () => {
    if (!subscribeEmail) return;
    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: subscribeEmail, 
          name: user?.name || '',
          frequency: 'weekly'
        })
      });
      if (res.ok) {
        setSubscribeStatus('success');
        setTimeout(() => {
          setShowSubscribeModal(false);
          setSubscribeStatus('idle');
        }, 2000);
      } else {
        setSubscribeStatus('error');
      }
    } catch {
      setSubscribeStatus('error');
    }
  };

  const handleGroupClick = async (e: React.MouseEvent, link: string, groupId: string, groupTitle: string) => {
    e.preventDefault();

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (user.role === 'admin') {
      window.open(link, '_blank');
      return;
    }

    if (clickLimit.clickedToday.includes(groupId)) {
      window.open(link, '_blank');
      return;
    }

    if (clickLimit.remaining <= 0) {
      setShowLimitModal(true);
      return;
    }

    try {
      const res = await fetch('/api/group-clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.email, groupId, groupTitle })
      });
      const data = await res.json();

      if (data.allowed) {
        setClickLimit(prev => ({
          remaining: data.remaining,
          clickedToday: [...prev.clickedToday, groupId]
        }));
        window.open(link, '_blank');
      } else {
        setShowLimitModal(true);
      }
    } catch (error) {
      window.open(link, '_blank');
    }
  };
  
  const getWhatsAppLinks = (group: Group): string[] => {
    const links: string[] = [];
    if (group.whatsappLinks && Array.isArray(group.whatsappLinks)) {
      group.whatsappLinks.forEach(l => { if (l && typeof l === 'string') links.push(l); });
    } else if (group.whatsappLink && typeof group.whatsappLink === 'string') {
      links.push(group.whatsappLink);
    }
    return links;
  };

  const getCat = (id: string) => categories.find(c => c.id === id);
  const getLoc = (id: string) => locations.find(l => l.id === id);
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return null;
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.icon + ' ' + cat.name : null;
  };

  // Helper to insert ad blocks every N groups
  const getGroupsWithAds = () => {
    const result: (Group | { isAd: true; ad: typeof AD_BLOCKS[0] })[] = [];
    const GROUPS_PER_AD = 8; // Show ad every 8 groups (2 rows of 4, or flexible)
    let adIndex = 0;
    
    filteredGroups.forEach((group, index) => {
      result.push(group);
      
      // After every GROUPS_PER_AD groups, insert an ad
      if ((index + 1) % GROUPS_PER_AD === 0 && adIndex < AD_BLOCKS.length) {
        result.push({ isAd: true, ad: AD_BLOCKS[adIndex] });
        adIndex++;
      }
    });
    
    return result;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'white', fontSize: '1.1rem' }}>Loading groups...</p>
      </div>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const groupsWithAds = getGroupsWithAds();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Page Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          color: 'white',
          boxShadow: '0 20px 60px rgba(30, 58, 95, 0.3)'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {getSelectedCategoryName() || '👥 Community Groups'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Find and join community groups in Crown Heights</p>
        </div>

        {/* Kallah Banner */}
        <Link href="/kallah" style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem', 
          padding: '1.25rem', 
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)', 
          borderRadius: '16px', 
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(236, 72, 153, 0.15)',
          transition: 'transform 0.2s'
        }}>
          <span style={{ fontSize: '2rem' }}>💍</span>
          <div>
            <span style={{ color: '#831843', fontWeight: '700', fontSize: '1.1rem' }}>Hachnasat Kallah | הכנסת כלה</span>
            <span style={{ marginLeft: '0.5rem', color: '#9d174d', fontSize: '0.9rem' }}>→ Help for Brides</span>
          </div>
        </Link>

        {/* JewishJobs Banner */}
        {((selectedCategory && categories.find(c => c.id === selectedCategory)?.slug === 'jobs') || selectedTags.includes('jobs')) && (
          <a href="https://www.jewishjobs.com/" target="_blank" rel="noopener noreferrer" style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem', 
            padding: '1.25rem', 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
            borderRadius: '16px', 
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.15)'
          }}>
            <span style={{ fontSize: '2rem' }}>💼</span>
            <div>
              <span style={{ color: '#1e40af', fontWeight: '700', fontSize: '1.1rem' }}>JewishJobs.com</span>
              <span style={{ marginLeft: '0.5rem', color: '#1d4ed8', fontSize: '0.9rem' }}>→ Find Jewish Job Opportunities</span>
            </div>
          </a>
        )}

        {/* Click Limit Banner - only for logged-in non-admin users */}
        {user && user.role !== 'admin' && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            background: clickLimit.remaining > 0 ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>{clickLimit.remaining > 0 ? '✅' : '⏰'}</span>
            <span style={{ color: clickLimit.remaining > 0 ? '#166534' : '#991b1b', fontSize: '0.95rem', fontWeight: '500' }}>
              {clickLimit.remaining > 0
                ? `You can join ${clickLimit.remaining} more group${clickLimit.remaining !== 1 ? 's' : ''} today`
                : 'Daily limit reached. Come back tomorrow!'}
            </span>
          </div>
        )}
        {/* Login prompt banner for unauthenticated users */}
        {!user && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid #bfdbfe'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <span style={{ color: '#1e40af', fontSize: '0.95rem', fontWeight: '500', flex: 1 }}>
              Log in to join WhatsApp groups
            </span>
            <Link href="/auth/login" style={{
              padding: '0.5rem 1.25rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              whiteSpace: 'nowrap'
            }}>
              Log In
            </Link>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="🔍 Search by group name or category..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '1.1rem 1.25rem', 
                borderRadius: '14px', 
                border: '2px solid #e5e7eb', 
                fontSize: '1rem', 
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                background: 'white'
              }} 
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {searchQuery && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>Searching for "{searchQuery}"</div>}
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '1.5rem', 
          alignItems: 'flex-start',
          background: 'white',
          padding: '1.25rem',
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          
          {/* Location Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>📍 Location</label>
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '0.95rem', cursor: 'pointer', background: 'white' }}
            >
              <option value=''>All Locations</option>
              {[...locations].sort((a, b) => (a.order || 0) - (b.order || 0)).map(loc => (
                <option key={loc.id} value={loc.id}>{loc.neighborhood}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div style={{ minWidth: '200px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>📁 Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '0.95rem', cursor: 'pointer', background: 'white' }}
            >
              <option value=''>All Categories</option>
              {[...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Tags */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>🏷️ Quick Filters</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {AVAILABLE_TAGS.slice(0, 6).map(tag => (
                <button 
                  key={tag.id} 
                  onClick={() => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id])} 
                  style={{ 
                    padding: '0.4rem 0.85rem', 
                    borderRadius: '20px', 
                    border: 'none', 
                    background: selectedTags.includes(tag.id) ? tag.color : '#f1f5f9', 
                    color: selectedTags.includes(tag.id) ? 'white' : '#64748b', 
                    cursor: 'pointer', 
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {tag.icon} {tag.label}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button 
                  onClick={() => setSelectedTags([])} 
                  style={{ padding: '0.4rem 0.85rem', borderRadius: '20px', border: '1px dashed #cbd5e1', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters & Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#1e3a5f', fontWeight: '600', fontSize: '1rem' }}>{filteredGroups.length} groups</span>
            {(selectedLocation || selectedCategory || selectedTags.length > 0) && (
              <button 
                onClick={() => { setSelectedLocation(''); setSelectedCategory(''); setSelectedTags([]); }} 
                style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
              >
                Clear all
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', background: 'white', padding: '0.35rem', borderRadius: '10px' }}>
            {[{k: 'popular', l: '🔥 Popular'}, {k: 'date', l: '🕐 New'}, {k: 'alpha', l: '🔤 A-Z'}].map(s => (
              <button 
                key={s.k} 
                onClick={() => setSortBy(s.k as any)} 
                style={{ 
                  padding: '0.5rem 0.85rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: sortBy === s.k ? '#2563eb' : 'transparent', 
                  color: sortBy === s.k ? 'white' : '#666', 
                  cursor: 'pointer', 
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid with Ads */}
        {filteredGroups.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {groupsWithAds.map((item, index) => {
              // Check if it's an ad
              if ('isAd' in item && item.isAd) {
                return (
                  <AdBlock 
                    key={`ad-${item.ad.id}`} 
                    ad={item.ad} 
                    onSubscribeClick={() => setShowSubscribeModal(true)}
                  />
                );
              }
              
              // It's a group
              const group = item as Group;
              const cat = getCat(group.categoryId);
              const loc = getLoc(group.locationId);
              const waLinks = getWhatsAppLinks(group);
              const isJoined = clickLimit.clickedToday.includes(group.id);
              
              // Assign a color based on category for visual distinction
              const categoryColors: Record<string, string> = {
                'buy-sell': '#f59e0b',
                'jobs': '#2563eb',
                'free-stuff': '#10b981',
                'housing': '#8b5cf6',
                'food': '#ef4444',
                'chesed': '#ec4899',
                'torah': '#1e3a5f',
              };
              const catSlug = cat?.slug || '';
              const accentColor = categoryColors[catSlug] || '#6366f1';
              
              return (
                <div 
                  key={group.id || `group-${index}`} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                    border: group.isPinned ? '3px solid #f59e0b' : 'none',
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}
                >
                  {/* Colored top bar */}
                  <div style={{ 
                    height: '6px', 
                    background: group.isPinned ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : accentColor 
                  }} />
                  
                  {/* Content */}
                  <div style={{ padding: '1.5rem' }}>
                    {/* Featured badge */}
                    {group.isPinned && (
                      <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.75rem',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        color: '#92400e',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        borderRadius: '20px',
                        marginBottom: '0.75rem'
                      }}>
                        ⭐ Featured
                      </div>
                    )}
                    
                    {/* Image */}
                    {group.imageUrl && (
                      <img 
                        src={group.imageUrl} 
                        alt={group.title} 
                        style={{ 
                          width: '100%', 
                          height: '140px', 
                          objectFit: 'cover', 
                          borderRadius: '12px', 
                          marginBottom: '1rem' 
                        }} 
                      />
                    )}
                    
                    {/* Tags row */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '0.3rem 0.7rem', 
                        background: accentColor + '15', 
                        color: accentColor,
                        borderRadius: '8px', 
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {cat?.icon} {cat?.name}
                      </span>
                      {loc && (
                        <span style={{ 
                          padding: '0.3rem 0.7rem', 
                          background: '#f0fdf4', 
                          color: '#166534',
                          borderRadius: '8px', 
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          📍 {loc.neighborhood}
                        </span>
                      )}
                      {group.language && group.language !== 'English' && (
                        <span style={{ 
                          padding: '0.3rem 0.7rem', 
                          background: '#fef3c7', 
                          color: '#92400e',
                          borderRadius: '8px', 
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {group.language}
                        </span>
                      )}
                      {isJoined && (
                        <span style={{ 
                          padding: '0.3rem 0.7rem', 
                          background: '#dbeafe', 
                          color: '#1e40af',
                          borderRadius: '8px', 
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          ✓ Joined
                        </span>
                      )}
                    </div>
                    
                    {/* Custom tags */}
                    {group.tags && group.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {group.tags.map(tagId => { 
                          const tag = AVAILABLE_TAGS.find(t => t.id === tagId); 
                          return tag ? (
                            <span 
                              key={tagId} 
                              style={{ 
                                padding: '0.25rem 0.6rem', 
                                background: tag.color + '20', 
                                color: tag.color, 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                fontWeight: '600' 
                              }}
                            >
                              {tag.icon} {tag.label}
                            </span>
                          ) : null; 
                        })}
                      </div>
                    )}
                    
                    {/* Title */}
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: '700', color: '#1f2937' }}>
                      {group.title}
                    </h3>
                    
                    {/* Description */}
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.9rem', 
                      margin: '0 0 1rem 0', 
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {group.description}
                    </p>
                    
                    {/* Join buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      {waLinks.map((link, i) => (
                        <a 
                          key={i} 
                          href={link} 
                          onClick={(e) => handleGroupClick(e, link, group.id, group.title)} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            padding: '0.875rem', 
                            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
                            color: 'white', 
                            borderRadius: '12px', 
                            textDecoration: 'none', 
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                            cursor: 'pointer' 
                          }}
                        >
                          💬 WhatsApp{waLinks.length > 1 ? ` ${i + 1}` : ''}
                        </a>
                      ))}
                      {group.telegramLink && (
                        <a 
                          href={group.telegramLink} 
                          onClick={(e) => handleGroupClick(e, group.telegramLink!, group.id, group.title)} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            padding: '0.875rem', 
                            background: 'linear-gradient(135deg, #0088cc 0%, #006699 100%)', 
                            color: 'white', 
                            borderRadius: '12px', 
                            textDecoration: 'none', 
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 15px rgba(0, 136, 204, 0.3)',
                            cursor: 'pointer' 
                          }}
                        >
                          ✈️ Telegram
                        </a>
                      )}
                      {group.facebookLink && (
                        <a 
                          href={group.facebookLink} 
                          onClick={(e) => handleGroupClick(e, group.facebookLink!, group.id, group.title)} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            padding: '0.875rem', 
                            background: 'linear-gradient(135deg, #1877F2 0%, #0d5ebd 100%)', 
                            color: 'white', 
                            borderRadius: '12px', 
                            textDecoration: 'none', 
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: 'pointer' 
                          }}
                        >
                          📘 Facebook
                        </a>
                      )}
                      {group.websiteLink && (
                        <a 
                          href={group.websiteLink} 
                          onClick={(e) => handleGroupClick(e, group.websiteLink!, group.id, group.title)} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            padding: '0.875rem', 
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                            color: 'white', 
                            borderRadius: '12px', 
                            textDecoration: 'none', 
                            fontWeight: '700',
                            fontSize: '0.95rem',
                            cursor: 'pointer' 
                          }}
                        >
                          🌐 Website
                        </a>
                      )}
                    </div>
                    
                    {/* Share */}
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <ShareButtons 
                        title={group.title} 
                        description={group.description || ''} 
                        url={`https://crownheightsgroups.com/groups?search=${encodeURIComponent(group.title)}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white', 
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#374151', fontSize: '1.25rem', fontWeight: '600' }}>No groups found</h3>
            <p style={{ color: '#9ca3af' }}>Try adjusting your search or filters</p>
          </div>
        )}
      </main>
      
      {/* Login Required Modal */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '400px', margin: '1rem', textAlign: 'center', boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ marginBottom: '1rem', color: '#1e3a5f', fontSize: '1.5rem', fontWeight: '700' }}>Login Required</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              You need to <strong>log in</strong> to join WhatsApp groups. It only takes a moment!
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#f3f4f6',
                  color: '#666',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <Link
                href="/auth/login"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                }}
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '400px', margin: '1rem', textAlign: 'center', boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>
            <h3 style={{ marginBottom: '1rem', color: '#1e3a5f', fontSize: '1.5rem', fontWeight: '700' }}>Daily Limit Reached</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              You can join maximum <strong>3 new groups per day</strong>. This helps protect our community from spam.
            </p>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Come back tomorrow to join more groups!
            </p>
            <button
              onClick={() => setShowLimitModal(false)}
              style={{
                padding: '0.875rem 2.5rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
      
      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '450px', margin: '1rem', textAlign: 'center', boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}>
            {subscribeStatus === 'success' ? (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#16a34a', fontSize: '1.5rem', fontWeight: '700' }}>Subscribed!</h3>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>You'll receive weekly updates every Sunday.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
                <h3 style={{ marginBottom: '0.5rem', color: '#1e3a5f', fontSize: '1.5rem', fontWeight: '700' }}>Get Weekly Updates</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  New groups, services & community news delivered to your inbox every Sunday at 11 AM.
                </p>
                
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Your email"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setShowSubscribeModal(false)} 
                    style={{ 
                      flex: 1,
                      padding: '0.875rem', 
                      background: '#f3f4f6', 
                      color: '#666', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubscribe}
                    disabled={subscribeStatus === 'loading' || !subscribeEmail}
                    style={{ 
                      flex: 1,
                      padding: '0.875rem', 
                      background: subscribeStatus === 'loading' ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      cursor: subscribeStatus === 'loading' ? 'wait' : 'pointer', 
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                
                {subscribeStatus === 'error' && (
                  <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.9rem' }}>
                    Something went wrong. Please try again.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
