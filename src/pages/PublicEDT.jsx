import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const PublicEDT = () => {
  const { db } = useData();
  const [selectedFiliere, setSelectedFiliere] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract filieres for the filter
  const filieres = db.filieres || [];

  // Mock EDT documents for public viewing based on actual db.filieres
  const edtDocuments = [
    { id: 1, title: 'EDT - Cycle Ingénieur LSI - S4', filiereId: 1, date: '01 Mar 2026', size: '1.2 MB' },
    { id: 2, title: 'EDT - Cycle Ingénieur LSI - S6', filiereId: 1, date: '01 Mar 2026', size: '0.9 MB' },
    { id: 3, title: 'EDT - Cycle Ingénieur GI - S4', filiereId: 2, date: '02 Mar 2026', size: '1.1 MB' },
    { id: 4, title: 'EDT - Master AI - S2', filiereId: 3, date: '28 Fév 2026', size: '1.5 MB' },
    { id: 5, title: 'EDT - Master Cybersecurity - S2', filiereId: 4, date: '28 Fév 2026', size: '1.4 MB' },
    { id: 6, title: 'EDT - Licence IDAI - S6', filiereId: 5, date: '26 Fév 2026', size: '0.8 MB' },
    { id: 7, title: 'EDT - Licence AD - S6', filiereId: 6, date: '26 Fév 2026', size: '0.7 MB' },
  ];

  const filteredDocs = edtDocuments.filter(doc => {
    const matchFiliere = selectedFiliere === 'all' || doc.filiereId === parseInt(selectedFiliere);
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFiliere && matchSearch;
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f4f7f9', minHeight: '100vh' }}>
      {/* ── Public Navbar ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e7f0', padding: '15px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
          <div style={{ width: 45, height: 45, background: '#1a3a6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', borderRadius: '4px' }}>
            FSTT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ color: '#1a3a6b', fontSize: '1.1rem', textTransform: 'uppercase' }}>Département Informatique</strong>
            <span style={{ color: '#6b7a90', fontSize: '.8rem', fontWeight: 600 }}>Plateforme Publique</span>
          </div>
        </Link>
        <Link to="/auth" style={{ background: '#e8a614', color: '#fff', fontWeight: 700, fontSize: '.85rem', padding: '8px 20px', borderRadius: '4px', textDecoration: 'none' }}>
          Connexion Espace Privé
        </Link>
      </nav>

      {/* ── Header / Hero ── */}
      <div style={{ background: '#1a3a6b', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.5px' }}>
          Emplois du Temps Officiels
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', color: '#aec0db', lineHeight: 1.6 }}>
          Consultez et téléchargez les emplois du temps pour toutes les filières et formations du département Informatique.
        </p>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: '1000px', margin: '-30px auto 40px', padding: '0 20px', position: 'relative', zIndex: 10 }}>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,.06)', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>
              Rechercher un document
            </label>
            <input
              type="text"
              placeholder="Ex: LSI S4..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '.95rem', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>
              Filtrer par Filière
            </label>
            <select
              value={selectedFiliere}
              onChange={(e) => setSelectedFiliere(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '.95rem', outline: 'none', background: '#fff' }}
            >
              <option value="all">Toutes les filières</option>
              {filieres.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredDocs.map(doc => (
            <div key={doc.id} style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#ffe4e6', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.4 }}>{doc.title}</h3>
              <p style={{ fontSize: '.85rem', color: '#64748b', margin: '0 0 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {doc.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                  {doc.size}
                </span>
              </p>
              <button style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px', color: '#0f172a', fontWeight: 600, fontSize: '.9rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = '#1a3a6b'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a3a6b'; }} onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#cbd5e1'; }}>
                Télécharger PDF
              </button>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', opacity: 0.5 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '8px' }}>Aucun document trouvé</h3>
              <p>Essayez de modifier vos critères de recherche ou de filtre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicEDT;
