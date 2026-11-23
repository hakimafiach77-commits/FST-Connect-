import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { Search, Plus, User, Mail, Filter, Edit, Trash2, ChevronRight, Hash, Download, Folder, FileText, ChevronLeft, GraduationCap } from 'lucide-react';

const AdminEtudiants = () => {
  const { db, filiereName, groupName, save, remove, nextId } = useData();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [search, setSearch] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  
  // Navigation State
  const [selectedFiliereId, setSelectedFiliereId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Form State
  const students = useMemo(() => db.etudiants || [], [db.etudiants]);
  const filieres = useMemo(() => db.filieres || [], [db.filieres]);
  const groups = useMemo(() => db.groupes || [], [db.groupes]);
  const users = useMemo(() => db.utilisateurs || [], [db.utilisateurs]);

  const studentsWithNames = useMemo(() => {
    return students.map(s => {
      const u = users.find(user => user.id === s.utilisateurId);
      // Ensure we have nom/prenom available for the edit form
      return { 
        ...s, 
        nom: u?.nom || s.nom || '',
        prenom: u?.prenom || s.prenom || '',
        name: u ? `${u.prenom} ${u.nom}` : (s.name || s.nom ? `${s.prenom || ''} ${s.nom || ''}`.trim() : '—'),
        email: u?.email || s.email || '—',
        anneeInscription: s.anneeInscription || 1
      };
    });
  }, [students, users]);

  const [formData, setFormData] = useState({
    cne: '', nom: '', prenom: '', email: '', idFiliere: '', idGroupeTD: '', idGroupeTP: '', anneeInscription: 1, statut: 'ACTIF'
  });

  const filteredStudents = useMemo(() => {
    return studentsWithNames.filter(s => {
      const fullName = (s.name || '').toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase()) || 
                           (s.cne && s.cne.toLowerCase().includes(search.toLowerCase()));
      const matchesFiliere = selectedFiliereId ? (parseInt(s.idFiliere) === parseInt(selectedFiliereId)) : true;
      const matchesYear = selectedYear ? (parseInt(s.anneeInscription) === parseInt(selectedYear)) : true;
      return matchesSearch && matchesFiliere && matchesYear;
    });
  }, [studentsWithNames, search, selectedFiliereId, selectedYear]);

  const filiereClasses = useMemo(() => {
    if (selectedFiliereId) {
      const filiere = db.filieres.find(f => (f.idFiliere || f.id) === parseInt(selectedFiliereId));
      if (!filiere) return [];
      const years = [];
      for (let i = 1; i <= (filiere.duree || 3); i++) {
        const count = studentsWithNames.filter(s => parseInt(s.idFiliere) === parseInt(selectedFiliereId) && parseInt(s.anneeInscription) === i).length;
        years.push({ year: i, count });
      }
      return years;
    }
    return db.filieres.map(f => ({
      ...f,
      id: f.idFiliere || f.id,
      count: studentsWithNames.filter(s => parseInt(s.idFiliere) === parseInt(f.idFiliere || f.id)).length
    }));
  }, [db.filieres, studentsWithNames, selectedFiliereId]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({ 
      cne: '', nom: '', prenom: '', email: '', 
      idFiliere: selectedFiliereId || '', 
      anneeInscription: selectedYear || 1,
      statut: 'ACTIF' 
    });
    setShowPanel(true);
  };

  const handleEdit = (student) => {
    // Explicitly find the user to get current up-to-date info
    const user = db.utilisateurs.find(u => u.id === student.utilisateurId) || {};
    
    setEditingStudent(student);
    setFormData({ 
      ...student, 
      idEtudiant: student.idEtudiant || student.id,
      idFiliere: student.idFiliere || student.filiereId || '',
      nom: user.nom || student.nom || '', 
      prenom: user.prenom || student.prenom || '',
      email: user.email || student.email || '',
      anneeInscription: student.anneeInscription || 1,
      statut: student.statut || 'ACTIF'
    });
    setShowPanel(true);
  };

  const handleDelete = (id) => {
    const hasAbsences = db.absences.some(a => parseInt(a.idEtudiant) === parseInt(id));
    const hasGrades = db.notes.some(g => parseInt(g.idEtudiant) === parseInt(id));
    if (hasAbsences || hasGrades) {
      error('Interdit', 'Cet étudiant possède des données liées (absences/notes) et ne peut être supprimé.');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet étudiant ?')) {
      remove('etudiants', id);
      success('Supprimé', 'Le dossier étudiant a été supprimé.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.cne || !formData.idFiliere) {
      error('Manquant', 'Veuillez remplir les informations obligatoires.');
      return;
    }

    const userId = editingStudent?.utilisateurId || nextId('utilisateurs');
    const studentId = editingStudent ? (editingStudent.idEtudiant || editingStudent.id) : nextId('etudiants');

    const studentData = {
      id: studentId,
      idEtudiant: studentId,
      utilisateurId: userId,
      cne: formData.cne || formData.CNE,
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      idFiliere: formData.idFiliere ? parseInt(formData.idFiliere) : null,
      anneeInscription: parseInt(formData.anneeInscription || 1),
      statut: formData.statut || 'ACTIF'
    };

    try {
      await save('etudiants', studentData);
      success(editingStudent ? 'Mis à jour' : 'Inscrit', 'Le dossier de l\'étudiant est à jour.');
      setShowPanel(false);
    } catch (err) {
      error('Erreur', err.message || 'Impossible d\'enregistrer l\'étudiant.');
    }
  };

  const statusBadge = (s) => {
    const map = { 'ACTIF': 'badge-green', 'REDOUBLANT': 'badge-orange', 'DIPLOME': 'badge-blue', 'ABANDONNE': 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  return (
    <>
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Registre National des Étudiants</h2>
          <p className="page-hero-sub">Base de données centrale et gestion des dossiers académiques</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
             <Download size={16} style={{ marginRight: '8px' }} /> Exporter Registre
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Nouvelle Inscription
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: '600' }}>
        <span 
          style={{ cursor: 'pointer', opacity: selectedFiliereId ? 0.6 : 1 }} 
          onClick={() => { setSelectedFiliereId(null); setSelectedYear(null); }}
        >
          Registre
        </span>
        {selectedFiliereId && (
          <>
            <ChevronRight size={14} />
            <span 
              style={{ cursor: 'pointer', opacity: selectedYear ? 0.6 : 1 }}
              onClick={() => setSelectedYear(null)}
            >
              {filiereName(selectedFiliereId)}
            </span>
          </>
        )}
        {selectedYear && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--blue-mid)' }}>ANNÉE {selectedYear}</span>
          </>
        )}
      </div>

      {!selectedYear ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
           {filiereClasses.map((item, i) => (
             <div 
               key={i} 
               className="page-card animate-up" 
               style={{ 
                 padding: '24px', 
                 cursor: 'pointer', 
                 transition: 'all 0.2s',
                 animationDelay: `${i * 0.05}s`,
                 display: 'flex',
                 flexDirection: 'column',
                 gap: '16px',
                 border: '1px solid var(--border)'
               }}
               onClick={() => {
                 if (!selectedFiliereId) setSelectedFiliereId(item.id);
                 else setSelectedYear(item.year);
               }}
               onMouseOver={e => e.currentTarget.style.borderColor = 'var(--blue-mid)'}
               onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '12px', color: 'var(--blue-mid)' }}>
                      {!selectedFiliereId ? <Folder size={32} /> : <FileText size={32} />}
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--blue-dark)' }}>{item.count}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase' }}>Inscrits</div>
                   </div>
                </div>
                <div>
                   <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--blue-dark)', margin: 0 }}>
                      {!selectedFiliereId ? item.intitule : `Année ${item.year}`}
                   </h3>
                   {!selectedFiliereId && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '4px' }}>{item.niveauEtude || 'Formation'} • {item.duree} ans</div>}
                   {selectedFiliereId && <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '4px' }}>{filiereName(selectedFiliereId)} — Promotion 2026</div>}
                </div>
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--blue-mid)', fontSize: '0.8rem', fontWeight: '700' }}>
                   Ouvrir le registre <ChevronRight size={14} />
                </div>
             </div>
           ))}

           {!selectedFiliereId && (
             <div 
               className="page-card animate-up" 
               style={{ padding: '24px', cursor: 'pointer', background: 'transparent', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-3)' }}
               onClick={() => navigate('/filieres')}
             >
                <Plus size={20} /> <span style={{ fontWeight: '700' }}>Configurer Filières</span>
             </div>
           )}
        </div>
      ) : (
        <>
          <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input 
                type="text" 
                placeholder="Rechercher un étudiant dans cette classe..." 
                className="form-control"
                style={{ paddingLeft: '40px', width: '100%' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost" onClick={() => setSelectedYear(null)}>
               <ChevronLeft size={16} /> Retour aux années
            </button>
          </div>

      <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>CNE</th>
                <th>Candidat</th>
                <th>Cursus</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const initials = (student.name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={student.id}>
                    <td style={{ padding: '15px 20px' }}>
                       <div style={{ fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: 'var(--blue-mid)' }}>
                         {student.cne || student.CNE}
                       </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'var(--bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: 'var(--blue-dark)', border: '1px solid var(--border)' }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{student.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-2)' }}>{filiereName(student.idFiliere || student.filiereId)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Inscrit en A{student.anneeInscription || '25'}</div>
                    </td>
                    <td>{statusBadge(student.statut)}</td>
                    <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(student)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(student.id)}>
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr><td colSpan="5" className="table-empty">Aucun étudiant dans ce registre.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <h3 className="side-panel-title">{editingStudent ? 'Modifier Dossier' : 'Nouvelle Inscription'}</h3>
            <button className="modal-close" onClick={() => setShowPanel(false)}>×</button>
          </div>
          <div className="side-panel-body">
             <form id="studentForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">CNE (Identifiant National) *</label>
                  <input type="text" className="form-control" value={formData.cne || formData.CNE || ''} onChange={e => setFormData({...formData, cne: e.target.value, CNE: e.target.value})} required placeholder="Ex: G1345678" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input type="text" className="form-control" value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input type="text" className="form-control" value={formData.prenom || ''} onChange={e => setFormData({...formData, prenom: e.target.value})} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Étudiant (@etu.uae.ac.ma)</label>
                  <input type="email" className="form-control" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="form-group">
                  <label className="form-label">Filière d'inscription *</label>
                  <select className="form-control" value={formData.idFiliere || formData.filiereId || ''} onChange={e => setFormData({...formData, idFiliere: e.target.value, filiereId: e.target.value})} required>
                    <option value="">Choisir...</option>
                    {db.filieres.map(f => <option key={f.idFiliere || f.id} value={f.idFiliere || f.id}>{f.intitule || f.nom || f.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Année d'étude *</label>
                  <select className="form-control" value={formData.anneeInscription || 1} onChange={e => setFormData({...formData, anneeInscription: e.target.value})} required>
                    <option value="1">1ère Année</option>
                    <option value="2">2ème Année</option>
                    <option value="3">3ème Année</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Statut Administratif</label>
                  <select className="form-control" value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})}>
                    <option value="ACTIF">Actif / Inscrit</option>
                    <option value="REDOUBLANT">Redoublant</option>
                    <option value="DIPLOME">Diplômé</option>
                    <option value="ABANDONNE">Abandonné</option>
                  </select>
                </div>
             </form>
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
            <button type="submit" form="studentForm" className="btn btn-primary">Valider le dossier</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminEtudiants;
