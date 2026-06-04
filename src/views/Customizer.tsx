import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Check, Wand2, Minus, Plus, Heart, ChevronDown, X } from 'lucide-react';

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
  const [dietary, setDietary] = useState<'standard' | 'eggless' | 'vegan'>('standard');
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);
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
      setDietary(config.dietary || 'standard');
      setSketchUrl(config.sketchUrl || null);
    } else if (internalBaseProduct?.customDefaults) {
      const defaults = internalBaseProduct.customDefaults;
      setSponge(defaults.sponge || 'Vanilla');
      setFilling(defaults.filling || 'Chantilly Cream');
      setFrosting(defaults.frosting || 'Smooth Silk');
      setToppings(defaults.toppings || []);
      setMessage(defaults.message || '');
      setDietary(defaults.dietary || 'standard');
      setSketchUrl(defaults.sketchUrl || null);
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
  const dietaryFee = dietary === 'eggless' ? 500 : dietary === 'vegan' ? 800 : 0;
  const itemTotal = basePrice + toppingPrice + dietaryFee;
  const total = itemTotal * quantity;

  const getCartItem = () => {
    return {
      id: Date.now(),
      name: internalBaseProduct?.title || editingItem?.name || 'Custom Cake',
      img: internalBaseProduct?.img || editingItem?.img || null,
      basePrice: parsedBasePrice,
      config: { size, sponge, filling, frosting, toppings, message, dietary, sketchUrl },
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

  const handleWhatsAppInquiry = () => {
    const cakeName = internalBaseProduct?.title || editingItem?.name || 'Custom Cake';
    const toppingsStr = toppings.length > 0 ? toppings.map(t => t.split('(')[0].trim()).join(', ') : 'None';
    
    const text = `Hi Wincer Cake House! I would like to inquire about this custom cake:\n\n` +
                 `*Cake:* ${cakeName}\n` +
                 `*Size:* ${size}\n` +
                 `*Sponge:* ${sponge}\n` +
                 `*Toppings:* ${toppingsStr}\n` +
                 `*Custom Message:* ${message ? `"${message}"` : 'None'}\n` +
                 `*Estimated Total:* KShs ${total.toLocaleString()}\n\n` +
                 `Please let me know how to proceed. Thanks!`;
                 
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/254722632717?text=${encodedText}`, '_blank');
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
              src={internalBaseProduct?.img || editingItem?.img || "https://via.placeholder.com/500"}
              alt={internalBaseProduct?.title || editingItem?.name || "Cake"}
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
              <span className="text-3xl font-bold text-secondary">KShs {itemTotal.toLocaleString()}</span>
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

            {/* DIETARY PREFERENCES */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Dietary Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'standard', label: 'Standard', fee: 0 },
                  { value: 'eggless', label: 'Eggless', fee: 500 },
                  { value: 'vegan', label: 'Vegan', fee: 800 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDietary(opt.value as any)}
                    className={`px-3 py-2.5 border rounded-lg text-xs font-bold transition-all transition-colors flex flex-col items-center justify-center ${
                      dietary === opt.value
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-secondary/20 bg-surface hover:border-secondary/50 text-on-surface'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[9px] font-medium opacity-65">
                      {opt.fee > 0 ? `+ Kshs. ${opt.fee}` : 'Free'}
                    </span>
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

            {/* DESIGN SKETCH UPLOAD */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-secondary/60 block mb-3">
                Inspiration Sketch / Design Photo (Optional)
              </label>
              <div className="flex flex-col gap-3">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSketchUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden" 
                  id="sketch-upload-file"
                />
                <div className="flex gap-4 items-center">
                  <label 
                    htmlFor="sketch-upload-file"
                    className="px-4 py-3 bg-surface border-2 border-dashed border-secondary/20 hover:border-secondary/40 rounded-xl cursor-pointer text-xs font-bold text-secondary flex items-center gap-2 transition-all"
                  >
                    Upload Design File / Screenshot
                  </label>
                  {sketchUrl && (
                    <div className="flex items-center gap-2 bg-secondary/5 rounded-xl px-3 py-1.5 border border-secondary/10">
                      <img src={sketchUrl} alt="Sketch" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] text-secondary font-bold uppercase">Ready!</span>
                      <button 
                        type="button"
                        onClick={() => setSketchUrl(null)}
                        className="text-red-500 hover:text-red-700 font-bold ml-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
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
                className="px-6 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-secondary-container/80 active:scale-95 transition-all shadow-lg cursor-pointer"
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
                onClick={handleWhatsAppInquiry}
                className="flex-1 py-3 bg-[#25D366] text-white font-bold text-sm rounded-lg hover:bg-[#20ba5a] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-green-500/20 border-none"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg> WhatsApp Inquiry
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
                src={internalBaseProduct?.img || editingItem?.img || null}
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