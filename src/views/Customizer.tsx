import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Check, Wand2 } from 'lucide-react';

export default function Customizer({ setView, selectedProduct, onAddToCart, editingItem, cakes = [] }: { setView: (v: string) => void, selectedProduct?: any, onAddToCart?: (item: any) => void, editingItem?: any, cakes?: any[] }) {
  const [internalBaseProduct, setInternalBaseProduct] = useState<any>(selectedProduct);
  const [size, setSize] = useState('1 kg');
  const [sponge, setSponge] = useState('Vanilla');
  const [filling, setFilling] = useState('Chantilly Cream');
  const [frosting, setFrosting] = useState('Smooth Silk');
  const [toppings, setToppings] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  // Load defaults if a product was selected from catalog or we are editing
  useEffect(() => {
    if (editingItem) {
      const { config } = editingItem;
      if (config.size) setSize(config.size);
      if (config.sponge) setSponge(config.sponge);
      if (config.filling) setFilling(config.filling);
      if (config.frosting) setFrosting(config.frosting);
      if (config.toppings) setToppings(config.toppings);
      if (config.message) setMessage(config.message);
    } else if (internalBaseProduct?.customDefaults) {
      const defaults = internalBaseProduct.customDefaults;
      if (defaults.sponge) setSponge(defaults.sponge);
      if (defaults.filling) setFilling(defaults.filling);
      if (defaults.frosting) setFrosting(defaults.frosting);
      if (defaults.toppings) setToppings(defaults.toppings);
      if (defaults.message) setMessage(defaults.message);
    } else if (internalBaseProduct) {
      // Basic defaults if no custom defaults provided for this base cake
      setSponge('Vanilla');
      setFilling('Chantilly Cream');
      setFrosting('Smooth Silk');
      setToppings([]);
      setMessage('');
    }
  }, [internalBaseProduct, editingItem]);

  const parsedBasePrice = useMemo(() => {
    if (editingItem && editingItem.basePrice) {
      return editingItem.basePrice;
    }
    if (internalBaseProduct && internalBaseProduct.price) {
      const match = String(internalBaseProduct.price).match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return 3000;
  }, [internalBaseProduct, editingItem]);

  const sizes = [
    { label: '1 kg', sub: 'Serves ~10', price: parsedBasePrice },
    { label: '2 kg', sub: 'Serves ~20', price: Math.floor(parsedBasePrice * 1.6) },
    { label: '3 kg', sub: 'Serves ~30', price: Math.floor(parsedBasePrice * 2.2) },
    { label: '5 kg', sub: 'Serves ~50', price: Math.floor(parsedBasePrice * 3.2) }
  ];

  const spongeOptions = [
    { name: 'Vanilla', sweetness: 70, richness: 40, texture: 80 },
    { name: 'Chocolate', sweetness: 60, richness: 90, texture: 70 },
    { name: 'Marble', sweetness: 65, richness: 65, texture: 75 },
    { name: 'Red Velvet', sweetness: 60, richness: 75, texture: 80 },
    { name: 'Amarula', sweetness: 50, richness: 85, texture: 65 },
    { name: 'Pina Colada', sweetness: 75, richness: 50, texture: 70 },
  ];

  const toggleTopping = (t: string) => {
    setToppings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const totals = useMemo(() => {
    const basePrice = sizes.find(s => s.label === size)?.price || parsedBasePrice;
    const toppingPrice = toppings.reduce((acc, t) => {
      const match = t.match(/\(\+\s*Kshs\.\s*(\d+)\)/);
      return acc + (match ? parseInt(match[1], 10) : 0);
    }, 0);
    return basePrice + toppingPrice; // Base combined calculation
  }, [size, toppings, sizes, parsedBasePrice]);

  const handleReserve = () => {
    const cartItem = {
      id: Date.now(),
      name: internalBaseProduct?.name || internalBaseProduct?.title || 'Custom Wincer Cake',
      img: internalBaseProduct?.img || "https://lh3.googleusercontent.com/aida-public/AB6AXuBB2T0GrzGb7HJOw35EWx672_lFRLrC7Q6ntjSuD-p2bCRYLAwOBQRj6OCFsnuyNY11yZw2AK0UqY91-Vy0tWh81GSYedNIZT5QGzL3n-WR5e1gZVK-baBPx0CmXHeB1GaAQUug0aSrbi6bsQmLxLEOLPdly_9nZJHf6E6j-NmrJ4AHBGAqGn9DquM_CtQ4Y5w4bbRmL7g3dxBlG4nXx8HBqOE1QoxrCq8bLORq3GNkcjKLz5I2LxXThlLkuhlMzebT0YcFo9SGyl4",
      basePrice: parsedBasePrice,
      config: {
        size,
        sponge,
        filling,
        frosting,
        toppings,
        message
      },
      price: totals
    };
    if (onAddToCart) {
      onAddToCart(cartItem);
    } else {
      setView('checkout');
    }
  };

  const profile = useMemo(() => {
    const selectedSponge = spongeOptions.find(s => s.name === sponge) || spongeOptions[0];
    let richnessBonus = 0;
    if (filling.includes('Ganache') || filling.includes('Caramel')) richnessBonus += 20;
    if (toppings.includes('Macarons (+ Kshs. 1000)')) richnessBonus += 10;
    
    return {
      sweetness: Math.min(100, selectedSponge.sweetness + (toppings.length * 2)),
      richness: Math.min(100, selectedSponge.richness + richnessBonus),
      texture: Math.min(100, selectedSponge.texture + (toppings.length * 5))
    };
  }, [sponge, filling, toppings]);

  if (!internalBaseProduct && !editingItem) {
    return (
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-xl max-w-7xl mx-auto px-8"
      >
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-serif text-secondary mb-4">Choose Your Canvas</h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto opacity-80 leading-relaxed font-sans">
            Start your masterpiece by selecting a base cake from our signature collection. You'll be able to customize it to your exquisite taste in the next step.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cakes.map((p, idx) => (
            <motion.div 
              key={p.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setInternalBaseProduct(p)}
              className="bg-primary-container/20 rounded-[2rem] border border-secondary/5 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={p.img} 
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <h3 className="font-serif text-2xl text-secondary mb-2 font-bold">{p.title}</h3>
                <p className="text-on-surface-variant font-medium opacity-80">{p.desc}</p>
                <div className="mt-6 flex justify-end">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-secondary group-hover:underline">Select as Base</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-xl max-w-7xl mx-auto px-8"
    >
      <section className="mb-12 text-center">
        <h1 className="text-5xl font-serif text-secondary mb-4">Design Your Masterpiece</h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto opacity-80 leading-relaxed font-sans">
          Every celebration deserves a unique touch. Follow our guide to create a bespoke custom cake tailored to your preferences.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Preview Canvas */}
        <div className="lg:col-span-7 lg:sticky lg:top-32">
          <div className="bg-primary-container/20 rounded-2xl p-8 border border-secondary/5 overflow-hidden">
            <div className="aspect-square relative flex items-center justify-center bg-white/60 rounded-xl shadow-inner border border-white overflow-hidden group">
              <motion.img 
                key={sponge}
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 0.9 }}
                alt="Custom Cake Preview" 
                className={`w-full h-full object-cover rounded-xl mix-blend-multiply transition-all duration-1000 ${
                  sponge === 'Rich Chocolate' ? 'brightness-75 sepia-[0.3]' : 
                  sponge === 'Lemon Zest' ? 'hue-rotate-15' : ''
                }`} 
                src={editingItem?.img || internalBaseProduct?.img || selectedProduct?.img || "https://lh3.googleusercontent.com/aida-public/AB6AXuBB2T0GrzGb7HJOw35EWx672_lFRLrC7Q6ntjSuD-p2bCRYLAwOBQRj6OCFsnuyNY11yZw2AK0UqY91-Vy0tWh81GSYedNIZT5QGzL3n-WR5e1gZVK-baBPx0CmXHeB1GaAQUug0aSrbi6bsQmLxLEOLPdly_9nZJHf6E6j-NmrJ4AHBGAqGn9DquM_CtQ4Y5w4bbRmL7g3dxBlG4nXx8HBqOE1QoxrCq8bLORq3GNkcjKLz5I2LxXThlLkuhlMzebT0YcFo9SGyl4"} 
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      key="topper"
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0, y: 20 }}
                      className="w-2/3 h-1/2 border-2 border-dashed border-secondary/30 rounded-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm shadow-xl p-6 text-center"
                    >
                      <Sparkles className="text-secondary w-8 h-8 mb-3" />
                      <p className="text-2xl font-serif text-secondary italic font-bold leading-tight">
                        "{message}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Overlay Toppings Icons (Representative) */}
              <div className="absolute top-8 left-8 flex flex-col gap-2">
                {toppings.map(t => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={t} 
                    className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm border border-secondary/10"
                  >
                    <Check className="w-3 h-3 text-secondary" />
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 p-8 bg-white/80 rounded-2xl border border-secondary/5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> Dynamic Flavor Profile
              </h4>
              <div className="space-y-6">
                {[
                  { label: 'Sweetness', val: profile.sweetness },
                  { label: 'Richness', val: profile.richness },
                  { label: 'Texture', val: profile.texture }
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-6">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant w-24 shrink-0">{stat.label}</span>
                    <div className="flex-1 h-2 bg-secondary/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.val}%` }}
                        className="h-full bg-secondary rounded-full"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-secondary w-8">{stat.val}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Configuration Panel */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white rounded-2xl p-8 border border-secondary/5 shadow-sm">
            <h3 className="text-xl font-serif text-secondary mb-6 font-bold">1. Select Size</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {sizes.map(s => (
                <button 
                  key={s.label}
                  onClick={() => setSize(s.label)}
                  className={`p-6 border-2 rounded-2xl text-left transition-all group ${
                    size === s.label 
                      ? 'border-secondary bg-primary-container shadow-md' 
                      : 'border-secondary/10 hover:border-secondary/40 h-full'
                  }`}
                >
                  <span className={`block text-2xl font-serif font-bold ${size === s.label ? 'text-secondary' : 'text-on-surface'}`}>{s.label}</span>
                  <span className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/60 mt-1">{s.sub}</span>
                  <span className={`block font-bold mt-4 ${size === s.label ? 'text-secondary' : 'text-on-surface'}`}>Kshs. {s.price}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 border border-secondary/5 shadow-sm">
            <h3 className="text-xl font-serif text-secondary mb-6 font-bold">2. Sponge & Filling</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-on-surface-variant/60 mb-4 block">Sponge Base</label>
                <div className="flex flex-wrap gap-2">
                  {spongeOptions.map(opt => (
                    <button 
                      key={opt.name} 
                      onClick={() => setSponge(opt.name)}
                      className={`px-6 py-3 rounded-full text-xs font-bold border transition-all ${
                        sponge === opt.name 
                          ? 'bg-secondary text-white border-secondary shadow-lg scale-105' 
                          : 'bg-surface-container-high text-on-surface-variant border-transparent hover:bg-secondary/10'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-on-surface-variant/60 mb-4 block">Premium Filling</label>
                <select 
                  value={filling}
                  onChange={(e) => setFilling(e.target.value)}
                  className="w-full bg-surface-container-low border border-secondary/10 rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-secondary focus:border-secondary outline-none appearance-none"
                >
                  <option>Chantilly Cream</option>
                  <option>Raspberry Coulis</option>
                  <option>Salted Caramel</option>
                  <option>Dark Chocolate Ganache</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 border border-secondary/5 shadow-sm">
            <h3 className="text-xl font-serif text-secondary mb-6 font-bold">3. Frosting Style</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Smooth Silk', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-c7x4VMbG63e1-fvboeNzf9fbDHznbGucUaYKoiE0IQSAJBKsrRzWmmo6WNY2FV9spDW9yNglGY1I7hatuXO6rj3UInzCmLdvw2Nzty0heW4nUkrjCQJbpzEftv_8OICkTzmxGaE7N2ecL1G5kBu9H9LVCKCqNlbdoHNsaXzqLTmQtuMq0AA8o8Hx2zNxRyIKQ0ZFE2gzyfUEu1tezmVo1ZYB-PqqMPDqSd-ySEA7rrjrj6Bfp3GDdoIhsxsZMAVBe-zpNkBT6dk' },
                { name: 'Rustic Textured', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC24HXI4ub5Nb-MdNeeWsVO1goLnUyCaPgWHQGZUtlMCDeTYo-aNjdML3TvjbD_ui0sO1BGJwUm7hSdqN1mml6wEjJhrJqPgx9LEHE7HivFy4-lTdF65ED3zhA8HIf__E1rSWNoNQ7cgyuJYL-57WZmftRkza0UM5HJeM0HhbuYKXhokY3djZKtgMTxp8yk3oYRmrWQLunHFkvsg_ZB8sUa-l1Sc3jJ-zvO5OPX2H-yexSBOFfEJL8aERdJw9zKZKfmYwDxGQzff4k' }
              ].map(opt => (
                <div 
                  key={opt.name}
                  onClick={() => setFrosting(opt.name)}
                  className={`relative group cursor-pointer border-2 rounded-xl overflow-hidden shadow-sm transition-all ${
                    frosting === opt.name ? 'border-secondary scale-105 z-10' : 'border-transparent opacity-60 grayscale'
                  }`}
                >
                  <img className="w-full h-32 object-cover" src={opt.img} alt={opt.name} />
                  <div className={`p-3 text-center text-[10px] font-bold uppercase tracking-widest ${
                    frosting === opt.name ? 'bg-secondary text-white' : 'bg-white text-on-surface'
                  }`}>
                    {opt.name}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 border border-secondary/5 shadow-sm">
            <h3 className="text-xl font-serif text-secondary mb-6 font-bold">4. Custom Toppings</h3>
            <div className="flex flex-wrap gap-2">
              {['Gold Leaf (+ Kshs. 500)', 'Fresh Berries (+ Kshs. 800)', 'Edible Florals (+ Kshs. 1200)', 'Macarons (+ Kshs. 1000)'].map(topping => (
                <button 
                  key={topping} 
                  onClick={() => toggleTopping(topping)}
                  className={`flex items-center gap-3 px-6 py-3 border rounded-full transition-all text-xs font-bold shadow-sm ${
                    toppings.includes(topping) 
                      ? 'border-secondary bg-primary-container text-secondary' 
                      : 'border-secondary/10 bg-white hover:border-secondary/40'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    toppings.includes(topping) ? 'bg-secondary border-secondary' : 'border-secondary/20'
                  }`}>
                    {toppings.includes(topping) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {topping}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8 border border-secondary/5 shadow-sm">
            <h3 className="text-xl font-serif text-secondary mb-6 font-bold">5. Custom Topper Message</h3>
            <div className="relative">
              <input 
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 25))}
                className="w-full bg-surface-container-low border border-secondary/10 rounded-xl p-5 font-bold text-sm focus:ring-2 focus:ring-secondary/20 outline-none placeholder:text-stone-300 font-serif" 
                placeholder="e.g., Happy Birthday Isabella" 
                type="text"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-secondary/40">
                {message.length}/25
              </div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 mt-4">
              Hand-piped on a white chocolate plaque.
            </p>
          </section>

          <div className="p-8 md:p-10 bg-secondary text-on-secondary rounded-[2.5rem] macaron-raised shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.4em] opacity-70 mb-2">Estimate</span>
                <span className="text-4xl md:text-5xl font-serif font-bold text-white">Kshs. {totals}</span>
              </div>
              <button 
                onClick={handleReserve}
                className="w-full md:w-auto bg-white text-secondary px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl group text-center"
              >
                {editingItem ? 'Update Selection' : 'Place Your Order'}
              </button>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest opacity-80 border-t border-white/10 pt-8">
              <Calendar className="w-4 h-4" />
              <span>Earliest Curated Pick-up: Thursday, Nov 21st</span>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

