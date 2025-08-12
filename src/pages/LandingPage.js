import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [suggestions, setSuggestions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const suggestionsRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: t('chatbot.initialMessage'), sender: 'bot' }
  ]);
  const [messageInput, setMessageInput] = useState('');

  // Services offerts
  const services = t('services', { returnObjects: true });

  // Flotte de véhicules
  const vehicles = t('vehicles', { returnObjects: true });

  // Articles du blog
  const blogPosts = t('blogPosts', { returnObjects: true });

  // Suggestions de villes
  const cities = t('cities', { returnObjects: true });

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsMenuOpen(false);
      setIsLanguageMenuOpen(false);
      
      const sections = ['home', 'services', 'fleet', 'partners', 'blog'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section);
        }
      }
      
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.85) {
          el.classList.add('animated');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Appliquer le dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Gestion du clic sur les liens de navigation
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setIsLanguageMenuOpen(false);
    
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Gestion des suggestions pour la recherche
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.length > 1) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (city) => {
    setSearchValue(city);
    setSuggestions([]);
  };

  // Fermer les menus quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([]);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Changer la langue
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageMenuOpen(false);
  };

  // Envoyer un message dans le chatbot
  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    
    // Ajouter le message de l'utilisateur
    const userMessage = { text: messageInput, sender: 'user' };
    setMessages([...messages, userMessage]);
    setMessageInput('');
    
    // Simuler une réponse du bot après un délai
    setTimeout(() => {
      const responses = [
        t('chatbot.response1'),
        t('chatbot.response2'),
        t('chatbot.response3')
      ];
      const botResponse = {
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Gestion de la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`landing-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Navigation */}
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
            <button className="reserve-btn">
              <svg className="btn-icon" viewBox="0 0 24 24">
                <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z"/>
                <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z"/>
                <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/>
              </svg>
              {t('buttons.reserve')}
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

      {/* Section Hero */}
      <section id="home" className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="hero-text animate-on-scroll">
            <h1>{t('hero.title')}</h1>
            <h2>{t('hero.subtitle')}</h2>
            <p>{t('hero.description')}</p>
          </div>
          
          <div className="reservation-card animate-on-scroll">
            <h3>{t('reservation.title')}</h3>
            
            <div className="form-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
              </div>
              <div className="input-content">
                <label>{t('reservation.departureLabel')}</label>
                <input type="text" placeholder={t('reservation.departurePlaceholder')} />
              </div>
              <button className="location-btn">
                <svg viewBox="0 0 24 24">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
              </button>
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <div className="input-content">
                <label>{t('reservation.dateLabel')}</label>
                <input type="text" placeholder={t('reservation.datePlaceholder')} />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
              </div>
              <div className="input-content">
                <label>{t('reservation.destinationLabel')}</label>
                <input 
                  type="text" 
                  placeholder={t('reservation.destinationPlaceholder')}
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {suggestions.length > 0 && (
                  <div className="suggestions-box" ref={suggestionsRef}>
                    {suggestions.map((city, index) => (
                      <div 
                        key={index} 
                        className="suggestion-item"
                        onClick={() => selectSuggestion(city)}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="input-content">
                <label>{t('reservation.passengersLabel')}</label>
                <select>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </div>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" />
                <span className="checkmark"></span>
                {t('reservation.stopLabel')}
              </label>
            </div>
            
            <button className="search-btn">
              <svg className="btn-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              {t('buttons.search')}
            </button>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>{t('servicesSection.title')}</h2>
            <p>{t('servicesSection.description')}</p>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="service-card animate-on-scroll"
              >
                <div className={`service-icon ${service.icon}`}></div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="service-details">
                    {service.details.map((detail, i) => (
                      <div key={i} className="detail-item">
                        <span className="detail-icon">✓</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Flotte */}
      <section id="fleet" className="fleet-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>{t('fleetSection.title')}</h2>
            <p>{t('fleetSection.description')}</p>
          </div>
          
          <div className="fleet-grid">
            {vehicles.map((vehicle, index) => (
              <div 
                key={index} 
                className="vehicle-card animate-on-scroll"
              >
                <div className={`vehicle-image ${vehicle.image}`}></div>
                <div className="vehicle-info">
                  <h3>{vehicle.category}</h3>
                  <ul>
                    {vehicle.models.map((model, i) => (
                      <li key={i}>{model}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Partenaires */}
      <section id="partners" className="partners-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>{t('partnersSection.title')}</h2>
            <p>{t('partnersSection.subtitle')}</p>
          </div>
          
          <div className="partners-content animate-on-scroll">
            <div className="partners-text">
              <p>{t('partnersSection.description')}</p>
              
              <div className="partners-categories">
                {t('partnersSection.categories', { returnObjects: true }).map((category, index) => (
                  <div key={index} className="category">{category}</div>
                ))}
              </div>
              
              <button className="partner-btn">
                {t('buttons.becomePartner')}
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </button>
            </div>
            
            <div className="partners-image"></div>
          </div>
        </div>
      </section>

      {/* Section Blog */}
      <section id="blog" className="blog-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>{t('blogSection.title')}</h2>
            <p>{t('blogSection.description')}</p>
          </div>
          
          <div className="blog-grid">
            {blogPosts.map((post, index) => (
              <div 
                key={index} 
                className="blog-card animate-on-scroll"
              >
                <div className="blog-image"></div>
                <div className="blog-content">
                  <span className="blog-date">{post.date}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <a href="#" className="read-more">
                    {t('buttons.readMore')}
                    <svg className="arrow-icon" viewBox="0 0 24 24">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="logo">
                <span className="logo-icon"></span>
                <span className="logo-text">PRIOLYS</span>
              </div>
              <p>{t('footer.description')}</p>
              <div className="social-links">
                <a href="#" aria-label={t('ariaLabels.facebook')}>
                  <svg viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="#" aria-label={t('ariaLabels.instagram')}>
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/>
                  </svg>
                </a>
                <a href="#" aria-label={t('ariaLabels.twitter')}>
                  <svg viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" aria-label={t('ariaLabels.linkedin')}>
                  <svg viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="footer-column">
              <h4>{t('footer.about')}</h4>
              <ul>
                <li><a href="#">{t('footer.legal')}</a></li>
                <li><a href="#">{t('footer.terms')}</a></li>
                <li><a href="#">{t('footer.privacy')}</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>{t('footer.services')}</h4>
              <ul>
                <li><a href="#">{t('footer.services')}</a></li>
                <li><a href="#">{t('footer.vehicles')}</a></li>
                <li><a href="#">{t('footer.tours')}</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>{t('footer.contact')}</h4>
              <ul>
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {t('contact.email')}
                </li>
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  {t('contact.phone')}
                </li>
                <li>
                  <a href="#">
                    <svg className="contact-icon" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    {t('contact.feedback')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Priolys. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <div className={`chatbot-container ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-window">
          <div className="chat-header">
            <h3>{t('chatbot.title')}</h3>
            <button className="close-chat" onClick={() => setIsChatOpen(false)}>
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="bot-avatar">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/>
                    </svg>
                  </div>
                )}
                <div className="message-content">
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="chat-input">
            <input
              type="text"
              placeholder={t('chatbot.placeholder')}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage}>
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <button className="chatbot-button" onClick={() => setIsChatOpen(!isChatOpen)}>
          {isChatOpen ? (
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;