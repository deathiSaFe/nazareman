"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'پروفایل', href: '/profile', icon: '👤' },
  { label: 'موضوعات من', href: '/my-topics', icon: '📝' },
  { label: 'درباره ما', href: '/about', icon: 'ℹ️' },
  { label: 'تماس', href: '/contact', icon: '📧' },
  { label: 'تنظیمات', href: '/settings', icon: '⚙️' },
  { label: 'حریم خصوصی', href: '/privacy', icon: '🔒' },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[9998]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer - solid white background, highest z-index */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-[9999] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="منوی اصلی"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">منو</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="بستن منو"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2 h-full flex flex-col justify-center">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                >
                  <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}