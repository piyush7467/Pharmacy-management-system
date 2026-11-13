import React from 'react';
import logoImg from '../../assets/logo.png';

/**
 * PharmaFlowLogoIcon
 * Displays the official PharmaFlow circular brand emblem logo.
 */
export function PharmaFlowLogoIcon({
  className = 'w-18 h-18 sm:w-20 sm:h-20',
  imgClassName = 'w-full h-full object-cover rounded-full shadow-sm'
}) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      aria-label="PharmaFlow Logo"
    >
      <img src={logoImg} alt="PharmaFlow Logo" className={imgClassName} />
    </div>
  );
}
