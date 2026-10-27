import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MessageSquare, Briefcase, Users, UserX } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    messages: 0,
    services: 0,
    partners: 0,
    deleteRequests: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const messagesSnapshot = await getDocs(collection(db, 'messages'));
        const messages = messagesSnapshot.docs.map(doc => doc.data());
        
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const services = servicesSnapshot.docs.map(doc => doc.data());

        let deleteCount = 0;
        try {
          const deleteSnapshot = await getDocs(collection(db, 'account_deletion_requests'));
          deleteCount = deleteSnapshot.docs.filter(d => d.data().status === 'pending').length;
        } catch {
          deleteCount = messages.filter(m => m.type === 'DeleteAccount' && m.status === 'pending').length;
        }
        
        setStats({
          messages: messages.length,
          services: services.length,
          partners: messages.filter(m => m.type === 'Partner').length,
          deleteRequests: deleteCount
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-white/10 flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Messages</p>
            <h3 className="text-3xl font-bold text-white">{stats.messages}</h3>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-white/10 flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <Briefcase size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Active Services</p>
            <h3 className="text-3xl font-bold text-white">{stats.services}</h3>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-white/10 flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Partner Applications</p>
            <h3 className="text-3xl font-bold text-white">{stats.partners}</h3>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-3xl shadow-sm border border-white/10 flex items-center gap-6">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center shrink-0">
            <UserX size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Pending Deletions</p>
            <h3 className="text-3xl font-bold text-white">{stats.deleteRequests}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
