import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Profil = () => {
  const { currentUser } = useAuth();
  const { db, save } = useData();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const student = (db.etudiants || []).find(s => s && (s.utilisateurId == currentUser?.id || s.idEtudiant == currentUser?.id)) || currentUser?.etudiant;
  const filiere = student ? (db.filieres || []).find(f => (f.id || f.idFiliere) === (student.idFiliere || student.filiereId)) : null;
  const group = student ? (db.groupes || []).find(g => (g.id || g.idGroupe) === (student.idGroupeTD || student.groupTDId)) : null;
  const user = (db.utilisateurs || []).find(u => u && u.id == currentUser?.id) || currentUser;

  const [phone, setPhone] = useState(user?.telephone || '');
  const [password, setPassword] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      // 1. Update user phone and password if provided
      if (user) {
        const updatedUser = { ...user, telephone: phone };
        if (password.trim()) {
          updatedUser.motDePasse = password;
        }
        save('utilisateurs', updatedUser);
      }

      setSuccessMsg('Profil mis à jour avec succès.');
      setPassword(''); // Clear password field after success
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Une erreur est survenue lors de la mise à jour.');
    }
  };

  if (!student || !user) {
    return (
      <div className="empty-state">
        <p>Profil étudiant introuvable.</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-up">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2 className="page-title">Mon Profil</h2>
        <p className="page-desc">Consultez votre fiche étudiante et modifiez vos informations de contact.</p>
      </div>

      {successMsg && (
        <div className="toast success" style={{ position: 'relative', marginBottom: '1.5rem', animation: 'none' }}>
          <div className="toast-body">
            <div className="toast-title">Succès</div>
            <div className="toast-msg">{successMsg}</div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="toast error" style={{ position: 'relative', marginBottom: '1.5rem', animation: 'none' }}>
          <div className="toast-body">
            <div className="toast-title">Erreur</div>
            <div className="toast-msg">{errorMsg}</div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Fiche Étudiante (Read-only) */}
        <div className="page-card dg-left">
          <div className="page-card-header">
            <h3 className="page-card-title">Fiche Institutionnelle</h3>
            <span className={`badge ${student.statut === 'ACTIF' ? 'badge-green' : student.statut === 'ABANDONNE' ? 'badge-red' : student.statut === 'REDOUBLANT' ? 'badge-orange' : 'badge-blue'}`}>
              {student.statut}
            </span>
          </div>
          <div className="page-card-body">
            <div className="profile-fields" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <span className="profile-field-label">Nom complet</span>
                <div className="profile-field-value">{user.prenom} {user.nom}</div>
              </div>
              <div className="form-group">
                <span className="profile-field-label">CNE</span>
                <div className="profile-field-value">{student.cne}</div>
              </div>
              <div className="form-group">
                <span className="profile-field-label">Email Institutionnel</span>
                <div className="profile-field-value">{user.email}</div>
              </div>
              <div className="form-group">
                <span className="profile-field-label">Filière</span>
                <div className="profile-field-value">{filiere?.intitule || '—'}</div>
              </div>
              <div className="form-group">
                <span className="profile-field-label">Groupe d'appartenance</span>
                <div className="profile-field-value">{group?.idGroupe || '—'}</div>
              </div>
              <div className="form-group">
                <span className="profile-field-label">Année d'inscription</span>
                <div className="profile-field-value">Niveau {student.anneeInscription}</div>
              </div>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-3)' }}>
              * Ces informations sont gérées par l'administration. En cas d'erreur, veuillez contacter la scolarité.
            </p>
          </div>
        </div>

        {/* Paramètres (Modifiable) */}
        <div className="page-card dg-right">
          <div className="page-card-header">
            <h3 className="page-card-title">Paramètres du compte</h3>
          </div>
          <div className="page-card-body">
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Numéro de téléphone</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+212 6..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Laissez vide pour ne pas modifier"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  Saisissez un nouveau mot de passe pour sécuriser votre accès.
                </span>
              </div>

              <button type="submit" className="btn btn-primary w-100" style={{ width: '100%', justifyContent: 'center' }}>
                Mettre à jour mon profil
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;
