import React, { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPasswordService } from '../../services/auth/authService';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (!token) {
      toast.error('Token de recuperação inválido. Solicite um novo link.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordService({ token, newPassword });
      setIsResetComplete(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-password-screen">
        <div className="reset-password-layout">
          <div className="reset-password-form-section">
            <div className="reset-password-content">
              <div className="reset-password-logo-container">
                <img
                  src={require('../../Images/materna_amiga_logo_2-removebg-preview-Photoroom.png')}
                  alt="Materna Amiga Logo"
                  className="reset-password-logo"
                />
              </div>
              <div className="invalid-token-container">
                <div className="invalid-token-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#e57373"/>
                  </svg>
                </div>
                <h1 className="reset-password-title">Link inválido</h1>
                <p className="reset-password-subtitle">
                  O link de recuperação é inválido ou expirou. Solicite um novo link para redefinir sua senha.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => navigate('/forgot-password')}
                >
                  Solicitar novo link
                </button>
                <div className="reset-password-footer">
                  <p>
                    <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                      Voltar ao login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="reset-password-decorative-section"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-screen">
      <div className="reset-password-layout">
        <div className="reset-password-form-section">
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
          <div className="reset-password-content">
            <div className="reset-password-logo-container">
              <img
                src={require('../../Images/materna_amiga_logo_2-removebg-preview-Photoroom.png')}
                alt="Materna Amiga Logo"
                className="reset-password-logo"
              />
            </div>

            {!isResetComplete ? (
              <>
                <h1 className="reset-password-title">Redefinir senha</h1>
                <p className="reset-password-subtitle">
                  Digite sua nova senha abaixo.
                </p>

                <form onSubmit={handleSubmit} className="reset-password-form">
                  <div className="form-group">
                    <label htmlFor="newPassword">Nova senha</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar nova senha</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Digite a senha novamente"
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
                  </button>

                  <div className="reset-password-footer">
                    <p>
                      <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                        Voltar ao login
                      </a>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              <div className="reset-complete-container">
                <div className="reset-complete-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#81c784"/>
                  </svg>
                </div>
                <h1 className="reset-password-title">Senha redefinida!</h1>
                <p className="reset-password-subtitle">
                  Sua senha foi alterada com sucesso. Agora você pode entrar com sua nova senha.
                </p>

                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => navigate('/login')}
                >
                  Ir para o login
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="reset-password-decorative-section"></div>
      </div>
    </div>
  );
};

export default ResetPassword;
