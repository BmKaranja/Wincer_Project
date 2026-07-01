import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, LogIn, LogOut, Settings, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
  user: any;
}

export default function Header({ currentView, setView, cartCount, user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navItems = [
    { id: 'catalog', label: 'Collections' },
    { id: 'story', label: 'Our Story' },
    { id: 'occasions', label: 'Occasions' },
  ];

  const handleNavClick = (id: string) => {
    setView(id);
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setView('home');
      setIsAccountMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-primary-container/80 backdrop-blur-md border-b border-secondary/10 shadow-sm">
      <div className="flex justify-between items-center h-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
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
            onClick={() => handleNavClick('cart')}
            className={`relative hover:scale-110 transition-transform active:scale-90 ${currentView === 'cart' ? 'text-secondary font-bold' : ''}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-on-secondary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className={`flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 ${currentView === 'account' ? 'text-secondary font-bold' : ''}`}
            >
              <User className="w-5 h-5" />
              <span className="hidden md:block text-sm font-medium">
                {user ? user.name || user.email?.split('@')[0] : 'Account'}
              </span>
            </button>
            
            <AnimatePresence>
              {isAccountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-4 w-48 bg-surface rounded-xl shadow-lg border border-secondary/10 overflow-hidden py-2 z-50 flex flex-col"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-secondary/10 mb-2">
                        <p className="text-sm font-bold text-on-surface truncate">{user.name || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => handleNavClick('admin')}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-secondary/10 transition-colors text-left"
                        >
                          <Settings className="w-4 h-4" /> Admin Dashboard
                        </button>
                      )}
                      <button 
                        onClick={() => handleNavClick('account')}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-secondary/10 transition-colors text-left"
                      >
                        <Package className="w-4 h-4" /> Orders
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleNavClick('account')}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-secondary/10 transition-colors text-left"
                    >
                      <LogIn className="w-4 h-4" /> Login / Sign Up
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
