import React from 'react';
import { Autocomplete } from '@react-google-maps/api';

const HeroSection = ({
  t,
  isLoaded,
  reservationType,
  setReservationType,
  focusedInput,
  setFocusedInput,
  departureAddress,
  setDepartureAddress,
  destinationAddress,
  setDestinationAddress,
  locationAddress,
  setLocationAddress,
  date,
  setDate,
  passengers,
  setPassengers,
  hourlyDate,
  setHourlyDate,
  duration,
  setDuration,
  hourlyPassengers,
  setHourlyPassengers,
  departureInputRef,
  destinationInputRef,
  locationInputRef,
  getCurrentLocation,
  handleSearch,
  loadingAuth
}) => {
  // Références pour les autocomplétions
  const departureAutocompleteRef = React.useRef(null);
  const destinationAutocompleteRef = React.useRef(null);
  const locationAutocompleteRef = React.useRef(null);

  // Initialisation des autocomplétions
  const onDepartureLoad = (autocomplete) => {
    departureAutocompleteRef.current = autocomplete;
  };

  const onDestinationLoad = (autocomplete) => {
    destinationAutocompleteRef.current = autocomplete;
  };

  const onLocationLoad = (autocomplete) => {
    locationAutocompleteRef.current = autocomplete;
  };

  // Gestion des sélections d'adresse
  const onDeparturePlaceChanged = () => {
    if (departureAutocompleteRef.current) {
      const place = departureAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setDepartureAddress(place.formatted_address);
      }
    }
  };

  const onDestinationPlaceChanged = () => {
    if (destinationAutocompleteRef.current) {
      const place = destinationAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setDestinationAddress(place.formatted_address);
      }
    }
  };

  const onLocationPlaceChanged = () => {
    if (locationAutocompleteRef.current) {
      const place = locationAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setLocationAddress(place.formatted_address);
      }
    }
  };

  return (
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
                <div 
                  className={`input-container ${focusedInput === 'departure' ? 'focused' : ''}`}
                  onClick={() => {
                    departureInputRef.current.focus();
                    setFocusedInput('departure');
                  }}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="departure">{t('reservation.departureLabel')}</label>
                    {isLoaded && (
                      <Autocomplete
                        onLoad={onDepartureLoad}
                        onPlaceChanged={onDeparturePlaceChanged}
                      >
                        <input 
                          id="departure"
                          type="text" 
                          placeholder={t('reservation.departurePlaceholder')}
                          value={departureAddress}
                          onChange={(e) => setDepartureAddress(e.target.value)}
                          ref={departureInputRef}
                          onFocus={() => setFocusedInput('departure')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </Autocomplete>
                    )}
                  </div>
                  <button 
                    className="location-btn"
                    onClick={() => getCurrentLocation('departure')}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <div 
                  className={`input-container ${focusedInput === 'date' ? 'focused' : ''}`}
                  onClick={() => setFocusedInput('date')}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="date">{t('reservation.dateLabel')}</label>
                    <input 
                      id="date"
                      type="datetime-local" 
                      placeholder={t('reservation.datePlaceholder')} 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onFocus={() => setFocusedInput('date')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <div 
                  className={`input-container ${focusedInput === 'destination' ? 'focused' : ''}`}
                  onClick={() => {
                    destinationInputRef.current.focus();
                    setFocusedInput('destination');
                  }}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="destination">{t('reservation.destinationLabel')}</label>
                    {isLoaded && (
                      <Autocomplete
                        onLoad={onDestinationLoad}
                        onPlaceChanged={onDestinationPlaceChanged}
                      >
                        <input 
                          id="destination"
                          type="text" 
                          placeholder={t('reservation.destinationPlaceholder')}
                          value={destinationAddress}
                          onChange={(e) => setDestinationAddress(e.target.value)}
                          ref={destinationInputRef}
                          onFocus={() => setFocusedInput('destination')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </Autocomplete>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <div 
                  className={`input-container ${focusedInput === 'passengers' ? 'focused' : ''}`}
                  onClick={() => setFocusedInput('passengers')}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="passengers">{t('reservation.passengersLabel')}</label>
                    <select 
                      id="passengers"
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      onFocus={() => setFocusedInput('passengers')}
                      onBlur={() => setFocusedInput(null)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Formulaire Location à l'heure */}
            <div className={`reservation-form ${reservationType === 'hourly' ? 'active' : ''}`}>
              <div className="form-group">
                <div 
                  className={`input-container ${focusedInput === 'location' ? 'focused' : ''}`}
                  onClick={() => {
                    locationInputRef.current.focus();
                    setFocusedInput('location');
                  }}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="location">{t('reservation.locationLabel')}</label>
                    {isLoaded && (
                      <Autocomplete
                        onLoad={onLocationLoad}
                        onPlaceChanged={onLocationPlaceChanged}
                      >
                        <input 
                          id="location"
                          type="text" 
                          placeholder={t('reservation.locationPlaceholder')}
                          value={locationAddress}
                          onChange={(e) => setLocationAddress(e.target.value)}
                          ref={locationInputRef}
                          onFocus={() => setFocusedInput('location')}
                          onBlur={() => setFocusedInput(null)}
                        />
                      </Autocomplete>
                    )}
                  </div>
                  <button 
                    className="location-btn"
                    onClick={() => getCurrentLocation('location')}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <div 
                  className={`input-container ${focusedInput === 'hourly-date' ? 'focused' : ''}`}
                  onClick={() => setFocusedInput('hourly-date')}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="hourly-date">{t('reservation.dateLabel')}</label>
                    <input 
                      id="hourly-date"
                      type="text" 
                      placeholder={t('reservation.datePlaceholder')}
                      value={hourlyDate}
                      onChange={(e) => setHourlyDate(e.target.value)}
                      onFocus={() => setFocusedInput('hourly-date')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <div 
                  className={`input-container ${focusedInput === 'duration' ? 'focused' : ''}`}
                  onClick={() => setFocusedInput('duration')}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v7h4v-2h-2z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="duration">{t('reservation.durationLabel')}</label>
                    <select 
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      onFocus={() => setFocusedInput('duration')}
                      onBlur={() => setFocusedInput(null)}
                    >
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
                <div 
                  className={`input-container ${focusedInput === 'hourly-passengers' ? 'focused' : ''}`}
                  onClick={() => setFocusedInput('hourly-passengers')}
                >
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <div className="input-content">
                    <label htmlFor="hourly-passengers">{t('reservation.passengersLabel')}</label>
                    <select 
                      id="hourly-passengers"
                      value={hourlyPassengers}
                      onChange={(e) => setHourlyPassengers(e.target.value)}
                      onFocus={() => setFocusedInput('hourly-passengers')}
                      onBlur={() => setFocusedInput(null)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            className="search-btn"
            onClick={handleSearch}
            disabled={loadingAuth}
          >
            <svg className="btn-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/>
            </svg>
            {t('buttons.search')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;