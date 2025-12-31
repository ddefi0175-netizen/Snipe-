import React from 'react'

const features = [
  { icon: '🔗' },
  { icon: '📊' },
  { icon: '📰' },
  { icon: '💼' }
]

export default function Features() {
  return (
    <section className="container" aria-labelledby="features-heading">
      <div className="features" role="list">
        {features.map((f, idx) => (
          <article key={idx} className="feature-card" role="listitem" tabIndex={0}>
            <span className="feature-icon">{f.icon}</span>
          </article>
        ))}
      </div>
    </section>
  )
}