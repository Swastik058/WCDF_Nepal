import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { redirectToUserLogin } from '../services/authService';

const links = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Children', to: '/dashboard/children' },
  { label: 'Events', to: '/dashboard/events' },
  { label: 'Expenses', to: '/dashboard/expenses' },
  { label: 'Volunteers', to: '/dashboard/volunteers' },
  { label: 'Donations', to: '/dashboard/donations' },
  { label: 'Blockchain', to: '/dashboard/blockchain-records' },
  { label: 'Reports', to: '/dashboard/reports' },
];

const navClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
  }`;

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    redirectToUserLogin('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button type="button" onClick={() => navigate('/dashboard')} className="text-left">
            <p className="text-lg font-bold text-slate-900">WCDF Admin</p>
            <p className="text-xs text-slate-500">Charity Management Console</p>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button onClick={handleLogout} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/dashboard'} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
