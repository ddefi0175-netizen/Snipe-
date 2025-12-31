import React from 'react'

const features = [
  { title: 'Wallet Connect', icon: '🔗' },
  { title: 'Live Prices', icon: '📊' },
  { title: 'News Feed', icon: '📰' },
  { title: 'Portfolio', icon: '💼' }
]

export default function Features() {
  return (
    <section className="container" aria-labelledby="features-heading">
      <h2 id="features-heading">Features</h2>
      <div className="features" role="list">
        {features.map((f) => (
          <article key={f.title} className="feature-card" role="listitem" tabIndex={0}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}