import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

const ModulesManager = () => {
  const { db, save, remove, nextId, filiereName, teacherName } = useData();
  const { success } = useToast();
  
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  const [formData, setFormData] = useState({
    code: '', title: '', filiereId: '', semester: 1, coeff: 1, teacherId: ''
  });

  const handleOpenAdd = () => {
    setEditingModule(null);
    setFormData({ code: '', title: '', filiereId: '', semester: 1, coeff: 1, teacherId: '' });
    setShowModal(true);
  };

  const handleEdit = (m) => {
    setEditingModule(m);
    setFormData({ ...m });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { 
      ...formData, 
      // Only include ID if we're editing
      ...(editingModule && { id: editingModule.id, idModule: editingModule.idModule }),
      filiereId: parseInt(formData.filiereId),
      teacherId: formData.teacherId ? parseInt(formData.teacherId) : null
    };
    save('modules', data);
    setShowModal(false);
    success(editingModule ? 'Module mis à jour' : 'Module créé');
  };

  return (
    <div className="page-content">
      <div className="page-hero">
        <h2 className="page-hero-title">Modules & Unités</h2>
        <button className="btn btn-primary" onClick={handleOpenAdd}>+ Nouveau Module</button>
      </div>

      <div className="page-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Titre</th>
                <th>Filière</th>
                <th>Sems.</th>
                <th>Coeff</th>
                <th>Coordonnateur</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {db.modules.map(m => (
                <tr key={m.id}>
                  <td>{m.code}</td>
                  <td style={{ fontWeight: '700' }}>{m.title}</td>
                  <td>{filiereName(m.filiereId)}</td>
                  <td>S{m.semester}</td>
                  <td>{m.coeff}</td>
                  <td>{teacherName(m.teacherId)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(m)}>Modifier</button>
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
            <h3 className="modal-title">{editingModule ? 'Modifier Module' : 'Nouveau Module'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Code</label>
                <input type="text" className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Filière</label>
                  <select className="form-control" value={formData.filiereId} onChange={e => setFormData({...formData, filiereId: e.target.value})} required>
                    <option value="">Choisir...</option>
                    {db.filieres.map(f => <option key={f.id} value={f.id}>{f.code}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semestre</label>
                  <input type="number" className="form-control" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} min="1" max="6" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Coordonnateur</label>
                <select className="form-control" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
                  <option value="">Non assigné</option>
                  {db.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
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

export default ModulesManager;
