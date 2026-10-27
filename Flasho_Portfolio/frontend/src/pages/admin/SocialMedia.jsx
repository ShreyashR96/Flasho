import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, MessageCircle, ExternalLink, CheckCircle2, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { 
  InstagramIcon, 
  FacebookIcon, 
  TwitterIcon, 
  YoutubeIcon, 
  LinkedinIcon, 
  TelegramIcon 
} from '../../components/SocialIcons';
import { 
  getSocialLinks, 
  saveSocialLinks, 
  subscribeSocialLinks, 
  formatSocialUrl, 
  DEFAULT_SOCIAL_LINKS 
} from '../../utils/socialLinks';

export default function SocialMedia() {
  const [links, setLinks] = useState(getSocialLinks);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Subscribe to realtime changes so admin stays in sync
    const unsubscribe = subscribeSocialLinks((data) => {
      setLinks(data || DEFAULT_SOCIAL_LINKS);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleChange = (name, value) => {
    setLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await saveSocialLinks(links);
      toast.success("Social media links saved! Updated instantly in footer.");
    } catch (error) {
      console.error("Error saving social links:", error);
      toast.error("Failed to save links. Changes saved locally.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefaultWhatsApp = () => {
    setLinks(prev => ({
      ...prev,
      whatsapp: 'https://wa.me/919561850928'
    }));
    toast.success("Set default WhatsApp (+91 9561850928)");
  };

  const handleClearAll = () => {
    setLinks(DEFAULT_SOCIAL_LINKS);
    toast('All social media links cleared. Click Save to apply.', { icon: '🧹' });
  };

  const socialInputs = [
    { 
      name: 'instagram', 
      icon: InstagramIcon, 
      label: 'Instagram', 
      placeholder: 'https://instagram.com/flasho or flasho_official',
      hint: 'Supports profile URL or username'
    },
    { 
      name: 'whatsapp', 
      icon: MessageCircle, 
      label: 'WhatsApp', 
      placeholder: '9561850928 or https://wa.me/919561850928',
      hint: 'Accepts 10-digit number or wa.me link'
    },
    { 
      name: 'facebook', 
      icon: FacebookIcon, 
      label: 'Facebook', 
      placeholder: 'https://facebook.com/flasho',
      hint: 'Full page or profile URL'
    },
    { 
      name: 'twitter', 
      icon: TwitterIcon, 
      label: 'Twitter / X', 
      placeholder: 'https://x.com/flasho or @flasho',
      hint: 'X/Twitter profile link or handle'
    },
    { 
      name: 'youtube', 
      icon: YoutubeIcon, 
      label: 'YouTube', 
      placeholder: 'https://youtube.com/@flasho',
      hint: 'Channel or video URL'
    },
    { 
      name: 'linkedin', 
      icon: LinkedinIcon, 
      label: 'LinkedIn', 
      placeholder: 'https://linkedin.com/company/flasho',
      hint: 'Company page or personal profile'
    },
    { 
      name: 'telegram', 
      icon: TelegramIcon, 
      label: 'Telegram', 
      placeholder: 'https://t.me/flasho_official',
      hint: 'Channel or group link'
    },
  ];

  // Calculate which ones are active
  const activeCount = Object.values(links).filter(v => typeof v === 'string' && v.trim().length > 0).length;

  return (
    <div className="max-w-4xl pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-white">Manage Social Media</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {activeCount} Active in Footer
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Control which social media icons appear on your website footer in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
          >
            Clear All
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-accent text-secondary font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/10 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Links'}
          </button>
        </div>
      </div>

      {/* Live Footer Preview Box */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            <Eye size={15} className="text-primary" />
            <span>Live Footer Preview (What Visitors See)</span>
          </div>
          <span className="text-[11px] text-gray-500">
            Updates in real-time as you type
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#050505] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black tracking-tight text-white font-display">flasho</span>
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            </div>
            <p className="text-xs text-gray-400">Pass hai, fast hai.</p>
          </div>

          <div className="flex items-center space-x-4">
            {activeCount === 0 ? (
              <span className="text-xs italic text-gray-600 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                No icons active (all links are empty)
              </span>
            ) : (
              socialInputs.map((social) => {
                const val = links[social.name];
                if (!val || !val.trim()) return null;
                const formatted = formatSocialUrl(social.name, val);
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={formatted}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${social.label}: ${formatted}`}
                    className="text-gray-400 hover:text-primary transition-all duration-200 transform hover:scale-125 p-1.5 rounded-lg bg-white/5 border border-white/10 inline-flex items-center justify-center group"
                  >
                    <Icon size={18} />
                  </a>
                );
              })
            )}
          </div>
        </div>

        <p className="text-[12px] text-gray-500 mt-3 flex items-center gap-1.5">
          <Sparkles size={13} className="text-primary" />
          <span>Only filled links will display an icon. When you leave a field empty, that icon is automatically hidden.</span>
        </p>
      </div>

      {/* Inputs Form */}
      <div className="bg-[#111111] p-6 sm:p-8 rounded-[2rem] border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Social Media Links Configuration</h2>
          <button 
            type="button"
            onClick={handleSetDefaultWhatsApp}
            className="text-xs text-[#00C896] hover:underline flex items-center gap-1"
          >
            <MessageCircle size={14} />
            Fill WhatsApp (+91 9561850928)
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {socialInputs.map((social) => {
            const val = links[social.name] || '';
            const isFilled = Boolean(val && val.trim().length > 0);
            const formatted = formatSocialUrl(social.name, val);

            return (
              <div 
                key={social.name} 
                className={`p-4 rounded-2xl border transition-all ${
                  isFilled 
                    ? 'border-primary/20 bg-primary/[0.02]' 
                    : 'border-white/5 bg-[#0a0a0a]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <label className="flex items-center gap-2.5 text-sm font-bold text-gray-200">
                    <div className={`p-1.5 rounded-lg ${isFilled ? 'bg-primary/10 text-primary' : 'bg-white/5 text-gray-400'}`}>
                      <social.icon size={18} />
                    </div>
                    {social.label}
                  </label>

                  <div className="flex items-center gap-2">
                    {isFilled ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} />
                          Active in Footer
                        </span>
                        <a
                          href={formatted}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                          title="Test this link in a new tab"
                        >
                          <ExternalLink size={11} />
                          Test
                        </a>
                      </>
                    ) : (
                      <span className="text-[11px] text-gray-500 italic">
                        Hidden (leave blank to hide)
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    name={social.name}
                    value={val}
                    onChange={(e) => handleChange(social.name, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#050505] text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-600"
                    placeholder={social.placeholder}
                  />
                  {val && (
                    <button
                      type="button"
                      onClick={() => handleChange(social.name, '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1.5 px-1">
                  <p className="text-[11px] text-gray-500">
                    {social.hint}
                  </p>
                  {isFilled && formatted !== val && (
                    <span className="text-[11px] text-gray-400">
                      Resolves to: <code className="text-primary font-mono">{formatted}</code>
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-accent text-secondary font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-primary/10 flex items-center gap-2 disabled:opacity-50 text-base"
            >
              <Save size={18} />
              {isSaving ? 'Saving Changes...' : 'Save All Links'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
