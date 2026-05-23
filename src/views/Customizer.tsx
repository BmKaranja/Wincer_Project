import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Check, Wand2, Minus, Plus, Share2, Heart, ChevronDown, X } from 'lucide-react';

export default function Customizer({ 
  setView, 
  selectedProduct, 
  onAddToCart, 
  onBuyNow, 
  onSave, 
  savedItems = [], 
  editingItem, 
  cakes = [] 
}: { 
  setView: (v: string) => void, 
  selectedProduct?: any, 
  onAddToCart?: (item: any) => void, 
  onBuyNow?: (item: any) => void, 
  onSave?: (item: any) => void, 
  savedItems?: any[], 
  editingItem?: any, 
  cakes?: any[] 
}) {
  const [internalBaseProduct, setInternalBaseProduct] = useState<any>(selectedProduct);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('1 kg');
  const [sponge, setSponge] = useState('Vanilla');
  const [filling, setFilling] = useState('Chantilly Cream');
  const [frosting, setFrosting] = useState('Smooth Silk');
  const [toppings, setToppings] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [showZoom, setShowZoom] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastText(text);
    setTimeout(() => {
      setToastText(null);
    }, 3000);
  };

  useEffect(() => {
    if (editingItem) {
      const { config } = editingItem;
      setSize(config.size || '1 kg');
      setSponge(config.sponge || 'Vanilla');
      setFilling(config.filling || 'Chantilly Cream');
      setFrosting(config.frosting || 'Smooth Silk');
      setToppings(config.toppings || []);
      setMessage(config.message || '');
    } else if (internalBaseProduct?.customDefaults) {
      const defaults = internalBaseProduct.customDefaults;
      setSponge(defaults.sponge || 'Vanilla');
      setFilling(defaults.filling || 'Chantilly Cream');
      setFrosting(defaults.frosting || 'Smooth Silk');
      setToppings(defaults.toppings || []);
      setMessage(defaults.message || '');
    }
  }, [internalBaseProduct, editingItem]);

  const parsedBasePrice = useMemo(() => {
    if (editingItem?.basePrice) return editingItem.basePrice;
    if (internalBaseProduct?.price) {
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
    { name: 'Vanilla', color: 'from-yellow-100' },
    { name: 'Chocolate', color: 'from-amber-900' },
    { name: 'Marble', color: 'from-yellow-700' },
    { name: 'Red Velvet', color: 'from-red-800' },
    { name: 'Amarula', color: 'from-amber-700' },
    { name: 'Pina Colada', color: 'from-yellow-200' },
  ];

  const toggleTopping = (t: string) => {
    setToppings(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const basePrice = sizes.find(s => s.label === size)?.price || parsedBasePrice;
  const toppingPrice = toppings.reduce((acc, t) => {
    const match = t.match(/\(\+\s*Kshs\.\s*(\d+)\)/);
    return acc + (match ? parseInt(match[1], 10) : 0);
  }, 0);
  const itemTotal = basePrice + toppingPrice;
  const total = itemTotal * quantity;

  const getCartItem = () => {
    return {
      id: Date.now(),
      name: internalBaseProduct?.title || 'Custom Cake',
      img: internalBaseProduct?.img || "",
      basePrice: parsedBasePrice,
      config: { size, sponge, filling, frosting, toppings, message },
      price: itemTotal
    };
  };

  const handleAddToCart = () => {
    const cartItem = getCartItem();
    if (onAddToCart) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart({ ...cartItem, id: cartItem.id + i });
      }
    }
  };

  const handleBuyNowClick = () => {
    const cartItem = getCartItem();
    if (onBuyNow) {
      for (let i = 0; i < quantity; i++) {
        onBuyNow({ ...cartItem, id: cartItem.id + i });
      }
    } else if (onAddToCart) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart({ ...cartItem, id: cartItem.id + i });
      }
      setView('checkout');
    }
  };

  const handleSaveClick = () => {
    const cartItem = getCartItem();
    if (onSave) {
      onSave(cartItem);
      showToast('Masterpiece saved to your Wishlist!');
    }
  };

  const handleShareClick = () => {
    const toppingsStr = toppings.length > 0 ? ` with ${toppings.map(t => t.split('(')[0].trim()).join(', ')}` : '';
    const shareText = `Check out my custom ${internalBaseProduct?.title || 'Wincer Cake'} design! Size: ${size}, Sponge: ${sponge}, Filling: ${filling}${toppingsStr}. Customize your own at ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    showToast('Custom design specifications copied to clipboard!');
  };

  const isSaved = useMemo(() => {
    if (!savedItems) return false;
    return savedItems.some(item => 
      item.name === (internalBaseProduct?.title || 'Custom Cake') &&
      JSON.stringify(item.config) === JSON.stringify({ size, sponge, filling, frosting, toppings, message })
    );
  }, [savedItems, internalBaseProduct, size, sponge, filling, frosting, toppings, message]);


  if (!internalBaseProduct && !editingItem) {
    return (
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-xl max-w-7xl mx-auto px-8"
      >
        <section className="mb-12 text-center">
          <h1 className="text-5xl font-serif text-secondary mb-4">Choose Your Base</h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto opacity-80">
            Select a cake to customize
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
              className="bg-primary-container/20 rounded-2xl border border-secondary/5 overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={p.img} 
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <h3 className="font-serif text-2xl text-secondary mb-2 font-bold">{p.title}</h3>
                <p className="text-on-surface-variant font-medium opacity-80 text-sm">{p.desc}</p>
                <div className="mt-6 flex justify-between items-center">
                  <span className="font-bold text-secondary">{p.price}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-secondary group-hover:underline">Select</span>
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
      className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-8"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-secondary/60">
        <button onClick={() => setView('catalog')} className="hover:text-secondary">Collections</button>
        <span>/</span>
        <span className="text-secondary">{internalBaseProduct?.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* LEFT: IMAGE SECTION */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <motion.div 
            layoutId="main-image"
            className="relative rounded-2xl overflow-hidden bg-primary-container/30 border border-secondary/10 aspect-square flex items-center justify-center group cursor-zoom-in"
            onClick={() => setShowZoom(true)}
          >
            <motion.img 
              key={`${sponge}-${frosting}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              src={internalBaseProduct?.img || "https://via.placeholder.com/500"}
              alt={internalBaseProduct?.title}
              className="w-full h-full object-cover"
              style={{
                filter: sponge === 'Chocolate' ? 'hue-rotate(-10deg) saturate(1.1)' : 
                        sponge === 'Red Velvet' ? 'hue-rotate(-20deg) saturate(1.2)' : 'none'
              }}
            />

            {/* Discount Badge */}
            {internalBaseProduct?.tag?.toLowerCase().includes('bestseller') && (
              <div className="absolute top-4 right-4 bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                -10%
              </div>
            )}

            {/* Zoom Icon */}
            <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-full shadow-lg group-hover:bg-white transition-colors">
              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 13H7" />
              </svg>
            </div>
          </motion.div>

          {/* Gallery Thumbnails (Optional) */}
          <div className="flex gap-3">
            {[1, 2].map(i => (
              <div key={i} className="w-20 h-20 rounded-lg bg-secondary/5 border border-secondary/10 cursor-pointer hover:border-secondary/30 transition-colors overflow-hidden">
                <img src={internalBaseProduct?.img} alt="thumbnail" className="w-full h-full object-cover opacity-60 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO & CUSTOMIZATION */}
        <div className="flex flex-col gap-8">
          {/* Product Title & Price */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-secondary font-bold mb-2">
              {internalBaseProduct?.title}
            </h1>
            <p className="text-on-surface-variant font-medium opacity-80 mb-6 leading-relaxed">
              {internalBaseProduct?.desc}
            </p>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-pink-500">KShs {itemTotal.toLocaleString()}</span>
              {basePrice !== itemTotal && (
                <span className="text-lg text-secondary/40 line-through">KShs {basePrice.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* CUSTOMIZATION OPTIONS */}
          <div className="space-y-6 border-y border-secondary/10 py-6">
            {/* SIZE DROPDOWN */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Cake Size
              </label>
              <div className="relative">
                <select 
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-secondary/20 rounded-lg appearance-none font-medium text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none"
                >
                  {sizes.map(s => (
                    <option key={s.label} value={s.label}>
                      {s.label} ({s.sub}) - KShs {s.price}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40 pointer-events-none" />
              </div>
            </div>

            {/* SPONGE TYPE */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Sponge Base
              </label>
              <div className="flex flex-wrap gap-2">
                {spongeOptions.map(opt => (
                  <button 
                    key={opt.name}
                    onClick={() => setSponge(opt.name)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      sponge === opt.name
                        ? 'bg-secondary text-white border-secondary shadow-lg'
                        : 'bg-surface border-secondary/20 text-on-surface hover:border-secondary/50'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FILLING */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Filling
              </label>
              <div className="relative">
                <select 
                  value={filling}
                  onChange={(e) => setFilling(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-secondary/20 rounded-lg appearance-none font-medium text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none"
                >
                  <option>Chantilly Cream</option>
                  <option>Raspberry Coulis</option>
                  <option>Salted Caramel Ganache</option>
                  <option>Dark Chocolate Ganache</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40 pointer-events-none" />
              </div>
            </div>

            {/* FROSTING */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Frosting Style
              </label>
              <div className="flex gap-3">
                {['Smooth Silk', 'Rustic Textured'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFrosting(f)}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      frosting === f
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-secondary/20 bg-surface text-on-surface hover:border-secondary/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* TOPPINGS */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Add Toppings
              </label>
              <div className="flex flex-wrap gap-2">
                {['Gold Leaf (+ Kshs. 500)', 'Fresh Berries (+ Kshs. 800)', 'Edible Florals (+ Kshs. 1200)', 'Macarons (+ Kshs. 1000)'].map(topping => (
                  <button 
                    key={topping}
                    onClick={() => toggleTopping(topping)}
                    className={`px-3 py-2 border rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      toppings.includes(topping)
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-secondary/20 bg-surface text-on-surface hover:border-secondary/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      toppings.includes(topping) ? 'bg-secondary border-secondary' : 'border-secondary/30'
                    }`}>
                      {toppings.includes(topping) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {topping}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM MESSAGE */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Custom Message (Optional)
              </label>
              <div className="relative">
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 25))}
                  placeholder="Add a personal message..."
                  className="w-full px-4 py-3 bg-background border border-secondary/20 rounded-lg font-medium text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/10 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-secondary/40">
                  {message.length}/25
                </span>
              </div>
            </div>
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold uppercase tracking-widest text-secondary/60">Quantity:</span>
              <div className="flex items-center border border-secondary/20 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-secondary/5 transition-colors"
                >
                  <Minus className="w-4 h-4 text-secondary" />
                </button>
                <span className="px-6 py-2 text-center font-bold text-secondary min-w-[60px]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-secondary/5 transition-colors"
                >
                  <Plus className="w-4 h-4 text-secondary" />
                </button>
              </div>
            </div>

            {/* PRICE SUMMARY */}
            <div className="bg-secondary/5 p-4 rounded-lg space-y-2 border border-secondary/10">
              <div className="flex justify-between text-sm">
                <span className="text-secondary/70">Per Cake</span>
                <span className="font-bold text-secondary">KShs {itemTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary/70">Quantity</span>
                <span className="font-bold text-secondary">x{quantity}</span>
              </div>
              <div className="h-px bg-secondary/10 my-2"></div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-on-surface">Total</span>
                <span className="font-serif font-bold text-secondary">KShs {total.toLocaleString()}</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={handleAddToCart}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-pink-600 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNowClick}
                className="px-6 py-3 bg-secondary text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-stone-800 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* SECONDARY ACTIONS */}
            <div className="flex gap-3">
              <button 
                onClick={handleSaveClick}
                className={`flex-1 py-3 border rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isSaved 
                    ? 'border-pink-500 bg-pink-500/10 text-pink-600' 
                    : 'border-secondary/20 text-secondary hover:bg-secondary/5'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} /> {isSaved ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={handleShareClick}
                className="flex-1 py-3 border border-secondary/20 rounded-lg text-secondary font-bold text-sm hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="border-t border-secondary/10 pt-6 space-y-3 text-sm">
            <div>
              <span className="font-bold text-secondary/60">SKU:</span>
              <span className="text-secondary/70 ml-2">CAKE-{internalBaseProduct?.id}</span>
            </div>
            <div>
              <span className="font-bold text-secondary/60">Categories:</span>
              <span className="text-secondary/70 ml-2">{sponge}, {frosting}</span>
            </div>
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary/60 block mb-2">Flavor Profile:</span>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Richness</span>
                    <span className="font-bold text-secondary">85%</span>
                  </div>
                  <div className="h-1.5 bg-secondary/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      className="h-full bg-secondary rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ZOOM MODAL */}
      <AnimatePresence>
        {showZoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowZoom(false)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
            >
              <button 
                onClick={() => setShowZoom(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={internalBaseProduct?.img}
                alt="zoomed"
                className="w-full rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Design Toast Popup */}
      <AnimatePresence>
        {toastText && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-white/20"
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-bold uppercase tracking-widest">{toastText}</span>
            <button onClick={() => setToastText(null)} className="ml-2 hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}