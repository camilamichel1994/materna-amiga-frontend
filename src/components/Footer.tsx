import React from 'react';
import { useLocation } from 'react-router-dom';
import { Email, Phone, LocationOn, Facebook, Instagram, Twitter } from '@mui/icons-material';
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
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-about">
            <h3 className="footer-logo">MaternaAmiga</h3>
            <p className="footer-description">
              Compre, venda ou troque itens de maternidade com segurança e praticidade.
              Conectando mães e reduzindo desperdício.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Links Rápidos</h4>
            <ul className="footer-links">
              <li><a href="/anuncios">Feed</a></li>
              <li><a href="/listaDeDesejos  ">Favoritos</a></li>
              <li><a href="/adicionarItem">Anunciar Item</a></li>
              <li><a href="/mensagens">Mensagens</a></li>
              <li><a href="/perfil">Perfil</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Categorias</h4>
            <ul className="footer-links">
              <li><a href="/feed?category=roupas">Roupas</a></li>
              <li><a href="/feed?category=carrinhos">Carrinhos</a></li>
              <li><a href="/feed?category=bercos">Berços</a></li>
              <li><a href="/feed?category=brinquedos">Brinquedos</a></li>
              <li><a href="/feed?category=bombinhas">Bombinhas</a></li>
              <li><a href="/feed?category=slings">Slings</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Contato</h4>
            <ul className="footer-contact">
              <li>
                <Email className="contact-icon" />
                <span>contato@maternaamiga.com.br</span>
              </li>
              <li>
                <Phone className="contact-icon" />
                <span>(11) 99999-9999</span>
              </li>
              <li>
                <LocationOn className="contact-icon" />
                <span>São Paulo, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 MaternaAmiga. Todos os direitos reservados.</p>
            <div className="footer-bottom-links">
              <a href="#">Termos de Uso</a>
              <span>•</span>
              <a href="#">Política de Privacidade</a>
              <span>•</span>
              <a href="#">Sobre Nós</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
