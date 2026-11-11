import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EnseignantDashboard from './enseignant/EnseignantDashboard';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
  const { db, filiereName, studentName } = useData();
  const { currentUser, isAdmin, isTeacher } = useAuth();
  const navigate = useNavigate();

  const adminStats = useMemo(() => {
    if (!isAdmin()) return null;
    return {
      totalStudents: db.etudiants.length,
      totalTeachers: db.enseignants.length,
      activeFilieres: db.filieres.length,
      unjustifiedAbsences: db.absences.filter(a => a.statut === 'INJUSTIFIEE').length
    };
  }, [db, isAdmin]);

  const userStats = useMemo(() => {
    if (isAdmin()) return null;
    if (isTeacher()) {
      const teacher = db.enseignants.find(t => t.utilisateurId === currentUser.id);
      const teacherId = teacher?.id;
      const myModules = db.modules.filter(m => m.idEnseignant === teacherId || m.teacherId === teacherId).length;
      const mySessions = db.seances.filter(s => s.idEnseignant === teacherId || s.teacherId === teacherId).length;
      return [
        { label: 'Mes Modules', val: myModules, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>, color: 'blue' },
        { label: 'Séances Hebdo', val: mySessions, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, color: 'orange' }
      ];
    } else {
      const student = db.etudiants.find(s => s.utilisateurId === currentUser.id);
      const studentId = student?.id;
      const myAbs = db.absences.filter(a => a.idEtudiant === studentId || a.studentId === studentId).length;
      return [
        { label: 'Ma Filière', val: filiereName(student?.idFiliere || student?.filiereId), icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, color: 'purple' },
        { label: 'Mes Absences', val: myAbs, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>, color: 'red' }
      ];
    }
  }, [db, currentUser, isAdmin, isTeacher, filiereName]);

  const chartData = useMemo(() => {
    if (!isAdmin()) return null;

    // 1. Students by Filiere
    const filiereCounts = {};
    db.etudiants.forEach(s => {
      const code = filiereName(s.idFiliere || s.filiereId);
      filiereCounts[code] = (filiereCounts[code] || 0) + 1;
    });

    const studentsByFiliere = {
      labels: Object.keys(filiereCounts),
      datasets: [{
        label: 'Étudiants',
        data: Object.values(filiereCounts),
        backgroundColor: '#1e3a5f',
        borderRadius: 5,
        barThickness: 30
      }]
    };

    // 2. Student Status Distribution
    const statusCounts = {};
    db.etudiants.forEach(s => { 
      const label = s.statut || 'INCONNU';
      statusCounts[label] = (statusCounts[label] || 0) + 1; 
    });

    const statusDistribution = {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
        borderWidth: 0
      }]
    };

    // 3. Session Types
    const typeCounts = { 'Cours': 0, 'TD': 0, 'TP': 0, 'Examen': 0 };
    db.seances.forEach(s => { if (typeCounts[s.type] !== undefined) typeCounts[s.type]++; });

    const sessionTypes = {
      labels: Object.keys(typeCounts),
      datasets: [{
        data: Object.values(typeCounts),
        backgroundColor: ['#dbeafe', '#d1fae5', '#ffedd5', '#fee2e2'],
        borderColor: ['#3b82f6', '#10b981', '#f97316', '#ef4444'],
        borderWidth: 1
      }]
    };

    return { studentsByFiliere, statusDistribution, sessionTypes };
  }, [db, isAdmin, filiereName]);

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  // User Dashboard (Teacher/Student)
  if (isTeacher()) {
    return <EnseignantDashboard />;
  }

  // Student dashboard is handled by a different route (/etudiant/dashboard)
  // But we keep a fallback here
  return (
    <div className="dashboard-page">
      <div className="page-hero animate-up">
        <h2 className="page-hero-title">Content de vous revoir, {currentUser.prenom} {currentUser.nom} !</h2>
      </div>
    </div>
  );
};

export default Dashboard;

