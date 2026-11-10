import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import EtudiantLayout from './layouts/EtudiantLayout';
import LandingPage from './pages/LandingPage';
import PublicEDT from './pages/PublicEDT';
import PublicStudents from './pages/PublicStudents';
import PublicClubs from './pages/PublicClubs';
import AuthScreen from './pages/AuthScreen';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Announcements from './pages/Announcements';

// ── Student modules ──────────────────────────────────────────────
import EtudiantDashboard from './pages/etudiant/EtudiantDashboard';
import EmploiDuTemps from './pages/etudiant/EmploiDuTemps';
import Absences from './pages/etudiant/Absences';
import Notes from './pages/etudiant/Notes';
import Projets from './pages/etudiant/Projets';
import Ressources from './pages/etudiant/Ressources';
import Profil from './pages/etudiant/Profil';
import Clubs from './pages/etudiant/Clubs';
import Formations from './pages/etudiant/Formations';

// ── Admin modules ──────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEtudiants from './pages/admin/AdminEtudiants';
import AdminEnseignants from './pages/admin/AdminEnseignants';
import AdminEDT from './pages/admin/AdminEDT';
import AdminAnnonces from './pages/admin/AdminAnnonces';
import AdminModules from './pages/admin/AdminModules';
import AdminAbsences from './pages/admin/AdminAbsences';
import AdminSalles from './pages/admin/AdminSalles';
import AdminFilieres from './pages/admin/AdminFilieres';
import AdminPFE from './pages/admin/AdminPFE';
import AdminReclamations from './pages/admin/AdminReclamations';
import AdminNotes from './pages/admin/AdminNotes';

import TeacherGrades from './pages/enseignant/TeacherGrades';
import MonPlanning from './pages/enseignant/MonPlanning';
import TeacherAbsences from './pages/enseignant/TeacherAbsences';
import TeacherModules from './pages/enseignant/TeacherModules';
import ModulesRouter from './pages/ModulesRouter';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── PUBLIC routes (accessible without login) ── */}
        <Route element={<PublicLayout />}>
          {/* "/" is the public landing page — entry point of the application */}
          <Route path="/"          element={<LandingPage />} />
          <Route path="/landing"   element={<LandingPage />} />
          <Route path="/auth"      element={<AuthScreen />} />
          <Route path="/edt"       element={<PublicEDT />} />
          <Route path="/etudiants" element={<PublicStudents />} />
          <Route path="/clubs"     element={<PublicClubs />} />
        </Route>

        {/* ── Main App routes (Admin & Teacher shared) ── */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>

        {/* ── Admin specific routes ── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/registre"      element={<AdminEtudiants />} />
            <Route path="/enseignants"   element={<AdminEnseignants />} />
            <Route path="/admin/edt"     element={<AdminEDT />} />
            <Route path="/annonces"      element={<AdminAnnonces />} />
            <Route path="/modules"       element={<AdminModules />} />
            <Route path="/absences"      element={<AdminAbsences />} />
            <Route path="/salles"        element={<AdminSalles />} />
            <Route path="/filieres"      element={<AdminFilieres />} />
            <Route path="/notes"         element={<AdminNotes />} />
            <Route path="/pfe"           element={<AdminPFE />} />
            <Route path="/reclamations"  element={<AdminReclamations />} />
            
            <Route path="/students"      element={<Navigate to="/registre" replace />} />
            <Route path="/teachers"      element={<Navigate to="/enseignants" replace />} />
            <Route path="/grades"        element={<Navigate to="/notes" replace />} />
            <Route path="/schedule"      element={<Navigate to="/admin/edt" replace />} />
          </Route>
        </Route>

        {/* ── Teacher specific routes ── */}
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route element={<AppLayout />}>
            <Route path="/teacher/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/teacher/planning"  element={<MonPlanning />} />
            <Route path="/teacher/absences"  element={<TeacherAbsences />} />
            <Route path="/teacher/notes"     element={<TeacherGrades />} />
            <Route path="/teacher/modules"   element={<TeacherModules />} />
            
            <Route path="/schedule"          element={<Navigate to="/teacher/planning" replace />} />
            <Route path="/absences"          element={<Navigate to="/teacher/absences" replace />} />
            <Route path="/grades"            element={<Navigate to="/teacher/notes" replace />} />
            <Route path="/modules"           element={<Navigate to="/teacher/modules" replace />} />
          </Route>
        </Route>

        {/* ── Étudiant private routes (MODULE 9, 3, 6, 10, 12, 1, 13, 14, 5) ── */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route element={<EtudiantLayout />}>
            <Route path="/etudiant/dashboard"  element={<EtudiantDashboard />} />
            <Route path="/etudiant/profil"     element={<Profil />} />
            <Route path="/etudiant/edt"        element={<EmploiDuTemps />} />
            <Route path="/etudiant/absences"   element={<Absences />} />
            <Route path="/etudiant/notes"      element={<Notes />} />
            <Route path="/etudiant/projets"    element={<Projets />} />
            <Route path="/etudiant/ressources" element={<Ressources />} />
            <Route path="/etudiant/clubs"      element={<Clubs />} />
            <Route path="/etudiant/formations" element={<Formations />} />
            <Route path="/announcements"       element={<Announcements />} />
          </Route>
        </Route>

        {/* ── Catch-all → public landing page ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
