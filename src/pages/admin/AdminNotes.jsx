import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  FileText, Search, Download, Filter, GraduationCap, 
  AlertCircle, X, Save, Edit3, CheckCircle, ChevronRight,
  TrendingUp, TrendingDown, Minus, ArrowLeft, BookOpen, Layers, Users,
  ChevronLeft
} from 'lucide-react';

const AdminNotes = () => {
  const { db, studentName, filiereName, moduleName, save, groupName } = useData();
  const { success, info } = useToast();
  
  const [viewLevel, setViewLevel] = useState('filieres'); // 'filieres', 'modules', 'grades'
  const [selectedFiliereId, setSelectedFiliereId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [showPanel, setShowPanel] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [formData, setFormData] = useState({ cc: '', exam: '', final: '' });

  // --- 1. Data Selection Logic ---

  const filieres = useMemo(() => db.filieres || [], [db.filieres]);

  const modulesForFiliere = useMemo(() => {
    if (!selectedFiliereId) return [];
    const fid = String(selectedFiliereId);
    return (db.modules || []).filter(m => String(m.idFiliere || m.filiereId) === fid);
  }, [db.modules, selectedFiliereId]);

  const availableGroups = useMemo(() => {
    if (!selectedFiliereId) return [];
    return (db.groupes || []).filter(g => String(g.idFiliere) === String(selectedFiliereId));
  }, [db.groupes, selectedFiliereId]);

  const fullTableData = useMemo(() => {
    if (!selectedFiliereId || !selectedModuleId) return [];
    
    const fid = String(selectedFiliereId);
    const mid = String(selectedModuleId);
    
    let students = (db.etudiants || []).filter(s => String(s.idFiliere || s.filiereId) === fid);
    
    // Apply Group Filter
    if (groupFilter !== 'ALL') {
      students = students.filter(s => 
        String(s.idGroupeTD) === groupFilter || String(s.idGroupeTP) === groupFilter
      );
    }

    return students.map(s => {
      const sid = s.id || s.idEtudiant;
      const grade = (db.notes || []).find(g => 
        String(g.idEtudiant || g.studentId) === String(sid) && 
        String(g.idModule || g.moduleId) === mid
      );
      
      return {
        student: s,
        grade: grade || { 
          idEtudiant: sid, 
          idModule: parseInt(mid), 
          valeurCC: 0, 
          valeurEF: 0, 
          moyenneModule: 0,
          isPlaceholder: true 
        }
      };
    });
  }, [db.etudiants, db.notes, selectedFiliereId, selectedModuleId, groupFilter]);

  // Paginated View
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return fullTableData.slice(start, start + itemsPerPage);
  }, [fullTableData, currentPage]);

  const totalPages = Math.ceil(fullTableData.length / itemsPerPage);

  // Global search mode
  const searchResults = useMemo(() => {
    if (!search) return [];
    const term = search.toLowerCase();
    return (db.notes || []).filter(g => {
      const sId = g.idEtudiant || g.studentId;
      const s = (db.etudiants || []).find(st => String(st.id || st.idEtudiant) === String(sId));
      const u = (db.utilisateurs || []).find(user => user.id === s?.utilisateurId);
      const name = u ? `${u.prenom} ${u.nom}`.toLowerCase() : (s?.name || '').toLowerCase();
      return name.includes(term) || (s?.cne || '').toLowerCase().includes(term);
    }).slice(0, 30);
  }, [db.notes, db.etudiants, db.utilisateurs, search]);

  // --- 2. Handlers ---

  const handleSelectFiliere = (id) => {
    setSelectedFiliereId(id);
    setViewLevel('modules');
    setGroupFilter('ALL');
  };

  const handleSelectModule = (id) => {
    setSelectedModuleId(id);
    setViewLevel('grades');
    setCurrentPage(1);
  };

  const resetAll = () => {
    setViewLevel('filieres');
    setSelectedFiliereId(null);
    setSelectedModuleId(null);
    setSearch('');
    setCurrentPage(1);
  };

  const handleOpenEdit = (item) => {
    const g = item.grade || item;
    setSelectedGrade(g);
    setFormData({
      cc: g.valeurCC || g.cc || 0,
      exam: g.valeurEF || g.exam || 0,
      final: g.moyenneModule || g.moyenne || g.final || 0
    });
    setShowPanel(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await save('notes', {
      ...selectedGrade,
      valeurCC: parseFloat(formData.cc),
      valeurEF: parseFloat(formData.exam),
      moyenneModule: parseFloat(formData.final),
      moyenne: parseFloat(formData.final)
    });
    setShowPanel(false);
    success('Enregistré');
  };

  // --- 3. UI Parts ---

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
        <button className="btn btn-ghost btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
          <ChevronLeft size={16} /> Précédent
        </button>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-3)' }}>
          Page {currentPage} sur {totalPages}
        </span>
        <button className="btn btn-ghost btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
          Suivant <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Notes & Examens</h2>
          <p className="page-hero-sub">Saisie et délibération par module</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
           <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
           <input type="text" className="form-control" style={{ paddingLeft: '40px' }} placeholder="Recherche rapide..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-3)' }}>
        <button onClick={resetAll} className="btn-link">Classes</button>
        {selectedFiliereId && <><ChevronRight size={14} /><button onClick={() => setViewLevel('modules')} className="btn-link">{filiereName(selectedFiliereId)}</button></>}
        {selectedModuleId && <><ChevronRight size={14} /><span style={{ fontWeight: '800', color: 'var(--blue-dark)' }}>{moduleName(selectedModuleId)}</span></>}
      </div>

      {search ? (
        <div className="animate-up">
           {/* Render search results table */}
           <div className="page-card table-wrap">
             <table style={{ width: '100%' }}>
                <thead><tr><th>Étudiant</th><th>Module</th><th>Moyenne</th><th>Action</th></tr></thead>
                <tbody>
                   {searchResults.map(g => (
                     <tr key={g.id || g.idNote} className="hover-row">
                       <td style={{ padding: '12px 20px' }}>{studentName(g.idEtudiant)}</td>
                       <td>{moduleName(g.idModule)}</td>
                       <td style={{ fontWeight: '800' }}>{parseFloat(g.moyenne || 0).toFixed(2)}</td>
                       <td style={{ textAlign: 'right' }}><button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(g)}><Edit3 size={16} /></button></td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      ) : (
        <div className="animate-up">
           {viewLevel === 'filieres' && (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {filieres.map(f => (
                  <div key={f.id || f.idFiliere} className="page-card hover-card" onClick={() => handleSelectFiliere(f.id || f.idFiliere)} style={{ cursor: 'pointer', padding: '24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Layers size={20} color="var(--blue-mid)" />
                        <span style={{ fontWeight: '900', color: 'var(--blue-dark)' }}>{f.code}</span>
                     </div>
                     <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', fontWeight: '600' }}>{f.intitule}</div>
                  </div>
                ))}
             </div>
           )}

           {viewLevel === 'modules' && (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {modulesForFiliere.map(m => (
                  <div key={m.id || m.idModule} className="page-card hover-card" onClick={() => handleSelectModule(m.id || m.idModule)} style={{ cursor: 'pointer', padding: '20px' }}>
                     <div className="badge badge-blue" style={{ marginBottom: '10px' }}>{m.code}</div>
                     <div style={{ fontWeight: '800', color: 'var(--blue-dark)' }}>{m.intitule}</div>
                  </div>
                ))}
             </div>
           )}

           {viewLevel === 'grades' && (
             <>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <Filter size={16} color="var(--text-3)" />
                     <select className="form-control" style={{ width: '180px', height: '36px', fontSize: '0.8rem' }} value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="ALL">Tous les groupes</option>
                        {availableGroups.map(g => <option key={g.idGroupe} value={g.idGroupe}>{g.nom}</option>)}
                     </select>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-3)' }}>
                     {fullTableData.length} étudiants trouvés
                  </div>
               </div>

               <div className="page-card table-wrap">
                 <table style={{ width: '100%' }}>
                    <thead>
                       <tr>
                          <th style={{ padding: '15px 20px' }}>Étudiant</th>
                          <th>CC (40%)</th>
                          <th>Exam (60%)</th>
                          <th>Moyenne</th>
                          <th>Statut</th>
                          <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       {paginatedData.map((item, idx) => {
                          const g = item.grade;
                          const moy = parseFloat(g.moyenneModule || 0);
                          const isValid = moy >= 12;
                          return (
                            <tr key={idx} className="hover-row">
                               <td style={{ padding: '12px 20px' }}>
                                  <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{studentName(g.idEtudiant)}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{item.student.cne}</div>
                               </td>
                               <td>{parseFloat(g.valeurCC || 0).toFixed(1)}</td>
                               <td>{parseFloat(g.valeurEF || 0).toFixed(1)}</td>
                               <td style={{ fontWeight: '900', color: isValid ? 'var(--success)' : 'var(--danger)' }}>{moy.toFixed(2)}</td>
                               <td><span className={`badge ${isValid ? 'badge-green' : 'badge-red'}`}>{isValid ? 'Validé' : 'Ajourné'}</span></td>
                               <td style={{ textAlign: 'right', padding: '12px 20px' }}>
                                  <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(item)}><Edit3 size={16} /></button>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
                 {fullTableData.length === 0 && <div className="table-empty">Aucun étudiant dans cette sélection.</div>}
               </div>
               <Pagination />
             </>
           )}
        </div>
      )}

      {/* Slide Panel for Editing */}
      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
          <div className="side-panel-header" style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Modifier Note</h3>
            <X size={20} onClick={() => setShowPanel(false)} style={{ cursor: 'pointer' }} />
          </div>
          <div className="side-panel-body" style={{ padding: '20px' }}>
             {selectedGrade && (
               <form onSubmit={handleSave} id="editForm">
                  <div style={{ marginBottom: '15px', fontWeight: '700', color: 'var(--blue-dark)' }}>{studentName(selectedGrade.idEtudiant)}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                     <div className="form-group">
                        <label className="form-label">Note CC</label>
                        <input type="number" step="0.25" className="form-control" value={formData.cc} onChange={e => {
                           const cc = e.target.value;
                           const res = (parseFloat(cc || 0) * 0.4 + parseFloat(formData.exam || 0) * 0.6).toFixed(2);
                           setFormData({...formData, cc, final: res});
                        }} />
                     </div>
                     <div className="form-group">
                        <label className="form-label">Note Exam</label>
                        <input type="number" step="0.25" className="form-control" value={formData.exam} onChange={e => {
                           const ex = e.target.value;
                           const res = (parseFloat(formData.cc || 0) * 0.4 + parseFloat(ex || 0) * 0.6).toFixed(2);
                           setFormData({...formData, exam: ex, final: res});
                        }} />
                     </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '20px', background: 'var(--surface-2)', borderRadius: '10px' }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: '800' }}>MOYENNE</div>
                     <div style={{ fontSize: '2rem', fontWeight: '950', color: 'var(--blue-dark)' }}>{formData.final}</div>
                  </div>
               </form>
             )}
          </div>
          <div className="side-panel-footer" style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
             <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Annuler</button>
             <button type="submit" form="editForm" className="btn btn-primary">Enregistrer</button>
          </div>
        </div>
      </div>

      <style>{`
        .btn-link { background: none; border: none; padding: 0; cursor: pointer; color: var(--text-3); font-weight: 500; font-family: inherit; }
        .btn-link:hover { text-decoration: underline; color: var(--blue-mid); }
        .hover-card:hover { transform: translateY(-2px); border-color: var(--blue-mid); }
        .side-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); z-index: 1000; opacity: 0; visibility: hidden; transition: 0.3s; }
        .side-panel-overlay.open { opacity: 1; visibility: visible; }
        .side-panel { position: absolute; right: 0; top: 0; height: 100%; background: white; width: 400px; transform: translateX(100%); transition: 0.3s; box-shadow: -5px 0 15px rgba(0,0,0,0.1); }
        .side-panel-overlay.open .side-panel { transform: translateX(0); }
      `}</style>
    </div>
  );
};

export default AdminNotes;
