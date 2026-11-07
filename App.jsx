import { useEffect } from 'react';
import { Auth, go } from './lib/api.js';
import { useHash } from './lib/hooks.js';
import { LangProvider } from './components/lang.jsx';
import { UIProvider } from './components/ui.jsx';
import Landing from './pages/Landing.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import FarmerApp from './pages/farmer/FarmerApp.jsx';
import AdminApp from './pages/admin/AdminApp.jsx';

/* Routes (hash based, so the Express server needs no change):
   #/                 farmer login / register      (was /)
   #/app/<page>       farmer dashboard             (was /user.html)
   #/admin-login      admin login                  (was /admin-login.html)
   #/admin/<page>     admin dashboard              (was /admin.html) */
function Router() {
  const hash = useHash();
  const [, area, view] = hash.split('/');
  const u = Auth.user;
  const ok = (role) => Auth.token && u && u.role === role;

  useEffect(() => {
    if (area === 'app' && !ok('farmer')) go('/');
    else if (area === 'admin' && !ok('admin')) go('/admin-login');
    else if (area === '' && ok('farmer')) go('/app/dashboard');
    else if (area === 'admin-login' && ok('admin')) go('/admin/overview');
  }, [hash]); // eslint-disable-line

  if (area === 'app') return ok('farmer') ? <FarmerApp view={view || 'dashboard'} /> : null;
  if (area === 'admin') return ok('admin') ? <AdminApp view={view || 'overview'} /> : null;
  if (area === 'admin-login') return <AdminLogin />;
  return <Landing />;
}

export default function App() {
  return (
    <LangProvider>
      <UIProvider>
        <Router />
      </UIProvider>
    </LangProvider>
  );
}
