import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import LoginScreen from './components/LoginScreen'

function Root() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] text-zinc-300">
      Carregando...
    </div>
  );
  return user ? <App /> : <LoginScreen />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
