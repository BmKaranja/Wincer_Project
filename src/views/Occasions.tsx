import { motion } from 'motion/react';
import { Utensils, Brush, Truck } from 'lucide-react';

export default function Occasions({ setView }: { setView: (v: string) => void }) {
  const collections = [
    {
      title: "Birthdays",
      desc: "Joyful creations tailored to your unique personality.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjwqXbEgh2IIzTIp3frzmc_RpUTN7xLLnoDZpNVGQK2oK1q8cCHkvhs8rJiXJP_V8r2OogsH7sVQuPiKirrgyKN7OWkgmYUtGEmY-ELdAbZtPabJ6rPdKlF0Y7aj8Lpy5suaOyMPwgrANFlZ9PvCplY1csfA7DcPh6aS6eRZGgpOCRE8KOnMenPANLWFhShVLlFBqxbZK_0uvjJ0hBdaQrZeYs3nmQMe6bpd5-mWfZHYDO7NHBNyE7h7P7aP3zC7v_GlCW2teQZko"
    },
    {
      title: "Anniversaries",
      desc: "Refined sweetness to celebrate timeless love stories.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTTLhQs8WZlgB7cKhinF5stbQbT6A3BFlBJ_bh8cqHJgPg67fO1U2UYWI7QINB5mBxNyPpg1lHc6TLlAJNR7BzauESPrKG-LfsMqrYeoCeaLgf77_PXx2el1nvvc8TqqpJAH3M6-HqLdQohCgPRTnCrjVckB_dj8-vPa7ljIFeBZ7mDY2M1PMQ5cs8C0bVnxJMlsZLFgWMb8Zk7ImNEWFfR6qlitz0j4xiZdT52bGElXau15DrCK6oGba2PHfclAjtxzCj_pEi7vE"
    },
    {
      title: "Corporate",
      desc: "Sophisticated catering that elevates your brand identity.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBC6UP6KbJ_ZutNz172zbhIQVnEF4uwe-S6OL8k8CzsjUIkC5qjPR54PFqztnJq6Zyk9fXhdma4CPSatp6p0EuR7W9vdSGsH0bNr-Pji91OWYDskJfaWyIICK-nIorYrKCcHiA_JDaF3BGj8BzBZyAmY_xc8C_l6IzjiKjH61KPe1c2MKQ0pUs-ckLkBB02-jKn7_VrJms7hWt-xx45tIz8gFs63llQ766Gn--uZKiBe1q0FwYfjAGcGhZmljcQ2yi0Wd6kqPeAO0Y"
    },
    {
      title: "Celebrations",
      desc: "Custom designs for life's most meaningful transitions.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXHSKstUiv8-fYVdwDSrY-BBXaTFObNt5ir6WG_V9qcgELMOjyjke7LVg0Gt388S7r_eKHNolcRQ6Uj0ffX_U4w-IQSNxFlWuJL8r-zIdgiIZPPtuoCONcQu67CqBuhZ5DflD5zRaBkUBbtCKAEFNMFfb3bq0Qoo5bmK_v5XPyE5RMhY2VhXQa8QNZIWWEYQwuq4b9bolbi_1G6yAOOgqz4XXpEiAn-WtXe1c2X6o28Vfu9Mj8asQAoyjTyK66YzYKjbQZ00B9apk"
    }
  ];

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 overflow-x-hidden"
    >
      {/* Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfTtdx7t-UjBvElgp2yu8QUmFKhGjD3l-UTBQNQxBmgx1CZkaq5uopPjOZGSvl50tlIzYuZfmqAkIjoQZooQzJ3Stgkel-mB7Kh81X4DkFLe2H33gl0041aKnj1MAmA6e_ylGPOptq2Um8VBPG-ayWYc9bW-zYJ-u6uadiLM0y8b9ECZ2uok06Hp9UQfFrhDDV9BFp5alT4LQx6PSWh83z6KOeUriLRPr39xDbdkV4gTTzOL_49PzQW-rmvwHStlKP05EdXEIPMU0" 
            alt="Wedding Cake"
          />
          <div className="absolute inset-0 bg-stone-900/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-8">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-serif font-bold mb-6"
          >
            Memorable Occasions
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl max-w-2xl mx-auto opacity-90 leading-relaxed"
          >
            Transforming your most precious milestones into edible works of art. From intimate gatherings to grand celebrations.
          </motion.p>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary mb-4 block">Artisanal Selection</span>
          <h2 className="text-4xl font-serif text-secondary">Collections for Every Milestone</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((col, idx) => (
            <motion.div 
              key={col.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-6 bg-surface-container shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={col.img} alt={col.title} />
              </div>
              <h3 className="text-2xl font-serif text-secondary mb-2 font-bold">{col.title}</h3>
              <p className="text-on-surface-variant font-medium opacity-80">{col.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Wedding Suite */}
      <section className="bg-primary-container/40 py-24 border-y border-secondary/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">The Wedding Suite</span>
            <h2 className="text-5xl font-serif text-secondary font-bold leading-tight">A Legacy of Love</h2>
            <p className="text-xl text-on-surface-variant leading-relaxed opacity-80">
              Our wedding cakes are more than just desserts; they are the centerpieces of your commitment. We offer a bespoke design process that begins with a private tasting and ends with a masterpiece that reflects your shared journey.
            </p>
            
            <div className="space-y-6 pt-4">
              {[
                { icon: Utensils, text: "Private curated tasting experience" },
                { icon: Brush, text: "Custom flavor & aesthetic profile development" },
                { icon: Truck, text: "On-site assembly and white-glove setup" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="p-3 bg-white rounded-full shadow-sm text-secondary group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium text-on-surface">{item.text}</span>
                </div>
              ))}
            </div>
            
            <button className="bg-secondary text-white px-10 py-5 rounded-xl font-bold tracking-widest text-sm hover:translate-x-2 transition-all shadow-xl mt-8 uppercase">
              Book a Consultation
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-6 scale-110 lg:scale-100">
            <motion.div 
              whileHover={{ y: -10 }}
              className="pt-16"
            >
              <img className="rounded-2xl shadow-2xl w-full aspect-[3/4] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqNG1c7nphQtpfUjUoFyRovv3u9fm0fwCn_ofdKkvh5u1LEunFq2a3AhTWmmfaQ9UNqAA_9ZbQNX57bj9Q84ksjwTERmIo55oIvf8ay9tZSqnfsPw7xFEPl4mtLbyu8t5BHkivgRSj-AX5g1ZJe-bLqArwfLsQslrSD8s2fXu1ZCI4cejpkZfvaNW69ZpbPdvzfUpdBKsX7KwG4C_rMdpQP8y5brUSr2zuooBvuwkZUgWmungXpy0hm8TKxiGTY0KCqqebYdqIgp0" alt="Detail 1" />
            </motion.div>
            <motion.div 
              whileHover={{ y: -10 }}
            >
              <img className="rounded-2xl shadow-2xl w-full aspect-[3/4] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqGGq23pAyQQvhuKuagrB0dl2xJu5HuHmo8C9Vn_D6ma682zW5t-DARYY_KaaVXQXYDuZQ1IHBXdYyiq7WnvjsywmkJghWxjrTGanaNrzVYVPzCfkiZB-aJZqvytw_G8Vf0BAdom2pfe5kk5IJw7_ZyqSI8Zsq7PC25oTxcJ7Ck47wAeUBa7almsYkiPHGNKGuwaXp0XgL5jwKOLbpTEQh3LpShsZ8Yh4si2auEfSia8JkhowkDPxa-eJsawBf7O7DJcTgTU3tiww" alt="Detail 2" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Bento */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-secondary font-bold">Celebration Gallery</h2>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto mt-4 opacity-80">
            Capturing the moments of joy and elegance where Luxe Confections took center stage.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[800px]">
          <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl group shadow-lg">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwj3BAR1OJKxdb73ZI8-2KkGf0kQF_1CqIyiIS0mIAzyBWZMLrfQ6WNt6o8wGyXeCpIS0UxxdRTXG0z5G_iKP4Ou9YHNWs1qJnDrc__j-8lHgXtBMip2um-Liyf_uOcFfP0d4XAcqIrhF1RmRF32VjuT8l4Y8XapXfYDfPvGpkZt6vcVQDNFQ4EHCaPjKJ1uu1wUDuoNUJdkQuxM6BRtNyZUUbuRN5LxmVHLYqax6er8vYASKwlVQAGaobdVI54FT8FRFo65ZgqUQ" alt="Gala" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all"></div>
            <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-bold uppercase tracking-widest">The Grand Gala</p>
            </div>
          </div>
          
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-3xl group shadow-lg min-h-[250px]">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt92KQt_4d2JZKmxeiDth0nw5geLHSC4DrMVXu-7u3fCI-xS5XbGRfYzJxs3Ttg0Kx8TaUfYDmwlfFk2CJeVGlQBeufID7OT5fmXJxHgqgh3g8eZ00HVEZRu6s36Vb69F1e5DK8dUZnq_-Dhqyqv4tZOOlQGh0RzlAQBHd2bVMWEcw6OOJbAdAF_jVV58wfxh9yrsDLJ2WTvCycfoM0kHGD6180_NiYoKdgjTOdegx1hA7Uoejz32OHwsdbwg0T1C23wqQmJGvyww" alt="Table" />
          </div>
          
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-3xl group shadow-lg min-h-[250px]">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdsFaEPUW8clmOIPFyCkxGXGvdYU3ZLls0KciCwYey70v4UhlZbGXSCpvybl-a4OI5mHoxP1lyh_hyNuotAM6omn0L-HQEDrwTavNhhau6NpBQA6YFwAEdjGurLP9PD1OkRad4SSTbSWV4b-IaPRk_Tpo3z8PCr6-dJj9ADUFnVWHO97etrlHvW74Ll6ha5d4MHHuygnEO138dkRciu1cLDLYDoRT7jyYBuHwbmLGB6O_Bs2Ia6RAF2biNr_9JFYyLl5UxATGOKFQ" alt="Plated" />
          </div>
          
          <div className="md:col-span-2 md:row-span-1 relative overflow-hidden rounded-3xl group shadow-lg min-h-[250px]">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5DI82lYHgL2E3fr8PStDnmeahGAelnh3dl_D_RKE8Pj6MtPkPa0OfOFazaa8m1ryL0dV1J0O3J1hvBncVad4DiAih7pcdKpBvXVcjk8L6IbbIcaB_iBZ6IsLw2nMyO9piHz_IVEWf75txpy33jPChLVU74wPfX4bSunblimHJ4ppwQc7SomvX71kGCLy-rgMx6qRi-RYSkWtD2A-Vm9LqUGAvw05niqbpbDjC1dyrTvcm-VyhPcoi7H_N8Q-pyH83RD-dEeXki_E" alt="Pastries" />
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-8">
          <div className="bg-white p-12 rounded-3xl shadow-xl paper-texture border border-secondary/5">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif text-secondary font-bold mb-3">Event Inquiry</h2>
              <p className="text-on-surface-variant font-medium opacity-70">Let us help you design the perfect confection for your event.</p>
            </div>
            
            <form className="space-y-8" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary/60">Name</label>
                  <input className="w-full px-6 py-4 bg-background border border-secondary/10 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-stone-300 font-medium" placeholder="Your Full Name" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary/60">Email</label>
                  <input className="w-full px-6 py-4 bg-background border border-secondary/10 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-stone-300 font-medium" placeholder="email@address.com" type="email"/>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary/60">Event Date</label>
                  <input className="w-full px-6 py-4 bg-background border border-secondary/10 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-medium" type="date"/>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary/60">Occasion Type</label>
                  <select className="w-full px-6 py-4 bg-background border border-secondary/10 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-medium appearance-none">
                    <option>Wedding</option>
                    <option>Birthday</option>
                    <option>Corporate Event</option>
                    <option>Anniversary</option>
                    <option>Other Milestone</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary/60">Tell us about your vision</label>
                <textarea className="w-full px-6 py-4 bg-background border border-secondary/10 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-stone-300 font-medium h-40 resize-none" placeholder="Guest count, flavor preferences, theme details..."></textarea>
              </div>

              <div className="flex justify-center pt-6">
                <button className="bg-secondary text-white px-16 py-5 rounded-xl font-bold tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl uppercase text-xs" type="submit">
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
