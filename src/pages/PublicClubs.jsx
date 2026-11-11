import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const PublicClubs = () => {
  const { db } = useData();
  const navigate = useNavigate();

  const activeClubs = (db.clubs || []).filter(c => c.statut === 'ACTIF');

  // Custom SVGs based on club name context for a premium showcase feel
  const getClubIcon = (name) => {
    const lName = name.toLowerCase();
    if (lName.includes('robot')) {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
        </svg>
      );
    }
    if (lName.includes('cyber') || lName.includes('sécurité')) {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      );
    }
    if (lName.includes('data') || lName.includes('ia') || lName.includes('ai')) {
      return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      );
    }
    // Default Dev / Code icon
    return (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: '#fff', color: '#333' }}>
      
      {/* ── Public Navbar ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e7f0', padding: '15px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
          <div style={{ width: 45, height: 45, background: '#1a3a6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', borderRadius: '4px' }}>
            FSTT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ color: '#1a3a6b', fontSize: '1.1rem', textTransform: 'uppercase' }}>Département Informatique</strong>
            <span style={{ color: '#6b7a90', fontSize: '.8rem', fontWeight: 600 }}>Plateforme Publique</span>
          </div>
        </Link>
        <Link to="/auth" style={{ background: '#1a3a6b', color: '#fff', fontWeight: 700, fontSize: '.85rem', padding: '10px 24px', borderRadius: '30px', textDecoration: 'none', transition: 'background 0.2s' }}>
          Je suis étudiant
        </Link>
      </nav>

      {/* ── Hero Showcase Section ── */}
      <section style={{ background: 'linear-gradient(135deg, #0d1a33 0%, #1a3a6b 100%)', color: '#fff', padding: '100px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Vivez l'Esprit d'Innovation.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#cdd8ea', lineHeight: 1.6, marginBottom: '40px' }}>
            La vie à la FST de Tanger dépasse les murs des amphithéâtres. Rejoignez nos clubs étudiants pour transformer vos idées en projets réels, développer votre réseau et forger votre propre avenir.
          </p>
          <button 
            onClick={() => {
              document.getElementById('clubs-list').scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: '#e8a614', color: '#fff', border: 'none', padding: '16px 40px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(232, 166, 20, 0.3)', transition: 'transform 0.2s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Découvrir nos Clubs &darr;
          </button>
        </div>
      </section>

      {/* ── Feature / Value Prop ── */}
      <section style={{ padding: '80px 20px', background: '#f8fafc', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          <div style={{ flex: '1 1 250px', padding: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: '#e0e7ff', color: '#4338ca', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transform: 'rotate(-5deg)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', fontWeight: 800, marginBottom: '12px' }}>Créativité Pratique</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>Participez à des hackathons, créez des projets open-source et mettez vos cours en pratique dans un environnement collaboratif.</p>
          </div>

          <div style={{ flex: '1 1 250px', padding: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: '#fef3c7', color: '#d97706', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transform: 'rotate(5deg)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', fontWeight: 800, marginBottom: '12px' }}>Réseautage</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>Rencontrez des étudiants passionnés, des professeurs engagés et des professionnels de l'industrie invités lors de nos événements.</p>
          </div>

          <div style={{ flex: '1 1 250px', padding: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: '#fce7f3', color: '#be185d', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transform: 'rotate(-3deg)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', fontWeight: 800, marginBottom: '12px' }}>Développement Personnel</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>Améliorez votre leadership, votre prise de parole en public et votre gestion de projet au sein des bureaux exécutifs.</p>
          </div>
        </div>
      </section>

      {/* ── Clubs Showcase ── */}
      <section id="clubs-list" style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#1e293b', fontWeight: 900, marginBottom: '16px' }}>Nos Clubs Étudiants</h2>
          <div style={{ width: '80px', height: '4px', background: '#e8a614', margin: '0 auto' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
          {activeClubs.map((club, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={club.id} style={{ display: 'flex', flexDirection: isEven ? 'row' : 'row-reverse', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                
                {/* Visual Side */}
                <div style={{ flex: '1 1 400px', background: isEven ? '#f1f5f9' : '#e0e7ff', borderRadius: '32px', padding: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: isEven ? '#64748b' : '#4338ca', minHeight: '350px' }}>
                  {getClubIcon(club.nom)}
                </div>

                {/* Text Side */}
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ fontSize: '2.2rem', color: '#1a3a6b', fontWeight: 900, marginBottom: '24px' }}>{club.nom}</h3>
                  <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.7, marginBottom: '32px' }}>
                    {club.description}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontWeight: 600 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8a614" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Formation continue & ateliers techniques
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontWeight: 600 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8a614" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Organisation d'événements départementaux
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontWeight: 600 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8a614" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      {club.membres?.length || 0} membres actifs
                    </li>
                  </ul>
                  
                  <button 
                    onClick={() => navigate('/auth')}
                    style={{ background: '#1a3a6b', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    onMouseOver={e => e.currentTarget.style.background = '#285596'}
                    onMouseOut={e => e.currentTarget.style.background = '#1a3a6b'}
                  >
                    Demander à rejoindre ce club
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Call to Action / Footer ── */}
      <section style={{ background: '#f8fafc', padding: '80px 20px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 800, marginBottom: '20px' }}>Envie de créer votre propre club ?</h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          La Faculté des Sciences et Techniques encourage l'initiative étudiante. Si vous avez un concept novateur, soumettez votre projet à l'administration.
        </p>
        <button 
          onClick={() => navigate('/auth')}
          style={{ background: '#fff', color: '#1a3a6b', border: '2px solid #1a3a6b', padding: '14px 36px', borderRadius: '50px', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.background = '#1a3a6b'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1a3a6b'; }}
        >
          Se connecter à mon espace
        </button>
      </section>

    </div>
  );
};

export default PublicClubs;
