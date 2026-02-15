'use client';

import { logout } from '@/app/login/actions';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => logout()} 
      style={{ 
        background: 'none', 
        border: '1px solid rgba(255,255,255,0.2)', 
        color: '#cbd5e1', 
        fontSize: '0.8rem', 
        padding: '2px 8px', 
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '8px'
      }}
    >
      Logout
    </button>
  );
}
