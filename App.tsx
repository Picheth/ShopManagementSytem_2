
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import { NAV_ITEMS } from './constants';
import type { NavItem } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('Products');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'string') {
        const allNavItems = NAV_ITEMS.flatMap(group => group.items);
        if (allNavItems.some(item => item.name === event.detail)) {
            setActiveView(event.detail);
        }
      }
    };

    window.addEventListener('navigate', handleNavigation as EventListener);

    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);

  const allNavItems = useMemo(() => NAV_ITEMS.flatMap(group => group.items), []);

  const ActiveComponent = useMemo(() => {
    const currentItem = allNavItems.find(item => item.name === activeView);
    return currentItem ? currentItem.component : Dashboard;
  }, [activeView, allNavItems]);
  
  const currentNavItem = allNavItems.find(item => item.name === activeView);

  return (
    <div className="flex h-screen bg-background text-text-main">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={activeView} 
          icon={currentNavItem?.icon}
          onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default App;
