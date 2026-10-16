import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    // Check localStorage login session first
    const isLocalAdmin = localStorage.getItem('flasho_admin_logged_in') === 'true';

    try {
      if (auth && typeof onAuthStateChanged === 'function') {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
          } else if (isLocalAdmin) {
            setUser({ email: 'admin@flasho.services' });
          } else {
            setUser(null);
          }
          setLoading(false);
        }, () => {
          if (isLocalAdmin) setUser({ email: 'admin@flasho.services' });
          setLoading(false);
        });
      } else {
        if (isLocalAdmin) setUser({ email: 'admin@flasho.services' });
        setLoading(false);
      }
    } catch {
      if (isLocalAdmin) setUser({ email: 'admin@flasho.services' });
      setLoading(false);
    }

    return () => {
      try {
        unsubscribe();
      } catch {
        // ignore
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isLocalAdmin = typeof window !== 'undefined' && localStorage.getItem('flasho_admin_logged_in') === 'true';

  if (!user && !isLocalAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
