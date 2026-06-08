import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './views/Home';
import Catalog from './views/Catalog';
import Customizer from './views/Customizer';
import Occasions from './views/Occasions';
import Search from './views/Search';
import Account from './views/Account';
import Story from './views/Story';
import Blog from './views/Blog';
import Checkout from './views/Checkout';
import Admin from './views/Admin';
import Cart from './views/Cart';
import PrivacyPolicy from './views/PrivacyPolicy';
import { AnimatePresence, motion } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const local = localStorage.getItem('wincer_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [savedItems, setSavedItems] = useState<any[]>(() => {
    try {
      const local = localStorage.getItem('wincer_saved');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wincer_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wincer_saved', JSON.stringify(savedItems));
  }, [savedItems]);

  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cakes, setCakes] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    import('firebase/firestore').then(({ collection, onSnapshot, getDocs, updateDoc, doc }) => {
      const unsubCakes = onSnapshot(collection(db, 'cakes'), (snap) => {
        setCakes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => console.error("Error fetching cakes:", err));

      const unsubPosts = onSnapshot(collection(db, 'blog_posts'), (snap) => {
        setBlogPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        }));
      }, (err) => console.error("Error fetching posts:", err));
      
      // Auto-migrate any existing $ prices to Kshs.
      if (user && user.role === 'admin') {
        getDocs(collection(db, 'cakes')).then(snap => {
          snap.docs.forEach(d => {
            const data = d.data();
            if (data.price && typeof data.price === 'string' && data.price.includes('$')) {
              // Extract number and convert
              const numMatch = data.price.match(/\d+/);
              if (numMatch) {
                const convertedValue = parseInt(numMatch[0]) * 130;
                const newPrice = `Kshs. ${convertedValue}`;
                updateDoc(doc(db, 'cakes', d.id), { price: newPrice }).catch(console.error);
              }
            }
          });
        });
      }
      return () => { unsubCakes(); unsubPosts(); };
    });
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // user is signed in, get their role from firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            let userData = userDoc.data();
            if ((currentUser.email?.toLowerCase() === 'bmkaranja001@gmail.com' || currentUser.email?.toLowerCase() === 'medillin254@gmail.com') && userData.role !== 'admin') {
              userData.role = 'admin';
              await setDoc(userDocRef, { role: 'admin' }, { merge: true });
            }
            setUser({ ...userData, uid: currentUser.uid });
          } else {
            // New user, create them (with 'user' role by default unless bmkaranja001@gmail.com)
            const role = (currentUser.email?.toLowerCase() === 'bmkaranja001@gmail.com' || currentUser.email?.toLowerCase() === 'medillin254@gmail.com') ? 'admin' : 'user';
            const newUser = {
              email: currentUser.email || '',
              name: currentUser.displayName || 'New User',
              role,
              joinedAt: serverTimestamp(),
              ordersCount: 0
            };
            await setDoc(userDocRef, newUser);
            setUser({ ...newUser, uid: currentUser.uid });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUser({ email: currentUser.email, role: 'user', uid: currentUser.uid }); // Fallback
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

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
  };

  const saveItem = (item: any) => {
    setSavedItems(prev => {
      const exists = prev.some(existing => 
        existing.name === item.name &&
        JSON.stringify(existing.config) === JSON.stringify(item.config)
      );
      if (exists) return prev;
      return [...prev, { ...item, id: Date.now() }];
    });
  };

  const addSavedToCart = (item: any) => {
    setCart(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const clearCart = () => setCart([]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-secondary font-serif text-xl animate-pulse">Summoning...</p>
      </div>
    );
  }

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
              <Home setView={handleNav} posts={blogPosts} />
            </motion.div>
          )}
          {view === 'catalog' && (
            <motion.div 
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Catalog setView={handleNav} onSelect={handleSelectProduct} cakes={cakes} />
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
                onAddToCart={(item) => {
                  addToCart(item);
                  setView('cart');
                }}
                onBuyNow={(item) => {
                  addToCart(item);
                  setView('checkout');
                }}
                onSave={saveItem}
                savedItems={savedItems}
                editingItem={editingItem}
                cakes={cakes}
              />
            </motion.div>
          )}
          {view === 'cart' && (
            <motion.div 
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Cart 
                setView={handleNav} 
                cart={cart}
                onAddToCart={(item) => setCart(prev => [...prev, item])}
                onRemove={removeFromCart} 
                onEdit={handleEditItem}
                savedItems={savedItems}
                onRemoveSaved={(id) => setSavedItems(prev => prev.filter(i => i.id !== id))}
                onAddSavedToCart={addSavedToCart}
                onClearCart={clearCart}
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
          {view === 'blog' && (
            <motion.div 
              key="blog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Blog onSelectProduct={handleSelectProduct} cakes={cakes} posts={blogPosts} />
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
                user={user}
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
              <Search setView={handleNav} onSelect={handleSelectProduct} cakes={cakes} />
            </motion.div>
          )}
          {view === 'account' && (
            <motion.div 
              key="account"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Account user={user} setUser={setUser} setView={handleNav} />
            </motion.div>
          )}
          {view === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Admin user={user} setView={handleNav} blogPosts={blogPosts} />
            </motion.div>
          )}
          {view === 'privacy' && (
            <motion.div 
              key="privacy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PrivacyPolicy />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254722632717?text=Hi%20Wincer%20Cake%20House!%20I'd%20love%20to%20inquire%20about%20your%20delicious%20cakes."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[99] flex items-center gap-2 group cursor-pointer"
        aria-label="Chat on WhatsApp"
        id="whatsapp-floating-button"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out bg-white text-secondary text-xs font-bold uppercase tracking-widest px-0 py-2 rounded-full border border-secondary/10 group-hover:px-4 shadow-md whitespace-nowrap">
          Need Help? Chat with Us
        </span>
        <div className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-300 relative">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </div>
      </a>

      <Footer setView={handleNav} />
    </div>
  );
}
