// src/pages/SignUp/SignUpPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from '../FirebaseConf/firebase';
import '../Login/Login.css';

const SignUpPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Vérifier la force du mot de passe
  useEffect(() => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]
      .filter(Boolean).length;

    setPasswordStrength({
      score,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    });
  }, [password]);

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

  const getPasswordStrengthText = () => {
    if (password.length === 0) return '';
    switch(passwordStrength.score) {
      case 0:
      case 1:
        return t('signup.weak');
      case 2:
        return t('signup.medium');
      case 3:
        return t('signup.good');
      case 4:
        return t('signup.strong');
      case 5:
        return t('signup.excellent');
      default:
        return '';
    }
  };

  const getPasswordStrengthClass = () => {
    if (password.length === 0) return '';
    switch(passwordStrength.score) {
      case 0:
      case 1:
        return 'route-password-weak';
      case 2:
        return 'route-password-medium';
      case 3:
        return 'route-password-good';
      case 4:
        return 'route-password-strong';
      case 5:
        return 'route-password-excellent';
      default:
        return '';
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError(t('signup.passwordsMismatch'));
      setLoading(false);
      return;
    }
    
    if (passwordStrength.score < 3) {
      setError(t('signup.passwordTooWeak'));
      setLoading(false);
      return;
    }
    
    if (!agreedToTerms) {
      setError(t('signup.agreeTermsRequired'));
      setLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      navigate('/verify-email', { state: { email: user.email } });
    } catch (error) {
      console.error("Erreur d'inscription", error);
      setError(t(`signup.errors.${error.code}`) || t('signup.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        email: user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      navigate('/');
    } catch (error) {
      console.error("Erreur de connexion sociale", error);
      setError(t(`signup.errors.${error.code}`) || t('signup.errors.default'));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="route-page-container">
      <nav className="route-navbar compact">
        <div className="route-navbar-left">
          <h1 className="route-logo">Priolys</h1>
        </div>
        <div className="route-navbar-right">
          <div className="route-language-dropdown" ref={languageMenuRef}>
            <button className="route-language-toggle" onClick={toggleLanguageMenu}>
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
            
            {isLanguageMenuOpen && (
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
            )}
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

      <div className="route-form-container">
        <div className="route-card">
          <div className="route-header">
            <h2>{t('signup.title')}</h2>
            <p>{t('signup.subtitle')}</p>
          </div>
          
          {error && <div className="route-error-message">{error}</div>}
          
          <form onSubmit={handleEmailSignUp} className="route-form">
            <div className="route-form-group">
              <label htmlFor="firstName">{t('signup.firstName')}</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('signup.firstNamePlaceholder')}
                required
                disabled={loading}
              />
            </div>
            
            <div className="route-form-group">
              <label htmlFor="lastName">{t('signup.lastName')}</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('signup.lastNamePlaceholder')}
                required
                disabled={loading}
              />
            </div>
            
            <div className="route-form-group">
              <label htmlFor="email">{t('signup.email')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('signup.emailPlaceholder')}
                required
                disabled={loading}
              />
            </div>
            
            <div className="route-form-group">
              <label htmlFor="password">{t('signup.password')}</label>
              <div className="route-password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('signup.passwordPlaceholder')}
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
              
              {password.length > 0 && (
                <div className="route-password-strength">
                  <div className={`route-strength-bar ${getPasswordStrengthClass()}`}>
                    <div className="route-strength-fill"></div>
                  </div>
                  <div className="route-strength-text">
                    {t('signup.strength')}: <span className={getPasswordStrengthClass()}>{getPasswordStrengthText()}</span>
                  </div>
                  
                  <div className="route-password-requirements">
                    <p>{t('signup.requirements')}:</p>
                    <ul>
                      <li className={passwordStrength.hasMinLength ? 'route-requirement-met' : ''}>
                        {t('signup.minLength')}
                      </li>
                      <li className={passwordStrength.hasUpperCase ? 'route-requirement-met' : ''}>
                        {t('signup.uppercase')}
                      </li>
                      <li className={passwordStrength.hasLowerCase ? 'route-requirement-met' : ''}>
                        {t('signup.lowercase')}
                      </li>
                      <li className={passwordStrength.hasNumber ? 'route-requirement-met' : ''}>
                        {t('signup.number')}
                      </li>
                      <li className={passwordStrength.hasSpecialChar ? 'route-requirement-met' : ''}>
                        {t('signup.specialChar')}
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="route-form-group">
              <label htmlFor="confirmPassword">{t('signup.confirmPassword')}</label>
              <div className="route-password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('signup.confirmPasswordPlaceholder')}
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="route-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
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
              {password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="route-password-mismatch">{t('signup.passwordsMismatch')}</p>
              )}
            </div>
            
            <div className="route-form-group">
              <div className="route-remember-me">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="terms">
                  {t('signup.agreeTo')} <a href="#" className="route-terms-link">{t('signup.terms')}</a>
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="route-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="route-loader"></div>
              ) : (
                t('signup.createAccount')
              )}
            </button>
          </form>
          
          <div className="route-separator">
            <span>{t('signup.or')}</span>
          </div>
          
          <div className="route-social-login">
            <button 
              className="route-social-btn route-google-btn"
              onClick={() => handleSocialSignUp(googleProvider)}
              disabled={loading}
            >
              <img src="https://cdn-icons-png.flaticon.com/128/300/300221.png" width={20} height={20} loading='lazy' alt="Google" />
              {t('signup.signUpGoogle')}
            </button>
            
            <button 
              className="route-social-btn route-apple-btn"
              onClick={() => handleSocialSignUp(appleProvider)}
              disabled={loading}
            >
              <img src="https://cdn-icons-png.flaticon.com/128/25/25345.png" width={20} height={20} loading='lazy' alt="Apple" />
              {t('signup.signUpApple')}
            </button>
          </div>
          
          <div className="route-signup-link">
            {t('signup.alreadyAccount')} 
            <button onClick={goToLogin} className="route-signup-button">
              {t('signup.login')}
            </button>
          </div>
        </div>
      </div>
      
      <footer className="route-footer">
        <p>&copy; 2025 Priolys. {t('signup.rightsReserved')}</p>
        <div className="route-footer-links">
          <a href="#">{t('signup.terms')}</a>
          <a href="#">{t('signup.privacy')}</a>
          <a href="#">{t('signup.help')}</a>
        </div>
      </footer>
    </div>
  );
};

export default SignUpPage;