import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, UtensilsCrossed, Calendar, CreditCard, PlusCircle, Lock, ShieldCheck, Truck, ArrowRight, CheckCircle2, X, Wand2 } from 'lucide-react';

export default function Checkout({ setView, cart, onOrderPlaced, onEdit, onRemove }: { 
  setView: (v: string) => void, 
  cart: any[], 
  onOrderPlaced: () => void,
  onEdit: (item: any) => void,
  onRemove: (id: number) => void
}) {
  const [isSuccess, setIsSuccess] = useState(false);

  // Delivery details state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState('Morning (09:00 - 12:00)');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const isFormValid = deliveryDate.trim() !== '' && address.trim() !== '' && city.trim() !== '' && postalCode.trim() !== '';

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = cart.length > 0 ? 15 : 0;
  const packagingFee = cart.length > 0 ? 5 : 0;
  const total = subtotal + deliveryFee + packagingFee;

  const handlePlaceOrder = () => {
    setIsSuccess(true);
    onOrderPlaced();
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-24 max-w-7xl mx-auto px-8"
    >
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-secondary/40 backdrop-blur-md"
              onClick={() => {
                setIsSuccess(false);
                setView('home');
              }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl relative z-10 text-center"
            >
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setView('home');
                }}
                className="absolute top-8 right-8 text-secondary/20 hover:text-secondary transition-colors"
                id="close-success-modal"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-secondary" />
              </div>
              
              <h2 className="text-4xl font-serif text-secondary mb-4 font-bold">Order Confirmed</h2>
              <p className="text-on-surface-variant font-serif italic text-lg mb-10 opacity-70">
                Your artisan cake is being curated with precision and will be on its way shortly.
              </p>
              
              <button 
                onClick={() => setView('home')}
                className="w-full bg-secondary text-white py-5 rounded-2xl font-bold tracking-[0.3em] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all text-xs"
                id="return-home-button"
              >
                Return to Collections
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Breadcrumbs */}
      <nav className="mb-12 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
        <span 
          onClick={() => setView('home')}
          className="hover:text-secondary cursor-pointer transition-colors"
        >Collections</span>
        <ChevronRight className="w-3 h-3" />
        <span 
          onClick={() => setView('home')}
          className="hover:text-secondary cursor-pointer transition-colors"
        >Cart</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-secondary">Checkout</span>
      </nav>

      <h1 className="text-5xl font-serif text-secondary mb-12 font-bold tracking-tight">Complete Your Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          {/* Order Summary Card */}
          <section className="bg-primary-container p-8 rounded-3xl border border-secondary/5 diffusion-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h2 className="text-xl font-serif text-secondary mb-8 flex items-center gap-4 font-bold">
              <UtensilsCrossed className="w-6 h-6" />
              The Selection ({cart.length})
            </h2>
            
            <div className="space-y-12">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="w-full md:w-40 aspect-square rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-4 border-white">
                    <img 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                      src={item.img} 
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-serif text-secondary font-bold">{item.name}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-secondary font-sans">${item.price}.00</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2 hover:bg-secondary/5 rounded-full transition-colors text-secondary/40 hover:text-secondary"
                            title="Edit"
                          >
                            <Wand2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onRemove(item.id)}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-300 hover:text-red-500"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-on-surface-variant font-medium mb-8 leading-relaxed opacity-80">
                      {item.config.size} Round • {item.config.sponge} Base • {item.config.filling} Filling • {item.config.frosting} Frosting
                      {item.config.message && ` • "${item.config.message}"`}
                    </p>
                    
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">Accents</p>
                      <div className="flex flex-wrap gap-2">
                        {item.config.toppings.map((topping: string) => (
                          <span key={topping} className="px-3 py-1 bg-white/60 rounded-full text-[10px] font-bold text-secondary border border-secondary/10">
                            {topping}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-on-surface-variant font-serif italic text-lg opacity-60">Your collection is empty.</p>
                </div>
              )}
            </div>
          </section>

          {/* Delivery Details */}
          <section className="bg-white rounded-3xl p-10 border border-secondary/5 shadow-sm">
            <h2 className="text-2xl font-serif text-secondary mb-8 font-bold">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Delivery Date</label>
                <div className="relative">
                  <input 
                    className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium" 
                    type="date" 
                    id="delivery-date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                  <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Preferred Window</label>
                <select 
                  className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium appearance-none" 
                  id="delivery-window"
                  value={deliveryWindow}
                  onChange={(e) => setDeliveryWindow(e.target.value)}
                >
                  <option>Morning (09:00 - 12:00)</option>
                  <option>Afternoon (13:00 - 17:00)</option>
                  <option>Evening (18:00 - 20:00)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Shipping Address</label>
                <input 
                  className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium" 
                  placeholder="Street Address" 
                  type="text" 
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">City</label>
                <input 
                  className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium" 
                  placeholder="Paris" 
                  type="text" 
                  id="city" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Postal Code</label>
                <input 
                  className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium" 
                  placeholder="75001" 
                  type="text" 
                  id="postal-code" 
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white rounded-3xl p-10 border border-secondary/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-serif text-secondary font-bold">Payment Method</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border-2 border-secondary bg-primary-container/20 p-6 rounded-2xl flex items-center gap-6 shadow-sm">
                <div className="p-4 bg-white rounded-xl shadow-sm text-secondary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-on-surface">Visa ending in 4242</p>
                  <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">Expires 12/26</p>
                </div>
                <button className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] border-b-2 border-secondary/20 hover:border-secondary transition-all">Change</button>
              </div>

              <button className="w-full p-8 rounded-2xl border-2 border-dashed border-secondary/10 hover:border-secondary/30 transition-all group flex items-center gap-6 text-on-surface-variant/40 hover:text-secondary">
                <PlusCircle className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="text-lg font-serif font-bold italic">Add new payment method</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Totals */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
          <div className="bg-white p-10 rounded-3xl border border-secondary/5 diffusion-shadow border-4 border-primary-container">
            <h2 className="text-2xl font-serif text-secondary mb-10 font-bold">Order Totals</h2>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-serif italic text-lg opacity-70">Subtotal</span>
                <span className="text-lg font-bold text-on-surface">${subtotal}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-serif italic text-lg opacity-70">Artisan Delivery</span>
                <span className="text-lg font-bold text-on-surface">${deliveryFee}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-serif italic text-lg opacity-70">Eco-Luxe Packaging</span>
                <span className="text-lg font-bold text-on-surface">${packagingFee}.00</span>
              </div>
              <div className="h-px bg-secondary/5 w-full"></div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-3xl font-serif font-bold text-secondary">Total</span>
                <span className="text-3xl font-serif font-bold text-secondary">${total}.00</span>
              </div>
            </div>
            
            <button 
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || !isFormValid}
              className="w-full bg-secondary text-white py-6 rounded-2xl font-bold tracking-[0.3em] uppercase shadow-2xl hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50 transition-all flex items-center justify-center gap-4 text-xs group"
              id="confirm-order-button"
            >
              <span>{cart.length === 0 ? 'Cart Empty' : (!isFormValid ? 'Enter Delivery Details' : 'Place Your Order')}</span>
              <ArrowRight className="w-4 h-4 group-disabled:opacity-50" />
            </button>
            
            <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 px-8 leading-loose">
              By placing this order, you agree to our artisan quality guarantee and seasonal availability terms.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-secondary/5 shadow-sm text-center group hover:bg-primary-container/20 transition-colors">
              <ShieldCheck className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Artisan Quality</p>
              <p className="text-[10px] font-medium text-on-surface-variant/60">Hand-crafted daily</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-secondary/5 shadow-sm text-center group hover:bg-primary-container/20 transition-colors">
              <Truck className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Safe Passage</p>
              <p className="text-[10px] font-medium text-on-surface-variant/60">Temp controlled</p>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
