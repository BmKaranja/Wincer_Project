import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Users, Banknote, Activity, Plus, Trash2, Edit2, Search, FileText, Heart } from 'lucide-react';
import { supabase } from '../supabase';

import OrderManagement from '../components/admin/OrderManagement';
import CustomerInquiries from '../components/admin/CustomerInquiries';
import AdminCalendar from '../components/admin/AdminCalendar';
import SalesReports from '../components/admin/SalesReports';

export default function Admin({ user, setView, blogPosts = [] }: { user: any, setView: any, blogPosts?: any[] }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inquiries' | 'calendar' | 'reports' | 'cakes' | 'users' | 'blog'>('dashboard');
  
  const [cakes, setCakes] = useState<any[]>([]);
  const [siteUsers, setSiteUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchCakes = async () => {
      const { data } = await supabase.from('cakes').select('*');
      setCakes(data || []);
    };

    const fetchUsers = async () => {
      const { data } = await supabase.from('users').select('*');
      setSiteUsers(data || []);
    };

    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*');
      if (data) {
        setOrders(data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      }
    };

    const fetchInquiries = async () => {
      const { data } = await supabase.from('inquiries').select('*');
      if (data) {
        setInquiries(data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      }
    };

    fetchCakes();
    fetchUsers();
    fetchOrders();
    fetchInquiries();

    const cakesSub = supabase.channel('cakes_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cakes' }, fetchCakes).subscribe();
    const usersSub = supabase.channel('users_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers).subscribe();
    const ordersSub = supabase.channel('orders_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
    const inquiriesSub = supabase.channel('inquiries_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, fetchInquiries).subscribe();

    return () => {
      supabase.removeChannel(cakesSub);
      supabase.removeChannel(usersSub);
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(inquiriesSub);
    };
  }, [user]);

  const [newCakeTitle, setNewCakeTitle] = useState('');
  const [editingCake, setEditingCake] = useState<any | null>(null);
  const [isAddingCake, setIsAddingCake] = useState(false);
  const [cakeForm, setCakeForm] = useState({ title: '', price: '', desc: '', img: '', tag: '', gauge: '', gaugeVal: '' });

  // Blog Management State
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [postForm, setPostForm] = useState({ title: '', excerpt: '', content: '', category: '', img: '', author: '', date: '', tips: '', relatedCakeId: '' });
  const [postFormError, setPostFormError] = useState('');

  const openAddPostForm = () => {
    setIsAddingPost(true);
    setEditingPost(null);
    setPostForm({ title: '', excerpt: '', content: '', category: '', img: '', author: 'Wincer Team', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), tips: '', relatedCakeId: '' });
  };

  const openEditPostForm = (post: any) => {
    setIsAddingPost(false);
    setEditingPost(post);
    setPostForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || '',
      img: post.img || '',
      author: post.author || '',
      date: post.date || '',
      tips: post.tips ? (Array.isArray(post.tips) ? post.tips.join('\n') : post.tips) : '',
      relatedCakeId: post.relatedCakeId || ''
    });
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostFormError('');
    if (!postForm.title || !postForm.content || !postForm.img) {
      setPostFormError('Title, Content, and Image URL are required.');
      return;
    }
    try {
      const tipsArray = postForm.tips.split('\n').filter(t => t.trim());
      const postData = {
        title: postForm.title,
        excerpt: postForm.excerpt,
        content: postForm.content,
        category: postForm.category,
        img: postForm.img,
        author: postForm.author,
        date: postForm.date,
        tips: tipsArray,
        relatedCakeId: postForm.relatedCakeId,
        updatedAt: new Date().toISOString(),
        likes: editingPost ? (editingPost.likes || 0) : 0
      };

      if (editingPost) {
        await supabase.from('blog_posts').update(postData).eq('id', editingPost.id);
      } else {
        const id = Date.now().toString();
        await supabase.from('blog_posts').insert([{ ...postData, id, createdAt: new Date().toISOString() }]);
      }
      setIsAddingPost(false);
      setEditingPost(null);
    } catch (err) {
      console.error(err);
      setPostFormError('Failed to save post.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

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
      await supabase.from('cakes').delete().eq('id', id);
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
        await supabase.from('cakes').update({
          title: cakeForm.title,
          price: cakeForm.price,
          desc: cakeForm.desc,
          img: cakeForm.img,
          tag: cakeForm.tag || '',
          gauge: cakeForm.gauge || '',
          gaugeVal: cakeForm.gaugeVal || ''
        }).eq('id', editingCake.id);
      } else {
        const id = Date.now().toString();
        await supabase.from('cakes').insert([{
          id,
          title: cakeForm.title,
          price: cakeForm.price,
          desc: cakeForm.desc,
          img: cakeForm.img,
          tag: cakeForm.tag || '',
          gauge: cakeForm.gauge || '',
          gaugeVal: cakeForm.gaugeVal || '',
          createdAt: new Date().toISOString()
        }]);
      }
      clearCakeForm();
    } catch (err) {
      console.error(err);
      setCakeFormError('Failed to save cake: ' + (err as Error).message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await supabase.from('users').delete().eq('id', id);
    } catch (err) {
      console.error(err);
    }
  };

  const [newUserEmail, setNewUserEmail] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;
    try {
      const id = Date.now().toString(); // placeholder ID
      await supabase.from('users').insert([{
        id,
        email: newUserEmail,
        name: 'New Member',
        role: 'user',
        joinedAt: new Date().toISOString(),
        ordersCount: 0
      }]);
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
        {['dashboard', 'orders', 'inquiries', 'calendar', 'reports', 'cakes', 'users', 'blog'].map((tab) => (
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
                { label: 'Active Orders', value: orders.filter(o => o.status === 'Pending' || o.status === 'Pending Verification' || o.status === 'Confirmed (Pending Balance)' || o.status === 'Preparing').length.toString(), icon: Package },
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cakes.map(cake => (
                <div key={cake.id} className="bg-surface rounded-3xl overflow-hidden border border-secondary/10 shadow-sm group">
                  <div className="h-40 overflow-hidden relative">
                    <img src={cake.img} alt={cake.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => openEditForm(cake)}
                        className="p-2 bg-surface/90 backdrop-blur-sm rounded-lg text-secondary hover:bg-secondary hover:text-white transition-colors animate-fade-in"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCake(cake.id)}
                        className="p-2 bg-surface/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors transition-all"
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
        {activeTab === 'blog' && (
          <motion.div 
            key="blog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-xl font-serif text-secondary font-bold mb-2">Blog Management</h2>
                <p className="text-on-surface-variant text-sm font-medium opacity-70">Create and edit articles for the Wincer Food Blog.</p>
              </div>
              
              <button 
                onClick={openAddPostForm} 
                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Plus className="w-5 h-5" /> New Post
              </button>
            </div>

            {(isAddingPost || editingPost) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm"
              >
                <h3 className="text-lg font-serif font-bold text-secondary mb-4">{editingPost ? 'Edit Post' : 'Add New Post'}</h3>
                {postFormError && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{postFormError}</div>}
                <form onSubmit={handlePostSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} placeholder="Post Title *" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" required />
                    <input type="text" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})} placeholder="Category (e.g. Baking Secrets)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" />
                    <input type="text" value={postForm.img} onChange={e => setPostForm({...postForm, img: e.target.value})} placeholder="Main Image URL *" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" required />
                    <input type="text" value={postForm.author} onChange={e => setPostForm({...postForm, author: e.target.value})} placeholder="Author" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" />
                    <input type="text" value={postForm.relatedCakeId} onChange={e => setPostForm({...postForm, relatedCakeId: e.target.value})} placeholder="Related Cake ID (Optional - for order button)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full" />
                    <textarea value={postForm.excerpt} onChange={e => setPostForm({...postForm, excerpt: e.target.value})} placeholder="Excerpt (Short summary for the list view)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full md:col-span-2 resize-none h-20"></textarea>
                    <textarea value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} placeholder="Full Content (Supports plain text and simple markdown formatting)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full md:col-span-2 resize-none h-48" required></textarea>
                    <textarea value={postForm.tips} onChange={e => setPostForm({...postForm, tips: e.target.value})} placeholder="Baking Tips (One per line)" className="px-4 py-3 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm font-medium w-full md:col-span-2 resize-none h-24"></textarea>
                  </div>
                  <div className="flex gap-4 self-end">
                    <button type="button" onClick={() => { setIsAddingPost(false); setEditingPost(null); }} className="bg-secondary/5 text-secondary px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-secondary/10 transition-colors">Cancel</button>
                    <button type="submit" className="bg-secondary text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform">Publish Post</button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post: any) => (
                <div key={post.id} className="bg-surface rounded-3xl overflow-hidden border border-secondary/10 shadow-sm group flex flex-col h-full">
                  <div className="h-40 overflow-hidden relative">
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => openEditPostForm(post)}
                        className="p-2 bg-surface/90 backdrop-blur-sm rounded-lg text-secondary hover:bg-secondary hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 bg-surface/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-secondary/50 mb-3">
                      <FileText className="w-3 h-3" /> {post.category || 'Opinion'}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-secondary mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-on-surface-variant opacity-70 line-clamp-2 mb-4 flex-grow">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-[10px] text-secondary/40 font-bold uppercase tracking-[0.1em]">{post.date}</div>
                      {post.likes > 0 && (
                        <div className="flex items-center gap-1.5 text-secondary text-[10px] font-bold bg-secondary/5 px-2.5 py-1 rounded-full">
                          <Heart className="w-3 h-3 fill-secondary" /> {post.likes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {blogPosts.length === 0 && !isAddingPost && (
                 <div className="col-span-full py-24 text-center text-secondary/30 italic">No blog posts found. Create your first one.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

