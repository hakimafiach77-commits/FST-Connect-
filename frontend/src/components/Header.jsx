import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const Header = ({ openSidebar }) => {
  const { pathname } = useLocation();
  const { db } = useData();
  const [time, setTime] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles = {
    '/': 'Tableau de Bord',
    '/dashboard': 'Tableau de Bord',
    '/students': 'Étudiants',
    '/teachers': 'Enseignants',
    '/schedule': 'Emploi du Temps',
    '/announcements': 'Annonces',
    '/modules': 'Modules & Documents',
    '/absences': 'Absences',
    '/rooms': 'Salles & Ressources',
    '/filieres': 'Filières & Groupes',
    '/grades': 'Notes & Examens',
    // Student routes
    '/etudiant/dashboard': 'Tableau de Bord Étudiant',
    '/etudiant/profil': 'Mon Profil',
    '/etudiant/edt': 'Mon Emploi du Temps',
    '/etudiant/absences': 'Mes Absences',
    '/etudiant/notes': 'Mes Notes',
    '/etudiant/projets': 'PFE & Stages',
    '/etudiant/ressources': 'Ressources Pédagogiques',
    '/etudiant/clubs': 'Vie Étudiante & Clubs',
    '/etudiant/formations': 'Formations & Certifications',
  };

  return (
    <header className="app-header">
      <div className="hdr-left">
        <button className="burger-btn" onClick={openSidebar}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <span className="page-breadcrumb">{pageTitles[pathname] || 'GDI'}</span>
      </div>
      <div className="hdr-right">
        <button className="hdr-icon-btn" title="Annonces">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <div className="hdr-clock">{time}</div>
      </div>
    </header>
  );
};

export default Header;
