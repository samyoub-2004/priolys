import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import Navbar from '../components/Navbar';
import { auth, googleProvider, appleProvider } from '../FirebaseConf/firebase';
import './Login.css';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const languageMenuRef = useRef(null);

  // Appliquer le dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('route-dark-mode');
    } else {
      document.body.classList.remove('route-dark-mode');
    }
  }, [darkMode]);

  // Appliquer la langue
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  // Fermer le menu de langue quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeLanguage = (lng) => {
    setCurrentLanguage(lng);
    setIsLanguageMenuOpen(false);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Définir la persistance de session
      await setPersistence(auth, rememberMe ? 
        browserLocalPersistence : browserSessionPersistence
      );
      
      // Connexion avec email/mot de passe
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirection après connexion réussie
      navigate('/');
    } catch (error) {
      console.error("Erreur de connexion", error);
      let errorMessage = t(`login.errors.${error.code}`);
      
      // Gestion des erreurs spécifiques
      if (!errorMessage || errorMessage.includes('login.errors')) {
        if (error.code === 'auth/invalid-credential') {
          errorMessage = t('login.errors.auth/invalid-credential');
        } else {
          errorMessage = t('login.errors.default');
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      // Définir la persistance de session
      await setPersistence(auth, rememberMe ? 
        browserLocalPersistence : browserSessionPersistence
      );
      
      // Connexion avec le provider social
      await signInWithPopup(auth, provider);
      
      // Redirection après connexion réussie
      navigate('/');
    } catch (error) {
      console.error("Erreur de connexion sociale", error);
      setError(t(`login.errors.${error.code}`) || t('login.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => {
    navigate('/signup');
  };

  const goToPasswordReset = () => {
    navigate('/reset-password');
  };

  return (
    <div className="route-page-container">
      {/* Navbar compacte */}
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLanguageMenuOpen={isLanguageMenuOpen}
        setIsLanguageMenuOpen={setIsLanguageMenuOpen}
      />

      {/* Formulaire de connexion */}
      <div className="route-form-container">
        <div className="route-card">
          <div className="route-header">
            <h2>{t('login.title')}</h2>
            <p>{t('login.subtitle')}</p>
          </div>
          
          {error && <div className="route-error-message">{error}</div>}
          
          <form onSubmit={handleEmailLogin} className="route-form">
            <div className="route-form-group">
              <label htmlFor="email">{t('login.email')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                disabled={loading}
              />
            </div>
            
            <div className="route-form-group">
              <label htmlFor="password">{t('login.password')}</label>
              <div className="route-password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="route-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                      <path d="M12 9a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3zm0 8a5 5 0 01-5-5 5 5 0 015-5 5 5 0 015 5 5 5 0 01-5 5zm0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                      <path d="M11.83 9L15 12.16V12a3 3 0 00-3-3h-.17m-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 003 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 01-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22 21 20.73 3.27 3 2 4.27z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="route-form-options">
              <div className="route-remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="remember">{t('login.rememberMe')}</label>
              </div>
              <button 
                type="button" 
                className="route-forgot-password"
                onClick={goToPasswordReset}
                disabled={loading}
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            
            <button 
              type="submit" 
              className="route-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="route-loader"></div>
              ) : (
                t('login.signIn')
              )}
            </button>
          </form>
          
          <div className="route-separator">
            <span>{t('login.or')}</span>
          </div>
          
          <div className="route-social-login">
            <button 
              className="route-social-btn route-google-btn"
              onClick={() => handleSocialLogin(googleProvider)}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.1.9-.7 1.7-1.5 2.2v2h2.4c1.4-1.3 2.2-3.2 2.2-5.4z" fill="#4285F4"/>
                <path d="M9 18c2.1 0 3.9-.7 5.2-1.9l-2.4-1.9c-.7.5-1.6.8-2.8.8-2.1 0-3.9-1.4-4.5-3.3H1.9v2.1C3.2 15.9 5.9 18 9 18z" fill="#34A853"/>
                <path d="M4.5 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5.2H1.9C1.3 6.7 1 8.4 1 10.2c0 1.8.3 3.5.9 4.9l2.6-2.1-.1-.3z" fill="#FBBC05"/>
                <path d="M9 3.6c1.2 0 2.3.4 3.2 1.2l2.4-2.4C12.9.9 11.1.2 9 .2 5.9.2 3.2 2.3 1.9 5.2l2.6 2.1c.6-1.9 2.4-3.3 4.5-3.3z" fill="#EA4335"/>
              </svg>
              {t('login.signInGoogle')}
            </button>
            
            <button 
              className="route-social-btn route-apple-btn"
              onClick={() => handleSocialLogin(appleProvider)}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path d="M17.05 12.04C17.04 9.28 19.37 8 19.5 7.95C18.3 6.17 16.47 5.94 15.86 5.93C14.21 5.82 12.68 6.96 11.79 6.96C10.89 6.96 9.57 5.93 8.2 5.97C6.44 6.02 4.86 7.08 4 8.79C2.07 12.2 3.53 17.1 5.29 19.61C6.3 20.98 7.5 22.5 9.08 22.43C10.62 22.37 11.07 21.41 12.89 21.41C14.7 21.41 15.12 22.43 16.71 22.39C18.33 22.35 19.41 20.99 20.4 19.61C21.56 18.1 22.05 16.6 22.07 16.54C22.03 16.52 18.9 15.19 17.05 12.04ZM14.86 4.5C15.58 3.63 16.11 2.41 15.94 1.2C14.87 1.25 13.65 1.94 12.91 2.81C12.25 3.58 11.63 4.84 11.83 6C13 6.05 14.17 5.31 14.86 4.5Z"/>
              </svg>
              {t('login.signInApple')}
            </button>
          </div>
          
          <div className="route-signup-link">
            {t('login.noAccount')} 
            <button 
              onClick={goToSignUp} 
              className="route-signup-button"
              disabled={loading}
            >
              {t('login.signUp')}
            </button>
          </div>
        </div>
      </div>
      
      <footer className="route-footer">
        <p>&copy; 2025 Priolys. {t('login.rightsReserved')}</p>
        <div className="route-footer-links">
          <a href="#">{t('login.terms')}</a>
          <a href="#">{t('login.privacy')}</a>
          <a href="#">{t('login.help')}</a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;