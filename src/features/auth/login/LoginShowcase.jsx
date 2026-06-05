import React from 'react';
import { motion } from 'framer-motion';
import { fitnessPortalImage } from '../../fitness/assets/unsplashImages';
import { squashPortalImage } from '../../squash/assets/unsplashImages';
import { LOGIN_STATS, LOGIN_FEATURES } from './loginStats';
import {
  fadeUpVariants,
  statFloatVariants,
  useLoginMotion,
} from './login.motion';

export default function LoginShowcase({ domain, t }) {
  const motionOpts = useLoginMotion();

  const heroImage = domain === 'squash' ? squashPortalImage : fitnessPortalImage;
  const headlineKey =
    domain === 'squash'
      ? 'showcase.brand.headline.squash'
      : domain === 'fitness'
        ? 'showcase.brand.headline.fitness'
        : 'showcase.brand.headline';
  const taglineKey =
    domain === 'squash'
      ? 'showcase.brand.tagline.squash'
      : domain === 'fitness'
        ? 'showcase.brand.tagline.fitness'
        : 'showcase.brand.tagline';

  return (
    <section className="login-showcase" aria-label={t('a11y.showcase-label')}>
      <div
        className="login-showcase__hero"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label=""
      />
      <div className="login-showcase__overlay" aria-hidden="true" />

      <motion.div
        className="login-showcase__content"
        variants={fadeUpVariants}
        initial={motionOpts.initial}
        animate={motionOpts.animate}
      >
        <motion.h2 className="login-showcase__headline" variants={fadeUpVariants}>
          {t(headlineKey)}
        </motion.h2>
        <motion.p className="login-showcase__tagline" variants={fadeUpVariants}>
          {t(taglineKey)}
        </motion.p>

        <motion.div className="login-showcase__stats" variants={fadeUpVariants}>
          {LOGIN_STATS.map((stat, idx) => (
            <motion.div
              key={stat.id}
              className="login-stat-card"
              variants={statFloatVariants}
              initial="initial"
              animate={motionOpts.statAnimate}
              whileHover={motionOpts.whileHover}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="login-stat-card__value" aria-label={t(stat.a11yKey)}>
                {t(stat.displayKey)}
              </div>
              <div className="login-stat-card__label">{t(stat.labelKey)}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="login-showcase__features" variants={fadeUpVariants}>
          {LOGIN_FEATURES.map((feature) => (
            <span key={feature.id} className="login-feature-chip">
              <i className="fas fa-check" aria-hidden="true" />
              {t(feature.labelKey)}
            </span>
          ))}
        </motion.div>

        <motion.blockquote
          className="login-testimonial"
          variants={fadeUpVariants}
          whileHover={motionOpts.whileHover}
        >
          <p className="login-testimonial__quote">
            &ldquo;{t('showcase.testimonial.quote')}&rdquo;
          </p>
          <footer className="login-testimonial__author">
            — {t('showcase.testimonial.author')}, {t('showcase.testimonial.role')}
          </footer>
        </motion.blockquote>
      </motion.div>
    </section>
  );
}
