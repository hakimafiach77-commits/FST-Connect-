import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Formations = () => {
  const { currentUser } = useAuth();
  const { db, save, nextId, getStudentByUserId } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, enrolled, available
  const [toast, setToast] = useState(null);

  const student = getStudentByUserId(currentUser.id);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEnroll = (formation) => {
    if (!student) return;
    
    const newInscription = {
      id: nextId('inscriptionsFormations'),
      idEtudiant: student.id,
      studentId: student.id,
      formationId: formation.id,
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString()
    };

    save('inscriptionsFormations', newInscription);
    
    // Increment enrolled count in formation
    save('formations', { ...formation, inscrits: (formation.inscrits || 0) + 1 });
    
    showToast(`Votre demande d'inscription pour "${formation.intitule}" a été soumise.`);
  };

  const myInscriptions = useMemo(() => {
    return (db.inscriptionsFormations || []).filter(i => (i.idEtudiant === student?.id || i.studentId === student?.id));
  }, [db.inscriptionsFormations, student?.id]);

  const filteredFormations = useMemo(() => {
    let list = db.formations || [];
    
    // Filter by tab
    if (filter === 'enrolled') {
      list = list.filter(f => myInscriptions.some(i => i.formationId === f.id));
    } else if (filter === 'available') {
      list = list.filter(f => f.statut === 'DISPONIBLE' && !myInscriptions.some(i => i.formationId === f.id));
    }

    // Filter by search
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(f => 
        f.intitule.toLowerCase().includes(s) || 
        f.description.toLowerCase().includes(s) ||
        f.collaborateur.toLowerCase().includes(s)
      );
    }

    return list;
  }, [db.formations, filter, searchTerm, myInscriptions]);

  const getTypeIcon = (type) => {
    if (type === 'CERTIFICATION') {
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-2 5L9 9l11 4-5 2zm0 0l4 8 4-4-8-4z"/><path d="M7 18H2V3h15v5"/><path d="M11 13H2"/></svg>;
    }
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
  };

  return (
    <div className="page-area">
      {toast && (
        <div className={`toast ${toast.type}`} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
          <div className="toast-body">
            <div className="toast-msg">{toast.msg}</div>
          </div>
        </div>
      )}

      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Formations & Certifications</h2>
          <p className="page-hero-sub">Boostez vos compétences avec nos programmes partenaires externes.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="page-card animate-up" style={{ marginBottom: '2rem' }}>
        <div className="page-card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: '250px' }}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Rechercher une formation, un partenaire..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '.5rem', background: 'var(--bg)', padding: '.3rem', borderRadius: '10px' }}>
            <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')} style={{ borderRadius: '8px' }}>Toutes</button>
            <button className={`btn btn-sm ${filter === 'enrolled' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('enrolled')} style={{ borderRadius: '8px' }}>Mes Inscriptions</button>
            <button className={`btn btn-sm ${filter === 'available' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('available')} style={{ borderRadius: '8px' }}>Disponibles</button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {filteredFormations.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', opacity: 0.2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h3 style={{ color: 'var(--text-3)' }}>Aucune formation trouvée.</h3>
          </div>
        ) : (
          filteredFormations.map(f => {
            const inscription = myInscriptions.find(i => i.formationId === f.id);
            const isFull = f.inscrits >= f.capacite;
            const isInactive = f.statut === 'DESACTIVEE';
            
            return (
              <div key={f.id} className="page-card animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="page-card-body" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '.5rem', borderRadius: '10px', background: 'rgba(45, 90, 142, 0.1)', color: 'var(--blue-mid)' }}>
                      {getTypeIcon(f.type)}
                    </div>
                    <span className={`badge ${f.statut === 'DISPONIBLE' ? 'badge-green' : f.statut === 'COMPLETE' ? 'badge-orange' : 'badge-red'}`} style={{ textTransform: 'uppercase', fontSize: '.65rem' }}>
                      {isFull ? 'COMPLET' : f.statut}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '.75rem', color: 'var(--blue-dark)', lineHeight: 1.4 }}>{f.intitule}</h3>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    {f.collaborateur}
                  </div>

                  <p style={{ fontSize: '.88rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {f.description}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: '12px', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '.65rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Date</div>
                      <div style={{ fontSize: '.8rem', fontWeight: 700 }}>{new Date(f.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '.65rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Lieu</div>
                      <div style={{ fontSize: '.8rem', fontWeight: 700 }}>{f.lieu}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-2)', fontWeight: 600 }}>
                      Places: <span style={{ color: 'var(--blue-mid)' }}>{f.inscrits}/{f.capacite}</span>
                    </div>
                    <div style={{ width: '100px', height: '6px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${(f.inscrits / f.capacite) * 100}%`, height: '100%', background: isFull ? 'var(--orange)' : 'var(--success)' }}></div>
                    </div>
                  </div>
                </div>

                <div className="page-card-footer" style={{ padding: '1.25rem', background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                  {inscription ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', padding: '.6rem', background: inscription.statut === 'VALIDEE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: inscription.statut === 'VALIDEE' ? 'var(--success)' : 'var(--warning)', borderRadius: '8px', fontSize: '.85rem', fontWeight: 700 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 11"/></svg>
                      {inscription.statut === 'VALIDEE' ? 'Inscription Validée' : 'Demande en cours'}
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary btn-block" 
                      disabled={isFull || isInactive || f.statut !== 'DISPONIBLE'}
                      onClick={() => handleEnroll(f)}
                    >
                      {isInactive ? 'Non disponible' : isFull ? 'Session complète' : 'Demander l\'inscription'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Formations;
