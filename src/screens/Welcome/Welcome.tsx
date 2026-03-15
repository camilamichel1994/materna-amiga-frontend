import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import { useAccount } from '../../contexts/AccountContext';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAccount();

  useEffect(() => {
    if (user) navigate('/feed');
  }, [user, navigate]);

  return (
    <div className="welcome-screen">
      <div className="welcome-decoration welcome-decoration-1"></div>
      <div className="welcome-decoration welcome-decoration-2"></div>
      <div className="welcome-decoration welcome-decoration-3"></div>
      
      <div className="welcome-content">
        <div className="logo-container">
          <img 
            src={require('../../Images/materna_amiga_logo_2-removebg-preview-Photoroom.png')} 
            alt="Materna Amiga Logo" 
            className="logo-icon"
          />
        </div>

        <p className="welcome-tagline">Sua rede de apoio na maternidade</p>
        
        <p className="welcome-message">
          Compre, venda ou troque itens de maternidade com segurança e praticidade.
        </p>

        <div className="welcome-features">
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span>Seguro</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>Comunidade</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <span>Carinho</span>
          </div>
        </div>

        <div className="welcome-buttons">
          <button className="btn btn-welcome-primary" onClick={() => navigate('/login')}>
            Entrar
          </button>
          <button className="btn btn-welcome-secondary" onClick={() => navigate('/register')}>
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
