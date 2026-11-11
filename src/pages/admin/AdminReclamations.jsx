import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { MessageSquare, Filter, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle, Edit3, X } from 'lucide-react';

const AdminReclamations = () => {
  const { db, save, studentName, moduleName } = useData();
  const { success } = useToast();
  
  const [statutFilter, setStatutFilter] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  
  const [formData, setFormData] = useState({ reponse: '', newNote: '' });

  const filteredRecs = useMemo(() => {
    return (db.reclamations || []).filter(r => statutFilter ? r.statut === statutFilter : true);
  }, [db.reclamations, statutFilter]);

  const handleOpenDetail = (rec) => {
    setSelectedRec(rec);
    setFormData({ reponse: rec.reponseEnseignant || rec.reponse || '', newNote: '' });
    setShowPanel(true);
  };

  const handleAction = async (newStatut) => {
    const updated = { 
      ...selectedRec, 
      statut: newStatut, 
      reponseEnseignant: formData.reponse,
      reponse: formData.reponse // Legacy backup
    };
    
    await save('reclamations', updated);
    
    // If validated and new note provided, update grade
    if (newStatut === 'VALIDEE' && formData.newNote) {
      const sId = selectedRec.note?.idEtudiant || selectedRec.idEtudiant;
      const mId = selectedRec.note?.idModule || selectedRec.idModule;
      const grade = (db.notes || []).find(g => 
        (g.idEtudiant === sId) && (g.idModule === mId)
      );
      
      if (grade) {
        await save('notes', { 
            ...grade, 
            moyenneModule: parseFloat(formData.newNote),
            moyenne: parseFloat(formData.newNote),
            edited: true 
        });
      }
    }
    
    setShowPanel(false);
    success(newStatut === 'VALIDEE' ? 'Réclamation Validée' : 'Réclamation Rejetée');
  };

  const getStatutBadge = (statut) => {
    const map = {
      'OUVERTE': 'badge-blue',
      'EN_COURS': 'badge-orange',
      'VALIDEE': 'badge-green',
      'REJETEE': 'badge-red'
    };
    return <span className={`badge ${map[statut] || 'badge-gray'}`}>{statut.replace('_', ' ')}</span>;
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Réclamations & Litiges</h2>
          <p className="page-hero-sub">Gestion des contestations de notes soumises par les étudiants</p>
        </div>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', width: '220px' }}>
          <Filter size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <select className="form-control" style={{ paddingLeft: '32px' }} value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
             <option value="">Tous les statuts</option>
             <option value="OUVERTE">Nouveau / Ouvert</option>
             <option value="EN_COURS">En cours</option>
             <option value="VALIDEE">Validé / Rectifié</option>
             <option value="REJETEE">Rejeté / Maintenu</option>
          </select>
        </div>
      </div>

      <div className="page-card animate-up">
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Étudiant</th>
                <th>Module</th>
                <th>Dépôt</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecs.map(r => (
                <tr key={r.id || r.idReclamation} className="hover-row" onClick={() => handleOpenDetail(r)} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{studentName(r.note?.idEtudiant || r.idEtudiant)}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-2)' }}>{moduleName(r.note?.idModule || r.idModule)}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} /> {new Date(r.dateDepot || r.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{getStatutBadge(r.statut)}</td>
                  <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                     <button className="btn btn-ghost btn-sm" style={{ color: 'var(--blue-mid)' }}>
                        Traiter <ChevronRight size={14} />
                     </button>
                  </td>
                </tr>
              ))}
              {filteredRecs.length === 0 && (
                <tr><td colSpan="5" className="table-empty">Aucune réclamation enregistrée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
          <div className="side-panel-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Dossier Réclamation</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}><X size={20} /></button>
          </div>
          <div className="side-panel-body" style={{ padding: '24px' }}>
            {selectedRec && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ padding: '20px', background: '#f0f7ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--blue-dark)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <MessageSquare size={14} /> Motif de l'étudiant
                     </div>
                     <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.5', fontStyle: 'italic' }}>
                       "{selectedRec.motif || selectedRec.description}"
                     </p>
                     <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-3)' }}>NOTE ACTUELLE :</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--danger)' }}>{selectedRec.note?.moyenneModule || selectedRec.noteContestee}/20</span>
                     </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Réponse Administrative *</label>
                    <textarea 
                      className="form-control" 
                      style={{ height: '100px', padding: '12px' }}
                      value={formData.reponse}
                      onChange={(e) => setFormData({...formData, reponse: e.target.value})}
                      disabled={selectedRec.statut === 'VALIDEE' || selectedRec.statut === 'REJETEE'}
                    />
                  </div>

                  {selectedRec.statut !== 'VALIDEE' && selectedRec.statut !== 'REJETEE' && (
                    <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                      <label className="form-label">Nouvelle Note Finale (si validée)</label>
                      <input 
                        type="number" step="0.25" min="0" max="20" className="form-control" 
                        value={formData.newNote}
                        onChange={(e) => setFormData({...formData, newNote: e.target.value})}
                      />
                    </div>
                  )}

                  {(selectedRec.statut === 'VALIDEE' || selectedRec.statut === 'REJETEE') && (
                    <div style={{ padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: selectedRec.statut === 'VALIDEE' ? '#ecfdf5' : '#fff1f2', color: selectedRec.statut === 'VALIDEE' ? '#059669' : '#e11d48', border: '1px solid currentColor' }}>
                       {selectedRec.statut === 'VALIDEE' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                       <div>
                         <div style={{ fontWeight: '800', fontSize: '0.8rem' }}>TRAITÉ</div>
                         <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Le {new Date(selectedRec.dateDepot || selectedRec.createdAt).toLocaleDateString()}</div>
                       </div>
                    </div>
                  )}
               </div>
            )}
          </div>
          <div className="side-panel-footer" style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            {selectedRec?.statut !== 'VALIDEE' && selectedRec?.statut !== 'REJETEE' && (
              <>
                <button onClick={() => handleAction('REJETEE')} className="btn btn-ghost" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Rejeter</button>
                <button onClick={() => handleAction('VALIDEE')} className="btn btn-primary">Valider & Rectifier</button>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .side-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); z-index: 1000; opacity: 0; visibility: hidden; transition: 0.3s; }
        .side-panel-overlay.open { opacity: 1; visibility: visible; }
        .side-panel { position: absolute; right: 0; top: 0; height: 100%; background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1); transform: translateX(100%); transition: 0.3s; display: flex; flex-direction: column; }
        .side-panel-overlay.open .side-panel { transform: translateX(0); }
      `}</style>
    </div>
  );
};

export default AdminReclamations;
