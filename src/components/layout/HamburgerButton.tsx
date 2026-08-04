"use client";

import React from 'react';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
      aria-expanded={isOpen}
    >
      <div className="relative w-6 h-5 flex flex-col justify-between">
        <span
          className={`block h-0.5 w-full bg-gray-900 dark:bg-white transition-all duration-300 origin-center ${
            isOpen ? 'rotate-45 translate-y-[9px]' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-full bg-gray-900 dark:bg-white transition-all duration-300 ${
            isOpen ? 'opacity-0 scale-0' : 'opacity-100'
          }`}
        />
        <span
          className={`block h-0.5 w-full bg-gray-900 dark:bg-white transition-all duration-300 origin-center ${
            isOpen ? '-rotate-45 -translate-y-[9px]' : ''
          }`}
        />
      </div>
    </button>
  );
}