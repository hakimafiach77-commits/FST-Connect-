import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Bell, Plus, Search, Megaphone, Trash2, Edit, Calendar, User, Globe, Lock } from 'lucide-react';

const AdminAnnonces = () => {
  const { db, save, remove, nextId } = useData();
  const { success } = useToast();
  
  const [showPanel, setShowPanel] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '', title: '', contenu: '', content: '', cible: 'ALL', target: 'ALL', urgente: false, urgent: false, datePublication: new Date().toISOString(), date: new Date().toISOString()
  });

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', target: 'ALL', urgent: false, date: new Date().toISOString() });
    setShowPanel(true);
  };

  const handleEdit = (a) => {
    setEditingAnnouncement(a);
    setFormData({ 
      ...a,
      titre: a.titre || a.title || '',
      contenu: a.contenu || a.content || '',
      cible: a.cible || a.target || 'ALL',
      urgente: a.urgente !== undefined ? a.urgente : a.urgent,
      datePublication: a.datePublication || a.date || new Date().toISOString()
    });
    setShowPanel(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette annonce ?')) {
      await remove('announcements', id);
      success('Annonce supprimée');
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = {
    ...formData,
    // Only include IDs if we're editing
    ...(editingAnnouncement && { 
      id: editingAnnouncement.id || editingAnnouncement.idAnnonce,
      idAnnonce: editingAnnouncement.idAnnonce || editingAnnouncement.id
    }),
    titre: formData.titre || formData.title,
    contenu: formData.contenu || formData.content,
    cible: formData.cible || formData.target,
    urgente: formData.urgente !== undefined ? formData.urgente : formData.urgent,
    datePublication: formData.datePublication || formData.date,
    // Legacy keep
    title: formData.titre || formData.title,
    content: formData.contenu || formData.content,
    target: formData.cible || formData.target,
    urgent: formData.urgente !== undefined ? formData.urgente : formData.urgent,
    date: formData.datePublication || formData.date
  };
  await save('annonces', data);
  setShowPanel(false);
  success(editingAnnouncement ? 'Mise à jour' : 'Publiée', 'L\'annonce est visible sur les tableaux de bord.');
};

  return (
    <>
      <div className="animate-up">
        <div className="page-hero">
          <div className="page-hero-left">
            <h2 className="page-hero-title">Communication & Annonces</h2>
            <p className="page-hero-sub">Diffusion d'informations officielles et alertes aux étudiants et enseignants</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Megaphone size={18} style={{ marginRight: '8px' }} /> Publier un Flash
          </button>
        </div>

        <div className="page-card">
          <div className="table-wrap">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '15px 20px' }}>Annonce</th>
                  <th>Cible</th>
                  <th>Priorité</th>
                  <th>Date Publication</th>
                  <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(db.annonces || db.announcements || []).map(a => {
                  const isUrgent = a.urgente !== undefined ? a.urgente : a.urgent;
                  const aTarget = a.cible || a.target;
                  const aDate = a.datePublication || a.date;
                  return (
                    <tr key={a.id || a.idAnnonce}>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.95rem' }}>{a.titre || a.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.contenu || a.content}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           {aTarget === 'ALL' || aTarget === 'tous' ? <Globe size={14} color="var(--blue-mid)" /> : <Lock size={14} color="var(--orange)" />}
                           <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{aTarget === 'ALL' || aTarget === 'tous' ? 'Tout le dépt' : aTarget}</span>
                        </div>
                      </td>
                      <td>
                        {isUrgent ? (
                          <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Bell size={10} /> URGENT
                          </span>
                        ) : (
                          <span className="badge badge-gray">Normal</span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Calendar size={12} /> {new Date(aDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(a)}><Edit size={16} /></button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(a.id || a.idAnnonce)}><Trash2 size={16} color="var(--danger)" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide Panel Overlay - Clean fixed positioning */}
      <div 
        className={`side-panel-overlay ${showPanel ? 'open' : ''}`} 
        onClick={() => setShowPanel(false)}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: showPanel ? 'flex' : 'none',
          justifyContent: 'flex-end',
          opacity: showPanel ? 1 : 0,
          transition: 'all 0.3s ease-in-out',
          pointerEvents: showPanel ? 'auto' : 'none'
        }}
      >
        <div 
          className="side-panel" 
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '500px',
            height: '100%',
            background: 'white',
            boxShadow: '-10px 0 50px rgba(0,0,0,0.2)',
            transform: showPanel ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="side-panel-header" style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="side-panel-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-dark)' }}>
              {editingAnnouncement ? 'Éditer l\'annonce' : 'Nouvelle Annonce'}
            </h3>
            <button className="modal-close" onClick={() => setShowPanel(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-3)' }}>×</button>
          </div>
          
          <div className="side-panel-body" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            <form id="annonceForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Titre de l'annonce</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value, titre: e.target.value})} 
                  required 
                  placeholder="Ex: Report de cours, Planning DS..." 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contenu détaillé</label>
                <textarea 
                  className="form-control" 
                  style={{ height: '160px', padding: '12px', resize: 'none' }} 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value, contenu: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Public Cible</label>
                <select className="form-control" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value, cible: e.target.value})}>
                  <option value="ALL">Tous (Étudiants & Enseignants)</option>
                  <option value="Étudiants">Étudiants uniquement</option>
                  <option value="Enseignants">Enseignants uniquement</option>
                  <option value="LSI">Filière LSI</option>
                  <option value="GI">Filière GI</option>
                </select>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '16px', 
                background: formData.urgent ? '#fff1f2' : 'var(--bg)', 
                borderRadius: '12px', 
                border: formData.urgent ? '1px solid #fecaca' : '1px solid var(--border)', 
                transition: 'all 0.3s' 
              }}>
                <input 
                  type="checkbox" 
                  id="urgent" 
                  checked={formData.urgent} 
                  onChange={e => setFormData({...formData, urgent: e.target.checked, urgente: e.target.checked})} 
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="urgent" style={{ fontWeight: '700', fontSize: '0.9rem', color: formData.urgent ? '#e11d48' : 'var(--text-1)', cursor: 'pointer' }}>
                  Marquer comme URGENTE (Badge rouge & Notification)
                </label>
              </div>
            </form>
          </div>

          <div className="side-panel-footer" style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="annonceForm" className="btn btn-primary" style={{ minWidth: '160px' }}>
              {editingAnnouncement ? 'Mettre à jour' : 'Diffuser l\'annonce'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnnonces;
