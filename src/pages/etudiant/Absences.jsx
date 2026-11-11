import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

/* ── Formulaire de justificatif ── */
const JustificatifForm = ({ absence, onClose, onSubmit, isReadOnly }) => {
  const [motif, setMotif] = useState('');
  const [fichier, setFichier] = useState(null);
  const [error, setError] = useState('');

  const canSubmit = absence.statut === 'INJUSTIFIEE' && !absence.justificatif;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!motif.trim()) { setError('Le motif est obligatoire.'); return; }
    if (fichier && fichier.size > 5 * 1024 * 1024) { setError('La taille du fichier ne doit pas dépasser 5 MB.'); return; }
    onSubmit({ absenceId: (absence.id || absence.idAbsence), motif, fichier });
  };

  if (!canSubmit) {
    return (
      <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: '#991b1b', fontSize: '.88rem' }}>
        {absence.statut !== 'INJUSTIFIEE'
          ? `Justificatif non autorisé — Statut: ${absence.statut}`
          : 'Un justificatif a déjà été soumis pour cette absence.'}
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center', color: '#991b1b', fontSize: '.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Statut ABANDONNÉ — actions désactivées.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '.65rem 1rem', marginBottom: '1rem', color: '#991b1b', fontSize: '.84rem' }}>{error}</div>}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label className="form-label">Motif de l'absence <span style={{ color: 'var(--danger)' }}>*</span></label>
        <textarea
          className="form-control"
          rows={4}
          value={motif}
          onChange={e => setMotif(e.target.value)}
          placeholder="Décrivez la raison de votre absence..."
          required
        />
      </div>
      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label className="form-label">Document justificatif (PDF, Images — max 5 MB)</label>
        <input
          type="file"
          className="form-control"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => setFichier(e.target.files[0] || null)}
          style={{ height: 'auto', padding: '.5rem .85rem' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn btn-primary">Soumettre le justificatif</button>
      </div>
    </form>
  );
};

const Absences = () => {
  const { currentUser } = useAuth();
  const { db, save, moduleName } = useData();
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);

  const student = useMemo(() => 
    (db.etudiants || []).find(s => s && (s.utilisateurId == currentUser?.id || s.idEtudiant == currentUser?.id)) || currentUser?.etudiant, 
  [db.etudiants, currentUser]);

  if (!student) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  const isReadOnly = student.statut === 'ABANDONNE';
  const sid = student.id || student.idEtudiant;
  const sfid = student.idFiliere || student.filiereId;

  const myAbsences = useMemo(() =>
    (db.absences || []).filter(a => (a.idEtudiant === sid || a.studentId === sid)),
    [db.absences, sid]
  );

  const myModules = useMemo(() => {
    const filiereModules = (db.modules || []).filter(m => (m.idFiliere === sfid || m.filiereId === sfid));
    return filiereModules.map(mod => {
      const mid = mod.id || mod.idModule;
      const modAbsences = myAbsences.filter(a => {
        const sessionId = a.idSeance || a.sessionId;
        const session = (db.seances || []).find(s => (s.id || s.idSeance) === sessionId);
        return (session?.idModule || session?.moduleId) === mid;
      });
      const injustifiees = modAbsences.filter(a => a.statut === 'INJUSTIFIEE').length;
      const justifiees   = modAbsences.filter(a => a.statut === 'JUSTIFIEE').length;
      const enAttente    = modAbsences.filter(a => a.statut === 'EN_ATTENTE').length;
      const total        = modAbsences.length;
      
      // Calculate rate based on a fixed 30h average per module for now
      const taux = total > 0 ? +((total * 2 / 30) * 100).toFixed(1) : 0;
      return { ...mod, injustifiees, justifiees, enAttente, total, taux, absences: modAbsences };
    })
  }, [db.modules, db.seances, myAbsences, sfid]);

  const handleSubmitJustificatif = ({ absenceId, motif, fichier }) => {
    const absence = db.absences.find(a => (a.id || a.idAbsence) === absenceId);
    if (!absence) return;
    save('absences', {
      ...absence,
      statut: 'EN_ATTENTE',
      justificatif: { motif, fichier: fichier?.name || null, statutJustif: 'EN_ATTENTE' }
    });
    setShowForm(false);
    setSelectedAbsence(null);
    setToast({ type: 'success', msg: 'Justificatif soumis. L\'enseignant a été notifié.' });
    setTimeout(() => setToast(null), 4000);
  };

  const getTauxStyle = (taux) => ({
    color: taux < 15 ? '#065f46' : taux <= 30 ? '#c2410c' : '#991b1b',
    background: taux < 15 ? '#d1fae5' : taux <= 30 ? '#ffedd5' : '#fee2e2',
    padding: '2px 8px', borderRadius: '999px', fontWeight: 700, fontSize: '.75rem',
  });

  return (
    <div className="animate-up">
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#fff', border: '1px solid var(--border)', borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--danger)'}`, borderRadius: 'var(--radius)', padding: '.8rem 1rem', boxShadow: 'var(--shadow-lg)', maxWidth: '360px', fontSize: '.85rem' }}>
          {toast.msg}
        </div>
      )}

      <div className="page-hero">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Mes Absences</h2>
          <p className="page-hero-sub">Suivi détaillé des présences par module</p>
        </div>
        <div className="page-hero-right">
          <span className="badge badge-gray">{myAbsences.length} absence(s) totale(s)</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {myModules.map(mod => (
          <div key={mod.id || mod.idModule} className="page-card">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <h3 className="page-card-title">{mod.intitule}</h3>
                <span className="badge badge-refined" style={{ fontSize: '.65rem' }}>{mod.code}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <span style={getTauxStyle(mod.taux)}>Taux: {mod.taux}%</span>
              </div>
            </div>
            <div className="page-card-body">
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: mod.absences.length > 0 ? '1.5rem' : 0, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.82rem' }}><strong style={{ color: '#991b1b' }}>{mod.injustifiees}</strong> Injustifiée(s)</span>
                <span style={{ fontSize: '.82rem' }}><strong style={{ color: '#065f46' }}>{mod.justifiees}</strong> Justifiée(s)</span>
                <span style={{ fontSize: '.82rem' }}><strong style={{ color: '#92400e' }}>{mod.enAttente}</strong> En attente</span>
              </div>

              {mod.absences.length > 0 ? (
                <div className="table-wrap">
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Date</th><th>Séance</th><th>Type</th><th>Statut</th><th>Justification</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mod.absences.map(abs => {
                        const sid = abs.idSeance || abs.sessionId;
                        const sess = (db.seances || []).find(s => (s.id || s.idSeance) === sid);
                        return (
                          <tr key={abs.id || abs.idAbsence}>
                            <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{new Date(abs.dateSaisie || abs.date).toLocaleDateString()}</td>
                            <td style={{ fontSize: '.8rem' }}>{sess?.heureDebut} – {sess?.heureFin}</td>
                            <td><span className={`badge badge-${sess?.type === 'TP' ? 'orange' : sess?.type === 'TD' ? 'green' : 'blue'}`}>{sess?.type || '—'}</span></td>
                            <td>
                              <span className={`badge ${abs.statut === 'INJUSTIFIEE' ? 'badge-red' : abs.statut === 'JUSTIFIEE' ? 'badge-green' : 'badge-yellow'}`}>
                                {abs.statut}
                              </span>
                            </td>
                            <td style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>
                              {abs.justificatif?.motif || '—'}
                            </td>
                            <td>
                              {abs.statut === 'INJUSTIFIEE' && !abs.justificatif && !isReadOnly && (
                                <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedAbsence(abs); setShowForm(true); }}>Justifier</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: '.85rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Aucune absence pour ce module.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && selectedAbsence && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-hdr-title">Soumettre un Justificatif</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-bdy">
              <JustificatifForm
                absence={selectedAbsence}
                onClose={() => setShowForm(false)}
                onSubmit={handleSubmitJustificatif}
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Absences;
