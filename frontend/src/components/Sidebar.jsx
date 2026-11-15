import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

/* ── Icon Map ── */
const IconMap = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  announcements: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  students: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  teachers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  modules: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  schedule: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  absences: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  grades: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  reclamations: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v4"/><path d="M12 15h.01"/></svg>,
  rooms: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>,
  filieres: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  profil: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  projets: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
  clubs: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  formations: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
};

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { unreadAnnouncements } = useData();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = currentUser.role;

  const navConfig = {
    admin: [
      { section: 'Pilotage' },
      { id: 'dashboard',     path: '/dashboard',     label: 'Tableau de Bord' },
      { id: 'announcements', path: '/annonces',      label: 'Annonces Bureau', badge: true },
      { section: 'Filières & Corps' },
      { id: 'filieres',      path: '/filieres',      label: 'Filières & Groupes' },
      { id: 'teachers',      path: '/enseignants',   label: 'Corps Professoral' },
      { id: 'students',      path: '/registre',      label: 'Registre Étudiants' },
      { section: 'Scolarité & Examens' },
      { id: 'modules',       path: '/modules',       label: 'Catalogue Modules' },
      { id: 'schedule',      path: '/admin/edt',     label: 'Emploi du Temps' },
      { id: 'absences',      path: '/absences',      label: 'Suivi Assiduité' },
      { id: 'grades',        path: '/notes',         label: 'Notes & Examens' },
      { id: 'reclamations',  path: '/reclamations',  label: 'Réclamations' },
      { section: 'Recherche & Infrastructures' },
      { id: 'projets',       path: '/pfe',           label: 'Projets PFE' },
      { id: 'rooms',         path: '/salles',        label: 'Patrimoine Salles' },
    ],
    teacher: [
      { section: 'Principal' },
      { id: 'dashboard',     path: '/dashboard',     label: 'Tableau de Bord' },
      { section: 'Mon Espace' },
      { id: 'schedule',      path: '/teacher/planning', label: 'Mon Planning' },
      { id: 'absences',      path: '/teacher/absences', label: 'Absences' },
      { id: 'modules',       path: '/teacher/modules',  label: 'Mes Modules & Docs' },
      { id: 'grades',        path: '/teacher/notes',    label: 'Notes' },
    ],
    student: [
      { section: 'Mon Espace' },
      { id: 'dashboard',     path: '/etudiant/dashboard',  label: 'Tableau de Bord' },
      { id: 'announcements', path: '/announcements',       label: 'Annonces', badge: true },
      { id: 'profil',        path: '/etudiant/profil',     label: 'Mon Profil' },
      { id: 'schedule',      path: '/etudiant/edt',        label: 'Emploi du Temps' },
      { id: 'absences',      path: '/etudiant/absences',   label: 'Mes Absences' },
      { id: 'grades',        path: '/etudiant/notes',      label: 'Mes Notes' },
      { section: 'Projets & Activités' },
      { id: 'modules',       path: '/etudiant/ressources', label: 'Modules & Docs' },
      { id: 'projets',       path: '/etudiant/projets',    label: 'PFE & Stages' },
      { id: 'clubs',         path: '/etudiant/clubs',      label: 'Clubs' },
      { id: 'formations',    path: '/etudiant/formations', label: 'Formations' },
    ],
  };

  const items = navConfig[role] || [];
  const displayName = currentUser?.name || `${currentUser?.prenom || ''} ${currentUser?.nom || ''}`.trim() || currentUser?.email || 'Utilisateur';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
  const roleLabels = { admin: 'Administrateur', teacher: 'Enseignant', student: 'Étudiant' };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="sb-brand">
          <div className="brand-badge">GDI</div>
          <button className="sb-close-btn" onClick={closeSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="sb-profile">
          <div className="sb-avatar">{initials}</div>
          <div>
            <div className="sb-name">{displayName}</div>
            <div className="sb-role-tag">{roleLabels[currentUser.role] || currentUser.role}</div>
          </div>
        </div>
        
        <nav className="sb-nav">
          {items.map((item, idx) => {
            if (item.section) {
              return <div key={idx} className="nav-section-label">{item.section}</div>;
            }
            const unread = item.badge ? unreadAnnouncements(currentUser.id) : 0;
            return (
              <NavLink 
                key={item.id} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeSidebar}
                end={item.path === '/' || item.path === '/dashboard'}
              >
                <span className="nav-icon">{IconMap[item.id]}</span>
                <span>{item.label}</span>
                {unread > 0 && <span className="nav-badge">{unread}</span>}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="sb-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style={{marginRight:'2px'}}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <div className={`sb-backdrop ${isOpen ? 'show' : ''}`} onClick={closeSidebar}></div>
    </>
  );
};

export default Sidebar;
