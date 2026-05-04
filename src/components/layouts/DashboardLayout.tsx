import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { Navbar } from '../common/Navbar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      <Navbar onMenuClick={handleMenuClick} title={title} />
      <main className="main-content">
        <div className="content-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
