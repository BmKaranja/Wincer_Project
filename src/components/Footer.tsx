import { Share2, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-container dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 transition-opacity mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 gap-8 max-w-7xl mx-auto">
        {/* 
          ==========================================
          FOOTER DETAIL SETTINGS
          Change the copyright and brand name here
          ========================================== 
        */}
        <div className="space-y-2 text-center md:text-left">
          <div className="text-lg font-serif italic text-secondary">Luxe Confections</div>
          <p className="font-serif text-sm tracking-wide text-on-surface-variant opacity-90">
            © 2024 Luxe Confections. Handcrafted with Artisanal Elegance.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 font-serif text-sm tracking-wide text-on-surface-variant">
          <a className="hover:text-secondary transition-colors" href="#">Provenance</a>
          <a className="hover:text-secondary transition-colors" href="#">Wholesale</a>
          <a className="hover:text-secondary transition-colors" href="#">Sustainability</a>
          <a className="hover:text-secondary transition-colors" href="#">Privacy</a>
        </div>

        <div className="flex items-center gap-6 text-secondary">
          <button className="hover:scale-110 transition-transform"><Share2 className="w-5 h-5" /></button>
          <button className="hover:scale-110 transition-transform"><Mail className="w-5 h-5" /></button>
        </div>
      </div>
    </footer>
  );
}
