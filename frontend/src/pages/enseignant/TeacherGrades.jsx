import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TeacherGrades = () => {
  const { db, save, nextId, gradeAvg, fetchSync } = useData();
  const { currentUser } = useAuth();
  const teacher = useMemo(() => (db.enseignants || []).find(t => t.utilisateurId == currentUser.id), [db.enseignants, currentUser.id]);
  const teacherId = teacher?.idEnseignant || teacher?.id;

  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [editGrades, setEditGrades] = useState({});
  const [groupGrade, setGroupGrade] = useState({ groupId: '', cc: '', final: '' });

  const myModules = useMemo(() => {
    if (!teacherId) return [];
    
    // Find modules where this teacher has an affectation
    const moduleIds = (db.affectations || [])
      .filter(a => (a.idEnseignant || a.teacherId) == teacherId)
      .map(a => a.idModule || a.moduleId);
      
    return (db.modules || []).filter(m => 
      moduleIds.some(id => id == (m.id || m.idModule)) || 
      (m.idEnseignant || m.teacherId) == teacherId
    );
  }, [db.modules, db.affectations, teacherId]);

  // Select first module by default once loaded
  React.useEffect(() => {
    if (!selectedModuleId && myModules.length > 0) {
      setSelectedModuleId((myModules[0].id || myModules[0].idModule).toString());
    }
  }, [myModules, selectedModuleId]);

  const selectedModule = useMemo(() =>
    selectedModuleId ? myModules.find(m => (m.id || m.idModule) == selectedModuleId) : null,
  [myModules, selectedModuleId]);

  const studentsInModule = useMemo(() => {
    if (!selectedModule) return [];
    const filiereId = selectedModule.idFiliere || selectedModule.filiereId;
    return filiereId ? db.etudiants.filter(s => (s.idFiliere == filiereId || s.filiereId == filiereId)) : db.etudiants;
  }, [db.etudiants, selectedModule]);

  const projectGroups = useMemo(() => {
    if (!selectedModule) return [];
    const filiereId = selectedModule.idFiliere || selectedModule.filiereId;
    return (db.groupes || []).filter(g => g.type === 'PROJET' && (g.idFiliere == filiereId || g.filiereId == filiereId));
  }, [db.groupes, selectedModule]);

  // Load initial grades from db to local state whenever module changes or db changes
  React.useEffect(() => {
    if (!selectedModule) {
      setEditGrades({});
      return;
    }
    const initGrades = {};
    const mid = selectedModule.id || selectedModule.idModule;
    
    studentsInModule.forEach(student => {
      const sid = student.id || student.idEtudiant;
      const g = (db.notes || []).find(x => 
        (x.idEtudiant == sid || x.studentId == sid) && 
        (x.idModule == mid || x.moduleId == mid)
      );
      
      if (g) {
        initGrades[sid] = { 
          cc: g.valeurCC ?? g.cc ?? '', 
          final: g.valeurEF ?? g.final ?? '', 
          publiee: g.publiee 
        };
      } else {
        initGrades[sid] = { cc: '', final: '', publiee: false };
      }
    });
    setEditGrades(initGrades);
  }, [db.notes, selectedModule, studentsInModule]);

  const handleGradeChange = (studentId, field, value) => {
    // Only allow numbers
    let val = value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) return; // Prevent multiple decimal points
    if (parseFloat(val) > 20) val = '20';
    setEditGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleSaveStudent = async (studentId, publish = false) => {
    if (!selectedModule) return;
    const gRow = db.notes.find(x => (x.idEtudiant === studentId || x.studentId === studentId) && (x.idModule === selectedModule.id || x.moduleId === selectedModule.id));
    const lg = editGrades[studentId];
    
    // Parse valid numbers
    const ccVal = lg.cc !== '' ? parseFloat(lg.cc) : null;
    const finalVal = lg.final !== '' ? parseFloat(lg.final) : null;

    try {
      await api('/notes/bulk', {
        method: 'POST',
        body: JSON.stringify({
          idModule: selectedModule.id,
          notes: [{
            idEtudiant: studentId,
            idNote: gRow?.idNote || gRow?.id,
            valeurCC: ccVal,
            valeurEF: finalVal,
            publiee: publish || gRow?.publiee
          }]
        })
      });
      await fetchSync();
      alert('Note enregistrée !');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handlePublishAll = async () => {
    if (!selectedModule) return;
    
    const notesPayload = studentsInModule.map(student => {
      const gRow = db.notes.find(x => (x.idEtudiant === student.id || x.studentId === student.id) && (x.idModule === selectedModule.id || x.moduleId === selectedModule.id));
      const lg = editGrades[student.id];
      return {
        idEtudiant: student.id,
        idNote: gRow?.idNote || gRow?.id,
        valeurCC: lg.cc !== '' ? parseFloat(lg.cc) : null,
        valeurEF: lg.final !== '' ? parseFloat(lg.final) : null,
        publiee: true
      };
    });

    try {
      await api('/notes/bulk', {
        method: 'POST',
        body: JSON.stringify({
          idModule: selectedModule.id,
          notes: notesPayload
        })
      });
      await fetchSync();
      alert('Toutes les notes ont été publiées !');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la publication');
    }
  };

  return (
    <div className="page-area animate-up">
      <div className="page-hero">
        <div>
          <h1 className="page-hero-title">Notes et Examens</h1>
          <p className="page-hero-sub">Saisie et publication des notes pour vos modules</p>
        </div>
      </div>

      <div className="page-card">
        <div className="page-card-header">
          <h3 className="page-card-title">Sélection du Module</h3>
        </div>
        <div className="page-card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ minWidth: 260 }}
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
          >
            <option value="">-- Choisissez un module --</option>
            {myModules.map(m => (
              <option key={m.id} value={m.id}>{m.code} - {m.intitule || m.title}</option>
            ))}
          </select>
          {selectedModule && (
            <button className="btn btn-primary" onClick={handlePublishAll}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>
              </svg>
              Publier toutes les notes
            </button>
          )}
        </div>
      </div>

      {selectedModule && projectGroups.length > 0 && (
        <div className="page-card" style={{ marginTop: '24px' }}>
          <div className="page-card-header">
            <h3 className="page-card-title">Saisie Rapide par Projet</h3>
          </div>
          <div className="page-card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-control" value={groupGrade.groupId} onChange={(e) => setGroupGrade({...groupGrade, groupId: e.target.value})}>
              <option value="">-- Sélectionnez un Projet --</option>
              {projectGroups.map(pg => (
                <option key={pg.idGroupe || pg.id} value={pg.idGroupe || pg.id}>{pg.nom} ({pg.etudiantsProjet?.length || 0} membres)</option>
              ))}
            </select>
            {groupGrade.groupId && (
              <>
                <input type="text" className="form-control" style={{ width: 120 }} placeholder="Note CC" value={groupGrade.cc} onChange={(e) => setGroupGrade({...groupGrade, cc: e.target.value.replace(/[^0-9.]/g, '')})} />
                <input type="text" className="form-control" style={{ width: 120 }} placeholder="Note Final" value={groupGrade.final} onChange={(e) => setGroupGrade({...groupGrade, final: e.target.value.replace(/[^0-9.]/g, '')})} />
                <button className="btn btn-outline-blue" onClick={() => {
                  const pg = projectGroups.find(g => (g.idGroupe || g.id) == groupGrade.groupId);
                  if (!pg || !pg.etudiantsProjet) return;
                  const newGrades = { ...editGrades };
                  pg.etudiantsProjet.forEach(st => {
                    const stId = st.idEtudiant || st.id;
                    if (newGrades[stId]) {
                      if (groupGrade.cc !== '') {
                        newGrades[stId].cc = Math.min(20, parseFloat(groupGrade.cc)).toString();
                      }
                      if (groupGrade.final !== '') {
                        newGrades[stId].final = Math.min(20, parseFloat(groupGrade.final)).toString();
                      }
                    }
                  });
                  setEditGrades(newGrades);
                  alert('Les notes ont été appliquées au brouillon pour tous les membres du projet ! Réviser et Sauvegarder la liste en bas.');
                  setGroupGrade({ groupId: '', cc: '', final: '' });
                }}>
                  Appliquer au groupe
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {selectedModule ? (
        <div className="page-card" style={{ marginTop: '24px' }}>
          <div className="page-card-header">
            <h3 className="page-card-title">Étudiants Inscrits</h3>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>CNE</th>
                  <th>Note CC (40%)</th>
                  <th>Note Finale (60%)</th>
                  <th>Moyenne</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsInModule.length > 0 ? studentsInModule.map(student => {
                  const sid = student.id || student.idEtudiant;
                  const sGrade = editGrades[sid] || { cc: '', final: '', publiee: false };
                  const gRecord = (db.notes || []).find(x => 
                    (x.idEtudiant == sid || x.studentId == sid) && 
                    (x.idModule == (selectedModule.id || selectedModule.idModule) || x.moduleId == (selectedModule.id || selectedModule.idModule))
                  );
                  
                  // Compute average visually
                  const ccVal = parseFloat(sGrade.cc);
                  const finalVal = parseFloat(sGrade.final);
                  let avg = '—';
                  if (!isNaN(ccVal) && !isNaN(finalVal)) {
                    avg = (ccVal * 0.4 + finalVal * 0.6).toFixed(2);
                  }

                  const isPublished = gRecord?.publiee;
                  const u = (db.utilisateurs || []).find(user => user.id === student.utilisateurId);
                  const fullName = u ? `${u.prenom} ${u.nom}` : (student.nom || student.name || '—');

                  return (
                    <tr key={sid}>
                      <td style={{ fontWeight: 600, color: 'var(--blue-dark)' }}>{fullName}</td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{student.cne || student.CNE}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ width: 80, height: 32, fontSize: '0.85rem' }}
                          value={sGrade.cc}
                          onChange={(e) => handleGradeChange(sid, 'cc', e.target.value)}
                          disabled={isPublished}
                          placeholder=" /20"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          style={{ width: 80, height: 32, fontSize: '0.85rem' }}
                          value={sGrade.final}
                          onChange={(e) => handleGradeChange(sid, 'final', e.target.value)}
                          disabled={isPublished}
                          placeholder=" /20"
                        />
                      </td>
                      <td>
                        <strong style={{ color: avg >= 10 ? 'var(--success)' : (avg !== '—' ? 'var(--danger)' : 'inherit') }}>
                          {avg}
                        </strong>
                      </td>
                      <td>
                        {isPublished ? (
                          <span className="badge badge-green">Publiée</span>
                        ) : (
                          <span className="badge badge-gray">Brouillon</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isPublished && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleSaveStudent(sid, false)}>
                              Sauvegarder
                            </button>
                            <button className="btn btn-outline-blue btn-sm" onClick={() => handleSaveStudent(sid, true)}>
                              Publier
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      Aucun étudiant inscrit dans cette filière.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3>Aucun module sélectionné</h3>
          <p>Veuillez sélectionner un module dans la liste déroulante ci-dessus pour gérer les notes.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherGrades;
