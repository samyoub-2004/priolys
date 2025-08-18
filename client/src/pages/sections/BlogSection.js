import React from 'react';

const BlogSection = ({ blogPosts, t }) => {
  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <div className="section-header animate-on-scroll">
          <h2>Latest News</h2>
          <p>Stay updated with our blog</p>
        </div>
        
        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <div 
              key={index} 
              className="blog-card animate-on-scroll"
            >
              <div className="blog-image"></div>
              <div className="blog-content">
                <span className="blog-date">{post.date}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <a href="#" className="read-more">
                  {t('buttons.readMore')}
                  <svg className="arrow-icon" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;