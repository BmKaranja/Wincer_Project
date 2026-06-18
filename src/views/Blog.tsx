import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, User, ArrowRight, ArrowLeft, Heart, Share2, ShoppingBag, Star, Check } from 'lucide-react';
import { supabase } from '../supabase';

interface BlogProps {
  onSelectProduct?: (product: any) => void;
  cakes?: any[];
  posts?: any[];
}

export default function Blog({ onSelectProduct, cakes, posts = [] }: BlogProps) {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  // Sync with live data from the posts prop
  const currentPost = selectedPost ? (posts.find(p => p.id === selectedPost.id) || selectedPost) : null;

  const handleOrderCake = () => {
    if (onSelectProduct && cakes && currentPost) {
      // Find a cake that matches the relatedCakeId or search by title
      let relatedCake = cakes.find(c => c.id === currentPost.relatedCakeId);
      
      if (!relatedCake) {
        // Fallback: search for "Black Forest" or similar keywords if it's the black forest post
        const searchTerm = currentPost.title.toLowerCase().includes('black forest') ? 'black forest' : '';
        if (searchTerm) {
          relatedCake = cakes.find(c => c.title.toLowerCase().includes(searchTerm));
        }
      }

      if (relatedCake) {
        onSelectProduct(relatedCake);
      }
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleLike = async () => {
    if (hasLiked || !currentPost?.id || currentPost.id < 10) return;
    
    try {
      setHasLiked(true);
      await supabase.from('blog_posts')
        .update({ likes: (currentPost.likes || 0) + 1 })
        .eq('id', currentPost.id);
    } catch (err) {
      console.error('Failed to like post:', err);
      setHasLiked(false);
    }
  };

  if (currentPost) {
    return (
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-24 max-w-5xl mx-auto px-8"
      >
        <button 
          onClick={() => { setSelectedPost(null); setHasLiked(false); }}
          className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest hover:gap-4 transition-all mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-secondary/50 mb-6 font-sans">
            <span className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full">{currentPost.category}</span>
            <span className="flex items-center gap-1 font-sans"><Calendar className="w-4 h-4" /> {currentPost.date}</span>
            <span className="flex items-center gap-1 font-sans"><User className="w-4 h-4" /> {currentPost.author}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-secondary mb-8 italic leading-tight">
            {currentPost.title}
          </h1>
        </div>

        <div className="mb-16">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[500px] border border-secondary/5">
            <img 
              src={currentPost.img} 
              alt={currentPost.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-16">
          <div className="md:w-2/3">
            <div className="font-sans text-on-surface-variant leading-relaxed opacity-90 mb-12">
              {currentPost.content.split('\n').map((para: string, i: number) => (
                para.startsWith('###') ? 
                  <h3 key={i} className="text-2xl font-serif text-secondary italic mt-12 mb-6">{para.replace('###', '')}</h3> :
                  para.trim() && <p key={i} className="mb-6 text-lg">{para}</p>
              ))}
            </div>

            {currentPost.title.toLowerCase().includes('black forest') && (
              <div className="bg-secondary/5 rounded-[2rem] p-8 border border-secondary/10 flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg shrink-0">
                  <img src={currentPost.img} className="w-full h-full object-cover" alt="Cake Shortcut" />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-xl font-serif text-secondary italic mb-2">Tempted by the Forest?</h4>
                  <p className="text-sm text-on-surface-variant opacity-80 mb-4 font-sans">Taste the legend that started it all. Order your Freshly Baked Black Forest today.</p>
                  <button 
                    onClick={handleOrderCake}
                    className="bg-secondary text-white px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg mx-auto md:mx-0 font-sans"
                  >
                    <ShoppingBag className="w-4 h-4" /> Order This Cake
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="md:w-1/3">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-secondary/5">
                <div className="flex items-center gap-2 mb-6 text-secondary text-lg font-serif italic">
                  <Star className="w-5 h-5 fill-secondary" />
                  <h4>Professional Tips</h4>
                </div>
                <ul className="space-y-4">
                  {(currentPost.tips || []).map((tip: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-on-surface-variant font-sans opacity-90">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-2" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-secondary p-8 rounded-[2rem] text-white shadow-xl relative">
                <h4 className="font-serif italic text-xl mb-4 text-white">Share the Passion</h4>
                <div className="flex gap-4">
                  <div className="relative">
                    <button 
                      onClick={handleShare}
                      className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors focus:outline-none"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                    <AnimatePresence>
                      {showShareTooltip && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-secondary text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Check className="w-3 h-3" /> Link Copied
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    disabled={hasLiked}
                    className={`p-3 rounded-xl focus:outline-none flex items-center gap-2 transition-all ${hasLiked ? 'bg-white text-secondary shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    <motion.div
                      animate={hasLiked ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Heart className={`w-5 h-5 ${hasLiked ? 'fill-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.6)]' : ''}`} />
                    </motion.div>
                    {(currentPost.likes || 0) > 0 && <span className="text-xs font-bold font-sans">{currentPost.likes}</span>}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    );
  }

  const displayPosts = posts;

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 max-w-7xl mx-auto px-8"
    >
      <div className="text-center mb-16">
        <span className="text-secondary font-bold tracking-[0.3em] uppercase mb-4 block text-sm font-sans">Wincer Food Blog</span>
        <h1 className="text-5xl font-serif text-secondary mb-4 italic">Baking Memories, One Story at a Time</h1>
        <div className="w-24 h-1 bg-secondary mx-auto rounded-full"></div>
      </div>

      {displayPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {displayPosts.map((post, idx) => (
            <motion.article 
              key={post.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="aspect-[4/5] overflow-hidden rounded-3xl mb-6 relative shadow-sm transition-shadow hover:shadow-xl border border-secondary/5">
                <img 
                  src={post.img} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-sm text-secondary text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full font-sans">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-secondary/50 mb-4 font-sans">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
              </div>

              <h2 className="text-2xl font-serif text-secondary mb-4 group-hover:text-secondary group-hover:underline decoration-secondary/30 transition-all leading-tight">
                {post.title}
              </h2>
              
              <p className="text-on-surface-variant font-sans mb-6 opacity-80 leading-relaxed">
                {post.excerpt}
              </p>

              <button className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest group-hover:gap-4 transition-all font-sans">
                Read More <ArrowRight className="w-4 h-4" />
              </button>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-secondary/40 italic font-serif text-xl">Our stories are currently being baked into perfection. Please check back soon!</p>
        </div>
      )}

      {/* Newsletter Section */}
      <section className="mt-32 bg-primary-container/30 rounded-[3rem] p-16 text-center border border-secondary/10">
        <h2 className="text-3xl font-serif text-secondary mb-6 italic">Stay in the Sweet Loop</h2>
        <p className="max-w-xl mx-auto text-on-surface-variant mb-10 opacity-80 font-sans text-lg">
          Subscribe to our food blog for exclusive baking tips, first look at new flavors, and special offers from Wincer Cake House.
        </p>
        <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex-grow px-8 py-4 bg-white border border-secondary/10 rounded-2xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all placeholder:text-stone-300 font-medium font-sans"
          />
          <button className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg font-sans">
            Join
          </button>
        </div>
      </section>
    </motion.main>
  );
}

