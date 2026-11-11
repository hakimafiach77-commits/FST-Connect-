import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  FileText, Plus, Search, Filter, Download, 
  Calendar, Clock, MapPin, User, MoreVertical, 
  ExternalLink, Trash2, CheckCircle, Clock as ClockIcon,
  ChevronRight, FilePlus, Archive, Eye, X, Save
} from 'lucide-react';

const AdminEDT = () => {
  const { db, filiereName, teacherName, groupName, roomName, moduleName, save, remove, nextId } = useData();
  const { success, info, warning } = useToast();
  
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'planning'
  const [filiereFilter, setFiliereFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Panels State ---
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [showSessionPanel, setShowSessionPanel] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  // --- Form States ---
  const [docFormData, setDocFormData] = useState({ titre: '', title: '', idFiliere: '', filiereId: '', version: '1.0', status: 'PUBLIÉ' });
  const [sessionFormData, setSessionFormData] = useState({ 
    jourNum: 1, day: 1, 
    heureDebut: '08:30', startSlot: '08:30', 
    idModule: '', moduleId: '', 
    idGroupe: '', groupId: '', 
    idEnseignant: '', teacherId: '', 
    idSalle: '', roomId: '', 
    type: 'Cours' 
  });

  // --- Documents Management Logic ---
  const filteredDocs = useMemo(() => {
    return (db.documents || []).filter(doc => {
      const matchesFiliere = !filiereFilter || (doc.idFiliere || doc.filiereId) === parseInt(filiereFilter);
      const matchesSearch = !searchTerm || (doc.titre || doc.title).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFiliere && matchesSearch;
    });
  }, [db.documents, filiereFilter, searchTerm]);

  // --- Interactive Planning Logic ---
  const [selectedDay, setSelectedDay] = useState(1);
  const days = [
    { id: 1, label: 'Lundi' }, { id: 2, label: 'Mardi' }, { id: 3, label: 'Mercredi' },
    { id: 4, label: 'Jeudi' }, { id: 5, label: 'Vendredi' }, { id: 6, label: 'Samedi' }
  ];
  const timeSlots = [
    { id: '08:30', label: '08h30 - 10h30' },
    { id: '10:30', label: '10h30 - 12h30' },
    { id: '14:30', label: '14h30 - 16h30' },
    { id: '16:30', label: '16h30 - 18h30' }
  ];

  const getSessionForSlot = (dayId, slotStart) => {
    const dayLabels = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };
    const targetDay = dayLabels[dayId];

    return db.seances.find(s => {
      // Check day - support both number and string from DB
      const sDay = s.jour || s.day || s.jourNum;
      if (sDay !== targetDay && sDay !== dayId) return false;

      if (filiereFilter) {
         const fid = parseInt(filiereFilter);
         const sFid = s.idFiliere || s.filiereId;
         if (sFid && sFid !== fid) return false;
         
         // If session has no direct filiereId, check its group
         if (!sFid) {
           const group = db.groupes.find(g => (g.id || g.idGroupe) === (s.idGroupe || s.groupId));
           if (!group || (group.idFiliere || group.filiereId) !== fid) return false;
         }
      }
      
      const sStartString = s.heureDebut || s.startSlot || '00:00';
      const sStart = parseInt(sStartString.split(':')[0]);
      const slotStartHour = parseInt(slotStart.split(':')[0]);
      return Math.abs(sStart - slotStartHour) <= 1;
    });
  };

  // --- Handlers ---
  const handleOpenDocPanel = (doc = null) => {
    if (doc) {
      setEditingDoc(doc);
      setDocFormData({ ...doc });
    } else {
      setEditingDoc(null);
      setDocFormData({ title: '', filiereId: filiereFilter || '', version: '1.0', status: 'PUBLIÉ' });
    }
    setShowDocPanel(true);
  };

  const handleOpenSessionPanel = (session = null, slotId = null) => {
    if (session) {
      setEditingSession(session);
      setSessionFormData({ ...session });
    } else {
      setEditingSession(null);
      setSessionFormData({ 
        day: selectedDay, 
        startSlot: slotId || '08:30', 
        moduleId: '', 
        groupId: '', 
        teacherId: '', 
        roomId: '', 
        type: 'Cours' 
      });
    }
    setShowSessionPanel(true);
  };

  const handleSaveDoc = (e) => {
    e.preventDefault();
    const data = {
      ...docFormData,
      id: editingDoc ? editingDoc.id : nextId('documents'),
      idFiliere: parseInt(docFormData.idFiliere || docFormData.filiereId),
      titre: docFormData.titre || docFormData.title,
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      size: '1.2 MB'
    };
    save('documents', data);
    setShowDocPanel(false);
    success(editingDoc ? 'Document mis à jour' : 'Emploi publié avec succès');
  };

  const handleSaveSession = (e) => {
    e.preventDefault();
    const data = {
      ...sessionFormData,
      id: editingSession ? editingSession.id : nextId('seances'),
      idModule: parseInt(sessionFormData.idModule || sessionFormData.moduleId),
      moduleId: parseInt(sessionFormData.idModule || sessionFormData.moduleId),
      idGroupe: parseInt(sessionFormData.idGroupe || sessionFormData.groupId),
      groupId: parseInt(sessionFormData.idGroupe || sessionFormData.groupId),
      idEnseignant: parseInt(sessionFormData.idEnseignant || sessionFormData.teacherId),
      teacherId: parseInt(sessionFormData.idEnseignant || sessionFormData.teacherId),
      idSalle: parseInt(sessionFormData.idSalle || sessionFormData.roomId),
      roomId: parseInt(sessionFormData.idSalle || sessionFormData.roomId),
      heureDebut: sessionFormData.heureDebut || sessionFormData.startSlot,
      startSlot: sessionFormData.heureDebut || sessionFormData.startSlot,
      jourNum: parseInt(sessionFormData.jourNum || sessionFormData.day),
      day: parseInt(sessionFormData.jourNum || sessionFormData.day),
      heureFin: (sessionFormData.heureDebut || sessionFormData.startSlot) === '08:30' ? '10:30' : 
               (sessionFormData.heureDebut || sessionFormData.startSlot) === '10:30' ? '12:30' : 
               (sessionFormData.heureDebut || sessionFormData.startSlot) === '14:30' ? '16:30' : '18:30'
    };
    save('seances', data);
    setShowSessionPanel(false);
    success(editingSession ? 'Séance modifiée' : 'Séance réservée avec succès');
  };

  const handleDeleteDoc = (id) => {
    if (window.confirm('Voulez-vous vraiment archiver cet emploi du temps ?')) {
      remove('documents', id);
      warning('Document archivé');
    }
  };

  const handleDownload = (title) => {
    info('Téléchargement lancé', `Préparation du fichier ${title}...`);
    setTimeout(() => success('Fichier prêt', 'Le téléchargement a commencé.'), 1500);
  };

  const handlePreview = (title) => {
    info('Ouverture de l\'aperçu', `Chargement du document : ${title}`);
  };

  return (
    <div className="page-content">
      {/* Header Section */}
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Gestion des Emplois du Temps</h2>
          <p className="page-hero-sub">Publication des documents officiels et planification des ressources</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {activeTab === 'documents' ? (
            <button className="btn btn-primary" onClick={() => handleOpenDocPanel()}>
              <FilePlus size={18} style={{ marginRight: '8px' }} /> Publier un Emploi
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => handleOpenSessionPanel()}>
              <Plus size={18} style={{ marginRight: '8px' }} /> Nouvelle Séance
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px', gap: '32px' }}>
        <button 
          onClick={() => setActiveTab('documents')}
          style={{ 
            padding: '12px 4px', background: 'none', border: 'none', fontSize: '0.95rem', 
            fontWeight: activeTab === 'documents' ? '800' : '600',
            color: activeTab === 'documents' ? 'var(--blue-mid)' : 'var(--text-3)',
            borderBottom: activeTab === 'documents' ? '3px solid var(--blue-mid)' : '3px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Documents Officiels
        </button>
        <button 
          onClick={() => setActiveTab('planning')}
          style={{ 
            padding: '12px 4px', background: 'none', border: 'none', fontSize: '0.95rem', 
            fontWeight: activeTab === 'planning' ? '800' : '600',
            color: activeTab === 'planning' ? 'var(--blue-mid)' : 'var(--text-3)',
            borderBottom: activeTab === 'planning' ? '3px solid var(--blue-mid)' : '3px solid transparent',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Planificateur Interactif
        </button>
      </div>

      {/* Filters Bar */}
      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par titre ou mot-clé..." 
            className="form-control"
            style={{ paddingLeft: '40px', width: '100%' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-3)" />
          <select 
            className="form-control" 
            style={{ width: '220px' }}
            value={filiereFilter}
            onChange={e => setFiliereFilter(e.target.value)}
          >
            <option value="">Toutes les Filières</option>
            {db.filieres.map(f => <option key={f.id} value={f.id}>{f.code} - {f.name}</option>)}
          </select>
        </div>
      </div>

      {activeTab === 'documents' ? (
        /* DOCUMENT VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredDocs.map((doc, idx) => (
            <div key={doc.id} className="doc-card animate-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="doc-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="doc-icon-wrapper">
                    <FileText size={24} />
                  </div>
                  <div className={`status-badge ${doc.status === 'PUBLIÉ' ? 'success' : 'draft'}`}>
                    {doc.status}
                  </div>
                </div>
                
                <h3 className="doc-title">{doc.titre || doc.title}</h3>
                <div className="doc-meta">
                  <span className="doc-filiere">{filiereName(doc.idFiliere || doc.filiereId)}</span>
                  <span className="doc-dot">•</span>
                  <span>v{doc.version}</span>
                </div>

                <div className="doc-details">
                  <div className="doc-detail-item">
                    <ClockIcon size={14} /> <span>Mis à jour le {doc.date}</span>
                  </div>
                  <div className="doc-detail-item">
                    <User size={14} /> <span>Par {doc.author}</span>
                  </div>
                </div>
              </div>
              
              <div className="doc-card-footer">
                <button className="doc-action-btn primary" title="Visualiser" onClick={() => handlePreview(doc.title)}>
                  <Eye size={18} /> Aperçu
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="doc-action-btn" title="Télécharger PDF" onClick={() => handleDownload(doc.title)}>
                    <Download size={18} />
                  </button>
                  <button className="doc-action-btn danger" title="Archiver" onClick={() => handleDeleteDoc(doc.id)}>
                    <Archive size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', py: '60px', color: 'var(--text-3)' }}>Aucun document trouvé.</div>}
        </div>
      ) : (
        /* PLANNING VIEW */
        <div className="planning-container animate-up">
           <div style={{ display: 'flex', background: 'var(--surface)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
              {days.map(day => (
                <button 
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  style={{ 
                    flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800',
                    background: selectedDay === day.id ? 'var(--blue-mid)' : 'transparent',
                    color: selectedDay === day.id ? 'white' : 'var(--text-2)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {day.label}
                </button>
              ))}
           </div>

           <div className="page-card" style={{ padding: 0, overflow: 'hidden' }}>
             <table className="planning-table">
               <thead>
                 <tr>
                   <th style={{ width: '160px' }}>Horaire</th>
                   <th>Module & Groupe</th>
                   <th>Intervenant</th>
                   <th>Espace</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {timeSlots.map(slot => {
                   const session = getSessionForSlot(selectedDay, slot.id);
                   return (
                     <tr key={slot.id} className={session ? 'has-session' : 'is-empty'}>
                       <td>
                         <div className="slot-time">
                           <Clock size={14} /> {slot.label}
                         </div>
                       </td>
                       <td>
                         {session ? (
                           <div className="session-info">
                             <div className="session-module">{moduleName(session.idModule || session.moduleId)}</div>
                             <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                               <span className="badge badge-blue">{session.type}</span>
                               <span className="badge badge-gray">{groupName(session.idGroupe || session.groupId)}</span>
                             </div>
                           </div>
                         ) : <span className="empty-text">Créneau disponible</span>}
                       </td>
                       <td>
                         {session && (
                           <div className="session-teacher">
                             <User size={14} /> {teacherName(session.idEnseignant || session.teacherId)}
                           </div>
                         )}
                       </td>
                       <td>
                         {session && (
                           <div className="session-room">
                             <MapPin size={14} /> {roomName(session.idSalle || session.roomId)}
                           </div>
                         )}
                       </td>
                       <td style={{ textAlign: 'right' }}>
                          <button 
                            className={`btn btn-sm ${session ? 'btn-ghost' : 'btn-primary'}`} 
                            style={!session ? { fontSize: '0.7rem' } : {}}
                            onClick={() => handleOpenSessionPanel(session, slot.id)}
                          >
                             {session ? 'Modifier' : 'Réserver'}
                          </button>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Side Panel: Document Publish/Edit */}
      <div className={`side-panel-overlay ${showDocPanel ? 'open' : ''}`} onClick={() => setShowDocPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingDoc ? 'Mettre à jour l\'emploi' : 'Publier un emploi'}</h3>
            <button className="modal-close" onClick={() => setShowDocPanel(false)}><X size={20} /></button>
          </div>
          <div className="side-panel-body">
            <form id="docForm" onSubmit={handleSaveDoc} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Titre du document *</label>
                <input type="text" className="form-control" value={docFormData.title} onChange={e => setDocFormData({...docFormData, title: e.target.value})} required placeholder="Ex: Emploi du Temps LSI - S2" />
              </div>
              <div className="form-group">
                <label className="form-label">Filière concernée *</label>
                <select className="form-control" value={docFormData.filiereId} onChange={e => setDocFormData({...docFormData, filiereId: e.target.value})} required>
                  <option value="">Choisir...</option>
                  {db.filieres.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Version</label>
                  <input type="text" className="form-control" value={docFormData.version} onChange={e => setDocFormData({...docFormData, version: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select className="form-control" value={docFormData.status} onChange={e => setDocFormData({...docFormData, status: e.target.value})}>
                    <option value="PUBLIÉ">Publié</option>
                    <option value="BROUILLON">Brouillon</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowDocPanel(false)}>Annuler</button>
            <button type="submit" form="docForm" className="btn btn-primary"><Save size={18} style={{marginRight:'8px'}} /> Enregistrer</button>
          </div>
        </div>
      </div>

      {/* Side Panel: Session Planning */}
      <div className={`side-panel-overlay ${showSessionPanel ? 'open' : ''}`} onClick={() => setShowSessionPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingSession ? 'Modifier la séance' : 'Réserver un créneau'}</h3>
            <button className="modal-close" onClick={() => setShowSessionPanel(false)}><X size={20} /></button>
          </div>
          <div className="side-panel-body">
            <form id="sessionForm" onSubmit={handleSaveSession} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Jour</label>
                  <select className="form-control" value={sessionFormData.day} onChange={e => setSessionFormData({...sessionFormData, day: parseInt(e.target.value)})}>
                    {days.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Heure de début</label>
                  <select className="form-control" value={sessionFormData.startSlot} onChange={e => setSessionFormData({...sessionFormData, startSlot: e.target.value})}>
                    {timeSlots.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Module *</label>
                <select className="form-control" value={sessionFormData.idModule || sessionFormData.moduleId || ''} onChange={e => setSessionFormData({...sessionFormData, idModule: e.target.value, moduleId: e.target.value})} required>
                  <option value="">Sélectionner le module...</option>
                  {db.modules.map(m => <option key={m.id} value={m.id}>{m.intitule || m.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Groupe d'étudiants *</label>
                <select className="form-control" value={sessionFormData.idGroupe || sessionFormData.groupId || ''} onChange={e => setSessionFormData({...sessionFormData, idGroupe: e.target.value, groupId: e.target.value})} required>
                  <option value="">Sélectionner le groupe...</option>
                  {(db.groupes || db.groups || []).map(g => (
                    <option key={g.id} value={g.id}>{g.nom || g.name} ({filiereName(g.idFiliere || g.filiereId)})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Enseignant responsable *</label>
                <select className="form-control" value={sessionFormData.idEnseignant || sessionFormData.teacherId || ''} onChange={e => setSessionFormData({...sessionFormData, idEnseignant: e.target.value, teacherId: e.target.value})} required>
                  <option value="">Sélectionner le professeur...</option>
                  {(db.enseignants || db.teachers || []).map(t => {
                    const user = db.utilisateurs?.find(u => u.id === t.utilisateurId) || t;
                    const name = user.prenom ? `${user.prenom} ${user.nom}` : (user.name || user.nom);
                    return <option key={t.id} value={t.id}>{name}</option>
                  })}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Salle / Espace *</label>
                  <select className="form-control" value={sessionFormData.roomId} onChange={e => setSessionFormData({...sessionFormData, roomId: e.target.value})} required>
                    <option value="">Choisir...</option>
                    {db.rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type de séance</label>
                  <select className="form-control" value={sessionFormData.type} onChange={e => setSessionFormData({...sessionFormData, type: e.target.value})}>
                    <option value="Cours">Cours Magistral</option>
                    <option value="TD">Travaux Dirigés</option>
                    <option value="TP">Travaux Pratiques</option>
                    <option value="Examen">Examen / DS</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowSessionPanel(false)}>Annuler</button>
            <button type="submit" form="sessionForm" className="btn btn-primary"><CheckCircle size={18} style={{marginRight:'8px'}} /> Valider la séance</button>
          </div>
        </div>
      </div>

      <style>{`
        .doc-card { background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: all 0.3s ease; display: flex; flexDirection: column; overflow: hidden; }
        .doc-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(30,58,95,0.1); border-color: var(--blue-mid); }
        .doc-card-body { padding: 24px; flex: 1; }
        .doc-icon-wrapper { width: 48px; height: 48px; background: rgba(30,58,95,0.05); color: var(--blue-mid); display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; }
        .status-badge.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .status-badge.draft { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
        .doc-title { font-size: 1.1rem; font-weight: 800; color: var(--blue-dark); margin: 0 0 8px 0; line-height: 1.4; }
        .doc-meta { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-3); font-weight: 700; margin-bottom: 20px; }
        .doc-filiere { color: var(--blue-mid); background: rgba(30,58,95,0.05); padding: 2px 8px; border-radius: 4px; }
        .doc-details { display: flex; flex-direction: column; gap: 8px; }
        .doc-detail-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-2); }
        .doc-card-footer { padding: 16px 24px; background: var(--bg); border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .doc-action-btn { padding: 8px; border-radius: 8px; border: 1px solid var(--border); background: white; color: var(--text-2); cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
        .doc-action-btn:hover { background: var(--surface-2); color: var(--blue-mid); }
        .doc-action-btn.primary { background: var(--blue-mid); color: white; border-color: var(--blue-mid); }
        .doc-action-btn.primary:hover { background: var(--blue-dark); }
        .doc-action-btn.danger:hover { color: var(--danger); border-color: var(--danger); }
        .planning-table { width: 100%; border-collapse: collapse; }
        .planning-table th { padding: 16px 24px; text-align: left; font-size: 0.75rem; color: var(--text-3); text-transform: uppercase; background: var(--surface-2); border-bottom: 1px solid var(--border); }
        .planning-table td { padding: 20px 24px; border-bottom: 1px solid var(--border); }
        .planning-table tr.has-session { background: white; }
        .planning-table tr.is-empty { background: rgba(0,0,0,0.01); }
        .slot-time { display: flex; align-items: center; gap: 8px; font-weight: 800; color: var(--blue-mid); font-size: 0.9rem; }
        .session-module { font-weight: 800; color: var(--blue-dark); font-size: 0.95rem; }
        .session-teacher, .session-room { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-2); font-weight: 600; }
        .empty-text { font-style: italic; color: var(--text-3); font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default AdminEDT;
