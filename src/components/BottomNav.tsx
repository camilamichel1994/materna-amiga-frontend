import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/feed" className={`nav-item ${isActive('/feed') ? 'active' : ''}`}>
        <span className="nav-icon">🏠</span>
        <span>Anúncios</span>
      </Link>
      <Link to="/wishlist" className={`nav-item ${isActive('/wishlist') ? 'active' : ''}`}>
        <span className="nav-icon">❤️</span>
        <span>Desejos</span>
      </Link>
      <Link to="/add-item" className={`nav-item ${isActive('/add-item') ? 'active' : ''}`}>
        <span className="nav-icon">➕</span>
        <span>Anunciar</span>
      </Link>
      <Link to="/chat" className={`nav-item ${isActive('/chat') ? 'active' : ''}`}>
        <span className="nav-icon">💬</span>
        <span>Mensagens</span>
      </Link>
      <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <span className="nav-icon">👤</span>
        <span>Perfil</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
