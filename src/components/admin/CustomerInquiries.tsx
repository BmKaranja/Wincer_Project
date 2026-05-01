import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { MessageSquare, Trash2, Eye, X } from 'lucide-react';

export default function CustomerInquiries({ inquiries }: { inquiries: any[] }) {
  const [viewingInquiry, setViewingInquiry] = useState<any>(null);
  const [deletingInquiry, setDeletingInquiry] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stats = [
    { label: 'New Inquiries', count: inquiries.filter(i => i.status === 'Pending').length, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Pending Response', count: inquiries.filter(i => i.status === 'Needs Reply').length, color: 'bg-blue-100 text-blue-800' },
    { label: 'Closed', count: inquiries.filter(i => i.status === 'Resolved' || i.status === 'Closed').length, color: 'bg-gray-100 text-gray-800' }
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-secondary font-bold flex items-center gap-3">
              <MessageSquare className="w-5 h-5" /> Customer Inquiries
            </h2>
            <div className="text-xs font-medium text-secondary/60 uppercase tracking-widest">
              Total: {inquiries.length}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-secondary/10 -mt-2">
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Customer</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Details</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Status</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Date Submitted</th>
                  <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-secondary/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((row) => (
                  <tr key={row.id} className="border-b border-secondary/5 hover:bg-secondary/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-secondary">{row.name}</p>
                      <p className="text-xs text-secondary/60">{row.phone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider block w-fit mb-1">
                        {row.occasionType} - {row.eventDate}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select 
                        value={row.status}
                        onChange={async (e) => {
                           try {
                              setErrorMsg(null);
                              await setDoc(doc(db, 'inquiries', row.id), { status: e.target.value }, { merge: true });
                           } catch (err: any) {
                              setErrorMsg("Failed to update status: " + err.message);
                              console.error(err);
                           }
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer border ${
                          row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          row.status === 'Needs Reply' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                         <option value="Pending">New / Pending</option>
                         <option value="Needs Reply">Needs Reply</option>
                         <option value="Resolved">Closed / Resolved</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary/60">
                      {row.createdAt ? new Date(row.createdAt.seconds ? row.createdAt.seconds * 1000 : row.createdAt).toLocaleDateString() : 'Just now'}
                    </td>
                    <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingInquiry(row)}
                        className="p-2 bg-secondary/5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingInquiry(row)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant font-serif italic">No inquiries yet.</td>
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
        {deletingInquiry && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-serif text-secondary font-bold">Confirm Deletion</h3>
              <p className="text-secondary/80 text-sm">Are you sure you want to delete the inquiry from <span className="font-bold">{deletingInquiry.name}</span>?</p>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setDeletingInquiry(null)}
                  className="flex-1 py-2 bg-secondary/5 text-secondary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-secondary/10 transition-colors"
                >Cancel</button>
                <button 
                  onClick={async () => {
                    try {
                      setErrorMsg(null);
                      await deleteDoc(doc(db, 'inquiries', deletingInquiry.id));
                      setDeletingInquiry(null);
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

        {viewingInquiry && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setViewingInquiry(null)}
                className="absolute top-4 right-4 p-2 bg-secondary/5 rounded-full hover:bg-secondary/10 transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>

              <h2 className="text-2xl font-serif font-bold text-secondary">Inquiry Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Customer</label>
                  <p className="font-medium text-secondary">{viewingInquiry.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Phone</label>
                  <p className="font-medium text-secondary">{viewingInquiry.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Event Date</label>
                  <p className="font-medium text-secondary">{viewingInquiry.eventDate}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Occasion Type</label>
                  <p className="font-medium text-secondary">{viewingInquiry.occasionType}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Cake Details</label>
                <div className="mt-1 p-4 bg-secondary/[0.02] rounded-xl border border-secondary/10 whitespace-pre-wrap text-sm text-secondary/80">
                  {viewingInquiry.cakeDetails || 'N/A'}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Vision/Inspiration</label>
                <div className="mt-1 p-4 bg-secondary/[0.02] rounded-xl border border-secondary/10 whitespace-pre-wrap text-sm text-secondary/80">
                  {viewingInquiry.vision || 'N/A'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
