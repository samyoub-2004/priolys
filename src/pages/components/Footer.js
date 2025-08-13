import React from 'react';
import { useTranslation } from 'react-i18next';
import "./Footer.css"
const Footer = () => {
  const { t } = useTranslation();
  
  return (
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
  );
};

export default Footer;