import React from 'react';

const NavigationButton = () => {
  const handleNavigation = () => {
    window.location.href = '/manual';
  };

  return (
    <div className="flex justify-center items-center p-4">
      <button
        onClick={handleNavigation}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
      >
        マニュアルを見る
      </button>
    </div>
  );
};

export default NavigationButton;