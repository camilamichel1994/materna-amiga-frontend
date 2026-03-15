import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';

import { loginService, googleAuthService, LoginInput } from '../../services/auth/authService';
import { useAccount } from '../../contexts/AccountContext';
import './Login.css';

interface FormData {
  email: string;
  password: string;
  remember?: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, user } = useAccount();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/feed');
  }, [user, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData: LoginInput = {
        email: formData.email,
        password: formData.password,
        remember: formData.remember
      };

      const response = await loginService(loginData);
      setUser(response.user);
      navigate('/feed');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase não está configurado corretamente. Verifique as configurações.');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google sign-in successful:', user);
      
      // Obter o ID token do Firebase
      const idToken = await user.getIdToken();
      console.log('Firebase ID token obtained');

      const response = await googleAuthService({ idToken });
      setUser(response.user);
      console.log('Backend authentication successful');

      navigate('/feed');
    } catch (err: unknown) {
      // Garantir que temos um objeto Error válido
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Para erros do Firebase, verificar se tem a propriedade code
      const firebaseError = err as any;
      
      console.error('Google sign-in error:', error);
      if (firebaseError?.code) {
        console.error('Error code:', firebaseError.code);
      }
      console.error('Error message:', error.message);
      
      // Tratamento de erros específicos do Firebase
      if (firebaseError?.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup');
        toast.info('Login cancelado pelo usuário');
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/popup-blocked') {
        toast.error('Popup bloqueado pelo navegador. Permita popups para este site e tente novamente.');
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/configuration-not-found') {
        toast.error('Configure o Firebase no arquivo .env para usar a autenticação com Google. Veja o arquivo .env.example');
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'desconhecido';
        toast.error(`Este domínio (${currentDomain}) não está autorizado. Adicione-o no Firebase Console em Authentication > Settings > Authorized domains.`);
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/operation-not-allowed') {
        toast.error('O login com Google não está habilitado. Habilite em Firebase Console > Authentication > Sign-in method > Google');
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/invalid-api-key') {
        toast.error('API Key do Firebase inválida. Verifique as configurações no arquivo .env');
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/network-request-failed') {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/redirect-uri-mismatch') {
        toast.error('URI de redirecionamento não autorizado. Verifique as URIs de redirecionamento no Google Cloud Console.');
        setIsLoading(false);
        return;
      } else if (firebaseError?.code === 'auth/unauthorized-continue-uri') {
        toast.error('URI de continuação não autorizado. Verifique as origens JavaScript autorizadas no Google Cloud Console.');
        setIsLoading(false);
        return;
      }

      if (error.message.includes('Firebase Admin não está configurado')) {
        toast.warning(
          'O servidor (backend) ainda não tem o Firebase Admin configurado. Você foi conectada com o Google; algumas funções podem depender do backend.'
        );
        setIsLoading(false);
        return;
      }

      const errorMessage = error.message || 'Erro ao fazer login com Google. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-layout">
        <div className="login-form-section">
          <button 
            type="button" 
            className="back-button"
            onClick={() => navigate('/')}
            aria-label="Voltar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="login-content">
            <div className="login-logo-container">
              <img 
                src={require('../../Images/materna_amiga_logo_2-removebg-preview-Photoroom.png')} 
                alt="Materna Amiga Logo" 
                className="login-logo"
              />
            </div>
            <h1 className="login-title">Bem-vinda de volta!</h1>
            <p className="login-subtitle">Digite suas credenciais para acessar sua conta</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Digite seu e-mail"
                />
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password">Senha</label>
                  <button type="button" className="forgot-password">Esqueceu a senha?</button>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Digite sua senha"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember || false}
                    onChange={handleChange}
                  />
                  <span>Lembrar-me</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="divider">
                <span>Ou</span>
              </div>

              <div className="social-buttons">
                <button 
                  type="button" 
                  className="social-btn google-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="social-icon-svg" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{isLoading ? 'Conectando...' : 'Entrar com Google'}</span>
                </button>
              </div>

              <div className="login-footer">
                <p>Não tem uma conta? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Cadastre-se</a></p>
              </div>
            </form>
          </div>
        </div>
        <div className="login-decorative-section"></div>
      </div>
    </div>
  );
};

export default Login;
