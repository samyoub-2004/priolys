import React from 'react';

const ReviewsSection = ({ reviews }) => {
  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <h2>Customer Reviews</h2>
          <p>What our clients say about us</p>
        </div>
        
        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className="review-card animate-on-scroll"
            >
              <div className="review-header">
                <div className="review-avatar"></div>
                <div>
                  <h3>{review.name}</h3>
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
              </div>
              <p className="review-comment">"{review.comment}"</p>
              <div className="review-date">{review.date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;