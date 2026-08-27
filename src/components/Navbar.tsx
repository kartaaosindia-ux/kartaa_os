'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Upload } from 'lucide-react';
import PDFTakeoffModal from './pdf-takeoff/PDFTakeoffModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/projects', label: 'Projects' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                K
              </div>
              <span>KARTAA OS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => setShowPDFModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                PDF Takeoff
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-800">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setShowPDFModal(true);
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-gray-800"
              >
                <Upload className="w-4 h-4" />
                PDF Takeoff
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* PDF Takeoff Modal */}
      <PDFTakeoffModal 
        isOpen={showPDFModal} 
        onClose={() => setShowPDFModal(false)}
      />
    </>
  );
}
