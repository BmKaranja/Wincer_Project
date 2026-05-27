import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, UtensilsCrossed, Calendar, CreditCard, PlusCircle, Lock, ShieldCheck, Truck, ArrowRight, CheckCircle2, X, Wand2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { DELIVERY_ZONES } from '../constants';

export default function Checkout({ setView, cart, onOrderPlaced, onEdit, onRemove, user }: { 
  setView: (v: string) => void, 
  cart: any[], 
  onOrderPlaced: () => void,
  onEdit: (item: any) => void,
  onRemove: (id: number) => void,
  user?: any
}) {
  const [isSuccess, setIsSuccess] = useState(false);

  // Delivery details state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState('Morning (09:00 - 12:00)');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('07');
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [isPromptingMpesa, setIsPromptingMpesa] = useState(false);
  const [manualMpesaCode, setManualMpesaCode] = useState('');
  const [isManualConfirming, setIsManualConfirming] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const isManualVerifiedRef = useRef(false);

  // Get minimum date (at least 2 days in advance / 48hr prior) in YYYY-MM-DD
  const minAllowedDate = (() => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const [selectedZoneId, setSelectedZoneId] = useState<string>(() => {
    return localStorage.getItem('wincer_delivery_zone') || 'cbd';
  });

  const selectedZone = useMemo(() => {
    return DELIVERY_ZONES.find(zone => zone.id === selectedZoneId) || DELIVERY_ZONES[0];
  }, [selectedZoneId]);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = 0; // Disabled for now: cart.length > 0 ? selectedZone.fee : 0;
  const packagingFee = 0; // Disabled for now: cart.length > 0 ? 200 : 0;
  const total = subtotal + deliveryFee + packagingFee;
  
  const depositAmount = Math.ceil(total * 0.5);
  const amountToPayNow = paymentType === 'deposit' ? depositAmount : total;

  const isFormValid = deliveryDate.trim() !== '' && deliveryDate >= minAllowedDate && address.trim() !== '' && city.trim() !== '' && mpesaPhone.length >= 10;

  const [isPlacing, setIsPlacing] = useState(false);
  const [errorState, setErrorState] = useState('');

  const createDatabaseOrder = async (orderId: string, mpesaTxCode?: string) => {
    const cakeTitles = cart.map(c => c.name).join(', ');
    const cakeDetails = cart.map(c => {
      if (c.config) {
        const configStr = Object.entries(c.config)
          .filter(([_, v]) => v) // filter out empty values
          .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`)
          .join(' | ');
        return `${c.name} - ${configStr}`;
      }
      return c.name;
    }).join('\n');
    const gauge = cart[0]?.config?.size || cart[0]?.gauge || cart[0]?.basePrice || 'Standard';

    const paymentInfo = mpesaTxCode 
      ? `M-Pesa - Code: ${mpesaTxCode} (${paymentType === 'deposit' ? '50% Deposit' : 'Full Amount'})`
      : `M-Pesa (${paymentType === 'deposit' ? '50% Deposit' : 'Full Amount'})`;

    const finalStatus = mpesaTxCode 
      ? 'Pending Verification' 
      : (paymentType === 'deposit' ? 'Confirmed (Pending Balance)' : 'Fully Paid');

    await setDoc(doc(db, 'orders', orderId), {
      userId: user ? user.uid : 'guest',
      customer: user ? (user.name || user.email || mpesaPhone) : mpesaPhone,
      amount: `Kshs. ${total}`,
      paidAmount: `Kshs. ${amountToPayNow}`,
      paymentMethod: paymentInfo,
      status: finalStatus,
      deliveryDate: deliveryDate,
      deliveryWindow: deliveryWindow,
      deliveryZone: selectedZone.name,
      shippingAddress: address,
      city: city,
      cakeTitle: cakeTitles || 'Custom Cake',
      cakeDetails: cakeDetails || 'Details TBD',
      gauge: typeof gauge === 'string' ? gauge : String(gauge),
      createdAt: serverTimestamp()
    });
  };

  const handleManualCodeSubmit = async () => {
    const cleanCode = manualMpesaCode.trim().toUpperCase();
    
    // Strict pattern matching for standard Safaricom check codes (e.g. RG85H91JK2)
    const isValidMpesaFormat = /^[A-Z][A-Z0-9]{9}$/.test(cleanCode);
    
    if (!isValidMpesaFormat) {
      setErrorState('Invalid M-Pesa Code Format. It must be exactly 10 alphanumeric characters and start with a letter (e.g., RG85H91JK2, SE45TY78Z9). Please verify and try again.');
      return;
    }
    
    setIsManualConfirming(true);
    setErrorState('');
    try {
      const orderId = currentOrderId || Date.now().toString();
      await createDatabaseOrder(orderId, cleanCode);
      isManualVerifiedRef.current = true;
      setIsPromptingMpesa(false);
      setIsSuccess(true);
      onOrderPlaced();
    } catch (err: any) {
      console.error(err);
      setErrorState('Failed to submit code manually: ' + (err.message || 'Unknown Error'));
    } finally {
      setIsManualConfirming(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPromptingMpesa(true);
    setIsPlacing(true);
    setErrorState('');
    setManualMpesaCode('');
    isManualVerifiedRef.current = false;
    
    try {
      const orderId = Date.now().toString();
      setCurrentOrderId(orderId);
 
      // 1. Initiate STK Push via backend
      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: mpesaPhone,
          amount: amountToPayNow,
          reference: orderId,
          description: `WincerCakeHouse Order ${orderId}`
        })
      });
 
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initiate M-Pesa push');
      }
 
      const requestId = data.data.CheckoutRequestID;
      if (!requestId) {
        throw new Error('No Request ID returned from M-Pesa');
      }
 
      // 2. Poll for status
      let attempts = 0;
      let paymentConfirmed = false;
      const maxAttempts = 40; // 40 * 3s = 120s total lock
      
      while (attempts < maxAttempts && !paymentConfirmed && !isManualVerifiedRef.current) {
        await new Promise(r => setTimeout(r, 3000)); // wait 3 seconds (snappier!)
        attempts++;
        
        if (isManualVerifiedRef.current) {
          paymentConfirmed = true;
          break;
        }
        
        try {
          const statusRes = await fetch(`/api/mpesa/status/${requestId}`);
          const statusData = await statusRes.json();
          
          if (statusData.status === 'success') {
            paymentConfirmed = true;
            break;
          } else if (statusData.status === 'failed') {
            throw new Error(`M-Pesa Payment Failed: ${statusData.data?.resultDesc || 'Unknown Error'}`);
          }
        } catch (pollErr) {
          console.warn('Poll error, retrying...', pollErr);
        }
      }

      if (isManualVerifiedRef.current) {
        return; // successfully handled by manual submit
      }

      if (!paymentConfirmed) {
        throw new Error('M-Pesa payment timed out. Did you enter your PIN?');
      }
      
      setIsPromptingMpesa(false);
      await createDatabaseOrder(orderId);
      setIsSuccess(true);
      onOrderPlaced();
    } catch (err: any) {
      console.error(err);
      setIsPromptingMpesa(false);
      setErrorState(err.message || 'Failed to place order');
    } finally {
      setIsPlacing(false);
    }
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
              className="bg-surface rounded-[3rem] p-12 max-w-lg w-full shadow-2xl relative z-10 text-center"
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
                Your custom cake is being prepared with precision and will be ready for you shortly.
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
          onClick={() => setView('cart')}
          className="hover:text-secondary cursor-pointer transition-colors"
        >Cart</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-secondary">Checkout</span>
      </nav>

      <h1 className="text-5xl font-serif text-secondary mb-12 font-bold tracking-tight">Complete Your Order</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-primary-container p-8 rounded-3xl border border-secondary/5 diffusion-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h2 className="text-xl font-serif text-secondary mb-8 flex items-center gap-4 font-bold">
              <UtensilsCrossed className="w-6 h-6" />
              The Selection ({cart.length})
            </h2>
            
            <div className="space-y-12">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="w-full md:w-40 aspect-square rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-4 border-white bg-stone-100 flex items-center justify-center">
                    {item.img ? (
                      <img 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        src={item.img} 
                      />
                    ) : (
                      <span className="text-4xl">🍰</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-serif text-secondary font-bold">{item.name}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-secondary font-sans">Kshs. {item.price}</span>
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
                    
                    <div className="bg-surface-container/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">Accents</p>
                      <div className="flex flex-wrap gap-2">
                        {item.config.toppings.map((topping: string) => (
                          <span key={topping} className="px-3 py-1 bg-surface-container/60 rounded-full text-[10px] font-bold text-secondary border border-secondary/10">
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
          <section className="bg-surface-container rounded-3xl p-10 border border-secondary/5 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between mb-8 md:items-end">
              <h2 className="text-2xl font-serif text-secondary font-bold">Delivery Details</h2>
              <p className="text-xs text-secondary/60 mt-2 md:mt-0 font-medium italic">We coordinate all deliveries directly via WhatsApp.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Delivery Date</label>
                  <span className="text-[10px] text-secondary/60 font-semibold italic">Requires 2 days notice</span>
                </div>
                <div className="relative">
                  <input 
                    className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium" 
                    type="date" 
                    id="delivery-date"
                    min={minAllowedDate}
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
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Delivery Zone</label>
                <div className="relative">
                  <select 
                    className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium cursor-pointer" 
                    id="checkout-delivery-zone"
                    value={selectedZoneId}
                    onChange={(e) => {
                      setSelectedZoneId(e.target.value);
                      localStorage.setItem('wincer_delivery_zone', e.target.value);
                    }}
                  >
                    {DELIVERY_ZONES.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} (Free Delivery)
                      </option>
                    ))}
                  </select>
                </div>
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
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">M-PESA Phone Number</label>
                <input 
                  className="w-full bg-background border border-secondary/10 rounded-2xl p-5 focus:ring-2 focus:ring-secondary/20 outline-none text-on-surface font-medium" 
                  placeholder="07XX XXX XXX or 01XX XXX XXX" 
                  type="text" 
                  id="mpesa-phone" 
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-surface-container rounded-3xl p-10 border border-secondary/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif text-secondary font-bold">Payment Method</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">M-PESA ONLY</span>
              </div>
            </div>
            
            <p className="text-sm text-on-surface-variant mb-6 italic">
              We require a small deposit to confirm your order and begin preparation.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => setPaymentType('deposit')}
                className={`w-full p-6 text-left border-2 rounded-2xl flex items-center justify-between transition-all ${paymentType === 'deposit' ? 'border-secondary bg-primary-container/20 shadow-sm' : 'border-secondary/10 hover:border-secondary/30'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === 'deposit' ? 'border-secondary' : 'border-secondary/30'}`}>
                    {paymentType === 'deposit' && <div className="w-2.5 h-2.5 bg-secondary rounded-full"></div>}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">1/2 Pay</p>
                    <p className="text-xs text-on-surface-variant mt-1">before delivery</p>
                  </div>
                </div>
                <span className="font-serif font-bold text-secondary">Kshs. {depositAmount}</span>
              </button>

              <button 
                onClick={() => setPaymentType('full')}
                className={`w-full p-6 text-left border-2 rounded-2xl flex items-center justify-between transition-all ${paymentType === 'full' ? 'border-secondary bg-primary-container/20 shadow-sm' : 'border-secondary/10 hover:border-secondary/30'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === 'full' ? 'border-secondary' : 'border-secondary/30'}`}>
                    {paymentType === 'full' && <div className="w-2.5 h-2.5 bg-secondary rounded-full"></div>}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Pay Full Amount now</p>
                    <p className="text-xs text-on-surface-variant mt-1">Settle entire bill upfront via M-Pesa</p>
                  </div>
                </div>
                <span className="font-serif font-bold text-secondary">Kshs. {total}</span>
              </button>
            </div>
          </section>

          {/* Order Totals */}
          <div className="bg-surface p-10 rounded-3xl border border-secondary/5 diffusion-shadow border-4 border-primary-container">
            <h2 className="text-2xl font-serif text-secondary mb-10 font-bold">Order Totals</h2>
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-serif italic text-lg opacity-70">Subtotal</span>
                <span className="text-lg font-bold text-on-surface">Kshs. {subtotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-serif italic text-lg opacity-70 flex flex-col sm:flex-row sm:items-baseline sm:gap-1">
                  <span>Delivery</span>
                  <span className="text-xs text-secondary/70 font-sans">({selectedZone.name.split(' (')[0]})</span>
                </span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-serif italic text-lg opacity-70">Packaging</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">Free</span>
              </div>
              <div className="h-px bg-secondary/5 w-full"></div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-serif font-bold text-on-surface-variant">Total</span>
                <span className="text-xl font-serif font-bold text-on-surface-variant">Kshs. {total}</span>
              </div>
              
              <div className="bg-primary-container/30 p-4 rounded-xl border border-secondary/10 flex justify-between items-center mt-4">
                <span className="text-2xl font-serif font-bold text-secondary">
                  {paymentType === 'deposit' ? 'To Pay Now (Deposit)' : 'To Pay Now (Full)'}
                </span>
                <span className="text-2xl font-serif font-bold text-secondary">Kshs. {amountToPayNow}</span>
              </div>
              
              {paymentType === 'deposit' && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">Balance on Delivery</span>
                  <span className="text-sm font-bold text-secondary">Kshs. {total - amountToPayNow}</span>
                </div>
              )}
            </div>
            
            {errorState && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 mb-6">
                {errorState}
              </div>
            )}
            
            <button 
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || !isFormValid || isPlacing}
              className="w-full bg-secondary text-white py-6 rounded-2xl font-bold tracking-[0.3em] uppercase shadow-2xl hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50 transition-all flex items-center justify-center gap-4 text-xs group"
              id="confirm-order-button"
            >
              <span>{isPromptingMpesa ? 'Waiting for M-PESA PIN...' : isPlacing ? 'Placing...' : (cart.length === 0 ? 'Cart Empty' : (!isFormValid ? 'Enter Details & Phone' : 'Pay via M-PESA & Order'))}</span>
              <ArrowRight className="w-4 h-4 group-disabled:opacity-50" />
            </button>
            
            {isPromptingMpesa && (
              <div className="mt-6 bg-surface p-6 rounded-2xl border-2 border-secondary/15 space-y-4 shadow-lg text-center bg-[#FAF8F5]/50">
                <div className="flex items-center justify-center gap-2 text-secondary">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-bold tracking-wide uppercase">Waiting for M-Pesa PIN...</span>
                </div>
                
                <p className="text-xs text-on-surface-variant/80">
                  Please check your phone ({mpesaPhone}) to complete the payment. After entering your PIN, this screen will update automatically.
                </p>

                <div className="h-px bg-secondary/10 my-1"></div>

                <div className="space-y-3 pt-1">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-left">
                    Paid already but still waiting?
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 leading-relaxed text-left">
                    If Daraja successfully debited your account but Safaricom callbacks are taking too long, type your M-Pesa Transaction Code below (e.g., RE45TY78Z9) to complete your order manually.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. RG85H91JK2"
                      value={manualMpesaCode}
                      onChange={(e) => setManualMpesaCode(e.target.value.toUpperCase().trim())}
                      className="bg-background border border-secondary/15 rounded-xl px-4 py-3 text-xs font-bold outline-none uppercase focus:ring-2 focus:ring-secondary/10 flex-grow text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={handleManualCodeSubmit}
                      disabled={isManualConfirming || manualMpesaCode.trim().length < 5}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all disabled:grayscale disabled:opacity-50 whitespace-nowrap"
                    >
                      {isManualConfirming ? 'Verifying...' : 'Submit Code'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isPromptingMpesa && errorState && (errorState.toLowerCase().includes('timeout') || errorState.toLowerCase().includes('time out') || errorState.toLowerCase().includes('pin')) && (
              <div className="mt-4 bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-amber-800">
                  <span className="text-lg">🛎️</span>
                  <span className="text-xs font-bold uppercase tracking-wider">M-Pesa Verification Fallback</span>
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  If you entered your PIN and received a confirmation message from M-Pesa but the website timed out, type your M-Pesa Transaction Code below to complete your order manually.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. RG85H91JK2"
                    value={manualMpesaCode}
                    onChange={(e) => setManualMpesaCode(e.target.value.toUpperCase().trim())}
                    className="bg-background border border-amber-300 rounded-xl px-4 py-3 text-xs font-bold outline-none uppercase focus:ring-2 focus:ring-amber-200 flex-grow text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={handleManualCodeSubmit}
                    disabled={isManualConfirming || manualMpesaCode.trim().length < 5}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all disabled:grayscale disabled:opacity-50 whitespace-nowrap"
                  >
                    {isManualConfirming ? 'Verifying...' : 'Submit Code'}
                  </button>
                </div>
              </div>
            )}
            
            <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 px-8 leading-loose">
              By placing this order, you agree to our terms. 48-hour advance notice is required. Delivery charges may vary by exact location.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center p-8 bg-surface-container rounded-3xl border border-secondary/5 shadow-sm text-center group hover:bg-primary-container/20 transition-colors">
              <ShieldCheck className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Freshly Baked</p>
              <p className="text-[10px] font-medium text-on-surface-variant/60">Made to order</p>
            </div>
            <div className="flex flex-col items-center p-8 bg-surface-container rounded-3xl border border-secondary/5 shadow-sm text-center group hover:bg-primary-container/20 transition-colors">
              <Truck className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Safe Delivery</p>
              <p className="text-[10px] font-medium text-on-surface-variant/60">Within Nairobi</p>
            </div>
          </div>
        </div>
      </motion.main>
  );
}
