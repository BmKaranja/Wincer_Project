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
import Checkout from './views/Checkout';
import Admin from './views/Admin';
import { AnimatePresence, motion } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cakes, setCakes] = useState<any[]>([]);

  useEffect(() => {
    import('firebase/firestore').then(({ collection, onSnapshot, getDocs, updateDoc, doc }) => {
      const unsub = onSnapshot(collection(db, 'cakes'), (snap) => {
        setCakes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => console.error("Error fetching cakes:", err));
      
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
      return () => unsub();
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
    setView('checkout');
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
                onAddToCart={addToCart} 
                editingItem={editingItem}
                cakes={cakes}
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
              <Admin user={user} setView={handleNav} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
