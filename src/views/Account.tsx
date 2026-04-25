import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Gem } from 'lucide-react';

export default function Account() {
  const [mode, setMode] = useState<'welcome' | 'signin' | 'register'>('welcome');

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

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
                <button 
                  onClick={() => setMode('signin')}
                  className="w-full bg-secondary text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  Enter Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setMode('register')}
                  className="w-full bg-transparent text-secondary border border-secondary/20 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-secondary/5 transition-all flex items-center justify-center gap-3"
                >
                  <Gem className="w-4 h-4" /> Join the Elite Club
                </button>
              </div>
              
              <p className="mt-12 text-[10px] uppercase font-bold tracking-[0.3em] text-secondary/30 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Secure Access Only
              </p>
            </motion.div>
          )}

          {mode === 'signin' && (
            <motion.div 
              key="signin"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10"
            >
              <button 
                onClick={() => setMode('welcome')}
                className="mb-8 text-[10px] font-bold uppercase tracking-widest text-secondary/60 hover:text-secondary flex items-center gap-2 transition-colors"
              >
                ← Return to Portal
              </button>
              <h2 className="text-3xl font-serif text-secondary mb-10 italic">Welcome Back</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 ml-4">Credentials</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/30" />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full bg-secondary/5 border border-secondary/10 p-5 pl-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/10 transition-all font-serif"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/30" />
                    <input 
                      type="password" 
                      placeholder="Personal Keyphrase" 
                      className="w-full bg-secondary/5 border border-secondary/10 p-5 pl-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/10 transition-all font-serif"
                    />
                  </div>
                </div>
                <button className="w-full bg-secondary text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-4">
                  Authorize Entry
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div 
              key="register"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10"
            >
              <button 
                onClick={() => setMode('welcome')}
                className="mb-8 text-[10px] font-bold uppercase tracking-widest text-secondary/60 hover:text-secondary flex items-center gap-2 transition-colors"
              >
                ← Return to Portal
              </button>
              <h2 className="text-3xl font-serif text-secondary mb-4 italic">Elevate Your Status</h2>
              <p className="text-on-surface-variant mb-10 text-xs italic font-serif leading-relaxed opacity-70">
                Join our circle of connoisseurs for priority reservations and bespoke creations.
              </p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    className="w-full bg-secondary/5 border border-secondary/10 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/10 transition-all font-serif"
                  />
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    className="w-full bg-secondary/5 border border-secondary/10 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/10 transition-all font-serif"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/30" />
                  <input 
                    type="email" 
                    placeholder="E-mail Address" 
                    className="w-full bg-secondary/5 border border-secondary/10 p-5 pl-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/10 transition-all font-serif"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/30" />
                  <input 
                    type="password" 
                    placeholder="Create Secure Keyphrase" 
                    className="w-full bg-secondary/5 border border-secondary/10 p-5 pl-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/10 transition-all font-serif"
                  />
                </div>
                <button className="w-full bg-secondary text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-4 flex items-center justify-center gap-3">
                  <Gem className="w-3.5 h-3.5" /> Initialize Club Membership
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
