import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Search, Plus, MapPin, Users, Settings, Edit, Trash2, Power } from 'lucide-react';

const AdminSalles = () => {
  const { db, save, remove, nextId } = useData();
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showPanel, setShowPanel] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    nom: '', name: '',
    typeSalle: 'Cours', type: 'Cours',
    capacite: 40, capacity: 40,
    equipements: '', equipment: '', 
    statut: 'Disponible'
  });

  const filteredRooms = (db.salles || db.rooms || []).filter(r => {
    const rName = r.nom || r.name || '';
    const rType = r.typeSalle || r.type || '';
    const matchesSearch = rName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || rType === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id) => {
    const sessionsList = db.seances || db.sessions || [];
    const hasSessions = sessionsList.some(s => (s.idSalle || s.roomId) === id);
    if (hasSessions) {
      error('Erreur', 'Impossible de supprimer une salle assignée à des séances.');
      return;
    }
    if (window.confirm('Voulez-vous vraiment supprimer cette salle ?')) {
      remove('salles', id);
      success('Supprimée', 'Salle supprimée avec succès.');
    }
  };

  const toggleStatus = (room) => {
    const newStatus = (room.statut || 'Disponible') === 'Disponible' ? 'Hors service' : 'Disponible';
    save('salles', { ...room, statut: newStatus });
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
    const finalNom = formData.nom || formData.name;
    if (!finalNom) {
      error('Erreur', 'Veuillez saisir un nom pour la salle.');
      return;
    }

    const equipmentStr = formData.equipements || formData.equipment || '';
    const equipmentArray = equipmentStr.split(',').map(item => item.trim()).filter(item => item.length > 0);
    const roomToSave = {
      ...formData,
      nom: finalNom,
      name: finalNom,
      typeSalle: formData.typeSalle || formData.type,
      type: formData.typeSalle || formData.type,
      capacite: parseInt(formData.capacite || formData.capacity) || 0,
      capacity: parseInt(formData.capacite || formData.capacity) || 0,
      equipements: equipmentArray,
      equipment: equipmentArray
    };

    if (editingRoom) {
      save('salles', { ...editingRoom, ...roomToSave });
      success('Modifiée', 'Salle mise à jour avec succès.');
    } else {
      save('salles', { id: nextId('salles'), ...roomToSave });
      success('Ajoutée', 'Nouvelle salle ajoutée.');
    }
    closePanel();
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Infrastructures & Salles</h2>
          <p className="page-hero-sub">Gestion du catalogue des salles, amphis et laboratoires</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Ajouter une salle
          </button>
        </div>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', background: 'var(--surface)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom..." 
            className="form-control"
            style={{ paddingLeft: '40px', width: '100%' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
           className="form-control"
           style={{ width: '200px' }}
           value={filterType} 
           onChange={e => setFilterType(e.target.value)}
        >
          <option value="ALL">Tous les types</option>
          <option value="Cours">Salles de Cours</option>
          <option value="TP">Laboratoires TP</option>
          <option value="Amphi">Amphithéâtres</option>
          <option value="Réunion">Salles de Réunion</option>
        </select>
      </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Salle</th>
                <th>Type</th>
                <th>Capacité</th>
                <th>Équipements</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(room => {
                const status = room.statut || 'Disponible';
                const rType = room.typeSalle || room.type;
                const rCap = room.capacite || room.capacity;
                const rEquip = room.equipements || room.equipment;
                return (
                  <tr key={room.id} style={{ opacity: status === 'Hors service' ? 0.7 : 1 }}>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--blue-mid)' }}>
                          <MapPin size={20} style={{ margin: 'auto' }} />
                        </div>
                        <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{room.nom || room.name}</div>
                      </div>
                    </td>
                    <td>
                       <span className={`badge ${rType === 'TP' ? 'badge-orange' : rType === 'Amphi' ? 'badge-blue' : 'badge-gray'}`}>{rType}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)', fontWeight: '600' }}>
                        <Users size={14} /> {rCap} places
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {Array.isArray(rEquip) ? rEquip.map((eq, i) => (
                           <span key={i} style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px' }}>{eq}</span>
                        )) : <span style={{ fontStyle: 'italic' }}>Aucun</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status === 'Disponible' ? 'badge-green' : 'badge-red'}`}>
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" title="Statut" onClick={() => toggleStatus(room)}>
                            <Power size={16} color={status === 'Disponible' ? 'var(--danger)' : 'var(--success)'} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Modifier" onClick={() => openEdit(room)}>
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Supprimer" onClick={() => handleDelete(room.id)}>
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
        onClick={closePanel}
      >
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingRoom ? 'Modifier la salle' : 'Ajouter une salle'}</h3>
            <button className="modal-close" onClick={closePanel}>×</button>
          </div>
          
          <div className="side-panel-body">
            <form id="roomForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nom de la salle / Code</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex: Salle 102, Labo Info B" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Type d'espace</label>
                  <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Cours">Salle de Cours</option>
                    <option value="TP">Laboratoire TP</option>
                    <option value="Amphi">Amphithéâtre</option>
                    <option value="Réunion">Salle de Réunion</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacité (Places)</label>
                  <input type="number" className="form-control" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Équipements (séparés par des virgules)</label>
                <textarea 
                  className="form-control"
                  style={{ height: '100px' }}
                  value={formData.equipment} 
                  onChange={e => setFormData({...formData, equipment: e.target.value})} 
                  placeholder="Ex: Projecteur, Windows PCs, Tableau interactif..."
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Statut opérationnel</label>
                <select className="form-control" value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})}>
                  <option value="Disponible">Disponible / En service</option>
                  <option value="Hors service">Hors service / Maintenance</option>
                </select>
              </div>
            </form>
          </div>
          
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={closePanel}>Annuler</button>
            <button type="submit" form="roomForm" className="btn btn-primary" style={{ minWidth: '140px' }}>
              {editingRoom ? 'Enregistrer' : 'Créer la salle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSalles;
