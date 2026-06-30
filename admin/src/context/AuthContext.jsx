import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pedi_token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('pedi_user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('pedi_token', data.token);
    localStorage.setItem('pedi_user', JSON.stringify({ username: data.username }));
    setToken(data.token);
    setUser({ username: data.username });
  };

  const register = async (username, password) => {
    const { data } = await api.post('/api/auth/register', { username, password });
    localStorage.setItem('pedi_token', data.token);
    localStorage.setItem('pedi_user', JSON.stringify({ username: data.username }));
    setToken(data.token);
    setUser({ username: data.username });
  };

  const logout = () => {
    localStorage.removeItem('pedi_token');
    localStorage.removeItem('pedi_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
