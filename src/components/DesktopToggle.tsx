'use client';

import { useEffect, useState } from 'react';

export default function DesktopToggle() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const applyDesktopMode = (desktop: boolean) => {
    if (desktop && window.innerWidth > 768) {
      document.body.classList.add('desktop-grid-mode');
      document.body.classList.remove('force-mobile-mode');
    } else {
      document.body.classList.remove('desktop-grid-mode');
      document.body.classList.add('force-mobile-mode');
    }
  };

  useEffect(() => {
    setMounted(true);
    const storedPref = localStorage.getItem('desktop-mode');
    
    // Default to Desktop if larger screen, rather than forcing Mobile.
    if (storedPref === null) {
      const isLargeScreen = window.innerWidth > 768;
      setIsDesktop(isLargeScreen);
      applyDesktopMode(isLargeScreen);
    } else if (storedPref === 'true') {
      setIsDesktop(true);
      applyDesktopMode(true);
    } else {
      setIsDesktop(false);
      applyDesktopMode(false);
    }
    
    const handleResize = () => {
      const isLargeScreen = window.innerWidth > 768;
      const currentPref = localStorage.getItem('desktop-mode');
      
      if (currentPref === null) {
         applyDesktopMode(isLargeScreen);
         setIsDesktop(isLargeScreen);
      } else {
         applyDesktopMode(isLargeScreen && currentPref === 'true');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDesktop = () => {
    const newMode = !isDesktop;
    localStorage.setItem('desktop-mode', String(newMode));
    setIsDesktop(newMode);
    applyDesktopMode(newMode);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleDesktop}
      className="btn btn-secondary hide-on-mobile"
      style={{
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        width: '36px',
        height: '36px',
        color: 'white',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
      title={isDesktop ? "Switch to Mobile View" : "Switch to Desktop View"}
    >
      {isDesktop ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
      )}
    </button>
  );
}
