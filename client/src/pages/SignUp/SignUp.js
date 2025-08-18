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
import Navbar from '../components/Navbar';
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
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLanguageMenuOpen={isLanguageMenuOpen}
        setIsLanguageMenuOpen={setIsLanguageMenuOpen}
      />

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