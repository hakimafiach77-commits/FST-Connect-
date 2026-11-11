import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Helpers ────────────────────────────────────────────── */
const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TODAY_DOW = new Date().getDay(); // 0=Sun
const todayName = DAY_NAMES[TODAY_DOW];

const TYPE_COLOR = {
  Cours:  { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
  TD:     { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
  TP:     { bg: '#ffedd5', color: '#c2410c', border: '#f97316' },
  Examen: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
};

const STATUT_BADGE = {
  PLANIFIEE:   { cls: 'badge-green',  label: 'Planifiée' },
  ANNULEE:     { cls: 'badge-red',    label: 'Annulée' },
  RATTRAPAGE:  { cls: 'badge-yellow', label: 'Rattrapage' },
};

const SessionRow = ({ session, moduleName, roomName, groupName, highlight }) => {
  const tc = TYPE_COLOR[session.type] || TYPE_COLOR.Cours;
  const sb = STATUT_BADGE[session.statut] || STATUT_BADGE.PLANIFIEE;
  const start = session.heureDebut || session.startSlot || '—';
  const end = session.heureFin || session.endSlot || '—';
  return (
    <div className={`ens-session-row ${highlight ? 'ens-today' : ''} ${session.statut === 'ANNULEE' ? 'ens-cancelled' : ''}`}>
      <div className="ens-session-time">
        <span>{start}</span>
        <span className="ens-time-sep">—</span>
        <span>{end}</span>
      </div>
      <div className="ens-session-type-pill" style={{ background: tc.bg, color: tc.color, borderLeft: `3px solid ${tc.border}` }}>
        {session.type}
      </div>
      <div className="ens-session-info">
        <div className="ens-session-module">{moduleName(session.idModule || session.moduleId)}</div>
        <div className="ens-session-meta">
          <span>{groupName(session.idGroupe || session.groupId)}</span>
          <span className="ens-dot">·</span>
          <span>{roomName(session.idSalle || session.roomId)}</span>
          {session.isRattrapage && <span className="badge badge-yellow" style={{ marginLeft: 6 }}>Rattrapage</span>}
        </div>
      </div>
      <span className={`badge ${sb.cls}`}>{sb.label}</span>
    </div>
  );
};

const EnseignantDashboard = () => {
  const { db, moduleName, roomName, groupName, filiereName } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');

  const teacher = useMemo(() => db.enseignants.find(t => t.utilisateurId == currentUser?.id), [db.enseignants, currentUser?.id]);
  const teacherId = teacher?.idEnseignant || teacher?.id;

  const myModules = useMemo(() => {
    const affectedModuleIds = new Set(db.affectations?.filter(a => (a.idEnseignant || a.teacherId) == teacherId).map(a => a.idModule || a.moduleId) || []);
    return db.modules.filter(m => {
      const isAssigned = (m.idResponsable || m.idEnseignant || m.teacherId) == teacherId || affectedModuleIds.has(m.id || m.idModule);
      return isAssigned;
    });
  }, [db.modules, db.affectations, teacherId]);

  const mySessions = useMemo(() =>
    db.seances.filter(s => s.idEnseignant == teacherId || s.teacherId == teacherId),
    [db.seances, teacherId]);

  const todaySessions = useMemo(() =>
    mySessions.filter(s => s.jour === todayName).sort((a, b) => (a.heureDebut || '').localeCompare(b.heureDebut || '')),
    [mySessions, todayName]);

  const weekSessions = useMemo(() =>
    mySessions.slice().sort((a, b) => {
      const dayA = DAY_NAMES.indexOf(a.jour);
      const dayB = DAY_NAMES.indexOf(b.jour);
      return dayA - dayB || (a.heureDebut || '').localeCompare(b.heureDebut || '');
    }),
    [mySessions]);

  const pendingAbsences = useMemo(() => {
    // Bug #6 fix: build the set from BOTH s.idSeance (real DB PK) and s.id (normalized alias)
    // so the cross-reference against a.idSeance on absence records is always reliable.
    const mySessionIds = new Set(
      mySessions.flatMap(s => [s.idSeance, s.id].filter(Boolean))
    );
    return db.absences.filter(a =>
      (mySessionIds.has(a.idSeance) || mySessionIds.has(a.sessionId)) &&
      a.statut === 'INJUSTIFIEE'
    );
  }, [db.absences, mySessions]);

  const recentAnnouncements = (db.annonces || db.announcements || []).slice(0, 4);

  return (
    <div className="ens-dashboard">
      <div className="ens-hero animate-up">
        <div className="ens-hero-left">
          <div className="ens-hero-avatar">{(currentUser?.name || 'P').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div>
            <h2 className="ens-hero-title">Bienvenue, {currentUser?.prenom} {currentUser?.nom}</h2>
            <p className="ens-hero-sub">
              {teacher?.specialite || 'Enseignant'} &mdash; {teacher?.grade || ''} &mdash; Portail GDI
            </p>
            <p className="ens-hero-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:5}}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="ens-hero-actions">
          <button className="btn btn-primary" onClick={() => navigate('/teacher/absences')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="8"/><line x1="17" y1="12" x2="23" y2="12"/></svg>
            Saisir absences
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/teacher/notes')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            Publier notes
          </button>
        </div>
      </div>

      <div className="ens-main-grid">
        <div className="ens-col-left">
          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Emploi du Temps</h3>
              <div className="ens-tabs">
                <button className={`ens-tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>Aujourd'hui</button>
                <button className={`ens-tab ${activeTab === 'week' ? 'active' : ''}`} onClick={() => setActiveTab('week')}>Cette semaine</button>
              </div>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {activeTab === 'today' && (
                todaySessions.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>Aucune séance prévue aujourd'hui.</p>
                  </div>
                ) : (
                  <div className="ens-sessions-list">
                    {todaySessions.map(s => (
                      <SessionRow key={s.id} session={s} moduleName={moduleName} roomName={roomName} groupName={groupName} highlight={true} />
                    ))}
                  </div>
                )
              )}
              {activeTab === 'week' && (
                weekSessions.map((s, idx) => {
                  const dayChanged = idx === 0 || s.jour !== weekSessions[idx - 1].jour;
                  return (
                    <React.Fragment key={s.id}>
                      {dayChanged && (
                        <div className="ens-day-divider">
                          <span>{s.jour}</span>
                        </div>
                      )}
                      <SessionRow session={s} moduleName={moduleName} roomName={roomName} groupName={groupName} highlight={s.jour === todayName} />
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>

          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Mes Modules</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/modules')}>Voir tout</button>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {myModules.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>Aucun module assigné.</div>
              ) : (
                myModules.map(m => {
                  const filiere = db.filieres.find(f => f.id === m.filiereId);
                  return (
                    <div key={m.id} className="ens-module-item">
                      <div className="ens-module-code">{m.code}</div>
                      <div className="ens-module-body">
                        <div className="ens-module-title">{m.intitule || m.title}</div>
                        <div className="ens-module-meta">
                           <span className="badge badge-blue">{filiereName(m.idFiliere || m.filiereId)}</span>
                           <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Semestre {m.semestre || m.semester}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="ens-col-right">
          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Absences à traiter</h3>
              {pendingAbsences.length > 0 && <span className="badge badge-red">{pendingAbsences.length}</span>}
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {pendingAbsences.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '.85rem' }}>✓ Aucune absence en attente</div>
              ) : (
                pendingAbsences.slice(0, 5).map(a => {
                  const std = db.etudiants.find(s => s.id === (a.idEtudiant || a.studentId));
                  const u = std ? db.utilisateurs.find(user => user.id === std.utilisateurId) : null;
                  const sName = u ? `${u.prenom} ${u.nom}` : (std?.name || '?');
                  const sess = db.seances.find(s => s.id === (a.idSeance || a.sessionId));
                  return (
                    <div key={a.id} className="ens-absence-item">
                      <div className="ens-absence-avatar">{sName[0]}</div>
                      <div className="ens-absence-info">
                        <div className="ens-absence-name">{sName}</div>
                        <div className="ens-absence-meta">{moduleName(sess?.idModule || sess?.moduleId)} · {a.dateSaisie || a.date}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="page-card animate-up">
            <div className="page-card-header">
              <h3 className="page-card-title">Dernières Annonces</h3>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {recentAnnouncements.map(ann => (
                <div key={ann.id} className={`ens-annonce-row ${(ann.urgent || ann.urgente) ? 'ens-urgent' : ''}`} onClick={() => navigate('/announcements')}>
                  <div className="ens-annonce-content">
                    <div className="ens-annonce-title">{ann.titre || ann.title}</div>
                    <div className="ens-annonce-date">{new Date(ann.dateCreation || ann.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .ens-sessions-list { display: flex; flex-direction: column; }
        .ens-session-row { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); gap: 16px; transition: all 0.2s; }
        .ens-session-row:hover { background: var(--surface-2); }
        .ens-today { border-left: 4px solid var(--blue-mid); background: #f0f7ff; }
        .ens-cancelled { opacity: 0.6; filter: grayscale(1); }
        .ens-session-time { display: flex; flex-direction: column; width: 60px; font-weight: 700; color: var(--blue-mid); font-size: 0.85rem; line-height: 1.2; }
        .ens-time-sep { font-size: 0.7rem; opacity: 0.5; margin: 2px 0; }
        .ens-session-type-pill { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; min-width: 65px; text-align: center; }
        .ens-session-info { flex: 1; }
        .ens-session-module { font-size: 0.95rem; font-weight: 700; color: var(--blue-dark); margin-bottom: 4px; }
        .ens-session-meta { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-3); font-weight: 600; }
        
        .ens-module-item { display: flex; padding: 16px 20px; border-bottom: 1px solid var(--border); gap: 16px; align-items: center; transition: all 0.2s; cursor: pointer; }
        .ens-module-item:hover { background: var(--surface-2); }
        .ens-module-code { width: 44px; height: 44px; background: var(--blue-mid); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; text-align: center; line-height: 1.1; padding: 4px; }
        .ens-module-body { flex: 1; }
        .ens-module-title { font-weight: 700; color: var(--blue-dark); font-size: 0.9rem; margin-bottom: 4px; }
        .ens-module-meta { display: flex; align-items: center; gap: 12px; }
        
        .ens-absence-item { display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border); gap: 12px; }
        .ens-absence-avatar { width: 32px; height: 32px; background: #fee2e2; color: #991b1b; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
        .ens-absence-info { flex: 1; }
        .ens-absence-name { font-weight: 700; font-size: 0.85rem; color: var(--blue-dark); }
        .ens-absence-meta { font-size: 0.75rem; color: var(--text-3); font-weight: 500; }
        
        .ens-annonce-row { padding: 14px 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
        .ens-annonce-row:hover { background: var(--surface-1); }
        .ens-urgent { border-left: 3px solid var(--danger); }
        .ens-annonce-title { font-weight: 700; font-size: 0.85rem; color: var(--blue-dark); margin-bottom: 2px; }
        .ens-annonce-date { font-size: 0.7rem; color: var(--text-3); }

        .ens-day-divider { padding: 8px 20px; background: var(--surface-2); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-3); letter-spacing: 1px; border-bottom: 1px solid var(--border); }
      `}</style>
    </div>
  );
};

export default EnseignantDashboard;
