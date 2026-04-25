import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './views/Home';
import Catalog from './views/Catalog';
import Customizer from './views/Customizer';
import Occasions from './views/Occasions';
import Search from './views/Search';
import Account from './views/Account';
import Story from './views/Story';
import Checkout from './views/Checkout';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);

  const handleNav = (newView: string) => {
    if (newView === 'customizer' && view !== 'customizer') {
      setSelectedProduct(null);
      setEditingItem(null);
    }
    setView(newView);
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setEditingItem(null);
    setView('customizer');
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setSelectedProduct(null);
    setView('customizer');
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const addToCart = (item: any) => {
    if (editingItem) {
      setCart(prev => prev.map(i => i.id === editingItem.id ? { ...item, id: editingItem.id } : i));
      setEditingItem(null);
    } else {
      setCart(prev => [...prev, item]);
    }
    setView('checkout');
  };

  const clearCart = () => setCart([]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-secondary/20 selection:text-secondary">
      <Header currentView={view} setView={handleNav} cartCount={cart.length} />
      
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Home setView={handleNav} />
            </motion.div>
          )}
          {view === 'catalog' && (
            <motion.div 
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Catalog setView={handleNav} onSelect={handleSelectProduct} />
            </motion.div>
          )}
          {view === 'customizer' && (
            <motion.div 
              key="customizer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Customizer 
                setView={handleNav} 
                selectedProduct={selectedProduct} 
                onAddToCart={addToCart} 
                editingItem={editingItem}
              />
            </motion.div>
          )}
          {view === 'occasions' && (
            <motion.div 
              key="occasions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Occasions setView={handleNav} />
            </motion.div>
          )}
          {view === 'story' && (
            <motion.div 
              key="story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Story setView={handleNav} />
            </motion.div>
          )}
          {view === 'checkout' && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Checkout 
                setView={handleNav} 
                cart={cart} 
                onOrderPlaced={clearCart} 
                onEdit={handleEditItem}
                onRemove={removeFromCart}
              />
            </motion.div>
          )}
          {view === 'search' && (
            <motion.div 
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Search setView={handleNav} onSelect={handleSelectProduct} />
            </motion.div>
          )}
          {view === 'account' && (
            <motion.div 
              key="account"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Account />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
