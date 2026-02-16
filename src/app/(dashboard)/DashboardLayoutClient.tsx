'use client';

import { useState, useEffect } from 'react';
import DashboardNavClient from '@/components/DashboardNavClient';

import LogoutButton from '@/components/LogoutButton';
export default function DashboardLayoutClient({ children, role, permissions }: { children: React.ReactNode, role: string, permissions?: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar automatically on route change if on mobile
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      
      {/* Mobile nav header only visible on small screens */}
      <div className="mobile-header">
        <div className="mobile-header-left">
          <button className="burger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="mobile-header-title">Transport System</span>
        </div>
      </div>

      {/* Overlay to close sidebar on mobile when open */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sidebar-logo">
              <h2>Transport System</h2>
              <p>India Visit 2026</p>
            </div>
            <button className="burger-btn desktop-burger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
        </div>
        
        <div onClick={handleNavClick} style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <DashboardNavClient role={role} permissions={permissions} />
        </div>
        
        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <LogoutButton />
          <div className="role-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{role.charAt(0)}</div>
            <span className="role-text">{role}</span>
          </div>
        </div>
      </aside>
      
      <main className="dashboard-main">
        {/* Desktop Header for Logout/Role */}
        <div className="desktop-header">
          <div className="role-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 600 }}>{role.charAt(0)}</div>
            <span className="role-text" style={{ fontWeight: 500 }}>{role}</span>
          </div>
          <LogoutButton />
        </div>

        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}