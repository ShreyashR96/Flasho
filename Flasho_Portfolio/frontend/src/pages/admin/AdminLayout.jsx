import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Briefcase, LogOut, Menu, X, Users, Share2, Star, HelpCircle, MapPin, UserX } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/flasho', icon: LayoutDashboard },
    { name: 'Messages', path: '/flasho/messages', icon: MessageSquare },
    { name: 'Delete Requests', path: '/flasho/delete-requests', icon: UserX },
    { name: 'Services', path: '/flasho/services', icon: Briefcase },
    { name: 'Team', path: '/flasho/team', icon: Users },
    { name: 'Social Media', path: '/flasho/social-media', icon: Share2 },
    { name: 'Testimonials', path: '/flasho/testimonials', icon: Star },
    { name: 'FAQs', path: '/flasho/faq', icon: HelpCircle },
    { name: 'Coverage Areas', path: '/flasho/coverage', icon: MapPin },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-secondary text-white p-4 flex justify-between items-center z-20 shadow-md">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-secondary w-8 h-8 rounded-lg flex items-center justify-center shadow-lg font-display font-black text-lg">
            ⚡
          </div>
          <span className="font-display font-black text-xl italic tracking-tight">
            Flasho<span className="text-primary">.</span>
          </span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-10
        w-64 bg-secondary text-white flex flex-col h-full
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="hidden md:block p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-secondary w-8 h-8 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform font-display font-black text-lg">
              ⚡
            </div>
            <span className="font-display font-black text-2xl italic tracking-tight">
              Flasho<span className="text-primary">.</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">Admin Panel</p>
        </div>

        {/* Added padding on top for mobile to clear the mobile header if needed, or just let it scroll */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto mt-16 md:mt-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/flasho' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-secondary font-bold' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={async () => {
              localStorage.removeItem('flasho_admin_logged_in');
              try {
                const { signOut } = await import('firebase/auth');
                const { auth } = await import('../../firebase');
                if (auth) await signOut(auth);
              } catch {
                // ignore
              }
              closeMobileMenu();
              window.location.href = '/admin/login';
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-10 overflow-y-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
