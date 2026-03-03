import React from 'react';
import { useLocation } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const location = useLocation();

  const hideFooterPaths = ['/', '/login', '/register'];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);

  if (shouldHideFooter) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-bar">
        <span className="footer-brand">MaternaAmiga</span>
        <span className="footer-copy">&copy; {new Date().getFullYear()} Todos os direitos reservados.</span>
      </div>
    </footer>
  );
};

export default Footer;
