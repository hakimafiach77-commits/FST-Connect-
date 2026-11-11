import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

const ReclamationsManager = () => {
  const { db, save, studentName, moduleName } = useData();
  const { success } = useToast();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRec, setSelectedRec] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState('view'); // 'view', 'validate', 'reject'
  
  const [reponse, setReponse] = useState('');
  const [newGradeCC, setNewGradeCC] = useState('');
  const [newGradeFinal, setNewGradeFinal] = useState('');

  const filteredReclamations = db.reclamations.filter(rec => filterStatus === 'ALL' || rec.statut === filterStatus);

  const statusBadge = (s) => {
    switch(s) {
      case 'SOUMISE':  return 'badge-gray';
      case 'EN_COURS': return 'badge-blue';
      case 'VALIDEE':  return 'badge-green';
      case 'REJETEE':  return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const openDetail = (rec) => {
    setSelectedRec(rec);
    setReponse(rec.reponse || '');
    setPanelMode('view');
    
    // Find associated grade
    const grade = db.grades.find(g => g.studentId === rec.studentId && g.moduleId === rec.moduleId);
    if (grade) {
      setNewGradeCC(grade.cc);
      setNewGradeFinal(grade.final);
    } else {
      setNewGradeCC('');
      setNewGradeFinal('');
    }
    
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelectedRec(null);
    setPanelMode('view');
  };

  const handleUpdateStatus = (newStatus) => {
    const updatedRec = { ...selectedRec, statut: newStatus, reponse };

    if (newStatus === 'VALIDEE') {
      // Modify grade in grades table
      const grade = db.grades.find(g => g.studentId === selectedRec.studentId && g.moduleId === selectedRec.moduleId);
      if (grade) {
        save('grades', { ...grade, cc: parseFloat(newGradeCC), final: parseFloat(newGradeFinal), edited: true });
        success('Validée', `Réclamation validée et notes mises à jour.`);
      } else {
        success('Validée', `Réclamation validée (aucune note existante trouvée).`);
      }
    } else if (newStatus === 'REJETEE') {
      success('Rejetée', `Réclamation rejetée.`);
    } else {
      success('Mis à jour', `Statut passé à ${newStatus}.`);
    }

    save('reclamations', updatedRec);
    closePanel();
  };

  return (
    <div className="page-area" style={{ position: 'relative', overflowX: 'hidden' }}>
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Traitement des Réclamations</h2>
          <p className="page-hero-sub">Supervision des contestations de notes et délibérations</p>
        </div>
        <div className="page-hero-right">
          <select 
             value={filterStatus} 
             onChange={e => setFilterStatus(e.target.value)}
             style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="SOUMISE">Soumise (Nouvelle)</option>
            <option value="EN_COURS">En cours (Traitement)</option>
            <option value="VALIDEE">Validée</option>
            <option value="REJETEE">Rejetée</option>
          </select>
        </div>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Module concerné</th>
                <th>Sujet</th>
                <th>Date dépôt</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReclamations.map(rec => (
                <tr key={rec.id}>
                  <td style={{ fontWeight: '500', color: 'var(--blue-dark)' }}>{studentName(rec.studentId)}</td>
                  <td>{moduleName(rec.moduleId)}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.sujet}</td>
                  <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                  <td><span className={`badge ${statusBadge(rec.statut)}`}>{rec.statut.replace('_', ' ')}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDetail(rec)}>
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReclamations.length === 0 && (
                <tr><td colSpan="6" className="table-empty">Aucune réclamation trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-in Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', backgroundColor: '#fff', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', transform: showPanel ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Détail de la réclamation</h3>
          <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        
        {selectedRec && (
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ margin: '0', color: 'var(--blue-dark)' }}>{selectedRec.sujet}</h4>
                <span className={`badge ${statusBadge(selectedRec.statut)}`}>{selectedRec.statut.replace('_', ' ')}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: '1.5', background: 'var(--surface-2)', padding: '15px', borderRadius: '6px' }}>
                "{selectedRec.description}"
              </p>
              
              <div style={{ marginTop: '15px' }}>
                <div style={{ marginBottom: '5px', fontSize: '0.85rem' }}><strong>Étudiant :</strong> {studentName(selectedRec.studentId)}</div>
                <div style={{ marginBottom: '5px', fontSize: '0.85rem' }}><strong>Module :</strong> {moduleName(selectedRec.moduleId)}</div>
                <div style={{ marginBottom: '5px', fontSize: '0.85rem' }}><strong>Date de soumission :</strong> {new Date(selectedRec.createdAt).toLocaleString('fr-FR')}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ margin: '0 0 10px 0', borderBottom: '1px solid var(--border)', paddingBottom: '5px' }}>Traitement</h5>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.85rem' }}>Réponse / Commentaire admin</label>
                <textarea 
                  value={reponse} 
                  onChange={e => setReponse(e.target.value)} 
                  rows="3" 
                  disabled={selectedRec.statut === 'VALIDEE' || selectedRec.statut === 'REJETEE'}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', resize: 'vertical', fontSize: '0.9rem' }}
                  placeholder="Justification de la décision..."
                ></textarea>
              </div>

              {selectedRec.statut === 'SOUMISE' && (
                <button className="btn btn-ghost btn-sm" onClick={() => handleUpdateStatus('EN_COURS')} style={{ width: '100%', display: 'block', textAlign: 'center', marginBottom: '15px', border: '1px solid var(--blue)', color: 'var(--blue)' }}>
                  Prendre en charge (Passer "En cours")
                </button>
              )}

              {(selectedRec.statut === 'SOUMISE' || selectedRec.statut === 'EN_COURS') && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => setPanelMode('reject')}
                    style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', background: panelMode === 'reject' ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}
                  >
                    Rejeter
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setPanelMode('validate')}
                    style={{ flex: 1, background: panelMode === 'validate' ? 'var(--success)' : 'var(--blue)', borderColor: panelMode === 'validate' ? 'var(--success)' : 'var(--blue)' }}
                  >
                    Valider le changement
                  </button>
                </div>
              )}

              {/* Action specific forms */}
              {panelMode === 'validate' && (selectedRec.statut !== 'VALIDEE' && selectedRec.statut !== 'REJETEE') && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: 'var(--success)' }}>Correction de note</h5>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)' }}>Nouvelle note CC</label>
                      <input type="number" step="0.25" value={newGradeCC} onChange={e => setNewGradeCC(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-2)' }}>Nouvelle note Examen Final</label>
                      <input type="number" step="0.25" value={newGradeFinal} onChange={e => setNewGradeFinal(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', background: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleUpdateStatus('VALIDEE')}>
                    Confirmer et valider la réclamation
                  </button>
                </div>
              )}

              {panelMode === 'reject' && (selectedRec.statut !== 'VALIDEE' && selectedRec.statut !== 'REJETEE') && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '10px', margin: '0 0 10px 0' }}>Êtes-vous sûr de vouloir rejeter définitivement cette réclamation ? La note restera inchangée.</p>
                  <button className="btn btn-primary" style={{ width: '100%', background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleUpdateStatus('REJETEE')}>
                    Confirmer le rejet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showPanel && (
        <div onClick={closePanel} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 999 }} />
      )}
    </div>
  );
};

export default ReclamationsManager;
