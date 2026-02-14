import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';
import { UserRole } from '../types';

interface SidebarProps {
  currentUserRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUserRole }) => {
  const filteredNavItems = NAVIGATION_ITEMS.filter(item =>
    item.roles.includes(currentUserRole)
  );

  return (
    <aside className="w-64 bg-[#800000] text-white flex flex-col p-4 shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center">SMS</h2>
      </div>
      <nav className="flex-grow">
        <ul>
          {filteredNavItems.map((item) => (
            <li key={item.href} className="mb-2">
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md transition-colors duration-200 ` +
                  (isActive
                    ? 'bg-[#a00000] text-white font-semibold'
                    : 'hover:bg-[#600000] text-gray-200')
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-[#600000] text-sm text-gray-300">
        <p>&copy; {new Date().getFullYear()} Stoneridge SMS</p>
      </div>
    </aside>
  );
};

export default Sidebar;