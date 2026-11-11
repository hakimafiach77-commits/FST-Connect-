import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

const Rooms = () => {
  const { db, save, remove, nextId } = useData();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showPanel, setShowPanel] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Cours',
    capacity: 40,
    equipment: '', // comma separated string for the textarea
    statut: 'Disponible'
  });

  const filteredRooms = db.rooms.filter(r => {
    const rawStatus = r.statut || 'Disponible';
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id) => {
    const hasSessions = db.sessions.some(s => s.roomId === id);
    if (hasSessions) {
      error('Erreur', 'Impossible de supprimer une salle assignée à des séances.');
      return;
    }
    if (window.confirm('Voulez-vous vraiment supprimer cette salle ?')) {
      remove('rooms', id);
      success('Supprimée', 'Salle supprimée avec succès.');
    }
  };

  const toggleStatus = (room) => {
    const newStatus = (room.statut || 'Disponible') === 'Disponible' ? 'Hors service' : 'Disponible';
    if (newStatus === 'Hors service') {
      if (!window.confirm(`Voulez-vous vraiment mettre "${room.name}" hors service ?`)) return;
    }
    save('rooms', { ...room, statut: newStatus });
    success('Mise à jour', `Le statut de la salle est passé à ${newStatus}.`);
  };

  const openAdd = () => {
    setEditingRoom(null);
    setFormData({ name: '', type: 'Cours', capacity: 40, equipment: '', statut: 'Disponible' });
    setShowPanel(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      ...room,
      equipment: Array.isArray(room.equipment) ? room.equipment.join(', ') : (room.equipment || ''),
      statut: room.statut || 'Disponible'
    });
    setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false);
    setEditingRoom(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      error('Erreur', 'Veuillez saisir un nom pour la salle.');
      return;
    }

    const equipmentArray = formData.equipment.split(',').map(item => item.trim()).filter(item => item.length > 0);

    const roomToSave = {
      ...formData,
      // Only include ID if we're editing
      ...(editingRoom && { id: editingRoom.id, idSalle: editingRoom.idSalle }),
      equipment: equipmentArray,
      capacity: parseInt(formData.capacity) || 0
    };

    save('rooms', roomToSave);
    success(editingRoom ? 'Modifiée' : 'Ajoutée', editingRoom ? 'Salle mise à jour avec succès.' : 'Nouvelle salle ajoutée.');
    closePanel();
  };

  return (
    <div className="page-area" style={{ position: 'relative', overflowX: 'hidden' }}>
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Salles & Ressources</h2>
          <p className="page-hero-sub">Gestion des infrastructures et de leurs équipements</p>
        </div>
        <div className="page-hero-right">
          <div style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Rechercher une salle..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', width: '250px' }}
            />
          </div>
          <select 
             value={filterType} 
             onChange={e => setFilterType(e.target.value)}
             style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
          >
            <option value="ALL">Tous les types</option>
            <option value="Cours">Cours</option>
            <option value="TP">TP</option>
            <option value="Amphi">Amphi</option>
            <option value="Réunion">Réunion</option>
          </select>
          <button className="btn btn-primary" onClick={openAdd}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
              <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter salle
          </button>
        </div>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Capacité</th>
                <th>Équipements</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(room => {
                const status = room.statut || 'Disponible';
                return (
                  <tr key={room.id} style={{ opacity: status === 'Hors service' ? 0.6 : 1 }}>
                    <td style={{ fontWeight: '600', color: 'var(--blue-dark)' }}>{room.name}</td>
                    <td><span className={`badge ${room.type === 'TP' ? 'badge-orange' : room.type === 'Amphi' ? 'badge-blue' : 'badge-gray'}`}>{room.type}</span></td>
                    <td>{room.capacity} places</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                        {Array.isArray(room.equipment) ? room.equipment.join(' • ') : room.equipment}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status === 'Disponible' ? 'badge-green' : 'badge-red'}`}>
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        title="Mettre hors service / Disponible" 
                        onClick={() => toggleStatus(room)} 
                        style={{ marginRight: '4px' }}
                      >
                        {status === 'Disponible' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--danger)' }}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        )}
                      </button>
                      <button className="btn btn-ghost btn-sm" title="Modifier" onClick={() => openEdit(room)} style={{ marginRight: '4px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn btn-ghost btn-sm" title="Supprimer" onClick={() => handleDelete(room.id)} style={{ color: 'var(--danger)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRooms.length === 0 && (
                <tr><td colSpan="6" className="table-empty">Aucune salle trouvée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Panel */}
      <div 
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '380px', backgroundColor: '#fff',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
          transform: showPanel ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1000,
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{editingRoom ? 'Modifier Salle' : 'Ajouter Salle'}</h3>
          <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <form id="roomForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Nom / Identifiant *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} placeholder="Ex: Amphi A, Labo Info 1" />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <option value="Cours">Cours</option>
                  <option value="TP">TP</option>
                  <option value="Amphi">Amphi</option>
                  <option value="Réunion">Réunion</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Capacité</label>
                <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem' }}>Équipements (séparés par des virgules)</label>
              <textarea 
                value={formData.equipment} 
                onChange={e => setFormData({...formData, equipment: e.target.value})} 
                rows="3" 
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', resize: 'vertical' }}
                placeholder="Projecteur, Tableau blanc, 30 PC..."
              ></textarea>
            </div>
          </form>
        </div>
        
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={closePanel}>Annuler</button>
          <button type="submit" form="roomForm" className="btn btn-primary">
            {editingRoom ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
      
      {showPanel && (
        <div onClick={closePanel} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 999 }} />
      )}
    </div>
  );
};

export default Rooms;
