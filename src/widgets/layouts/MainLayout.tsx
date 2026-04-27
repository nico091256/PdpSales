import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@shared/lib/utils';

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Sidebar - Fixed inside the component */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      
      {/* Main Content Area */}
      <div 
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out',
          collapsed ? 'pl-[72px]' : 'pl-[260px]'
        )}
      >
        <Header />
        
        <main className="flex-1 px-8 py-8 animate-fade-in">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
