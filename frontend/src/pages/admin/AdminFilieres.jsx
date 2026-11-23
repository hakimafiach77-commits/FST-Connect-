import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Layers, Plus, ChevronRight, Users, BookOpen, Edit, Trash2, Hash } from 'lucide-react';

const AdminFilieres = () => {
  const { db, save, remove, nextId } = useData();
  const { success } = useToast();
  
  const [selectedFiliereId, setSelectedFiliereId] = useState(db.filieres[0]?.id);
  const [showFilierePanel, setShowFilierePanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  const [filiereData, setFiliereData] = useState({ code: '', intitule: '', niveauEtude: "Cycle d'Ingénieur", nombreSemestres: 6, duree: 3 });
  const [groupData, setGroupData] = useState({ nom: '', type: 'TD', description: '', annee: new Date().getFullYear().toString(), idEnseignant: '', etudiantsIds: [] });

  const selectedFiliere = useMemo(() => 
    db.filieres.find(f => (f.idFiliere || f.id) === selectedFiliereId), 
  [db.filieres, selectedFiliereId]);

  const groups = useMemo(() => {
    return (db.groupes || []).filter(g => (g.idFiliere || g.filiereId) === selectedFiliereId);
  }, [db.groupes, selectedFiliereId]);

  const filiereStats = useMemo(() => {
    const stats = {};
    const studentsList = db.etudiants || [];
    (db.filieres || []).forEach(f => {
      const id = f.idFiliere || f.id;
      stats[id] = studentsList.filter(s => (s.idFiliere || s.filiereId) === id).length;
    });
    return stats;
  }, [db.filieres, db.etudiants]);

  const handleEditFiliere = (f) => {
    setEditingFiliere(f);
    setFiliereData({
      code:            f.code            || '',
      intitule:        f.intitule        || '',
      niveauEtude:     f.niveauEtude     || "Cycle d'Ingénieur",
      nombreSemestres: f.nombreSemestres || 6,
      duree:           f.duree           || 3,
    });
    setShowFilierePanel(true);
  };

  const handleEditGroup = (g) => {
    setEditingGroup(g);
    setGroupData({
      nom: g.nom || '',
      type: g.type || 'TD',

      description: g.description || '',
      annee: g.annee || new Date().getFullYear().toString(),
      idEnseignant: g.idEnseignant || '',
      etudiantsIds: g.etudiantsProjet ? g.etudiantsProjet.map(e => e.idEtudiant || e.id) : []
    });
    setShowGroupPanel(true);
  };

  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupData({ nom: '', type: 'TD', description: '', annee: new Date().getFullYear().toString(), idEnseignant: '', etudiantsIds: [] });
    setShowGroupPanel(true);
  };

  const handleDeleteFiliere = async (id) => {
    if (window.confirm('Supprimer cette filière et tous ses groupes/modules associés ?')) {
      await remove('filieres', id);
      success('Supprimée', 'La filière a été retirée.');
    }
  };

  const handleSubmitFiliere = async (e) => {
    e.preventDefault();
    const payload = {
      ...filiereData,
      ...(editingFiliere && { 
        idFiliere: editingFiliere.idFiliere || editingFiliere.id,
        id: editingFiliere.id 
      })
    };

    await save('filieres', payload);
    setShowFilierePanel(false);
    success(editingFiliere ? 'Mise à jour' : 'Créée', 'Filière enregistrée.');
    if (!editingFiliere) setSelectedFiliereId(payload.id);
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    const data = { 
        ...groupData, 
        ...(editingGroup && { 
          id: editingGroup.id, 
          idGroupe: editingGroup.idGroupe || editingGroup.id 
        }),
        idFiliere: selectedFiliereId
    };
    await save('groupes', data);
    setShowGroupPanel(false);
    setGroupData({ nom: '', type: 'TD', description: '', annee: new Date().getFullYear().toString(), idEnseignant: '', etudiantsIds: [] });
    success(editingGroup ? 'Mis à jour' : 'Ajouté', 'Groupe enregistré avec succès.');
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce groupe ?")) {
      await remove('groupes', groupId);
      success('Succès', 'Groupe supprimé.');
    }
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Filières & Structure</h2>
          <p className="page-hero-sub">Configuration académique du département</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingFiliere(null); setFiliereData({ code: '', intitule: '', niveauEtude: "Cycle d'Ingénieur", nombreSemestres: 6, duree: 3 }); setShowFilierePanel(true); }}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Nouvelle Filière
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="page-card animate-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Offre de Formation
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {(db.filieres || []).map(f => (
              <div 
                key={f.id || f.idFiliere}
                onClick={() => setSelectedFiliereId(f.id || f.idFiliere)}
                style={{ 
                  padding: '16px 20px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid var(--border)',
                  background: selectedFiliereId === (f.id || f.idFiliere) ? 'rgba(30,58,95,0.05)' : 'transparent',
                  borderLeft: selectedFiliereId === (f.id || f.idFiliere) ? '4px solid var(--blue-mid)' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}
                className="filiere-item"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.95rem' }}>{f.code}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-3)' }}>{filiereStats[f.id || f.idFiliere] || 0}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.intitule}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedFiliere ? (
            <>
              <div className="page-card animate-up" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--blue-dark)', margin: 0 }}>{selectedFiliere.intitule}</h3>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                       <span className="badge badge-blue">{selectedFiliere.niveauEtude || '—'}</span>
                       <span className="badge badge-gray">{selectedFiliere.nombreSemestres || '—'} Semestres</span>
                       {(selectedFiliere.duree) && <span className="badge badge-gray">{selectedFiliere.duree} an{selectedFiliere.duree > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEditFiliere(selectedFiliere)}><Edit size={16} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteFiliere(selectedFiliere.idFiliere || selectedFiliere.id)}><Trash2 size={16} color="var(--danger)" /></button>
                  </div>
                </div>
              </div>

              <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--blue-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} /> Groupes TD & TP
                  </h4>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--blue-mid)' }} onClick={handleOpenAddGroup}>
                    <Plus size={14} style={{ marginRight: '4px' }} /> Ajouter un groupe
                  </button>
                </div>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {groups.map(g => (
                    <div key={g.idGroupe || g.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '800', color: 'var(--blue-dark)' }}>{g.nom || "Groupe sans nom"}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase' }}>{g.type}</div>

                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                         <div>
                           <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--blue-mid)' }}>
                             {g.type === 'PROJET' 
                               ? (g.etudiantsProjet?.length || g._count?.etudiantsProjet || 0)
                               : (db.etudiants || []).filter(s => 
                                   (s.idGroupeTD) === (g.idGroupe || g.id) || 
                                   (s.idGroupeTP) === (g.idGroupe || g.id)
                                 ).length}
                           </div>
                           <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>INSCRITS</div>
                         </div>
                         <div style={{ display: 'flex', gap: '4px' }}>
                           <button className="btn btn-ghost btn-sm" onClick={() => handleEditGroup(g)} style={{ padding: '4px', height: 'auto', minHeight: '0' }}>
                             <Edit size={14} />
                           </button>
                           <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteGroup(g.idGroupe || g.id)} style={{ padding: '4px', height: 'auto', minHeight: '0' }}>
                             <Trash2 size={14} color="var(--danger)" />
                           </button>
                         </div>
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', py: '20px', color: 'var(--text-3)', fontSize: '0.85rem' }}>Aucun groupe configuré pour l'instant.</div>}
                </div>
              </div>
            </>
          ) : (
            <div className="page-card" style={{ padding: '60px', textAlign: 'center' }}>
               <Layers size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
               <p style={{ color: 'var(--text-3)' }}>Veuillez sélectionner une filière dans la liste pour voir les détails.</p>
            </div>
          )}
        </div>
      </div>

      <div className={`side-panel-overlay ${showFilierePanel ? 'open' : ''}`} onClick={() => setShowFilierePanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingFiliere ? 'Éditer la Filière' : 'Nouvelle Filière'}</h3>
            <button className="modal-close" onClick={() => setShowFilierePanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="filiereForm" onSubmit={handleSubmitFiliere} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Code Court (ex: GI, LSI)</label>
                <input type="text" className="form-control" value={filiereData.code} onChange={(e) => setFiliereData({...filiereData, code: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Intitulé complet</label>
                <input type="text" className="form-control" value={filiereData.intitule} onChange={(e) => setFiliereData({...filiereData, intitule: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Niveau d'études</label>
                <select className="form-control" value={filiereData.niveauEtude} onChange={(e) => setFiliereData({...filiereData, niveauEtude: e.target.value})}>
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Cycle d'Ingénieur">Cycle d'Ingénieur</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Nombre de Semestres</label>
                  <input type="number" min="1" max="12" className="form-control" value={filiereData.nombreSemestres} onChange={(e) => setFiliereData({...filiereData, nombreSemestres: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Durée (années)</label>
                  <input type="number" min="1" max="6" className="form-control" value={filiereData.duree} onChange={(e) => setFiliereData({...filiereData, duree: e.target.value})} />
                </div>
              </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowFilierePanel(false)}>Annuler</button>
            <button type="submit" form="filiereForm" className="btn btn-primary">Enregistrer</button>
          </div>
        </div>
      </div>

      <div className={`side-panel-overlay ${showGroupPanel ? 'open' : ''}`} onClick={() => setShowGroupPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingGroup ? 'Modifier le Groupe' : 'Ajouter un Groupe'}</h3>
            <button className="modal-close" onClick={() => setShowGroupPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="groupForm" onSubmit={handleSubmitGroup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nom du Groupe (ex: G1, TP-B)</label>
                <input type="text" className="form-control" value={groupData.nom} onChange={(e) => setGroupData({...groupData, nom: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={groupData.type} onChange={(e) => setGroupData({...groupData, type: e.target.value})}>
                  <option value="TD">TD (Travaux Dirigés)</option>
                  <option value="TP">TP (Travaux Pratiques)</option>
                  <option value="PROJET">Projet</option>
                </select>
              </div>
              
              {groupData.type === 'PROJET' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Description du projet</label>
                    <textarea className="form-control" rows="3" value={groupData.description} onChange={(e) => setGroupData({...groupData, description: e.target.value})}></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Année</label>
                    <input type="text" className="form-control" value={groupData.annee} onChange={(e) => setGroupData({...groupData, annee: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Professeur Responsable</label>
                    <select className="form-control" value={groupData.idEnseignant} onChange={(e) => setGroupData({...groupData, idEnseignant: e.target.value})}>
                      <option value="">Sélectionner un enseignant</option>
                      {(db.enseignants || []).map(enseignant => {
                        const u = (db.utilisateurs || []).find(user => user.id === enseignant.utilisateurId);
                        return (
                          <option key={enseignant.idEnseignant} value={enseignant.idEnseignant}>
                            {u ? `${u.nom} ${u.prenom}` : 'Inconnu'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Étudiants affectés (Cochez les étudiants du projet)</label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', background: 'var(--bg)' }}>
                      {(db.etudiants || [])
                        .filter(etudiant => (etudiant.idFiliere || etudiant.filiereId) === selectedFiliereId)
                        .map(etudiant => {
                        const u = (db.utilisateurs || []).find(user => user.id === etudiant.utilisateurId);
                        const etudiantId = etudiant.idEtudiant || etudiant.id;
                        const isChecked = groupData.etudiantsIds.includes(etudiantId);
                        return (
                          <div key={etudiantId} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setGroupData({...groupData, etudiantsIds: [...groupData.etudiantsIds, etudiantId]});
                                } else {
                                  setGroupData({...groupData, etudiantsIds: groupData.etudiantsIds.filter(id => id !== etudiantId)});
                                }
                              }}
                              style={{ marginRight: '10px', cursor: 'pointer', transform: 'scale(1.2)' }}
                            />
                            <span style={{ fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => {
                              if (!isChecked) {
                                setGroupData({...groupData, etudiantsIds: [...groupData.etudiantsIds, etudiantId]});
                              } else {
                                setGroupData({...groupData, etudiantsIds: groupData.etudiantsIds.filter(id => id !== etudiantId)});
                              }
                            }}>
                              <strong style={{ fontFamily: 'monospace', color: 'var(--blue-mid)' }}>{etudiant.cne}</strong> - {u ? `${u.nom} ${u.prenom}` : 'Inconnu'}
                            </span>
                          </div>
                        );
                      })}
                      {(db.etudiants || []).filter(e => (e.idFiliere || e.filiereId) === selectedFiliereId).length === 0 && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', textAlign: 'center', padding: '10px' }}>
                          Aucun étudiant dans cette filière.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}


            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowGroupPanel(false)}>Annuler</button>
            <button type="submit" form="groupForm" className="btn btn-primary">
              {editingGroup ? 'Enregistrer les modifications' : 'Créer le groupe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFilieres;
