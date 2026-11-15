import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

/* ── MODULE 5: Ressources Pédagogiques ── */
const Ressources = () => {
  const { currentUser } = useAuth();
  const { db, getStudentByUserId, moduleName, teacherName } = useData();
  const [filterModule, setFilterModule] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  const student = getStudentByUserId(currentUser.id);
  if (!student) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  // Accès: l'étudiant ne voit que les documents liés aux modules de SA filière et SON semestre actif
  // Filtre server-side par filiereId (extrait du JWT). L'étudiant ne peut ni uploader, ni modifier, ni supprimer (RG32)
  const myModules = useMemo(() =>
    db.modules.filter(m => m.filiereId === student.filiereId || m.filiereId === null),
    [db.modules, student.filiereId]
  );

  const myModuleIds = new Set(myModules.map(m => m.id));

  const filteredDocuments = useMemo(() => {
    return db.documents.filter(doc => {
      if (!myModuleIds.has(doc.moduleId)) return false;
      if (filterModule && doc.moduleId !== parseInt(filterModule)) return false;
      if (filterType   && doc.type !== filterType) return false;
      if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [db.documents, myModuleIds, filterModule, filterType, search]);

  // RG32: lecture seule — téléchargement uniquement
  const handleDownload = (doc) => {
    // GET /documents/{id}/download
    alert(`Téléchargement: ${doc.filename}\n(Simulation — backend réel requis)`);
  };

  const typeColors = {
    Cours:  { bg: '#dbeafe', color: '#1d4ed8' },
    TD:     { bg: '#d1fae5', color: '#065f46' },
    TP:     { bg: '#ffedd5', color: '#c2410c' },
    Examen: { bg: '#fee2e2', color: '#991b1b' },
  };

  const typeCounts = useMemo(() => {
    const c = {};
    filteredDocuments.forEach(d => { c[d.type] = (c[d.type] || 0) + 1; });
    return c;
  }, [filteredDocuments]);

  return (
    <div>
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Ressources Pédagogiques</h2>
          <p className="page-hero-sub">Documents de votre filière — Lecture seule (RG32) · Téléchargement uniquement</p>
        </div>
        <div className="page-hero-right">
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {Object.entries(typeCounts).map(([type, count]) => (
              <span key={type} style={{ ...typeColors[type], fontWeight: 700, fontSize: '.75rem', padding: '3px 10px', borderRadius: '999px' }}>
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bannière lecture seule */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius)', padding: '.7rem 1.1rem', marginBottom: '1rem', fontSize: '.84rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Accès en lecture seule (RG32) — Upload, modification et suppression réservés aux enseignants.
      </div>

      {/* Filtres */}
      <div className="page-card animate-up" style={{ marginBottom: '1rem' }}>
        <div className="filter-bar">
          <div className="search-wrap">
            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input className="search-input" type="text" placeholder="Rechercher un document..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            <option value="">Tous les modules</option>
            {myModules.map(m => <option key={m.id} value={m.id}>{m.title} ({m.code})</option>)}
          </select>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tous les types</option>
            {['Cours', 'TD', 'TP', 'Examen'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(filterModule || filterType || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilterModule(''); setFilterType(''); setSearch(''); }}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Grille de documents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filteredDocuments.map(doc => {
          const tc = typeColors[doc.type] || { bg: '#f3f4f6', color: '#4b5563' };
          const mod = db.modules.find(m => m.id === doc.moduleId);
          return (
            <div key={doc.id} className="page-card animate-up" style={{ transition: 'all .2s', cursor: 'default' }}>
              <div className="page-card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
                  {/* Icône document */}
                  <div style={{ width: 42, height: 42, borderRadius: '8px', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tc.color} strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', lineHeight: 1.3, marginBottom: '.35rem' }}>{doc.title}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-3)', display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ ...tc, fontWeight: 700, padding: '1px 7px', borderRadius: '999px', fontSize: '.7rem' }}>{doc.type}</span>
                      {mod && <span>{mod.code}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>
                    <div>{teacherName(doc.teacherId)}</div>
                    <div style={{ fontVariantNumeric: 'tabular-nums' }}>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '.7rem', marginTop: '.15rem', opacity: .7 }}>{doc.filename}</div>
                  </div>
                  {/* RG32: téléchargement uniquement, pas d'upload/edit/delete */}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDownload(doc)}
                    title={`Télécharger ${doc.filename}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredDocuments.length === 0 && (
          <div className="page-card" style={{ gridColumn: '1/-1' }}>
            <div className="page-card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                </div>
                <h3>Aucun document trouvé</h3>
                <p>Modifiez vos filtres ou revenez plus tard.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ressources;
