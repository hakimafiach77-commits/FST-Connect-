import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const DAYS_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS  = ['08:30','10:30','14:30','16:30'];

const TYPE_COLORS = {
  Cours: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
  CM:    { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
  TD:    { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  TP:    { bg: '#ffedd5', border: '#f97316', text: '#c2410c' },
  Examen:{ bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
};

const EmploiDuTemps = () => {
  const { currentUser } = useAuth();
  const { db, moduleName, teacherName, roomName, groupName, filiereName } = useData();
  const [weekOffset, setWeekOffset] = useState(0);

  const student = useMemo(() => 
    (db.etudiants || []).find(s => s && (s.utilisateurId == currentUser?.id || s.idEtudiant == currentUser?.id)) || currentUser?.etudiant, 
  [db.etudiants, currentUser]);

  if (!student) return <div className="empty-state"><p>Profil étudiant introuvable.</p></div>;

  const mySessions = useMemo(() => {
    const gidTD = student.idGroupeTD || student.groupTDId;
    const gidTP = student.idGroupeTP || student.groupTPId;
    const sfid = student.idFiliere || student.filiereId;

    return (db.seances || []).filter(s => {
      const sidGroup = s.idGroupe || s.groupId;
      const isMyGroup = (sidGroup === gidTD || sidGroup === gidTP);
      
      // Also show sessions for the whole filiere if no group is assigned to the session
      const sidFiliere = s.idFiliere || s.filiereId;
      const isMyFiliere = sidFiliere === sfid;

      return isMyGroup || (isMyFiliere && !sidGroup);
    });
  }, [db.seances, student]);

  const getWeekLabel = (offset) => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + (offset * 7));
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${saturday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const weekLabel = weekOffset === 0 ? 'Semaine en cours' : weekOffset === -1 ? 'Semaine précédente' : 'Semaine suivante';

  // Get session for a given day name + approximate slot
  const getSession = (dayName, slotStart) => {
    return mySessions.find(s => {
      const sDay = s.jour || s.day;
      const sStart = s.heureDebut || s.startSlot || '';
      
      if (sDay !== dayName) return false;
      
      // Match approximate hour (e.g. 08:30 vs 08:00)
      const h1 = parseInt(sStart.split(':')[0]);
      const h2 = parseInt(slotStart.split(':')[0]);
      return h1 === h2;
    });
  };

  const handleExportPDF = () => {
    alert(`Export PDF déclenché pour ${student.cne || student.CNE}`);
  };

  return (
    <div>
      <div className="page-hero animate-up">
        <div className="page-hero-left">
          <h2 className="page-hero-title">Emploi du Temps</h2>
          <p className="page-hero-sub">
            {filiereName(student.idFiliere || student.filiereId)} {student.idGroupeTD ? `· ${groupName(student.idGroupeTD)}` : ''}
          </p>
        </div>
        <div className="page-hero-right">
          <button className="btn btn-primary btn-sm" onClick={handleExportPDF}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="page-card animate-up" style={{ marginBottom: '1.5rem' }}>
        <div className="page-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w - 1)}>← Précédente</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, color: 'var(--blue-dark)', fontSize: '1rem' }}>{weekLabel}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 600 }}>{getWeekLabel(weekOffset)}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w + 1)}>Suivante →</button>
        </div>
      </div>

      <div className="page-card animate-up" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ width: '80px' }}></th>
              {DAYS_LABELS.map(d => (
                <th key={d} style={{ background: 'var(--blue-dark)', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '.85rem', fontWeight: 800 }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot}>
                <td style={{ textAlign: 'right', paddingRight: '12px', fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)' }}>{slot}</td>
                {DAYS_LABELS.map(day => {
                  const sess = getSession(day, slot);
                  if (!sess) return <td key={day} style={{ background: 'var(--surface-2)', borderRadius: '8px', height: '80px', border: '1px dashed var(--border)' }}></td>;
                  
                  const colors = TYPE_COLORS[sess.type] || TYPE_COLORS.Cours;
                  const isAnnulee = sess.statut === 'ANNULEE';
                  
                  return (
                    <td key={day} style={{ padding: '2px' }}>
                      <div style={{ 
                        background: isAnnulee ? '#f1f5f9' : colors.bg, 
                        border: `1.5px solid ${isAnnulee ? '#cbd5e1' : colors.border}`,
                        borderRadius: '8px', padding: '10px', height: '80px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        opacity: isAnnulee ? 0.6 : 1,
                        cursor: 'pointer'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '.75rem', color: isAnnulee ? '#64748b' : colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {moduleName(sess.idModule || sess.moduleId)}
                        </div>
                        <div style={{ fontSize: '.65rem', marginTop: '4px', color: 'var(--text-3)', fontWeight: 600 }}>
                          {sess.heureDebut} - {sess.heureFin}
                        </div>
                        <div style={{ fontSize: '.65rem', marginTop: '2px', fontWeight: 700 }}>
                          {roomName(sess.idSalle || sess.roomId)}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-card animate-up" style={{ marginTop: '1.5rem' }}>
        <div className="page-card-header">
          <h3 className="page-card-title">Liste des séances</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Jour</th><th>Horaire</th><th>Module</th><th>Type</th><th>Salle</th><th>Enseignant</th>
              </tr>
            </thead>
            <tbody>
              {mySessions.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{s.jour || s.day}</td>
                  <td style={{ fontWeight: 600, fontSize: '.8rem' }}>{s.heureDebut} – {s.heureFin}</td>
                  <td style={{ fontWeight: 600 }}>{moduleName(s.idModule || s.moduleId)}</td>
                  <td><span className={`badge badge-${s.type === 'TP' ? 'orange' : s.type === 'TD' ? 'green' : 'blue'}`}>{s.type}</span></td>
                  <td>{roomName(s.idSalle || s.roomId)}</td>
                  <td>{teacherName(s.idEnseignant || s.teacherId)}</td>
                </tr>
              ))}
              {mySessions.length === 0 && <tr><td colSpan="6" className="table-empty">Aucune séance programmée.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmploiDuTemps;
