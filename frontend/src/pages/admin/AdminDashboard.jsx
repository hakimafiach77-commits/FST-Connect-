import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Bell, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  MessageSquare,
  Briefcase
} from 'lucide-react';

// Help Icons
const MegaphoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue-mid)' }}>
    <path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8 a3 3 0 1 1-5.8-1.2"/>
  </svg>
);

const AdminDashboard = () => {
  const { db, studentName, filiereName, teacherName } = useData();
  const navigate = useNavigate();

  // Basic stats for small integrated display
  const quickStats = useMemo(() => ([
    { label: 'Étudiants', value: (db.etudiants?.length || db.students?.length || 0), icon: <Users size={16} />, color: 'var(--info)' },
    { label: 'Enseignants', value: (db.enseignants?.length || db.teachers?.length || 0), icon: <GraduationCap size={16} />, color: 'var(--orange)' },
    { label: 'Modules', value: db.modules?.length || 0, icon: <BookOpen size={16} />, color: 'var(--success)' },
    { label: 'PFEs', value: db.pfes?.length || 0, icon: <Briefcase size={16} />, color: 'var(--blue-mid)' },
  ]), [db]);

  const criticalAbsences = useMemo(() => {
    const etudiantsList = db.etudiants || db.students || [];
    return etudiantsList.map(s => {
      const absences = db.absences.filter(a => (a.idEtudiant === s.id || a.studentId === s.id)).length;
      const rate = (absences / 20) * 100; // Mock sessions count
      return { ...s, rate: rate.toFixed(1) };
    }).filter(s => parseFloat(s.rate) > 15).sort((a, b) => b.rate - a.rate).slice(0, 4);
  }, [db]);

  const pendingReclamations = useMemo(() => {
    return (db.reclamations || []).filter(r => r.statut === 'SOUMISE').slice(0, 4);
  }, [db]);

  const recentPFEs = useMemo(() => {
    return (db.pfes || []).filter(p => p.statut === 'EN_COURS').slice(0, 4);
  }, [db]);

  const recentAnnouncements = useMemo(() => {
    return [...(db.announcements || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  }, [db]);

  return (
    <div className="dashboard-page fade-in">
      {/* Hero Section - Clean & Institutional */}
      <div className="page-hero animate-up" style={{ marginBottom: '24px' }}>
        <div className="page-hero-left">
          <h2 className="page-hero-title">Espace Direction — Chef de Département</h2>
          <p className="page-hero-sub">
            Vue d'ensemble opérationnelle • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost btn-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={() => navigate('/annonces')}>
            <Bell size={16} style={{ marginRight: '8px', color: 'var(--blue-mid)' }} /> {db.announcements.length} Annonces
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/edt')}>
            <Calendar size={16} style={{ marginRight: '8px' }} /> Planning Global
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Operational Flows */}
        <div className="dg-left" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section: Alerts & Monitoring */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="var(--danger)" />
                <h3 className="page-card-title">Vigilance Absences</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/absences')}>Détails</button>
            </div>
            <div className="page-card-body">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', fontSize: '0.7rem' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-3)' }}>ÉTUDIANT</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-3)' }}>FILIÈRE</th>
                    <th style={{ textAlign: 'right', padding: '10px 16px', color: 'var(--text-3)' }}>TAUX</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalAbsences.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: '700', color: 'var(--blue-dark)' }}>{studentName(s.id)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-2)' }}>{filiereName(s.idFiliere || s.filiereId)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontWeight: '800', color: parseFloat(s.rate) > 25 ? 'var(--danger)' : 'var(--orange)' }}>{s.rate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Pending Reclamations */}
          <div className="page-card animate-up" style={{ animationDelay: '0.1s' }}>
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageSquare size={20} color="var(--orange)" />
                <h3 className="page-card-title">Réclamations en attente</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reclamations')}>Traiter</button>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {pendingReclamations.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem' }}>Aucune réclamation non traitée.</div>
              ) : (
                pendingReclamations.map(r => (
                  <div key={r.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--blue-dark)' }}>{studentName(r.idEtudiant || r.studentId)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Motif: {r.description.length > 40 ? r.description.slice(0, 40) + '...' : r.description}</div>
                    </div>
                    <ArrowRight size={14} color="var(--text-3)" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Projects PFE Status */}
          <div className="page-card animate-up" style={{ animationDelay: '0.2s' }}>
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={20} color="var(--blue-mid)" />
                <h3 className="page-card-title">Suivi des Projets (PFE)</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/pfe')}>Dossiers</button>
            </div>
            <div className="page-card-body">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg)', fontSize: '0.7rem' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-3)' }}>PROJET</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-3)' }}>ENCADRANT</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPFEs.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--blue-dark)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titre}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-2)' }}>{teacherName(p.idEncadrant || p.encadrantId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Summaries & Quick Access */}
        <div className="dg-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Stats Integration */}
          <div className="page-card animate-up" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="page-card-body" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={14} /> Indicateurs Clés
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {quickStats.map((st, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '4px' }}>
                       {st.icon} {st.label}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--blue-dark)' }}>{st.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Flash Annonces */}
          <div className="page-card animate-up">
            <div className="page-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <MegaphoneIcon /> 
                 <h3 className="page-card-title">Flash Annonces</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/annonces')}>Gérer</button>
            </div>
            <div className="page-card-body" style={{ padding: 0 }}>
              {recentAnnouncements.map(ann => (
                <div key={ann.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                   {ann.urgente && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: 'var(--danger)' }}></div>}
                   <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--blue-dark)', marginBottom: '4px' }}>{ann.title}</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                      <span style={{ fontWeight: '600', color: 'var(--blue-mid)' }}>Cible: {ann.cible || ann.target}</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>




        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
