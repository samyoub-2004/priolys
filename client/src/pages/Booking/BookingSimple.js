import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useJsApiLoader, GoogleMap, DirectionsRenderer, Marker, Autocomplete } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../FirebaseConf/firebase';
import Navbar from '../components/Navbar';
import './BookingSimple.css';

const libraries = ['places', 'geocoding'];
const googleMapsApiKey = "AIzaSyBLGs7aK3AGCGcRok_d-t5_1KJL1R3sf7o";

const BookingSimple = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries
  });

  // Récupération des données depuis localStorage
  const reservationData = JSON.parse(localStorage.getItem('tempReservation') || localStorage.getItem('reservationData') || '{}');
  
  // États pour le wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  
  // États pour les adresses
  const [departure, setDeparture] = useState(reservationData.departure || '');
  const [destination, setDestination] = useState(reservationData.destination || '');
  const [waypoints, setWaypoints] = useState(reservationData.waypoints || []);
  const [flightNumber, setFlightNumber] = useState(reservationData.flightNumber || '');
  
  // États pour le trajet
  const [date, setDate] = useState(reservationData.date || '');
  const [passengers, setPassengers] = useState(reservationData.passengers || '1');
  
  // États pour Google Maps
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(reservationData.distance || '');
  const [duration, setDuration] = useState(reservationData.duration || '');
  const [distanceValue, setDistanceValue] = useState(reservationData.distanceValue || 0);
  const [durationValue, setDurationValue] = useState(reservationData.durationValue || 0);
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 });
  const [markers, setMarkers] = useState([]);
  
  // Références pour les inputs
  const departureInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const waypointInputRefs = useRef([]);
  
  // Références pour les autocomplétions
  const departureAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);
  const waypointAutocompleteRefs = useRef([]);

  // États pour les véhicules
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehiclesError, setVehiclesError] = useState('');

  // Options supplémentaires
  const additionalOptions = [
    { id: 'airport', name: t('booking.airportVIP'), price: 30 },
    { id: 'baby', name: t('booking.babySeat'), price: 10 },
    { id: 'child', name: t('booking.childSeat'), price: 10 },
    { id: 'booster', name: t('booking.boosterSeat'), price: 10 },
    { id: 'pet', name: t('booking.pets'), price: 20 },
    { id: 'early', name: t('booking.earlyArrival'), price: 0 }
  ];
  
  const [selectedOptions, setSelectedOptions] = useState(reservationData.selectedOptions || []);

  // Calculer le prix total des options
  const totalOptionsPrice = selectedOptions.reduce((total, optionId) => {
    const option = additionalOptions.find(opt => opt.id === optionId);
    return total + (option ? option.price : 0);
  }, 0);

  // Charger les données initiales
  useEffect(() => {
    // Appliquer le dark mode si nécessaire
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  // Appliquer le dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.body.classList.add('route-dark-mode');
    } else {
      document.body.classList.remove('route-dark-mode');
    }
  }, [darkMode]);

  // Initialiser les autocomplétions
  const onDepartureLoad = (autocomplete) => {
    departureAutocompleteRef.current = autocomplete;
  };

  const onDestinationLoad = (autocomplete) => {
    destinationAutocompleteRef.current = autocomplete;
  };

  const onWaypointLoad = (autocomplete, index) => {
    waypointAutocompleteRefs.current[index] = autocomplete;
  };

  // Gestion des sélections d'adresse
  const onDeparturePlaceChanged = () => {
    if (departureAutocompleteRef.current) {
      const place = departureAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setDeparture(place.formatted_address);
      }
    }
  };

  const onDestinationPlaceChanged = () => {
    if (destinationAutocompleteRef.current) {
      const place = destinationAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setDestination(place.formatted_address);
      }
    }
  };

  const onWaypointPlaceChanged = (index) => {
    if (waypointAutocompleteRefs.current[index]) {
      const place = waypointAutocompleteRefs.current[index].getPlace();
      if (place.formatted_address) {
        const newWaypoints = [...waypoints];
        newWaypoints[index] = place.formatted_address;
        setWaypoints(newWaypoints);
      }
    }
  };

  // Calculer l'itinéraire
  const calculateRoute = () => {
    if (!isLoaded || !departure || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    const waypointsFormatted = waypoints
      .filter(wp => wp)
      .map(wp => ({ location: wp, stopover: true }));
    
    directionsService.route(
      {
        origin: departure,
        destination: destination,
        waypoints: waypointsFormatted,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Mettre à jour la distance et la durée
          const route = result.routes[0].legs.reduce((acc, leg) => {
            acc.distance += leg.distance.value;
            acc.duration += leg.duration.value;
            return acc;
          }, { distance: 0, duration: 0 });
          
          const distanceKm = Math.round(route.distance / 1000);
          const durationMin = Math.round(route.duration / 60);
          
          setDistance(`${distanceKm} km`);
          setDuration(`${durationMin} min`);
          setDistanceValue(distanceKm);
          setDurationValue(durationMin);
          
          // Centrer la carte sur le trajet
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].legs.forEach(leg => {
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
          });
          if (map) map.fitBounds(bounds);
          
          // Mettre à jour les marqueurs
          const newMarkers = [];
          if (departure) newMarkers.push({ position: result.routes[0].legs[0].start_location, label: "A" });
          if (destination) newMarkers.push({ position: result.routes[0].legs[result.routes[0].legs.length - 1].end_location, label: "B" });
          setMarkers(newMarkers);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  };

  // Charger les véhicules depuis Firestore
  const loadVehicles = async () => {
    setLoadingVehicles(true);
    setVehiclesError('');
    
    try {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const vehiclesData = [];
      
      querySnapshot.forEach((doc) => {
        const vehicle = doc.data();
        // Convertir les valeurs numériques
        vehicle.pricePerKm = parseFloat(vehicle.pricePerKm);
        vehicle.pricePerHour = parseFloat(vehicle.pricePerHour);
        vehicle.basePrice = parseFloat(vehicle.basePrice);
        vehicle.passengers = parseInt(vehicle.passengers);
        vehicle.id = doc.id;
        vehiclesData.push(vehicle);
      });
      
      // Filtrer les véhicules par capacité de passagers
      const filteredVehicles = vehiclesData.filter(
        vehicle => vehicle.passengers >= parseInt(passengers)
      );
      
      if (filteredVehicles.length === 0) {
        setVehiclesError(t('booking.noVehiclesAvailable'));
      } else {
        setVehicles(filteredVehicles);
      }
    } catch (error) {
      console.error("Error loading vehicles: ", error);
      setVehiclesError(t('booking.vehiclesLoadError'));
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Ajouter une étape intermédiaire
  const addWaypoint = () => {
    setWaypoints([...waypoints, '']);
    waypointInputRefs.current.push({current : null});
    waypointAutocompleteRefs.current.push(null);
  };

  // Supprimer une étape
  const removeWaypoint = (index) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };

  // Passer à l'étape suivante
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      
      // Charger les véhicules quand on arrive à l'étape 3 (après date/passagers)
      if (currentStep === 2) {
        loadVehicles();
      }
    } else {
      // Sauvegarder les données et passer à la confirmation
      const reservationData = {
        type: 'simple',
        departure,
        destination,
        date,
        passengers,
        waypoints,
        flightNumber,
        distance,
        duration,
        distanceValue,
        durationValue,
        selectedOptions,
        selectedVehicle,
        totalPrice: calculateTotalPrice(selectedVehicle)
      };
      localStorage.setItem('reservationData', JSON.stringify(reservationData));
      navigate('/confirmation');
    }
  };

  // Calculer le prix total
  const calculateTotalPrice = (vehicle) => {
    if (!vehicle) return 0;
    
    const distancePrice = vehicle.pricePerKm * distanceValue;
    const timePrice = vehicle.pricePerHour * (durationValue / 60); // durationValue est en minutes
    const basePrice = vehicle.basePrice;
    
    return basePrice + distancePrice + timePrice + totalOptionsPrice;
  };

  // Revenir à l'étape précédente
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  // Toggle une option supplémentaire
  const toggleOption = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  return (
    <div className="booking-container">
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLanguageMenuOpen={isLanguageMenuOpen}
        setIsLanguageMenuOpen={setIsLanguageMenuOpen}
      />
      
      <div className="booking-content">
        {/* Barre de progression */}
        <div className="stepper">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 5 ? 'active' : ''}`}></div>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(currentStep - 1) * 25}%` }}
            ></div>
          </div>
        </div>
        
        {/* Étape 1: Itinéraire */}
        {currentStep === 1 && (
          <div className="step-container">
            <h2 className="step-title">{t('booking.step1Title')}</h2>
            <p className="step-subtitle">{t('booking.step1Subtitle')}</p>
            
            <div className="route-form">
              <div className="form-group">
                <label>{t('booking.departure')}</label>
                {isLoaded && (
                  <Autocomplete
                    onLoad={onDepartureLoad}
                    onPlaceChanged={onDeparturePlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder={t('booking.departurePlaceholder')}
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      ref={departureInputRef}
                    />
                  </Autocomplete>
                )}
              </div>
              
              <div className="form-group">
                <label>{t('booking.destination')}</label>
                {isLoaded && (
                  <Autocomplete
                    onLoad={onDestinationLoad}
                    onPlaceChanged={onDestinationPlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder={t('booking.destinationPlaceholder')}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      ref={destinationInputRef}
                    />
                  </Autocomplete>
                )}
              </div>
              
              <div className="waypoints-container">
                <label>{t('booking.waypoints')}</label>
                {waypoints.map((waypoint, index) => (
                  <div key={index} className="waypoint-group">
                    {isLoaded && (
                      <Autocomplete
                        onLoad={(autocomplete) => onWaypointLoad(autocomplete, index)}
                        onPlaceChanged={() => onWaypointPlaceChanged(index)}
                      >
                        <input
                          type="text"
                          placeholder={t('booking.waypointPlaceholder')}
                          value={waypoint}
                          onChange={(e) => {
                            const newWaypoints = [...waypoints];
                            newWaypoints[index] = e.target.value;
                            setWaypoints(newWaypoints);
                          }}
                          ref={(el) => (waypointInputRefs.current[index] = el)}
                        />
                      </Autocomplete>
                    )}
                    <button 
                      className="remove-waypoint"
                      onClick={() => removeWaypoint(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button className="add-waypoint" onClick={addWaypoint}>
                  + {t('booking.addWaypoint')}
                </button>
              </div>
              
              <div className="form-group">
                <label>{t('booking.flightNumber')}</label>
                <input
                  type="text"
                  placeholder={t('booking.flightPlaceholder')}
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                />
              </div>
              
              <div className="form-actions">
                <button className="btn-secondary" onClick={prevStep}>
                  {t('buttons.back')}
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    calculateRoute();
                    nextStep();
                  }}
                  disabled={!departure || !destination}
                >
                  {t('buttons.continue')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Étape 2: Date et passagers */}
        {currentStep === 2 && (
          <div className="step-container">
            <h2 className="step-title">{t('booking.step2Title')}</h2>
            <p className="step-subtitle">{t('booking.step2Subtitle')}</p>
            
            <div className="details-container">
              <div className="route-summary">
                <div className="summary-item">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                  </svg>
                  <div>
                    <h4>{t('booking.departure')}</h4>
                    <p>{departure}</p>
                  </div>
                </div>
                
                {waypoints.length > 0 && waypoints.map((waypoint, index) => (
                  <div key={index} className="summary-item">
                    <div className="waypoint-icon">↷</div>
                    <div>
                      <h4>{t('booking.waypoint')} {index + 1}</h4>
                      <p>{waypoint}</p>
                    </div>
                  </div>
                ))}
                
                <div className="summary-item">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                  </svg>
                  <div>
                    <h4>{t('booking.destination')}</h4>
                    <p>{destination}</p>
                  </div>
                </div>
                
                {flightNumber && (
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24">
                      <path d="M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z"/>
                    </svg>
                    <div>
                      <h4>{t('booking.flightNumber')}</h4>
                      <p>{flightNumber}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="date-passengers-form">
                <div className="form-group">
                  <label>{t('booking.dateTime')}</label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('booking.passengers')}</label>
                  <div className="passenger-selector">
                    <button 
                      onClick={() => setPassengers(Math.max(1, parseInt(passengers) - 1))}
                      disabled={passengers === '1'}
                    >
                      -
                    </button>
                    <span>{passengers}</span>
                    <button onClick={() => setPassengers(parseInt(passengers) + 1)}>
                      +
                    </button>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="btn-secondary" onClick={prevStep}>
                    {t('buttons.back')}
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={nextStep}
                    disabled={!date}
                  >
                    {t('buttons.continue')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Étape 3: Sélection du véhicule */}
        {currentStep === 3 && (
          <div className="step-container">
            <h2 className="step-title">{t('booking.step3Title')}</h2>
            <p className="step-subtitle">{t('booking.step3Subtitle')}</p>
            
            <div className="vehicle-selection">
              <div className="map-container">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={10}
                    onLoad={map => setMap(map)}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false
                    }}
                  >
                    {directions && <DirectionsRenderer directions={directions} />}
                    {markers.map((marker, index) => (
                      <Marker
                        key={index}
                        position={marker.position}
                        label={marker.label}
                      />
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="map-placeholder">
                    <div className="loader"></div>
                    <p>{t('booking.loadingMap')}</p>
                  </div>
                )}
              </div>
              
              <div className="vehicle-list">
                {loadingVehicles ? (
                  <div className="loading-vehicles">
                    <div className="loader"></div>
                    <p>{t('booking.loadingVehicles')}</p>
                  </div>
                ) : vehiclesError ? (
                  <div className="vehicles-error">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <p>{vehiclesError}</p>
                    <button 
                      className="btn-secondary"
                      onClick={prevStep}
                    >
                      {t('buttons.back')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="distance-info">
                      <div className="info-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                        </svg>
                        <span>{distance}</span>
                      </div>
                      <div className="info-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        <span>{duration}</span>
                      </div>
                    </div>
                    
                    <div className="vehicle-cards">
                      {vehicles.map(vehicle => (
                        <div 
                          key={vehicle.id}
                          className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <div className="vehicle-image">
                            {vehicle.imageUrl ? (
                              <img src={vehicle.imageUrl} alt={vehicle.name} />
                            ) : (
                              <div className="placeholder-image">
                                <svg viewBox="0 0 24 24">
                                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/>
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
                                <span>{vehicle.passengers} {t('booking.passengers')}</span>
                              </div>
                              <div className="spec-item">
                                <svg viewBox="0 0 24 24">
                                  <path d="M19 7h-1V6h-2v1h-1c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 12h-4V9h4v10zm-8-7c0-.55-.45-1-1-1s-1 .45-1 1v1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1h-1v-1z"/>
                                </svg>
                                <span>{vehicle.luggage} {t('booking.luggage')}</span>
                              </div>
                            </div>
                            <div className="vehicle-pricing">
                              <div className="price-item">
                                <span>{t('booking.basePrice')}:</span>
                                <span>{vehicle.basePrice}€</span>
                              </div>
                              <div className="price-item">
                                <span>{t('booking.kmPrice')}:</span>
                                <span>{vehicle.pricePerKm}€/km</span>
                              </div>
                              <div className="price-item">
                                <span>{t('booking.hourPrice')}:</span>
                                <span>{vehicle.pricePerHour}€/h</span>
                              </div>
                            </div>
                            <div className="vehicle-total">
                              <span>{t('booking.estimatedTotal')}:</span>
                              <span className="price">{calculateTotalPrice(vehicle).toFixed(2)}€</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="form-actions">
                      <button className="btn-secondary" onClick={prevStep}>
                        {t('buttons.back')}
                      </button>
                      <button 
                        className="btn-primary" 
                        onClick={nextStep}
                        disabled={!selectedVehicle}
                      >
                        {t('buttons.continue')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Étape 4: Options supplémentaires */}
        {currentStep === 4 && (
          <div className="step-container">
            <h2 className="step-title">{t('booking.step4Title')}</h2>
            <p className="step-subtitle">{t('booking.step4Subtitle')}</p>
            
            <div className="options-container">
              <div className="options-grid">
                {additionalOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`option-card ${selectedOptions.includes(option.id) ? 'selected' : ''}`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="option-icon"></div>
                    <div className="option-content">
                      <h4>{option.name}</h4>
                      <p>{option.price > 0 ? `+${option.price}€` : t('booking.free')}</p>
                    </div>
                    <div className="option-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedOptions.includes(option.id)} 
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="options-summary">
                <h3>{t('booking.selectedOptions')}</h3>
                {selectedOptions.length === 0 ? (
                  <p className="no-options">{t('booking.noOptions')}</p>
                ) : (
                  <ul>
                    {selectedOptions.map(optionId => {
                      const option = additionalOptions.find(opt => opt.id === optionId);
                      return (
                        <li key={optionId}>
                          <span>{option.name}</span>
                          <span>{option.price > 0 ? `+${option.price}€` : t('booking.free')}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="options-total">
                  <span>{t('booking.total')}:</span>
                  <span>+{totalOptionsPrice}€</span>
                </div>
                
                <div className="form-actions">
                  <button className="btn-secondary" onClick={prevStep}>
                    {t('buttons.back')}
                  </button>
                  <button className="btn-primary" onClick={nextStep}>
                    {t('buttons.continue')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Étape 5: Récapitulatif */}
        {currentStep === 5 && (
          <div className="step-container">
            <h2 className="step-title">{t('booking.step5Title')}</h2>
            <p className="step-subtitle">{t('booking.step5Subtitle')}</p>
            
            <div className="summary-container">
              <div className="summary-card">
                <div className="summary-section">
                  <h3>{t('booking.itinerary')}</h3>
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                    <div>
                      <h4>{t('booking.departure')}</h4>
                      <p>{departure}</p>
                    </div>
                  </div>
                  
                  {waypoints.length > 0 && waypoints.map((waypoint, index) => (
                    <div key={index} className="summary-item">
                      <div className="waypoint-icon">↷</div>
                      <div>
                        <h4>{t('booking.waypoint')} {index + 1}</h4>
                        <p>{waypoint}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                    <div>
                      <h4>{t('booking.destination')}</h4>
                      <p>{destination}</p>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    <div>
                      <h4>{t('booking.dateTime')}</h4>
                      <p>{new Date(date).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <svg viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                    <div>
                      <h4>{t('booking.passengers')}</h4>
                      <p>{passengers}</p>
                    </div>
                  </div>
                  
                  {flightNumber && (
                    <div className="summary-item">
                      <svg viewBox="0 0 24 24">
                        <path d="M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z"/>
                      </svg>
                      <div>
                        <h4>{t('booking.flightNumber')}</h4>
                        <p>{flightNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedOptions.length > 0 && (
                  <div className="summary-section">
                    <h3>{t('booking.additionalOptions')}</h3>
                    <ul className="options-list">
                      {selectedOptions.map(optionId => {
                        const option = additionalOptions.find(opt => opt.id === optionId);
                        return (
                          <li key={optionId}>
                            <span>{option.name}</span>
                            <span>{option.price > 0 ? `+${option.price}€` : t('booking.free')}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                
                {selectedVehicle && (
                  <div className="summary-section">
                    <h3>{t('booking.selectedVehicle')}</h3>
                    <div className="vehicle-summary">
                      <div className="vehicle-image">
                        {selectedVehicle.imageUrl ? (
                          <img src={selectedVehicle.imageUrl} alt={selectedVehicle.name} />
                        ) : (
                          <div className="placeholder-image">
                            <svg viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="vehicle-details">
                        <h4>{selectedVehicle.name}</h4>
                        <p>{selectedVehicle.passengers} {t('booking.passengers')} • {selectedVehicle.luggage} {t('booking.luggage')}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="summary-section total-section">
                  <div className="total-item">
                    <span>{t('booking.distance')}:</span>
                    <span>{distance}</span>
                  </div>
                  <div className="total-item">
                    <span>{t('booking.duration')}:</span>
                    <span>{duration}</span>
                  </div>
                  {selectedOptions.length > 0 && (
                    <div className="total-item">
                      <span>{t('booking.optionsTotal')}:</span>
                      <span>+{totalOptionsPrice}€</span>
                    </div>
                  )}
                  <div className="total-item main-total">
                    <span>{t('booking.totalPrice')}:</span>
                    <span>{selectedVehicle ? calculateTotalPrice(selectedVehicle).toFixed(2) + '€' : t('booking.notCalculated')}</span>
                  </div>
                </div>
              </div>
              
              <div className="form-actions summary-actions">
                <button className="btn-secondary" onClick={prevStep}>
                  {t('buttons.back')}
                </button>
                <button className="btn-primary" onClick={nextStep}>
                  {t('booking.confirmReservation')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSimple;