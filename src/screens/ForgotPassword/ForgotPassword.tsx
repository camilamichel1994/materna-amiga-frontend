import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPasswordService } from '../../services/auth/authService';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPasswordService({ email });
      setEmailSent(true);
      toast.success('E-mail de recuperação enviado!');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Erro ao enviar e-mail de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-screen">
      <div className="forgot-password-layout">
        <div className="forgot-password-form-section">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/login')}
            aria-label="Voltar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="forgot-password-content">
            <div className="forgot-password-logo-container">
              <img
                src={require('../../Images/materna_amiga_logo_2-removebg-preview-Photoroom.png')}
                alt="Materna Amiga Logo"
                className="forgot-password-logo"
              />
            </div>

            {!emailSent ? (
              <>
                <h1 className="forgot-password-title">Esqueceu a senha?</h1>
                <p className="forgot-password-subtitle">
                  Sem problemas! Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                  <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="input"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                      placeholder="Digite seu e-mail cadastrado"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                  </button>

                  <div className="forgot-password-footer">
                    <p>
                      Lembrou a senha?{' '}
                      <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                        Voltar ao login
                      </a>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="email-sent-container">
                <div className="email-sent-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#B8A8DC"/>
                  </svg>
                </div>
                <h1 className="forgot-password-title">E-mail enviado!</h1>
                <p className="forgot-password-subtitle">
                  Enviamos um link de recuperação para <strong>{email}</strong>.
                  Verifique sua caixa de entrada e a pasta de spam.
                </p>

                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => setEmailSent(false)}
                >
                  Reenviar e-mail
                </button>

                <div className="forgot-password-footer">
                  <p>
                    <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                      Voltar ao login
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="forgot-password-decorative-section"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
