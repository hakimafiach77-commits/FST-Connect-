import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
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
  );
};

export default AppLayout;
