'use client';
import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function AppLayout({ children, currentPath = '/' }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen((v) => !v), []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 md:relative md:flex md:flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar currentPath={currentPath} onMobileClose={closeMobileSidebar} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin flex flex-col min-w-0">
        {/* Mobile topbar with hamburger */}
        <div className="flex items-center h-14 px-4 border-b border-border bg-card/80 backdrop-blur-sm md:hidden flex-shrink-0 sticky top-0 z-20">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-lg hover:bg-muted transition-colors mr-3"
            aria-label="Open navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-bold text-sm text-foreground tracking-tight flex-1">KARTAA OS</span>
          {/* Mobile logout button — always visible */}
          <MobileLogoutButton />
        </div>

        {children}
      </main>
    </div>
  );
}

// Separate component to avoid circular imports
function MobileLogoutButton() {
  const [loading, setLoading] = React.useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      // Dynamically import to avoid circular dependency
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/about';
    } catch {
      window.location.href = '/about';
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Log out"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 transition-colors text-danger text-xs font-600 disabled:opacity-60"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {loading ? 'Logging out…' : 'Logout'}
    </button>
  );
}