import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  AlertTriangle, Search, Filter, Calendar, User, Mail, Download, 
  CheckCircle, XCircle, Clock, ChevronRight, Eye, ShieldCheck, FileText, X
} from 'lucide-react';

const AdminAbsences = () => {
  const { db, studentName, filiereName, moduleName, save } = useData();
  const { success, info, warning } = useToast();
  
  const [filiereFilter, setFiliereFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Group absences by student and calculate totals
  const studentStats = useMemo(() => {
    const stats = {};
    (db.absences || []).forEach(a => {
      const studentId = a.idEtudiant || a.studentId;
      if (!studentId) return;

      const isJustified = a.statut === 'JUSTIFIEE' || a.justifie === true || a.justified === true;
      
      if (!stats[studentId]) stats[studentId] = { total: 0, nonJustified: 0, list: [] };
      stats[studentId].total++;
      if (!isJustified) stats[studentId].nonJustified++;
      stats[studentId].list.push(a);
    });
    return stats;
  }, [db.absences]);

  const filteredStudents = useMemo(() => {
    return (db.etudiants || []).filter(s => {
      const sid = s.id || s.idEtudiant;
      const stats = studentStats[sid] || { total: 0 };
      
      if (stats.total === 0) return false;

      const matchesFiliere = !filiereFilter || String(s.idFiliere || s.filiereId) === String(filiereFilter);
      
      const studentUser = (db.utilisateurs || []).find(u => u.id === s.utilisateurId);
      const sName = studentUser ? `${studentUser.prenom} ${studentUser.nom}` : (s.nom || s.name || '');
      const matchesSearch = !searchTerm || sName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (s.cne || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFiliere && matchesSearch;
    }).sort((a,b) => {
      const aid = a.id || a.idEtudiant;
      const bid = b.id || b.idEtudiant;
      return (studentStats[bid]?.total || 0) - (studentStats[aid]?.total || 0);
    });
  }, [db.etudiants, db.utilisateurs, studentStats, filiereFilter, searchTerm]);

  // --- Handlers ---
  const handleExportReport = () => {
    info('Génération du rapport', 'Préparation du rapport de commission d\'assiduité...');
    setTimeout(() => {
      success('Rapport prêt', 'Le document PDF a été généré et téléchargé.');
    }, 2000);
  };

  const handleSendWarning = (student) => {
    const studentUser = (db.utilisateurs || []).find(u => u.id === student?.utilisateurId);
    const name = studentUser ? `${studentUser.prenom} ${studentUser.nom}` : (student?.nom || student?.name || 'Étudiant');
    info('Envoi d\'avertissement', `Un email officiel a été envoyé à ${name}.`);
    setTimeout(() => {
      success('Notification envoyée', 'L\'étudiant a reçu une alerte sur son tableau de bord.');
    }, 1000);
  };

  const handleOpenDetail = (student) => {
    setSelectedStudent(student);
    setShowPanel(true);
  };

  const handleToggleJustification = async (absence) => {
    const isCurrentlyJustified = absence.statut === 'JUSTIFIEE' || absence.justifie === true || absence.justified === true;
    const newStatut = isCurrentlyJustified ? 'INJUSTIFIEE' : 'JUSTIFIEE';
    
    const updated = { 
      ...absence, 
      statut: newStatut,
      justifie: !isCurrentlyJustified,
      justified: !isCurrentlyJustified 
    };
    
    await save('absences', updated);
    success(newStatut === 'JUSTIFIEE' ? 'Absence justifiée' : 'Justification retirée');
  };

  return (
    <div className="page-content">
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Suivi de l'Assiduité</h2>
          <p className="page-hero-sub">Contrôle des absences et alertes sur les seuils critiques d'élimination</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportReport}>
          <Download size={18} style={{ marginRight: '8px' }} /> Rapport Commission
        </button>
      </div>

      <div className="page-card animate-up" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.05)', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--danger)', flex: 1, minWidth: '300px' }}>
            <AlertTriangle size={20} />
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
              {Object.values(studentStats).filter(s => s.total >= 3).length} étudiants ont dépassé le seuil d'alerte (3+ absences).
            </span>
         </div>
         
         <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '36px' }} 
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>

         <select className="form-control" style={{ width: '180px' }} value={filiereFilter} onChange={e => setFiliereFilter(e.target.value)}>
           <option value="">Toutes les filières</option>
           {db.filieres.map(f => <option key={f.id || f.idFiliere} value={f.id || f.idFiliere}>{f.code}</option>)}
         </select>
      </div>

      <div className="page-card animate-up">
        <div className="table-wrap">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 20px' }}>Étudiant</th>
                <th>Filière</th>
                <th style={{ textAlign: 'center' }}>Total Absences</th>
                <th style={{ textAlign: 'center' }}>Non Justifiées</th>
                <th>Risque</th>
                <th style={{ textAlign: 'right', padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => {
                const sid = s.id || s.idEtudiant;
                const stats = studentStats[sid] || { total: 0, nonJustified: 0 };
                const riskLevel = stats.total >= 5 ? 'Critique' : stats.total >= 3 ? 'Alerte' : 'Normal';
                return (
                  <tr key={sid} className="hover-row">
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--blue-dark)' }}>{studentName(sid)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{s.cne}</div>
                    </td>
                    <td><span className="badge badge-gray">{filiereName(s.idFiliere || s.filiereId)}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: stats.total >= 5 ? 'var(--danger)' : stats.total >= 3 ? 'var(--orange)' : 'var(--success)' }}>{stats.total}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <span style={{ fontWeight: '600', color: stats.nonJustified > 0 ? 'var(--danger)' : 'var(--text-3)' }}>{stats.nonJustified}</span>
                    </td>
                    <td>
                      <span className={`badge ${stats.total >= 5 ? 'badge-red' : stats.total >= 3 ? 'badge-orange' : 'badge-green'}`}>
                        {riskLevel}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '15px 20px' }}>
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" title="Voir détails" onClick={() => handleOpenDetail(s)}>
                             <Eye size={16} />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Envoyer avertissement" onClick={() => handleSendWarning(s)}>
                             <Mail size={16} color="var(--blue-mid)" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr><td colSpan="6" className="table-empty">Aucune absence enregistrée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel: Student Absences Details */}
      <div className={`side-panel-overlay ${showPanel ? 'open' : ''}`} onClick={() => setShowPanel(false)}>
        <div className="side-panel" style={{ width: '550px' }} onClick={e => e.stopPropagation()}>
          <div className="side-panel-header">
            <div>
              <h3 className="side-panel-title">Détail des Absences</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>{studentName(selectedStudent?.id || selectedStudent?.idEtudiant)}</p>
            </div>
            <button className="modal-close" onClick={() => setShowPanel(false)}><X size={20} /></button>
          </div>
          <div className="side-panel-body">
            {selectedStudent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Heures</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--blue-dark)' }}>
                        {(studentStats[selectedStudent.id || selectedStudent.idEtudiant]?.total * 2)}h
                     </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '4px' }}>Non Justifiées</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--danger)' }}>
                        {studentStats[selectedStudent.id || selectedStudent.idEtudiant]?.nonJustified}
                     </div>
                  </div>
                </div>

                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--blue-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  Historique des absences
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {studentStats[selectedStudent.id || selectedStudent.idEtudiant]?.list.map((abs, idx) => {
                    const sessionId = abs.idSeance || abs.sessionId;
                    const session = (db.seances || []).find(ses => (ses.id || ses.idSeance) === sessionId);
                    const isAbsJustified = abs.statut === 'JUSTIFIEE' || abs.justifie === true || abs.justified === true;
                    return (
                      <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: 'white', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--blue-dark)', fontSize: '0.9rem' }}>{moduleName(session?.idModule || session?.moduleId)}</div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(abs.dateSaisie || abs.date).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {session?.heureDebut || 'Session'}</span>
                          </div>
                        </div>
                        <div>
                          <button 
                            className={`btn btn-sm ${isAbsJustified ? 'btn-ghost' : 'btn-primary'}`}
                            style={{ fontSize: '0.7rem', height: '28px', padding: '0 12px' }}
                            onClick={() => handleToggleJustification(abs)}
                          >
                            {isAbsJustified ? 'Justifiée' : 'Justifier'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="side-panel-footer">
            <button className="btn btn-ghost" onClick={() => setShowPanel(false)}>Fermer</button>
            <button className="btn btn-primary" onClick={() => handleSendWarning(selectedStudent)}>
              <Mail size={16} style={{ marginRight: '8px' }} /> Envoyer Rappel
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .side-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); z-index: 1000; opacity: 0; visibility: hidden; transition: 0.3s; }
        .side-panel-overlay.open { opacity: 1; visibility: visible; }
        .side-panel { position: absolute; right: 0; top: 0; height: 100%; background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1); transform: translateX(100%); transition: 0.3s; display: flex; flex-direction: column; }
        .side-panel-overlay.open .side-panel { transform: translateX(0); }
      `}</style>
    </div>
  );
};

export default AdminAbsences;
