import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Trash2, 
  Wand2, 
  ArrowRight, 
  ChevronRight, 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Sparkles, 
  Check, 
  X,
  Compass,
  Lock,
  Truck,
  ShieldCheck
} from 'lucide-react';

export default function Cart({ 
  setView, 
  cart, 
  onAddToCart, 
  onRemove, 
  onEdit, 
  savedItems, 
  onRemoveSaved, 
  onAddSavedToCart,
  onClearCart
}: { 
  setView: (v: string) => void; 
  cart: any[]; 
  onAddToCart: (item: any) => void;
  onRemove: (id: number) => void;
  onEdit: (item: any) => void;
  savedItems: any[];
  onRemoveSaved: (id: number) => void;
  onAddSavedToCart: (item: any) => void;
  onClearCart?: () => void;
}) {

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleShareSaved = (item: any) => {
    const toppingsStr = item.config.toppings.length > 0 ? ` with ${item.config.toppings.join(', ')}` : '';
    const shareText = `Check out my custom ${item.name} design! ${item.config.size} • ${item.config.sponge} Sponge${toppingsStr}. Design yours at ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    showToast('Design link copied to clipboard!');
  };

  // Grouping identical items in the cart
  const groupedCart = useMemo(() => {
    const groups: any[] = [];
    cart.forEach(item => {
      const configKey = JSON.stringify(item.config || {});
      const existing = groups.find(g => JSON.stringify(g.config || {}) === configKey && g.name === item.name);
      if (existing) {
        existing.quantity += 1;
        existing.ids.push(item.id);
        existing.totalPrice += item.price;
      } else {
        groups.push({
          ...item,
          quantity: 1,
          ids: [item.id],
          totalPrice: item.price
        });
      }
    });
    return groups;
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = cart.length > 0 ? 500 : 0;
  const packagingFee = cart.length > 0 ? 200 : 0;
  const total = subtotal + deliveryFee + packagingFee;

  const handleIncreaseQty = (item: any) => {
    // Clone and add to cart
    onAddToCart({
      ...item,
      id: Date.now() + Math.floor(Math.random() * 1000)
    });
    showToast(`Added another ${item.name} to cart.`);
  };

  const handleDecreaseQty = (item: any) => {
    if (item.ids && item.ids.length > 0) {
      // Remove one item by id
      onRemove(item.ids[0]);
      showToast(`Removed one ${item.name} from cart.`);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-8"
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-secondary text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-white/20"
          >
            <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
        <span 
          onClick={() => setView('home')}
          className="hover:text-secondary cursor-pointer transition-colors"
        >Collections</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-secondary">My Cart</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-serif text-secondary mb-2 font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-sm sm:text-base text-on-surface-variant font-medium opacity-70">
            Review your custom recipes, adjust quantites, and inspect your wishlist below.
          </p>
        </div>
        {cart.length > 0 && onClearCart && (
          <button 
            onClick={onClearCart}
            className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors border-b border-dashed border-red-500/30 pb-1"
          >
            Clear All Items
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: CART ITEMS & SAVED ITEMS */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Cart segment */}
          <section className="bg-primary-container/20 rounded-3xl p-6 sm:p-8 border border-secondary/5 shadow-sm">
            <h2 className="text-xl font-serif text-secondary mb-8 flex items-center gap-3 font-bold">
              <ShoppingBag className="w-5 h-5" />
              Selected Delicacies ({cart.length})
            </h2>

            <div className="space-y-8">
              {groupedCart.map((item) => (
                <div key={`${item.name}-${JSON.stringify(item.config)}`} className="flex flex-col sm:flex-row gap-6 items-start border-b border-secondary/15 pb-8 last:border-0 last:pb-0">
                  <div className="w-full sm:w-32 aspect-square rounded-xl overflow-hidden shadow-md bg-stone-100 shrink-0 border border-secondary/10 relative">
                    {item.img ? (
                      <img 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        src={item.img} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🍰</div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="text-xl font-serif text-secondary font-bold">{item.name}</h3>
                      <span className="text-lg font-bold text-secondary">{`KShs. ${item.totalPrice.toLocaleString()}`}</span>
                    </div>

                    <p className="text-xs text-on-surface-variant font-medium opacity-80 mb-4 leading-relaxed">
                      {item.config.size} • {item.config.sponge} Base • {item.config.filling} • {item.config.frosting} frosting
                      {item.config.message && ` • "${item.config.message}"`}
                    </p>

                    {item.config.toppings && item.config.toppings.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {item.config.toppings.map((tp: string) => (
                          <span key={tp} className="px-2.5 py-1 bg-surface-container rounded-full text-[10px] font-bold text-secondary border border-secondary/5 uppercase tracking-wider">
                            {tp.split('(')[0].trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-secondary/20 rounded-lg bg-surface">
                        <button 
                          onClick={() => handleDecreaseQty(item)}
                          className="p-1 px-2 hover:bg-secondary/5 transition-colors"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5 text-secondary" />
                        </button>
                        <span className="px-4 text-xs font-bold text-secondary min-w-[32px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleIncreaseQty(item)}
                          className="p-1 px-2 hover:bg-secondary/5 transition-colors"
                          title="Increase Quantity"
                        >
                          <Plus className="w-3.5 h-3.5 text-secondary" />
                        </button>
                      </div>

                      {/* Edit / Remove shortcuts */}
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => onEdit(item)}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-secondary/60 hover:text-secondary transition-colors"
                          title="Recustomize"
                        >
                          <Wand2 className="w-3.5 h-3.5" /> Configure
                        </button>
                        <button 
                          onClick={() => {
                            if (item.ids) {
                              item.ids.forEach((id: number) => onRemove(id));
                            }
                            showToast(`Removed all ${item.name} from cart`);
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-4 filter grayscale opacity-40">🛒</span>
                  <p className="text-on-surface-variant font-serif italic text-lg opacity-60 mb-6">Your shopping bag is waiting to be filled.</p>
                  <button 
                    onClick={() => setView('catalog')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    <Compass className="w-4 h-4" /> Browse Collections
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* WISHLIST / SAVED ITEMS SEGMENT */}
          <section className="bg-surface-container/60 rounded-3xl p-6 sm:p-8 border border-secondary/5">
            <h2 className="text-xl font-serif text-secondary mb-8 flex items-center gap-3 font-bold">
              <Heart className="w-5 h-5 fill-secondary text-secondary" />
              Saved Masterpieces ({savedItems.length})
            </h2>

            <div className="space-y-6">
              {savedItems.map((item) => {
                const toppingsStr = item.config?.toppings?.length > 0 
                  ? item.config.toppings.map((t: string) => t.split('(')[0].trim()).join(', ') 
                  : 'No extra toppings';

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 items-center p-5 bg-background rounded-2xl border border-secondary/5 relative overflow-hidden shadow-sm group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-primary-container/20 border border-secondary/5 shrink-0 flex items-center justify-center text-2xl relative">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span>🎂</span>
                      )}
                    </div>

                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="font-serif text-lg text-secondary font-bold">{item.name}</h3>
                      <p className="text-xs text-on-surface-variant/80 mt-1">
                        Sponge: <span className="font-bold text-secondary">{item.config?.sponge}</span> • Filling: <span className="font-bold text-secondary">{item.config?.filling}</span> • Size: <span className="font-bold text-secondary">{item.config?.size}</span>
                      </p>
                      <p className="text-[10px] text-on-surface-variant/40 mt-1 uppercase tracking-wider font-bold truncate max-w-md">
                        {toppingsStr}
                      </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 items-center justify-center w-full sm:w-auto">
                      <button 
                        onClick={() => {
                          onAddSavedToCart(item);
                          showToast(`Moved ${item.name} into your active cart!`);
                        }}
                        className="px-4 py-2.5 bg-pink-500 text-white rounded-lg font-bold text-[10px] tracking-widest uppercase hover:bg-pink-600 transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </button>

                      <button 
                        onClick={() => handleShareSaved(item)}
                        className="p-2.5 border border-secondary/20 hover:border-secondary rounded-lg text-secondary transition-colors"
                        title="Share Saved Design"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => {
                          onRemoveSaved(item.id);
                          showToast('Item removed from Saved List');
                        }}
                        className="p-2.5 border border-red-100 hover:border-red-300 rounded-lg text-red-400 hover:text-red-500 transition-colors"
                        title="Remove Saved Design"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {savedItems.length === 0 && (
                <div className="text-center py-10 border border-dashed border-secondary/10 rounded-2xl bg-secondary/5">
                  <p className="text-sm font-serif italic text-on-surface-variant/60">No custom designs stored here yet.</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 mt-1">
                    Press the heart button on the design board to record your creations!
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: STICKY BILL SUMMARY */}
        <div className="lg:col-span-4 lg:sticky lg:top-32">
          
          <div className="bg-surface rounded-3xl p-8 border border-secondary/15 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            
            <h2 className="text-2xl font-serif text-secondary mb-8 font-bold">Cart Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-serif italic opacity-75">Subtotal</span>
                <span className="font-bold text-on-surface">KShs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-serif italic opacity-75">Nairobi Delivery</span>
                <span className="font-bold text-on-surface">KShs {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-serif italic opacity-75">Signature Box Packaging</span>
                <span className="font-bold text-on-surface">KShs {packagingFee.toLocaleString()}</span>
              </div>
              
              <div className="h-px bg-secondary/10 my-4"></div>
              
              <div className="flex justify-between items-end">
                <span className="font-serif font-bold text-lg text-secondary">Grand Total</span>
                <span className="font-serif font-bold text-2xl text-secondary">KShs {total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setView('checkout')}
              disabled={cart.length === 0}
              className="w-full bg-secondary text-white py-4.5 rounded-xl font-bold tracking-widest uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2 group"
            >
              Confirm & Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {cart.length > 0 && (
              <p className="text-[10px] text-center font-bold uppercase tracking-wider text-secondary/60 mt-4 leading-relaxed">
                🍰 Ready for the next coordinates? We'll capture deliveries and deposit options instantly.
              </p>
            )}

            <div className="border-t border-secondary/10 mt-8 pt-6 space-y-4">
              <div className="flex gap-4 items-start">
                <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Wincer Guarantee</h4>
                  <p className="text-[10px] text-on-surface-variant/70 leading-relaxed mt-0.5">Custom elements prepared under absolute sensory excellence guidelines.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Truck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-widest">Secure Conveyance</h4>
                  <p className="text-[10px] text-on-surface-variant/70 leading-relaxed mt-0.5">Refrigerated trucks ensure your creation is delivered perfectly chilled.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </motion.main>
  );
}
