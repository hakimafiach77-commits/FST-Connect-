import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

/* ── Timer J+7 (RG58) ── */
const CountdownTimer = ({ datePublication }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const pub  = new Date(datePublication);
      const deadline = new Date(pub.getTime() + 7 * 24 * 60 * 60 * 1000);
      const now  = new Date();
      const diff = deadline - now;
      if (diff <= 0) { setTimeLeft('EXPIRÉ'); return; }
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${days}j ${hours}h ${mins}m restant(s)`);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [datePublication]);

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: '#c2410c', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {timeLeft}
    </span>
  );
};

/* ── Seuil note (RG50) ── */
const getStatutNote = (moy) => {
  if (moy >= 12) return { label: 'VALIDÉ',     color: 'badge-green'  };
  if (moy >= 8)  return { label: 'RATTRAPAGE',  color: 'badge-orange' };
  return               { label: 'AJOURNÉ',     color: 'badge-red'    };
};

/* ── Formulaire Réclamation ── */
const ReclamationForm = ({ modules, onClose, onSubmit, reclamationsActives, isReadOnly }) => {
  const [moduleId, setModuleId] = useState(modules[0]?.id || '');
  const [sujet, setSujet] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const selectedModule = modules.find(m => m.id === parseInt(moduleId));

  // Précondition [2]: délai non expiré
  const dedans7Jours = (datePublication) => {
    if (!datePublication) return false;
    const diff = new Date() - new Date(datePublication);
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  // Précondition [4]: pas de réclamation active
  const hasActiveReclamation = reclamationsActives[parseInt(moduleId)] > 0;
  const delaiExpire = selectedModule?.grade?.datePublication ? !dedans7Jours(selectedModule.grade.datePublication) : true;

  const canSubmit = selectedModule?.grade?.publiee && !delaiExpire && !hasActiveReclamation && !isReadOnly;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!sujet.trim()) { setError('Le sujet est obligatoire.'); return; }
    if (sujet.length > 150) { setError('Le sujet ne doit pas dépasser 150 caractères.'); return; }
    if (!description.trim()) { setError('La description est obligatoire.'); return; }
    if (description.length > 1000) { setError('La description ne doit pas dépasser 1000 caractères.'); return; }
    onSubmit({ moduleId: parseInt(moduleId), sujet, description, noteContestee: selectedModule?.moy });
  };

  return (
    <div>
      {isReadOnly && (
        <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '8px', padding: '.75rem 1rem', marginBottom: '1rem', color: '#991b1b', fontSize: '.84rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Statut ABANDONNÉ — soumission désactivée.</span>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="form-label">Module concerné</label>
        <select className="form-control" value={moduleId} onChange={e => setModuleId(e.target.value)}>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.title} ({m.code})</option>
          ))}
        </select>
      </div>

      {/* Note contestée (lecture seule — RG: non modifiable) */}
      {selectedModule?.grade && (
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Note contestée (lecture seule)</label>
          <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '.65rem .85rem', fontSize: '.9rem', fontWeight: 700, color: 'var(--blue-dark)' }}>
            {parseFloat(selectedModule.moy || 0).toFixed(2)} / 20 — {getStatutNote(selectedModule.moy || 0).label}
          </div>
        </div>
      )}

      {/* Délai et statut */}
      {selectedModule?.grade?.publiee && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', fontSize: '.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Publication: {new Date(selectedModule.grade.datePublication).toLocaleDateString('fr-FR')}</span>
            {!delaiExpire && <CountdownTimer datePublication={selectedModule.grade.datePublication} />}
          </div>
        </div>
      )}

      {/* Blocages UI */}
      {delaiExpire && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', color: '#991b1b', fontSize: '.84rem', fontWeight: 600 }}>Délai de réclamation expiré (J+7)</div>}
      {hasActiveReclamation && <div style={{ background: '#ffedd5', border: '1px solid #fed7aa', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', color: '#c2410c', fontSize: '.84rem', fontWeight: 600 }}>Réclamation en cours pour ce module</div>}
      {!selectedModule?.grade?.publiee && <div style={{ background: '#f3f4f6', border: '1px solid var(--border)', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', color: 'var(--text-2)', fontSize: '.84rem' }}>Notes non encore publiées pour ce module.</div>}

      {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', color: '#991b1b', fontSize: '.84rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Sujet <span style={{ color: 'var(--danger)' }}>*</span> <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({sujet.length}/150)</span></label>
          <input className="form-control" value={sujet} onChange={e => setSujet(e.target.value)} maxLength={150} disabled={!canSubmit} placeholder="Objet de votre réclamation..." />
        </div>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Description <span style={{ color: 'var(--danger)' }}>*</span> <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({description.length}/1000)</span></label>
          <textarea className="form-control" rows={5} value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} disabled={!canSubmit} placeholder="Détaillez votre réclamation..."/>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
            title={
              delaiExpire ? 'Délai de réclamation expiré (J+7)' :
              hasActiveReclamation ? 'Réclamation en cours pour ce module' :
              !selectedModule?.grade?.publiee ? 'Notes non publiées' :
              isReadOnly ? 'Accès lecture seule' : ''
            }
          >
            Soumettre la réclamation
          </button>
        </div>
      </form>
    </div>
  );
};

/* ── MODULE 10 + 12: Notes & Réclamations ── */
const Notes = () => {
  const { currentUser } = useAuth();
  const { db, save, nextId, getStudentByUserId, gradeAvg } = useData();
  const [showReclamationForm, setShowReclamationForm] = useState(false);
  const [toast, setToast] = useState(null);

  const student = getStudentByUserId(currentUser.id) || currentUser.etudiant;
  if (!student) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  const isReadOnly = student.statut === 'ABANDONNE';
  const sid = student.id || student.idEtudiant;
  const sfid = student.idFiliere || student.filiereId;

  const myGrades = useMemo(() => {
    return (db.notes || []).filter(g => (g.idEtudiant == sid || g.studentId == sid) && (g.publiee || g.statut === 'PUBLIEE'));
  }, [db.notes, sid]);

  const filiereModules = (db.modules || []).filter(m => (m.idFiliere == sfid || m.filiereId == sfid));

  const modulesWithGrades = useMemo(() => {
    return filiereModules.map(mod => {
      const grade = myGrades.find(g => (g.idModule === mod.id || g.moduleId === mod.id));
      const moy = grade ? gradeAvg(grade.valeurCC || grade.cc, grade.valeurEF || grade.exam, mod.coeffCC || 0.4, mod.coeffEF || 0.6) : null;
      return { ...mod, grade, moy };
    });
  }, [filiereModules, myGrades, gradeAvg]);

  const reclamationsActives = useMemo(() => {
    const map = {};
    db.reclamations.filter(r => (r.idEtudiant === student.id || r.studentId === student.id) && (r.statut === 'SOUMISE' || r.statut === 'EN_COURS')).forEach(r => {
      const modId = r.idModule || r.moduleId;
      map[modId] = (map[modId] || 0) + 1;
    });
    return map;
  }, [db.reclamations, student.id]);

  const myReclamations = db.reclamations.filter(r => (r.idEtudiant === student.id || r.studentId === student.id));

  const handleSubmitReclamation = ({ moduleId, sujet, description, noteContestee }) => {
    const id = nextId('reclamations');
    save('reclamations', {
      id, idEtudiant: student.id, idModule: moduleId,
      sujet, description, noteContestee,
      statut: 'SOUMISE', // RG60
      dateDepot: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      reponseEnseignant: null,
    });
    setShowReclamationForm(false);
    setToast({ type: 'success', msg: 'Réclamation soumise — Statut: SOUMISE. Vous serez notifié(e) de chaque changement de statut (RG63).' });
    setTimeout(() => setToast(null), 5000);
  };

  // Statut workflow badge
  const reclamStatutBadge = (statut) => {
    const map = { SOUMISE: 'badge-gray', EN_COURS: 'badge-blue', VALIDEE: 'badge-green', REJETEE: 'badge-red' };
    return <span className={`badge ${map[statut] || 'badge-gray'}`}>{statut}</span>;
  };

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#fff', border: '1px solid var(--border)', borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--danger)'}`, borderRadius: 'var(--radius)', padding: '.8rem 1.25rem', boxShadow: 'var(--shadow-lg)', maxWidth: '420px', fontSize: '.85rem' }}>
          {toast.msg}
        </div>
      )}

      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Notes & Réclamations</h2>
          <p className="page-hero-sub">Consultation et gestion des réclamations — Filtre CNE server-side (RG52, RG57)</p>
        </div>
        <div className="page-hero-right">
          {!isReadOnly && (
            <button className="btn btn-primary" onClick={() => setShowReclamationForm(true)}>
              + Nouvelle réclamation
            </button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius)', padding: '.85rem 1.25rem', marginBottom: '1.25rem', color: '#991b1b', fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Statut ABANDONNÉ — Mode lecture seule.</span>
        </div>
      )}

      {/* Tableau des notes (RG49, RG50) */}
      <div className="page-card animate-up">
        <div className="page-card-header">
          <h3 className="page-card-title">Relevé de Notes — Semestre en cours</h3>
          <span className="badge badge-gray">{myGrades.length} note(s) publiée(s)</span>
        </div>
        <div className="page-card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Module</th><th>Code</th><th>Coeff</th>
                  <th>Note CC</th><th>Note EF</th>
                  <th>Moyenne</th><th>Statut</th><th>Réclamation</th>
                </tr>
              </thead>
              <tbody>
                {modulesWithGrades.map(mod => {
                  const statut = mod.moy !== null ? getStatutNote(mod.moy) : null;
                  const hasReclam = reclamationsActives[mod.id] > 0;
                  const myReclam  = myReclamations.find(r => r.moduleId === mod.id);
                  return (
                    <tr key={mod.id}>
                      <td style={{ fontWeight: 600 }}>{mod.title}</td>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{mod.code}</td>
                      <td style={{ textAlign: 'center' }}>{mod.coeff}</td>
                      {mod.grade ? (
                        <>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{parseFloat(mod.grade.valeurCC || mod.grade.cc || 0).toFixed(1)}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{parseFloat(mod.grade.valeurEF || mod.grade.final || 0).toFixed(1)}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', color: 'var(--blue-dark)' }}>
                            {parseFloat(mod.moy || 0).toFixed(2)}
                          </td>
                          <td>{statut && <span className={`badge ${statut.color}`}>{statut.label}</span>}</td>
                          <td>
                            {myReclam ? reclamStatutBadge(myReclam.statut) : (
                              hasReclam ? <span className="badge badge-blue">En cours</span> : (
                                <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>—</span>
                              )
                            )}
                          </td>
                        </>
                      ) : (
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '.82rem', fontStyle: 'italic' }}>
                          Notes non publiées
                        </td>
                      )}
                    </tr>
                  );
                })}
                {modulesWithGrades.length === 0 && (
                  <tr><td colSpan={8} className="table-empty">Aucun module trouvé pour votre filière.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Réclamations en cours */}
      {myReclamations.length > 0 && (
        <div className="page-card animate-up" style={{ marginTop: '1rem' }}>
          <div className="page-card-header">
            <h3 className="page-card-title">Mes Réclamations</h3>
            <span className="badge badge-gray">{myReclamations.length}</span>
          </div>
          <div className="page-card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Date</th><th>Module</th><th>Sujet</th><th>Statut</th><th>Réponse</th></tr>
                </thead>
                <tbody>
                  {myReclamations.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontSize: '.82rem', fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td>{db.modules.find(m => m.id === r.moduleId)?.title || '—'}</td>
                      <td>{r.sujet}</td>
                      <td>
                        {reclamStatutBadge(r.statut)}
                        <div style={{ fontSize: '.7rem', color: 'var(--text-3)', marginTop: '2px' }}>
                          SOUMISE → EN_COURS → VALIDEE / REJETEE
                        </div>
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text-2)', fontStyle: r.reponse ? 'normal' : 'italic' }}>
                        {r.reponse || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal réclamation */}
      {showReclamationForm && (
        <div className="modal-overlay" onClick={() => setShowReclamationForm(false)}>
          <div className="modal-box modal-box-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-hdr-title">Nouvelle Réclamation (RG58–RG64)</h3>
              <button className="modal-close" onClick={() => setShowReclamationForm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-bdy">
              <ReclamationForm
                modules={modulesWithGrades.filter(m => m.grade?.publiee)}
                onClose={() => setShowReclamationForm(false)}
                onSubmit={handleSubmitReclamation}
                reclamationsActives={reclamationsActives}
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
