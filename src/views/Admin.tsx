import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Users, Banknote, Activity, Plus, Trash2, Edit2, Search } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

import OrderManagement from '../components/admin/OrderManagement';
import CustomerInquiries from '../components/admin/CustomerInquiries';
import AdminCalendar from '../components/admin/AdminCalendar';
import SalesReports from '../components/admin/SalesReports';

export default function Admin({ user, setView }: { user: any, setView: any }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inquiries' | 'calendar' | 'reports' | 'cakes' | 'users'>('dashboard');
  
  const [cakes, setCakes] = useState<any[]>([]);
  const [siteUsers, setSiteUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const unsubCakes = onSnapshot(collection(db, 'cakes'), (snap) => {
      setCakes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setSiteUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      }));
    }, (err) => console.error(err));
    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snap) => {
      setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      }));
    }, (err) => console.error(err));
    return () => { unsubCakes(); unsubUsers(); unsubOrders(); unsubInquiries(); };
  }, [user]);

  const [newCakeTitle, setNewCakeTitle] = useState('');
  const [editingCake, setEditingCake] = useState<any | null>(null);
  const [isAddingCake, setIsAddingCake] = useState(false);
  const [cakeForm, setCakeForm] = useState({ title: '', price: '', desc: '', img: '', tag: '', gauge: '', gaugeVal: '' });

  const openAddForm = () => {
    setIsAddingCake(true);
    setEditingCake(null);
    setCakeForm({ title: '', price: 'Kshs. ', desc: '', img: '', tag: '', gauge: '', gaugeVal: '' });
  };

  const openEditForm = (cake: any) => {
    setIsAddingCake(false);
    setEditingCake(cake);
    setCakeForm({
      title: cake.title || '',
      price: cake.price || '',
      desc: cake.desc || '',
      img: cake.img || '',
      tag: cake.tag || '',
      gauge: cake.gauge || '',
      gaugeVal: cake.gaugeVal || ''
    });
  };

  const clearCakeForm = () => {
    setIsAddingCake(false);
    setEditingCake(null);
  };

  const [cakeFormError, setCakeFormError] = useState('');

  const handleDeleteCake = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cakes', id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete cake: ' + (err as Error).message);
    }
  };

  const handleCakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCakeFormError('');
    if (!cakeForm.title || !cakeForm.img || !cakeForm.price) {
      setCakeFormError('Please fill out required fields (Title, Price, Image URL).');
      return;
    }
    try {
      if (editingCake) {
        await updateDoc(doc(db, 'cakes', editingCake.id), {
          title: cakeForm.title,
          price: cakeForm.price,
          desc: cakeForm.desc,
          img: cakeForm.img,
          tag: cakeForm.tag || '',
          gauge: cakeForm.gauge || '',
          gaugeVal: cakeForm.gaugeVal || ''
        });
      } else {
        const id = Date.now().toString();
        await setDoc(doc(db, 'cakes', id), {
          title: cakeForm.title,
          price: cakeForm.price,
          desc: cakeForm.desc,
          img: cakeForm.img,
          tag: cakeForm.tag || '',
          gauge: cakeForm.gauge || '',
          gaugeVal: cakeForm.gaugeVal || '',
          createdAt: serverTimestamp()
        });
      }
      clearCakeForm();
    } catch (err) {
      console.error(err);
      setCakeFormError('Failed to save cake: ' + (err as Error).message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.error(err);
    }
  };

  const [newUserEmail, setNewUserEmail] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;
    try {
      // In a real app we might call a server function to create a new auth user,
      // but here we just create a User doc and rely on logic
      const id = Date.now().toString(); // placeholder ID
      await setDoc(doc(db, 'users', id), {
        email: newUserEmail,
        name: 'New Member',
        role: 'user',
        joinedAt: Date.now(),
        ordersCount: 0
      });
      setNewUserEmail('');
    } catch (err) {
      console.error(err);
      alert('Failed to add user.');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <motion.main className="pt-32 pb-24 max-w-7xl mx-auto px-8 min-h-[80vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-secondary mb-4">Access Denied</h1>
        <p className="text-on-surface-variant mb-8">You must have administrator privileges to view this page.</p>
        <button 
          onClick={() => setView('home')}
          className="bg-secondary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs"
        >
          Return Home
        </button>
      </motion.main>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-8 min-h-[80vh]"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-secondary/10 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-serif text-secondary mb-2">Admin Dashboard</h1>
          <p className="text-on-surface-variant font-medium opacity-70">Control Panel / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setView('account')}
            className="bg-secondary/10 text-secondary border border-secondary/20 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/20 transition-colors"
          >
            Back to Portal
          </button>
          <button 
            onClick={() => setView('home')}
            className="bg-secondary text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl"
          >
            Live Site
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar">
        {['dashboard', 'orders', 'inquiries', 'calendar', 'reports', 'cakes', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-secondary text-white shadow-xl' 
                : 'bg-secondary/5 text-secondary hover:bg-secondary/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: 'Kshs. ' + orders.reduce((acc, o) => {
                  if (!o.amount) return acc;
                  // Remove 'kshs', 'kes', 'ksh', and commas
                  const cleanStr = String(o.amount).toLowerCase().replace(/kshs?\.?|kes\.?|,/g, '').trim();
                  let mult = 1;
                  if (cleanStr.endsWith('k')) mult = 1000;
                  if (cleanStr.endsWith('m')) mult = 1000000;
                  // Now extract the number part
                  const numStr = cleanStr.replace(/[^0-9.-]/g, '');
                  return acc + ((parseFloat(numStr) || 0) * mult);
                }, 0).toLocaleString(), icon: Banknote },
                { label: 'Active Orders', value: orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length.toString(), icon: Package },
                { label: 'Total Users', value: siteUsers.length.toString(), icon: Users },
                { label: 'Site Traffic', value: '+14%', icon: Activity },
              ].map((stat, idx) => (
                <div key={idx} className="bg-surface rounded-3xl p-6 border border-secondary/10 shadow-sm flex flex-col items-start hover:-translate-y-1 transition-transform">
                  <div className="p-3 bg-secondary/5 rounded-xl mb-4">
                    <stat.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/50 mb-1">{stat.label}</p>
                  <p className="text-3xl font-serif text-secondary font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <OrderManagement orders={orders} />
          </motion.div>
        )}

        {activeTab === 'inquiries' && (
          <motion.div key="inquiries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <CustomerInquiries inquiries={inquiries} />
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <AdminCalendar orders={orders} inquiries={inquiries} />
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <SalesReports orders={orders} />
          </motion.div>
        )}

        {activeTab === 'cakes' && (
          <motion.div 
            key="cakes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-xl font-serif text-secondary font-bold mb-2">Cake Catalog</h2>
                <p className="text-on-surface-variant text-sm font-medium opacity-70">Manage available base creations in your store.</p>
              </div>
              
              <button 
                onClick={openAddForm} 
                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Plus className="w-5 h-5" /> Add Cake
              </button>
            </div>

            {(isAddingCake || editingCake) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm"
              >
                <h3 className="text-lg font-serif font-bold text-secondary mb-4">{editingCake ? 'Edit Cake' : 'Add New Cake'}</h3>
                {cakeFormError && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{cakeFormError}</div>}
                <form onSubmit={handleCakeSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={cakeForm.title} onChange={e => setCakeForm({...cakeForm, title: e.target.value})} placeholder="Title * (e.g. Red Velvet)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" required />
                    <input type="text" value={cakeForm.price} onChange={e => setCakeForm({...cakeForm, price: e.target.value})} placeholder="Price * (e.g. Kshs. 2000)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" required />
                    <input type="text" value={cakeForm.img} onChange={e => setCakeForm({...cakeForm, img: e.target.value})} placeholder="Image URL * (e.g. https://...)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" required />
                    <input type="text" value={cakeForm.tag} onChange={e => setCakeForm({...cakeForm, tag: e.target.value})} placeholder="Tag (e.g. New, Bestseller)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" />
                    <input type="text" value={cakeForm.gauge} onChange={e => setCakeForm({...cakeForm, gauge: e.target.value})} placeholder="Gauge Label (e.g. Classic)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" />
                    <input type="text" value={cakeForm.gaugeVal} onChange={e => setCakeForm({...cakeForm, gaugeVal: e.target.value})} placeholder="Gauge Width (e.g. w-[50%])" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" />
                    <textarea value={cakeForm.desc} onChange={e => setCakeForm({...cakeForm, desc: e.target.value})} placeholder="Description" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full md:col-span-2 resize-none h-24"></textarea>
                  </div>
                  <div className="flex gap-4 self-end">
                    <button type="button" onClick={clearCakeForm} className="bg-secondary/5 text-secondary px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-secondary/10 transition-colors">Cancel</button>
                    <button type="submit" className="bg-secondary text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform">Save Cake</button>
                  </div>
                </form>
              </motion.div>
            )}

            {!isAddingCake && !editingCake && cakeFormError && (
              <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{cakeFormError}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cakes.map(cake => (
                <div key={cake.id} className="bg-surface rounded-3xl overflow-hidden border border-secondary/10 shadow-sm group">
                  <div className="h-40 overflow-hidden relative">
                    <img src={cake.img} alt={cake.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => openEditForm(cake)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-secondary hover:bg-secondary hover:text-white transition-colors animate-fade-in"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCake(cake.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-bold text-secondary">{cake.title}</h3>
                      <span className="font-serif font-bold text-secondary">{cake.price}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant opacity-70 line-clamp-2">{cake.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-xl font-serif text-secondary font-bold mb-2">User Registry</h2>
                <p className="text-on-surface-variant text-sm font-medium opacity-70">Manage club members and administrator access.</p>
              </div>
            </div>

            <div className="bg-surface rounded-3xl border border-secondary/10 shadow-sm overflow-hidden text-sm">
              <div className="p-4 bg-secondary/5 border-b border-secondary/10 flex items-center gap-2 text-secondary/60">
                <Search className="w-4 h-4" />
                <input type="text" placeholder="Search users by name or email..." className="bg-transparent border-none outline-none w-full font-medium" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-secondary/10 bg-secondary/5">
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Name</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Email</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Role</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Joined</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Orders</th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-secondary/60 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteUsers.map((u, idx) => (
                      <tr key={u.id} className="border-b border-secondary/5 hover:bg-secondary/[0.02] transition-colors group">
                        <td className="py-4 px-6 font-medium text-secondary">{u.name}</td>
                        <td className="py-4 px-6 text-secondary/70">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-secondary/10 text-secondary'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-secondary/60">{u.joinedAt ? new Date(u.joinedAt.seconds ? u.joinedAt.seconds * 1000 : u.joinedAt).toLocaleDateString() : 'Just now'}</td>
                        <td className="py-4 px-6 text-secondary/60">{u.ordersCount || 0}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            className="p-2 text-secondary/40 hover:text-red-500 transition-colors"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.email === 'bmkaranja001@gmail.com'}
                            title={u.email === 'bmkaranja001@gmail.com' ? "Cannot delete main admin" : "Delete user"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

