import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, User, Clock, FileText } from 'lucide-react';

const AdminModules = () => {
  const { db, filiereName, teacherName, save, remove, nextId } = useData();
  const { success } = useToast();
  
  const [filiereFilter, setFiliereFilter] = useState('');
  const [semestreFilter, setSemestreFilter] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [formData, setFormData] = useState({
    code: '', intitule: '', idFiliere: '', semestre: 'S1', coefficient: 3, idEnseignant: ''
  });

  const filteredModules = useMemo(() => {
    const modulesList = db.modules;
    if (!Array.isArray(modulesList)) return [];
    
    return modulesList.filter(m => {
      const matchesFiliere = filiereFilter ? m.idFiliere === parseInt(filiereFilter) : true;
      const matchesSemestre = semestreFilter ? m.semestre === semestreFilter : true;
      return matchesFiliere && matchesSemestre;
    });
  }, [db.modules, filiereFilter, semestreFilter]);

  const handleOpenAdd = () => {
    setEditingModule(null);
    setFormData({ code: '', intitule: '', idFiliere: '', semestre: 'S1', coefficient: 3, idEnseignant: '' });
    setShowPanel(true);
  };

  const handleEdit = (m) => {
    setEditingModule(m);
    setFormData({ ...m });
    setShowPanel(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce module ?')) {
      remove('modules', id);
      success('Module supprimé');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { 
      ...formData, 
      id: editingModule ? editingModule.id : nextId('modules'),
      idModule: editingModule ? editingModule.idModule : nextId('modules'),
      idFiliere: parseInt(formData.idFiliere),
      coefficient: parseFloat(formData.coefficient),
      idResponsable: formData.idResponsable || formData.idEnseignant ? parseInt(formData.idResponsable || formData.idEnseignant) : null
    };
    save('modules', data);
    
    // Also update affectation if teacher is set
    if (data.idEnseignant) {
        const aff = {
            id: nextId('affectations'),
            idAffectation: nextId('affectations'),
            idEnseignant: data.idEnseignant,
            idModule: data.id,
            typeIntervention: 'Cours',
            heuresAssignees: 30
        };
        save('affectations', aff);
    }

    setShowPanel(false);
    success(editingModule ? 'Mis à jour' : 'Créé', 'Le catalogue des modules a été actualisé.');
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Modules & Programme</h2>
          <p className="page-hero-sub">Gestion des unités d'enseignement et affectations pédagogiques</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Nouveau Module
        </button>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', width: '200px' }}>
          <Filter size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <select 
            className="form-control"
            style={{ paddingLeft: '32px' }}
            value={filiereFilter}
            onChange={(e) => setFiliereFilter(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            {Array.isArray(db.filieres) && db.filieres.map(f => <option key={f.id} value={f.id}>{f.code || f.intitule}</option>)}
          </select>
        </div>
        <select 
          className="form-control"
          style={{ width: '160px' }}
          value={semestreFilter}
          onChange={(e) => setSemestreFilter(e.target.value)}
        >
          <option value="">Tous semestres</option>
          {['S1','S2','S3','S4','S5','S6'].map(s => <option key={s} value={s}>Semestre {s}</option>)}
        </select>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Module</th>
                <th>Filière</th>
                <th>Semestre</th>
                <th>Coeff</th>
                <th>Responsable</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.map(m => (
                <tr key={m.id || m.idModule}>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '6px', background: 'var(--surface-2)', borderRadius: '6px', color: 'var(--blue-mid)' }}>
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.9rem' }}>{m.intitule}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: '700', fontFamily: 'monospace' }}>{m.code}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{filiereName(m.idFiliere)}</span></td>
                  <td><span style={{ fontWeight: '700', color: 'var(--text-2)' }}>{m.semestre}</span></td>
                  <td><div style={{ fontWeight: '800', color: 'var(--blue-mid)' }}>{m.coefficient}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={12} color="var(--text-3)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-2)' }}>{teacherName(m.idResponsable)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(m)}><Edit size={16} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(m.id || m.idModule)}><Trash2 size={16} color="var(--danger)" /></button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredModules.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
                    <div style={{ opacity: 0.5, marginBottom: '8px' }}><BookOpen size={32} style={{ margin: 'auto' }} /></div>
                    Aucun module trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingModule ? 'Modifier le Module' : 'Nouveau Module'}</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
            <form id="moduleForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Code Module *</label>
                    <input type="text" className="form-control" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required placeholder="Ex: M102" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coefficient</label>
                    <input type="number" step="0.5" className="form-control" value={formData.coefficient} onChange={(e) => setFormData({...formData, coefficient: e.target.value})} required />
                  </div>
               </div>

               <div className="form-group">
                 <label className="form-label">Intitulé du Module *</label>
                 <input type="text" className="form-control" value={formData.intitule} onChange={(e) => setFormData({...formData, intitule: e.target.value})} required />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div className="form-group">
                    <label className="form-label">Filière *</label>
                    <select className="form-control" value={formData.idFiliere} onChange={(e) => setFormData({...formData, idFiliere: e.target.value})} required>
                      <option value="">Choisir...</option>
                      {Array.isArray(db.filieres) && db.filieres.map(f => <option key={f.id || f.idFiliere} value={f.id || f.idFiliere}>{f.code} - {f.nom || f.name || f.intitule}</option>)}
                    </select>
                 </div>
                 <div className="form-group">
                    <label className="form-label">Semestre</label>
                    <select className="form-control" value={formData.semestre} onChange={(e) => setFormData({...formData, semestre: e.target.value})}>
                      {['S1','S2','S3','S4','S5','S6'].map(s => <option key={s} value={s}>Semestre {s}</option>)}
                    </select>
                 </div>
               </div>

               <div className="form-group">
                 <label className="form-label">Responsable du Module *</label>
                  <select className="form-control" value={formData.idResponsable || formData.idEnseignant || ''} onChange={(e) => setFormData({...formData, idResponsable: e.target.value, idEnseignant: e.target.value})} required>
                    <option value="">Choisir un responsable...</option>
                    {Array.isArray(db.enseignants) && db.enseignants.map(t => {
                        const user = Array.isArray(db.utilisateurs) ? db.utilisateurs.find(u => u.id === t.utilisateurId) : null;
                        const teacherObj = user || t;
                        const name = teacherObj.prenom ? `${teacherObj.prenom} ${teacherObj.nom}` : (teacherObj.name || teacherObj.nom || 'Professeur');
                        return <option key={t.id || t.idEnseignant} value={t.id || t.idEnseignant}>{name}</option>
                    })}
                  </select>
               </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="moduleForm" className="btn btn-primary">Enregistrer Module</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModules;
