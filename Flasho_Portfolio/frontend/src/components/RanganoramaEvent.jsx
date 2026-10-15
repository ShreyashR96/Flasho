import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Sparkles, Ticket, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RanganoramaEvent() {
  return (
    <section className="relative py-16 bg-secondary text-white overflow-hidden border-b border-white/10">
      {/* Background Glow */}
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-80 h-80 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Event Box matching Flasho Design System */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Event Details & Action */}
            <div className="lg:col-span-7 flex flex-col items-start">
              
              {/* Partner Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-4">
                <Sparkles size={14} /> Proud Service Partner • Flasho
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
                Rangnova <span className="text-primary">2026</span> 🎉
              </h2>

              <p className="text-primary font-medium text-sm sm:text-base mt-1 tracking-wider uppercase">
                Tradition • Music • Togetherness
              </p>

              <p className="text-gray-300 text-base sm:text-lg mt-3 leading-relaxed">
                Join Kolhapur’s biggest festive cultural gathering! Experience traditional celebration, live music, and the official <strong className="text-white font-semibold">Flasho Mega Lucky Draw Contest</strong> live on stage.
              </p>

              {/* Schedule Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 w-full">
                <div className="flex items-center gap-3 bg-[#181818] border border-white/5 rounded-2xl p-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400">Date</p>
                    <p className="text-white font-display font-bold text-sm">16 Oct 2026</p>
                    <p className="text-[11px] text-gray-400">Friday</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#181818] border border-white/5 rounded-2xl p-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400">Time</p>
                    <p className="text-white font-display font-bold text-sm">7:30 PM</p>
                    <p className="text-[11px] text-gray-400">Onwards</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#181818] border border-white/5 rounded-2xl p-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400">Venue</p>
                    <p className="text-white font-display font-bold text-sm truncate">Tej Agro Tourism</p>
                    <p className="text-[11px] text-gray-400">Kolhapur</p>
                  </div>
                </div>
              </div>


              {/* Action Button matching Flasho Theme */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/lucky-draw"
                  className="bg-primary hover:bg-accent text-white font-display font-bold text-base px-8 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(46,175,77,0.25)] hover:shadow-[0_0_40px_rgba(46,175,77,0.4)] flex items-center justify-center gap-2.5 active:scale-95 group cursor-pointer"
                >
                  <Ticket size={20} className="group-hover:rotate-12 transition-transform" />
                  <span>Enter Lucky Draw</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-primary" /> Free Entry
                  </span>
                  <span>•</span>
                  <span>⚡ Pass Hai, Fast Hai.</span>
                </div>
              </div>

            </div>

            {/* Right Column: Official Event Poster Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white max-w-sm group">
                <img
                  src="/Lucky-Draw.png"
                  alt="Flasho Service Partner - Rangnova 2026"
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-102"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
