import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

const Teachers = () => {
  const { db, save, remove, nextId } = useData();
  const { success } = useToast();
  
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', grade: 'Assistant', specialty: '', phone: ''
  });

  const filtered = useMemo(() => {
    return db.teachers.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || 
      t.specialty.toLowerCase().includes(search.toLowerCase())
    );
  }, [db.teachers, search]);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({ name: '', email: '', grade: 'Assistant', specialty: '', phone: '' });
    setShowModal(true);
  };

  const handleEdit = (t) => {
    setEditingTeacher(t);
    setFormData({ ...t });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cet enseignant ?')) {
      remove('teachers', id);
      success('Enseignant supprimé');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const teacherData = {
      ...formData,
      id: editingTeacher ? editingTeacher.id : nextId('teachers')
    };
    save('teachers', teacherData);
    setShowModal(false);
    success(editingTeacher ? 'Mis à jour' : 'Ajouté');
  };

  return (
    <div className="page-content">
      <div className="page-hero">
        <h2 className="page-hero-title">Gestion des Enseignants</h2>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Ajouter un Enseignant
        </button>
      </div>

      <div className="page-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Rechercher un professeur..." 
          className="form-control"
          style={{ width: '100%', maxWidth: '400px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="page-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom Prénom</th>
                <th>Grade</th>
                <th>Spécialité</th>
                <th>Email / Tél</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: '700' }}>{t.name}</td>
                  <td>{t.grade}</td>
                  <td>{t.specialty}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div>{t.email}</div>
                    <div style={{ color: 'var(--text-3)' }}>{t.phone}</div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(t)}>Modifier</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(t.id)} style={{ color: 'var(--danger)' }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingTeacher ? 'Modifier Enseignant' : 'Ajouter Enseignant'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom Complet</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Grade</label>
                <select className="form-control" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                  <option value="PA">Professeur Assistant (PA)</option>
                  <option value="PH">Professeur Habilité (PH)</option>
                  <option value="PES">Professeur de l'Enseignement Supérieur (PES)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Spécialité</label>
                <input type="text" className="form-control" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
