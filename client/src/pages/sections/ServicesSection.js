import React from 'react';

const ServicesSection = ({ services , t }) => {
  return (
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
  );
};

export default ServicesSection;