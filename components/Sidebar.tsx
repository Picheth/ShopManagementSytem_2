
import React from 'react';
import { NAV_ITEMS } from '../constants';
import type { NavItem } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isSidebarOpen, setSidebarOpen }) => {

  const handleItemClick = (item: NavItem) => {
    setActiveView(item.name);
    if(window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <>
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
        <aside className={`absolute md:relative z-40 flex-shrink-0 w-64 bg-sidebar text-sidebar-text flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          <h1 className="text-xl font-bold text-white ml-2">PhoneShop OS</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((group) => (
            <div key={group.group}>
              <h2 className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.group}</h2>
              {group.items.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(item);
                  }}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    activeView === item.name
                      ? 'bg-sidebar-active text-white'
                      : 'hover:bg-sidebar-active hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
