import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, HardHat, Briefcase, Building2, LogOut, Star, UserCheck, Megaphone, Wallet, UserX } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50 mb-4">
          <img src="src/assets/logo.png" alt="Flasho Logo" className="w-9 h-9 rounded-xl shadow-lg" />
          <span className="font-extrabold text-xl text-gray-900 tracking-tight">Flasho<span className="text-[#00C896]"> Admin</span></span>
        </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2 mt-2">Main Menu</div>
        <nav className="space-y-1.5 mb-8">
          <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={isActive('/')} />
          <NavItem to="/services" icon={<Briefcase size={20}/>} label="Services" active={isActive('/services')} />
          <NavItem to="/jobs" icon={<Briefcase size={20}/>} label="Jobs Directory" active={isActive('/jobs')} />
        </nav>

        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">User Management</div>
        <nav className="space-y-1.5">
          <NavItem to="/users" icon={<Users size={20}/>} label="Customers" active={isActive('/users')} />
          <NavItem to="/workers" icon={<HardHat size={20}/>} label="Partners" active={isActive('/workers')} />
          <NavItem to="/verification" icon={<UserCheck size={20}/>} label="Verification" active={isActive('/verification')} />
          <NavItem to="/delete-requests" icon={<UserX size={20}/>} label="Delete Requests" active={isActive('/delete-requests')} />
          <NavItem to="/agencies" icon={<Building2 size={20}/>} label="Agencies" active={isActive('/agencies')} />
          <NavItem to="/settlements" icon={<Wallet size={20}/>} label="Payouts" active={isActive('/settlements')} />
          <NavItem to="/reviews" icon={<Star size={20}/>} label="Reviews" active={isActive('/reviews')} />
          <NavItem to="/marketing" icon={<Megaphone size={20}/>} label="Marketing" active={isActive('/marketing')} />
        </nav>
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/50">
        <button 
           onClick={handleLogout} 
           className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-semibold group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Secure Logout
        </button>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
        active 
           ? 'bg-gradient-to-r from-green-50 to-green-100/50 text-[#00C896] shadow-sm' 
           : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className={`${active ? 'text-[#00C896]' : 'text-gray-400'}`}>
        {icon}
      </div>
      {label}
    </Link>
  );
}