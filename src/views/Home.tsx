import { motion } from 'motion/react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

export interface HomeProps {
  setView: (view: string) => void;
  posts?: any[];
}

export default function Home({ setView, posts = [] }: HomeProps) {
  const bestsellers = [
    {
      id: 7,
      title: "Chocolate Drip Cake",
      desc: "A decadent two-tier chocolate drip cake, lavishly adorned with wafers, gold coins, and assorted chocolates.",
      price: "Kshs. 3500",
      tag: "Trending",
      img: "/images/chocolatecake.jpg"
    },
    {
      id: 1,
      title: "Signature Black Forest",
      desc: "A rich German classic chocolate sponge layered with whipped cream and cherries.",
      price: "Kshs. 2200",
      tag: "Bestseller",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNxYJrngqv4m-5-nDOT98WJJBsj4VLTJ-jVyN2GTmOgLLaIhA8e_J7zRCNu7PpNMhh3SahmEUA53TTuvP_NfFDfwxD4uZwx94gZRpEOpVB2bHIP0vwj-Wx9vYjLJ2l8sVDc8kVewXkWyeWyieVZi5uBKYxiLwi-EvwAcIZe3M1Ii4m5wF8t05CcyYZwjedKjQKNc9V3RVOiyxvIarZ6mAbQHOvOLrmcTN33J-TfWAmNVioejdOJeYI-Ux-YCz2ZeeK1NR1UzROn1Y"
    },
    {
      id: 3,
      title: "Classic Red Velvet",
      desc: "A velvety, cocoa-infused sponge complete with our creamy, rich cream cheese frosting.",
      price: "Kshs. 2800",
      tag: "Signature",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCloe64oMMRQW-RnI7s-onNgc6APJHBIAt97hmCm0xA0nZCk-_2k47ue-ZyVMozgjLj5ziIAbzSqsbUAYSw6Dnqsx0_wgPLJjLIDVX3AHSbcn8JUI6aJXspnHvLDnDY6GQWtxMhjbfSLC2UmeOFc7u3HSY3OPWpAQgj7mvvNhNgQ5E9cYvzHkB9S_092HF3iwSS4IgN4dEWKTClywo2-r1sSlHk3EuV1qAkHjG5mQFheLWbg3XyGhHPVLnMKn4VudoraUG0qTgoV64"
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
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Wincer Cake House Shop Front" 
            className="w-full h-full object-cover object-center" 
            src="/images/541025122_18119969812495932_4751530949749935897_n.jpg" 
          />
          <div className="absolute inset-0 bg-stone-900/40 transition-opacity"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full mt-32 sm:mt-0">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-white"
          >
            <span className="font-label-md tracking-[0.2em] uppercase mb-4 block text-primary-fixed-dim">
              Nairobi — Wincer Cake House
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Bespoke Cakes <br /> You Can Taste.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-stone-100 font-sans opacity-90 leading-relaxed">
              Handcrafted in Nairobi, our custom cakes are designed to elevate your weddings, birthdays, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 pb-16 sm:pb-0">
              <button 
                onClick={() => setView('catalog')}
                className="bg-secondary text-white px-8 py-4 rounded-lg font-bold macaron-raised hover:scale-105 transition-transform w-full sm:w-auto mb-2 sm:mb-0"
              >
                Explore Collections
              </button>
              <button 
                onClick={() => setView('story')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition-colors w-full sm:w-auto mb-8 sm:mb-0"
              >
                Read Our Story
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-secondary mb-4 italic">The Season's Bestsellers</h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bestsellers.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group bg-primary-container/40 rounded-2xl overflow-hidden diffusion-shadow transition-all hover:-translate-y-2 border border-secondary/5"
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src={item.img} 
                />
              </div>
              <div className="p-8 text-center">
                <div className="flex justify-center gap-1 mb-3">
                  <span className="bg-secondary/10 text-secondary text-[11px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-serif text-secondary mb-2 italic">{item.title}</h3>
                <p className="text-on-surface-variant font-sans mb-4 min-h-[3rem] opacity-80 leading-relaxed text-sm">{item.desc}</p>
                <span className="text-secondary font-bold text-2xl font-serif">{item.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* From the Blog Section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
           <div className="text-center mb-16">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase mb-4 block text-xs">Stories & Craftsmanship</span>
            <h2 className="text-4xl font-serif text-secondary mb-4 italic">From Our Food Blog</h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded-full opacity-30"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {posts.length > 0 ? (
               <>
                 <div 
                   className="relative group cursor-pointer overflow-hidden rounded-[2rem] shadow-xl aspect-video"
                   onClick={() => setView('blog')}
                 >
                    <img 
                      src={posts[0].img}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={posts[0].title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-10 left-10 text-white right-10">
                       <span className="bg-secondary text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider mb-4 inline-block">
                         {posts[0].category || 'Baking secrets'}
                       </span>
                       <h3 className="text-3xl font-serif mb-4 italic leading-tight">
                         {posts[0].title}
                       </h3>
                       <button onClick={(e) => { e.stopPropagation(); setView('blog'); }} className="text-xs font-bold uppercase tracking-widest border-b border-white pb-1 hover:pb-2 transition-all">View Post</button>
                    </div>
                 </div>
                 <div className="flex flex-col justify-center space-y-8">
                    {posts.slice(1, 4).map((post, i) => (
                      <div 
                        key={post.id || i} 
                        className="group cursor-pointer border-l-2 border-secondary/10 hover:border-secondary pl-6 py-2 transition-all"
                        onClick={() => setView('blog')}
                      >
                        <span className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest block mb-2">{post.date}</span>
                        <h3 className="text-xl font-serif text-secondary italic group-hover:translate-x-2 transition-transform">{post.title}</h3>
                      </div>
                    ))}
                    <button onClick={() => setView('blog')} className="text-secondary font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all pt-4">
                      Explore Full Blog <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
               </>
             ) : (
               <div className="col-span-2 py-12 text-center bg-secondary/5 rounded-3xl border border-secondary/10">
                 <p className="text-secondary/50 font-serif italic text-lg">Our latest stories are coming soon...</p>
                 <button onClick={() => setView('blog')} className="mt-4 text-secondary font-bold text-xs uppercase tracking-widest hover:underline decoration-secondary/30">Visit Blog Page</button>
               </div>
             )}
          </div>
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
                src="/images/regenerated_image_1779013135478.webp" 
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
                src="/images/home_birthday.jpg" 
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
                src="/images/regenerated_image_1779013140846.webp" 
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
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-fixed to-transparent"></div>
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
