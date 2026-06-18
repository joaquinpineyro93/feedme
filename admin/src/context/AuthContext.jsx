import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('feedme_token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('feedme_user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('feedme_token', data.token);
    localStorage.setItem('feedme_user', JSON.stringify({ username: data.username }));
    setToken(data.token);
    setUser({ username: data.username });
  };

  const register = async (username, password) => {
    const { data } = await api.post('/api/auth/register', { username, password });
    localStorage.setItem('feedme_token', data.token);
    localStorage.setItem('feedme_user', JSON.stringify({ username: data.username }));
    setToken(data.token);
    setUser({ username: data.username });
  };

  const logout = () => {
    localStorage.removeItem('feedme_token');
    localStorage.removeItem('feedme_user');
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
