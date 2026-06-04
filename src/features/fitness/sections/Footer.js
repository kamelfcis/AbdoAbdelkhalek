import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getTranslation } from '../../../utils/translations';

const Footer = React.memo(() => {
  const { currentLanguage } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              {getTranslation('footer-company', currentLanguage)}
            </h3>
            <p className="text-gray-400">
              Professional Performance Coach specializing in athletic development and sports science.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">
              {getTranslation('footer-links-title', currentLanguage)}
            </h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-white transition">Home</a></li>
              <li><a href="#categories" className="text-gray-400 hover:text-white transition">Categories</a></li>
              <li><a href="#packages" className="text-gray-400 hover:text-white transition">Packages</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition">About</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">
              {getTranslation('footer-contact-title', currentLanguage)}
            </h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-light)] transition" aria-label="Facebook">
                <i className="fab fa-facebook-f" aria-hidden="true"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-white flex items-center justify-center hover:bg-[var(--color-primary)] transition" aria-label="Instagram">
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-light)] transition" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            {getTranslation('footer-copyright', currentLanguage)}
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;

