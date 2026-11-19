import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

/* ── SVG Icons ── */
const AdminIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
    <path d="M6 8h4M6 11h3"/>
    <rect x="14" y="7" width="4" height="4" rx=".5"/>
  </svg>
);

const TeacherIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const StudentIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ROLES = [
  {
    key: 'admin',
    label: 'Administration',
    desc: 'Gestion globale du département, des ressources académiques et des configurations système.',
    Icon: AdminIcon,
  },
  {
    key: 'teacher',
    label: 'Enseignant',
    desc: 'Gestion des cours, des absences, des notes et communication avec les étudiants.',
    Icon: TeacherIcon,
  },
  {
    key: 'student',
    label: 'Étudiant',
    desc: 'Consultation des emplois du temps, des résultats, des absences et ressources pédagogiques.',
    Icon: StudentIcon,
  },
];

const AuthScreen = () => {
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('login');
    const defaults = {
      admin: 'admin@dept.ma',
      teacher: 'prof@dept.ma',
      student: 'etudiant@dept.ma',
    };
    setEmail(defaults[role]);
    setPassword('password123');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      success('Connexion réussie', 'Bienvenue sur votre espace GDI.');
      navigate(user.role === 'student' ? '/etudiant/dashboard' : '/dashboard');
    } catch (err) {
      error('Échec de connexion', err.message);
    } finally {
      setLoading(false);
    }
  };

  const backToRoles = () => {
    setStep('role');
    setSelectedRole(null);
  };

  /* ── styles ── */
  const pageStyle = {
    minHeight: '100vh',
    background: '#f0f2f5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    padding: '40px 16px',
  };

  const logoStyle = {
    background: '#1a3a6b',
    color: '#fff',
    fontWeight: 900,
    fontSize: '1rem',
    padding: '10px 16px',
    borderRadius: '8px',
    letterSpacing: 1,
    marginBottom: '24px',
    display: 'inline-block',
  };

  const cardStyle = (key) => {
    const isActive = hoveredRole === key || selectedRole === key;
    return {
      flex: '1 1 220px',
      maxWidth: '260px',
      background: '#fff',
      border: isActive ? '2px solid #1a3a6b' : '2px solid #e8eef8',
      borderRadius: '14px',
      padding: '36px 28px 28px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all .18s ease',
      boxShadow: isActive
        ? '0 8px 32px rgba(26,58,107,.14)'
        : '0 2px 10px rgba(26,58,107,.06)',
      transform: isActive ? 'translateY(-3px)' : 'none',
    };
  };

  const iconWrapStyle = (key) => {
    const isActive = hoveredRole === key || selectedRole === key;
    return {
      width: 68,
      height: 68,
      borderRadius: '14px',
      background: isActive ? '#1a3a6b' : '#eef1f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      color: isActive ? '#fff' : '#5a7a9e',
      transition: 'all .18s ease',
    };
  };

  /* ── Role selection ── */
  if (step === 'role') {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={logoStyle}>FSTT</span>
          <h1 style={{ color: '#1a1f36', fontSize: '2rem', fontWeight: 800, margin: '0 0 12px' }}>
            Choisissez votre profil
          </h1>
          <p style={{ color: '#6b7a9e', fontSize: '.95rem', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            Sélectionnez votre rôle pour accéder à votre espace dédié sur la plateforme
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '52px' }}>
          {ROLES.map(({ key, label, desc, Icon }) => (
            <div
              key={key}
              id={`role-card-${key}`}
              style={cardStyle(key)}
              onClick={() => handleRoleSelect(key)}
              onMouseEnter={() => setHoveredRole(key)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <div style={iconWrapStyle(key)}>
                <Icon />
              </div>
              <h3 style={{ color: '#1a1f36', fontWeight: 700, fontSize: '1.05rem', margin: '0 0 12px' }}>
                {label}
              </h3>
              <p style={{ color: '#6b7a9e', fontSize: '.84rem', lineHeight: 1.65, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Back to home */}
        <Link
          to="/"
          style={{ color: '#1a3a6b', textDecoration: 'none', fontSize: '.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  /* ── Split-screen Login form ── */
  const selectedRoleData = ROLES.find(r => r.key === selectedRole);
  const SelectedIcon = selectedRoleData ? selectedRoleData.Icon : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
      {/* ── LEFT PANEL (Branding) ── */}
      <div style={{ 
        flex: 1, 
        background: '#16335B', 
        color: '#fff', 
        padding: '60px 80px',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '12px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A8BDB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 12 12 17 22 12"></polyline>
              <polyline points="2 17 12 22 22 17"></polyline>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            FST <span style={{ color: '#4A8BDB' }}>Connect</span>
          </h1>
        </div>

        <div style={{ color: '#4A8BDB', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '24px' }}>
          FACULTÉ DES SCIENCES ET TECHNIQUES · TANGER
        </div>

        <p style={{ color: '#A0B4D0', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '440px', marginBottom: '48px' }}>
          Votre espace numérique académique centralisé. Gérez vos cours, ressources et parcours en un seul endroit sécurisé.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', color: '#4A8BDB' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span style={{ color: '#E0E7F1', fontSize: '0.9rem', fontWeight: 500 }}>Connexion sécurisée et authentifiée</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', color: '#4A8BDB' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span style={{ color: '#E0E7F1', fontSize: '0.9rem', fontWeight: 500 }}>Ressources pédagogiques et emplois du temps</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', color: '#4A8BDB' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span style={{ color: '#E0E7F1', fontSize: '0.9rem', fontWeight: 500 }}>Gestion du parcours et des résultats</span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '40px', left: '80px', color: '#4A5B7B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
          DÉPARTEMENT INFORMATIQUE — FST TANGER
        </div>
      </div>

      {/* ── RIGHT PANEL (Login Form) ── */}
      <div style={{ 
        flex: 1, 
        background: '#FAFBFD',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          {/* Header row (Back & Badge) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <button
              onClick={backToRoles}
              style={{
                background: 'none', border: 'none', color: '#16335B', fontWeight: 600, fontSize: '.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Retour
            </button>
            <div style={{ background: '#E8F0FE', color: '#4A8BDB', fontSize: '0.7rem', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', letterSpacing: '0.5px' }}>
              CORPS {selectedRole === 'admin' ? 'ADMINISTRATIF' : selectedRole === 'teacher' ? 'ENSEIGNANT' : 'ÉTUDIANT'}
            </div>
          </div>
          {/* Title Area */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: '#16335B', color: '#fff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {SelectedIcon && <SelectedIcon />}
            </div>
            <div>
              <h2 style={{ color: '#111827', fontSize: '2rem', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>
                Connexion<br/>{selectedRoleData?.label}
              </h2>
            </div>
          </div>
          
          <p style={{ color: '#6B7280', fontSize: '.9rem', margin: '0 0 40px' }}>
            {selectedRole === 'student' ? 'Accédez à vos cours, emplois du temps et notes.' 
            : selectedRole === 'teacher' ? 'Gérez vos modules, notes et absences étudiants.'
            : 'Gérez les configurations académiques du département.'}
          </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: '.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Identifiant Institutionnel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.ma"
              required
              style={{
                width: '100%', boxSizing: 'border-box', padding: '14px 16px',
                background: '#F3F4F6', border: '1px solid transparent', borderRadius: '8px',
                fontSize: '.95rem', outline: 'none', color: '#111827',
                transition: 'all .2s',
              }}
              onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#4A8BDB'; e.target.style.boxShadow = '0 0 0 4px rgba(74,139,219,0.1)'; }}
              onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: '.75rem', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '14px 44px 14px 16px',
                  background: '#F3F4F6', border: '1px solid transparent', borderRadius: '8px',
                  fontSize: '.95rem', outline: 'none', color: '#111827',
                  transition: 'all .2s', letterSpacing: showPw ? 'normal' : '2px'
                }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#4A8BDB'; e.target.style.boxShadow = '0 0 0 4px rgba(74,139,219,0.1)'; }}
                onBlur={e => { e.target.style.background = '#F3F4F6'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0,
                }}
              >
                {showPw
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#16335B', cursor: 'pointer' }} />
              <span style={{ color: '#4B5563', fontSize: '.85rem', fontWeight: 500 }}>Rester connecté</span>
            </label>
            <a href="#" style={{ color: '#4A8BDB', textDecoration: 'none', fontSize: '.85rem', fontWeight: 600 }}>
              Problème de connexion ?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px', background: '#111827', color: '#fff',
              border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '.95rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
              transition: 'background .2s, transform .1s', marginBottom: '40px',
            }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#1F2937'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#111827'; }}
            onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => { if (!loading) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? 'Connexion…' : 'Accéder à mon espace'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: '#6B7280', fontSize: '.85rem' }}>
          Vous n'avez pas de compte ? <a href="#" style={{ color: '#16335B', fontWeight: 700, textDecoration: 'none' }}>Contactez le support</a>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AuthScreen;
