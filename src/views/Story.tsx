import { motion } from 'motion/react';
import { Sprout, Pointer as Hand, Hourglass, Quote } from 'lucide-react';

export default function Story({ setView }: { setView: (v: string) => void }) {
  const philosophy = [
    {
      title: "Provenance",
      desc: "Single-origin Madagascar vanilla beans and estate-grown Belgian chocolate form the heartbeat of our recipes.",
      icon: Sprout
    },
    {
      title: "Hand-Finished",
      desc: "Every petal of a sugar flower is hand-veined; every layer of buttercream is hand-smoothed for a human touch.",
      icon: Hand
    },
    {
      title: "The Slow Method",
      desc: "We allow our doughs to rest and our flavors to mature, respecting the natural timeline of custom baking.",
      icon: Hourglass
    }
  ];

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 paper-texture"
    >
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <span className="text-sm font-bold text-secondary tracking-[0.3em] block mb-6 uppercase">Since 1994</span>
            <h1 className="text-6xl font-serif text-secondary mb-8 font-bold leading-tight">The Baker's Journey</h1>
            <p className="text-xl text-on-surface-variant mb-10 leading-relaxed font-sans opacity-80">
              What began as a passion for creating personalized memories has evolved into Wincer Cake House. We've spent years mastering the craft of custom cake making here in Nairobi, believing that every cake tells a unique story of joy and celebration.
            </p>
            <div className="italic text-2xl font-serif text-secondary border-l-4 border-secondary/20 pl-8 py-4 relative">
              <Quote className="absolute -top-4 -left-2 w-8 h-8 text-secondary/10" />
              "We don't just bake; we create customized masterpieces that bring your sweetest visions to life."
            </div>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-6 bg-primary-container/40 -z-10 rounded-2xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
              <img 
                className="w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl border border-secondary/5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrMH7qKm3B8ACG4YoFGS_DC9xFzFPjTRXy3KlZvdUpANXOw434ZbAu65ZQQ_1FgLgHXgTCbg9D7_luj41VkFD8qB_yTc-fKqANBKn4vflV02ULvbbWwONRFYKFW3bfVfbSpQukC6pX-t752yZtCZUSgctwYCCRt1rld5p3PA5EfkgQRC96nG5ugSyVWLpO-kW2Zfbh4-4rqweufj18ag6i2_Vg02bX3f0yKvZ2cTQVF_b1kRfUIc4zeqi-27PZyzQyKuEbctzYaA" 
                alt="Chef at Work"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-surface-container-low py-32 border-y border-secondary/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-serif text-secondary mb-6 font-bold">Our Philosophy</h2>
            <p className="text-xl text-on-surface-variant font-medium opacity-70">We believe that luxury lies in the integrity of the ingredient. No shortcuts, no compromises—only the finest elements harvested with respect for the earth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {philosophy.map((item, idx) => (
              <motion.div 
                key={item.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-10 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-secondary/5 group"
              >
                <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <item.icon className="text-secondary w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif text-secondary font-bold mb-4">{item.title}</h3>
                <p className="text-on-surface-variant font-medium leading-relaxed opacity-80">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Bento Grid */}
      <section className="max-w-7xl mx-auto px-8 py-32">
        <h2 className="text-4xl font-serif text-secondary text-center mb-20 font-bold">The Kitchen & Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
          <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl group shadow-lg">
            <img className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6yTIJOGnNS4X70Hdx3wH6Jk4bHgTgN5QTQJf7X1Ndz85fy8T6oNMuMGtx0d0R2B_PyzQ7DxA2rjTyICtNXJn81L1Gue2KDtCYQbbRMI_4v2Fgh3PYSgb39C2YFU_IEPBRu2Lwe5WglR1BkmllhmRec2h_Fj8dD6lXXltecw8N1Uzm5RVYcVWnSeu7A7_gCPgqqoSqtZd4lvHejK6YWBpXv40JlXJ3ZgvtKOpIodg7VWkY3LwUWG5hqQaIBQ9A-UuSCsMtuXqzP8M" alt="Decoration" />
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
              <span className="text-white text-xs font-bold tracking-[0.4em] uppercase">The Final Touch</span>
            </div>
          </div>
          
          <div className="md:col-span-2 md:row-span-1 relative overflow-hidden rounded-3xl group shadow-lg min-h-[300px]">
            <img className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCadnyLMzm_-uVGnEvwNZiFFxelRF8Am0DxR2LR14kgo_CNQl9AQiADp2l56INeWEY_4RX9DGUMG-Jem_O_nPQIgWcISVJncKu2CzCPe2_4toc07y5dV7MUywZqSyk9MrGFYiAPd440RyrgklJ-Wza3mAEnql0RquDhboqvW4SSm8P64jMFGyIAnE0JxNsmLY-vBBfxwcUfWDi4_MECGqLVidKJHSmlJYp7TfQR6FXk19Kxv15Bucvop4vn9Fzh3fMjQtrWF-4Slbs" alt="Chocolate" />
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-10">
              <span className="text-white text-xs font-bold tracking-[0.4em] uppercase">Belgian Infusion</span>
            </div>
          </div>

          <div className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-3xl group shadow-lg min-h-[250px]">
            <img className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJl8QsLLjaTjZHeIJqy1DsOlxATLc2LUgCPsvXKgBzBgWiowXE2dA4-0k0el32QV3HL92aWWR1M3G2qpCJ5fV3obF39W46Hp5bbBvkLXDg26Ytl3BWgNuQEckvp-1zaHP-QYKnvFw9n2Caak8rKAX7D5X9YAtXnI1Zf9NF7Oau0QVvwSWHheMkPvwOL36bC0588WmYG5XC8O8AiqKZqS936l5xE9lg_wo0OUB7eHKlZjZPqFGfoLuSnQROWJT46HTMLIL9MfdCl30" alt="Flour" />
          </div>
          
          <div className="md:col-span-1 md:row-span-1 relative overflow-hidden rounded-3xl group shadow-lg min-h-[250px]">
            <img className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdSb_uBBip_G5v0utn2YWIslRhpRx3uAelXk3_PLVKRDyWjjd5TXuohOaiV4QiaCTohlJ5gy2Jfs3oSgVa24H183qdHTfBh3l2oOtTgMGb4uLxp7jY4mnsOupompXBmMmSADidh3OTlsHw8jsLj86MiE8RDmrql4dVuKwDVAV3RjqXmu3ZhiDXQdklvW2Tz9CIl1Y_k1SNuND1CexkjM1cLU8Mjxh_1I2Wz0zt0-xzKMlp7m9vAhoUK5_oEdbKwn-JlTXA_IaXYSw" alt="Macarons" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-8 py-32 border-t border-secondary/5">
        <div className="flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="max-w-md">
            <h2 className="text-4xl font-serif text-secondary mb-8 font-bold">Rooted in Core Values</h2>
            <p className="text-xl text-on-surface-variant leading-relaxed opacity-70">Our foundation is built on three pillars that guide every creation that leaves our atelier.</p>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              { id: '01', title: 'Quality', text: 'We source only organic dairy and seasonal fruits, ensuring that every bite is as vibrant as it is luxurious.' },
              { id: '02', title: 'Artistry', text: 'We treat every confection as a canvas, blending classic techniques with modern aesthetic sensibilities.' },
              { id: '03', title: 'Love', text: 'The final ingredient in every recipe. We bake for the moments that matter most to you.' }
            ].map(v => (
              <div key={v.id} className="space-y-6">
                <span className="text-3xl font-serif text-secondary/30 italic block tracking-tighter">{v.id} / {v.title}</span>
                <p className="text-on-surface-variant font-medium leading-relaxed opacity-80">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
