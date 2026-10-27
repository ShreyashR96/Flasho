import { useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  Loader2, 
  Trash2
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { createDeletionRequest } from '../utils/deleteRequestsStore';

export default function DeleteAccount() {
  useSEO({
    title: 'Delete Account Request | Flasho',
    description: 'Request deletion of your Flasho account and associated personal data.'
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role || 'client',
        reason: data.reason || 'Not specified',
        details: data.details || '',
        status: 'pending',
        requestedAt: new Date().toISOString()
      };

      await createDeletionRequest(payload);

      setSubmittedData(payload);
      setSubmissionSuccess(true);
      toast.success("Account deletion request submitted successfully!");
      reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit request. Please try again or contact hello@flasho.services.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-[#050505] text-white">
      {/* Header Section */}
      <div className="relative border-b border-white/5 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex items-center gap-3 text-sm font-medium mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-gray-300 border border-white/10 shadow-sm">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-gray-500">/</span>
              <span className="text-white">Legal</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <span className="text-red-400 tracking-widest uppercase text-[11px] font-bold">Account Deletion</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold mb-4">
            <Clock size={14} /> 24-Hour Processing Window
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white mb-6 tracking-tight">
            Delete My Account<span className="text-primary">.</span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Submit your account deletion request below. In compliance with Google Play Store & Apple App Store regulations, your account and all associated personal records will be permanently removed within <strong className="text-white">24 hours</strong>.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <AnimatePresence mode="wait">
          {submissionSuccess ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#111111] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={42} />
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 mb-3">
                Request Registered
              </span>

              <h2 className="text-3xl font-display font-bold text-white mb-4">
                Account Deletion Request Submitted
              </h2>

              <p className="text-gray-300 max-w-xl mx-auto mb-6 text-base leading-relaxed">
                Your request has been forwarded to the Flasho administrative panel.
              </p>

              {/* Registration Notice Banner */}
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 max-w-xl mx-auto mb-8 text-left shadow-lg">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                    ℹ️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary mb-1">
                      Account Registration Notice
                    </h4>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      If your account is registered with Flasho, you will receive the official deletion confirmation email at <span className="text-primary font-semibold underline">{submittedData?.email}</span> within the next <strong className="text-white">24 hours</strong> once verified and processed by our admin team.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-[#0a0a0a] rounded-2xl p-6 max-w-xl mx-auto text-left border border-white/5 mb-8">
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">Deletion Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="text-sm font-semibold text-white">Request Received</p>
                      <p className="text-xs text-gray-400">Your details have been logged in our secure admin queue.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="text-sm font-semibold text-white">Manual Admin Verification (In Progress)</p>
                      <p className="text-xs text-gray-400">Our team verifies pending transactions, balances, or orders.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="text-sm font-semibold text-white">Permanent Purge (Within 24 Hours)</p>
                      <p className="text-xs text-gray-400">All authentication credentials, addresses, and profiles will be erased.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                    <div>
                      <p className="text-sm font-semibold text-white">Final Email Confirmation</p>
                      <p className="text-xs text-gray-400">
                        If your account is registered, a deletion receipt will be sent to <span className="text-primary font-medium">{submittedData?.email}</span> within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/"
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary text-secondary font-bold rounded-xl hover:bg-accent transition-all shadow-md inline-flex items-center justify-center gap-2"
                >
                  Return to Homepage <ArrowRight size={18} />
                </Link>
                <button
                  onClick={() => setSubmissionSuccess(false)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all border border-white/10 text-sm"
                >
                  Submit Another Request
                </button>
              </div>
            </motion.div>
          ) : (
            /* Form State */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Important Policy Notice Banner */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">
                    Permanent Account Deletion Notice
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    Account deletion is <strong className="text-red-400">permanent and irreversible</strong>. Once deleted by our administrator:
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                    <li>Your login credentials and account profile will be permanently wiped.</li>
                    <li>Saved delivery addresses, past booking histories, and invoices will be inaccessible.</li>
                    <li>Any unused wallet balances or loyalty credits will be forfeited.</li>
                    <li>You will receive a notification email via our automated dispatch system once the account is removed.</li>
                  </ul>
                </div>
              </div>

              {/* Form Container */}
              <div className="bg-[#111111] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-xl">
                <div className="border-b border-white/10 pb-6 mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">Account Deletion Request Form</h2>
                    <p className="text-gray-400 text-sm mt-1">Please provide the credentials associated with your Flasho account.</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-400">
                    <Trash2 size={20} />
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text" 
                        {...register("name", { required: "Full name is required" })}
                        placeholder="e.g. Rahul Patil"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
                  </div>

                  {/* Contact Info (Phone & Email) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Registered Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                          type="tel"
                          {...register("phone", { 
                            required: "Registered phone is required",
                            minLength: { value: 10, message: "Must be a valid 10-digit number" }
                          })}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">The phone number used during OTP / account signup.</p>
                      {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Registered Email Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                          type="email"
                          {...register("email", { 
                            required: "Email address is required for confirmation receipt",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                          })}
                          placeholder="e.g. rahul@example.com"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">We will send your deletion confirmation here via Nodemailer.</p>
                      {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Account Role / Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Account Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...register("role", { required: "Please select your account type" })}
                      defaultValue="client"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    >
                      <option value="client" className="bg-[#111111] text-white">Customer / Client</option>
                      <option value="worker" className="bg-[#111111] text-white">Service Partner / Worker</option>
                      <option value="agency" className="bg-[#111111] text-white">Agency / Franchise</option>
                      <option value="other" className="bg-[#111111] text-white">Other</option>
                    </select>
                  </div>

                  {/* Reason for Deletion */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Primary Reason for Deletion <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...register("reason", { required: "Please select a reason" })}
                      defaultValue="No longer need Flasho services"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#0a0a0a] border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    >
                      <option value="No longer need Flasho services" className="bg-[#111111] text-white">No longer need Flasho services</option>
                      <option value="Privacy concerns or data removal" className="bg-[#111111] text-white">Privacy concerns or data removal</option>
                      <option value="Switching to another platform" className="bg-[#111111] text-white">Switching to another platform</option>
                      <option value="Account security or unauthorized access" className="bg-[#111111] text-white">Account security or unauthorized access</option>
                      <option value="Too many notifications / SMS" className="bg-[#111111] text-white">Too many notifications / SMS</option>
                      <option value="Relocated outside service area" className="bg-[#111111] text-white">Relocated outside service area</option>
                      <option value="Other reason" className="bg-[#111111] text-white">Other reason</option>
                    </select>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Additional Comments or Feedback <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <textarea 
                      {...register("details")}
                      rows="3"
                      placeholder="Please let us know if there is anything we could have done better..."
                      className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                    ></textarea>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        {...register("confirmPolicy", { required: "You must confirm this declaration to proceed" })}
                        className="mt-1 w-4 h-4 rounded text-red-500 bg-gray-900 border-gray-700 focus:ring-red-400 focus:ring-offset-gray-900"
                      />
                      <span className="text-xs text-gray-300 leading-relaxed">
                        I understand that submitting this request will permanently delete my Flasho account, active bookings, saved addresses, and profile data within <strong className="text-white">24 hours</strong>. I acknowledge this action cannot be undone.
                      </span>
                    </label>
                    {errors.confirmPolicy && <p className="text-red-400 text-xs mt-2 pl-7">{errors.confirmPolicy.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-base py-4 rounded-xl transition-all shadow-lg hover:shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Submitting Deletion Request...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                        Request Account Deletion (24h)
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    Need help instead of deleting? Contact our support team at <a href="mailto:hello@flasho.services" className="text-primary hover:underline">hello@flasho.services</a>, call <a href="tel:+919561850928" className="text-primary hover:underline font-semibold">+91 9561850928</a> or message on <a href="https://wa.me/919561850928" target="_blank" rel="noopener noreferrer" className="text-[#00C896] hover:underline font-semibold">WhatsApp</a>.
                  </p>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
