import { useLayoutEffect } from 'react';
import { Mail, Phone, MapPin, ArrowRight, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useSEO from '../hooks/useSEO';

export default function ContactUs() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useSEO({
    title: 'Contact Flasho — Reach Us for Home Services in Kolhapur',
    description: 'Get in touch with Flasho for home service inquiries, partnerships, or support. Call us at +91 9561850928 or email hello@flasho.services. Available 7 AM to 10 PM every day.',
    canonical: '/contact'
  });


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-body pt-32 pb-20 overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#27963C]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Available 7 A.M. to 10 P.M.
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white tracking-tight mb-6">
            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-400">talk.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Skip the forms. Reach out directly through the channels below. Our expert team is ready to assist you.
          </p>
        </motion.div>

        {/* Contact Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          
          {/* Email Card */}
          <motion.a 
            href="mailto:hello@flasho.services"
            variants={itemVariants}
            className="group relative bg-[#111111] border border-white/10 rounded-3xl p-8 hover:bg-[#151515] hover:border-primary/50 transition-all duration-500 overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-150 group-hover:bg-primary/20" />
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-white group-hover:bg-primary group-hover:text-black transition-colors duration-300 relative z-10">
              <Mail size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Email Us</h3>
            <p className="text-gray-400 mb-12 relative z-10 flex-grow">For general inquiries, partnerships, and detailed support requests.</p>
            <div className="flex items-center justify-between mt-auto relative z-10">
              <span className="text-base sm:text-lg font-semibold text-primary">hello@flasho.services</span>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 group-hover:border-primary group-hover:bg-primary group-hover:text-black transition-all duration-300 transform group-hover:translate-x-1 shrink-0 ml-2">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.a>

          {/* Phone & WhatsApp Card - Highlighted */}
          <motion.a 
            href="https://wa.me/919561850928"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            className="group relative bg-gradient-to-br from-primary to-[#1e7a33] rounded-3xl p-8 hover:shadow-[0_0_40px_rgba(46,175,77,0.3)] transition-all duration-500 overflow-hidden transform hover:-translate-y-2 flex flex-col"
          >
            <div className="absolute -bottom-10 -right-10 opacity-10 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
              <Phone size={180} />
            </div>
            <div className="w-14 h-14 bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 text-white relative z-10">
              <Phone size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Call & WhatsApp</h3>
            <p className="text-white/90 mb-12 font-medium relative z-10 flex-grow">Need immediate assistance? Call us directly or message our support team on WhatsApp.</p>
            <div className="flex items-center justify-between mt-auto relative z-10">
              <span className="text-xl md:text-2xl font-bold text-white">+91 9561850928</span>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2">
                <ArrowRight size={18} />
              </div>
            </div>
          </motion.a>

          {/* Location Card */}
          <motion.div 
            variants={itemVariants}
            className="group relative bg-[#111111] border border-white/10 rounded-3xl p-8 hover:bg-[#151515] transition-all duration-500 flex flex-col overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 opacity-5 text-white transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
              <Building2 size={180} />
            </div>
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-white group-hover:text-primary transition-colors duration-300 relative z-10">
              <MapPin size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">HQ Location</h3>
            <p className="text-gray-400 mb-12 flex-grow relative z-10">Our core operations and technical team operate from our main headquarters.</p>
            <div className="mt-auto relative z-10">
              <span className="text-lg font-semibold text-white block">Kolhapur,</span>
              <span className="block text-gray-500">Maharashtra, India</span>
            </div>
          </motion.div>

        </motion.div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 text-center border-t border-white/10 pt-10"
        >
          <p className="text-gray-500">
            For Flasho Service Professionals, please use the dedicated support section inside the Provider App.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
