import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { squashPortalImage } from '../features/squash/assets/unsplashImages';
import { fitnessPortalImage } from '../features/fitness/assets/unsplashImages';
import './domain-portal.css';

const cards = [
  {
    id: 'squash',
    to: '/squash',
    variant: 'squash',
    badge: 'Coaching',
    title: 'Online Squash',
    description: 'Elite coaching, programs, and court-ready training.',
    image: squashPortalImage,
    cta: 'Enter Squash',
  },
  {
    id: 'fitness',
    to: '/fitness',
    variant: 'fitness',
    badge: 'Coaching',
    title: 'Online Football',
    description: 'Football performance coaching, nutrition, and structured training programs.',
    image: fitnessPortalImage,
    cta: 'Enter Football',
  },
];

function PortalCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={card.to}
        className={`domain-portal-card domain-portal-card--${card.variant}`}
        aria-label={`${card.title} — ${card.cta}`}
      >
        <div
          className="domain-portal-card__bg"
          style={{ backgroundImage: `url(${card.image})` }}
          role="img"
          aria-label=""
        />
        <div className="domain-portal-card__overlay" aria-hidden="true" />
        <div className="domain-portal-card__content">
          <span className="domain-portal-card__badge">{card.badge}</span>
          <h2 className="domain-portal-card__name">{card.title}</h2>
          <p className="domain-portal-card__desc">{card.description}</p>
          <span className="domain-portal-card__cta">
            {card.cta}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DomainPortalPage() {
  return (
    <main className="domain-portal" role="main">
      <div className="domain-portal__inner">
        <motion.header
          className="domain-portal__header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="domain-portal__title">Abdelrahman Abdelkhalek</h1>
          <p className="domain-portal__subtitle">Choose your experience — squash excellence or Football performance coaching.</p>
        </motion.header>

        <div className="domain-portal__grid">
          {cards.map((card, i) => (
            <PortalCard key={card.id} card={card} index={i} />
          ))}
        </div>

        <p className="domain-portal__footer">Coach login available from each site.</p>
      </div>
    </main>
  );
}
