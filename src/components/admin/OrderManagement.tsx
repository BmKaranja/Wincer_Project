import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Package, Trash2, Edit2, Eye, X, CheckCircle } from 'lucide-react';

export default function OrderManagement({ orders }: { orders: any[] }) {
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [deletingOrder, setDeletingOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stats = [
    { label: 'New Orders', count: orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed (Pending Balance)').length, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'In Progress', count: orders.filter(o => o.status === 'Preparing').length, color: 'bg-blue-100 text-blue-800' },
    { label: 'Ready', count: orders.filter(o => o.status === 'Ready').length, color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Completed', count: orders.filter(o => o.status === 'Fully Paid' || o.status === 'Delivered').length, color: 'bg-green-100 text-green-800' }
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-8"
      >
        <div className="bg-surface rounded-3xl p-8 border border-secondary/10 shadow-sm">
          <h2 className="text-xl font-serif text-secondary font-bold mb-6 flex items-center gap-3">
            <Package className="w-5 h-5" /> Order Management
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-secondary/10 flex flex-col items-center justify-center text-center bg-secondary/5">
                <span className="text-2xl font-serif font-bold text-secondary mb-1">{stat.count}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${stat.color}`}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-secondary/10">
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Order #</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Customer</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Delivery Date</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Cake</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Details</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((row) => (
                  <tr key={row.id} className="border-b border-secondary/5 hover:bg-secondary/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono text-sm text-secondary/70">#{row.id.slice(-6)}</td>
                    <td className="py-4 px-4 font-medium text-secondary">{row.customer}</td>
                    <td className="py-4 px-4 text-sm text-secondary/60">{row.deliveryDate || 'N/A'}</td>
                    <td className="py-4 px-4 text-xs text-secondary/70 truncate max-w-[150px]" title={row.cakeTitle}>
                      {row.cakeTitle ? (row.gauge ? `${row.cakeTitle} - ${row.gauge}` : row.cakeTitle) : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-xs text-secondary/70 truncate max-w-[200px]" title={row.cakeDetails}>
                      {row.cakeDetails || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <select 
                        value={row.status}
                        onChange={async (e) => {
                           try {
                              setErrorMsg(null);
                              await setDoc(doc(db, 'orders', row.id), { status: e.target.value }, { merge: true });
                           } catch (err: any) {
                              setErrorMsg("Failed to update status: " + err.message);
                              console.error(err);
                           }
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer border ${
                          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          row.status === 'Confirmed (Pending Balance)' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          row.status === 'Fully Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                          row.status === 'Preparing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          row.status === 'Ready' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                          row.status === 'Delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                         <option value="Pending">Pending</option>
                         <option value="Confirmed (Pending Balance)">Confirmed</option>
                         <option value="Preparing">In Progress</option>
                         <option value="Ready">Ready</option>
                         <option value="Fully Paid">Fully Paid</option>
                         <option value="Delivered">Completed / Delivered</option>
                         <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingOrder(row)}
                        className="p-2 bg-secondary/5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingOrder({...row})}
                        className="p-2 bg-secondary/5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Edit order">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingOrder(row)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant font-serif italic">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {errorMsg && (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3">
          <span className="font-medium text-sm">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}><X className="w-4 h-4" /></button>
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
              <p className="text-secondary/80 text-sm">Are you sure you want to delete the order from <span className="font-bold">{deletingOrder.customer}</span>?</p>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setDeletingOrder(null)}
                  className="flex-1 py-2 bg-secondary/5 text-secondary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary/10 transition-colors"
                >Cancel</button>
                <button 
                  onClick={async () => {
                    try {
                      setErrorMsg(null);
                      await deleteDoc(doc(db, 'orders', deletingOrder.id));
                      setDeletingOrder(null);
                    } catch (err: any) {
                      setErrorMsg("Failed to delete: " + err.message);
                    }
                  }}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                >Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {viewingOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setViewingOrder(null)} className="absolute top-4 right-4 p-2 bg-secondary/5 rounded-full hover:bg-secondary/10 transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
              <h2 className="text-2xl font-serif font-bold text-secondary mb-6">Order Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b border-secondary/10">
                  <span className="text-secondary/60 text-sm font-bold uppercase tracking-widest">Order ID</span>
                  <span className="font-mono text-secondary">#{viewingOrder.id}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-secondary/10">
                  <span className="text-secondary/60 text-sm font-bold uppercase tracking-widest">Customer</span>
                  <span className="font-medium text-secondary">{viewingOrder.customer}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-secondary/10">
                  <span className="text-secondary/60 text-sm font-bold uppercase tracking-widest">Delivery Date</span>
                  <span className="font-medium text-secondary">{viewingOrder.deliveryDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-secondary/10">
                  <span className="text-secondary/60 text-sm font-bold uppercase tracking-widest">Cake</span>
                  <span className="font-medium text-secondary">{viewingOrder.cakeTitle}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-secondary/10">
                  <span className="text-secondary/60 text-sm font-bold uppercase tracking-widest">Amount</span>
                  <span className="font-serif font-bold text-secondary">{viewingOrder.amount}</span>
                </div>
                {viewingOrder.cakeDetails && (
                  <div className="pb-4 border-b border-secondary/10">
                    <span className="text-secondary/60 text-sm font-bold uppercase tracking-widest block mb-2">Cake Details</span>
                    <span className="font-medium text-secondary/80 text-sm">{viewingOrder.cakeDetails}</span>
                  </div>
                )}
                {viewingOrder.notes && (
                  <div className="pb-4 border-b border-secondary/10">
                    <span className="text-secondary/60 text-sm font-bold uppercase tracking-widest block mb-2">Notes</span>
                    <span className="font-medium text-secondary/80 text-sm">{viewingOrder.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setEditingOrder(null)} 
                className="absolute top-4 right-4 p-2 bg-secondary/5 rounded-full hover:bg-secondary/10 transition-colors"
                disabled={editingOrder.saving}
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
              <h2 className="text-2xl font-serif font-bold text-secondary mb-6">Edit Order</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 block mb-1">Customer Name</label>
                  <input
                    className="w-full px-4 py-2 bg-background border border-secondary/10 rounded-xl focus:ring-2 outline-none font-medium text-sm"
                    value={editingOrder.customer}
                    onChange={e => setEditingOrder({...editingOrder, customer: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 block mb-1">Delivery Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-background border border-secondary/10 rounded-xl focus:ring-2 outline-none font-medium text-sm"
                    value={editingOrder.deliveryDate || ''}
                    onChange={e => setEditingOrder({...editingOrder, deliveryDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 block mb-1">Amount</label>
                  <input
                    className="w-full px-4 py-2 bg-background border border-secondary/10 rounded-xl focus:ring-2 outline-none font-medium text-sm"
                    value={editingOrder.amount}
                    onChange={e => setEditingOrder({...editingOrder, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 block mb-1">Cake Details</label>
                  <textarea
                    className="w-full px-4 py-2 bg-background border border-secondary/10 rounded-xl focus:ring-2 outline-none font-medium text-sm h-20 resize-none"
                    value={editingOrder.cakeDetails || ''}
                    onChange={e => setEditingOrder({...editingOrder, cakeDetails: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    disabled={editingOrder.saving}
                    onClick={async () => {
                      setEditingOrder({...editingOrder, saving: true});
                      try {
                        const { id, saving, ...updateData } = editingOrder;
                        setErrorMsg(null);
                        await setDoc(doc(db, 'orders', id), updateData, { merge: true });
                        setEditingOrder(null);
                      } catch (err: any) {
                        setErrorMsg("Update failed: " + err.message);
                        setEditingOrder({...editingOrder, saving: false});
                      }
                    }}
                    className="bg-secondary text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
                  >
                    {editingOrder.saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
