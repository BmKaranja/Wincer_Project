import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Wand2, TrendingUp, Star, Flame } from 'lucide-react';
import { CATEGORIES } from '../constants';

export default function Catalog({ setView, onSelect, cakes = [] }: { setView: (v: string) => void, onSelect?: (p: any) => void, cakes?: any[] }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(25000);

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
    return cakes.filter(p => {
      let numPrice = 0;
      if (typeof p.price === 'number') {
        numPrice = p.price;
      } else if (typeof p.price === 'string') {
        const digits = p.price.replace(/\D/g, '');
        if (digits) numPrice = parseInt(digits, 10);
      }
      if (numPrice > 0 && numPrice > priceLimit) return false;

      if (selectedCategories.length > 0) {
        const matchesCat = selectedCategories.some(cat => 
          p.title.toLowerCase().includes(cat.toLowerCase()) || 
          p.desc.toLowerCase().includes(cat.toLowerCase())
        );
        if (!matchesCat) return false;
      }

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
  }, [cakes, priceLimit, selectedCategories, selectedDietary]);

  // Separate bestsellers/trending from regular
  const bestsellers = filteredProducts.filter(p => 
    p.tag?.toLowerCase().includes('bestseller') || 
    p.tag?.toLowerCase().includes('trending') ||
    p.tag?.toLowerCase().includes('signature')
  );
  const regular = filteredProducts.filter(p => !bestsellers.includes(p));

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
          Discover our handcrafted masterpieces and custom cakes for all occasions.
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
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all shadow-sm ${
                        selectedCategories.includes(cat) 
                          ? 'bg-secondary text-white border-secondary' 
                          : 'bg-surface text-on-surface border-secondary/10 hover:bg-secondary/10'
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
                  <span className="text-sm font-medium text-secondary">Up to Kshs. {priceLimit}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="25000" step="100" 
                  value={priceLimit}
                  onChange={(e) => setPriceLimit(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary/10 rounded-lg appearance-none cursor-pointer accent-secondary" 
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {/* BESTSELLERS SECTION */}
          {bestsellers.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-2xl font-serif text-secondary font-bold">Most Wanted</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
                {bestsellers.map((p, idx) => (
                  <BestsellerCard key={p.id} product={p} idx={idx} onSelect={onSelect} />
                ))}
              </div>
              <div className="h-px bg-secondary/10 mb-16"></div>
            </div>
          )}

          {/* REGULAR PRODUCTS */}
          {regular.length > 0 ? (
            <div>
              <h2 className="text-2xl font-serif text-secondary font-bold mb-8">Full Catalog</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {regular.map((p, idx) => (
                  <StandardCard key={p.id} product={p} idx={idx} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-primary-container/20 border border-secondary/5 rounded-2xl">
              <span className="text-3xl mb-4 text-secondary block">🍰</span>
              <h2 className="text-2xl font-serif text-secondary mb-2 italic">No masterpieces found</h2>
              <p className="text-on-surface-variant font-medium">Try refining your selection criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedDietary([]);
                  setPriceLimit(25000);
                }}
                className="mt-6 px-6 py-2 border-2 border-secondary/20 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-secondary hover:text-white transition-all text-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.main>
  );
}

// Bestseller Card - More prominent
function BestsellerCard({ product, idx, onSelect }: any) {
  return (
    <motion.div 
      key={product.id}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="relative group"
    >
      {/* Gold border accent */}
      <div className="absolute -inset-1 bg-gradient-to-br from-amber-300 to-amber-100 rounded-2xl opacity-0 group-hover:opacity-40 blur transition-all duration-500 -z-10"></div>
      
      <div className="bg-surface-container/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl flex flex-col h-full border border-secondary/10 transition-all duration-300">
        <div className="aspect-square relative overflow-hidden">
          <img 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src={product.img} 
            alt={product.title}
          />
          <div className="absolute top-0 right-0 left-0 h-20 bg-gradient-to-b from-black/40 to-transparent"></div>
          
          {/* Tag */}
          {product.tag && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-400 text-amber-900 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
              ⭐ {product.tag}
            </div>
          )}

          {/* Price Badge - Top Left */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-secondary font-serif font-bold text-sm">{product.price}</span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-lg font-serif text-secondary font-bold mb-2">{product.title}</h3>
          <p className="text-sm text-on-surface-variant mb-6 line-clamp-2 leading-relaxed opacity-80">{product.desc}</p>
          
          {(product.gauge || product.gaugeVal) && (
            <div className="mb-6 space-y-2 mt-auto">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                <span>{product.gauge}</span>
              </div>
              <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r from-secondary to-amber-500 ${product.gaugeVal}`}></div>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => onSelect ? onSelect(product) : {}}
            className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-bold text-xs tracking-widest uppercase hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group/btn"
          >
            Customize <Wand2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Standard Card - Compact
function StandardCard({ product, idx, onSelect }: any) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-surface-container/50 rounded-2xl overflow-hidden border border-secondary/5 group hover:border-secondary/20 hover:shadow-lg transition-all flex flex-col h-full"
    >
      <div className="aspect-square relative overflow-hidden bg-secondary/5">
        <img 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          src={product.img} 
          alt={product.title}
        />
        {product.tag && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-tertiary-container/90 backdrop-blur-sm text-on-tertiary-container rounded-full text-[9px] font-bold uppercase tracking-widest">
            {product.tag}
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-serif text-secondary font-bold flex-1">{product.title}</h3>
          <span className="text-xs font-bold text-secondary ml-2 shrink-0">{product.price}</span>
        </div>
        <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 opacity-80">{product.desc}</p>
        
        <button 
          onClick={() => onSelect ? onSelect(product) : {}}
          className="mt-auto w-full py-2.5 bg-secondary/10 text-secondary rounded-lg font-bold text-[10px] tracking-widest uppercase hover:bg-secondary hover:text-white transition-all"
        >
          Customize & Order
        </button>
      </div>
    </motion.div>
  );
}