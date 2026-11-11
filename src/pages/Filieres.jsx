import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

const Filieres = () => {
  const { db, save, remove, nextId, teacherName, fetchSync } = useData();
  const { success, error } = useToast();

  const [selectedFiliereId, setSelectedFiliereId] = useState(null);
  
  // Filiere Panel State
  const [showFilierePanel, setShowFilierePanel] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState(null);
  const [filiereForm, setFiliereForm] = useState({ code: '', name: '', level: "Cycle d'Ingénieur", semesters: 6, duree: 3, coordinator: '' });

  // Group Panel State
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', type: 'TD', capacity: 30 });

  // Filieres from the DB use idFiliere as the real primary key.
  // normalizeData() copies it to .id, so we use .idFiliere || .id for resilience.
  const selectedFiliere = db.filieres.find(f => (f.idFiliere || f.id) === selectedFiliereId);
  const filiereGroups  = db.groupes.filter(g => (g.idFiliere || g.filiereId) === selectedFiliereId);
  const filiereModules = db.modules.filter(m => (m.idFiliere || m.filiereId) === selectedFiliereId);

  /* ── Filieres Actions ── */
  const handleDeleteFiliere = (id, e) => {
    e.stopPropagation();
    const hasStudents = db.etudiants.some(s => (s.idFiliere || s.filiereId) === id);
    if (hasStudents) {
      error('Erreur', 'Impossible de supprimer une filière qui a des étudiants inscrits.');
      return;
    }
    if (window.confirm('Voulez-vous vraiment supprimer cette filière ?')) {
      remove('filieres', id);
      if (selectedFiliereId === id) setSelectedFiliereId(null);
      success('Supprimée', 'Filière supprimée avec succès.');
    }
  };

  const openFiliereAdd = () => {
    setEditingFiliere(null);
    setFiliereForm({ code: '', intitule: '', level: "Cycle d'Ingénieur", semesters: 6, duree: 3, coordinator: db.enseignants[0]?.idEnseignant || '' });
    setShowFilierePanel(true);
  };

  const openFiliereEdit = (filiere, e) => {
    e.stopPropagation();
    setEditingFiliere(filiere);
    // Populate the form using the real DB field names (intitule, not name)
    setFiliereForm({
      code:     filiere.code     || '',
      intitule: filiere.intitule || filiere.name || '',
    });
    setShowFilierePanel(true);
  };

  const handleFiliereSubmit = async (e) => {
    e.preventDefault();
    // 'code' and 'intitule' are the real DB column names.
    // 'name' was the old frontend alias — the backend PATCH only accepts 'code' + 'intitule'.
    if (!filiereForm.code || !filiereForm.intitule) return;

    const payload = {
      code:     filiereForm.code,
      intitule: filiereForm.intitule,
    };

    if (editingFiliere) {
      // Merge with editing record so idFiliere is preserved for the PATCH URL
      await save('filieres', { ...editingFiliere, ...payload });
      success('Modifiée', 'Filière mise à jour.');
    } else {
      await save('filieres', { id: nextId('filieres'), ...payload });
      success('Ajoutée', 'Nouvelle filière ajoutée.');
    }
    // Re-sync so the left panel list reflects the DB after the write
    await fetchSync();
    setShowFilierePanel(false);
  };

  /* ── Groups Actions ── */
  const openGroupAdd = () => {
    if (!selectedFiliere) return;
    setGroupForm({ name: `${selectedFiliere.code}-`, type: 'TD', capacity: 30 });
    setShowGroupPanel(true);
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    if (!groupForm.name) return;
    save('groups', { id: nextId('groups'), filiereId: selectedFiliere.id, ...groupForm, capacity: parseInt(groupForm.capacity) });
    success('Ajouté', 'Nouveau groupe ajouté à la filière.');
    setShowGroupPanel(false);
  };

  const handleDeleteGroup = (id) => {
    const hasStudents = db.students.some(s => s.groupTDId === id || s.groupTPId === id);
    if (hasStudents) {
      error('Erreur', 'Impossible de supprimer un groupe contenant des étudiants.');
      return;
    }
    if (window.confirm('Supprimer ce groupe ?')) {
      remove('groups', id);
      success('Supprimé', 'Groupe supprimé avec succès.');
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="page-hero">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Filières & Groupes</h2>
          <p className="page-hero-sub">Architecture académique du département</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        
        {/* LEFT PANEL : List of Filieres */}
        <div className="page-card" style={{ width: '400px', display: 'flex', flexDirection: 'column', margin: 0 }}>
          <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Liste des filières</h3>
            <button className="btn btn-primary btn-sm" onClick={openFiliereAdd}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nouveau
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {db.filieres.map(f => {
              // Use idFiliere (real DB PK) with id as fallback (normalizeData alias)
              const fId = f.idFiliere || f.id;
              const count = db.etudiants.filter(s => (s.idFiliere || s.filiereId) === fId).length;
              const isSelected = selectedFiliereId === fId;
              return (
                <div 
                  key={fId} 
                  onClick={() => setSelectedFiliereId(fId)}
                  style={{ 
                    padding: '15px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                    background: isSelected ? 'var(--surface-2)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--blue)' : '3px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--blue-dark)' }}>{f.code}</div>
                    <div className="badge badge-gray">{count} étudiants</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginTop: '4px' }}>{f.intitule || f.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{f.level}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => openFiliereEdit(f, e)} style={{ padding: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => handleDeleteFiliere(fId, e)} style={{ padding: '4px', color: 'var(--danger)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL : Details of selected Filiere */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '10px' }}>
          {selectedFiliere ? (
            <>
              {/* Groups Section */}
              <div className="page-card" style={{ margin: 0 }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Groupes de {selectedFiliere.code}</h3>
                  <button className="btn btn-ghost btn-sm" onClick={openGroupAdd}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter Groupe
                  </button>
                </div>
                <div style={{ padding: '20px' }}>
                  {filiereGroups.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      {filiereGroups.map(g => {
                        const gId = g.idGroupe || g.id;
                        const stdCount = db.etudiants.filter(s => (s.idGroupeTD || s.groupTDId) === gId || (s.idGroupeTP || s.groupTPId) === gId).length;
                        return (
                          <div key={gId} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', background: 'var(--bg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '600' }}>{g.nom || g.name}</span>
                              <span className={`badge ${g.type === 'TP' ? 'badge-orange' : 'badge-green'}`}>{g.type}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '10px' }}>
                              {stdCount} étudiants
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <button onClick={() => handleDeleteGroup(gId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.8rem' }}>Supprimer</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="table-empty">Aucun groupe défini pour cette filière.</div>
                  )}
                </div>
              </div>

              {/* Modules Section */}
              <div className="page-card" style={{ margin: 0 }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ margin: 0 }}>Modules Associés (Par semestre)</h3>
                </div>
                <div style={{ padding: '0' }}>
                  {filiereModules.length > 0 ? (
                    <table style={{ width: '100%', minWidth: '600px' }}>
                      <thead>
                        <tr>
                          <th>Semestre</th>
                          <th>Code</th>
                          <th>Intitulé</th>
                          <th>Coeff</th>
                          <th>Enseignant Responsable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...filiereModules].sort((a,b) => (a.semestre || a.semester || 0) - (b.semestre || b.semester || 0)).map(m => (
                          <tr key={m.idModule || m.id}>
                            <td>S{m.semestre || m.semester}</td>
                            <td style={{ fontWeight: '600' }}>{m.code}</td>
                            <td>{m.intitule || m.title}</td>
                            <td>{m.coeffCC || m.coeff}</td>
                            <td>{teacherName(m.idEnseignant || m.teacherId)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="table-empty" style={{ padding: '20px' }}>Aucun module trouvé pour cette filière.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state page-card" style={{ margin: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', marginBottom: '15px', margin: '0 auto', display: 'block' }}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                </svg>
                <div style={{ color: 'var(--text-2)', fontSize: '1.1rem' }}>Sélectionnez une filière à gauche pour voir les détails</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filiere Slide-in Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', backgroundColor: '#fff', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', transform: showFilierePanel ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{editingFiliere ? 'Modifier Filière' : 'Ajouter Filière'}</h3>
          <button onClick={() => setShowFilierePanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <form id="filiereForm" onSubmit={handleFiliereSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Code *</label>
              <input type="text" value={filiereForm.code} onChange={e => setFiliereForm({...filiereForm, code: e.target.value})} required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} placeholder="Ex: LSI" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Intitulé complet *</label>
              <input type="text" value={filiereForm.intitule || ''} onChange={e => setFiliereForm({...filiereForm, intitule: e.target.value})} required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Niveau</label>
              <select value={filiereForm.level} onChange={e => setFiliereForm({...filiereForm, level: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <option value="Licence">Licence</option>
                <option value="Master">Master</option>
                <option value="Cycle d'Ingénieur">Cycle d'Ingénieur</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Durée (années)</label>
                <input type="number" value={filiereForm.duree} onChange={e => setFiliereForm({...filiereForm, duree: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Semestres</label>
                <input type="number" value={filiereForm.semesters} onChange={e => setFiliereForm({...filiereForm, semesters: parseInt(e.target.value)})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Coordonnateur</label>
              <select value={filiereForm.coordinator} onChange={e => setFiliereForm({...filiereForm, coordinator: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <option value="">Sélectionner un enseignant...</option>
                {db.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </form>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => setShowFilierePanel(false)}>Annuler</button>
          <button type="submit" form="filiereForm" className="btn btn-primary">{editingFiliere ? 'Enregistrer' : 'Ajouter'}</button>
        </div>
      </div>

      {/* Group Slide-in Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '350px', backgroundColor: '#fff', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', transform: showGroupPanel ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Ajouter Groupe</h3>
          <button onClick={() => setShowGroupPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <form id="groupForm" onSubmit={handleGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Nom du groupe *</label>
              <input type="text" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Type</label>
              <select value={groupForm.type} onChange={e => setGroupForm({...groupForm, type: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <option value="TD">TD (Travaux Dirigés)</option>
                <option value="TP">TP (Travaux Pratiques)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Capacité max</label>
              <input type="number" value={groupForm.capacity} onChange={e => setGroupForm({...groupForm, capacity: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
            </div>
          </form>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => setShowGroupPanel(false)}>Annuler</button>
          <button type="submit" form="groupForm" className="btn btn-primary">Ajouter</button>
        </div>
      </div>

      {(showFilierePanel || showGroupPanel) && (
        <div onClick={() => {setShowFilierePanel(false); setShowGroupPanel(false);}} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 999 }} />
      )}
    </div>
  );
};

export default Filieres;
