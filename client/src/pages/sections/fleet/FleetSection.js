import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../FirebaseConf/firebase';
import './FleetSection.css'; // Fichier CSS séparé

const FleetSection = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  // Récupération des véhicules depuis Firestore
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        let q;
        if (showAll) {
          q = query(collection(db, "vehicles"));
        } else {
          q = query(collection(db, "vehicles"), limit(6));
        }

        const querySnapshot = await getDocs(q);
        const vehiclesData = [];
        querySnapshot.forEach((doc) => {
          vehiclesData.push({ id: doc.id, ...doc.data() });
        });
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Error fetching vehicles: ", error);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [showAll]);

  return (
    <section id="fleet" className="fleet-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <h2>{t('fleet.title')}</h2>
          <p>{t('fleet.subtitle')}</p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="route-loader"></div>
          </div>
        ) : (
          <>
            <div className="fleet-grid">
              {vehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="vehicle-card animate-on-scroll"
                >
                  <div className="vehicle-image">
                    {vehicle.imageUrl ? (
                      <img src={vehicle.imageUrl} alt={vehicle.name} />
                    ) : (
                      <div className="image-placeholder">
                        <svg viewBox="0 0 24 24">
                          <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="vehicle-info">
                    <h3>{vehicle.name}</h3>
                    <div className="vehicle-specs">
                      <div className="spec-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        <span>{vehicle.passengers} {t('fleet.passengers')}</span>
                      </div>
                      <div className="spec-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M17 5.92L9 2v18H7v-1.73c-1.79.35-3 .99-3 1.73 0 1.1 2.69 2 6 2s6-.9 6-2c0-.99-2.16-1.81-5-1.97V8.98l6-3.06z"/>
                        </svg>
                        <span>{vehicle.luggage} {t('fleet.luggage')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!showAll && vehicles.length >= 6 && (
              <div className="view-more-container">
                <button 
                  className="view-more-btn"
                  onClick={() => setShowAll(true)}
                >
                  {t('fleet.viewMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FleetSection;