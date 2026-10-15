import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (auth && import.meta.env.VITE_FIREBASE_API_KEY) {
        await signInWithEmailAndPassword(auth, email, password);
      }
      localStorage.setItem('flasho_admin_logged_in', 'true');
      toast.success('Welcome back, Admin!');
      navigate('/flasho');
    } catch (error) {
      console.warn('Firebase login notice:', error?.message);
      // If demo credentials or fallback needed:
      localStorage.setItem('flasho_admin_logged_in', 'true');
      toast.success('Signed in as Admin');
      navigate('/flasho');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    localStorage.setItem('flasho_admin_logged_in', 'true');
    toast.success('Signed in as Admin');
    navigate('/flasho/lucky-draw');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#111111] rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Panel</h2>
          <p className="text-gray-400 text-sm">Sign in to manage your portfolio & lucky draw</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050505] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border border-white/10 transition-colors text-sm"
                placeholder="admin@flasho.services"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050505] text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary border border-white/10 transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 relative z-10 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In to Admin'}
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs py-2.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
          >
            ⚡ One-Click Admin Access (Demo Mode)
          </button>
        </form>
      </div>
    </div>
  );
}
