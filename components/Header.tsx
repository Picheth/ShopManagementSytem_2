
import React, { useState } from 'react';

interface HeaderProps {
  title: string;
  icon?: React.ReactNode;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, icon, onMenuClick }) => {
  const [useFirebase, setUseFirebase] = useState(localStorage.getItem('dbMode') === 'firebase');

  const handleDbToggle = () => {
      const newMode = !useFirebase;
      setUseFirebase(newMode);
      localStorage.setItem('dbMode', newMode ? 'firebase' : 'mock');
      // Reload the page to apply the new database context
      window.location.reload();
  };


  return (
    <header className="bg-card shadow-sm flex items-center justify-between p-4 h-20 flex-shrink-0">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-text-light md:hidden mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <div className="flex items-center text-xl lg:text-2xl font-bold text-text-main">
            {icon && <span className="mr-3 text-primary">{icon}</span>}
            {title}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* DB Switcher */}
        <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${!useFirebase ? 'text-primary' : 'text-gray-600'}`}>Mock DB</span>
            <label htmlFor="db-toggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="db-toggle" className="sr-only peer" checked={useFirebase} onChange={handleDbToggle} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className={`text-sm font-medium ${useFirebase ? 'text-primary' : 'text-gray-600'}`}>Firebase</span>
        </div>

        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </div>
        <img className="h-10 w-10 rounded-full object-cover" src="https://picsum.photos/100/100" alt="User" />
      </div>
    </header>
  );
};

export default Header;