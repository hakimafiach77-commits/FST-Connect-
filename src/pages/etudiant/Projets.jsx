import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

/* ── HELPERS ── */
const PFE_STEPS = [
  { label: 'Sujet Validé', key: 'VALIDE' },
  { label: 'En Cours', key: 'EN_COURS' },
  { label: 'Rapport Déposé', key: 'DEPOT' },
  { label: 'Soutenu', key: 'SOUTENU' },
  { label: 'Note Finale', key: 'NOTE' }
];

const STAGE_STEPS = [
  { label: 'Convention Demandée', key: 'EN_ATTENTE' },
  { label: 'Convention Signée', key: 'SIGNEE' },
  { label: 'Stage en cours', key: 'EN_COURS' },
  { label: 'Rapport Déposé', key: 'DEPOT' }
];

const ProgressTracker = ({ steps, currentStatus, hasReport, hasNote }) => {
  const currentIndex = useMemo(() => {
    if (hasNote) return steps.length - 1;
    if (currentStatus === 'SOUTENU') return 3;
    if (hasReport) return 2;
    if (currentStatus === 'EN_COURS' || currentStatus === 'SIGNEE') return 1;
    return 0;
  }, [steps, currentStatus, hasReport, hasNote]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem 1rem', marginBottom: '1.5rem', background: 'var(--surface-2)', borderRadius: '12px', overflowX: 'auto' }}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: isCompleted ? 'var(--success)' : isCurrent ? 'var(--blue-mid)' : 'var(--border)',
                color: isCompleted || isCurrent ? '#fff' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyCenter: 'center',
                fontWeight: 700, fontSize: '.9rem', marginBottom: '.5rem',
                border: isCurrent ? '4px solid #dbeafe' : 'none',
                justifyContent: 'center'
              }}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span style={{ fontSize: '.7rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--blue-dark)' : 'var(--text-3)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: idx < currentIndex ? 'var(--success)' : 'var(--border)', margin: '0 10px', marginTop: '-1.5rem' }}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ── MODULE 1: PFE & Stages (Improved) ── */
const Projets = () => {
  const { currentUser } = useAuth();
  const { db, save, getStudentByUserId, teacherName, getById } = useData();
  const [rapportFile, setRapportFile] = useState(null);
  const [stageRapportFile, setStageRapportFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('pfe');
  const pfeFileRef = useRef();
  const stageFileRef = useRef();

  const student = getStudentByUserId(currentUser.id);
  if (!student) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  const studentId = student.id;
  const filiere = db.filieres.find(f => f.id === (student.idFiliere || student.filiereId));
  const isReadOnly = student.statut === 'ABANDONNE';
  const isLastYear = filiere && student.anneeInscription === filiere.duree;

  const myPFE = db.pfes.find(p => (p.idEtudiant === studentId || p.studentId === studentId || p.studentIds?.includes(studentId)));
  const myStage = db.stages.find(s => (s.idEtudiant === studentId || s.studentId === studentId));

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUploadPFE = () => {
    if (!rapportFile) return;
    if (!rapportFile.name.endsWith('.pdf')) { showToast('Format invalide — PDF uniquement', 'error'); return; }
    save('pfes', { ...myPFE, cheminRapport: rapportFile.name });
    showToast(`Rapport PFE déposé avec succès.`);
    setRapportFile(null);
  };

  const handleUploadStage = () => {
    if (!stageRapportFile) return;
    save('stages', { ...myStage, cheminRapport: stageRapportFile.name });
    showToast(`Rapport de stage déposé avec succès.`);
    setStageRapportFile(null);
  };

  const pfeStatutBadge = (s) => {
    const map = { EN_ATTENTE: 'badge-gray', EN_COURS: 'badge-blue', SOUTENU: 'badge-orange', VALIDE: 'badge-green', REFUSE: 'badge-red' };
    return <span className={`badge ${map[s] || 'badge-gray'}`} style={{ textTransform: 'uppercase', fontSize: '.7rem' }}>{s}</span>;
  };

  return (
    <div className="page-area">
      {toast && (
        <div className={`toast ${toast.type}`} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
          <div className="toast-body">
            <div className="toast-msg">{toast.msg}</div>
          </div>
        </div>
      )}

      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Espace Projets & Stages</h2>
          <p className="page-hero-sub">Gestion de votre cursus professionnel et académique de fin d'études.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button 
          className={`btn ${activeTab === 'pfe' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('pfe')}
          style={{ borderRadius: '8px' }}
        >
          Projet de Fin d'Études (PFE)
        </button>
        <button 
          className={`btn ${activeTab === 'stage' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setActiveTab('stage')}
          style={{ borderRadius: '8px' }}
        >
          Stage Professionnel
        </button>
      </div>

      {activeTab === 'pfe' && (
        <div className="animate-up">
          {!isLastYear ? (
            <div className="page-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ marginBottom: '1.5rem', color: 'var(--text-3)' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <h3 style={{ color: 'var(--blue-dark)', marginBottom: '1rem' }}>Accès réservé aux étudiants en fin de cycle</h3>
              <p style={{ color: 'var(--text-3)', maxWidth: '500px', margin: '0 auto' }}>L'espace PFE sera débloqué lors de votre dernière année de formation ({filiere?.duree}ème année).</p>
            </div>
          ) : !myPFE ? (
            <div className="page-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ marginBottom: '1.5rem', color: 'var(--text-3)' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              </div>
              <h3 style={{ color: 'var(--blue-dark)', marginBottom: '1rem' }}>En attente d'affectation</h3>
              <p style={{ color: 'var(--text-3)', maxWidth: '500px', margin: '0 auto' }}>Votre sujet de PFE n'a pas encore été validé par la commission pédagogique.</p>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
              <div className="dg-left">
                <div className="page-card">
                  <div className="page-card-header">
                    <h3 className="page-card-title">Progression du PFE</h3>
                    {pfeStatutBadge(myPFE.statut)}
                  </div>
                  <div className="page-card-body">
                    <ProgressTracker 
                      steps={PFE_STEPS} 
                      currentStatus={myPFE.statut} 
                      hasReport={!!myPFE.cheminRapport}
                      hasNote={!!myPFE.note}
                    />
                    
                    <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: '12px' }}>
                      <h4 style={{ fontSize: '.95rem', color: 'var(--blue-dark)', marginBottom: '1rem' }}>Détails du Sujet</h4>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text)' }}>{myPFE.titre}</div>
                      <p style={{ fontSize: '.9rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{myPFE.description}</p>
                    </div>
                  </div>
                </div>

                <div className="page-card">
                  <div className="page-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                      <h3 className="page-card-title">Livrables & Rapport</h3>
                    </div>
                  </div>
                  <div className="page-card-body">
                    {myPFE.cheminRapport ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <div>
                            <div style={{ fontWeight: 700, color: '#065f46' }}>{myPFE.cheminRapport}</div>
                            <div style={{ fontSize: '.75rem', color: '#059669' }}>Déposé le {new Date().toLocaleDateString()}</div>
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm">Remplacer</button>
                      </div>
                    ) : (
                      <div style={{ padding: '2rem', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem' }}>Déposez votre rapport final au format PDF (Max 20MB)</p>
                        <input type="file" ref={pfeFileRef} style={{ display: 'none' }} onChange={(e) => setRapportFile(e.target.files[0])} />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                          <button className="btn btn-ghost" onClick={() => pfeFileRef.current.click()}>
                            {rapportFile ? rapportFile.name : 'Choisir un fichier'}
                          </button>
                          <button className="btn btn-primary" disabled={!rapportFile} onClick={handleUploadPFE}>Envoyer le rapport</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="dg-right">
                <div className="page-card">
                  <div className="page-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                      <h3 className="page-card-title">Encadrement</h3>
                    </div>
                  </div>
                  <div className="page-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--blue-mid)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                        {teacherName(myPFE.idEncadrant || myPFE.encadrantId).charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Encadrant Principal</div>
                        <div style={{ fontWeight: 700 }}>{teacherName(myPFE.idEncadrant || myPFE.encadrantId)}</div>
                      </div>
                    </div>
                    {(myPFE.idCoEncadrant || myPFE.coEncadrantId) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--blue-light)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                          {teacherName(myPFE.idCoEncadrant || myPFE.coEncadrantId).charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700 }}>Co-Encadrant</div>
                          <div style={{ fontWeight: 700 }}>{teacherName(myPFE.idCoEncadrant || myPFE.coEncadrantId)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="page-card">
                  <div className="page-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <h3 className="page-card-title">Soutenance</h3>
                    </div>
                  </div>
                  <div className="page-card-body">
                    {myPFE.dateSoutenance ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--blue-dark)' }}>
                          {new Date(myPFE.dateSoutenance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </div>
                        <div style={{ fontWeight: 700, margin: '.5rem 0' }}>{new Date(myPFE.dateSoutenance).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="badge badge-purple" style={{ marginBottom: '1.5rem' }}>Salle 102</div>
                        
                        <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700, marginBottom: '.5rem' }}>Membres du Jury</div>
                          {myPFE.jury?.map((j, i) => <div key={i} style={{ fontSize: '.85rem', fontWeight: 600, padding: '.25rem 0' }}>• {j}</div>)}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '1rem' }}>Date de soutenance non programmée.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stage' && (
        <div className="animate-up">
          {!myStage ? (
            <div className="page-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ marginBottom: '1.5rem', color: 'var(--text-3)' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>
              </div>
              <h3 style={{ color: 'var(--blue-dark)', marginBottom: '1rem' }}>Aucun stage déclaré</h3>
              <p style={{ color: 'var(--text-3)', maxWidth: '500px', margin: '0 auto' }}>Vous n'avez pas encore soumis de demande de stage ou votre dossier est en cours de traitement.</p>
              <button className="btn btn-primary" style={{ marginTop: '2rem' }}>Déclarer un stage</button>
            </div>
          ) : (
            <div className="dashboard-grid">
              <div className="dg-left">
                <div className="page-card">
                  <div className="page-card-header">
                    <h3 className="page-card-title">Suivi du Stage</h3>
                    <span className={`badge ${myStage.statutConvention === 'SIGNEE' ? 'badge-green' : 'badge-orange'}`}>
                      Convention: {myStage.statutConvention}
                    </span>
                  </div>
                  <div className="page-card-body">
                    <ProgressTracker 
                      steps={STAGE_STEPS} 
                      currentStatus={myStage.statutConvention} 
                      hasReport={!!myStage.cheminRapport}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.5rem' }}>Entreprise d'accueil</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{myStage.entreprise}</div>
                        <div style={{ color: 'var(--text-2)', fontSize: '.9rem' }}>{myStage.lieu}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.5rem' }}>Tuteur Entreprise</div>
                        <div style={{ fontWeight: 700 }}>{myStage.encadrantEntreprise}</div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.5rem' }}>Sujet du Stage</div>
                      <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{myStage.sujet}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dg-right">
                <div className="page-card" style={{ background: 'var(--surface-2)' }}>
                  <div className="page-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <h3 className="page-card-title">Rapport de Stage</h3>
                    </div>
                  </div>
                  <div className="page-card-body">
                    {myStage.cheminRapport ? (
                      <div style={{ textAlign: 'center' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}><polyline points="20 6 9 17 4 11"/></svg>
                        <div style={{ fontWeight: 700, marginBottom: '.5rem' }}>Rapport validé</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>{myStage.cheminRapport}</div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: '.85rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>Le dépôt du rapport est ouvert une fois la convention signée.</p>
                        <input type="file" ref={stageFileRef} style={{ display: 'none' }} onChange={(e) => setStageRapportFile(e.target.files[0])} />
                        <button 
                          className="btn btn-primary btn-block" 
                          disabled={myStage.statutConvention !== 'SIGNEE'}
                          onClick={() => stageFileRef.current.click()}
                        >
                          {stageRapportFile ? 'Fichier prêt' : 'Sélectionner le rapport'}
                        </button>
                        {stageRapportFile && (
                          <button className="btn btn-success btn-block" style={{ marginTop: '.75rem' }} onClick={handleUploadStage}>Confirmer l'envoi</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {myStage.note && (
                  <div className="page-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none' }}>
                    <div className="page-card-body" style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: .8 }}>Note Finale du Stage</div>
                      <div style={{ fontSize: '3rem', fontWeight: 900 }}>{myStage.note}<span style={{ fontSize: '1.2rem', opacity: .7 }}>/20</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projets;
