import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Users, DollarSign, Activity, Plus, Trash2, Edit2, Search } from 'lucide-react';
import { PRODUCTS } from '../constants';

export default function Admin({ user, setView }: { user: any, setView: any }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cakes' | 'users'>('dashboard');
  
  // Mock data states for demo purposes
  const [cakes, setCakes] = useState<any[]>(PRODUCTS);
  const [siteUsers, setSiteUsers] = useState<any[]>([
    { id: 1, name: 'Isabella C.', email: 'isabella@example.com', role: 'user', joined: '2025-10-12', orders: 4 },
    { id: 2, name: 'Marcus T.', email: 'marcus@example.com', role: 'user', joined: '2026-01-05', orders: 1 },
    { id: 3, name: 'Elena R.', email: 'elena@example.com', role: 'user', joined: '2026-02-14', orders: 0 },
    { id: 4, name: 'Admin', email: 'housecake@gmail.com', role: 'admin', joined: '2024-01-01', orders: 0 },
  ]);

  const [newCakeTitle, setNewCakeTitle] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const handleDeleteCake = (id: number) => {
    setCakes(cakes.filter(c => c.id !== id));
  };

  const handleAddCake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCakeTitle) return;
    const newCake = {
      id: Date.now(),
      title: newCakeTitle,
      price: '$50.00',
      desc: 'New custom creation added by admin.',
      tag: 'New',
      gauge: 'Classic',
      gaugeVal: 'w-[50%]',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB176m2zlRpaD5R6G1M4MidY7Cn9B1EvIvGGuCZvlEhdIyPt-n6G2ZQEaHKP_xR22yqVMVPXB7MMnZpWxQKlL79NK5EQeU2oNHiLTbgfvUu2Pd0tazVRZdDyo9TMVnWFuR3lT1iZgLdqOqYSiWriNcPVQ278V_eF7mJfmluKDzZ0-4x1t_TquTX6NR0jnp4d4VPK2-xXSOeOLYGFmewvOPgl2ZJCqQhvu_g-wtD0sUvohXbo9YkCXSIVB3us_WEuoEsmGyOFFj2oVs'
    };
    setCakes([newCake, ...cakes]);
    setNewCakeTitle('');
  };

  const handleDeleteUser = (id: number) => {
    setSiteUsers(siteUsers.filter(u => u.id !== id));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;
    const newUser = {
      id: Date.now(),
      name: 'New Member',
      email: newUserEmail,
      role: 'user',
      joined: new Date().toISOString().split('T')[0],
      orders: 0
    };
    setSiteUsers([newUser, ...siteUsers]);
    setNewUserEmail('');
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
        {['dashboard', 'cakes', 'users'].map((tab) => (
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
                { label: 'Total Revenue', value: '$12,450', icon: DollarSign },
                { label: 'Active Orders', value: '24', icon: Package },
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

            <div className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm">
              <h2 className="text-xl font-serif text-secondary mb-6 font-bold flex items-center gap-3">
                <Package className="w-5 h-5" /> Recent Orders & Inquiries
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-secondary/10">
                      <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">ID</th>
                      <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Customer</th>
                      <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Date</th>
                      <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Status</th>
                      <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: '#ORD-1092', customer: 'Isabella C.', date: 'Today at 10:42 AM', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-800', amount: '$145.00' },
                      { id: '#ORD-1091', customer: 'Marcus T.', date: 'Today at 09:14 AM', status: 'Preparing', statusColor: 'bg-blue-100 text-blue-800', amount: '$85.00' },
                      { id: '#INQ-0042', customer: 'Elena R.', date: 'Yesterday', status: 'Needs Reply', statusColor: 'bg-red-100 text-red-800', amount: '-' },
                      { id: '#ORD-1090', customer: 'Sophie W.', date: 'Yesterday', status: 'Delivered', statusColor: 'bg-green-100 text-green-800', amount: '$210.00' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-secondary/5 hover:bg-secondary/[0.02] transition-colors">
                        <td className="py-4 px-4 font-mono text-sm text-secondary/70">{row.id}</td>
                        <td className="py-4 px-4 font-medium text-secondary">{row.customer}</td>
                        <td className="py-4 px-4 text-sm text-secondary/60">{row.date}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${row.statusColor}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-serif font-bold text-secondary">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
              
              <form onSubmit={handleAddCake} className="flex gap-2 w-full md:w-auto">
                <input 
                  type="text" 
                  value={newCakeTitle}
                  onChange={e => setNewCakeTitle(e.target.value)}
                  placeholder="New Cake Title..." 
                  className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full md:w-64"
                />
                <button type="submit" className="bg-secondary text-white p-3 rounded-xl hover:scale-[1.02] transition-transform">
                  <Plus className="w-5 h-5" />
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cakes.map(cake => (
                <div key={cake.id} className="bg-surface rounded-3xl overflow-hidden border border-secondary/10 shadow-sm group">
                  <div className="h-40 overflow-hidden relative">
                    <img src={cake.img} alt={cake.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-secondary hover:bg-secondary hover:text-white transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCake(cake.id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
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
              
              <form onSubmit={handleAddUser} className="flex gap-2 w-full md:w-auto">
                <input 
                  type="email" 
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="User Email Address..." 
                  className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full md:w-64"
                />
                <button type="submit" className="bg-secondary text-white p-3 rounded-xl hover:scale-[1.02] transition-transform">
                  <Plus className="w-5 h-5" />
                </button>
              </form>
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
                        <td className="py-4 px-6 text-secondary/60">{u.joined}</td>
                        <td className="py-4 px-6 text-secondary/60">{u.orders}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            className="p-2 text-secondary/40 hover:text-red-500 transition-colors"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.email === 'housecake@gmail.com'}
                            title={u.email === 'housecake@gmail.com' ? "Cannot delete main admin" : "Delete user"}
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

