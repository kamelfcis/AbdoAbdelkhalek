import React from 'react';

const FloatingInstagramButton = React.memo(() => {
  return (
    <a
      href="https://www.instagram.com/abdelrhman_abdelkhalek"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 w-14 h-14 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-full shadow-lg z-50 hover:scale-110 transition-transform duration-300 hover:shadow-xl"
      aria-label="Visit our Instagram page"
    >
      <i className="fab fa-instagram text-2xl"></i>
    </a>
  );
});

FloatingInstagramButton.displayName = 'FloatingInstagramButton';

export default FloatingInstagramButton;

