import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Icon({ children }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const NAV_ITEMS = [
  {
    to: '/',
    end: true,
    label: 'Dashboard',
    icon: (
      <Icon>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </Icon>
    ),
  },
  {
    to: '/aprovacoes',
    label: 'Aprovações',
    icon: (
      <Icon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </Icon>
    ),
  },
  {
    to: '/usuarios',
    label: 'Usuários',
    icon: (
      <Icon>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </Icon>
    ),
  },
  {
    to: '/convites',
    label: 'Convites',
    icon: (
      <Icon>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </Icon>
    ),
  },
  {
    to: '/moderacao',
    label: 'Moderação',
    icon: (
      <Icon>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </Icon>
    ),
  },
  {
    to: '/alcance',
    label: 'Alcance',
    icon: (
      <Icon>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </Icon>
    ),
  },
  {
    to: '/candidaturas',
    label: 'Candidaturas',
    icon: (
      <Icon>
        <path d="M16 3h5v5" />
        <path d="M21 3l-7 7" />
        <path d="M16 13h5v5h-5z" />
        <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
      </Icon>
    ),
  },
];

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/aprovacoes': 'Aprovações',
  '/usuarios': 'Usuários',
  '/convites': 'Convites',
  '/moderacao': 'Moderação',
  '/alcance': 'Alcance',
  '/candidaturas': 'Candidaturas',
};

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');
  const closeMenu = () => setMenuOpen(false);
  const pageTitle = PAGE_TITLES[location.pathname] || 'Rilaxy Admin';

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>

      <div className="sidebar-overlay" onClick={closeMenu} aria-hidden="true" />

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">♀♂</span>
          <span className="sidebar-title">Rilaxy Admin</span>
          <button className="hamburger sidebar-close" onClick={closeMenu} aria-label="Fechar menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} title={item.label} onClick={closeMenu}>
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">{user?.email}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="nav-label">Sair</span>
          </button>
        </div>
      </aside>

      <div className="layout-main">
        <header className="topbar">
          <button
            className="hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="sidebar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="topbar-logo">♀♂</span>
          <h1 className="topbar-title">{pageTitle}</h1>
          <div className="topbar-spacer" />
          <span className="topbar-user">{user?.email}</span>
        </header>

        <main className="main-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
