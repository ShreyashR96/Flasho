import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import api from './lib/api'; // 🟢 Use the centralized API client

// Component Imports
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Workers from './pages/WorkerList';
import UserList from './pages/UserList';
import Services from './pages/Services';
import Verification from './pages/Verification';
import Login from './pages/Login';
import Agency from './pages/Agencies';
import Marketing from './pages/Marketing';
import Settlements from './pages/Settlements';
import Reviews from './pages/Reviews';
import Jobs from './pages/Jobs';
import DeleteRequests from './pages/DeleteRequests';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // 🟢 DYNAMIC URL: Verify if the active session belongs to an admin
        const res = await api.get('/users/me');

        if (res?.data?.role === 'admin' || res?.data?.role === 'super_admin') {
          setSession(session);
          setIsAdmin(true);
        } else {
          // Sign out non-admin users immediately if they try to spoof a session
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Authorization check failed", error);
        await supabase.auth.signOut();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setSession(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // Reject access if there is no session OR the user is not an admin
  if (!session || !isAdmin) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/workers" element={<ProtectedRoute><Workers /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
        <Route path="/delete-requests" element={<ProtectedRoute><DeleteRequests /></ProtectedRoute>} />
        <Route path="/agencies" element={<ProtectedRoute><Agency /></ProtectedRoute>} />
        <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
        <Route path="/settlements" element={<ProtectedRoute><Settlements /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}