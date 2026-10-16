import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { Trophy, CheckCircle, MapPin, Phone, Mail, User, ArrowRight, Ticket, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import { luckyDrawDb } from '../utils/luckyDrawDb';

const KOLHAPUR_AREAS = [
  'Rajarampuri',
  'Tarabai Park',
  'Shahupuri',
  'Rankala / Sambhajinagar',
  'Nagala Park',
  'Kadamwadi',
  'Kalamba',
  'Gandhinagar',
  'Laxmipuri',
  'Bhavani Mandap',
  'Ruikar Colony',
  'Uchgaon',
  'Kasaba Bawada',
  'Pratibha Nagar',
  'Other Kolhapur Area'
];

export default function LuckyDrawRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [customArea, setCustomArea] = useState('');

  useSEO({
    title: 'Flasho Lucky Draw — Scan & Win | Kolhapur',
    description: 'Enter the Flasho Lucky Draw in Kolhapur! Fill the form to get your lucky ticket number. Pass hai, Fast hai!',
    canonical: '/lucky-draw'
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      area: KOLHAPUR_AREAS[0]
    }
  });

  const selectedArea = watch('area');

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const isOtherAreaSelected = formData.area === 'Other Kolhapur Area';
      const finalArea = isOtherAreaSelected && customArea.trim() 
        ? `${customArea.trim()}, Kolhapur`
        : `${formData.area}, Kolhapur`;

      const entry = await luckyDrawDb.saveParticipant({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        area: finalArea,
        selectedDropdownArea: formData.area,
        isOtherArea: isOtherAreaSelected
      });

      setTicketData(entry);

      if (entry.isExisting) {
        const fieldName = entry.matchedBy === 'email' ? 'email address' : 'mobile number';
        toast(`Welcome back, ${entry.name}! You are already registered with this ${fieldName}. Here is your ticket.`, {
          icon: '🎟️',
          duration: 4500
        });
      } else {
        triggerConfetti();
        toast.success(`🎉 Entry confirmed! Ticket #${entry.ticketNumber} is reserved in your name.`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not submit your entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-secondary font-body flex flex-col justify-between py-8 px-4 sm:px-6">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="max-w-md mx-auto w-full text-center mb-6">
        <Link to="/" className="inline-block mb-3 focus:outline-none">
          <img 
            src="/flasho-logo.png" 
            alt="Flasho" 
            className="h-20 sm:h-24 md:h-28 w-auto max-w-[260px] sm:max-w-[320px] mx-auto object-contain transition-transform hover:scale-105" 
          />
        </Link>
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles size={14} /> Pass hai, Fast hai • Lucky Draw
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!ticketData ? (
            /* Registration Form View (Full White & Flasho Theme) */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl w-full"
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-secondary">
                  Scan & Win Lucky Draw 🎁
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your details below to get your official lucky ticket number!
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Patil"
                      {...register('name', { required: 'Please enter your full name' })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-secondary text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1.5">
                    WhatsApp / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="98XXXXXXXX"
                      {...register('phone', {
                        required: 'Please enter your phone number',
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: 'Please enter a valid 10-digit Indian phone number'
                        }
                      })}
                      className="w-full bg-white border border-gray-200 rounded-r-xl py-3 px-3.5 text-secondary text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="e.g. rahul@gmail.com"
                      {...register('email', {
                        required: 'Please enter your email',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-secondary text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Location / Area */}
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1.5">
                    Location Area <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      {...register('area', { required: 'Please select your area' })}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                    >
                      {KOLHAPUR_AREAS.map(area => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Area */}
                {selectedArea === 'Other Kolhapur Area' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <input
                      type="text"
                      placeholder="Enter your street / locality name"
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-secondary text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3.5 px-6 rounded-xl bg-primary hover:bg-accent text-white font-display font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Reserving Ticket in Queue...</span>
                    </div>
                  ) : (
                    <>
                      <span>Get My Lucky Ticket</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Trust signals */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-around text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-primary" /> Free Entry
                </span>
                <span className="flex items-center gap-1">
                  <Trophy size={14} className="text-amber-500" /> 3 Winners
                </span>
                <span>⚡ Kolhapur</span>
              </div>
            </motion.div>
          ) : (
            /* Ticket Confirmation View (Pure White & Flasho Green) */
            <motion.div
              key="ticket"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
                <div className="w-14 h-14 bg-emerald-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                  <Ticket size={28} />
                </div>

                {ticketData.isExisting ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 shadow-sm">
                    <CheckCircle size={14} /> Already Registered!
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-primary text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-100 shadow-sm">
                    <CheckCircle size={14} /> Entry Registered!
                  </div>
                )}

                <h2 className="text-2xl sm:text-3xl font-display font-bold text-secondary">
                  {ticketData.isExisting ? 'Your Official Ticket' : 'Your Lucky Ticket'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {ticketData.isExisting
                    ? `This ${ticketData.matchedBy === 'email' ? 'email address' : 'mobile number'} is already registered in the Lucky Draw. Here is your official ticket!`
                    : 'Please save or remember your ticket number. It will be called on the big screen!'}
                </p>

                {/* Ticket Number Highlight Box */}
                <div className="my-6 bg-gradient-to-b from-gray-50 to-white border-2 border-dashed border-primary/40 rounded-2xl p-6 relative overflow-hidden">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                    YOUR OFFICIAL TICKET NUMBER
                  </p>
                  
                  <div className="text-3xl sm:text-4xl font-mono font-black text-secondary tracking-widest my-2 select-all">
                    {ticketData.ticketNumber}
                  </div>

                  <p className="text-xs text-primary font-semibold mt-2">
                    Registered to: {ticketData.name} ({ticketData.phone})
                  </p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/"
                    className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-accent text-white font-display font-bold text-center block text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    Explore Flasho Services
                  </Link>

                  <button
                    onClick={() => {
                      setTicketData(null);
                      reset({
                        name: '',
                        phone: '',
                        email: '',
                        area: KOLHAPUR_AREAS[0]
                      });
                      setCustomArea('');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs text-center transition-all cursor-pointer font-medium"
                  >
                    + Register Another Person
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center mt-6 text-xs text-gray-400">
        <p>© 2025 Flasho. All rights reserved.</p>
        <p className="mt-0.5 font-medium text-gray-500">Kolhapur, Maharashtra • Pass hai, Fast hai</p>
      </footer>
    </div>
  );
}
