import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Person from '@mui/icons-material/Person';
import Favorite from '@mui/icons-material/Favorite';
import Logout from '@mui/icons-material/Logout';
import { useAccount } from '../contexts/AccountContext';
import './TopNav.css';

const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAccount();

  const isActive = (path: string) => location.pathname === path;

  const displayName = user?.name || 'Usuária';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setShowUserMenu(false);
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
          <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>
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
          <div className="user-menu-container">
            <button
              type="button"
              className="user-menu-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="user-avatar-img" />
                ) : (
                  initial
                )}
              </div>
            </button>
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-avatar-large">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="user-avatar-img-large" />
                    ) : (
                      initial
                    )}
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
                  <Link to="/wishlist" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                    <Favorite className="menu-icon-svg" fontSize="small" />
                    <span>Favoritos</span>
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
    </nav>
  );
};

export default TopNav;
