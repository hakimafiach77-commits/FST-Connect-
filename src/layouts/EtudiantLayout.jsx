import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AccessGuard from '../components/etudiant/AccessGuard';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const EtudiantLayout = () => {
  const { currentUser } = useAuth();
  const { getStudentByUserId, loading } = useData();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser.role !== 'student') return <Navigate to="/dashboard" replace />;

  const student = getStudentByUserId(currentUser.id) || currentUser.etudiant;

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <AccessGuard student={student}>
      <div className="dashboard-wrapper">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        <div className="main-content">
          <Header openSidebar={openSidebar} />
          <main className="main-viewport">
            <div key={location.key} className="page-area fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AccessGuard>
  );
};

export default EtudiantLayout;
