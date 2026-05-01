import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Gem, Package, RotateCcw, LogOut, Trash2, X } from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';

export default function Account({ user, setUser, setView }: { user: any, setUser: any, setView: any }) {
  const [mode, setMode] = useState<'welcome' | 'signin' | 'register'>('welcome');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setErrorMsg('');
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders(orders.filter(o => o.id !== orderId));
      setDeletingOrder(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to delete order: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    try {
      await signInWithPopup(auth, googleProvider);
      // navigation / logic handles via onAuthStateChanged in App.tsx
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Login popup blocked. Please open this app in a new tab or allow popups.');
      } else if (err.code === 'auth/user-cancelled' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Login cancelled.');
      } else {
        setErrorMsg('Authentication failed. Please try again.');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (user && user.role === 'admin') {
    return (
      <motion.main className="pt-32 pb-24 max-w-7xl mx-auto px-8 min-h-[80vh] flex items-center justify-center">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-2xl font-serif text-secondary mb-4">Admin Session Active</h2>
          <button 
            onClick={() => setView('admin')}
            className="bg-secondary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            Go to Admin Dashboard
          </button>
          <button 
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </motion.main>
    );
  }

  if (user) {
    return (
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-24 max-w-7xl mx-auto px-8 min-h-[80vh]"
      >
        <div className="flex justify-between items-end mb-12 border-b border-secondary/10 pb-6">
          <div>
            <h1 className="text-4xl font-serif text-secondary mb-2">My Account</h1>
            <p className="text-on-surface-variant font-medium opacity-70">Welcome back, {user.email}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary hover:opacity-70 transition-opacity"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-secondary flex items-center gap-3">
                  <Package className="w-5 h-5" /> Recent Orders
                </h2>
              </div>
              
              {loadingOrders ? (
                <div className="text-center py-12 flex flex-col items-center border-2 border-dashed border-secondary/10 rounded-2xl">
                  <p className="text-on-surface-variant opacity-70">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border border-secondary/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-secondary">Order #{order.id.slice(-6)}</span>
                          <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-secondary/5 rounded-full text-secondary">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium">
                          {order.amount} • {order.paymentMethod}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => setDeletingOrder(order.id)}
                          className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full sm:w-auto justify-center"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 flex flex-col items-center border-2 border-dashed border-secondary/10 rounded-2xl">
                  <Package className="w-12 h-12 text-secondary/20 mb-4" />
                  <p className="text-on-surface-variant opacity-70 mb-2">No active orders found.</p>
                  <button 
                    onClick={() => setView('catalog')}
                    className="text-secondary font-bold text-sm hover:underline"
                  >
                    Start an order
                  </button>
                </div>
              )}
            </section>

            <section className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm">
              <h2 className="text-xl font-serif text-secondary flex items-center gap-3 mb-6">
                <RotateCcw className="w-5 h-5" /> Purchase History
              </h2>
              <div className="space-y-4">
                <p className="text-on-surface-variant text-sm opacity-70">You have no past purchases.</p>
                <button 
                  onClick={() => alert('Purchase history reset.')}
                  className="text-xs font-bold uppercase tracking-widest text-[#d9534f] opacity-80 hover:opacity-100 transition-opacity mt-4 inline-block"
                >
                  Reset Purchase History
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-primary-container/20 rounded-3xl p-8 border border-secondary/5">
              <h2 className="text-xl font-serif text-secondary flex items-center gap-3 mb-6">
                <User className="w-5 h-5" /> Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/50 block mb-1">Email</label>
                  <p className="font-medium text-secondary">{user.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/50 block mb-1">Membership</label>
                  <p className="font-medium text-secondary flex items-center gap-2">
                    <Gem className="w-3.5 h-3.5" /> Elite Club Member
                  </p>
                </div>
              </div>
              <button className="mt-8 text-[10px] font-bold uppercase tracking-widest bg-secondary text-white px-6 py-3 rounded-xl w-full hover:bg-stone-800 transition-colors">
                Update Details
              </button>
            </section>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-8 min-h-[80vh] flex items-center justify-center"
    >
      <div className="w-full max-w-lg bg-surface rounded-[2.5rem] p-12 border border-secondary/10 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

        {errorMsg && (
          <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3">
            <span className="font-medium text-sm">{errorMsg}</span>
            <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        <AnimatePresence>
          {deletingOrder && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6"
              >
                <h3 className="text-xl font-serif text-secondary font-bold">Confirm Deletion</h3>
                <p className="text-secondary/80 text-sm">Are you sure you want to delete this order?</p>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setDeletingOrder(null)}
                    className="flex-1 py-2 bg-secondary/5 text-secondary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary/10 transition-colors"
                  >Cancel</button>
                  <button 
                    onClick={() => handleDeleteOrder(deletingOrder)}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                  >Delete</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {mode === 'welcome' && (
            <motion.div 
              key="welcome"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center relative z-10"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                <User className="w-10 h-10 text-secondary" />
              </div>
              <h1 className="text-4xl font-serif text-secondary mb-4 italic">The Connoisseur Portal</h1>
              <p className="text-on-surface-variant mb-12 leading-relaxed opacity-70 italic font-serif text-lg">
                Enter the realm of artisanal excellence and manage your curated collections.
              </p>
              
              <div className="space-y-4">
                {errorMsg && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-medium">
                    {errorMsg}
                  </div>
                )}
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-secondary text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Continue with Google'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <p className="mt-12 text-[10px] uppercase font-bold tracking-[0.3em] text-secondary/30 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Secure Access Only
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
