import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Gift, QrCode, Play, RotateCcw, Download, Trash2, 
  Search, Users, Sparkles, Maximize2, Minimize2, ExternalLink,
  Phone, MapPin, Ticket, Volume2, VolumeX, ShieldCheck, CheckCircle,
  UserPlus, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { luckyDrawDb } from '../../utils/luckyDrawDb';
import { soundFX } from '../../utils/audioEffects';

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

export default function LuckyDrawAdmin() {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Manual Entry Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualData, setManualData] = useState({
    name: '',
    phone: '',
    email: '',
    area: 'Rajarampuri',
    customArea: ''
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Big screen & Lucky Draw states
  const [isBigScreenActive, setIsBigScreenActive] = useState(false);
  const [bigScreenMode, setBigScreenMode] = useState('draw'); // 'draw' or 'qr'
  const [isDrawing, setIsDrawing] = useState(false);
  const [fallingPlates, setFallingPlates] = useState([]);
  const [winners, setWinners] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bigScreenRef = useRef(null);
  const stageCanvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);

  // Fetch participants
  const loadParticipants = async () => {
    setIsLoading(true);
    try {
      const data = await luckyDrawDb.getAllParticipants();
      // Purge any legacy demo entries (old FLS- format) as user requested to remove demo data
      const cleaned = data.filter(p => !p.ticketNumber?.startsWith('FLS-'));
      if (cleaned.length !== data.length) {
        try {
          const localCleaned = luckyDrawDb.getLocalParticipants().filter(p => !p.ticketNumber?.startsWith('FLS-'));
          localStorage.setItem('flasho_luckydraw_participants', JSON.stringify(localCleaned));
        } catch {}
      }

      setParticipants(cleaned);
      setFilteredParticipants(cleaned);

      const savedWinners = luckyDrawDb.getSavedWinners();
      if (savedWinners && savedWinners.winners) {
        const hasLegacyWinner = savedWinners.winners.some(w => w.ticketNumber?.startsWith('FLS-'));
        if (hasLegacyWinner) {
          localStorage.removeItem('flasho_luckydraw_winners');
          setWinners(null);
        } else {
          setWinners(savedWinners.winners);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  // Filter search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredParticipants(participants);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredParticipants(
        participants.filter(p => 
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.phone && p.phone.includes(term)) ||
          (p.area && p.area.toLowerCase().includes(term)) ||
          (p.ticketNumber && p.ticketNumber.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, participants]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (bigScreenRef.current?.requestFullscreen) {
        bigScreenRef.current.requestFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Reset the Lucky Draw
  const handleResetDraw = (showToast = true) => {
    setWinners(null);
    localStorage.removeItem('flasho_luckydraw_winners');
    if (confettiInstanceRef.current) {
      try { confettiInstanceRef.current.reset(); } catch {}
    }
    try { confetti.reset(); } catch {}
    if (showToast) {
      toast.success('Lucky Draw stage has been reset! Ready for fresh search.');
    }
  };

  // Exit Big Screen Stage and automatically reset draw
  const handleExitStage = () => {
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch {}
    }
    if (confettiInstanceRef.current) {
      try { confettiInstanceRef.current.reset(); } catch {}
    }
    try { confetti.reset(); } catch {}
    setIsBigScreenActive(false);
    handleResetDraw(false);
  };

  // Delete Confirmation State
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Clear all entries
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all participant records? This cannot be undone.')) {
      await luckyDrawDb.clearAll();
      setParticipants([]);
      setFilteredParticipants([]);
      setWinners(null);
      toast.success('All Lucky Draw records cleared.');
    }
  };

  // Confirm and execute single participant deletion
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const participant = deleteCandidate;
    setIsDeleting(true);
    try {
      await luckyDrawDb.deleteParticipant(participant);
      const filterOut = (prev) => prev.filter(p => 
        p.ticketNumber !== participant.ticketNumber && 
        p.phone !== participant.phone &&
        (!participant.id || p.id !== participant.id)
      );
      setParticipants(filterOut);
      setFilteredParticipants(filterOut);
      toast.success(`Entry for ticket #${participant.ticketNumber || participant.name} deleted.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete participant');
    } finally {
      setIsDeleting(false);
      setDeleteCandidate(null);
    }
  };

  // Add Manual Participant Entry
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualData.name.trim() || !manualData.phone.trim()) {
      toast.error('Please enter name and phone number');
      return;
    }

    setIsSubmittingManual(true);
    try {
      const isOther = manualData.area === 'Other Kolhapur Area';
      const finalArea = isOther && manualData.customArea.trim()
        ? `${manualData.customArea.trim()}, Kolhapur`
        : `${manualData.area}, Kolhapur`;

      const newEntry = await luckyDrawDb.saveParticipant({
        name: manualData.name.trim(),
        phone: manualData.phone.trim(),
        email: manualData.email.trim(),
        area: finalArea,
        selectedDropdownArea: manualData.area,
        isOtherArea: isOther
      });

      setParticipants(prev => [newEntry, ...prev]);
      setFilteredParticipants(prev => [newEntry, ...prev]);
      toast.success(`Entry created! Ticket #${newEntry.ticketNumber}`);
      setIsManualModalOpen(false);
      setManualData({
        name: '',
        phone: '',
        email: '',
        area: 'Rajarampuri',
        customArea: ''
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create manual entry');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Export CSV (Reliable Blob export with UTF-8 BOM so all participants' names are downloaded)
  const handleExportCSV = async () => {
    let listToExport = participants;
    try {
      const all = await luckyDrawDb.getAllParticipants();
      if (all && all.length > 0) {
        listToExport = all;
      }
    } catch (e) {
      console.warn('Fallback to local state for export:', e);
    }

    if (!listToExport || listToExport.length === 0) {
      toast.error('No participants found to export');
      return;
    }

    const headers = ['Ticket Number', 'Full Name', 'Phone', 'Email', 'Location Area', 'Registered At'];
    const rows = listToExport.map(p => [
      `"${p.ticketNumber || ''}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.phone || ''}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${(p.area || '').replace(/"/g, '""')}"`,
      `"${p.createdAt || ''}"`
    ]);

    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flasho_luckydraw_participants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast.success(`Exported all ${listToExport.length} participants to CSV!`);
  };

  // Trigger celebration confetti (strictly on stage canvas)
  const blastConfetti = () => {
    if (!stageCanvasRef.current) return;

    if (!confettiInstanceRef.current) {
      confettiInstanceRef.current = confetti.create(stageCanvasRef.current, {
        resize: true,
        useWorker: true
      });
    }

    const myConfetti = confettiInstanceRef.current;
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      myConfetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 }
      });
      myConfetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Hidden Selection Criteria: Exclude participants who chose "Other Kolhapur Area"
  const isEligibleParticipant = (p) => {
    if (p.isOtherArea === true) return false;
    if (p.selectedDropdownArea === 'Other Kolhapur Area') return false;
    if (typeof p.area === 'string') {
      const lower = p.area.toLowerCase();
      if (lower.includes('other kolhapur area') || lower.startsWith('other')) {
        return false;
      }
    }
    return true;
  };

  // 🚀 Start Lucky Draw Search
  const startLuckyDrawSearch = () => {
    // Filter strictly eligible participants from Kolhapur dropdown areas
    const eligibleParticipants = participants.filter(isEligibleParticipant);

    if (eligibleParticipants.length < 3) {
      toast.error('You need at least 3 eligible participants from Kolhapur areas to draw 3 winners!');
      return;
    }

    setIsDrawing(true);
    setWinners(null);

    // Generate falling green plates with 4-Digit Ticket Number and participant identifier
    const totalFallingPlates = 48;
    const generatedPlates = [];

    for (let i = 0; i < totalFallingPlates; i++) {
      const randomParticipant = participants[Math.floor(Math.random() * participants.length)];
      generatedPlates.push({
        id: `plate-${i}-${Date.now()}`,
        name: randomParticipant.name,
        ticket: randomParticipant.ticketNumber || String(i + 1).padStart(4, '0'),
        x: Math.random() * 90 + 5,
        delay: Math.random() * 2.2,
        duration: 1.8 + Math.random() * 1.5,
        rotation: (Math.random() - 0.5) * 30,
        scale: 0.9 + Math.random() * 0.3
      });
    }

    setFallingPlates(generatedPlates);

    // Audio suspense
    let ticksInterval = null;
    if (soundEnabled) {
      let tickCount = 0;
      ticksInterval = setInterval(() => {
        soundFX.playTick();
        tickCount++;
        if (tickCount > 24) clearInterval(ticksInterval);
      }, 150);
    }

    // Select 3 random unique winners strictly from eligibleParticipants
    const shuffled = [...eligibleParticipants].sort(() => 0.5 - Math.random());
    const selectedThree = shuffled.slice(0, 3);

    setTimeout(() => {
      if (ticksInterval) clearInterval(ticksInterval);
      if (soundEnabled) soundFX.playFanfare();
      
      setWinners(selectedThree);
      luckyDrawDb.saveWinners(selectedThree);
      setIsDrawing(false);
      blastConfetti();
    }, 3800);
  };

  const registrationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/lucky-draw` 
    : 'https://flasho.services/lucky-draw';

  return (
    <div className="space-y-6 font-body">
      {/* Top Banner for Admin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] border border-white/10 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold mb-2">
            <Sparkles size={14} /> LIVE STALL & EVENT CONSOLE
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
            Lucky Draw Management 🎁
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Display Big QR code on stage, track responses, and project live winner announcements.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setBigScreenMode('qr');
              setIsBigScreenActive(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/10 shadow-sm"
          >
            <QrCode size={18} className="text-primary" />
            <span>Show Big QR</span>
          </button>

          <button
            onClick={() => {
              setBigScreenMode('draw');
              setIsBigScreenActive(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-accent text-white font-display font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 active:scale-95"
          >
            <Play size={18} />
            <span>Open Big Screen Draw Stage</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Total Responses</p>
            <h3 className="text-3xl font-display font-bold text-white mt-1">{participants.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Drawn Winners</p>
            <h3 className="text-3xl font-display font-bold text-primary mt-1">
              {winners ? winners.length : 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Trophy size={24} />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Target City</p>
            <h3 className="text-lg font-display font-bold text-white mt-1 truncate">Kolhapur, MH</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <MapPin size={24} />
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-400 tracking-wider">Scan Link</p>
            <a 
              href="/lucky-draw" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-mono mt-1 font-medium"
            >
              /lucky-draw <ExternalLink size={12} />
            </a>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <QrCode size={24} />
          </div>
        </div>
      </div>

      {/* Participants Table & Management Toolbar */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search by ticket #, name, phone or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Manual Entry Button */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-accent text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <UserPlus size={14} /> Add Manual Entry
            </button>

            <button
              onClick={handleResetDraw}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Lucky Draw
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        </div>

        {/* Responses Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0a0a0a] text-white font-medium text-xs uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Ticket #</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Mobile Number</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Area / Location</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#111111]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Loading lucky draw entries...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-gray-400 text-base font-medium">No participant entries found</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Participants scanning the QR code or manual entries will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((entry) => (
                  <tr key={entry.ticketNumber || entry.phone} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-primary tracking-wider">
                      {entry.ticketNumber || '0000'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-white">
                      {entry.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-300">
                      <a 
                        href={`https://wa.me/91${entry.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Phone size={13} /> {entry.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 truncate max-w-[180px]">
                      {entry.email || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-xs text-gray-300">
                        <MapPin size={11} className="text-primary" /> {entry.area}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDeleteCandidate(entry)}
                        className="p-2 sm:p-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer active:scale-90"
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📝 MANUAL ENTRY MODAL                                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <UserPlus size={18} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">Add Participant Entry</h3>
                </div>
                <button
                  onClick={() => setIsManualModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    value={manualData.name}
                    onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9822012345"
                    value={manualData.phone}
                    onChange={(e) => setManualData({ ...manualData, phone: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@gmail.com"
                    value={manualData.email}
                    onChange={(e) => setManualData({ ...manualData, email: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Location Area *</label>
                  <select
                    value={manualData.area}
                    onChange={(e) => setManualData({ ...manualData, area: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {KOLHAPUR_AREAS.map(area => (
                      <option key={area} value={area} className="bg-secondary text-white">
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {manualData.area === 'Other Kolhapur Area' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Specify Area Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shiroli, Kolhapur"
                      value={manualData.customArea}
                      onChange={(e) => setManualData({ ...manualData, customArea: e.target.value })}
                      className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingManual}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-accent text-white text-sm font-display font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingManual ? 'Saving...' : 'Add Participant'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🗑️ DELETE CONFIRMATION MODAL (MOBILE & DESKTOP RELIABLE)                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteCandidate(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-sm bg-[#181818] border border-white/10 rounded-3xl p-6 shadow-2xl text-white text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Delete Participant?</h3>
              <p className="text-xs text-gray-400 mt-1 mb-5">
                Are you sure you want to delete <strong className="text-white">{deleteCandidate.name}</strong> (Ticket #{deleteCandidate.ticketNumber || 'N/A'})?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🌟 BIG SCREEN PRESENTATION STAGE (FULL WHITE & FLASHO DESIGN SYSTEM)        */}
      {/* ========================================================================= */}
      {isBigScreenActive && (
        <div 
          ref={bigScreenRef}
          className="fixed inset-0 z-50 bg-white text-secondary flex flex-col justify-between overflow-hidden select-none"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Confetti Canvas strictly attached to the Big Screen Stage Modal */}
          <canvas
            ref={stageCanvasRef}
            className="absolute inset-0 pointer-events-none z-40 w-full h-full"
          />

          {/* Top Bar for Big Screen Controls */}
          <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm z-30">
            {/* Flasho Logo from Public Folder */}
            <div className="flex items-center gap-3">
              <img 
                src="/flasho-logo.png" 
                alt="Flasho" 
                className="h-10 md:h-12 object-contain" 
              />
              <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-primary border border-emerald-100">
                Mega Lucky Draw Stage
              </span>
            </div>

            {/* Stage Controls */}
            <div className="flex items-center gap-3">
              {/* View Switchers */}
              <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-bold">
                <button
                  onClick={() => setBigScreenMode('draw')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    bigScreenMode === 'draw' ? 'bg-white shadow text-primary font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  🎰 Lucky Draw Stage
                </button>
                <button
                  onClick={() => setBigScreenMode('qr')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    bigScreenMode === 'qr' ? 'bg-white shadow text-primary font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  📱 Big QR Code
                </button>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              >
                {soundEnabled ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {/* Exit Stage (Automatically Resets the Draw) */}
              <button
                onClick={handleExitStage}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Exit Stage
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* STAGE VIEW A: Big Screen QR Code (Large Size + Logo)        */}
          {/* ========================================================== */}
          {bigScreenMode === 'qr' && (
            <div className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 bg-white text-center relative">
              <div className="max-w-3xl w-full flex flex-col items-center">
                <img 
                  src="/flasho-logo.png" 
                  alt="Flasho" 
                  className="h-16 sm:h-20 md:h-24 object-contain mb-4" 
                />

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-secondary tracking-tight">
                  SCAN WITH PHONE <br />
                  <span className="text-primary">TO ENTER & WIN!</span> 🎁
                </h2>
                <p className="text-lg text-gray-600 font-medium mt-2 mb-8">
                  Point your mobile camera at the QR code below. Enter details to get your lucky ticket!
                </p>

                {/* Extra Large Big QR Box */}
                <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-4 border-gray-100 flex flex-col items-center">
                  <QRCodeSVG 
                    value={registrationUrl} 
                    size={380} 
                    level="H" 
                    includeMargin={true}
                  />
                  
                  <div className="mt-4 py-2 px-5 rounded-full bg-emerald-50 text-primary text-sm font-mono font-bold border border-emerald-100">
                    ⚡ {registrationUrl}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-sm font-bold text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={18} className="text-primary" /> Free Entry
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Trophy size={18} className="text-amber-500" /> 3 Lucky Winners
                  </span>
                  <span>•</span>
                  <span>📍 Kolhapur Special</span>
                </div>

                <button
                  onClick={() => setBigScreenMode('draw')}
                  className="mt-8 px-8 py-3.5 rounded-2xl bg-primary hover:bg-accent text-white font-display font-bold text-base shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span>Ready to Draw? Go to Lucky Draw Stage</span>
                  <Play size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* STAGE VIEW B: Lucky Draw Stage                             */}
          {/* Full White + Falling Green Plates + 3 Winners In One Line  */}
          {/* ========================================================== */}
          {bigScreenMode === 'draw' && (
            <div className="flex-grow relative flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden bg-white">
              
              {/* 🟢 Falling Green Name/Number Plates Animation */}
              {isDrawing && (
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                  {fallingPlates.map((plate) => (
                    <motion.div
                      key={plate.id}
                      initial={{ 
                        y: -120, 
                        x: `${plate.x}vw`, 
                        rotate: plate.rotation,
                        scale: plate.scale,
                        opacity: 0.95 
                      }}
                      animate={{ 
                        y: '115vh', 
                        rotate: plate.rotation * 3,
                        opacity: [0.95, 1, 0.9] 
                      }}
                      transition={{ 
                        duration: plate.duration, 
                        delay: plate.delay, 
                        ease: 'easeIn',
                        repeat: Infinity 
                      }}
                      className="absolute rounded-xl bg-primary text-white border-2 border-white px-5 py-2.5 shadow-xl flex items-center gap-2"
                      style={{
                        boxShadow: '0 8px 20px -4px rgba(46, 175, 77, 0.4)'
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-white/70 shadow-inner" />
                      
                      <div className="text-left font-display">
                        <p className="text-xs font-black uppercase tracking-wider text-white">
                          {plate.name}
                        </p>
                        <p className="text-[11px] font-mono font-bold text-emerald-100">
                          #{plate.ticket}
                        </p>
                      </div>

                      <div className="w-2 h-2 rounded-full bg-white/70 shadow-inner" />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Center Content */}
              <div className="w-full max-w-5xl my-auto z-10 flex flex-col items-center text-center">
                
                {!winners ? (
                  /* Initial State: Action Button */
                  <div className="flex flex-col items-center">
                    <img 
                      src="/flasho-logo.png" 
                      alt="Flasho" 
                      className="h-24 sm:h-32 md:h-36 object-contain mb-6 drop-shadow-sm transition-transform hover:scale-105" 
                    />

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-primary text-sm font-bold uppercase tracking-wider mb-5 border border-emerald-100">
                      <Trophy size={18} /> {participants.length} Contestant Entries Ready
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-secondary tracking-tight mb-4">
                      Flasho Mega <span className="text-primary">Lucky Draw</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-500 max-w-2xl font-normal mb-8">
                      Click below to search winners. Watch the plates fall, and our 3 lucky winners will be revealed!
                    </p>

                    {/* MAIN ACTION BUTTON */}
                    <motion.button
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      disabled={isDrawing}
                      onClick={startLuckyDrawSearch}
                      className="group relative px-10 sm:px-14 py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-primary via-[#27a244] to-accent text-white font-display font-bold text-2xl sm:text-3xl tracking-wide shadow-2xl shadow-primary/30 hover:shadow-primary/50 flex items-center gap-4 cursor-pointer disabled:opacity-50 transition-all border-2 border-white/50"
                    >
                      {isDrawing ? (
                        <>
                          <RotateCcw className="animate-spin text-white" size={32} />
                          <span>Searching Lucky Winners...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                            <Sparkles size={24} className="text-yellow-300" />
                          </div>
                          <span>Search Winners in Lucky Draw</span>
                        </>
                      )}
                    </motion.button>

                    <p className="text-sm font-semibold text-gray-400 mt-6 font-mono">
                      Pass hai, Fast hai • Kolhapur's #1 Service Platform
                    </p>
                  </div>
                ) : (
                  /* ======================================================= */
                  /* WINNERS ANNOUNCEMENT STAGE                               */
                  /* DISPLAY 3 WINNERS IN ONE LINE (NO 1st, 2nd, 3rd)        */
                  /* TICKET NUMBER + SMALL FULL NAME BELOW                    */
                  /* ======================================================= */
                  <div className="w-full flex flex-col items-center">
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center mb-8"
                    >
                      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-primary text-xs sm:text-sm font-extrabold uppercase tracking-widest border border-emerald-100 shadow-sm mb-3">
                        <Sparkles size={16} /> OFFICIAL LUCKY DRAW ANNOUNCEMENT
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-secondary tracking-tight">
                        Our 3 Lucky Winners Are: 🎉
                      </h2>
                      <p className="text-gray-500 text-sm sm:text-base mt-2">
                        Congratulations! Please check your ticket number and present it on stage.
                      </p>
                    </motion.div>

                    {/* 3 Winners in One Line */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl items-stretch">
                      {winners.slice(0, 3).map((winner, index) => (
                        <motion.div
                          key={winner.ticketNumber || index}
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.15, duration: 0.6, type: 'spring', damping: 20 }}
                          className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-primary/30 shadow-[0_15px_40px_-10px_rgba(46,175,77,0.2)] hover:border-primary transition-all flex flex-col items-center justify-between relative overflow-hidden group"
                        >
                          {/* Accent bar */}
                          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-[#36c75b] to-accent" />

                          <div className="w-full flex flex-col items-center">
                            {/* Equal Badge for all 3 */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                              <Gift size={13} /> Lucky Winner
                            </div>

                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                              OFFICIAL TICKET NUMBER
                            </p>

                            {/* 4-Digit Ticket Number */}
                            <div className="my-2 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary via-[#27a244] to-accent text-white font-mono font-black text-4xl sm:text-5xl shadow-lg shadow-primary/30 tracking-widest text-center select-all group-hover:scale-102 transition-transform">
                              {winner.ticketNumber || '0000'}
                            </div>
                          </div>

                          {/* Full Name in small font below ticket number */}
                          <div className="mt-5 pt-4 border-t border-gray-100 w-full text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                              WINNER NAME
                            </p>
                            <p className="text-base sm:text-lg font-display font-bold text-secondary mt-0.5 truncate max-w-full">
                              {winner.name}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom Action Controls */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-10 flex flex-wrap items-center justify-center gap-4"
                    >
                      <button
                        onClick={startLuckyDrawSearch}
                        className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-accent text-white font-display font-bold text-base shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <RotateCcw size={18} />
                        <span>Draw Again / Re-search</span>
                      </button>

                      <button
                        onClick={blastConfetti}
                        className="px-6 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-secondary font-display font-bold text-base shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Sparkles size={18} className="text-amber-500" />
                        <span>Celebrate Confetti!</span>
                      </button>

                      <button
                        onClick={handleExitStage}
                        className="px-6 py-3.5 rounded-2xl bg-secondary hover:bg-black text-white font-display font-bold text-base shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <span>Exit Stage (Resets Draw)</span>
                      </button>
                    </motion.div>
                  </div>
                )}

              </div>

              {/* Bottom Watermark */}
              <div className="w-full text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-widest z-10">
                Flasho • Pass hai, Fast hai • Kolhapur, Maharashtra
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
