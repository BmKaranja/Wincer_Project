import React, { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
}

export default function Header({ currentView, setView, cartCount }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'catalog', label: 'Collections' },
    { id: 'customizer', label: 'Custom Builder' },
    { id: 'story', label: 'Our Story' },
    { id: 'occasions', label: 'Occasions' },
  ];

  const handleNavClick = (id: string) => {
    setView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-primary-container/80 backdrop-blur-md border-b border-secondary/10 shadow-sm">
      <div className="flex justify-between items-center h-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* 
          ==========================================
          BRANDING SETTINGS
          Change the text below to update your store name
          ========================================== 
        */}
        <button 
          onClick={() => handleNavClick('home')}
          className="text-2xl font-bold tracking-tight text-secondary font-serif italic hover:opacity-80 transition-opacity"
        >
          Wincer Cake House
        </button>
        
        <nav className="hidden md:flex items-center gap-8 font-serif antialiased text-sm tracking-wide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`transition-colors active:scale-95 duration-150 ease-in-out hover:text-secondary ${
                currentView === item.id 
                  ? 'text-on-surface font-bold border-b-2 border-secondary pb-1' 
                  : 'text-on-surface-variant'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-5 text-secondary">
          <button 
            onClick={() => handleNavClick('search')}
            className={`hover:scale-110 transition-transform active:scale-90 ${currentView === 'search' ? 'text-secondary font-bold' : ''}`}
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleNavClick('checkout')}
            className={`relative hover:scale-110 transition-transform active:scale-90 ${currentView === 'checkout' ? 'text-secondary font-bold' : ''}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => handleNavClick('account')}
            className={`hover:scale-110 transition-transform active:scale-90 ${currentView === 'account' ? 'text-secondary font-bold' : ''}`}
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden hover:scale-110 transition-transform active:scale-90 relative z-[60]"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-primary-container border-b border-secondary/10 shadow-lg py-4 px-6 flex flex-col gap-4 z-50"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2 text-lg font-serif transition-colors ${
                  currentView === item.id ? 'text-secondary font-bold' : 'text-on-surface-variant'
                }`}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
