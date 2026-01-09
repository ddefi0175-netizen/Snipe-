import React, { useState, useEffect } from 'react'

export default function NewsModal({ news, onClose }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading content
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [news])

  if (!news) return null

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="news-modal-overlay" onClick={onClose}>
      <div className="news-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="news-modal-header">
          <button className="news-modal-close" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="news-modal-content">
          {loading ? (
            <div className="news-modal-loading">
              <div className="spinner"></div>
              <p>Loading article...</p>
            </div>
          ) : (
            <>
              {/* Featured Image */}
              {news.imageurl && (
                <div className="news-modal-image">
                  <img src={news.imageurl} alt={news.title} />
                </div>
              )}

              {/* Article Info */}
              <div className="news-modal-meta">
                <span className="news-modal-source">{news.source || news.source_info?.name || 'News'}</span>
                <span className="news-modal-date">{formatDate(news.published_on) || news.time}</span>
              </div>

              {/* Title */}
              <h1 className="news-modal-title">{news.title}</h1>

              {/* Body */}
              <div className="news-modal-body">
                {news.body ? (
                  <p>{news.body}</p>
                ) : (
                  <div className="news-modal-summary">
                    <p>{news.summary || news.description || 'Click the link below to read the full article.'}</p>
                    
                    {/* Categories/Tags */}
                    {news.categories && (
                      <div className="news-modal-tags">
                        {news.categories.split('|').map((cat, idx) => (
                          <span key={idx} className="news-tag">{cat}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Read Full Article Link */}
              <div className="news-modal-actions">
                <a 
                  href={news.url || news.guid} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="news-modal-link"
                >
                  Read Full Article on {news.source || 'Source'} →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
