import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Search, Plus, User, Mail, Award, BookOpen, Clock, Edit, Trash2, ExternalLink } from 'lucide-react';

const AdminEnseignants = () => {
  const { db, save, remove, nextId } = useData();
  const { success, error } = useToast();
  
  const [search, setSearch] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [formData, setFormData] = useState({
    matricule: '', nom: '', prenom: '', email: '', grade: 'PES', specialite: '', type: 'Titulaire', volumeHoraireBase: 12
  });

  const filteredTeachers = useMemo(() => {
    return db.enseignants.filter(t => {
      const user = db.utilisateurs.find(u => u.id === t.utilisateurId) || t;
      const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
      return fullName.includes(search.toLowerCase()) || 
             (t.matricule && t.matricule.toLowerCase().includes(search.toLowerCase())) ||
             (t.specialite && t.specialite.toLowerCase().includes(search.toLowerCase()));
    });
  }, [db.enseignants, db.utilisateurs, search]);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({ matricule: '', nom: '', prenom: '', email: '', grade: 'PES', specialite: '', type: 'Titulaire', volumeHoraireBase: 12 });
    setShowPanel(true);
  };

  const handleEdit = (teacher) => {
    const user = db.utilisateurs.find(u => u.id === teacher.utilisateurId) || {};
    setEditingTeacher(teacher);
    setFormData({ 
      ...teacher, 
      nom: user.nom || teacher.nom || '', 
      prenom: user.prenom || teacher.prenom || '',
      email: user.email || teacher.email || ''
    });
    setShowPanel(true);
  };

  const handleDelete = (id) => {
    const hasModules = db.modules.some(m => m.idEnseignant === id);
    if (hasModules) {
      error('Erreur', 'Impossible de supprimer un enseignant affecté à des modules.');
      return;
    }
    if (window.confirm('Voulez-vous vraiment supprimer cet enseignant ?')) {
      remove('enseignants', id);
      success('Supprimé', 'Enseignant retiré de la base.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For new teachers, we send everything to the transactional endpoint
    const teacherPayload = {
      ...formData,
      volumeHoraireBase: parseInt(formData.volumeHoraireBase || 12),
      statut: 'ACTIF'
    };

    if (editingTeacher) {
      teacherPayload.id = editingTeacher.id;
      teacherPayload.idEnseignant = editingTeacher.idEnseignant || editingTeacher.id;
      teacherPayload.utilisateurId = editingTeacher.utilisateurId;
    }

    try {
      await save('enseignants', teacherPayload);
      success(editingTeacher ? 'Mis à jour' : 'Ajouté', 'Les informations de l\'enseignant ont été enregistrées.');
      setShowPanel(false);
    } catch (err) {
      error('Erreur', err.message || 'Impossible d\'enregistrer l\'enseignant.');
    }
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Corps Professoral</h2>
          <p className="page-hero-sub">Répertoire institutionnel des membres du département</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Nouveau Professeur
        </button>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, matricule ou spécialité..." 
            className="form-control"
            style={{ paddingLeft: '40px', width: '100%', maxWidth: '500px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Enseignant</th>
                <th>Matricule</th>
                <th>Grade</th>
                <th>Spécialité</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => {
                const user = db.utilisateurs.find(u => u.id === teacher.utilisateurId) || teacher;
                const fullName = `${user.prenom || ''} ${user.nom || ''}`;
                const initials = fullName.replace(/(Prof\.|Dr\.|M\.)\s+/g, '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                
                return (
                  <tr key={teacher.id}>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--blue-dark)', border: '2px solid var(--border)' }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={10} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                       <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-2)' }}>{teacher.matricule || '—'}</span>
                    </td>
                    <td>
                       <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{teacher.grade}</span>
                    </td>
                    <td><div style={{ fontWeight: '600', color: 'var(--text-2)', fontSize: '0.85rem' }}>{teacher.specialite}</div></td>
                    <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" title="Modifier" onClick={() => handleEdit(teacher)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Supprimer" onClick={() => handleDelete(teacher.id)}>
                            <Trash2 size={16} color="var(--danger)" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Panel */}
      <div 
        className={`side-panel-overlay ${showPanel ? 'open' : ''}`}
        onClick={() => setShowPanel(false)}
      >
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingTeacher ? 'Dossier Enseignant' : 'Ajouter un Enseignant'}</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
          </div>
          
          <div className="side-panel-body">
            <form id="teacherForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-control" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required placeholder="Ahmed" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-control" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required placeholder="Alami" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adresse Email</label>
                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="a.alami@uae.ac.ma" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="form-control" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                    <option value="PA">Professeur Assistant (PA)</option>
                    <option value="PH">Professeur Habilité (PH)</option>
                    <option value="PES">Prof. de l'Enseignement Sup.</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Matricule</label>
                  <input type="text" className="form-control" value={formData.matricule || ''} onChange={e => setFormData({...formData, matricule: e.target.value})} placeholder="T-100" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Spécialité / Domaine</label>
                <input type="text" className="form-control" value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} placeholder="IA, Réseaux, BD..." />
              </div>
            </form>
          </div>
          
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="teacherForm" className="btn btn-primary">
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnseignants;
