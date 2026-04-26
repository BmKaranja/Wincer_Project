import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
}

export default function Header({ currentView, setView, cartCount }: HeaderProps) {
  const navItems = [
    { id: 'catalog', label: 'Collections' },
    { id: 'customizer', label: 'Custom Builder' },
    { id: 'story', label: 'Our Story' },
    { id: 'occasions', label: 'Occasions' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-primary-container/80 backdrop-blur-md border-b border-secondary/10 shadow-sm">
      <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto w-full">
        {/* 
          ==========================================
          BRANDING SETTINGS
          Change the text below to update your store name
          ========================================== 
        */}
        <button 
          onClick={() => setView('home')}
          className="text-2xl font-bold tracking-tight text-secondary font-serif italic hover:opacity-80 transition-opacity"
        >
          Luxe Confections
        </button>
        
        <nav className="hidden md:flex items-center gap-8 font-serif antialiased text-sm tracking-wide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
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

        <div className="flex items-center gap-5 text-secondary">
          <button 
            onClick={() => setView('search')}
            className={`hover:scale-110 transition-transform active:scale-90 ${currentView === 'search' ? 'text-secondary font-bold' : ''}`}
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('checkout')}
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
            onClick={() => setView('account')}
            className={`hover:scale-110 transition-transform active:scale-90 ${currentView === 'account' ? 'text-secondary font-bold' : ''}`}
          >
            <User className="w-5 h-5" />
          </button>
          <button className="md:hidden hover:scale-110 transition-transform active:scale-90">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
