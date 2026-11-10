import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { signIn, signUp } from '../services/auth';

const SESSION_KEY = 'pann-cake-session';
const AuthContext = createContext(null);

function readSession() {
  try {
    const storedUser = localStorage.getItem(SESSION_KEY);
    if (!storedUser) return null;
    const user = JSON.parse(storedUser);
    if (user && typeof user.id !== 'undefined' && ['admin', 'customer'].includes(user.role)) return user;
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  const saveSession = useCallback((account) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(account));
    setUser(account);
    return account;
  }, []);

  const login = useCallback(async (email, password) => {
    return saveSession(await signIn(email, password));
  }, [saveSession]);

  const register = useCallback(async (account) => {
    return saveSession(await signUp(account));
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  }), [login, logout, register, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  return context;
}
