import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

/* ── helpers ── */
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const EtudiantDashboard = () => {
  const { currentUser } = useAuth();
  const { db, moduleName, roomName, gradeAvg, filiereName } = useData();
  const navigate = useNavigate();

  const student = useMemo(() => 
    (db.etudiants || []).find(s => s && (s.utilisateurId == currentUser?.id || s.idEtudiant == currentUser?.id)) || currentUser?.etudiant, 
  [db.etudiants, currentUser]);

  const user = useMemo(() => 
    (db.utilisateurs || []).find(u => u && u.id == currentUser?.id) || currentUser, 
  [db.utilisateurs, currentUser]);

  if (!student || !user) return <div className="empty-state"><p>Chargement du profil étudiant...</p></div>;

  const isReadOnly = student.statut === 'ABANDONNE';
  const sid = student.id || student.idEtudiant;
  const sfid = student.idFiliere || student.filiereId;
  const filiere = (db.filieres || []).find(f => (f.id || f.idFiliere) === sfid);

  // Prochains Examens
  const upcomingExams = useMemo(() => {
    const modulesInFiliere = (db.modules || []).filter(m => (m.idFiliere || m.filiereId) === sfid).map(m => m.id || m.idModule);
    
    return (db.seances || []).filter(s => {
      const isExam = s.type === 'Examen';
      const isActive = s.statut !== 'ANNULEE';
      const matchesGroup = (s.idGroupe === student.idGroupeTD || s.idGroupe === student.idGroupeTP || s.idGroupe === student.groupId);
      const matchesFiliereModule = modulesInFiliere.includes(s.idModule || s.moduleId);
      
      // If student has no group assigned, show exams for their filiere modules
      return isExam && isActive && (matchesGroup || (!student.idGroupeTD && !student.idGroupeTP && matchesFiliereModule));
    }).slice(0, 3);
  }, [db.seances, db.modules, student, sfid]);

  // Notes Publiées
  const myGrades = useMemo(() => 
    (db.notes || []).filter(g => (g.idEtudiant === sid || g.studentId === sid) && (g.publiee || g.statut === 'PUBLIEE')), 
  [db.notes, sid]);

  // Annonces
  const myAnnonces = useMemo(() => {
    const filiereCode = filiere?.code?.toLowerCase();
    const filtered = (db.annonces || []).filter(a => {
      const target = a.cible?.toLowerCase();
      return target === 'tous' || target === 'all' || (filiereCode && target === filiereCode) || (target === 'étudiants');
    });
    return [...filtered].sort((a, b) => {
      const urgentA = a.urgent || a.urgente;
      const urgentB = b.urgent || b.urgente;
      if (urgentA && !urgentB) return -1;
      if (!urgentA && urgentB) return 1;
      const dateA = new Date(a.dateCreation || a.createdAt);
      const dateB = new Date(b.dateCreation || b.createdAt);
      return dateB - dateA;
    }).slice(0, 5);
  }, [db.annonces, filiere]);

  // Documents récents
  const recentDocs = useMemo(() => {
    const modulesInFiliere = (db.modules || []).filter(m => (m.idFiliere || m.filiereId) === sfid).map(m => m.id || m.idModule);
    return (db.documents || [])
      .filter(d => modulesInFiliere.includes(d.idModule || d.moduleId) || (d.idFiliere || d.filiereId) === sfid)
      .sort((a, b) => new Date(b.dateUpload || b.datePublication) - new Date(a.dateUpload || a.datePublication))
      .slice(0, 4);
  }, [db.documents, db.modules, sfid]);

  // PFE / Stage
  const myPFE = (db.pfes || []).find(p => p.idEtudiant === sid);

  return (
    <div className="dashboard-page">
      {/* Hero */}
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Content de vous revoir, {user.prenom}</h2>
          <p className="page-hero-sub">
            {filiere?.intitule || 'Filière non spécifiée'} {student.anneeInscription ? `• Année ${student.anneeInscription}` : ''}
          </p>
        </div>
        <div className="page-hero-right">
          <span className={`badge ${student.statut === 'ACTIF' ? 'badge-green' : 'badge-orange'}`}>
            Statut: {student.statut || 'ACTIF'}
          </span>
        </div>
      </div>

      {isReadOnly && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius)', padding: '.85rem 1.25rem', marginBottom: '1.25rem', color: '#991b1b', fontSize: '.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Accès en mode lecture seule (Statut: ABANDONNÉ).</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dg-left">
          {/* Annonces */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <h3 className="page-card-title">Annonces de l'établissement</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/announcements')}>Tout voir</button>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {myAnnonces.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}><p>Aucune annonce pour le moment.</p></div>
              ) : (
                myAnnonces.map(ann => (
                  <div key={ann.id || ann.idAnnonce} style={{
                    padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
                    borderLeft: (ann.urgent || ann.urgente) ? '4px solid var(--danger)' : '4px solid transparent',
                    background: (ann.urgent || ann.urgente) ? 'rgba(239,68,68,.02)' : 'transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                      {(ann.urgent || ann.urgente) && <span className="badge badge-red" style={{ fontSize: '.65rem' }}>URGENT</span>}
                      <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text)' }}>{ann.titre || ann.title}</span>
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>
                      Posté le {new Date(ann.dateCreation || ann.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ressources Récentes */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                <h3 className="page-card-title">Ressources Récentes</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/etudiant/ressources')}>Médiathèque</button>
            </div>
            <div className="page-card-body" style={{ padding: '0 1.25rem 1.25rem' }}>
              {recentDocs.length === 0 ? (
                <p style={{ fontSize: '.85rem', color: 'var(--text-3)', textAlign: 'center', padding: '1rem' }}>Aucun document disponible.</p>
              ) : (
                recentDocs.map(doc => (
                  <div key={doc.id || doc.idDocument} className="doc-item" style={{ cursor: 'pointer', marginBottom: '.5rem', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', border: '1px solid transparent' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .6, color: 'var(--blue-mid)' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{doc.titre || doc.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>{moduleName(doc.idModule || doc.moduleId)} • {new Date(doc.dateUpload || doc.datePublication).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dg-right">
          {/* Dernières Notes */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                <h3 className="page-card-title">Dernières Notes</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/etudiant/notes')}>Relevé</button>
            </div>
            <div className="page-card-body" style={{ padding: '0 1.25rem 1rem' }}>
              {myGrades.length === 0 ? (
                <p style={{ fontSize: '.85rem', color: 'var(--text-3)', textAlign: 'center', padding: '1.5rem 0' }}>En attente de publication.</p>
              ) : (
                myGrades.slice(0, 4).map(g => {
                  const mid = g.idModule || g.moduleId;
                  const mod = (db.modules || []).find(m => (m.id || m.idModule) === mid);
                  const valCC = parseFloat(g.valeurCC || g.cc || 0);
                  const valEF = parseFloat(g.valeurEF || g.exam || 0);
                  const avg = (valCC * 0.4) + (valEF * 0.6);
                  
                  return (
                    <div key={g.id || g.idNote} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{mod?.intitule || mod?.title || 'Module'}</div>
                      <div className={avg >= 10 ? 'grade-pass' : 'grade-fail'} style={{ fontWeight: 800, color: avg >= 10 ? 'var(--success)' : 'var(--danger)' }}>{avg.toFixed(2)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Événements à venir */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3 className="page-card-title">Événements à venir</h3>
              </div>
            </div>
            <div className="page-card-body" style={{ padding: '0 1.25rem 1.25rem' }}>
              {upcomingExams.length > 0 ? (
                upcomingExams.map(ex => (
                  <div key={ex.id || ex.idSeance} style={{ display: 'flex', gap: '1rem', padding: '.75rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '.4rem .6rem', textAlign: 'center', minWidth: '60px' }}>
                      <div style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--blue-mid)' }}>{ex.jour || 'Jour'}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.85rem' }}>Examen: {moduleName(ex.idModule || ex.moduleId)}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{ex.heureDebut || ex.startSlot} • {roomName(ex.idSalle || ex.roomId)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '.82rem', color: 'var(--text-3)', textAlign: 'center', padding: '1rem 0' }}>Aucun examen prévu.</p>
              )}
              
              {myPFE && (
                <div style={{ marginTop: '1rem', padding: '.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius)', border: '1px dashed var(--blue-light)' }}>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--blue-mid)', textTransform: 'uppercase' }}>PROJET : {myPFE.titre}</div>
                  <div style={{ fontWeight: 600, fontSize: '.82rem' }}>Statut : {myPFE.statut}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Vérifiez les deadlines dans l'onglet Projets.</div>
                </div>
              )}
            </div>
          </div>

          {/* Aide */}
          <div className="page-card animate-up" style={{ background: 'linear-gradient(135deg, var(--blue-dark), var(--blue-mid))', color: '#fff', border: 'none' }}>
            <div className="page-card-body" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '.5rem', color: '#fff' }}>Besoin d'aide ?</h4>
              <p style={{ fontSize: '.85rem', opacity: .9, marginBottom: '1.25rem' }}>Consultez les guides ou contactez le support pour toute assistance.</p>
              <button className="btn btn-orange btn-sm btn-block" style={{ background: 'var(--orange)', color: '#fff', border: 'none', width: '100%', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Centre de Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtudiantDashboard;
