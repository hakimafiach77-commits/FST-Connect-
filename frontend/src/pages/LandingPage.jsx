import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const NEWS = [
  {
    id: 1,
    date: '12 MAI 2024',
    title: 'Soutenances des PFE - Master IA',
    body: 'Le planning détaillé des soutenances de fin d\'études pour la promotion 2024 du Master Intelligence Artificielle est désormais disponible sur l\'intranet.',
    link: 'Lire l\'avis →',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80',
  },
  {
    id: 2,
    date: '08 MAI 2024',
    title: 'Appel à candidature: Doctorat 2024',
    body: 'Le laboratoire LSI lance un appel à candidature pour 3 bourses de doctorat en machine learning appliqué à la santé. Dernier délai: 30 Juin.',
    link: 'En savoir plus →',
    img: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=400&q=80',
  },
  {
    id: 3,
    date: '02 MAI 2024',
    title: 'Nouveaux équipements Réseaux',
    body: 'Le département vient de s\'équiper de 15 nouveaux routeurs et commutateurs CISCO de dernière génération pour renforcer les TPs réseaux matériels.',
    link: 'Découvrir le labo →',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
  },
];

const EVENTS = [
  {
    id: 1,
    day: '24',
    month: 'MAI',
    title: 'Hackathon "Smart City Tanger"',
    location: 'FSTT, Amphi 1',
    time: '09:00 – 18:00',
    desc: 'Compétition de programmation de 24h axée sur les solutions urbaines intelligentes et IoT. Ouvert aux LST et MST.',
  },
  {
    id: 2,
    day: '05',
    month: 'JUIN',
    title: 'Séminaire: Cybersécurité, Défis actuels',
    location: 'FSTT, Salle de Conférences',
    time: '14:30',
    desc: 'Animé par Pr. El Haddaoui (Invité de l\'INSA Lyon). Les thématiques aborderont la cryptographie post-quantique.',
  },
  {
    id: 3,
    day: '18',
    month: 'JUIN',
    title: 'Journée d\'Orientation (LST & CI)',
    location: 'Campus FSTT',
    time: '10:00 – 16:00',
    desc: 'Présentation des nouvelles filières, rencontres directes avec les professeurs et témoignages des anciens lauréats.',
  },
];

const SHORTCUTS = [
  {
    label: 'Emplois du Temps',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    href: '/edt',
  },
  {
    label: 'Listes des Étudiants',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    href: '/etudiants',
  },
  {
    label: 'E-Learning (Moodle)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    href: 'https://moodle-fstt.uae.ac.ma/',
  },
  {
    label: 'Scolarité & Documents',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    href: 'https://edoc-fstt.uae.ac.ma/login',
  },
  {
    label: 'Clubs & Vie Étudiante',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
    href: '/clubs',
  },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const [activeNav, setActiveNav] = useState('accueil');
  const [marqueeText] = useState(
    'Les inscriptions pour le concours d\'accès au Cycle d\'Ingénieur LSI sont prolongées jusqu\'au 20 Juin.  •  Réunion pédagogique — Lundi 6 Mai à 10h, Salle de Conférence.  •  Résultats du Semestre 2 disponibles sur l\'espace étudiant.'
  );

  const scrollTo = (id, nav) => {
    setActiveNav(nav);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'Open Sans', Arial, sans-serif", color: '#333', margin: 0, padding: 0 }}>

      {/* ── Top contact bar ── */}
      <div style={{ background: '#1a3a6b', color: '#cdd8ea', fontSize: '.78rem', padding: '6px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span>
            <svg style={{ verticalAlign: 'middle', marginRight: 5 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            contact-info@fstt.ac.ma
          </span>
          <span>
            <svg style={{ verticalAlign: 'middle', marginRight: 5 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
            +212 5 39 39 39 53
          </span>
        </div>
        <a href="https://www.fstt.ac.ma" target="_blank" rel="noreferrer" style={{ color: '#e8a614', textDecoration: 'none', fontWeight: 600, fontSize: '.75rem' }}>
          Site Officiel FSTT
        </a>
      </div>

      {/* ── Main navbar ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e7f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0' }}>
          {/* FSTT logo badge */}
          <div style={{ background: '#1a3a6b', color: '#fff', fontWeight: 900, fontSize: '1rem', padding: '8px 12px', borderRadius: '4px', letterSpacing: 1 }}>FSTT</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#1a3a6b', letterSpacing: '.5px', textTransform: 'uppercase' }}>Faculté des Sciences et Techniques</div>
            <div style={{ fontSize: '.72rem', color: '#5a7a9e', fontWeight: 500 }}>Département Informatique</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'accueil', label: 'ACCUEIL', target: 'hero' },
            { id: 'departement', label: 'DÉPARTEMENT', target: 'departement' },
            { id: 'formations', label: 'FORMATIONS', target: 'formations' },
            { id: 'recherche', label: 'RECHERCHE', target: 'actualites' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.target, item.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '18px 14px', fontSize: '.78rem', fontWeight: 700,
                color: activeNav === item.id ? '#e8a614' : '#1a3a6b',
                borderBottom: activeNav === item.id ? '3px solid #e8a614' : '3px solid transparent',
                letterSpacing: '.5px', transition: 'all .2s'
              }}
            >
              {item.label}
            </button>
          ))}
          <Link
            to="/auth"
            style={{
              background: '#e8a614', color: '#fff', fontWeight: 700,
              fontSize: '.78rem', padding: '9px 20px', borderRadius: '4px',
              textDecoration: 'none', letterSpacing: '.5px', marginLeft: '8px',
              transition: 'background .2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#c98e0f'}
            onMouseOut={e => e.currentTarget.style.background = '#e8a614'}
          >
            ESPACE PRIVÉ
          </Link>
        </div>
      </nav>

      {/* ── Marquee announcements ── */}
      <div style={{ background: '#1a3a6b', color: '#e8eef8', fontSize: '.76rem', display: 'flex', overflow: 'hidden', alignItems: 'center' }}>
        <div style={{ background: '#e8a614', color: '#fff', fontWeight: 700, fontSize: '.72rem', padding: '7px 14px', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '.5px' }}>
          ANNONCES
        </div>
        <div style={{ overflow: 'hidden', position: 'relative', flex: 1 }}>
          <div style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            padding: '7px 20px',
            animation: 'marquee 35s linear infinite',
          }}>
            {marqueeText} &nbsp;&nbsp;&nbsp;&nbsp; {marqueeText}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .lp-shortcut-card:hover { box-shadow: 0 4px 18px rgba(26,58,107,.15); transform: translateY(-2px); }
        .lp-news-card:hover { box-shadow: 0 6px 24px rgba(26,58,107,.12); transform: translateY(-3px); }
        .lp-event-card:hover { background: #f0f5ff; }
      `}</style>

      {/* ── HERO ── */}
      <section id="hero" style={{ position: 'relative', minHeight: '400px', overflow: 'hidden' }}>
        {/* Background image (graduation ceremony) */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero_graduation.png)',
          backgroundSize: 'cover', backgroundPosition: 'center 30%',
          filter: 'brightness(.65)',
        }}/>
        {/* Dark gradient overlay for text contrast */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,24,55,.45) 0%, rgba(10,24,55,.3) 100%)', zIndex: 0 }}/>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', padding: '60px 24px 40px', textAlign: 'center' }}>
          <h1 style={{ color: '#e8a614', fontSize: '2.6rem', fontWeight: 800, margin: '0 0 16px', letterSpacing: '1px', textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>
            Département Informatique
          </h1>
          <p style={{ color: '#e8eef8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 0 32px', lineHeight: 1.7, textShadow: '0 1px 8px rgba(0,0,0,.55)' }}>
            L'excellence dans la formation des ingénieurs et chercheurs de demain en sciences de l'informatique, de l'intelligence artificielle et des réseaux.
          </p>
          <Link
            to="/auth"
            style={{ background: '#e8a614', color: '#fff', fontWeight: 700, fontSize: '.9rem', padding: '14px 36px', borderRadius: '4px', textDecoration: 'none', letterSpacing: '.5px', transition: 'background .2s' }}
            onMouseOver={e => e.currentTarget.style.background = '#c98e0f'}
            onMouseOut={e => e.currentTarget.style.background = '#e8a614'}
          >
            Accéder à la plateforme de gestion GDI
          </Link>
        </div>
      </section>

      {/* ── SERVICE SHORTCUTS ── */}
      <div style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #e0e7f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
          {SHORTCUTS.map((s, i) => {
            const isExternal = s.href.startsWith('http');
            const linkProps = {
              className: "lp-shortcut-card",
              style: {
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '22px 20px', gap: '10px', textDecoration: 'none',
                color: '#1a3a6b', flex: '1 1 150px', minWidth: 140,
                borderRight: i < SHORTCUTS.length - 1 ? '1px solid #e8eef8' : 'none',
                transition: 'all .2s', cursor: 'pointer',
              }
            };
            
            return isExternal ? (
              <a key={i} href={s.href} target="_blank" rel="noreferrer" {...linkProps}>
                {s.icon}
                <span style={{ fontSize: '.78rem', fontWeight: 600, textAlign: 'center', color: '#1a3a6b' }}>{s.label}</span>
              </a>
            ) : (
              <Link key={i} to={s.href} {...linkProps}>
                {s.icon}
                <span style={{ fontSize: '.78rem', fontWeight: 600, textAlign: 'center', color: '#1a3a6b' }}>{s.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── MOT DU CHEF DE DÉPARTEMENT ── */}
      <section id="departement" style={{ background: '#f7f9fc', padding: '64px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#1a3a6b', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Mot du Chef de Département
          </h2>
          <div style={{ width: '60px', height: '3px', background: '#e8a614', margin: '0 auto 40px' }}/>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '32px 36px', boxShadow: '0 2px 12px rgba(26,58,107,.08)', border: '1px solid #e0e8f5', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
            {/* Avatar placeholder */}
            <div style={{ flexShrink: 0, width: 90, height: 90, borderRadius: '50%', border: '3px solid #e8a614', background: '#e8eef8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h3 style={{ color: '#1a3a6b', fontWeight: 700, marginBottom: '12px', fontSize: '1rem' }}>Bienvenue au Département Informatique</h3>
              <p style={{ color: '#555', lineHeight: 1.8, fontSize: '.9rem' }}>
                Le département Informatique de la FST de Tanger offre des formations de grande qualité et très diversifiées, en Licence, Master et Cycle d'Ingénieur. Notre mission est de former des profils adaptés aux exigences du développement technologique et socio-économique en constante évolution…
              </p>
              <a href="#" style={{ color: '#e8a614', fontWeight: 600, fontSize: '.85rem', textDecoration: 'none' }}>Lire la suite →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#1a3a6b', padding: '36px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '24px' }}>
          {[
            { val: '800+', label: 'Étudiants inscrits' },
            { val: '45',   label: 'Enseignants' },
            { val: '6',    label: 'Filières actives' },
            { val: '32',   label: 'Projets de recherche' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', flex: '1 1 150px' }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#e8a614' }}>{s.val}</div>
              <div style={{ fontSize: '.78rem', color: '#a8c0dd', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FORMATIONS ── */}
      <section id="formations" style={{ background: '#f7f9fc', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#1a3a6b', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Notre Offre de Formation
          </h2>
          <div style={{ width: '60px', height: '3px', background: '#e8a614', margin: '0 auto 48px' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Licence (LST)', desc: 'Génie Informatique. Une formation solide en bases de données, développement professionnel et systèmes d\'information.' },
              { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Master (MST)', desc: 'Intelligence Artificielle & Génie Logiciel. Expertise de pointe pour faire face aux nouveaux métiers du numérique.' },
              { icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', title: 'Cycle d\'Ingénieur', desc: 'Logiciels et Systèmes Intelligents. Intégrez un cycle d\'ingénieur d\'état pour devenir un professionnel de haut vol.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e0e8f5', borderRadius: '8px', padding: '32px 24px', textAlign: 'center', borderBottom: '3px solid #e8a614', boxShadow: '0 2px 10px rgba(26,58,107,.06)' }}>
                <svg style={{ marginBottom: '16px' }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a3a6b" strokeWidth="1.6">
                  <path d={f.icon}/>
                </svg>
                <h3 style={{ color: '#1a3a6b', fontWeight: 700, margin: '0 0 12px', fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ color: '#666', fontSize: '.85rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTUALITÉS ET ÉVÈNEMENTS (COMBINED) ── */}
      <section id="actualites" style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#1a3a6b', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Actualités &amp; Évènements
          </h2>
          <div style={{ width: '60px', height: '3px', background: '#e8a614', margin: '0 auto 48px' }}/>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            {/* Left: Actualités (News) */}
            <div style={{ flex: '2 1 500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: '#1a3a6b', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Dernières Actualités</h3>
                <a href="#" style={{ color: '#e8a614', fontWeight: 600, fontSize: '.85rem', textDecoration: 'none' }}>Tout voir →</a>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {NEWS.map(n => (
                  <div key={n.id} className="lp-news-card" style={{ border: '1px solid #e0e8f5', borderRadius: '8px', overflow: 'hidden', background: '#fff', transition: 'all .25s', boxShadow: '0 2px 8px rgba(26,58,107,.05)', display: 'flex', flexDirection: 'column' }}>
                    <img src={n.img} alt={n.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: '#888', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.5px', marginBottom: '8px' }}>{n.date}</div>
                      <h4 style={{ color: '#1a3a6b', fontWeight: 700, margin: '0 0 8px', fontSize: '.95rem' }}>{n.title}</h4>
                      <p style={{ color: '#666', fontSize: '.83rem', lineHeight: 1.6, margin: '0 0 14px', flex: 1 }}>{n.body}</p>
                      <a href="#" style={{ color: '#e8a614', fontWeight: 600, fontSize: '.82rem', textDecoration: 'none', display: 'inline-block' }}>{n.link}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Évènements (Events) */}
            <div style={{ flex: '1 1 350px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: '#1a3a6b', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Agenda</h3>
                <a href="#" style={{ color: '#e8a614', fontWeight: 600, fontSize: '.85rem', textDecoration: 'none' }}>Calendrier →</a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {EVENTS.map(ev => (
                  <div key={ev.id} className="lp-event-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#fcfdfd', border: '1px solid #e0e8f5', borderLeft: '4px solid #e8a614', borderRadius: '8px', padding: '16px', transition: 'background .2s', boxShadow: '0 2px 6px rgba(26,58,107,.03)' }}>
                    <div style={{ flexShrink: 0, width: 56, textAlign: 'center', background: '#f0f5ff', border: '1px solid #d0ddf5', borderRadius: '6px', padding: '6px 4px' }}>
                      <div style={{ color: '#e8a614', fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }}>{ev.day}</div>
                      <div style={{ color: '#1a3a6b', fontSize: '.65rem', fontWeight: 700, letterSpacing: '1px' }}>{ev.month}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#1a3a6b', fontWeight: 700, margin: '0 0 6px', fontSize: '.9rem' }}>{ev.title}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px' }}>
                        <span style={{ color: '#5a7a9e', fontSize: '.75rem' }}>
                          <svg style={{ verticalAlign: 'middle', marginRight: 4, marginTop: '-2px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {ev.location}
                        </span>
                        <span style={{ color: '#5a7a9e', fontSize: '.75rem' }}>
                          <svg style={{ verticalAlign: 'middle', marginRight: 4, marginTop: '-2px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {ev.time}
                        </span>
                      </div>
                      <p style={{ color: '#666', fontSize: '.8rem', lineHeight: 1.5, margin: 0 }}>{ev.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIE ESTUDIANTINE & CAMPUS ── */}
      <section id="campus" style={{ background: '#f7f9fc', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#1a3a6b', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Vie Estudiantine &amp; Campus
          </h2>
          <div style={{ width: '60px', height: '3px', background: '#e8a614', margin: '0 auto 48px' }}/>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Video thumbnail */}
            <div style={{ flex: '0 0 420px', maxWidth: '100%', position: 'relative', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' }}>
              <img
                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=700&q=80"
                alt="Campus life"
                style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
              />
              {/* Play button overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.25)' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8a614', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(232,166,20,.5)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            </div>
            {/* Text */}
            <div style={{ flex: '1 1 280px' }}>
              <h3 style={{ color: '#1a3a6b', fontWeight: 700, fontSize: '1.1rem', marginBottom: '14px' }}>Un cadre de vie et d'études exceptionnel</h3>
              <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.8, marginBottom: '20px' }}>
                Le département Informatique est niché au cœur d'un campus universitaire moderne, disposant d'infrastructures sportives, de points de restauration, d'une grande bibliothèque et de nombreux espaces verts favorisant l'épanouissement des étudiants et chercheurs.
              </p>
              {[
                'Complexe Sportif (Football, Basket, Tennis, Athlétisme)',
                'Centre de Santé Universitaire et suivi psychologique',
                'Maison de l\'Étudiant & plus de 20 Associations Actives',
                'Espaces de coworking hybrides ouverts 24/7',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <svg style={{ flexShrink: 0, marginTop: '2px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8a614" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: '.85rem', color: '#444' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#1a3a6b', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Ce que Disent nos Lauréats
          </h2>
          <div style={{ width: '60px', height: '3px', background: '#e8a614', margin: '0 auto 48px' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
            {[
              { quote: '"La formation MST en Intelligence Artificielle à la FSTT m\'a donné des bases algorithmiques exceptionnelles. Travailler sur des projets réels m\'a propulsée."', name: 'Soumaya B.', role: 'Data Scientist, Promotion 2019', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80' },
              { quote: '"Le cycle d\'Ingénieur en Logiciels Intelligents est très complet. Le département informatique offre non seulement la technique, mais la maturité critique nécessaire au monde pro."', name: 'Karim E.', role: 'Software Engineer CI, Promotion 2021', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80' },
              { quote: '"J\'ai pu effectuer un semestre d\'échange grâce aux partenariats internationaux de la FSTT. La qualité de l\'enseignement au sein du département Info m\'a ouvert de nombreuses portes."', name: 'Amina T.', role: 'Consultante Cybersécurité, Prom 2020', img: 'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=80&q=80' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '10px', padding: '28px 24px' }}>
                <p style={{ color: '#dde8f5', fontSize: '.88rem', lineHeight: 1.8, marginBottom: '20px', fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={t.img} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8a614' }}/>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '.88rem' }}>{t.name}</div>
                    <div style={{ color: '#a8c0dd', fontSize: '.75rem' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSection />

      {/* ── PARTENAIRES ── */}
      <section style={{ background: '#f7f9fc', padding: '64px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#1a3a6b', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Nos Partenaires Industriels
          </h2>
          <div style={{ width: '60px', height: '3px', background: '#e8a614', margin: '0 auto 20px' }}/>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '.87rem', marginBottom: '40px' }}>
            Un réseau d'entreprises solides garantissant l'insertion socio-professionnelle de nos lauréats (PFE, stages, recrutements).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
            {['CAPGEMINI', 'CGI Group', 'ALTEN Info', 'ATOS SE', 'IBM Maroc', 'CISCO Academy', 'Microsoft', 'Oracle'].map(p => (
              <div key={p} style={{ background: '#fff', border: '1px solid #e0e8f5', borderRadius: '8px', padding: '18px 28px', fontSize: '.85rem', fontWeight: 700, color: '#5a7a9e', minWidth: '120px', textAlign: 'center', boxShadow: '0 1px 6px rgba(26,58,107,.05)' }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1a3a6b', color: '#a8c0dd', padding: '48px 24px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            {/* Col 1 */}
            <div>
              <h4 style={{ color: '#e8a614', fontWeight: 700, fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>À propos du Département</h4>
              <p style={{ fontSize: '.8rem', lineHeight: 1.9, color: '#8aaecf' }}>
                Le département Informatique forme des cadres d'excellence capables de s'adapter aux mutations rapides de l'IT. Il mène une recherche de pointe et maintient de profondes relations avec le monde socio-économique.
              </p>
            </div>
            {/* Col 2 */}
            <div>
              <h4 style={{ color: '#e8a614', fontWeight: 700, fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Liens Rapides</h4>
              {[
                'Espace Numérique de Travail (ENT)',
                'Plateforme de Scolarité',
                'Offres de Stage & PFE',
                'Règlement intérieur FSTT',
              ].map(l => (
                <div key={l} style={{ marginBottom: '10px' }}>
                  <Link to="/auth" style={{ color: '#8aaecf', textDecoration: 'none', fontSize: '.8rem' }}>{l}</Link>
                </div>
              ))}
            </div>
            {/* Col 3 */}
            <div>
              <h4 style={{ color: '#e8a614', fontWeight: 700, fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Clubs &amp; Activités</h4>
              {[
                'Club Informatique (IT Club)',
                'Google Developer Student Club (GDSC)',
                'FSTT Robotics & IoT',
                'Cybersec Students Team',
              ].map(l => (
                <div key={l} style={{ marginBottom: '10px' }}>
                  <a href="#" style={{ color: '#8aaecf', textDecoration: 'none', fontSize: '.8rem' }}>{l}</a>
                </div>
              ))}
            </div>
            {/* Col 4 */}
            <div>
              <h4 style={{ color: '#e8a614', fontWeight: 700, fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Contact &amp; Accès</h4>
              <div style={{ fontSize: '.8rem', lineHeight: 2.2, color: '#8aaecf' }}>
                <div>
                  <svg style={{ verticalAlign: 'middle', marginRight: 6 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Bd de l'Exposition, BP 416, Ancienne route de l'Aéroport, Tanger 90000, Maroc
                </div>
                <div>
                  <svg style={{ verticalAlign: 'middle', marginRight: 6 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
                  +212 5 39 39 39 53
                </div>
                <div>
                  <svg style={{ verticalAlign: 'middle', marginRight: 6 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  d.informatique@fstt.ac.ma
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #2d5a9e', paddingTop: '20px', textAlign: 'center', fontSize: '.74rem', color: '#6a8fb5' }}>
            © 2026 Faculté des Sciences et Techniques de Tanger — Département Informatique · GDI Groupe 5 · LSI · 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ── FAQ Accordion Component ── */
const FaqSection = () => {
  const [open, setOpen] = useState(null);
  const items = [
    { q: 'Comment candidater pour la LST Génie Informatique ?', a: 'Le dépôt de candidature se fait via la plateforme nationale "Tawjihnet". Les bacheliers scientifiques et techniques sont éligibles. Les dossiers sont sélectionnés sur la base des résultats du baccalauréat.' },
    { q: 'Quelles sont les conditions d\'accès au Cycle d\'Ingénieur LSI ?', a: 'L\'accès au Cycle d\'Ingénieur est ouvert aux titulaires d\'une CPGE (Classes Préparatoires) ou d\'une LST avec mention, après réussite aux concours nationaux ou entretiens de sélection organisés par la FSTT.' },
    { q: 'Quels sont les diplômes requis pour intégrer le Master IA ?', a: 'Le Master en Intelligence Artificielle est accessible aux titulaires d\'une Licence (Bac+3) en Informatique, Mathématiques ou disciplines connexes, après sélection sur dossier et entretien.' },
    { q: 'La FSTT propose-t-elle des formations continues ou des séminaires certifiants ?', a: 'Oui, le département organise régulièrement des séminaires, ateliers et formations courtes en partenariat avec des entreprises comme Microsoft, AWS et Oracle. Les dates sont publiées sur le site officiel.' },
    { q: 'Où retirer son diplôme ou attestation de réussite ?', a: 'Les diplômes et attestations sont retirés au Service de Scolarité de la FSTT, sur présentation d\'une pièce d\'identité et du reçu de paiement des droits universitaires.' },
  ];
  return (
    <section style={{ background: '#fff', padding: '64px 24px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#1a3a6b', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Foire aux Questions
        </h2>
        <div style={{ width: '60px', height: '3px', background: '#e8a614', margin: '0 auto 48px' }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ border: '1px solid #e0e8f5', borderLeft: '4px solid #1a3a6b', borderRadius: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontWeight: 600, color: '#1a3a6b', fontSize: '.9rem' }}>{item.q}</span>
                <span style={{ color: '#e8a614', fontSize: '1.3rem', fontWeight: 700, flexShrink: 0, marginLeft: '12px', transition: 'transform .2s', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 20px 18px', color: '#555', fontSize: '.86rem', lineHeight: 1.8 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
