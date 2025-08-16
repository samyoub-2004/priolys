import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import "./Navbar.css";

const Navbar = ({ 
  darkMode, 
  setDarkMode, 
  isMenuOpen, 
  setIsMenuOpen, 
  activeSection, 
  handleNavClick,
  isLanguageMenuOpen,
  setIsLanguageMenuOpen
}) => {
  const { t, i18n } = useTranslation();
  const languageDropdownRef = useRef(null);
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageMenuOpen(false);
  };

  const handleAuthClick = () => {
    navigate('/login'); // Redirection vers la page Login
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <span className="logo-icon"></span>
          <span className="logo-text">PRIOLYS</span>
        </div>
        
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <a 
            href="#home" 
            className={activeSection === 'home' ? 'active' : ''}
            onClick={(e) => handleNavClick(e, 'home')}
          >
            {t('menu.home')}
          </a>
          <a 
            href="#services" 
            className={activeSection === 'services' ? 'active' : ''}
            onClick={(e) => handleNavClick(e, 'services')}
          >
            {t('menu.services')}
          </a>
          <a 
            href="#fleet" 
            className={activeSection === 'fleet' ? 'active' : ''}
            onClick={(e) => handleNavClick(e, 'fleet')}
          >
            {t('menu.fleet')}
          </a>
          <a 
            href="#partners" 
            className={activeSection === 'partners' ? 'active' : ''}
            onClick={(e) => handleNavClick(e, 'partners')}
          >
            {t('menu.partners')}
          </a>
          <a 
            href="#blog" 
            className={activeSection === 'blog' ? 'active' : ''}
            onClick={(e) => handleNavClick(e, 'blog')}
          >
            {t('menu.blog')}
          </a>
        </div>
        
        <div className="nav-actions">
          <div className="language-dropdown" ref={languageDropdownRef}>
            <button 
              className="current-language"
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              aria-expanded={isLanguageMenuOpen}
            >
              <span className={`flag-icon ${i18n.language === 'fr' ? 'fr' : 'en'}`}></span>
              {i18n.language.toUpperCase()}
              <svg className="dropdown-arrow" viewBox="0 0 24 24">
                <path d={isLanguageMenuOpen 
                  ? "M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" 
                  : "M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"}/>
              </svg>
            </button>
            
            <div className={`language-options ${isLanguageMenuOpen ? 'open' : ''}`}>
              <button 
                className={`lang-option ${i18n.language === 'fr' ? 'active' : ''}`}
                onClick={() => changeLanguage('fr')}
              >
                <span className="flag-icon fr"></span>
                Français
              </button>
              <button 
                className={`lang-option ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                <span className="flag-icon en"></span>
                English
              </button>
            </div>
          </div>
          
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? t('ariaLabels.lightMode') : t('ariaLabels.darkMode')}
          >
            {darkMode ? (
              <svg className="theme-icon" viewBox="0 0 24 24">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
              </svg>
            ) : (
              <svg className="theme-icon" viewBox="0 0 24 24">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
              </svg>
            )}
          </button>
          
          {/* Bouton d'authentification avec redirection */}
          <button className="auth-btn" onClick={handleAuthClick}>
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6z"/>
            </svg>
            {t('buttons.authenticate')}
          </button>
          
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t('ariaLabels.menu')}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;