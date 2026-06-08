import { Share2, Mail } from 'lucide-react';

export default function Footer({ setView }: { setView: (v: string) => void }) {
  return (
    <footer className="bg-primary-container dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 transition-opacity mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 gap-8 max-w-7xl mx-auto">
        {/* 
          ==========================================
          FOOTER DETAIL SETTINGS
          Change the copyright and brand name here
          ========================================== 
        */}
        <div className="space-y-4 text-center md:text-left">
          <div className="text-lg font-serif italic text-secondary">Wincer Cake House</div>
          <p className="font-serif text-sm tracking-wide text-on-surface-variant opacity-90 max-w-xs">
            © 2026 Wincer Cake House. Bespoke Custom Cakes. Handcrafted in Nairobi with love and the finest ingredients.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 font-serif text-sm tracking-wide text-on-surface-variant">
          <button onClick={() => setView('home')} className="hover:text-secondary transition-colors">Provenance</button>
          <button onClick={() => setView('catalog')} className="hover:text-secondary transition-colors">Wholesale</button>
          <button onClick={() => setView('story')} className="hover:text-secondary transition-colors">Sustainability</button>
          <button onClick={() => setView('privacy')} className="hover:text-secondary transition-colors">Privacy</button>
        </div>

        <div className="flex items-center gap-6 text-secondary">
          <button className="hover:scale-110 transition-transform"><Share2 className="w-5 h-5" /></button>
          <button className="hover:scale-110 transition-transform"><Mail className="w-5 h-5" /></button>
        </div>
      </div>
    </footer>
  );
}
