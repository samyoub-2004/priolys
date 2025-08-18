import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './FirebaseConf/firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './sections/HeroSection';
import ServicesSection from './sections/ServicesSection';
import FleetSection from './sections/fleet/FleetSection';
import PartnersSection from './sections/PartnersSection';
import BlogSection from './sections/BlogSection';
import ReviewsSection from './sections/ReviewsSection';
import Chatbot from './components/ChatBot';
import './LandingPage.css';

const libraries = ['places', 'geocoding'];
const googleMapsApiKey = "AIzaSyBLGs7aK3AGCGcRok_d-t5_1KJL1R3sf7o";

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries
  });

  // États initiaux
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: t('chatbot.initialMessage'), sender: 'bot' }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [reservationType, setReservationType] = useState('simple');
  
  // États pour les adresses
  const [departureAddress, setDepartureAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  
  // États pour le focus
  const [focusedInput, setFocusedInput] = useState(null);
  
  // États pour les autres champs
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [hourlyDate, setHourlyDate] = useState('');
  const [duration, setDuration] = useState('1');
  const [hourlyPassengers, setHourlyPassengers] = useState('1');
  
  // États d'authentification
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Références pour les inputs
  const departureInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const locationInputRef = useRef(null);
  
  // Données de la page
  const services = t('services', { returnObjects: true });
  const blogPosts = t('blogPosts', { returnObjects: true });
  const reviews = t('reviews', { returnObjects: true });

  // Observer l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

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

  // Obtenir la position actuelle
  const getCurrentLocation = async (type) => {
    if (!navigator.geolocation) {
      handleLocationUpdate(type, "La géolocalisation n'est pas prise en charge par votre navigateur");
      return;
    }

    handleLocationUpdate(type, "Localisation...");

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      const { latitude, longitude } = position.coords;
      const coords = `${latitude},${longitude}`;
      const address = await convertCoordsToAddress(latitude, longitude);
      handleLocationUpdate(type, address);
    } catch (error) {
      handleLocationError(type, error);
    }
  };

  // Convertir les coordonnées en adresse
  const convertCoordsToAddress = async (lat, lng) => {
    const apiKey = "AIzaSyBq7PRtUiWEVvZWnypqiVujh_avNBiIavw";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        return data.results[0]?.formatted_address || "Adresse introuvable";
      } else {
        return "Erreur lors de la conversion des coordonnées";
      }
    } catch (error) {
      console.error("Erreur de conversion:", error);
      return "Erreur de connexion au service";
    }
  };

  // Mettre à jour l'adresse selon le type
  const handleLocationUpdate = (type, value) => {
    switch (type) {
      case 'departure': 
        setDepartureAddress(value);
        break;
      case 'destination': 
        setDestinationAddress(value);
        break;
      case 'location': 
        setLocationAddress(value);
        break;
    }
  };

  // Gestion des erreurs de géolocalisation
  const handleLocationError = (type, error) => {
    let errorMessage = "Erreur lors de la localisation";
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Veuillez autoriser la localisation...";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Impossible d'obtenir votre position";
        break;
      case error.TIMEOUT:
        errorMessage = "La demande de localisation a expiré";
        break;
    }

    handleLocationUpdate(type, errorMessage);
  };

  // Gérer la recherche de réservation
  const handleSearch = () => {
    if (loadingAuth) return;
    
    if (!user) {
      // Stocker les données temporaires avant redirection
      const tempReservation = reservationType === 'simple' 
        ? { 
            type: 'simple',
            departure: departureAddress,
            destination: destinationAddress,
            date,
            passengers
          }
        : {
            type: 'hourly',
            location: locationAddress,
            date: hourlyDate,
            duration,
            passengers: hourlyPassengers
          };
      
      localStorage.setItem('tempReservation', JSON.stringify(tempReservation));
      navigate('/login');
      return;
    }

    // Sauvegarder les données de réservation
    if (reservationType === 'simple') {
      const reservationData = {
        type: 'simple',
        departure: departureAddress,
        destination: destinationAddress,
        date,
        passengers
      };
      localStorage.setItem('reservationData', JSON.stringify(reservationData));
      navigate('/booking-simple');
    } else {
      const reservationData = {
        type: 'hourly',
        location: locationAddress,
        date: hourlyDate,
        duration,
        passengers: hourlyPassengers
      };
      localStorage.setItem('reservationData', JSON.stringify(reservationData));
      navigate('/booking-hourly');
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
        user={user}
        loadingAuth={loadingAuth}
      />

      <HeroSection 
        t={t}
        isLoaded={isLoaded}
        reservationType={reservationType}
        setReservationType={setReservationType}
        focusedInput={focusedInput}
        setFocusedInput={setFocusedInput}
        departureAddress={departureAddress}
        setDepartureAddress={setDepartureAddress}
        destinationAddress={destinationAddress}
        setDestinationAddress={setDestinationAddress}
        locationAddress={locationAddress}
        setLocationAddress={setLocationAddress}
        date={date}
        setDate={setDate}
        passengers={passengers}
        setPassengers={setPassengers}
        hourlyDate={hourlyDate}
        setHourlyDate={setHourlyDate}
        duration={duration}
        setDuration={setDuration}
        hourlyPassengers={hourlyPassengers}
        setHourlyPassengers={setHourlyPassengers}
        departureInputRef={departureInputRef}
        destinationInputRef={destinationInputRef}
        locationInputRef={locationInputRef}
        getCurrentLocation={getCurrentLocation}
        handleSearch={handleSearch}
        loadingAuth={loadingAuth}
      />

      <ServicesSection services={services} />

      <FleetSection />

      <PartnersSection t={t} />

      <BlogSection blogPosts={blogPosts} t={t} />

      <ReviewsSection reviews={reviews} />

      <Footer />

      <Chatbot 
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        messages={messages}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        t={t}
      />
    </div>
  );
};

export default LandingPage;