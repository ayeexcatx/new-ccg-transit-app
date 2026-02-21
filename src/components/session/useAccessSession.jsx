import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useAccessSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const storedId = localStorage.getItem('access_code_id');
      if (!storedId) {
        setLoading(false);
        return;
      }
      const codes = await base44.entities.AccessCode.filter({ id: storedId });
      if (codes.length > 0 && codes[0].active_flag !== false) {
        setSession(codes[0]);
      } else {
        localStorage.removeItem('access_code_id');
      }
      setLoading(false);
    }
    loadSession();
  }, []);

  const login = (accessCode) => {
    localStorage.setItem('access_code_id', accessCode.id);
    setSession(accessCode);
  };

  const logout = () => {
    localStorage.removeItem('access_code_id');
    setSession(null);
  };

  return { session, loading, login, logout };
}