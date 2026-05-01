import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, Wand2 } from 'lucide-react';

export default function Search({ setView, onSelect, cakes = [] }: { setView: (v: string) => void, onSelect: (p: any) => void, cakes?: any[] }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return cakes.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.desc.toLowerCase().includes(lowerQuery)
    );
  }, [query, cakes]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-8 min-h-[80vh]"
    >
      <div className="max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl font-serif text-secondary mb-8 text-center italic">The Search</h1>
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <SearchIcon className="w-6 h-6 text-secondary/30 group-focus-within:text-secondary group-focus-within:scale-110 transition-all" />
          </div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for your next obsession..." 
            className="w-full bg-surface p-8 pl-16 rounded-3xl border border-secondary/10 shadow-sm focus:outline-none focus:ring-4 focus:ring-secondary/5 font-serif text-2xl transition-all"
            autoFocus
          />
        </div>
        
        {query && (
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-secondary/60">
            <span>Found {results.length} Potential Masterpieces</span>
            {results.length > 0 && <span className="italic">Exquisite selection</span>}
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {results.length > 0 ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {results.map((p, idx) => (
              <motion.div 
                key={p.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl overflow-hidden diffusion-shadow group flex flex-col h-full border border-secondary/5"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={p.img} 
                    alt={p.title}
                  />
                  {p.tag && (
                    <div className="absolute top-4 right-4 px-4 py-1 bg-tertiary-container/90 backdrop-blur-sm text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {p.tag}
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-serif text-secondary font-bold">{p.title}</h3>
                    <span className="text-sm font-bold text-secondary">{p.price}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 leading-relaxed opacity-80">{p.desc}</p>
                  
                  <button 
                    onClick={() => onSelect(p)}
                    className="mt-auto w-full py-4 bg-secondary text-on-secondary rounded-xl font-bold text-xs tracking-[0.2em] uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Customize <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : query.trim() ? (
          <motion.div 
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <SearchIcon className="w-10 h-10 text-secondary/20" />
            </div>
            <h2 className="text-2xl font-serif text-secondary mb-4 italic">Alas, nothing matched your request</h2>
            <p className="text-on-surface-variant opacity-60 max-w-sm mx-auto font-medium">Try searching for keywords like "velvet", "chocolate", or "summer".</p>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              {['Signature', 'Vegan', 'Chocolate', 'Berry', 'Wedding', 'Custom'].map(term => (
                <button 
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-6 py-3 bg-secondary/5 hover:bg-secondary/10 text-secondary rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-secondary/5"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
