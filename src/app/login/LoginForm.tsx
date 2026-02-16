'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%',
        padding: '12px',
        backgroundColor: 'var(--accent)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.7 : 1,
        transition: 'all 0.2s',
        marginTop: '8px'
      }}
    >
      {pending ? 'Authenticating...' : 'Secure Login'}
    </button>
  );
}

export default function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label htmlFor="email" style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="admin@jk.com"
          required
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            outline: 'none',
            fontSize: '1rem'
          }}
        />
      </div>

      <div>
        <label htmlFor="password" style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            outline: 'none',
            fontSize: '1rem'
          }}
        />
      </div>

      <div
        style={{
          color: '#ef4444',
          fontSize: '0.9rem',
          minHeight: '20px',
          textAlign: 'center'
        }}
      >
        {errorMessage && <p>{errorMessage}</p>}
      </div>

      <SubmitButton />
    </form>
  );
}
