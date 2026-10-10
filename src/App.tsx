import { useState, useEffect } from 'react';
import { PublicMenu } from './pages/PublicMenu';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem('empathy_admin_token')
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setAuthToken(localStorage.getItem('empathy_admin_token'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setAuthToken(localStorage.getItem('empathy_admin_token'));
  };

  const handleLoginSuccess = (token: string) => {
    setAuthToken(token);
    navigate('/admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('empathy_admin_token');
    setAuthToken(null);
    navigate('/admin/login');
  };

  // Route: /admin/login
  if (currentPath === '/admin/login') {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  // Route: /admin (or /admin/*)
  if (currentPath.startsWith('/admin')) {
    if (!authToken) {
      // Redirect to login
      return (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => navigate('/')}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={handleLogout}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  // Route: / (Public Menu)
  return <PublicMenu />;
}
