import React from 'react';

export default function BrandMark() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Original Premium Logo */}
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="لوگوی نظر من"
        >
          <circle 
            cx="20" 
            cy="20" 
            r="18" 
            stroke="url(#brandGradient)" 
            strokeWidth="2.5" 
            fill="none"
          />
          
          <path 
            d="M 10 20 Q 20 10 30 20 Q 20 30 10 20 Z" 
            fill="#6366f1" 
            opacity="0.9"
          />
          <path 
            d="M 12 18 Q 20 12 28 18 Q 20 24 12 18 Z" 
            fill="#8b5cf6" 
            opacity="0.85"
          />
          <path 
            d="M 14 16 Q 20 14 26 16 Q 20 22 14 16 Z" 
            fill="#a78bfa" 
            opacity="0.8"
          />
          
          <path 
            d="M 20 16 L 22 20 L 20 24 L 18 20 Z" 
            fill="white" 
            opacity="0.95"
          />
          
          <defs>
            <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1"/>
              <stop offset="50%" stopColor="#8b5cf6"/>
              <stop offset="100%" stopColor="#ec4899"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Site name with turquoise gradient */}
      <h1 className="text-lg sm:text-2xl font-bold whitespace-nowrap">
        <span className="bg-gradient-to-bl from-turquoise-700 to-emerald-500 bg-clip-text text-transparent">
          نظر من
        </span>
      </h1>
    </div>
  );
}