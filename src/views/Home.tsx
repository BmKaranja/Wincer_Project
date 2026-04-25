import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export interface HomeProps {
  setView: (view: string) => void;
}

export default function Home({ setView }: HomeProps) {
  const bestsellers = [
    {
      id: 1,
      title: "Velvet Rose & Gold",
      desc: "A delicate floral sponge layered with honey-infused cream.",
      price: "$85.00",
      tag: "Signature",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBb1L8IJiijBqS2ki1ohlCW5R62bWidyuUsiubjN2RVcmRQ5e6ndjixFB-P1DX2xcxQqdJ_eHWmlGn2Jh3Gl_Qomih3CY5XdgLZAQajOgN3Jz63iiutELsKEfBFvnblMOXhZfHDsGmdQP_FjuUZAvok_gPsSMoPzeWTbgvnzQHnIgWL5-82FMzJGiNA4LcyK7uI-0geEB0m678Y8ebmd5LX4lughk0n06flC4ldfNTQ_wTMuKDV_zNyudI-jAC6Sdiy-EEKXfeoQQk"
    },
    {
      id: 2,
      title: "Midnight Truffle",
      desc: "70% dark Belgian chocolate with a liquid ganache center.",
      price: "$72.00",
      tag: "Bestseller",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjek62U8aFug_XpnKMod3SKr001uTavF6oxi1fy2TjlYVjgor9GnyqoQRjDZRp8Rq5MEuZK-_X9KmknTBf43ZTScsrZDG9AncwClUknG2rO9rTROBoPu3drcC6gfHqlMCLQAnQCqwPhR2MCfrkS79pukpcJWsP2n_I1nUAB58_U7KZ1WWLg81IiIw6dq32DRM9pBoIoboLgFa94crJhQact07Z0LJYgVloG-4X7AIF8Ma3L5iGRyCb6AMMcsmu42UyQy6ja8fnC3Q"
    },
    {
      id: 3,
      title: "Pistachio Dream",
      desc: "Sicilian pistachio praline and light mascarpone mousse.",
      price: "$94.00",
      tag: "Artisan",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaw-Rl5g2Ypm3RKPgFxOkvzGz-lUk3K5HcvMjDhN7oxMkxJdWkmguQTSp3l_073n86yZujlbDEzcpHdJIWMQHNFFiHrlKhArk-aWDI5k4EAmWmSzKG2OHc6MGe5jbBjOFKwAQXc49PkTZ0KV7d3kaSvGKkfsULs7CiASUQWRLy5jE-BSuhHevZlaxJZTgneLvl3hgbSByPnq7OOEFsLHlDXBWzHAeWqM8Uba_kocZEnpL89ZL-Ly_2j16S4TH0RxAmfK7-oVnLZhM"
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
            alt="Signature tiered wedding cake" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-FTzK65bL-u-Fp_raXiU__oU98C2J3HNvBcBf7nIdWsviqs4lb_sHK8WNskiMMYjQ1mify0h4QUZTIEtqyBb7XUo8JCcCjNQmueqJRjFjZxV4qHyK86tK1g7N4b_rIXtrG4_QD2wHmBpliE7QGu7VJgGgheP0TQmQ0HHipTDttoARAk7l24gtl0G_xQPV3JhfEzhDGmV06hj-7oWWSjmQFyO7SU0RySx7A9_6GyIuOic6DYLLzQhUGDWMeHT7Xw24LhDuxqzvjMg" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-white"
          >
            <span className="font-label-md tracking-[0.2em] uppercase mb-4 block text-primary-fixed-dim">
              Est. 1984 — Artisan Craft
            </span>
            <h1 className="text-6xl font-serif font-bold mb-6 leading-tight">
              Artistry You <br /> Can Taste.
            </h1>
            <p className="text-xl mb-8 text-stone-100 font-sans opacity-90 leading-relaxed">
              Handcrafted with precision, our confections are designed to elevate your most cherished moments into unforgettable memories.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setView('catalog')}
                className="bg-secondary text-on-secondary px-8 py-4 rounded-lg font-bold macaron-raised hover:scale-105 transition-transform"
              >
                Explore Collections
              </button>
              <button 
                onClick={() => setView('story')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Our Heritage
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-secondary mb-4">The Season's Bestsellers</h2>
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
              className="group bg-primary-container/40 rounded-2xl overflow-hidden diffusion-shadow transition-all hover:-translate-y-2"
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
                  <span className="bg-secondary-container text-on-secondary-container text-[11px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-serif text-secondary mb-2">{item.title}</h3>
                <p className="text-on-surface-variant font-sans mb-4 min-h-[3rem] opacity-80">{item.desc}</p>
                <span className="text-secondary font-bold text-2xl">{item.price}</span>
              </div>
            </motion.div>
          ))}
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVdrfQRoVdrBKJB9GqK08xw8b1W7F2PH1eRj59mAuwXMDxee0aoLgjL3hsQAeXvjkcsOed_7Us1HhGbajrnsYUBDMk-UGHvghxrHR-7_HMEF0SFKzQNX7WQVchfKVFRt8ELfj0K_69tNN-cLQ2pXZeDutWvwBgdDoQ61QeTpVf4i4A2O0lGcXiZoPnowxnZN1WxzhL5u76p5QTlNaBnJUbVHZVUuH1MiRXEjp-IisVjrN9hjVBmNZyn5V0o9iF7YLexPY0AhsAt2k" 
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
            <h2 className="text-4xl font-serif text-secondary mb-6">Our Artisan Philosophy</h2>
            <p className="text-xl text-on-surface-variant mb-10 italic leading-relaxed">
              "We believe a cake is more than a dessert; it's a centerpiece of conversation and a vessel for memory."
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
                alt="Pastry Chef Crafting" 
                className="rounded-2xl shadow-2xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuACsBd3R5ahT1BuAVG2hGkePrFiYMLOiUi_1fD9k03Vv8zl2-hxycrReLxTChn2FQ965wfXCCC8d2bHI4R_GF6TkXYQGrb6gVGsTGVesK5a9cpnGH1rsGsqP0vFtWIx3R_61W5lVOxf9ZkuYNhuAd4oDrHCr3PSaMD2oN1xdRHbR8W2_Vw2LytuhLqXQ34vVg7xBFwe3SmJqwsLsPrpTejp__yVCy3W3Hy7lpbRr-c6zXwUT8LNNtWNuRWY3OqtPHTIMY_zg4WLVZ8" 
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
            Choose your base, infusion, and décor. Our artisans will bring your unique vision to life with uncompromising quality.
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
