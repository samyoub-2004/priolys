import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../FirebaseConf/firebase';
import Navbar from '../components/Navbar';
import './Reservation.css';

const Reservation = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // Nouvel état pour suivre si l'authentification a été vérifiée

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

  useEffect(() => {
    // Écouteur pour les changements d'état d'authentification
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthChecked(true);
      
      if (!user) {
        setError(t('reservations.notAuthenticated'));
        setLoading(false);
        setReservations([]);
        return;
      }

      const q = query(
        collection(db, 'reservations'),
        where('userId', '==', user.uid)
      );

      const unsubscribeSnapshot = onSnapshot(q, 
        (querySnapshot) => {
          const reservationsData = [];
          querySnapshot.forEach((doc) => {
            reservationsData.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort by date, newest first
          reservationsData.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
          });
          
          setReservations(reservationsData);
          setLoading(false);
          setError('');
        },
        (error) => {
          console.error('Error fetching reservations:', error);
          setError(t('reservations.loadError'));
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribe();
  }, [t]);

  const formatDate = (timestamp) => {
    if (!timestamp) return t('reservations.unknownDate');
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return t('reservations.unknownDate');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      case 'completed':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return t('reservations.status.confirmed');
      case 'pending':
        return t('reservations.status.pending');
      case 'cancelled':
        return t('reservations.status.cancelled');
      case 'completed':
        return t('reservations.status.completed');
      default:
        return t('reservations.status.unknown');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm(t('reservations.cancelConfirm'))) return;
    
    try {
      const reservationRef = doc(db, 'reservations', reservationId);
      await updateDoc(reservationRef, {
        status: 'cancelled'
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setError(t('reservations.cancelError'));
    }
  };

  const openDetailsModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReservation(null);
  };

  // Afficher un loader pendant que l'authentification est vérifiée
  if (!authChecked || loading) {
    return (
      <div className="reservations-container">
        <Navbar 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isLanguageMenuOpen={isLanguageMenuOpen}
          setIsLanguageMenuOpen={setIsLanguageMenuOpen}
        />
        <div className="reservations-content">
          <div className="loading-container">
            <div className="loader"></div>
            <p>{t('reservations.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLanguageMenuOpen={isLanguageMenuOpen}
        setIsLanguageMenuOpen={setIsLanguageMenuOpen}
      />
      
      <div className="reservations-content">
        <div className="reservations-header">
          <h1>{t('reservations.title')}</h1>
          <p>{t('reservations.subtitle')}</p>
        </div>
        
        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        {reservations.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
            <h3>{t('reservations.noReservations')}</h3>
            <p>{t('reservations.noReservationsText')}</p>
          </div>
        ) : (
          <>
            <div className="reservations-table">
              <div className="table-header">
                <div className="table-row">
                  <div className="table-cell">{t('reservations.date')}</div>
                  <div className="table-cell">{t('reservations.departure')}</div>
                  <div className="table-cell">{t('reservations.destination')}</div>
                  <div className="table-cell">{t('reservations.passengers')}</div>
                  <div className="table-cell">{t('reservations.price')}</div>
                  <div className="table-cell">{t('reservations.stat')}</div>
                  <div className="table-cell actions">{t('reservations.actions')}</div>
                </div>
              </div>
              
              <div className="table-body">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="table-row">
                    <div className="table-cell" data-label={t('reservations.date')}>
                      {formatDate(reservation.createdAt)}
                    </div>
                    <div className="table-cell" data-label={t('reservations.departure')}>
                      {reservation.departure}
                    </div>
                    <div className="table-cell" data-label={t('reservations.destination')}>
                      {reservation.destination}
                    </div>
                    <div className="table-cell" data-label={t('reservations.passengers')}>
                      {reservation.passengers}
                    </div>
                    <div className="table-cell" data-label={t('reservations.price')}>
                      {reservation.totalPrice ? `${reservation.totalPrice.toFixed(2)}€` : 'N/A'}
                    </div>
                    <div className="table-cell" data-label={t('reservations.stat')}>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(reservation.status) }}
                      >
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                    <div className="table-cell actions" data-label={t('reservations.actions')}>
                      <div className="dropdown">
                        <button className="dropdown-toggle">
                          <svg viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                        </button>
                        <div className="dropdown-menu">
                          <button 
                            className="dropdown-item"
                            onClick={() => openDetailsModal(reservation)}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            {t('reservations.viewDetails')}
                          </button>
                          
                          {reservation.status === 'pending' && (
                            <button 
                              className="dropdown-item cancel"
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              <svg viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                              {t('reservations.cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mobile cards view */}
            <div className="reservations-cards">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="reservation-card">
                  <div className="card-header">
                    <div className="reservation-date">
                      {formatDate(reservation.createdAt)}
                    </div>
                    <div className="status-badge" style={{ backgroundColor: getStatusColor(reservation.status) }}>
                      {getStatusText(reservation.status)}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="route-info">
                      <div className="location">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                        </svg>
                        <span>{reservation.departure}</span>
                      </div>
                      <div className="arrow">→</div>
                      <div className="location">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                        </svg>
                        <span>{reservation.destination}</span>
                      </div>
                    </div>
                    
                    <div className="reservation-details">
                      <div className="detail-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        <span>{reservation.passengers} {t('booking.passengers')}</span>
                      </div>
                      
                      <div className="detail-item">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        <span>{reservation.totalPrice ? `${reservation.totalPrice.toFixed(2)}€` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => openDetailsModal(reservation)}
                    >
                      {t('reservations.viewDetails')}
                    </button>
                    
                    {reservation.status === 'pending' && (
                      <button 
                        className="btn-danger"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        {t('reservations.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Reservation Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('reservations.detailsTitle')}</h2>
              <button className="modal-close" onClick={closeDetailsModal}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="details-section">
                <h3>{t('booking.itinerary')}</h3>
                
                <div className="detail-item">
                  <div className="detail-label">{t('booking.departure')}</div>
                  <div className="detail-value">{selectedReservation.departure}</div>
                </div>
                
                {selectedReservation.waypoints && selectedReservation.waypoints.length > 0 && (
                  selectedReservation.waypoints.map((waypoint, index) => (
                    <div key={index} className="detail-item">
                      <div className="detail-label">{t('booking.waypoint')} {index + 1}</div>
                      <div className="detail-value">{waypoint}</div>
                    </div>
                  ))
                )}
                
                <div className="detail-item">
                  <div className="detail-label">{t('booking.destination')}</div>
                  <div className="detail-value">{selectedReservation.destination}</div>
                </div>
                
                {selectedReservation.flightNumber && (
                  <div className="detail-item">
                    <div className="detail-label">{t('booking.flightNumber')}</div>
                    <div className="detail-value">{selectedReservation.flightNumber}</div>
                  </div>
                )}
              </div>
              
              <div className="details-section">
                <h3>{t('reservations.tripDetails')}</h3>
                
                <div className="detail-item">
                  <div className="detail-label">{t('booking.dateTime')}</div>
                  <div className="detail-value">{formatDate(selectedReservation.date)}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">{t('booking.passengers')}</div>
                  <div className="detail-value">{selectedReservation.passengers}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">{t('reservations.distance')}</div>
                  <div className="detail-value">{selectedReservation.distance || 'N/A'}</div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">{t('reservations.duration')}</div>
                  <div className="detail-value">{selectedReservation.duration || 'N/A'}</div>
                </div>
              </div>
              
              <div className="details-section">
                <h3>{t('reservations.paymentInfo')}</h3>
                
                <div className="detail-item">
                  <div className="detail-label">{t('reservations.paymentMethod')}</div>
                  <div className="detail-value">
                    {selectedReservation.paymentMethod === 'card' 
                      ? t('payment.creditCard') 
                      : selectedReservation.paymentMethod === 'cash'
                      ? t('payment.cash')
                      : 'N/A'
                    }
                  </div>
                </div>
                
                <div className="detail-item">
                  <div className="detail-label">{t('reservations.paymentStatus')}</div>
                  <div className="detail-value">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedReservation.paymentStatus) }}
                    >
                      {selectedReservation.paymentStatus === 'paid' 
                        ? t('reservations.paymentStatuses.paid')
                        : selectedReservation.paymentStatus === 'pending'
                        ? t('reservations.paymentStatuses.pending')
                        : t('reservations.paymentStatuses.failed')
                      }
                    </span>
                  </div>
                </div>
                
                {selectedReservation.paymentId && (
                  <div className="detail-item">
                    <div className="detail-label">{t('reservations.transactionId')}</div>
                    <div className="detail-value">{selectedReservation.paymentId}</div>
                  </div>
                )}
              </div>
              
              <div className="details-section">
                <h3>{t('reservations.priceBreakdown')}</h3>
                
                <div className="price-breakdown">
                  <div className="price-item">
                    <span>{t('reservations.basePrice')}</span>
                    <span>{selectedReservation.basePrice ? `${selectedReservation.basePrice.toFixed(2)}€` : 'N/A'}</span>
                  </div>
                  
                  <div className="price-item">
                    <span>{t('reservations.distancePrice')}</span>
                    <span>
                      {selectedReservation.distanceValue && selectedReservation.pricePerKm
                        ? `${(selectedReservation.distanceValue * selectedReservation.pricePerKm).toFixed(2)}€`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  <div className="price-item">
                    <span>{t('reservations.timePrice')}</span>
                    <span>
                      {selectedReservation.durationValue && selectedReservation.pricePerHour
                        ? `${(selectedReservation.durationValue / 60 * selectedReservation.pricePerHour).toFixed(2)}€`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  {selectedReservation.selectedOptions && selectedReservation.selectedOptions.length > 0 && (
                    <div className="price-item">
                      <span>{t('reservations.options')}</span>
                      <span>
                        +{selectedReservation.selectedOptions.reduce((total, optionId) => {
                          // This would need to reference the actual options pricing
                          return total + 0; // Placeholder
                        }, 0).toFixed(2)}€
                      </span>
                    </div>
                  )}
                  
                  <div className="price-item total">
                    <span>{t('reservations.total')}</span>
                    <span>{selectedReservation.totalPrice ? `${selectedReservation.totalPrice.toFixed(2)}€` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeDetailsModal}>
                {t('buttons.close')}
              </button>
              
              {selectedReservation.status === 'pending' && (
                <button 
                  className="btn-danger"
                  onClick={() => {
                    handleCancelReservation(selectedReservation.id);
                    closeDetailsModal();
                  }}
                >
                  {t('reservations.cancelReservation')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;