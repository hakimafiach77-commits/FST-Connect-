import React, { createContext, useContext, useState, useMemo } from 'react';
import api from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [db, setDb] = useState({
    utilisateurs: [], administrateurs: [],
    etudiants: [], enseignants: [], filieres: [], groupes: [], clubs: [],
    modules: [], affectations: [], documents: [], semestres: [],
    edts: [], seances: [], salles: [],
    absences: [], notes: [], reclamations: [], pfes: [], annonces: [], stages: []
  });

  const [loading, setLoading] = useState(true);

  const fetchSync = async () => {
    try {
      const token = localStorage.getItem('gdi_token');
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api('/sync');
        if (data.status === 'success' && data.data) {
          setDb(prev => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error("Failed to sync data", err);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSync();
  }, []);

  const legacyDb = useMemo(() => new Proxy(db, {
    get: (target, prop) => {
      if (prop === 'users') return target.utilisateurs || [];
      if (prop === 'students') return target.etudiants || [];
      if (prop === 'teachers') return target.enseignants || [];
      if (prop === 'sessions') return target.seances || [];
      if (prop === 'grades') return target.notes || [];
      if (prop === 'announcements') return target.annonces || [];
      if (prop === 'rooms') return target.salles || [];
      if (prop === 'groups') return target.groupes || [];
      if (prop === 'groupesTD' || prop === 'groupesTP') return target.groupes || [];
      
      const val = target[prop];
      if (val === undefined && [
        'utilisateurs', 'etudiants', 'enseignants', 'filieres', 'groupes', 'clubs',
        'modules', 'affectations', 'documents', 'semestres', 'edts', 'seances', 'salles',
        'absences', 'notes', 'reclamations', 'pfes', 'annonces', 'stages'
      ].includes(prop)) {
          return [];
      }
      return val;
    }
  }), [db]);

  const [counters, setCounters] = useState({
    utilisateurs: 100000, etudiants: 100000, enseignants: 100000, filieres: 100000,
    groupes: 100000, modules: 100000, seances: 100000, absences: 100000, notes: 100000,
    annonces: 100000, pfes: 100000, salles: 100000
  });

  const nextId = (col) => {
    const id = counters[col] || 100000;
    setCounters(prev => ({ ...prev, [col]: id + 1 }));
    return id;
  };

  const getById = (col, id) => {
    const list = legacyDb[col];
    if (!Array.isArray(list)) return null;
    return list.find(x => (x.id || x.idAnnonce || x.idEtudiant || x.idEnseignant || x.idModule) === parseInt(id));
  };

  const getItemId = (item) => {
    if (!item) return null;
    return item.idGroupe || item.idAnnonce || item.idEtudiant || item.idEnseignant ||
           item.idModule || item.idDocument || item.idAbsence || item.idPG || 
           item.idReclamation || item.idNote || item.idSalle || 
           item.idSeance || item.idFiliere || item.id;
  };

  const save = async (col, item) => {
    const actualCol = col === 'users' ? 'utilisateurs' : 
                      col === 'students' ? 'etudiants' : 
                      col === 'teachers' ? 'enseignants' : 
                      col === 'sessions' ? 'seances' : 
                      col === 'grades' ? 'notes' : 
                      col === 'announcements' ? 'annonces' : 
                      col === 'rooms' ? 'salles' : 
                      col === 'groupesTD' || col === 'groupesTP' || col === 'groups' ? 'groupes' : col;

    const primaryIdKeyMap = {
      'groupes': 'idGroupe', 'annonces': 'idAnnonce', 'etudiants': 'idEtudiant',
      'enseignants': 'idEnseignant', 'modules': 'idModule', 'filieres': 'idFiliere',
      'salles': 'idSalle', 'seances': 'idSeance', 'documents': 'idDocument',
      'absences': 'idAbsence', 'notes': 'idNote', 'reclamations': 'idReclamation',
      'utilisateurs': 'id'
    };
    const pkName = primaryIdKeyMap[actualCol] || 'id';

    // Treat entities as existing whenever a valid primary key is present.
    // Use both the mapped PK and generic `id` as fallback to avoid
    // misclassifying existing records when one representation is missing.
    const recordId = item[pkName] ?? item.id;
    const hasPk = recordId !== undefined && recordId !== null && recordId !== '';
    const isNew = !hasPk;
    const itemToSave = { ...item };

    if (isNew) {
      const tid = nextId(actualCol);
      itemToSave.id = tid;
      if (pkName !== 'id') itemToSave[pkName] = tid;
    }

    // Optimistic Update
    setDb(prev => {
      const updates = { ...prev };
      const actualList = [...(prev[actualCol] || [])];
      const targetId = getItemId(itemToSave);
      const idx = actualList.findIndex(x => getItemId(x) === targetId);
      
      if (idx >= 0) actualList[idx] = { ...actualList[idx], ...itemToSave };
      else actualList.push(itemToSave);
      
      updates[actualCol] = actualList;

      // ALSO Update associated utilisateur optimistically if names are provided
      if ((actualCol === 'etudiants' || actualCol === 'enseignants') && itemToSave.utilisateurId) {
        const userList = [...(prev.utilisateurs || [])];
        const uIdx = userList.findIndex(u => u.id === itemToSave.utilisateurId);
        if (uIdx >= 0) {
          userList[uIdx] = { 
            ...userList[uIdx], 
            nom: itemToSave.nom || userList[uIdx].nom,
            prenom: itemToSave.prenom || userList[uIdx].prenom,
            email: itemToSave.email || userList[uIdx].email
          };
          updates.utilisateurs = userList;
        }
      }
      
      return updates;
    });

    try {
      let endpoint = `/${actualCol}`;
      let method = isNew ? 'POST' : 'PATCH';

      // Custom Endpoints
      if (actualCol === 'utilisateurs') endpoint = isNew ? '/auth/register' : `/utilisateurs/${item.id}`;
      else if (actualCol === 'pfes') endpoint = isNew ? '/pfe/propose' : `/pfe/${item.idPG || item.id}`;
      else if (actualCol === 'reclamations' && isNew) endpoint = '/notes/reclaim';
      else if (actualCol === 'reclamations' && !isNew) endpoint = `/notes/reclaim/${recordId}`;
      else if (!isNew) endpoint = `/${actualCol}/${recordId}`;

      // Payload Construction (Ensures standard field names)
      const payload = { ...item };
      
      // Special mappings for specific columns to match Backend Controllers
      if (actualCol === 'annonces') {
        payload.titre = item.titre || item.title;
        payload.contenu = item.contenu || item.content;
      } else if (actualCol === 'groupes') {
        payload.nom = item.nom || item.name;
        payload.capaciteMax = parseInt(item.capaciteMax || item.capacity || item.capacite || 30);
      } else if (actualCol === 'salles') {
        payload.nom = item.nom || item.name;
        payload.capaciteMax = parseInt(item.capaciteMax || item.capacity || 40);
      } else if ((actualCol === 'etudiants' || actualCol === 'enseignants') && !isNew) {
        // Ensure names are NOT lost if not provided by UI
        const user = db.utilisateurs.find(u => u.id === item.utilisateurId);
        if (user) {
          if (!payload.nom && user.nom) payload.nom = user.nom;
          if (!payload.prenom && user.prenom) payload.prenom = user.prenom;
          if (!payload.email && user.email) payload.email = user.email;
        }
      }

      await api(endpoint, { method, body: JSON.stringify(payload) });
      await fetchSync();
    } catch (err) {
      console.error(`Failed to persist ${actualCol}:`, err);
      await fetchSync();
      throw err;
    }
  };

  const remove = async (col, id) => {
    const actualCol = col === 'users' ? 'utilisateurs' : col === 'announcements' ? 'annonces' : 
                      col === 'students' ? 'etudiants' : col === 'teachers' ? 'enseignants' :
                      col === 'modules' ? 'modules' : col === 'rooms' ? 'salles' : 
                      col === 'groups' || col === 'groupesTD' || col === 'groupesTP' ? 'groupes' : col;

    setDb(prev => ({ 
      ...prev, 
      [actualCol]: (prev[actualCol] || []).filter(x => getItemId(x) !== id) 
    }));

    try {
      const endpointMap = {
        'annonces': '/annonces', 'etudiants': '/etudiants', 'enseignants': '/enseignants',
        'modules': '/modules', 'documents': '/documents', 'filieres': '/filieres',
        'groupes': '/groupes', 'salles': '/salles', 'pfes': '/pfe', 'reclamations': '/notes/reclaim'
      };
      const url = endpointMap[actualCol] || `/${actualCol}`;
      await api(`${url}/${id}`, { method: 'DELETE' });
      await fetchSync();
    } catch (err) {
      console.error(`Failed to remove from ${actualCol}:`, err);
      await fetchSync();
    }
  };

  const filiereName = (id) => (db.filieres || []).find(f => (f.idFiliere || f.id) === parseInt(id))?.intitule || '—';
  const teacherName = (id) => {
    const ens = (db.enseignants || []).find(e => (e.idEnseignant || e.id) === parseInt(id));
    const user = (db.utilisateurs || []).find(u => u.id === ens?.utilisateurId);
    return user ? `${user.prenom} ${user.nom}` : (ens?.name || '—');
  };
  const studentName = (id) => {
    const etu = (db.etudiants || []).find(e => (e.idEtudiant || e.id) === parseInt(id));
    const user = (db.utilisateurs || []).find(u => u.id === etu?.utilisateurId);
    return user ? `${user.prenom} ${user.nom}` : (etu?.name || '—');
  };
  const moduleName = (id) => (db.modules || []).find(m => (m.idModule || m.id) === parseInt(id))?.intitule || '—';
  const roomName = (id) => (db.salles || []).find(r => (r.idSalle || r.id) === parseInt(id))?.nom || '—';
  const groupName = (id) => (db.groupes || []).find(g => (g.idGroupe || g.id) === parseInt(id))?.nom || '—';

  const unreadAnnouncements = (userId) => {
    return (db.annonces || []).filter(a => !a.readBy?.includes(userId)).length;
  };

  const getStudentByUserId = (userId) => (db.etudiants || []).find(s => s && (s.utilisateurId == userId || s.idEtudiant == userId || s.id == userId));
  const getTeacherByUserId = (userId) => (db.enseignants || []).find(t => t && (t.utilisateurId == userId || t.idEnseignant == userId || t.id == userId));

  const gradeAvg = (cc = 0, exam = 0, coeffCC = 0.4, coeffExam = 0.6) => {
    return (cc * coeffCC) + (exam * coeffExam);
  };

  const value = {
    db: legacyDb, loading, nextId, save, remove, getById,
    filiereName, teacherName, studentName, moduleName, roomName, groupName,
    unreadAnnouncements, getStudentByUserId, getTeacherByUserId, gradeAvg,
    fetchSync
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
