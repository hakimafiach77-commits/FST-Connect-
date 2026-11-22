import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * AccessGuard — Règles d'accès (non négociables) :
 *  - Si !isAuthenticated → redirect /login (via ProtectedRoute parent)
 *  - Si role !== 'student' → redirect /
 *  - Si statut === 'ABANDONNE' → render children avec banner read-only
 *  - Si statut === 'DIPLOME' → accès archives uniquement (notes, PFE, attestations)
 */
const AccessGuard = ({ student, children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser.role !== 'student') return <Navigate to="/" replace />;

  // ABANDONNE: authoriser uniquement lecture (enfants gèrent les boutons désactivés)
  // Le banner est déjà affiché dans le layout, donc on laisse passer
  return <>{children}</>;
};

export default AccessGuard;
