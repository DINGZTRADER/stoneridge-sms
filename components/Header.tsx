import React from 'react';
import { SCHOOL_YEAR } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center z-10 sticky top-0">
      <h1 className="text-2xl font-semibold text-gray-800">Stoneridge SMS</h1>
      <div className="flex items-center space-x-4">
        <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full shadow">
          School Year: {SCHOOL_YEAR}
        </span>
        {/* User profile or other header elements can go here */}
        <img
          src="https://picsum.photos/40/40"
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
};

export default Header;