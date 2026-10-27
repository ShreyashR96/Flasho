import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone, Loader2 } from 'lucide-react';
import axios from 'axios';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (apiUrl) {
        await axios.post(`${apiUrl}/contact`, data);
      } else {
        await addDoc(collection(db, 'messages'), {
          ...data,
          type: 'Contact',
          createdAt: serverTimestamp()
        });
      }
      
      toast.success("Thanks! We'll reach out soon.");
      reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Column: Contact Info */}
            <div className="bg-secondary text-white p-10 md:p-16 flex flex-col justify-between">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariant}
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Let's Connect</h2>
                <p className="text-gray-400 mb-12">
                  Have questions or need assistance? Our team is here to help you navigate the Flasho ecosystem.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <Mail className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email Us</h4>
                      <p className="text-gray-400">hello@flasho.services</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Call / WhatsApp</h4>
                      <p className="text-gray-400">
                        <a href="tel:+919561850928" className="hover:text-primary transition-colors">+91 9561850928</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Visit Us</h4>
                      <p className="text-gray-400">Kolhapur, Maharashtra, India</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Form */}
            <div className="p-10 md:p-16">
              <motion.form 
                onSubmit={handleSubmit(onSubmit)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariant}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Full Name</label>
                  <input 
                    type="text" 
                    {...register("name", { required: "Name is required" })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Rohan Sharma"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      {...register("phone", { 
                        required: "Phone is required",
                        minLength: { value: 10, message: "Must be at least 10 digits" }
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="+91 98765 43210"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Email Address</label>
                    <input 
                      type="email" 
                      {...register("email", { 
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="rohan.sharma@company.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">I am a...</label>
                  <select 
                    {...register("role", { required: "Please select a role" })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select your role</option>
                    <option value="customer">Customer</option>
                    <option value="professional">Professional</option>
                    <option value="business_partner">Business Partner</option>
                    <option value="investor">Investor</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Message</label>
                  <textarea 
                    {...register("message", { required: "Message is required" })}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-accent text-secondary font-bold text-lg py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </motion.form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
