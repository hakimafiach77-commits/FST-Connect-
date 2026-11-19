import React, { useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Announcements = () => {
  const { db, filiereName, teacherName, save, getStudentByUserId } = useData();
  const { currentUser, isStudent } = useAuth();
  const { info } = useToast();

  const filteredAnnouncements = useMemo(() => {
    let list = [...(db.annonces || db.announcements || [])];
    if (isStudent()) {
      const student = getStudentByUserId(currentUser.id);
      const f = student ? filiereName(student.idFiliere || student.filiereId) : null;
      list = list.filter(a => (a.cible || a.target) === 'all' || (a.cible || a.target) === 'Tous' || (a.cible || a.target) === f);
    }
    // Sort urgent first, then newest
    return list.sort((a, b) => 
      ((b.urgente || b.urgent) ? 1 : 0) - ((a.urgente || a.urgent) ? 1 : 0) || 
      new Date(b.dateCreation || b.createdAt) - new Date(a.dateCreation || a.createdAt)
    );
  }, [db.annonces, db.announcements, currentUser, isStudent, filiereName, getStudentByUserId]);

  const markedRef = React.useRef(new Set());

  useEffect(() => {
    // Mark as read
    if (currentUser) {
      const annList = db.annonces || db.announcements || [];
      annList.forEach(a => {
        const annId = a.id || a.idAnnonce;
        if (!(a.readBy || []).includes(currentUser.id) && !markedRef.current.has(annId)) {
          markedRef.current.add(annId);
          console.log(`Marking announcement ${annId} as read`);
          const updated = { ...a, readBy: [...(a.readBy || []), currentUser.id] };
          save('annonces', updated);
        }
      });
    }
  }, [db.annonces, db.announcements, currentUser, save]);

  const handleAdd = () => {
    info('Action', 'Création d\'annonce non implémentée.');
  };

  return (
    <div className="page-area">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Annonces & Communications</h2>
          <p className="page-hero-sub">Consultez les dernières informations et alertes du département.</p>
        </div>
        {!isStudent() && (
          <div className="page-hero-right">
            <button className="btn btn-primary" onClick={handleAdd}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Publier une annonce
            </button>
          </div>
        )}
      </div>

      <div className="announcements-list animate-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-state page-card">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a3 3 0 0 1 0 6"/><path d="M5 8h6l7 7V1l-7 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3"/></svg>
            </div>
            <h3>Aucune annonce</h3>
            <p>Il n'y a pas d'annonces pour le moment.</p>
          </div>
        ) : (
          filteredAnnouncements.map(a => (
            <div 
              key={a.id} 
              className="page-card animate-up" 
              style={{ 
                borderLeft: (a.urgente || a.urgent) ? '4px solid var(--danger)' : '4px solid var(--info)',
                padding: '1.5rem',
                marginBottom: 0
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue-dark)' }}>{a.titre || a.title}</h3>
                  {(a.urgente || a.urgent) && <span className="badge badge-red">URGENT</span>}
                </div>
                <span style={{ fontSize: '.85rem', color: 'var(--text-3)', fontWeight: 600 }}>{new Date(a.dateCreation || a.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <p style={{ whiteSpace: 'pre-line', fontSize: '.95rem', lineHeight: '1.65', color: 'var(--text-2)', marginTop: '1.25rem' }}>
                {a.contenu || a.body}
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.2rem', fontSize: '.8rem', color: 'var(--text-3)' }}>
                <span><strong style={{color: 'var(--text-2)'}}>Auteur:</strong> {teacherName(a.idAdministrateur || a.authorId) || 'Admin'}</span>
                <span><strong style={{color: 'var(--text-2)'}}>Cible:</strong> {(a.cible || a.target) === 'all' || (a.cible || a.target) === 'Tous' ? 'Tout le département' : `Filière ${a.cible || a.target}`}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
