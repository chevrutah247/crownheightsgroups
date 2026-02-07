'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface RSSItem {
  title: string;
  link: string;
  date: string;
}

export default function CyberSafetyPage() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [news, setNews] = useState<RSSItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    // Fetch cyber security news
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/cyber-news');
        const data = await res.json();
        if (data.items) setNews(data.items);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/cyber-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setSubscribeStatus('success');
        setEmail('');
      } else {
        setSubscribeStatus('error');
      }
    } catch {
      setSubscribeStatus('error');
    }
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  };

  const stepStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '16px',
    marginBottom: '1rem'
  };

  const stepNumberStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: 'bold',
    flexShrink: 0
  };

  const buttonStyle = (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1.25rem 2rem',
    background: color,
    color: 'white',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', 
          borderRadius: '24px', 
          padding: '3rem 2rem', 
          textAlign: 'center',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛡️</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Cyber Safety Center
          </h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
            Простые шаги для защиты от мошенников
          </p>
        </div>

        <div className="cyber-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 350px)', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Content */}
          <div>
          
          {/* Mobile sidebar - shows at top on small screens */}
          <style>{`
            @media (max-width: 900px) {
              .cyber-grid { grid-template-columns: 1fr !important; }
              .cyber-sidebar { order: -1; }
            }
          `}</style>
            
            {/* SECTION 1: Check Email Leaks */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>📧</span>
                <div>
                  <h2 style={{ color: '#dc2626', margin: 0, fontSize: '2rem' }}>
                    Шаг 1: Проверьте утечки email
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Узнайте, не попал ли ваш email к мошенникам
                  </p>
                </div>
              </div>
              
              <div style={{ 
                background: '#fef2f2', 
                border: '2px solid #fecaca', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b', lineHeight: '1.6' }}>
                  ⚠️ <strong>Важно!</strong> Хакеры регулярно взламывают сайты и крадут email адреса с паролями. 
                  Если ваш email есть в базе утечек — <strong>срочно меняйте пароль!</strong>
                </p>
              </div>

              <div style={stepStyle}>
                <div style={stepNumberStyle}>1</div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#1e3a5f' }}>
                    Откройте сайт проверки
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Нажмите зелёную кнопку ниже. Откроется сайт <strong>HaveIBeenPwned</strong> — 
                    это надёжный сервис от известного эксперта по безопасности.
                  </p>
                </div>
              </div>

              <div style={stepStyle}>
                <div style={stepNumberStyle}>2</div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#1e3a5f' }}>
                    Введите свой email
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    В поле на сайте введите свой email адрес и нажмите кнопку <strong>"pwned?"</strong>
                  </p>
                </div>
              </div>

              <div style={stepStyle}>
                <div style={stepNumberStyle}>3</div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#1e3a5f' }}>
                    Посмотрите результат
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    🟢 <strong>Зелёный фон</strong> = Ваш email не найден в утечках. Отлично!<br/>
                    🔴 <strong>Красный фон</strong> = Ваш email был украден! <strong>Срочно меняйте пароль!</strong>
                  </p>
                </div>
              </div>

              <a 
                href="https://haveibeenpwned.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={buttonStyle('linear-gradient(135deg, #059669, #047857)')}
              >
                📧 Проверить мой Email
              </a>
            </div>

            {/* SECTION 2: Change Password */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>🔑</span>
                <div>
                  <h2 style={{ color: '#f59e0b', margin: 0, fontSize: '2rem' }}>
                    Шаг 2: Смените пароль
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Если email был в утечке — немедленно меняйте пароль!
                  </p>
                </div>
              </div>
              
              <div style={{ 
                background: '#fef3c7', 
                border: '2px solid #fcd34d', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '1.3rem' }}>
                  💡 Как создать надёжный пароль:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', fontSize: '1.15rem', lineHeight: '2' }}>
                  <li>Минимум <strong>12 символов</strong></li>
                  <li>Используйте <strong>БОЛЬШИЕ</strong> и <strong>маленькие</strong> буквы</li>
                  <li>Добавьте <strong>цифры</strong> (например: 7, 42, 2024)</li>
                  <li>Добавьте <strong>символы</strong> (например: !, @, #, $)</li>
                  <li>❌ НЕ используйте имена, даты рождения, "123456"</li>
                </ul>
              </div>

              <div style={{ 
                background: '#f0fdf4', 
                border: '2px solid #86efac', 
                borderRadius: '16px', 
                padding: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 0.75rem 0', color: '#166534', fontSize: '1.3rem' }}>
                  ✅ Пример хорошего пароля:
                </h3>
                <code style={{ 
                  display: 'block',
                  background: '#dcfce7', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  fontSize: '1.5rem',
                  fontFamily: 'monospace',
                  color: '#15803d',
                  letterSpacing: '2px'
                }}>
                  Shabbat$Shalom2024!
                </code>
                <p style={{ margin: '0.75rem 0 0 0', color: '#166534', fontSize: '1rem' }}>
                  Этот пароль содержит 19 символов, большие и маленькие буквы, цифры и символы.
                </p>
              </div>
            </div>

            {/* SECTION 3: Scan Computer */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>🖥️</span>
                <div>
                  <h2 style={{ color: '#3b82f6', margin: 0, fontSize: '2rem' }}>
                    Шаг 3: Проверьте компьютер на вирусы
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Запустите проверку встроенными и бесплатными инструментами
                  </p>
                </div>
              </div>

              {/* Windows MRT */}
              <div style={{ 
                background: '#eff6ff', 
                border: '2px solid #93c5fd', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1d4ed8', fontSize: '1.5rem' }}>
                  🛠️ Способ 1: Встроенная утилита Windows (MRT)
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  В каждом Windows уже есть <strong>бесплатный инструмент</strong> для удаления вирусов. 
                  Microsoft обновляет его каждый месяц.
                </p>
                
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e3a5f', fontSize: '1.2rem' }}>
                    📋 Инструкция:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>1</span>
                      <span>Нажмите клавиши <strong style={{ background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' }}>Win + R</strong> одновременно</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>2</span>
                      <span>Введите <code style={{ background: '#1e3a5f', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '1.25rem' }}>mrt</code> и нажмите Enter</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>3</span>
                      <span>Выберите <strong>"Full scan"</strong> (Полная проверка)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>4</span>
                      <span>Дождитесь окончания проверки (20-60 минут)</span>
                    </div>
                  </div>
                </div>
                
                <p style={{ margin: '1rem 0 0 0', color: '#059669', fontSize: '1.1rem', fontWeight: '500' }}>
                  ⏰ Рекомендуем запускать раз в месяц!
                </p>
              </div>

              {/* Dr.Web CureIt */}
              <div style={{ 
                background: '#f0fdf4', 
                border: '2px solid #86efac', 
                borderRadius: '16px', 
                padding: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#166534', fontSize: '1.5rem' }}>
                  🩺 Способ 2: Dr.Web CureIt! (бесплатно)
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  <strong>Бесплатный антивирусный сканер</strong> от известной компании Dr.Web. 
                  Не требует установки — просто скачайте и запустите.
                </p>
                
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e3a5f', fontSize: '1.1rem' }}>
                    ✅ Преимущества:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    <li>Не нужно устанавливать</li>
                    <li>Работает вместе с вашим обычным антивирусом</li>
                    <li>Находит вирусы, которые другие пропускают</li>
                    <li>Полностью бесплатно для дома</li>
                  </ul>
                </div>

                <a 
                  href="https://free.drweb.com/download+cureit+free/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={buttonStyle('linear-gradient(135deg, #22c55e, #16a34a)')}
                >
                  ⬇️ Скачать Dr.Web CureIt!
                </a>
              </div>
            </div>

            {/* SECTION 4: Check Links */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>🔗</span>
                <div>
                  <h2 style={{ color: '#7c3aed', margin: 0, fontSize: '2rem' }}>
                    Шаг 4: Проверяйте подозрительные ссылки
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Прежде чем кликнуть — проверьте!
                  </p>
                </div>
              </div>

              <div style={{ 
                background: '#faf5ff', 
                border: '2px solid #c4b5fd', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: '0 0 1rem 0', color: '#5b21b6', fontSize: '1.2rem', lineHeight: '1.6' }}>
                  🚨 <strong>Мошенники часто отправляют опасные ссылки</strong> через WhatsApp, email, SMS. 
                  Перед тем как кликнуть — проверьте ссылку на VirusTotal!
                </p>
                
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e3a5f', fontSize: '1.2rem' }}>
                    📋 Как проверить ссылку:
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#666', fontSize: '1.1rem', lineHeight: '2' }}>
                    <li><strong>Скопируйте</strong> подозрительную ссылку (не кликайте!)</li>
                    <li>Откройте <strong>VirusTotal.com</strong></li>
                    <li>Вставьте ссылку и нажмите <strong>Search</strong></li>
                    <li>Если есть ❌ красные отметки — <strong>не открывайте!</strong></li>
                  </ol>
                </div>
              </div>

              <a 
                href="https://www.virustotal.com/gui/home/url" 
                target="_blank" 
                rel="noopener noreferrer"
                style={buttonStyle('linear-gradient(135deg, #7c3aed, #5b21b6)')}
              >
                🔍 Проверить ссылку на VirusTotal
              </a>
            </div>

            {/* SECTION 5: Stop Spam Calls */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>📵</span>
                <div>
                  <h2 style={{ color: '#0891b2', margin: 0, fontSize: '2rem' }}>
                    Бонус: Уменьшите спам-звонки
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Зарегистрируйте номер в списке "Do Not Call"
                  </p>
                </div>
              </div>

              <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '1.15rem', lineHeight: '1.6' }}>
                Зарегистрируйте ваш телефон на официальном сайте <strong>Do Not Call Registry</strong>. 
                Это <strong>бесплатно</strong> и уменьшит количество маркетинговых звонков. 
                Регистрация действует навсегда.
              </p>

              <a 
                href="https://www.donotcall.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={buttonStyle('linear-gradient(135deg, #0891b2, #0e7490)')}
              >
                📵 Зарегистрироваться на DoNotCall.gov
              </a>
            </div>

          </div>

          {/* Sidebar */}
          <div className="cyber-sidebar">
            
            {/* Subscribe to Reminders */}
            <div style={{ 
              ...sectionStyle, 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '3px solid #f59e0b',
              position: 'sticky',
              top: '1rem'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '3rem' }}>🔔</span>
                <h3 style={{ color: '#92400e', margin: '0.5rem 0', fontSize: '1.4rem' }}>
                  Напоминания о проверке
                </h3>
                <p style={{ color: '#78350f', margin: 0, fontSize: '1rem' }}>
                  Получайте email раз в месяц с напоминанием проверить безопасность
                </p>
              </div>

              {subscribeStatus === 'success' ? (
                <div style={{ 
                  background: '#dcfce7', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  textAlign: 'center' 
                }}>
                  <span style={{ fontSize: '3rem' }}>✅</span>
                  <p style={{ color: '#166534', fontSize: '1.1rem', margin: '0.5rem 0 0 0', fontWeight: '500' }}>
                    Вы подписаны! Первое письмо придёт через 30 дней.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ваш email..."
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      border: '2px solid #fcd34d',
                      marginBottom: '0.75rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={subscribeStatus === 'loading'}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: subscribeStatus === 'loading' ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: subscribeStatus === 'loading' ? 'wait' : 'pointer'
                    }}
                  >
                    {subscribeStatus === 'loading' ? '⏳ Подписка...' : '🔔 Подписаться'}
                  </button>
                  {subscribeStatus === 'error' && (
                    <p style={{ color: '#dc2626', fontSize: '0.95rem', margin: '0.5rem 0 0 0', textAlign: 'center' }}>
                      Ошибка. Попробуйте ещё раз.
                    </p>
                  )}
                </form>
              )}

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f' }}>
                  📧 Каждые 30 дней вы получите письмо с напоминанием:
                </p>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#92400e' }}>
                  <li>Проверить email на утечки</li>
                  <li>Сменить пароль если нужно</li>
                  <li>Запустить проверку на вирусы</li>
                </ul>
              </div>
            </div>

            {/* Cyber News */}
            <div style={sectionStyle}>
              <h3 style={{ color: '#1e3a5f', margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
                🚨 FBI Scam Alerts
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Последние предупреждения о мошенничестве от IC3 (Internet Crime Complaint Center)
              </p>
              
              {newsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  ⏳ Загрузка новостей...
                </div>
              ) : news.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {news.slice(0, 6).map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '0.75rem',
                        background: '#fef2f2',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        borderLeft: '4px solid #dc2626',
                        transition: 'transform 0.2s'
                      }}
                    >
                      <div style={{ color: '#1e3a5f', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {(item as any).category || 'FBI'}
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          {item.date}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                  Новости временно недоступны
                </p>
              )}

              <a 
                href="https://www.ic3.gov/PSA" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.95rem'
                }}
              >
                🚨 Все предупреждения IC3
              </a>
              
              <a 
                href="https://www.ic3.gov/CrimeInfo/ElderFraud" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.95rem'
                }}
              >
                👴 О мошенничестве против пожилых
              </a>
            </div>

            {/* Quick Links */}
            <div style={sectionStyle}>
              <h3 style={{ color: '#1e3a5f', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                🔗 Быстрые ссылки
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#dc2626', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  📧 Проверить email утечки
                </a>
                <a href="https://www.virustotal.com/gui/home/upload" target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  🔍 Проверить файл
                </a>
                <a href="https://www.virustotal.com/gui/home/url" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  🔗 Проверить ссылку
                </a>
                <a href="https://free.drweb.com/download+cureit+free/" target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  🩺 Dr.Web CureIt!
                </a>
                <a href="https://www.donotcall.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#0891b2', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  📵 Do Not Call Registry
                </a>
                <a href="https://www.ic3.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f', fontSize: '1rem', padding: '0.5rem 0', textDecoration: 'none' }}>
                  🏛️ IC3 - Сообщить о мошенничестве
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}
