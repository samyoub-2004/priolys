import React from 'react';

const PartnersSection = ({ t }) => {
  return (
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
  );
};

export default PartnersSection;