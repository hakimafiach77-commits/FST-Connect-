import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

/* ── Constants ───────────────────────────────────────────── */
const DAY_NAMES = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TYPE_COLORS = {
  Cours:  { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  TD:     { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  TP:     { bg: '#ffedd5', color: '#c2410c', dot: '#f97316' },
  Examen: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};
const STATUT_COLORS = {
  INJUSTIFIEE: { bg: '#fee2e2', color: '#991b1b', label: 'Injustifiée' },
  JUSTIFIEE:   { bg: '#d1fae5', color: '#065f46', label: 'Justifiée' },
  EN_ATTENTE:  { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
};

/* ── Helpers ─────────────────────────────────────────────── */
const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const avatarColor = (name = '') => {
  const palette = ['#1e40af', '#065f46', '#c2410c', '#5b21b6', '#0369a1', '#92400e'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};

/* ── Sub-components ──────────────────────────────────────── */
const KpiCard = ({ icon, label, value, sub, colorClass }) => (
  <div className="abs-kpi-card">
    <div className={`abs-kpi-icon ${colorClass}`}>{icon}</div>
    <div className="abs-kpi-body">
      <div className="abs-kpi-value">{value}</div>
      <div className="abs-kpi-label">{label}</div>
      {sub && <div className="abs-kpi-sub">{sub}</div>}
    </div>
  </div>
);

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
      <div className="toast-icon">
        {toast.type === 'success' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}><path d="M20 6L9 17l-5-5" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--danger)' }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        )}
      </div>
      <div className="toast-body">
        <div className="toast-title">{toast.type === 'success' ? 'Succès' : 'Erreur'}</div>
        <div className="toast-msg">{toast.msg}</div>
      </div>
      <button onClick={onClose} style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: '.8rem' }}>✕</button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const TeacherAbsences = () => {
  const { currentUser } = useAuth();
  const { db, save, remove, fetchSync, moduleName, groupName, roomName, studentName } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  /* ── View state ── */
  const [activeView, setActiveView] = useState('appel');   // 'appel' | 'historique'

  /* ── Appel state ── */
  const [selectedSessionId, setSelectedSessionId] = useState(location.state?.sessionId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [absentStudentIds, setAbsentStudentIds] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [saved, setSaved] = useState(false);

  /* ── Historique state ── */
  const [histFilter, setHistFilter] = useState('all');     // 'all' | 'INJUSTIFIEE' | 'JUSTIFIEE' | 'EN_ATTENTE'
  const [histSearch, setHistSearch] = useState('');

  /* ── Justif modal ── */
  const [justifModal, setJustifModal] = useState(null);    // absence object

  /* ── Toast ── */
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const teacher = useMemo(() => db.enseignants.find(t => t.utilisateurId == currentUser?.id), [db.enseignants, currentUser?.id]);
  const teacherId = teacher?.idEnseignant || teacher?.id;

  /* ── Data derivations ── */
  const mySessions = useMemo(() =>
    db.seances.filter(s => (s.idEnseignant == teacherId || s.teacherId == teacherId) && s.statut !== 'ANNULEE'),
    [db.seances, teacherId]);

  const selectedSession = useMemo(() =>
    db.seances.find(s => (s.id == selectedSessionId || s.idSeance == selectedSessionId)),
    [db.seances, selectedSessionId]);

  const studentsInGroup = useMemo(() => {
    if (!selectedSession) return [];
    const groupId = selectedSession.idGroupe || selectedSession.groupId;
    return db.etudiants.filter(s =>
      s.idGroupeTD == groupId || s.idGroupeTP == groupId ||
      s.groupTDId == groupId || s.groupTPId == groupId
    );
  }, [db.etudiants, selectedSession]);

  const filteredStudents = useMemo(() =>
    studentsInGroup.filter(s => {
      const u = db.utilisateurs.find(user => user.id === s.utilisateurId);
      const fullName = u ? `${u.prenom} ${u.nom}` : (s.name || '');
      return fullName.toLowerCase().includes(searchQ.toLowerCase()) ||
             (s.CNE || '').toLowerCase().includes(searchQ.toLowerCase());
    }),
    [studentsInGroup, searchQ, db.utilisateurs]);

  /* Load pre-existing absences when session/date changes */
  useEffect(() => {
    if (selectedSession && selectedDate) {
      const sessId = selectedSession.id || selectedSession.idSeance;
      const existing = db.absences.filter(
        a => (a.idSeance == sessId || a.sessionId == sessId)
      );
      setAbsentStudentIds(existing.map(a => a.idEtudiant || a.studentId));
      setSaved(existing.length > 0);
    } else {
      setAbsentStudentIds([]);
      setSaved(false);
    }
  }, [selectedSession, selectedDate, db.absences]);

  /* ── Historique data ── */
  const mySessionIds = useMemo(() => new Set(mySessions.map(s => s.id)), [mySessions]);

  const allMyAbsences = useMemo(() =>
    db.absences
      .filter(a => mySessionIds.has(a.idSeance || a.sessionId))
      .sort((a, b) => (b.dateSaisie || b.date || '').localeCompare(a.dateSaisie || a.date || '')),
    [db.absences, mySessionIds]);

  const filteredAbsences = useMemo(() => {
    let list = allMyAbsences;
    if (histFilter !== 'all') list = list.filter(a => a.statut === histFilter);
    if (histSearch) {
      const q = histSearch.toLowerCase();
      list = list.filter(a => {
        const student = db.etudiants.find(s => s.id === (a.idEtudiant || a.studentId));
        const u = student ? db.utilisateurs.find(user => user.id === student.utilisateurId) : null;
        const fullName = u ? `${u.prenom} ${u.nom}` : (student?.name || '');
        const session = db.seances.find(s => s.id === (a.idSeance || a.sessionId));
        return (
          fullName.toLowerCase().includes(q) ||
          (student?.CNE || '').toLowerCase().includes(q) ||
          moduleName(session?.idModule || session?.moduleId).toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [allMyAbsences, histFilter, histSearch, db.etudiants, db.utilisateurs, db.seances, moduleName]);

  /* ── Quick counts (for sidebar) ── */
  const stats = useMemo(() => ({
    total:   allMyAbsences.length,
    injust:  allMyAbsences.filter(a => a.statut === 'INJUSTIFIEE').length,
    just:    allMyAbsences.filter(a => a.statut === 'JUSTIFIEE').length,
    pending: allMyAbsences.filter(a => a.statut === 'EN_ATTENTE').length,
  }), [allMyAbsences]);

  /* ── Actions ── */
  const toggleAbsence = (studentId) => {
    setSaved(false);
    setAbsentStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const markAll = (absent) => {
    setSaved(false);
    setAbsentStudentIds(absent ? filteredStudents.map(s => s.id) : []);
  };

  const handleSaveAbsences = async () => {
    if (!selectedSession) return;

    try {
      await api('/absences', {
        method: 'POST',
        body: JSON.stringify({
          idEtudiants: absentStudentIds,
          // Bug #1 fix: prefer the real DB primary key idSeance over the normalized alias 'id'
          idSeance: selectedSession.idSeance || selectedSession.id,
          typeSeance: selectedSession.type
        })
      });

      setSaved(true);
      // Bug #2 fix: re-fetch the full state so db.absences is refreshed immediately,
      // making the Historique tab and dashboard badge reflect the newly saved roll-call.
      await fetchSync();
      showToast('success', `Feuille de présence enregistrée — ${absentStudentIds.length} absence(s) saisie(s).`);
    } catch (error) {
      showToast('error', error.message || 'Erreur lors de la sauvegarde des absences.');
    }
  };

  const handleValidateJustif = (absence, decision) => {
    save('absences', {
      ...absence,
      statut: decision === 'accept' ? 'JUSTIFIEE' : 'INJUSTIFIEE',
      justificatif: absence.justificatif
        ? { ...absence.justificatif, statutJustif: decision === 'accept' ? 'VALIDEE' : 'REJETEE' }
        : null,
    });
    setJustifModal(null);
    showToast('success', decision === 'accept' ? 'Justificatif validé.' : 'Justificatif rejeté.');
  };

  /* ── Render helpers ── */
  const presentCount  = studentsInGroup.length - absentStudentIds.length;
  const attendanceRate = studentsInGroup.length > 0
    ? Math.round((presentCount / studentsInGroup.length) * 100)
    : 0;

  return (
    <div className="animate-up">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Justif Modal ── */}
      {justifModal && (
        <JustifModal
          absence={justifModal}
          student={db.etudiants.find(s => s.id === (justifModal.idEtudiant || justifModal.studentId))}
          session={db.seances.find(s => s.id === (justifModal.idSeance || justifModal.sessionId))}
          moduleName={moduleName}
          db={db}
          onAccept={() => handleValidateJustif(justifModal, 'accept')}
          onReject={() => handleValidateJustif(justifModal, 'reject')}
          onClose={() => setJustifModal(null)}
        />
      )}

      {/* ── Page Hero ── */}
      <div className="abs-page-hero">
        <div className="abs-hero-left">
          <div className="abs-hero-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div>
            <h2 className="page-hero-title">Gestion des Absences</h2>
            <p className="page-hero-sub">Appel en ligne · Suivi de l'assiduité · Validation des justificatifs</p>
          </div>
        </div>
        <div className="abs-view-tabs">
          {[
            { key: 'appel',      label: 'Faire l\'appel' },
            { key: 'historique', label: 'Historique' },
          ].map(t => (
            <button
              key={t.key}
              className={`abs-view-tab ${activeView === t.key ? 'active' : ''}`}
              onClick={() => setActiveView(t.key)}
            >
              {t.label}
              {t.key === 'historique' && stats.pending > 0 && (
                <span className="abs-tab-badge">{stats.pending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════ VIEW: APPEL ══════════════ */}
      {activeView === 'appel' && (
        <div className="abs-appel-layout">
          {/* LEFT — session selector + student list */}
          <div className="abs-appel-main">

            {/* Session Selector Card */}
            <div className="page-card">
              <div className="page-card-header">
                <h3 className="page-card-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Sélection de la séance
                </h3>
              </div>
              <div className="page-card-body">
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label className="form-label">Séance</label>
                    <select
                      className="form-control"
                      value={selectedSessionId}
                      onChange={e => setSelectedSessionId(e.target.value)}
                    >
                      <option value="">— Choisir une séance —</option>
                        {mySessions.map(s => {
                          const start = s.heureDebut || s.startSlot || '—';
                          const end = s.heureFin || s.endSlot || '—';
                          const dayLabel = s.jour || DAY_NAMES[s.jourNum || s.day] || '—';
                          return (
                            <option key={s.id || s.idSeance} value={s.id || s.idSeance}>
                              {dayLabel} · {start}–{end} · {moduleName(s.idModule || s.moduleId)} ({groupName(s.idGroupe || s.groupId)}) [{s.type}]
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date de la séance</label>
                    <input
                      type="date"
                      className="form-control"
                      value={selectedDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={e => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>

                {selectedSession && (
                  <div className="abs-session-info-bar">
                    <div className="abs-session-pill" style={{
                      background: TYPE_COLORS[selectedSession.type]?.bg,
                      color: TYPE_COLORS[selectedSession.type]?.color,
                      borderLeft: `3px solid ${TYPE_COLORS[selectedSession.type]?.dot}`,
                    }}>
                      {selectedSession.type}
                    </div>
                    <span className="abs-sib-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, opacity: .6 }}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                      {moduleName(selectedSession.idModule || selectedSession.moduleId)}
                    </span>
                    <span className="abs-sib-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, opacity: .6 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                      {groupName(selectedSession.idGroupe || selectedSession.groupId)}
                    </span>
                    <span className="abs-sib-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, opacity: .6 }}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                      {roomName(selectedSession.idSalle || selectedSession.roomId)}
                    </span>
                    <span className="abs-sib-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, opacity: .6 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {selectedSession.heureDebut || selectedSession.startSlot} — {selectedSession.heureFin || selectedSession.endSlot}
                    </span>
                    {saved && (
                      <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        Appel sauvegardé
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Student List Card */}
            {selectedSession ? (
              <div className="page-card">
                <div className="page-card-header">
                  <h3 className="page-card-title">
                    Feuille de présence
                    <span className="abs-count-chip">{studentsInGroup.length} étudiants</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => markAll(false)}>Tous présents</button>
                    <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }} onClick={() => markAll(true)}>Tous absents</button>
                  </div>
                </div>

                {/* Search bar */}
                <div className="abs-search-bar">
                  <div className="search-wrap">
                    <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Rechercher par nom ou CNE..."
                      value={searchQ}
                      onChange={e => setSearchQ(e.target.value)}
                    />
                  </div>
                  <div className="abs-presence-summary">
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>{presentCount} présents</span>
                    <span style={{ color: 'var(--text-3)', margin: '0 .3rem' }}>·</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{absentStudentIds.length} absents</span>
                  </div>
                </div>

                <div className="abs-student-list">
                  {filteredStudents.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                      <p>Aucun étudiant trouvé</p>
                    </div>
                  ) : (
                      filteredStudents.map((student, idx) => {
                        const isAbsent = absentStudentIds.includes(student.id);
                        const u = db.utilisateurs.find(user => user.id === student.utilisateurId);
                        const fullName = u ? `${u.prenom} ${u.nom}` : (student.name || '');
                        const color = avatarColor(fullName);
                        return (
                          <div
                            key={student.id}
                            className={`abs-student-row ${isAbsent ? 'is-absent' : 'is-present'}`}
                            onClick={() => toggleAbsence(student.id)}
                          >
                            <div className="abs-row-num">{idx + 1}</div>
                            <div className="abs-student-avatar" style={{ background: isAbsent ? '#fee2e2' : `${color}18`, color: isAbsent ? '#991b1b' : color }}>
                              {initials(fullName)}
                            </div>
                            <div className="abs-student-info">
                              <div className="abs-student-name">{fullName}</div>
                              <div className="abs-student-meta">
                                <span className="abs-cne">{student.CNE}</span>
                                {student.statut === 'REDOUBLANT' && <span className="badge badge-yellow" style={{ fontSize: '.65rem' }}>Redoublant</span>}
                              </div>
                            </div>
                          <div className="abs-toggle-wrap">
                            <button
                              className={`abs-toggle-btn ${!isAbsent ? 'present' : ''}`}
                              onClick={e => { e.stopPropagation(); if (isAbsent) toggleAbsence(student.id); }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                              Présent
                            </button>
                            <button
                              className={`abs-toggle-btn ${isAbsent ? 'absent' : ''}`}
                              onClick={e => { e.stopPropagation(); if (!isAbsent) toggleAbsence(student.id); }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              Absent
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="abs-card-footer">
                  <span style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>
                    Cliquer sur un étudiant pour basculer sa présence
                  </span>
                  <button className="btn btn-primary" onClick={handleSaveAbsences}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                    </svg>
                    Enregistrer l'appel
                  </button>
                </div>
              </div>
            ) : (
              <div className="page-card">
                <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                  <div className="empty-state-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .3 }}>
                      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <h3>Commencer l'appel</h3>
                  <p>Sélectionnez une séance et une date ci-dessus pour afficher la liste des étudiants et saisir les présences.</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div className="abs-appel-side">
            {/* Résumé */}
            <div className="page-card">
              <div className="page-card-header">
                <h3 className="page-card-title">Résumé de l'appel</h3>
              </div>
              <div className="page-card-body">
                {selectedSession ? (
                  <>
                    {/* Attendance donut-like visual */}
                    <div className="abs-donut-wrap">
                      <div className="abs-donut-circle" style={{ background: `conic-gradient(var(--success) 0% ${attendanceRate}%, var(--danger) ${attendanceRate}% 100%)` }}>
                        <div className="abs-donut-inner">
                          <div className="abs-donut-val">{attendanceRate}%</div>
                          <div className="abs-donut-lbl">présence</div>
                        </div>
                      </div>
                    </div>
                    <div className="abs-summary-rows">
                      <div className="abs-summary-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="abs-dot" style={{ background: 'var(--success)' }} />
                          <span style={{ fontSize: '.85rem', color: 'var(--text-2)' }}>Présents</span>
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--success)' }}>{presentCount}</span>
                      </div>
                      <div className="abs-summary-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="abs-dot" style={{ background: 'var(--danger)' }} />
                          <span style={{ fontSize: '.85rem', color: 'var(--text-2)' }}>Absents</span>
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--danger)' }}>{absentStudentIds.length}</span>
                      </div>
                      <div className="abs-summary-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="abs-dot" style={{ background: 'var(--text-3)' }} />
                          <span style={{ fontSize: '.85rem', color: 'var(--text-2)' }}>Total inscrits</span>
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{studentsInGroup.length}</span>
                      </div>
                    </div>
                    <div className="ens-progress-bar" style={{ marginTop: '.75rem' }}>
                      <div
                        className="ens-progress-fill"
                        style={{ width: `${attendanceRate}%`, background: attendanceRate >= 75 ? 'var(--success)' : attendanceRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}
                      />
                    </div>
                    {absentStudentIds.length > 0 && (
                      <div style={{ marginTop: '1.25rem' }}>
                        <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.6rem' }}>Absents désignés</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                          {absentStudentIds.map(sid => {
                            const s = db.etudiants.find(st => st.id === sid);
                            const u = s ? db.utilisateurs.find(user => user.id === s.utilisateurId) : null;
                            const fullName = u ? `${u.prenom} ${u.nom}` : (s?.name || '?');
                            if (!s) return null;
                            return (
                              <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.35rem .5rem', background: '#fef2f2', borderRadius: 6 }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 700, flexShrink: 0 }}>
                                  {initials(fullName)}
                                </div>
                                <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#991b1b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</span>
                                <button
                                  style={{ color: '#fca5a5', flexShrink: 0, fontSize: '.75rem' }}
                                  onClick={() => toggleAbsence(sid)}
                                  title="Marquer présent"
                                >✕</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: '.85rem', color: 'var(--text-3)', textAlign: 'center', padding: '1rem 0' }}>
                    Aucune séance sélectionnée
                  </p>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="page-card">
              <div className="page-card-header">
                <h3 className="page-card-title">Vue globale</h3>
              </div>
              <div className="page-card-body" style={{ padding: '1rem' }}>
                <div className="abs-mini-kpis">
                  <div className="abs-mini-kpi">
                    <div className="abs-mini-val" style={{ color: 'var(--blue-dark)' }}>{stats.total}</div>
                    <div className="abs-mini-lbl">Total</div>
                  </div>
                  <div className="abs-mini-kpi">
                    <div className="abs-mini-val" style={{ color: 'var(--danger)' }}>{stats.injust}</div>
                    <div className="abs-mini-lbl">Injustifiées</div>
                  </div>
                  <div className="abs-mini-kpi">
                    <div className="abs-mini-val" style={{ color: 'var(--success)' }}>{stats.just}</div>
                    <div className="abs-mini-lbl">Justifiées</div>
                  </div>
                  <div className="abs-mini-kpi">
                    <div className="abs-mini-val" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
                    <div className="abs-mini-lbl">En attente</div>
                  </div>
                </div>
                {stats.pending > 0 && (
                  <button
                    className="btn btn-ghost btn-sm btn-block"
                    style={{ marginTop: '.75rem' }}
                    onClick={() => setActiveView('historique')}
                  >
                    Traiter les justificatifs →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ VIEW: HISTORIQUE ══════════════ */}
      {activeView === 'historique' && (
        <div className="page-card">
          <div className="page-card-header">
            <h3 className="page-card-title">Historique des absences</h3>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <select
                className="filter-select"
                value={histFilter}
                onChange={e => setHistFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="INJUSTIFIEE">Injustifiées</option>
                <option value="JUSTIFIEE">Justifiées</option>
                <option value="EN_ATTENTE">En attente</option>
              </select>
            </div>
          </div>
          <div className="filter-bar" style={{ paddingTop: '.75rem', paddingBottom: '.75rem' }}>
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher par étudiant, CNE ou module..."
                value={histSearch}
                onChange={e => setHistSearch(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '.82rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
              {filteredAbsences.length} résultat(s)
            </div>
          </div>
          <div className="table-wrap">
            {filteredAbsences.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .3 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
                <h3>Aucune absence trouvée</h3>
                <p>Modifiez vos filtres ou vérifiez que des appels ont été saisis.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Module · Séance</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Justificatif</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredAbsences.map(a => {
                      const std = db.etudiants.find(s => s.id === (a.idEtudiant || a.studentId));
                      const u = std ? db.utilisateurs.find(user => user.id === std.utilisateurId) : null;
                      const fullName = u ? `${u.prenom} ${u.nom}` : (std?.name || '—');
                      const session = db.seances.find(s => s.id === (a.idSeance || a.sessionId));
                      const sc      = STATUT_COLORS[a.statut] || STATUT_COLORS.INJUSTIFIEE;
                      const tc      = TYPE_COLORS[session?.type] || TYPE_COLORS.Cours;
                      const color   = avatarColor(fullName);
                      const start   = session?.heureDebut || session?.startSlot || '—';
                      return (
                        <tr key={a.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, flexShrink: 0 }}>
                                {initials(fullName)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '.87rem', color: 'var(--text)' }}>{fullName}</div>
                                <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{std?.CNE}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--blue-dark)' }}>{moduleName(session?.idModule || session?.moduleId)}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{session ? `${session.jour || DAY_NAMES[session.jourNum || session.day] || '—'} ${start}` : '—'}</div>
                          </td>
                          <td style={{ fontSize: '.84rem', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                            {new Date(a.dateSaisie || a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td>
                            <span className="badge" style={{ background: tc.bg, color: tc.color }}>
                              {session?.type || '—'}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                              {sc.label}
                            </span>
                          </td>
                        <td style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>
                          {a.justificatif
                            ? <span style={{ color: 'var(--text-2)' }}>{a.justificatif.motif}</span>
                            : <span style={{ color: 'var(--text-3)' }}>—</span>
                          }
                        </td>
                        <td>
                          {a.statut === 'EN_ATTENTE' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setJustifModal(a)}
                            >
                              Traiter
                            </button>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setJustifModal(a)}
                            >
                              Détails
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

/* ── Justif Modal ────────────────────────────────────────── */
const JustifModal = ({ absence, student, session, moduleName, onAccept, onReject, onClose, db }) => {
  const sc = STATUT_COLORS[absence.statut] || STATUT_COLORS.INJUSTIFIEE;
  const isPending = absence.statut === 'EN_ATTENTE';
  const u = student ? db.utilisateurs.find(user => user.id === student.utilisateurId) : null;
  const fullName = u ? `${u.prenom} ${u.nom}` : (student?.name || '—');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <div className="modal-hdr-title">Fiche d'absence</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bdy">
          {/* Student */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 10, marginBottom: '1.25rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${avatarColor(fullName)}20`, color: avatarColor(fullName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
              {initials(fullName)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--blue-dark)' }}>{fullName}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>{student?.CNE} · {u?.email}</div>
            </div>
            <span className="badge" style={{ background: sc.bg, color: sc.color, marginLeft: 'auto' }}>
              {sc.label}
            </span>
          </div>

          {/* Absence details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Module', value: moduleName(session?.idModule || session?.moduleId) },
              { label: 'Type de séance', value: session?.type || '—' },
              { label: 'Date', value: (absence.dateSaisie || absence.date) ? new Date(absence.dateSaisie || absence.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
              { label: 'Horaire', value: session ? `${session.heureDebut || session.startSlot} — ${session.heureFin || session.endSlot}` : '—' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '.75rem', background: 'var(--surface-2)', borderRadius: 8 }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.25rem' }}>{item.label}</div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Justificatif */}
          <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '1rem' }}>
            <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.75rem' }}>Justificatif</div>
            {absence.justificatif ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <span style={{ fontSize: '.82rem', color: 'var(--text-2)', fontWeight: 500 }}>Motif :</span>
                  <span style={{ fontSize: '.82rem', color: 'var(--text)', fontWeight: 700 }}>{absence.justificatif.motif}</span>
                </div>
                {absence.justificatif.fichier ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .75rem', background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    <span style={{ fontSize: '.8rem', color: '#2563eb', fontWeight: 600 }}>{absence.justificatif.fichier}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '.8rem', color: 'var(--text-3)', fontStyle: 'italic' }}>Aucun document joint</div>
                )}
                <div style={{ marginTop: '.25rem' }}>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Statut du justificatif : </span>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: absence.justificatif.statutJustif === 'VALIDEE' ? 'var(--success)' : absence.justificatif.statutJustif === 'REJETEE' ? 'var(--danger)' : 'var(--warning)' }}>
                    {absence.justificatif.statutJustif}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-3)', fontSize: '.84rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                Aucun justificatif soumis par l'étudiant.
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          {isPending && (
            <>
              <button className="btn btn-danger" onClick={onReject}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                Rejeter
              </button>
              <button className="btn btn-success" onClick={onAccept}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                Valider
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAbsences;
