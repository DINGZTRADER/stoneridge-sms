import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { UserRole } from '../types';

interface LayoutProps {
  currentUserRole: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ currentUserRole }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar currentUserRole={currentUserRole} />
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet context={{ currentUserRole }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;