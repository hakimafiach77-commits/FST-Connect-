import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

const PfeManager = () => {
  const { db, save, studentName, teacherName, getById } = useData();
  const { success } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [selectedPfe, setSelectedPfe] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  const [editFormData, setEditFormData] = useState({ statut: '', dateSoutenance: '', note: '', juryStr: '' });

  const filteredPfes = db.pfes.filter(pfe => {
    const matchesStatus = filterStatus === 'ALL' || pfe.statut === filterStatus;
    const matchesSearch = pfe.titre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusBadge = (s) => {
    switch(s) {
      case 'EN_ATTENTE': return 'badge-gray';
      case 'EN_COURS':   return 'badge-blue';
      case 'SOUTENU':    return 'badge-orange';
      case 'VALIDE':     return 'badge-green';
      case 'REFUSE':     return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const openDetail = (pfe) => {
    setSelectedPfe(pfe);
    setEditFormData({
      statut: pfe.statut,
      dateSoutenance: pfe.dateSoutenance ? pfe.dateSoutenance.split('T')[0] : '', // simple date input
      note: pfe.note || '',
      juryStr: Array.isArray(pfe.jury) ? pfe.jury.join(', ') : ''
    });
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelectedPfe(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const juryArray = editFormData.juryStr.split(',').map(j => j.trim()).filter(j => j.length > 0);
    const updatedPfe = {
      ...selectedPfe,
      statut: editFormData.statut,
      dateSoutenance: editFormData.dateSoutenance ? new Date(editFormData.dateSoutenance).toISOString() : selectedPfe.dateSoutenance,
      note: editFormData.note ? parseFloat(editFormData.note) : null,
      jury: juryArray
    };

    save('pfes', updatedPfe);
    success('Mis à jour', 'Les informations du PFE ont été enregistrées.');
    closePanel();
  };

  return (
    <div className="page-area" style={{ position: 'relative', overflowX: 'hidden' }}>
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Gestion des PFE</h2>
          <p className="page-hero-sub">Projets de Fin d'Études : Affectations, soutenances et délibérations</p>
        </div>
        <div className="page-hero-right">
          <div style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Rechercher par titre..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', width: '250px' }}
            />
          </div>
          <select 
             value={filterStatus} 
             onChange={e => setFilterStatus(e.target.value)}
             style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_COURS">En cours</option>
            <option value="SOUTENU">Soutenu</option>
            <option value="VALIDE">Validé</option>
            <option value="REFUSE">Refusé</option>
          </select>
        </div>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%', minWidth: '950px' }}>
            <thead>
              <tr>
                <th>Titre du PFE</th>
                <th>Étudiant(s)</th>
                <th>Encadrant</th>
                <th>Statut</th>
                <th>Date Soutenance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPfes.map(pfe => (
                <tr key={pfe.id}>
                  <td style={{ fontWeight: '500', color: 'var(--blue-dark)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pfe.titre}</td>
                  <td>
                    {pfe.studentIds.map(sid => (
                      <div key={sid} style={{ fontSize: '0.85rem' }}>{studentName(sid)}</div>
                    ))}
                  </td>
                  <td>{teacherName(pfe.encadrantId)}</td>
                  <td><span className={`badge ${statusBadge(pfe.statut)}`}>{pfe.statut.replace('_', ' ')}</span></td>
                  <td>{pfe.dateSoutenance ? new Date(pfe.dateSoutenance).toLocaleDateString() : 'Non définie'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openDetail(pfe)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPfes.length === 0 && (
                <tr><td colSpan="6" className="table-empty">Aucun PFE trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Edit Panel */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', backgroundColor: '#fff', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', transform: showPanel ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Détails PFE</h3>
          <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        
        {selectedPfe && (
          <>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--blue-dark)' }}>{selectedPfe.titre}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: '1.5' }}>{selectedPfe.description}</p>
                <div style={{ marginTop: '15px', background: 'var(--surface-2)', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '5px' }}><strong>Étudiant(s) :</strong> {selectedPfe.studentIds.map(id => studentName(id)).join(', ')}</div>
                  <div style={{ marginBottom: '5px' }}><strong>Encadrant :</strong> {teacherName(selectedPfe.encadrantId)}</div>
                  {selectedPfe.coEncadrantId && <div><strong>Co-encadrant :</strong> {teacherName(selectedPfe.coEncadrantId)}</div>}
                </div>
                {selectedPfe.cheminRapport && (
                  <div style={{ marginTop: '10px', padding: '10px', border: '1px dashed var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: 'var(--blue)'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <a href="#" style={{ fontSize: '0.85rem', color: 'var(--blue)', textDecoration: 'none' }}>Rapport soumis: {selectedPfe.cheminRapport}</a>
                  </div>
                )}
              </div>

              <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>Administration</h4>
              <form id="pfeForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Statut du PFE</label>
                  <select value={editFormData.statut} onChange={e => setEditFormData({...editFormData, statut: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <option value="EN_ATTENTE">En attente (Sujet)</option>
                    <option value="EN_COURS">En cours (Validé)</option>
                    <option value="SOUTENU">Soutenu (En attente de note)</option>
                    <option value="VALIDE">Validé (Terminé)</option>
                    <option value="REFUSE">Refusé</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Date de soutenance</label>
                    <input type="date" value={editFormData.dateSoutenance} onChange={e => setEditFormData({...editFormData, dateSoutenance: e.target.value})} disabled={editFormData.statut === 'EN_ATTENTE'} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Note Finale</label>
                    <input type="number" step="0.25" min="0" max="20" value={editFormData.note} onChange={e => setEditFormData({...editFormData, note: e.target.value})} disabled={editFormData.statut !== 'VALIDE' && editFormData.statut !== 'SOUTENU'} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Membres du Jury (séparés par des virgules)</label>
                  <textarea 
                    value={editFormData.juryStr} 
                    onChange={e => setEditFormData({...editFormData, juryStr: e.target.value})} 
                    rows="3" 
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', resize: 'vertical' }}
                    placeholder="Prof. X, Dr. Y, M. Z (min 3 enseignants requis pour validation)"
                  ></textarea>
                </div>
              </form>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={closePanel}>Annuler</button>
              <button type="submit" form="pfeForm" className="btn btn-primary">Enregistrer les modifications</button>
            </div>
          </>
        )}
      </div>

      {showPanel && (
        <div onClick={closePanel} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 999 }} />
      )}
    </div>
  );
};

export default PfeManager;
