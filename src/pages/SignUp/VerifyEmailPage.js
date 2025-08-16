// src/pages/VerifyEmail/VerifyEmailPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, sendConfirmationEmail } from '../FirebaseConf/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../../pages/Login/Login.css';

const VerifyEmailPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [darkMode, setDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [email, setEmail] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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

  // Initialiser l'email
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
    setIsLoading(false);
  }, [location.state, user]);

  // Vérifier périodiquement si l'email est vérifié
  useEffect(() => {
    if (!user || isEmailVerified) return;
    
    const checkEmailVerification = async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          setIsEmailVerified(true);
          setStatusMessage(t('verifyEmail.verifiedSuccess'));
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error("Erreur de vérification d'email:", error);
        setStatusMessage(t('verifyEmail.verificationError'));
      }
    };
    
    const interval = setInterval(checkEmailVerification, 5000);
    return () => clearInterval(interval);
  }, [user, isEmailVerified, navigate, t]);

  // Gérer le compte à rebours pour le renvoi d'email
  useEffect(() => {
    if (resendCountdown <= 0) {
      setIsResendDisabled(false);
      return;
    }
    
    if (isResendDisabled) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isResendDisabled, resendCountdown]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeLanguage = (lng) => {
    setCurrentLanguage(lng);
  };

  const handleResendEmail = async () => {
    if (!user || isResendDisabled) return;
    
    try {
      setIsResendDisabled(true);
      setResendCountdown(30);
      await sendConfirmationEmail(user);
      setStatusMessage(t('verifyEmail.resendSuccess'));
    } catch (error) {
      console.error("Erreur d'envoi d'email:", error);
      setStatusMessage(t('verifyEmail.resendError'));
      setIsResendDisabled(false);
    }
  };

  const handleCheckNow = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await user.reload();
      
      if (user.emailVerified) {
        setIsEmailVerified(true);
        setStatusMessage(t('verifyEmail.verifiedSuccess'));
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStatusMessage(t('verifyEmail.notVerifiedYet'));
      }
    } catch (error) {
      console.error("Erreur de vérification d'email:", error);
      setStatusMessage(t('verifyEmail.verificationError'));
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="route-page-container">
        <div className="route-loader-container">
          <div className="route-loader"></div>
          <p>{t('verifyEmail.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="route-page-container">
      {/* Navbar compacte */}
      <nav className="route-navbar compact">
        <div className="route-navbar-left">
          <h1 className="route-logo">Priolys</h1>
        </div>
        <div className="route-navbar-right">
          <div className="route-language-dropdown">
            <button className="route-language-toggle">
              {currentLanguage === 'fr' ? (
                <svg className="route-flag-icon" viewBox="0 0 640 480" width="20" height="15">
                  <path fill="#fff" d="M0 0h640v480H0z"/>
                  <path fill="#002654" d="M0 0h213.3v480H0z"/>
                  <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
                </svg>
              ) : (
                <svg className="route-flag-icon" viewBox="0 0 640 480" width="20" height="15">
                  <path fill="#012169" d="M0 0h640v480H0z"/>
                  <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
                  <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
                  <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
                  <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
                </svg>
              )}
              <span>{currentLanguage.toUpperCase()}</span>
              <svg className="route-dropdown-icon" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            
            <div className="route-language-menu">
              <button 
                className={`route-language-option ${currentLanguage === 'fr' ? 'active' : ''}`}
                onClick={() => changeLanguage('fr')}
              >
                <svg className="route-flag-icon" viewBox="0 0 640 480" width="20" height="15">
                  <path fill="#fff" d="M0 0h640v480H0z"/>
                  <path fill="#002654" d="M0 0h213.3v480H0z"/>
                  <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
                </svg>
                <span>Français</span>
              </button>
              
              <button 
                className={`route-language-option ${currentLanguage === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                <svg className="route-flag-icon" viewBox="0 0 640 480" width="20" height="15">
                  <path fill="#012169" d="M0 0h640v480H0z"/>
                  <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
                  <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
                  <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
                  <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
                </svg>
                <span>English</span>
              </button>
            </div>
          </div>
          
          <button className="route-theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM1 12.5h3v2H1zM11 .55h2V3.5h-2zm8.04 2.495l1.408 1.407-1.79 1.79-1.407-1.408zm-1.8 15.115l1.79 1.8 1.41-1.41-1.8-1.79zM20 12.5h3v2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1 4h2v2.95h-2zm-7.45-.96l1.41 1.41 1.79-1.8-1.41-1.41z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path d="M9.37 5.51A7.35 7.35 0 009.1 7.5c0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27A7.014 7.014 0 0112 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="route-form-container">
        <div className="route-card verify-email-card">
          <div className="route-header">
            <div className="route-email-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <h2>{t('verifyEmail.title')}</h2>
            <p>{t('verifyEmail.subtitle')}</p>
          </div>
          
          <div className="route-email-display">
            <span>{email}</span>
          </div>
          
          <div className="route-instructions">
            <p>{t('verifyEmail.instructions')}</p>
            <ul>
              <li>{t('verifyEmail.step1')}</li>
              <li>{t('verifyEmail.step2')}</li>
              <li>{t('verifyEmail.step3')}</li>
            </ul>
          </div>
          
          <div className="route-actions">
            <button 
              onClick={handleResendEmail} 
              className="route-btn route-resend-btn"
              disabled={isResendDisabled}
            >
              {t('verifyEmail.resendButton')}
              {isResendDisabled && ` (${resendCountdown}s)`}
            </button>
            
            <button 
              onClick={handleCheckNow} 
              className="route-btn route-check-btn"
            >
              {t('verifyEmail.checkButton')}
            </button>
          </div>
          
          <div className="route-troubleshooting">
            <p>{t('verifyEmail.didNotReceive')}</p>
            <ul>
              <li>{t('verifyEmail.spamFolder')}</li>
              <li>{t('verifyEmail.wrongEmail')} <a href="#" onClick={goToLogin}>{t('verifyEmail.login')}</a></li>
            </ul>
          </div>
          
          {statusMessage && (
            <div className={`route-status-message ${isEmailVerified ? 'route-success' : 'route-info'}`}>
              {statusMessage}
              {isEmailVerified && (
                <div className="route-redirecting">
                  <span>{t('verifyEmail.redirecting')}</span>
                  <div className="route-loader-small"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <footer className="route-footer">
        <p>&copy; 2025 Priolys. {t('verifyEmail.rightsReserved')}</p>
        <div className="route-footer-links">
          <a href="#">{t('verifyEmail.terms')}</a>
          <a href="#">{t('verifyEmail.privacy')}</a>
          <a href="#">{t('verifyEmail.help')}</a>
        </div>
      </footer>
    </div>
  );
};

export default VerifyEmailPage;