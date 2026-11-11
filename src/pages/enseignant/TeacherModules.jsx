import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const TeacherModules = () => {
  const { currentUser } = useAuth();
  const { db, save, remove, filiereName } = useData();
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [activeTab, setActiveTab] = useState('Ressources'); // 'Ressources' | 'Devoirs'
  const [showModal, setShowModal] = useState(false);

  // Modal Form State
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'Ressource',
    deadline: '',
    instructions: '',
    file: null
  });

  const teacher = useMemo(() => {
    if (!db.enseignants || !Array.isArray(db.enseignants)) return null;
    return db.enseignants.find(t => t.utilisateurId == currentUser?.id);
  }, [db.enseignants, currentUser?.id]);

  const teacherId = teacher?.idEnseignant || teacher?.id;

  const myModules = useMemo(() => {
    if (!db.modules || !Array.isArray(db.modules)) return [];
    const affectedModuleIds = new Set(db.affectations?.filter(a => (a.idEnseignant || a.teacherId) == teacherId).map(a => a.idModule || a.moduleId) || []);
    return db.modules.filter(m => {
      const isAssigned = 
        (m.idResponsable || m.idEnseignant || m.teacherId) == teacherId || 
        affectedModuleIds.has(m.id || m.idModule);
      return isAssigned;
    });
  }, [db.modules, db.affectations, teacherId]);

  // Select first module by default once loaded
  React.useEffect(() => {
    if (!selectedModuleId && myModules.length > 0) {
      setSelectedModuleId(myModules[0].id);
    }
  }, [myModules, selectedModuleId]);

  const selectedModule = useMemo(() => {
    if (!db.modules || !Array.isArray(db.modules)) return null;
    return db.modules.find(m => m.id === selectedModuleId);
  }, [selectedModuleId, db.modules]);

  const moduleDocs = useMemo(() => {
    if (!db.documents || !Array.isArray(db.documents)) return [];
    return db.documents.filter(d => (d.idModule == selectedModuleId || d.moduleId == selectedModuleId));
  }, [db.documents, selectedModuleId]);

  // Tab labels vs stored type: 'Ressources' (plural) -> matches type 'Ressource' (singular)
  const filteredDocs = useMemo(() => {
    const typeKey = activeTab === 'Ressources' ? 'Ressource' : 'Devoir';
    return moduleDocs.filter(d => d.type === typeKey || d.type === activeTab);
  }, [moduleDocs, activeTab]);

  const handleImport = (e) => {
    e.preventDefault();
    const fileName = newDoc.file ? newDoc.file.name : 'document.pdf';
    const docType = newDoc.type; // 'Ressource' or 'Devoir'
    const doc = {
      id: Date.now(),
      idDocument: Date.now(),
      idModule: selectedModuleId,
      moduleId: selectedModuleId,
      titre: newDoc.title,
      title: newDoc.title,
      type: docType,
      cheminFichier: fileName,
      fichier: fileName,
      filename: fileName,
      dateUpload: new Date().toISOString(),
      datePublication: new Date().toISOString().split('T')[0],
      uploadedAt: new Date().toISOString().split('T')[0],
      idAuteur: currentUser?.id,
      nombreTelechargements: 0,
      downloadCount: 0,
      ...(docType === 'Devoir' && {
        dateLimite: newDoc.deadline,
        deadline: newDoc.deadline,
        description: newDoc.instructions,
        instructions: newDoc.instructions,
        submissionsCount: 0,
        totalStudents: 30
      })
    };
    save('documents', doc);
    setShowModal(false);
    setNewDoc({ title: '', type: 'Ressource', deadline: '', instructions: '', file: null });
    // Auto-switch to the matching tab so the user sees the new document
    setActiveTab(docType === 'Devoir' ? 'Devoirs' : 'Ressources');
  };

  const handleDelete = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce document ?')) {
      remove('documents', id);
    }
  };

  return (
    <div className="flex h-full bg-white" style={{ display: 'flex', height: 'calc(100vh - 120px)', margin: '-1.5rem' }}>
      {/* ── LEFT PANEL ── */}
      <div style={{ width: '280px', borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: '#fff' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mes Modules</h3>
        </div>
        <div>
          {Array.isArray(myModules) && myModules.map(m => {
            const count = Array.isArray(db.documents) ? db.documents.filter(d => (d.idModule === m.id || d.moduleId === m.id)).length : 0;
            const isSelected = selectedModuleId === m.id;
            return (
              <div
                key={m.id || Math.random()}
                onClick={() => setSelectedModuleId(m.id)}
                style={{
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  borderLeft: isSelected ? '4px solid #1e3a5f' : '4px solid transparent',
                  background: isSelected ? '#f8fafc' : 'transparent',
                  borderBottom: '1px solid #f9fafb',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.9rem', color: isSelected ? '#1e3a5f' : '#334155', marginBottom: '0.5rem' }}>{m.intitule || m.title || 'Sans titre'}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-refined" style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.65rem' }}>{filiereName(m.idFiliere || m.filiereId)}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{count} doc(s)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {selectedModule ? (
          <>
            {/* Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a5f' }}>{selectedModule?.intitule || selectedModule?.title || 'Chargement...'}</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Code: {selectedModule?.code} · Semestre {selectedModule?.semestre || selectedModule?.semester}</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Importer un document
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', padding: '0 2rem' }}>
              {['Ressources', 'Devoirs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '1rem 1.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: activeTab === tab ? '#1e3a5f' : '#94a3b8',
                    borderBottom: activeTab === tab ? '2px solid #1e3a5f' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
              {filteredDocs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredDocs.map(doc => (
                    <div key={doc.id} className="doc-row" style={{ 
                      padding: '1.25rem', 
                      border: '1px solid #f1f5f9', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '10px', 
                          background: doc.type === 'Ressource' ? '#fee2e2' : '#fef3c7', 
                          color: doc.type === 'Ressource' ? '#ef4444' : '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {doc.type === 'Ressource' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{doc.titre || doc.title}</div>
                          {doc.type === 'Ressource' ? (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{doc.fichier || doc.filename}</div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>{doc.description || doc.instructions}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', textAlign: 'right' }}>
                        {doc.type === 'Ressource' ? (
                          <>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Ajouté le</div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{doc.datePublication || doc.uploadedAt}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Téléchargements</div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{doc.nombreTelechargements || doc.downloadCount}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Date limite</div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b91c1c' }}>{doc.dateLimite || doc.deadline}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Soumissions</div>
                              <div className="badge-refined" style={{ background: '#fef3c7', color: '#92400e' }}>{doc.submissionsCount} / {doc.totalStudents} rendus</div>
                            </div>
                          </>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {doc.type === 'Ressource' ? (
                            <button className="action-icon-btn" title="Télécharger">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </button>
                          ) : (
                            <button className="btn btn-ghost btn-sm" style={{ fontWeight: 700 }}>Voir rendus</button>
                          )}
                          <button className="action-icon-btn" title="Supprimer" onClick={() => handleDelete(doc.id)} style={{ color: '#ef4444' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Aucun document dans cette catégorie.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Sélectionnez un module pour voir ses documents.</p>
          </div>
        )}
      </div>

      {/* ── IMPORT MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-hdr">
              <h3 className="modal-hdr-title">Importer un document</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleImport}>
              <div className="modal-bdy">
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Fichier</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    style={{ height: 'auto', padding: '0.6rem' }}
                    onChange={e => setNewDoc({ ...newDoc, file: e.target.files[0] })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Titre du document</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Chapitre 1 - Introduction"
                    value={newDoc.title}
                    onChange={e => setNewDoc({ ...newDoc, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Type de document</label>
                  <select 
                    className="form-control"
                    value={newDoc.type}
                    onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}
                  >
                    <option value="Ressource">Ressource</option>
                    <option value="Devoir">Devoir</option>
                  </select>
                </div>

                {newDoc.type === 'Devoir' && (
                  <>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">Date limite</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={newDoc.deadline}
                        onChange={e => setNewDoc({ ...newDoc, deadline: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Instructions</label>
                      <textarea 
                        className="form-control" 
                        rows={3} 
                        placeholder="Consignes pour les étudiants..."
                        value={newDoc.instructions}
                        onChange={e => setNewDoc({ ...newDoc, instructions: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Importer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherModules;
