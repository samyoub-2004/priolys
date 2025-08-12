import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Services offerts
  const services = [
    {
      icon: 'airport',
      title: 'Transfert aéroport / gare',
      description: 'Accueil VIP et assurance de vos correspondances vers les principaux points de transport'
    },
    {
      icon: 'business',
      title: 'Déplacements professionnels',
      description: 'Des déplacements fluides, pour rester concentré sur l\'essentiel'
    },
    {
      icon: 'night',
      title: 'Déplacements nocturnes',
      description: 'Voyagez en toute sécurité, même au cœur de la nuit'
    },
    {
      icon: 'events',
      title: 'Transport pour vos événements',
      description: 'Une logistique de transport impeccable pour vos événements'
    },
    {
      icon: 'long',
      title: 'Transport longue distance',
      description: 'Une solution idéale pour vos trajets hors de la ville'
    },
    {
      icon: 'tour',
      title: 'Visites guidée',
      description: 'Nous vous emmenons à la découverte des plus beaux sites régionaux'
    },
    {
      icon: 'kids',
      title: 'Transport Enfants & Ados',
      description: 'Transport de vos enfants et adolescents vers leurs destinations'
    },
    {
      icon: 'dispo',
      title: 'Mise à disposition',
      description: 'Votre chauffeur privé disponible à chaque instant'
    }
  ];

  // Flotte de véhicules
  const vehicles = [
    {
      category: 'Berline Classique',
      models: ['Mercedes Classe C', 'Peugeot 508', 'Renault Talisman'],
      image: 'berline-classic'
    },
    {
      category: 'Berline Business',
      models: ['Mercedes Classe E', 'BMW Série 5', 'Audi A6'],
      image: 'berline-business'
    },
    {
      category: 'Van Éco',
      models: ['Renault Trafic', 'Peugeot Expert', 'Ford Transit'],
      image: 'van-eco'
    },
    {
      category: 'Van Luxe',
      models: ['Mercedes Classe V', 'Volkswagen Multivan'],
      image: 'van-luxe'
    },
    {
      category: 'VIP',
      models: ['Mercedes Classe S', 'BMW Série 7', 'Audi A8'],
      image: 'vip'
    },
    {
      category: 'VIP Grand Luxe',
      models: ['Mercedes-Benz Sprinter VIP', 'Range Rover Autobiography'],
      image: 'vip-grand'
    }
  ];

  // Articles du blog
  const blogPosts = [
    {
      title: 'Trois bonne raisons de préférer un VTC à un vol court-courrier',
      excerpt: 'Saviez-vous qu\'un vol court-courrier émet 5 fois plus de CO2 qu\'un trajet en voiture...',
      date: '12 août 2024'
    },
    {
      title: 'Chauffeur privé : La solution idéale pour un mariage élégant',
      excerpt: 'Organiser un mariage est une aventure excitante, mais cela peut aussi être source de...',
      date: '5 août 2024'
    },
    {
      title: 'Pourquoi choisir Priolys pour vos déplacements à Marseille',
      excerpt: 'Marseille est une ville à caractère dynamique qui offre une beauté incomparable...',
      date: '28 juillet 2024'
    }
  ];

  // Gestion du scroll pour les animations et la navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsMenuOpen(false);
      
      // Mise à jour de la section active
      const sections = ['home', 'services', 'fleet', 'partners', 'blog'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section);
        }
      }
      
      // Animations au scroll
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
    handleScroll(); // Initial call
    
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
    
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
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
              Accueil
            </a>
            <a 
              href="#services" 
              className={activeSection === 'services' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'services')}
            >
              Services
            </a>
            <a 
              href="#fleet" 
              className={activeSection === 'fleet' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'fleet')}
            >
              Flotte
            </a>
            <a 
              href="#partners" 
              className={activeSection === 'partners' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'partners')}
            >
              Partenaires
            </a>
            <a 
              href="#blog" 
              className={activeSection === 'blog' ? 'active' : ''}
              onClick={(e) => handleNavClick(e, 'blog')}
            >
              Blog
            </a>
          </div>
          
          <div className="nav-actions">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
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
              Réserver
            </button>
            <button 
              className="menu-toggle" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
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
            <h1>Solution VTC à la demande</h1>
            <h2>Votre service VTC professionnel depuis Marseille</h2>
            <p>Des déplacements haut de gamme avec une flotte premium et des chauffeurs professionnels</p>
          </div>
          
          <div className="reservation-card animate-on-scroll">
            <h3>Réserver un trajet</h3>
            
            <div className="form-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
              </div>
              <div className="input-content">
                <label>Votre adresse de départ</label>
                <input type="text" placeholder="Adresse précise, aéroport, hôtel" />
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
                <label>Date et heure de départ</label>
                <input type="date" placeholder="mm/dd/yyyy --:-- --" />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                </svg>
              </div>
              <div className="input-content">
                <label>Où souhaitez-vous aller ?</label>
                <input type="text" placeholder="Ville, région ou établissement etc..." />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="input-content">
                <label>Nombre de passagers</label>
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
                Ajouter un arrêt en chemin
              </label>
            </div>
            
            <button className="search-btn">
              <svg className="btn-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Nos services et prestations</h2>
            <p>Nous proposons des solutions adaptées à chacun de vos besoins</p>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="service-card animate-on-scroll"
              >
                <div className={`service-icon ${service.icon}`}></div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Flotte */}
      <section id="fleet" className="fleet-section">
        <div className="container">
          <div className="section-header animate-on-scroll">
            <h2>Nos classes de service</h2>
            <p>Une flotte premium pour tous vos besoins</p>
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
            <h2>Devenir partenaire</h2>
            <p>Nous avançons ensemble</p>
          </div>
          
          <div className="partners-content animate-on-scroll">
            <div className="partners-text">
              <p>
                Les partenariats sont une vraie force. Nous aimons collaborer avec des entreprises 
                et des professionnels qui partagent notre exigence de qualité. Rejoignez-nous pour 
                offrir à vos clients un service de transport haut de gamme, fiable et pensé pour chaque besoin.
              </p>
              
              <div className="partners-categories">
                <div className="category">Entreprises</div>
                <div className="category">Agences de voyages</div>
                <div className="category">Organisateurs d'événements</div>
                <div className="category">Hôtels et restaurants</div>
                <div className="category">Autres</div>
              </div>
              
              <button className="partner-btn">
                Devenir partenaire
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
            <h2>Blog</h2>
            <p>Découvrez nos conseils et actualités sur le transport privé</p>
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
                    Lire la suite
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
              <p>Service VTC professionnel à Marseille</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <svg viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01"/>
                  </svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="footer-column">
              <h4>À propos</h4>
              <ul>
                <li><a href="#">Mentions légales</a></li>
                <li><a href="#">Conditions d'utilisation</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Services et prestations</h4>
              <ul>
                <li><a href="#">Prestations</a></li>
                <li><a href="#">Nos véhicules</a></li>
                <li><a href="#">Circuits touristiques</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  contact@priolys.fr
                </li>
                <li>
                  <svg className="contact-icon" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  +33 7 50 14 18 64
                </li>
                <li>
                  <a href="#">
                    <svg className="contact-icon" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Envoyer un feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Priolys. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;