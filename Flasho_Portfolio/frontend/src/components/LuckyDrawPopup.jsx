import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LuckyDrawPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup immediately when user opens/refreshes website
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEnterDraw = () => {
    setIsOpen(false);
    navigate('/lucky-draw');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-secondary/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-transparent my-auto flex flex-col items-center"
          >
            {/* Close Button Top Right */}
            <button
              onClick={handleClose}
              className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-30 w-11 h-11 rounded-full bg-secondary/90 hover:bg-secondary text-white flex items-center justify-center backdrop-blur-md shadow-2xl border border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Close popup"
            >
              <X size={22} className="stroke-[2.5]" />
            </button>

            {/* Poster Card */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/10 group">
              <img
                src="/Lucky-Draw.png"
                alt="Rangnova 2026 Lucky Draw - Flasho"
                className="w-full h-auto max-h-[72vh] object-contain mx-auto block select-none"
              />

              {/* Action Button embedded seamlessly into the poster bottom */}
              <div className="p-4 sm:p-5 bg-gradient-to-t from-black via-black/90 to-transparent -mt-16 sm:-mt-20 relative z-20 flex flex-col items-center">
                <button
                  onClick={handleEnterDraw}
                  className="w-full py-4 px-6 rounded-full bg-primary hover:bg-accent text-white font-display font-bold text-base sm:text-lg shadow-[0_0_30px_rgba(46,175,77,0.55)] hover:shadow-[0_0_40px_rgba(46,175,77,0.75)] flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Ticket size={22} />
                  <span>Enter Lucky Draw</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
