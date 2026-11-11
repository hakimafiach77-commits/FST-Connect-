import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Students = () => {
  const { db, filiereName, groupName, remove } = useData();
  const { currentUser, isAdmin, isTeacher } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('etudiants');

  const handleDelete = (id) => {
    // RG21: Cannot delete if has grades, absences, pfe
    const hasAbsences = db.absences.some(a => a.studentId === id);
    const hasGrades = db.grades.some(g => g.studentId === id);
    
    if (hasAbsences || hasGrades) {
      error('Action Rejetée', 'Impossible de supprimer un étudiant (RG21) ayant des absences ou des notes.');
      return;
    }

    if (window.confirm('Voulez-vous vraiment supprimer cet étudiant ?')) {
      remove('students', id);
      success('Supprimé', 'Étudiant supprimé avec succès.');
    }
  };

  const statusBadgeClass = (status) => {
    const map = { 'ACTIF': 'badge-green', 'REDOUBLANT': 'badge-orange', 'DIPLOME': 'badge-blue', 'ABANDONNE': 'badge-red' };
    return `badge ${map[status?.toUpperCase()] || 'badge-gray'}`;
  };

  // Teacher-specific data logic
  const myModules = useMemo(() => {
    if (!isTeacher() || !currentUser?.linkedId) return [];
    return db.modules.filter(m => m.teacherId === currentUser.linkedId);
  }, [db.modules, currentUser, isTeacher]);

  const [expandedModuleId, setExpandedModuleId] = useState(null);

  React.useEffect(() => {
    if (isTeacher() && myModules.length > 0 && expandedModuleId === null) {
      setExpandedModuleId(myModules[0].id);
    }
  }, [isTeacher, myModules, expandedModuleId]);

  if (isTeacher()) {
    return (
      <div className="page-area">
        <div className="page-hero animate-up">
          <div className="page-hero-left">
            <h2 className="page-hero-title">Mes Étudiants par Module</h2>
            <p className="page-hero-sub">Listes officielles d'inscriptions classées par vos modules d'enseignement</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myModules.length === 0 ? (
             <div className="empty-state page-card">
               <p>Vous n'êtes affecté à aucun module pour le moment.</p>
             </div>
          ) : (
             myModules.map(module => {
              const moduleStudents = module.filiereId ? db.students.filter(s => s.filiereId === module.filiereId) : db.students;
              const isExpanded = expandedModuleId === module.id;

              return (
                <div key={module.id} className="page-card animate-up" style={{ marginBottom: 0 }}>
                  <div 
                    className="page-card-header" 
                    style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      cursor: 'pointer', 
                      background: isExpanded ? 'var(--surface)' : 'var(--surface-2)',
                      transition: 'background 0.2s',
                      userSelect: 'none'
                    }}
                    onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <svg 
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                        style={{
                          color: 'var(--blue-light)', 
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      <h3 className="page-card-title">{module.title} <span style={{ color: 'var(--text-3)', fontWeight: 'normal', fontSize: '0.9rem', marginLeft: '6px' }}>({module.code})</span></h3>
                    </div>
                    <div>
                      <span className="badge badge-gray">{module.filiereId ? filiereName(module.filiereId) : 'Module Transversal (Tronc Commun)'}</span>
                      <span className="badge badge-blue" style={{ marginLeft: '8px' }}>{moduleStudents.length} Étudiants</span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="table-wrap" style={{ borderTop: '1px solid var(--border)' }}>
                      <table style={{ width: '100%', minWidth: '800px' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '120px' }}>CNE</th>
                            <th style={{ width: '280px' }}>Nom Complet</th>
                            <th>Groupes (TD / TP)</th>
                            <th>Année Inscription</th>
                            <th>Statut Académique</th>
                          </tr>
                        </thead>
                        <tbody>
                          {moduleStudents.length > 0 ? moduleStudents.map(student => (
                            <tr key={student.id}>
                              <td style={{ fontWeight: '600', color: 'var(--text-2)' }}>{student.CNE}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '32px', height: '32px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'var(--blue-dark)' }}>
                                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: '600', color: 'var(--blue-dark)' }}>{student.name}</span>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <span className="badge badge-gray" title="Groupe TD">{groupName(student.groupTDId)}</span>
                                  {student.groupTPId && <span className="badge badge-orange" title="Groupe TP">{groupName(student.groupTPId)}</span>}
                                </div>
                              </td>
                              <td style={{ color: 'var(--text-2)' }}>Année {student.anneeInscription}</td>
                              <td><span className={statusBadgeClass(student.statut)}>{student.statut}</span></td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="5" className="table-empty">Aucun étudiant inscrit dans ce module/filière.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="page-area">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Gestion des Étudiants, PFE & Stages</h2>
          <p className="page-hero-sub">Administration centrale du parcours académique</p>
        </div>
        {isAdmin() && (
          <div className="page-hero-right">
            <button className="btn btn-primary" onClick={() => alert('Ajout non implémenté')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter Étudiant
            </button>
          </div>
        )}
      </div>

      <div className="tabs animate-up" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.2rem' }}>
        <button 
          className={`btn btn-ghost ${activeTab === 'etudiants' ? 'active' : ''}`} 
          style={{ borderBottom: activeTab === 'etudiants' ? '2px solid var(--blue-dark)' : 'none', borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('etudiants')}
        >
          Tous les Étudiants
        </button>
        <button 
          className={`btn btn-ghost ${activeTab === 'pfe' ? 'active' : ''}`} 
          style={{ borderBottom: activeTab === 'pfe' ? '2px solid var(--blue-dark)' : 'none', borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('pfe')}
        >
          Suivi PFE
        </button>
        <button 
          className={`btn btn-ghost ${activeTab === 'stages' ? 'active' : ''}`} 
          style={{ borderBottom: activeTab === 'stages' ? '2px solid var(--blue-dark)' : 'none', borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('stages')}
        >
          Inscriptions Stages
        </button>
      </div>

      <div id="tab-content" className="animate-up" style={{ animationDelay: '0.1s' }}>
        {activeTab === 'etudiants' && (
          <div className="page-card">
            <div className="table-wrap">
              <table style={{ width: '100%', minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th>CNE</th>
                    <th>Étudiant</th>
                    <th>Filière & Groupe</th>
                    <th>Année</th>
                    <th>Statut</th>
                    {isAdmin() && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {db.students.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.CNE || s.cne}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                            {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--blue-dark)' }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{filiereName(s.filiereId)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{groupName(s.groupTDId)} • {s.groupTPId ? groupName(s.groupTPId) : 'Sans TP'}</div>
                      </td>
                      <td>A{s.anneeInscription}</td>
                      <td><span className={statusBadgeClass(s.statut)}>{s.statut}</span></td>
                      {isAdmin() && (
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-sm" title="Modifier" onClick={() => alert('Edit')} style={{ marginRight: '8px' }}>
                            Éditer
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Supprimer" onClick={() => handleDelete(s.id)} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pfe' && (
          <div className="page-card">
            <div className="page-card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <h3>Gestion des PFE (Projets de Fin d'Études)</h3>
                <p>Module PFE - Suivi de status: En attente → En cours → Soutenu → Validé</p>
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '8px' }}>Maximum 2 étudiants par PFE. Jury d'au moins 3 membres.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stages' && (
          <div className="page-card">
            <div className="page-card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <h3>Gestion des Stages</h3>
                <p>Conventions de stage et rapports.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
