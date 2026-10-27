import { MessageCircle } from 'lucide-react';
import { InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, TelegramIcon } from './SocialIcons';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getSocialLinks, subscribeSocialLinks, formatSocialUrl } from '../utils/socialLinks';

export default function Footer() {
  const [services, setServices] = useState([]);
  const [socialLinks, setSocialLinks] = useState(getSocialLinks);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (db) {
          const querySnapshot = await getDocs(collection(db, 'services'));
          const fetchedServices = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => {
            const orderA = a.order || 0;
            const orderB = b.order || 0;
            if (orderA === 0 && orderB === 0) return 0;
            if (orderA === 0) return 1;
            if (orderB === 0) return -1;
            return orderA - orderB;
          });
          setServices(fetchedServices);
        }
      } catch (error) {
        console.error("Error fetching services in footer:", error);
      }
    };

    fetchServices();

    // Realtime subscription to admin panel social links (localStorage + BroadcastChannel + Firestore)
    const unsubscribeSocial = subscribeSocialLinks((data) => {
      setSocialLinks(data || {});
    });

    return () => {
      if (unsubscribeSocial) unsubscribeSocial();
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', icon: InstagramIcon, ariaLabel: 'Follow us on Instagram' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, ariaLabel: 'Message us on WhatsApp', hoverColor: 'hover:text-[#00C896]' },
    { key: 'facebook', label: 'Facebook', icon: FacebookIcon, ariaLabel: 'Follow us on Facebook' },
    { key: 'twitter', label: 'Twitter / X', icon: TwitterIcon, ariaLabel: 'Follow us on Twitter' },
    { key: 'youtube', label: 'YouTube', icon: YoutubeIcon, ariaLabel: 'Subscribe to our YouTube channel' },
    { key: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, ariaLabel: 'Connect with us on LinkedIn' },
    { key: 'telegram', label: 'Telegram', icon: TelegramIcon, ariaLabel: 'Join our Telegram' },
  ];

  // Filter: only show icons for which a link was configured in the Admin Panel
  const activeSocials = socialPlatforms.filter(p => {
    const val = socialLinks[p.key];
    return typeof val === 'string' && val.trim().length > 0;
  });

  return (
    <footer className="bg-[#050505] text-gray-400 py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <img src="/flasho-logo.png" alt="Flasho" className="h-10 mb-4 brightness-0 invert opacity-90" />
            <p className="text-sm mb-6">Pass hai, fast hai.</p>
            {activeSocials.length > 0 && (
              <div className="flex space-x-4 items-center">
                {activeSocials.map(platform => {
                  const href = formatSocialUrl(platform.key, socialLinks[platform.key]);
                  const Icon = platform.icon;
                  return (
                    <a 
                      key={platform.key}
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={platform.ariaLabel}
                      title={platform.label}
                      className={`text-gray-400 ${platform.hoverColor || 'hover:text-primary'} transition-all duration-200 transform hover:scale-110`}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/coverage" className="hover:text-primary transition-colors">Coverage Areas</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {services.map(service => (
                <li key={service.id}>
                  <Link to={`/service/${service.id}`} state={{ service }} className="hover:text-primary transition-colors">
                    {service.preName ? `${service.preName} ` : ''}{service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li>
                <Link 
                  to="/delete-account" 
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-1.5 text-gray-400 group"
                  title="Request Account Deletion"
                >
                  <span className="group-hover:text-red-400 transition-colors">Delete My Account</span>
                </Link>
              </li>
            </ul>

          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Kolhapur, Maharashtra, India</li>
              <li><a href="mailto:hello@flasho.services" className="hover:text-primary transition-colors">hello@flasho.services</a></li>
              <li><a href="tel:+919561850928" className="hover:text-primary transition-colors">+91 9561850928</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm">
          <p className="text-center md:text-left">© 2026 Flasho. Building India's Future Service Ecosystem.</p>
        </div>
      </div>
    </footer>
  );
}
