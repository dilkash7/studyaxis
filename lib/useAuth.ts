import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

export function useAuth(type: 'student' | 'admin' = 'student') {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tokenKey = type === 'student' ? 'studentToken' : 'token';
  const meEndpoint = type === 'student' ? '/api/student/me' : '/api/auth/me';
  const refreshEndpoint = type === 'student' ? '/api/student/sessions' : null;

  const validateAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if token exists
      const token = localStorage.getItem(tokenKey);
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return null;
      }

      // Validate token with server
      const response = await axios.get(meEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (err: any) {
      // Clear invalid token
      localStorage.removeItem(tokenKey);
      setError(err.response?.data?.error || 'Authentication failed');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  }, [tokenKey, meEndpoint]);

  // Auto-refresh token every 5 minutes to keep session alive
  const refreshToken = useCallback(async () => {
    if (!isAuthenticated || !refreshEndpoint) return;
    
    try {
      const token = localStorage.getItem(tokenKey);
      if (!token) return;

      const response = await axios.post(refreshEndpoint, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data.token) {
        localStorage.setItem(tokenKey, response.data.token);
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
    }
  }, [isAuthenticated, tokenKey, refreshEndpoint]);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  // Setup auto-refresh for students
  useEffect(() => {
    if (isAuthenticated && type === 'student') {
      // Refresh token every 5 minutes
      refreshIntervalRef.current = setInterval(() => {
        refreshToken();
      }, 5 * 60 * 1000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, type, refreshToken]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem(tokenKey);
      if (type === 'student' && token) {
        await axios.post('/api/student/logout', {}, {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true,
        });
      } else if (type === 'admin') {
        await axios.delete('/api/auth', { withCredentials: true });
      }
      localStorage.removeItem(tokenKey);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [tokenKey, type]);

  return { user, loading, error, isAuthenticated, validateAuth, logout, refreshToken };
}
