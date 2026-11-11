import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Clubs = () => {
  const { currentUser } = useAuth();
  const { db, save, getStudentByUserId, teacherName } = useData();
  const [searchTerm, setSearchBar] = useState('');
  const [filter, setFilter] = useState('all'); // all, joined, available
  const [toast, setToast] = useState(null);

  const student = getStudentByUserId(currentUser.id);
  
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleJoin = (club) => {
    if (!student) return;
    
    const membres = club.membres || [];
    const isMember = membres.includes(student.id);
    let newMembres;
    let newClubIds;

    if (isMember) {
      newMembres = club.membres.filter(id => id !== student.id);
      newClubIds = (student.clubIds || []).filter(id => id !== club.id);
      showToast(`Vous avez quitté le club ${club.nom}.`, 'info');
    } else {
      newMembres = [...(club.membres || []), student.id];
      newClubIds = [...(student.clubIds || []), club.id];
      showToast(`Bienvenue au club ${club.nom} !`);
    }

    // Update both Club and Student for consistency
    save('clubs', { ...club, membres: newMembres });
    save('students', { ...student, clubIds: newClubIds });
  };

  const filteredClubs = useMemo(() => {
    let list = db.clubs || [];
    
    // Filter by tab
    if (filter === 'joined') {
      list = list.filter(c => (c.membres || []).includes(student?.id));
    } else if (filter === 'available') {
      list = list.filter(c => !(c.membres || []).includes(student?.id) && c.statut === 'ACTIF');
    }

    // Filter by search
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(c => 
        c.nom.toLowerCase().includes(s) || 
        c.description.toLowerCase().includes(s)
      );
    }

    return list;
  }, [db.clubs, filter, searchTerm, student?.id]);

  const getClubIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('dev') || n.includes('info')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
    if (n.includes('ai') || n.includes('data')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    if (n.includes('cyber')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    if (n.includes('robot')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
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
          <h2 className="page-hero-title">Vie Estudiantine & Clubs</h2>
          <p className="page-hero-sub">Épanouissez-vous en rejoignant l'un de nos clubs thématiques.</p>
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
              placeholder="Rechercher un club (ex: Robotique, IA...)" 
              value={searchTerm}
              onChange={(e) => setSearchBar(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '.5rem', background: 'var(--bg)', padding: '.3rem', borderRadius: '10px' }}>
            <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')} style={{ borderRadius: '8px' }}>Tous</button>
            <button className={`btn btn-sm ${filter === 'joined' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('joined')} style={{ borderRadius: '8px' }}>Mes Clubs</button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredClubs.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔍</div>
            <h3 style={{ color: 'var(--text-3)' }}>Aucun club ne correspond à votre recherche.</h3>
          </div>
        ) : (
          filteredClubs.map(club => {
            const membres = club.membres || [];
            const isMember = membres.includes(student?.id);
            const isInactive = club.statut === 'INACTIF';
            
            return (
              <div key={club.id} className="page-card animate-up" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="page-card-body" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: isInactive ? 'var(--border)' : 'var(--blue-mid)', color: '#fff', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center' }}>
                      {getClubIcon(club.nom)}
                    </div>
                    <span className={`badge ${club.statut === 'ACTIF' ? 'badge-green' : 'badge-red'}`} style={{ textTransform: 'uppercase', fontSize: '.65rem' }}>
                      {club.statut}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '.75rem', color: 'var(--blue-dark)' }}>{club.nom}</h3>
                  <p style={{ fontSize: '.88rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {club.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Responsable</div>
                      <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{teacherName(club.idResponsable || club.responsableId)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase' }}>Membres</div>
                      <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--blue-mid)' }}>{membres.length}</div>
                    </div>
                  </div>
                </div>
                <div className="page-card-footer" style={{ padding: '1.25rem', background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
                  {isMember ? (
                    <button className="btn btn-outline-blue btn-block" onClick={() => handleToggleJoin(club)}>
                      Quitter le club
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-block" 
                      disabled={isInactive}
                      onClick={() => handleToggleJoin(club)}
                    >
                      {isInactive ? 'Inscriptions closes' : 'Rejoindre le club'}
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

export default Clubs;
