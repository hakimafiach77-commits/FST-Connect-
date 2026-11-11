import React, { createContext, useContext, useState, useEffect } from 'react';
import { useData } from './DataContext';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { db, fetchSync } = useData();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('gdi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      const user = data.user;
      const sessionUser = { ...user, name: `${user.prenom} ${user.nom}` };
      
      setCurrentUser(sessionUser);
      localStorage.setItem('gdi_user', JSON.stringify(sessionUser));
      localStorage.setItem('gdi_token', data.token); // Add token storage logic
      
      // Fetch fresh data immediately upon login
      if (fetchSync) {
        fetchSync();
      }
      
      return sessionUser;
    } catch (error) {
      throw new Error(error.message || 'Email ou mot de passe incorrect.');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gdi_user');
    localStorage.removeItem('gdi_token');
  };

  const can = (action) => {
    if (!currentUser) return false;
    const perms = {
      admin:   ['manage_students','manage_teachers','manage_modules','manage_rooms','manage_filieres','manage_schedule','manage_grades','manage_announcements','view_all'],
      teacher: ['view_students','manage_absences','manage_grades','view_schedule','create_announcement','view_modules'],
      student: ['view_own_profile','view_own_grades','view_own_absences','view_schedule','view_announcements','view_modules','submit_justification'],
    };
    return (perms[currentUser.role] || []).includes(action) || (perms[currentUser.role] || []).includes('view_all');
  };

  const isAdmin = () => currentUser?.role === 'admin';
  const isTeacher = () => currentUser?.role === 'teacher';
  const isStudent = () => currentUser?.role === 'student';

  const value = {
    currentUser,
    login,
    logout,
    can,
    isAdmin,
    isTeacher,
    isStudent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
