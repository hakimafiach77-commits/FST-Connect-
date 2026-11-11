import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Briefcase, Plus, Search, User, Users, Calendar, Award, Edit, ExternalLink, Filter } from 'lucide-react';

const AdminPFE = () => {
  const { db, save, studentName, teacherName, nextId } = useData();
  const { success } = useToast();
  
  const [showPanel, setShowPanel] = useState(false);
  const [selectedPFE, setSelectedPFE] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    titre: '', idEtudiant: '', studentIds: [], idEncadrant: '', encadrantId: '', statut: 'EN_ATTENTE', 
    dateSoutenance: '', jury: [], note: ''
  });

  const filteredPFEs = useMemo(() => {
    return db.pfes.filter(p => !statusFilter || p.statut === statusFilter);
  }, [db.pfes, statusFilter]);

  const handleOpenDetail = (pfe) => {
    setSelectedPFE(pfe);
    setFormData({ 
      ...pfe,
      idEtudiant: pfe.idEtudiant || pfe.studentId || (pfe.studentIds?.[0]) || '',
      idEncadrant: pfe.idEncadrant || pfe.encadrantId || '',
      dateSoutenance: pfe.dateSoutenance || '',
      jury: pfe.jury || [],
      note: pfe.note || ''
    });
    setShowPanel(true);
  };

  const handleOpenAdd = () => {
    setSelectedPFE(null);
    setFormData({ titre: '', idEtudiant: '', studentIds: [], idEncadrant: '', encadrantId: '', statut: 'EN_ATTENTE', dateSoutenance: '', jury: [], note: '' });
    setShowPanel(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: selectedPFE ? selectedPFE.id : nextId('pfes'),
      idEncadrant: parseInt(formData.idEncadrant || formData.encadrantId),
      encadrantId: parseInt(formData.idEncadrant || formData.encadrantId),
      idEtudiant: parseInt(formData.idEtudiant || (formData.studentIds?.[0])),
      studentIds: formData.studentIds || [parseInt(formData.idEtudiant)]
    };
    save('pfes', data);
    setShowPanel(false);
    success(selectedPFE ? 'Mis à jour' : 'Crée', 'Le suivi PFE a été actualisé.');
  };

  const getStatutBadge = (statut) => {
    const map = {
      'EN_ATTENTE': 'badge-gray',
      'EN_COURS': 'badge-blue',
      'SOUTENU': 'badge-purple',
      'VALIDE': 'badge-green',
      'REFUSE': 'badge-red'
    };
    return <span className={`badge ${map[statut] || 'badge-gray'}`}>{statut.replace('_', ' ')}</span>;
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Projets de Fin d'Études (PFE)</h2>
          <p className="page-hero-sub">Coordination des projets, encadrements et soutenances</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Enregistrer un PFE
        </button>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
         <div style={{ position: 'relative', width: '220px' }}>
            <Filter size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <select className="form-control" style={{ paddingLeft: '32px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tous les statuts</option>
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
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Projet PFE</th>
                <th>Étudiant(s)</th>
                <th>Encadrant</th>
                <th>Statut</th>
                <th>Soutenance</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPFEs.map(pfe => (
                <tr key={pfe.idPG}>
                  <td style={{ padding: '15px 20px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'var(--surface-2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-mid)' }}>
                           <Briefcase size={18} />
                        </div>
                        <div style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.85rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={pfe.titre}>
                          {pfe.titre}
                        </div>
                     </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} color="var(--text-3)" />
                      {studentName(pfe.idEtudiant)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-1)' }}>{teacherName(pfe.idEncadrant || pfe.encadrantId)}</div>
                  </td>
                  <td>{getStatutBadge(pfe.statut)}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: pfe.dateSoutenance ? 'var(--blue-dark)' : 'var(--text-3)' }}>
                      {pfe.dateSoutenance ? new Date(pfe.dateSoutenance).toLocaleDateString() : 'Non fixée'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenDetail(pfe)}>
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{selectedPFE ? 'Gestion du Dossier PFE' : 'Nouveau Projet PFE'}</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="pfeForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div className="form-group">
                 <label className="form-label">Titre Intégral du Projet *</label>
                 <textarea className="form-control" style={{ height: '80px', padding: '12px' }} value={formData.titre} onChange={e => setFormData({...formData, titre: e.target.value})} required placeholder="Saisir le titre validé du PFE..." />
               </div>

               <div className="form-group">
                 <label className="form-label">Encadrant (Rapporteur Interne) *</label>
                 <select className="form-control" value={formData.idEncadrant || formData.encadrantId} onChange={e => setFormData({...formData, idEncadrant: e.target.value})} required>
                   <option value="">Choisir un enseignant...</option>
                   {(db.enseignants || db.teachers || []).map(t => {
                     const user = db.utilisateurs?.find(u => u.id === t.utilisateurId) || t;
                     const name = user.prenom ? `${user.prenom} ${user.nom}` : (user.name || user.nom);
                     return <option key={t.id} value={t.id}>{name}</option>
                   })}
                 </select>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">État d'avancement</label>
                    <select className="form-control" value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})}>
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="EN_COURS">En cours de réalisation</option>
                      <option value="SOUTENU">Soutenu (Terminé)</option>
                      <option value="VALIDE">Validé (Note finale)</option>
                      <option value="REFUSE">Refusé</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note Finale (/20)</label>
                    <input type="number" step="0.25" min="0" max="20" className="form-control" style={{ fontWeight: '700', color: 'var(--blue-mid)' }} value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="X.XX" />
                  </div>
               </div>

               <div className="form-group">
                 <label className="form-label">Programmation Soutenance</label>
                 <input type="datetime-local" className="form-control" value={formData.dateSoutenance.slice(0,16) || ''} onChange={e => setFormData({...formData, dateSoutenance: e.target.value})} />
               </div>

                <div style={{ padding: '16px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={14} /> Membres du Jury
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <select 
                      className="form-control" 
                      style={{ fontSize: '0.85rem' }}
                      value={formData.jury || ''} 
                      onChange={e => setFormData({...formData, jury: e.target.value})}
                    >
                      <option value="">Sélectionner un jury...</option>
                      {(db.juries || []).map(j => (
                        <option key={j.idJury} value={j.idJury}>
                          Jury #{j.idJury} — {new Date(j.dateSoutenance).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="pfeForm" className="btn btn-primary">Enregistrer Modifications</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPFE;
