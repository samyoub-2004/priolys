import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useJsApiLoader, GoogleMap, DirectionsRenderer, Marker, Autocomplete } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, auth } from '../FirebaseConf/firebase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/Navbar';
import './BookingSimple.css';

const stripePromise = loadStripe(process.env.REACT_APP_API_STRIPE_KEY);
const libraries = ['places', 'geocoding'];
const googleMapsApiKey = "AIzaSyBLGs7aK3AGCGcRok_d-t5_1KJL1R3sf7o";

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardholderName, setCardholderName] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!stripe || !elements) {
      setError("Stripe n'est pas initialisé");
      setLoading(false);
      return;
    }
    
    if (!cardholderName.trim()) {
      setError("Veuillez entrer le nom du titulaire de la carte");
      setLoading(false);
      return;
    }
    
    try {
      const api = process.env.REACT_APP_API_SERVER
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'eur'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création du PaymentIntent');
      }
      
      const { clientSecret } = await response.json();
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: cardholderName,
          },
        }
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: 'var(--main-text)',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: 'var(--main-light-text)'
        },
        backgroundColor: 'var(--main-input-bg)'
      },
      invalid: {
        color: '#ff5252',
        iconColor: '#ff5252'
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="form-group">
        <label>Nom du titulaire de la carte</label>
        <input
          type="text"
          placeholder="Nom complet comme indiqué sur la carte"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Numéro de carte</label>
          <div className="card-element-container">
            <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Date d'expiration (MM/AA)</label>
          <div className="card-element-container">
            <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
        <div className="form-group">
          <label>CVC</label>
          <div className="card-element-container">
            <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>
      
      {error && <div className="payment-error">{error}</div>}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary stripe-submit"
      >
        {loading ? 'Traitement...' : `Payer ${amount.toFixed(2)}€`}
      </button>
    </form>
  );
};

const BookingSimple = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries
  });
  
  const reservationData = JSON.parse(localStorage.getItem('reservationData') || '{}');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  
  const [departure, setDeparture] = useState(reservationData.departure || '');
  const [destination, setDestination] = useState(reservationData.destination || '');
  const [waypoints, setWaypoints] = useState(reservationData.waypoints || []);
  const [flightNumber, setFlightNumber] = useState(reservationData.flightNumber || '');
  
  const [date, setDate] = useState(reservationData.date || '');
  const [passengers, setPassengers] = useState(reservationData.passengers || '1');
  
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(reservationData.distance || '');
  const [duration, setDuration] = useState(reservationData.duration || '');
  const [distanceValue, setDistanceValue] = useState(reservationData.distanceValue || 0);
  const [durationValue, setDurationValue] = useState(reservationData.durationValue || 0);
  const [center, setCenter] = useState({ lat: 48.8566, lng: 2.3522 });
  const [markers, setMarkers] = useState([]);
  
  const departureInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const waypointInputRefs = useRef([]);
  
  const departureAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);
  const waypointAutocompleteRefs = useRef([]);
  
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehiclesError, setVehiclesError] = useState('');
  
  const additionalOptions = [
    { id: 'airport', name: t('booking.airportVIP'), price: 30 },
    { id: 'baby', name: t('booking.babySeat'), price: 10 },
    { id: 'child', name: t('booking.childSeat'), price: 10 },
    { id: 'booster', name: t('booking.boosterSeat'), price: 10 },
    { id: 'pet', name: t('booking.pets'), price: 20 },
    { id: 'early', name: t('booking.earlyArrival'), price: 0 }
  ];
  
  const [selectedOptions, setSelectedOptions] = useState(reservationData.selectedOptions || []);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentError, setPaymentError] = useState('');
  
  const totalOptionsPrice = selectedOptions.reduce((total, optionId) => {
    const option = additionalOptions.find(opt => opt.id === optionId);
    return total + (option ? option.price : 0);
  }, 0);
  
  const calculateTotalPrice = (vehicle) => {
    if (!vehicle) return 0;
    
    const distancePrice = vehicle.pricePerKm * distanceValue;
    const timePrice = vehicle.pricePerHour * (durationValue / 60);
    const basePrice = vehicle.basePrice;
    
    return basePrice + distancePrice + timePrice + totalOptionsPrice;
  };
  
  const totalPrice = selectedVehicle ? calculateTotalPrice(selectedVehicle) : 0;

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.body.classList.add('route-dark-mode');
    } else {
      document.body.classList.remove('route-dark-mode');
    }
  }, [darkMode]);

  const onDepartureLoad = (autocomplete) => {
    departureAutocompleteRef.current = autocomplete;
  };
  
  const onDestinationLoad = (autocomplete) => {
    destinationAutocompleteRef.current = autocomplete;
  };
  
  const onWaypointLoad = (autocomplete, index) => {
    waypointAutocompleteRefs.current[index] = autocomplete;
  };
  
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
          
          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].legs.forEach(leg => {
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
          });
          if (map) map.fitBounds(bounds);
          
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
  
  const loadVehicles = async () => {
    setLoadingVehicles(true);
    setVehiclesError('');
    
    try {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const vehiclesData = [];
      
      querySnapshot.forEach((doc) => {
        const vehicle = doc.data();
        vehicle.pricePerKm = parseFloat(vehicle.pricePerKm);
        vehicle.pricePerHour = parseFloat(vehicle.pricePerHour);
        vehicle.basePrice = parseFloat(vehicle.basePrice);
        vehicle.passengers = parseInt(vehicle.passengers);
        vehicle.id = doc.id;
        vehiclesData.push(vehicle);
      });
      
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
  
  const addWaypoint = () => {
    setWaypoints([...waypoints, '']);
    waypointInputRefs.current.push({current : null});
    waypointAutocompleteRefs.current.push(null);
  };
  
  const removeWaypoint = (index) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };
  
  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      
      if (currentStep === 2) {
        loadVehicles();
      }
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };
  
  const toggleOption = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };
  
  const saveReservation = async (paymentId = '', paymentStatus = 'pending') => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(t('booking.userNotAuthenticated'));
      }
      
      const reservationData = {
        userId: user.uid,
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
        selectedVehicle: selectedVehicle.id,
        totalPrice,
        paymentMethod,
        paymentId,
        paymentStatus,
        createdAt: serverTimestamp(),
        status: 'pending'
      };
      
      const docRef = await addDoc(collection(db, 'reservations'), reservationData);
      return docRef.id;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement: ", error);
      throw new Error(t('booking.saveError'));
    }
  };
  
  const handlePaymentSuccess = async (paymentId) => {
    try {
      setGlobalLoading(true);
      await saveReservation(paymentId, 'paid');
      setShowSuccessPopup(true);
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setGlobalLoading(false);
    }
  };
  
  const confirmCashPayment = async () => {
    try {
      setGlobalLoading(true);
      await saveReservation();
      setShowSuccessPopup(true);
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setGlobalLoading(false);
    }
  };
  
  const handleViewReservations = () => {
    localStorage.removeItem('reservationData');
    navigate('/reservations');
  };

  useEffect(() => {
    if (currentStep > 1) {
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
        totalPrice
      };
      localStorage.setItem('reservationData', JSON.stringify(reservationData));
    }
  }, [currentStep, departure, destination, date, passengers, waypoints, flightNumber, distance, duration, selectedOptions, selectedVehicle]);

  return (
    <div className="booking-container">
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLanguageMenuOpen={isLanguageMenuOpen}
        setIsLanguageMenuOpen={setIsLanguageMenuOpen}
      />
      
      {globalLoading && (
        <div className="global-loader-overlay">
          <div className="global-loader">
            <div className="loader-spinner"></div>
            <p>{t('payment.processing')}</p>
          </div>
        </div>
      )}
      
      <div className="booking-content">
        <div className="stepper">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 5 ? 'active' : ''}`}></div>
          <div className={`step ${currentStep >= 6 ? 'active' : ''}`}></div>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(currentStep - 1) * 20}%` }}
            ></div>
          </div>
        </div>
        
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
        
        {currentStep === 3 && (
          <div className="step-container">
            <h2 className="step-title">{t('booking.step3Title')}</h2>
            <p className="step-subtitle">{t('booking.step3Subtitle')}</p>
            
            <div className="vehicle-selection">
              <div className="map-container">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{ 
                      width: '100%', 
                      height: window.innerWidth < 768 ? '40vh' : '50vh'
                    }}
                    center={center}
                    zoom={10}
                    onLoad={map => setMap(map)}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      styles: darkMode ? darkMapStyle : [],
                    }}
                    key={darkMode ? 'dark' : 'light'}
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
                    <span>{totalPrice.toFixed(2)}€</span>
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
        
        {currentStep === 6 && (
          <div className="step-container">
            <h2 className="step-title">{t('payment.title')}</h2>
            <p className="step-subtitle">{t('payment.subtitle')}</p>
            
            <div className="payment-container">
              <div className="payment-methods">
                <div 
                  className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="payment-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <h3>{t('payment.creditCard')}</h3>
                  <p>{t('payment.securePayment')}</p>
                </div>
                
                <div 
                  className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="payment-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm3 8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>
                    </svg>
                  </div>
                  <h3>{t('payment.cash')}</h3>
                  <p>{t('payment.payDriver')}</p>
                </div>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="card-payment-form">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm 
                      amount={totalPrice}
                      onSuccess={handlePaymentSuccess}
                      onError={(error) => setPaymentError(error)}
                    />
                  </Elements>
                </div>
              )}
              
              {paymentMethod === 'cash' && (
                <div className="cash-payment-confirm">
                  <div className="cash-summary">
                    <p>{t('payment.cashMessage')}</p>
                    <div className="total-amount">
                      <span>{t('payment.totalAmount')}:</span>
                      <span>{totalPrice.toFixed(2)}€</span>
                    </div>
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={confirmCashPayment}
                  >
                    {t('payment.confirmCash')}
                  </button>
                </div>
              )}
              
              {paymentError && (
                <div className="payment-error-message">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p>{paymentError}</p>
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  className="btn-secondary" 
                  onClick={prevStep}
                >
                  {t('buttons.back')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2>{t('payment.successTitle')}</h2>
            <p>{t('payment.successMessage')}</p>
            <button 
              className="btn-primary"
              onClick={handleViewReservations}
            >
              {t('payment.viewReservations')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSimple;