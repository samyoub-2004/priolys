import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './LandingPage.css';

const LandingPage = () => {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [suggestions, setSuggestions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const suggestionsRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: t('chatbot.initialMessage'), sender: 'bot' }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [reservationType, setReservationType] = useState('simple');

  // Services offerts
  const services = t('services', { returnObjects: true });
  const vehicles = t('vehicles', { returnObjects: true });
  const blogPosts = t('blogPosts', { returnObjects: true });
  const cities = t('cities', { returnObjects: true });
  const reviews = t('reviews', { returnObjects: true });

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsMenuOpen(false);
      setIsLanguageMenuOpen(false);
      
      const sections = ['home', 'services', 'fleet', 'partners', 'blog', 'reviews'];
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
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Envoyer un message dans le chatbot
  const handleSendMessage = () => {
    if (messageInput.trim() === '') return;
    
    const userMessage = { text: messageInput, sender: 'user' };
    setMessages([...messages, userMessage]);
    setMessageInput('');
    
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`landing-container ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeSection={activeSection}
        handleNavClick={handleNavClick}
        isLanguageMenuOpen={isLanguageMenuOpen}
        setIsLanguageMenuOpen={setIsLanguageMenuOpen}
      />

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
            <div className="reservation-type-toggle">
              <button 
                className={`toggle-btn ${reservationType === 'simple' ? 'active' : ''}`}
                onClick={() => setReservationType('simple')}
              >
                {t('reservation.simpleTrip')}
              </button>
              <button 
                className={`toggle-btn ${reservationType === 'hourly' ? 'active' : ''}`}
                onClick={() => setReservationType('hourly')}
              >
                {t('reservation.hourlyRental')}
              </button>
            </div>
            
            <div className="form-container">
              {/* Formulaire Trajet Simple */}
              <div className={`reservation-form ${reservationType === 'simple' ? 'active' : ''}`}>
                <div className="form-group">
                  <div className="input-container" >
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
                </div>
                
                <div className="form-group">
                  <div className="input-container">
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
                </div>
                
                <div className="form-group">
                  <div className="input-container">
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
                </div>
                
                <div className="form-group">
                  <div className="input-container">
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
                </div>
                
                
              </div>
              
              {/* Formulaire Location à l'heure */}
              <div className={`reservation-form ${reservationType === 'hourly' ? 'active' : ''}`}>
                <div className="form-group">
                  <div className="input-container">
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                      </svg>
                    </div>
                    <div className="input-content">
                      <label>{t('reservation.locationLabel')}</label>
                      <input type="text" placeholder={t('reservation.locationPlaceholder')} />
                    </div>
                    <button className="location-btn">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-container">
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
                </div>
                
                <div className="form-group">
                  <div className="input-container">
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v7h4v-2h-2z"/>
                      </svg>
                    </div>
                    <div className="input-content">
                      <label>{t('reservation.durationLabel')}</label>
                      <select>
                        {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                          <option key={hour} value={hour}>
                            {hour} {t('reservation.hours')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <div className="input-container">
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
                </div>
              </div>
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

      {/* Section Avis */}
      <section id="reviews" className="reviews-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>{t('reviewsSection.title')}</h2>
            <p>{t('reviewsSection.description')}</p>
          </div>
          
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="review-card animate-on-scroll"
              >
                <div className="review-header">
                  <div className="review-avatar"></div>
                  <div>
                    <h3>{review.name}</h3>
                    <div className="review-rating">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                </div>
                <p className="review-comment">"{review.comment}"</p>
                <div className="review-date">{review.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

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