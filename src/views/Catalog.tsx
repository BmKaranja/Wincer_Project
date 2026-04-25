import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';

import { CATEGORIES, PRODUCTS } from '../constants';

export default function Catalog({ setView, onSelect }: { setView: (v: string) => void, onSelect?: (p: any) => void }) {
  const categories = CATEGORIES;
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(300);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleDietary = (opt: string) => {
    setSelectedDietary(prev => 
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      // Parse price (e.g. "$85.00" to 85)
      const numPrice = parseFloat(p.price.replace(/[^0-9.]/g, ''));
      if (numPrice > priceLimit) return false;

      // Filter by category (flavor profile) - check if desc or title contains category if no categories array on product
      if (selectedCategories.length > 0) {
        const matchesCat = selectedCategories.some(cat => 
          p.title.toLowerCase().includes(cat.toLowerCase()) || 
          p.desc.toLowerCase().includes(cat.toLowerCase())
        );
        if (!matchesCat) return false;
      }

      // Filter by dietary needs
      if (selectedDietary.length > 0) {
        const hasVegan = p.tag?.toLowerCase().includes('vegan');
        const hasGF = p.tag?.toLowerCase().includes('gf') || p.tag?.toLowerCase().includes('gluten');
        
        const dietaryMatches = selectedDietary.every(d => {
          if (d === 'Vegan') return hasVegan;
          if (d === 'Gluten-Free') return hasGF;
          return false;
        });
        
        if (!dietaryMatches) return false;
      }

      return true;
    });
  }, [priceLimit, selectedCategories, selectedDietary]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-8"
    >
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-serif text-secondary mb-4">The Collection</h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto opacity-80 font-sans">
          Discover our handcrafted masterpieces, where artisanal precision meets the finest seasonal ingredients.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-64 space-y-8 shrink-0">
          <div className="p-8 bg-primary-container/40 rounded-2xl border border-secondary/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 border-b border-secondary/10 pb-3">
              Refine Selection
            </h3>
            <div className="space-y-8">
              <div>
                <span className="text-sm font-bold block mb-4">Flavor Profile</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all shadow-sm ${
                        selectedCategories.includes(cat) 
                          ? 'bg-secondary text-white border-secondary' 
                          : 'bg-white text-on-surface border-secondary/10 hover:bg-secondary/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-bold block mb-4">Dietary Needs</span>
                <div className="space-y-3">
                  {["Gluten-Free", "Vegan"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedDietary.includes(opt)}
                        onChange={() => toggleDietary(opt)}
                        className="w-4 h-4 rounded border-secondary/20 text-secondary focus:ring-secondary" 
                      />
                      <span className="text-sm text-on-surface-variant group-hover:text-secondary transition-colors font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold">Price Range</span>
                  <span className="text-sm font-medium text-secondary">Up to ${priceLimit}</span>
                </div>
                <input 
                  type="range" 
                  min="40" max="300" step="10" 
                  value={priceLimit}
                  onChange={(e) => setPriceLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary/10 rounded-lg appearance-none cursor-pointer accent-secondary" 
                />
                <div className="flex justify-between text-[10px] uppercase font-bold text-on-surface-variant mt-2 tracking-widest">
                  <span>$40</span>
                  <span>$300+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((p, idx) => (
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
                  
                  <div className="mb-8 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                      <span>Richness</span>
                      <span className="text-secondary">{p.gauge}</span>
                    </div>
                    <div className="h-1 bg-secondary/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-secondary ${p.gaugeVal}`}></div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onSelect ? onSelect(p) : setView('customizer')}
                    className="mt-auto w-full py-4 bg-secondary text-on-secondary rounded-xl font-bold text-xs tracking-[0.2em] uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Customize & Order <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-primary-container/20 border border-secondary/5 rounded-2xl h-full flex flex-col items-center justify-center">
              <span className="text-3xl mb-4 text-secondary">🍰</span>
              <h2 className="text-2xl font-serif text-secondary mb-2 italic">No masterpieces found</h2>
              <p className="text-on-surface-variant font-medium">Try refining your selection criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedDietary([]);
                  setPriceLimit(300);
                }}
                className="mt-6 px-6 py-2 border-2 border-secondary/20 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-secondary hover:text-white transition-all text-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-16 flex justify-center items-center gap-6">
            <button className="p-3 border border-secondary/10 rounded-full text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 font-bold text-sm">
              <span className="text-secondary border-b-2 border-secondary pb-1">1</span>
              <span className="text-on-surface-variant/40 hover:text-secondary cursor-pointer transition-colors">2</span>
              <span className="text-on-surface-variant/40 hover:text-secondary cursor-pointer transition-colors">3</span>
            </div>
            <button className="p-3 border border-secondary/10 rounded-full text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
