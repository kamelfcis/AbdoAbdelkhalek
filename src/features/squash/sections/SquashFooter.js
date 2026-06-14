import React from 'react';
import { useSquashI18n } from '../hooks/useSquashI18n';

const SquashFooter = React.memo(() => {
  const { t } = useSquashI18n();

  const links = [
    { href: '#home', label: t('nav.home') },
    { href: '#categories', label: t('nav.categories') },
    { href: '#packages', label: t('nav.packages') },
    { href: '#about-me', label: t('nav.about') },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Squash Academy</h3>
            <p className="text-gray-400">{t('footer.tagline')}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.explore')}</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.support')}</h3>
            <a href="#faq" className="text-gray-400 hover:text-white transition block">
              {t('nav.faq')}
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Abdelrahman Abdelkhalek. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
});

SquashFooter.displayName = 'SquashFooter';

export default SquashFooter;
