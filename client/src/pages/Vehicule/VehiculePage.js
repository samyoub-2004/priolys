import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../FirebaseConf/firebase';
import './VehiclePage.css';

const VehiclePage = () => {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  
  // États pour le formulaire
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [pricePerKm, setPricePerKm] = useState(0); 
  const [pricePerHour, setPricePerHour] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);
  
  // Charger les véhicules existants
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "vehicles"));
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

  // Appliquer le dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('route-dark-mode');
    } else {
      document.body.classList.remove('route-dark-mode');
    }
  }, [darkMode]);

  // Pré-remplir le formulaire pour l'édition
  useEffect(() => {
    if (currentVehicle) {
      setName(currentVehicle.name);
      setImageUrl(currentVehicle.imageUrl);
      setPassengers(currentVehicle.passengers);
      setLuggage(currentVehicle.luggage);
      setPricePerKm(currentVehicle.pricePerKm);
      setPricePerHour(currentVehicle.pricePerHour);
      setBasePrice(currentVehicle.basePrice);
      setShowForm(true);
    }
  }, [currentVehicle]);

  const resetForm = () => {
    setName('');
    setImageUrl('');
    setPassengers(1);
    setLuggage(1);
    setPricePerKm(0);
    setPricePerHour(0);
    setBasePrice(0);
    setCurrentVehicle(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const vehicleData = {
        name,
        imageUrl,
        passengers,
        luggage,
        pricePerKm: parseFloat(pricePerKm),
        pricePerHour: parseFloat(pricePerHour),
        basePrice: parseFloat(basePrice),
        updatedAt: new Date()
      };

      if (currentVehicle) {
        // Mise à jour du véhicule existant
        await updateDoc(doc(db, "vehicles", currentVehicle.id), vehicleData);
      } else {
        // Création d'un nouveau véhicule
        vehicleData.createdAt = new Date();
        await addDoc(collection(db, "vehicles"), vehicleData);
      }
      
      // Réinitialiser et fermer
      resetForm();
      setShowForm(false);
      fetchVehicles();
      
    } catch (error) {
      console.error("Error saving vehicle: ", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('vehicle.confirmDelete'))) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, "vehicles", id));
        fetchVehicles();
      } catch (error) {
        console.error("Error deleting vehicle: ", error);
      }
      setLoading(false);
    }
  };

  const increment = (setter, value) => {
    setter(value + 1);
  };

  const decrement = (setter, value) => {
    if (value > 1) setter(value - 1);
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
     
      <div className="vehicle-container">
        <div className="vehicle-header">
          <h1>{t('vehicle.title')}</h1>
          <button 
            className="route-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            {t('vehicle.addVehicle')}
          </button>
        </div>

        {showForm && (
          <div className="vehicle-form-popup">
            <div className="vehicle-form-container">
              <div className="form-header">
                <h2>{currentVehicle ? t('vehicle.editVehicle') : t('vehicle.addNewVehicle')}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="route-form-group">
                  <label>{t('vehicle.name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('vehicle.namePlaceholder')}
                    required
                  />
                </div>
                
                <div className="route-form-group">
                  <label>{t('vehicle.imageUrl')}</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={t('vehicle.imagePlaceholder')}
                    required
                  />
                </div>
                
                <div className="counter-group">
                  <div className="counter-item">
                    <label>{t('vehicle.passengers')}</label>
                    <div className="counter-controls">
                      <button 
                        type="button"
                        onClick={() => decrement(setPassengers, passengers)}
                      >
                        -
                      </button>
                      <span>{passengers}</span>
                      <button 
                        type="button"
                        onClick={() => increment(setPassengers, passengers)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="counter-item">
                    <label>{t('vehicle.luggage')}</label>
                    <div className="counter-controls">
                      <button 
                        type="button"
                        onClick={() => decrement(setLuggage, luggage)}
                      >
                        -
                      </button>
                      <span>{luggage}</span>
                      <button 
                        type="button"
                        onClick={() => increment(setLuggage, luggage)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="pricing-group">
                  <div className="route-form-group">
                    <label>{t('vehicle.pricePerKm')} (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricePerKm}
                      onChange={(e) => setPricePerKm(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="route-form-group">
                    <label>{t('vehicle.pricePerHour')} (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="route-form-group">
                    <label>{t('vehicle.basePrice')} (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="route-btn"
                  disabled={loading}
                >
                  {loading ? <div className="route-loader"></div> : 
                    (currentVehicle ? t('vehicle.updateVehicle') : t('vehicle.addVehicle'))}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="route-loader"></div>
          </div>
        ) : (
          <div className="vehicle-list">
            {vehicles.length === 0 ? (
              <div className="no-vehicles">
                <p>{t('vehicle.noVehicles')}</p>
              </div>
            ) : (
              vehicles.map(vehicle => (
                <div key={vehicle.id} className="vehicle-card">
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
                  <div className="vehicle-details">
                    <h3>{vehicle.name}</h3>
                    <div className="vehicle-specs">
                      <div className="spec-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        <span>{vehicle.passengers} {t('vehicle.passengers')}</span>
                      </div>
                      <div className="spec-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M17 5.92L9 2v18H7v-1.73c-1.79.35-3 .99-3 1.73 0 1.1 2.69 2 6 2s6-.9 6-2c0-.99-2.16-1.81-5-1.97V8.98l6-3.06z"/>
                        </svg>
                        <span>{vehicle.luggage} {t('vehicle.luggage')}</span>
                      </div>
                    </div>
                    <div className="vehicle-pricing">
                      <div className="price-item">
                        <span>{t('vehicle.pricePerKm')}:</span>
                        <strong>{vehicle.pricePerKm}€</strong>
                      </div>
                      <div className="price-item">
                        <span>{t('vehicle.pricePerHour')}:</span>
                        <strong>{vehicle.pricePerHour}€</strong>
                      </div>
                      <div className="price-item">
                        <span>{t('vehicle.basePrice')}:</span>
                        <strong>{vehicle.basePrice}€</strong>
                      </div>
                    </div>
                    
                    <div className="vehicle-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => setCurrentVehicle(vehicle)}
                      >
                        {t('vehicle.edit')}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        {t('vehicle.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclePage;