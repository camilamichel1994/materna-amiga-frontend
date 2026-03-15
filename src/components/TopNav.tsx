import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Person from '@mui/icons-material/Person';
import Logout from '@mui/icons-material/Logout';
import { useAccount } from '../contexts/AccountContext';
import Avatar from './Avatar';
import './TopNav.css';

const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAccount();

  const isActive = (path: string) => location.pathname === path;

  const displayName = user?.name || 'Usuária';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.avatarUrl;

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, closeMobileMenu]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    closeMobileMenu();
    await logout();
    navigate('/login');
  };

  return (
    <nav className="top-nav">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/feed" className="logo-link">
            <span className="logo-text">MaternaAmiga</span>
          </Link>
        </div>

        <div className="nav-center">
          <Link to="/feed" className={`nav-link ${isActive('/feed') ? 'active' : ''}`}>
            Anúncios
          </Link>
          <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>
            Favoritos
          </Link>
          <Link to="/add-item" className={`nav-link ${isActive('/add-item') ? 'active' : ''}`}>
            Anunciar
          </Link>
          <Link to="/chat" className={`nav-link ${isActive('/chat') ? 'active' : ''}`}>
            Mensagens
          </Link>
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="hamburger-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`} />
          </button>

          <div className="user-menu-container">
            <button
              type="button"
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <Avatar src={avatarUrl} name={displayName} imgClassName="user-avatar-img" />
              </div>
            </button>
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-avatar-large">
                    <Avatar src={avatarUrl} name={displayName} imgClassName="user-avatar-img-large" />
                  </div>
                  <div className="user-info">
                    <div className="user-name">{displayName}</div>
                    <div className="user-email">{displayEmail}</div>
                  </div>
                </div>
                <div className="user-menu-items">
                  <Link to="/profile" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                    <Person className="menu-icon-svg" fontSize="small" />
                    <span>Perfil</span>
                  </Link>
                  <button type="button" className="user-menu-item" onClick={handleLogout}>
                    <Logout className="menu-icon-svg" fontSize="small" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu} />}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-user">
            <div className="user-avatar-large">
              <Avatar src={avatarUrl} name={displayName} imgClassName="user-avatar-img-large" />
            </div>
            <div className="user-info">
              <div className="user-name">{displayName}</div>
              <div className="user-email">{displayEmail}</div>
            </div>
          </div>
        </div>
        <div className="mobile-drawer-links">
          <Link to="/feed" className={`mobile-nav-link ${isActive('/feed') ? 'active' : ''}`}>
            Anúncios
          </Link>
          <Link to="/favorites" className={`mobile-nav-link ${isActive('/favorites') ? 'active' : ''}`}>
            Favoritos
          </Link>
          <Link to="/add-item" className={`mobile-nav-link ${isActive('/add-item') ? 'active' : ''}`}>
            Anunciar
          </Link>
          <Link to="/chat" className={`mobile-nav-link ${isActive('/chat') ? 'active' : ''}`}>
            Mensagens
          </Link>
        </div>
        <div className="mobile-drawer-footer">
          <Link to="/profile" className="mobile-nav-link">
            <Person className="menu-icon-svg" fontSize="small" />
            Perfil
          </Link>
          <button type="button" className="mobile-nav-link" onClick={handleLogout}>
            <Logout className="menu-icon-svg" fontSize="small" />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
