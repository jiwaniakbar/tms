'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RefreshControl({ showAutoRefresh = false }: { showAutoRefresh?: boolean }) {
  const router = useRouter();
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [intervalMs, setIntervalMs] = useState<number>(30000); // Default 30s

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  // Load auto-refresh preference and interval from localStorage
  useEffect(() => {
    if (showAutoRefresh) {
      const savedAuto = localStorage.getItem('tms_auto_refresh');
      if (savedAuto === 'true') setIsAutoRefresh(true);

      const savedInterval = localStorage.getItem('tms_refresh_interval');
      if (savedInterval) {
        const parsed = parseInt(savedInterval, 10);
        if (!isNaN(parsed) && parsed > 5000) {
          setIntervalMs(parsed);
        }
      }
    }
  }, [showAutoRefresh]);

  // Handle auto-refresh interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh && showAutoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh, showAutoRefresh, intervalMs]);

  const handleRefresh = () => {
    router.refresh();
    setLastRefreshed(new Date());
  };

  const toggleAutoRefresh = () => {
    const newState = !isAutoRefresh;
    setIsAutoRefresh(newState);
    localStorage.setItem('tms_auto_refresh', String(newState));
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = parseInt(e.target.value, 10);
    setIntervalMs(newInterval);
    localStorage.setItem('tms_refresh_interval', String(newInterval));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {showAutoRefresh && (
        <>
          <div style={{ display: 'flex', border: `1px solid ${isAutoRefresh ? '#bfdbfe' : '#cbd5e1'}`, borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={toggleAutoRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: isAutoRefresh ? '#dbeafe' : 'transparent',
                color: isAutoRefresh ? '#2563eb' : '#64748b',
                border: 'none',
                borderRight: `1px solid ${isAutoRefresh ? '#bfdbfe' : '#cbd5e1'}`,
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={isAutoRefresh ? "Auto-refresh enabled" : "Enable auto-refresh"}
            >
              <span style={{ fontSize: '1rem', animation: isAutoRefresh ? 'spin 4s linear infinite' : 'none' }}>
                {isAutoRefresh ? '⚡' : 'zz'}
              </span>
              {isAutoRefresh ? 'Auto On' : 'Auto Off'}
            </button>
            <select
              value={intervalMs}
              onChange={handleIntervalChange}
              style={{
                backgroundColor: isAutoRefresh ? '#eff6ff' : '#f8fafc',
                color: '#475569',
                border: 'none',
                fontSize: '0.85rem',
                padding: '0 8px',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '80px'
              }}
            >
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
          </div>
        </>
      )}

      <button
        onClick={handleRefresh}
        className="refresh-btn"
        style={{
          padding: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          lineHeight: 1,
          color: '#475569',
          transition: 'all 0.2s',
          height: '38px',
          width: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={lastRefreshed ? `Last updated: ${lastRefreshed.toLocaleTimeString()}` : 'Refresh'}
      >
        🔄
      </button>

      {showAutoRefresh && isAutoRefresh && (
        <style jsx>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      )}
    </div>
  );
}
