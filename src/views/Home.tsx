import { motion } from 'motion/react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
export interface HomeProps {
  setView: (view: string) => void;
  posts?: any[];
}

export default function Home({ setView, posts = [] }: HomeProps) {
  const collections = [
    {
      title: "The Classics Collection",
      desc: "Time-tested recipes baked to airy perfection, layered with fluffy cream and rich gourmet fillings.",
      tags: ["Black Forest", "Red Velvet", "White Forest"],
      img: "https://ik.imagekit.io/oaundupgio/EduRent/Images/home_birthday.jpg?updatedAt=1783072323916"
    },
    {
      title: "Modern Indulgence",
      desc: "Daring, contemporary cake profiles featuring luscious cascading drips, Biscoff, and premium Ferrero themes.",
      tags: ["Lotus Biscoff", "Chocolate Drip", "Ferrero"],
      img: "https://ik.imagekit.io/oaundupgio/EduRent/Images/chocolatecake.jpg?updatedAt=1783072325370"
    },
    {
      title: "Artisan Floral Cakes",
      desc: "Delicately handcrafted floral arrangements and elegant piping crowning moist, rich sponges.",
      tags: ["Floral Design", "Buttercream", "Elegant"],
      img: 'https://ik.imagekit.io/oaundupgio/EduRent/Images/regenerated_image_1780566435533.png?updatedAt=1783072327267'
    },
    {
      title: "Gourmet Masterpieces",
      desc: "Rich, decadent creations loaded with premium toppings, fresh fruits, and artisan finishes.",
      tags: ["Premium", "Fresh Fruit", "Decadent"],
      img: 'https://ik.imagekit.io/oaundupgio/EduRent/Images/regenerated_image_1780566437370.png?updatedAt=1783072327964'
    }
  ];

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20"
    >
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-surface-container">
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Text Col */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left text-on-surface z-20 w-full lg:w-1/2"
          >
            <span className="font-sans font-bold tracking-[0.2em] uppercase mb-4 block text-secondary text-sm">Handcrafted In Our Kitchen</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-[1.05] tracking-tight">
              Baked for Your Most Memorable Moments
            </h1>
            <p className="text-xl md:text-2xl mb-10 font-serif italic text-on-surface/80 max-w-lg">
              From custom wedding cakes to birthday cakes, we bring sweetness to your table.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 lg:px-0">
              <button 
                onClick={() => setView('catalog')}
                className="bg-secondary text-white px-8 py-4 rounded-2xl font-sans font-bold uppercase tracking-[0.1em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg w-full sm:w-auto"
              >
                Shop Cakes
              </button>
              <button 
                onClick={() => setView('story')}
                className="bg-transparent border border-secondary text-secondary px-8 py-4 rounded-2xl font-sans font-bold uppercase tracking-[0.1em] text-sm hover:bg-secondary/5 active:scale-95 transition-all w-full sm:w-auto"
              >
                Read Our Story
              </button>
            </div>
          </motion.div>

          {/* Right Images Col */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full lg:w-1/2 relative flex justify-center items-center mt-12 lg:mt-0"
          >
            <div className="relative w-full max-w-[450px] lg:max-w-[600px] aspect-square">
               {/* Small Top Left Circle */}
               <motion.div 
                  animate={{ y: [-15, 0, -15], rotate: [-2, 0, -2] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  className="absolute top-[5%] left-[0%] w-[42%] aspect-square z-20"
               >
                  <img 
                    src="https://ik.imagekit.io/oaundupgio/EduRent/Images/home_birthday.jpg?updatedAt=1783072323916" 
                    alt="Delicious custom cake"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover shadow-xl border-4 border-surface-container"
                  />
               </motion.div>

               {/* Small Bottom Left Circle */}
               <motion.div 
                  animate={{ y: [15, 0, 15], rotate: [2, 0, 2] }}
                  transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-[10%] left-[20%] w-[38%] aspect-square z-30"
               >
                  <img 
                    src="hhttps://ik.imagekit.io/oaundupgio/EduRent/Images/home_birthday.jpg?updatedAt=1783072323916" 
                    alt="Pastries & treats"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover shadow-xl border-4 border-surface-container"
                  />
               </motion.div>

               {/* Large Right Circle */}
               <div className="absolute top-[18%] right-[0%] w-[55%] flex flex-col items-center">
                 <motion.div 
                    animate={{ y: [-5, 5, -5], rotate: [1, -1, 1] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
                    className="w-full aspect-square z-20"
                 >
                   <img 
                      src="https://ik.imagekit.io/oaundupgio/EduRent/Images/chocolatecake.jpg?updatedAt=1783072325370" 
                      alt="Famous Signature Cakes"
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover shadow-xl border-4 border-surface-container"
                   />
                 </motion.div>
                 <span className="mt-4 md:mt-6 font-sans font-semibold text-secondary uppercase tracking-[0.1em] md:tracking-[0.15em] text-xs md:text-sm text-center px-1 leading-relaxed">
                   Our Famous Signature Cakes
                 </span>
               </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Curated Collections Preview Section */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-secondary font-bold tracking-[0.2em] uppercase mb-4 block text-xs">Exquisite Range</span>
          <h2 className="text-4xl font-serif text-secondary mb-4 italic">Explore Our Curated Collections</h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col, idx) => (
            <motion.div 
              key={col.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setView('catalog')}
              className="group bg-primary-container/40 rounded-3xl overflow-hidden cursor-pointer diffusion-shadow transition-all duration-300 hover:-translate-y-2 border border-secondary/5 flex flex-col h-full"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  alt={col.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={col.img} 
                />
                <div className="absolute inset-0 bg-stone-950/10 group-hover:bg-transparent transition-colors duration-300" />
              </div>
              <div className="p-8 flex flex-col flex-grow text-center">
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {col.tags.map(tag => (
                    <span key={tag} className="bg-secondary/10 text-secondary text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-serif text-secondary mb-3 italic">{col.title}</h3>
                <p className="text-on-surface-variant font-sans opacity-80 leading-relaxed text-sm flex-grow mb-6">
                  {col.desc}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary group-hover:gap-4 transition-all">
                    Discover Collection <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Opening Hours & Visit Section */}
      <section className="py-24 bg-primary-container/20 border-y border-secondary/5">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-secondary font-bold tracking-[0.2em] uppercase mb-4 block text-xs">Come Visit Us</span>
            <h2 className="text-4xl font-serif text-secondary mb-6 italic">Handcrafting Sweetness <br/> Seven Days a Week</h2>
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] group">
              <img 
                src="https://karanjamaina.sirv.com/Images/regenerated_image_1779013135478.webp" 
                alt="Wincer Cake House Shop Front" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-secondary/10 group-hover:bg-transparent transition-colors"></div>
            </div>
            <p className="text-on-surface-variant font-sans mb-8 opacity-80 leading-relaxed max-w-md">
              Located in the heart of Nairobi, our bakery is a sanctuary for cake lovers. 
              Drop by for a consultation or to pick up your daily treats in our cozy store.
            </p>
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif text-secondary font-bold">Donholm Branch</p>
                <p className="text-sm text-on-surface-variant opacity-70">Harambee Sacco Estate, Shopping Center, Donholm</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[2rem] shadow-xl diffusion-shadow border border-secondary/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16"></div>
             <div className="flex items-center gap-3 mb-8">
               <Clock className="w-5 h-5 text-secondary" />
               <h3 className="text-xl font-serif text-secondary italic">Opening Hours</h3>
             </div>
             
             <div className="space-y-4 font-sans text-sm tracking-wide">
                {[
                  { day: "Monday", hours: "07:29 - 20:00" },
                  { day: "Tuesday", hours: "07:29 - 20:00" },
                  { day: "Wednesday", hours: "07:30 - 20:00" },
                  { day: "Thursday", hours: "07:29 - 20:00" },
                  { day: "Friday", hours: "07:29 - 20:00" },
                  { day: "Saturday", hours: "07:15 - 20:00" },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-secondary font-medium">{item.day}</span>
                    <span className="text-on-surface-variant font-bold tabular-nums">{item.hours}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2">
                  <span className="text-secondary/50 font-medium italic">Sunday</span>
                  <span className="text-secondary italic font-bold">Closed</span>
                </div>
             </div>
             
             <button 
               onClick={() => window.open('https://maps.app.goo.gl/BHcNEEziXuGqYJxN8', '_blank')}
               className="w-full mt-10 bg-secondary text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2"
             >
               Get Directions <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </section>

      {/* Shop by Occasion - Bento Layout */}
      <section className="bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-secondary font-bold tracking-widest uppercase mb-2 block">Curated Collections</span>
              <h2 className="text-4xl font-serif text-secondary">Moments Worth Celebrating</h2>
            </div>
            <button 
              onClick={() => setView('occasions')}
              className="text-secondary border-b-2 border-secondary pb-1 flex items-center gap-2 font-bold hover:gap-4 transition-all"
            >
              View All Occasions <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-6 h-auto md:h-[600px]">
            <div className="md:col-span-7 md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
              <img 
                alt="Wedding Occasion" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfq6dfkVuKfW7hpDa6UNTx9Ftf9075n2O57oxzKXZlTmQSx5YzU65nAK69GJ4FBFUWlboPenTOUnWD3ChTZhReNSg5X1fjx_iDiqTa12QjcmpPa-Sr3YrLEn0E79SNV7qNQcUfG2mSBIuVfeshY39H6kewkOGjo36QL8gmQOaegJgppoWKT9tSuzd1Cv-ul2f9gNvR-jxihiDDLQ5eKlvP39HHDRarRlobhZann5pEtdtZQ_SiaACGqa1rMsj1LSV8BByBo1EvsME" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-4xl font-serif mb-2">Weddings</h3>
                <p className="text-lg text-stone-200">Eternal elegance for your special day.</p>
              </div>
            </div>
            
            <div className="md:col-span-5 md:row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg min-h-[250px]">
              <img 
                alt="Birthday Occasion" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                src="https://ik.imagekit.io/oaundupgio/EduRent/Images/home_birthday.jpg?updatedAt=1783072323916" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-serif mb-1">Birthdays</h3>
                <p className="text-stone-200">Joyful treats for every milestone.</p>
              </div>
            </div>

            <div className="md:col-span-5 md:row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg min-h-[250px]">
              <img 
                alt="Anniversary Occasion" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-1eLrHOVkVb91lLf0EA_t8aS-PaHWpAzrvuNW6WeD-f0_pbi11GU6PFEkW4XyXxJDPm6JX9g0p3XxFCsNAHYD0Sl1ljQxZsmMFVVVCFJQqzUHe2BZfD6AbjvdsxvfWU_kAjqYwa7PPixmqFjYefYD0GFYkNtTYkYiTAqTt46LvZ5OfGfTlxM232QF9Z2FKB6DVn2YZFdkvVokqpe9Op8bf-ddDC3cWtlnyWMNT9Zi1B9xX1rSrvkxW0bZpNYipCgwk7ZZTjLchVU" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-serif mb-1">Anniversaries</h3>
                <p className="text-stone-200">Timeless flavors for true love.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="bg-primary-container/30 rounded-3xl p-12 flex flex-col md:flex-row items-center gap-16 border border-secondary/10">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl font-serif text-secondary mb-6">Our Custom Philosophy</h2>
            <p className="text-xl text-on-surface-variant mb-10 italic leading-relaxed">
              "We believe every cake should be as unique as the person it's made for. From elegant tiers to whimsical designs, we do it all."
            </p>
            <div className="space-y-8">
              {[
                { label: 'Richness', val: '85%', sub: 'Premium Cocoa' },
                { label: 'Sweetness', val: '45%', sub: 'Organic Cane' },
                { label: 'Texture', val: '95%', sub: 'Velvet Crumb' }
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between mb-2 items-end">
                    <span className="font-bold text-secondary uppercase tracking-widest text-sm">{stat.label}</span>
                    <span className="text-xs text-on-surface-variant font-medium">{stat.sub}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-secondary rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.val }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative">
              <img 
                alt=" Chef Crafting" 
                className="rounded-2xl shadow-2xl" 
                src="https://ik.imagekit.io/oaundupgio/EduRent/Images/regenerated_image_1779013140846.webp?updatedAt=1783072331619" 
              />
              <div className="absolute -bottom-6 -right-6 bg-secondary p-8 rounded-2xl text-white hidden md:block shadow-xl">
                <p className="text-2xl font-serif leading-tight">Hand-finished<br/>by master<br/>bakers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary-fixed to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
          <span className="font-bold tracking-[0.3em] text-primary-fixed-dim mb-4 block uppercase text-sm">Bespoke Creations</span>
          <h2 className="text-5xl font-serif mb-8">Craft Your Own Masterpiece.</h2>
          <p className="max-w-2xl mx-auto text-xl text-stone-400 mb-12 opacity-90 font-sans leading-relaxed">
            Choose your base, infusion, and décor. Our team will bring your unique vision to life with uncompromising quality.
          </p>
          <button 
            onClick={() => setView('customizer')}
            className="bg-primary-fixed text-on-primary-fixed px-12 py-5 rounded-xl text-xl font-bold macaron-raised hover:scale-105 transition-transform"
          >
            Start Building
          </button>
        </div>
      </section>
    </motion.main>
  );
}
