import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Messages() {
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, 'messages', id));
        fetchMessages();
        toast.success("Message deleted");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-8">Form Submissions</h1>

      <div className="bg-[#111111] rounded-3xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#050505] text-white font-medium border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No messages received yet.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        msg.type === 'DeleteAccount' ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30' :
                        msg.type === 'Partner' ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                      }`}>
                        {msg.type === 'DeleteAccount' ? 'Delete Account' : msg.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {msg.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{msg.email}</div>
                      <div className="text-xs text-gray-400">{msg.phone}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {msg.type === 'Partner' ? (
                        <div className="text-xs">
                          Role: {msg.type || msg.role}<br/>
                          Exp: {msg.experience} | City: {msg.city}
                        </div>
                      ) : (
                        <div className="text-xs truncate" title={msg.message}>
                          Role: {msg.role}<br/>
                          {msg.message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="text-red-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
