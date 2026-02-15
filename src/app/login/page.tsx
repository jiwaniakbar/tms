import LoginForm from './LoginForm';

export const metadata = {
  title: 'Login - Transport System',
};

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 8px 0' }}>Transport System</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Project Command Center 2026</p>
        </div>
        
        <LoginForm />
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          Restricted access. Please contact an Administrator to obtain your credentials.
        </div>
      </div>
    </div>
  );
}
