const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

/**
 * Strict positive integer ID parser
 */
const parseIdStrict = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  if (n <= 0 || !Number.isSafeInteger(n)) return null;
  return n;
};

/**
 * Safe projection for Utilisateur to ensure password is NEVER leaked
 */
const SAFE_USER_SELECT = {
  id: true,
  nom: true,
  prenom: true,
  email: true,
  role: true,
  statut: true,
  telephone: true,
  photo: true,
  dateCreation: true
};

/**
 * 1. GET /api/enseignants
 * @desc    Get filtered, searchable and optionally paginated list of teachers
 * @access  Private (Admin & Teacher)
 */
const getEnseignants = async (req, res) => {
  try {
    const { search, grade, specialite, type, statut, page, limit } = req.query;

    const where = {};

    // 1. Filtrage par grade
    if (grade && typeof grade === 'string' && grade.trim()) {
      where.grade = { contains: grade.trim(), mode: 'insensitive' };
    }

    // 2. Filtrage par spécialité
    if (specialite && typeof specialite === 'string' && specialite.trim()) {
      where.specialite = { contains: specialite.trim(), mode: 'insensitive' };
    }

    // 3. Filtrage par type (PERMANENT, VACATAIRE, etc.)
    if (type && typeof type === 'string' && type.trim()) {
      where.type = { contains: type.trim(), mode: 'insensitive' };
    }

    // 4. Filtrage par statut (ACTIF, INACTIF, BLOQUE)
    if (statut && typeof statut === 'string' && statut.trim()) {
      where.statut = statut.trim().toUpperCase();
    }

    // 5. Recherche multi-critères : nom, prénom, email, matricule, spécialité
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      where.OR = [
        { matricule: { contains: term, mode: 'insensitive' } },
        { grade: { contains: term, mode: 'insensitive' } },
        { specialite: { contains: term, mode: 'insensitive' } },
        { utilisateur: { nom: { contains: term, mode: 'insensitive' } } },
        { utilisateur: { prenom: { contains: term, mode: 'insensitive' } } },
        { utilisateur: { email: { contains: term, mode: 'insensitive' } } }
      ];
    }

    // Gestion de la pagination optionnelle
    const isPaginated = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const queryOptions = {
      where,
      include: {
        utilisateur: { select: SAFE_USER_SELECT },
        affectations: {
          include: {
            module: {
              select: {
                idModule: true,
                code: true,
                intitule: true,
                idFiliere: true,
                filiere: { select: { idFiliere: true, code: true, intitule: true } }
              }
            }
          }
        },
        _count: {
          select: {
            seances: true,
            modulesResponsable: true,
            groupesResponsable: true,
            affectations: true
          }
        }
      },
      orderBy: { idEnseignant: 'asc' }
    };

    if (isPaginated) {
      queryOptions.skip = skip;
      queryOptions.take = limitNum;
    }

    const [enseignants, total] = await Promise.all([
      prisma.enseignant.findMany(queryOptions),
      prisma.enseignant.count({ where })
    ]);

    const response = {
      status: 'success',
      data: enseignants,
      count: enseignants.length
    };

    if (isPaginated) {
      response.pagination = {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      };
    }

    res.json(response);
  } catch (error) {
    console.error('getEnseignants error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des enseignants' });
  }
};

/**
 * 2. GET /api/enseignants/:id
 * @desc    Get detailed teacher file by ID
 * @access  Private (Admin & Teacher)
 */
const getEnseignantById = async (req, res) => {
  const teacherId = parseIdStrict(req.params.id);
  if (!teacherId) {
    return res.status(400).json({ message: 'Identifiant enseignant invalide' });
  }

  try {
    const enseignant = await prisma.enseignant.findUnique({
      where: { idEnseignant: teacherId },
      include: {
        utilisateur: { select: SAFE_USER_SELECT },
        affectations: {
          include: {
            module: {
              include: {
                filiere: { select: { idFiliere: true, code: true, intitule: true } }
              }
            }
          }
        },
        modulesResponsable: {
          include: {
            filiere: { select: { idFiliere: true, code: true, intitule: true } }
          }
        },
        groupesResponsable: {
          include: {
            filiere: { select: { idFiliere: true, code: true, intitule: true } }
          }
        },
        seances: {
          include: {
            module: { select: { idModule: true, code: true, intitule: true } },
            salle: { select: { idSalle: true, nom: true } },
            groupe: { select: { idGroupe: true, nom: true, type: true } }
          }
        },
        pfesEncadres: {
          select: { idPG: true, titre: true, statut: true, idEtudiant: true }
        }
      }
    });

    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant introuvable' });
    }

    res.json({
      status: 'success',
      data: enseignant
    });
  } catch (error) {
    console.error('getEnseignantById error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du détail enseignant' });
  }
};

/**
 * 3. GET /api/enseignants/me
 * @desc    Get logged-in teacher profile
 * @access  Private (Teacher)
 */
const getMonProfilEnseignant = async (req, res) => {
  try {
    const enseignant = await prisma.enseignant.findUnique({
      where: { utilisateurId: req.user.id },
      include: {
        utilisateur: { select: SAFE_USER_SELECT },
        affectations: {
          include: {
            module: {
              include: {
                filiere: { select: { idFiliere: true, code: true, intitule: true } }
              }
            }
          }
        },
        modulesResponsable: {
          include: {
            filiere: { select: { idFiliere: true, code: true, intitule: true } }
          }
        },
        groupesResponsable: {
          include: {
            filiere: { select: { idFiliere: true, code: true, intitule: true } }
          }
        },
        seances: {
          include: {
            module: { select: { idModule: true, code: true, intitule: true } },
            salle: { select: { idSalle: true, nom: true } },
            groupe: { select: { idGroupe: true, nom: true, type: true } }
          }
        },
        pfesEncadres: {
          select: { idPG: true, titre: true, statut: true, idEtudiant: true }
        }
      }
    });

    if (!enseignant) {
      return res.status(404).json({ message: 'Profil enseignant introuvable pour ce compte' });
    }

    res.json({
      status: 'success',
      data: enseignant
    });
  } catch (error) {
    console.error('getMonProfilEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de votre profil enseignant' });
  }
};

/**
 * 4. PATCH /api/enseignants/me
 * @desc    Update personal allowed information for logged-in teacher
 * @access  Private (Teacher)
 */
const updateMonProfilEnseignant = async (req, res) => {
  const { nom, prenom, telephone, photo, password, ancienMotDePasse } = req.body;

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const dataToUpdate = {};

    if (nom !== undefined && typeof nom === 'string' && nom.trim()) {
      dataToUpdate.nom = nom.trim();
    }
    if (prenom !== undefined && typeof prenom === 'string' && prenom.trim()) {
      dataToUpdate.prenom = prenom.trim();
    }
    if (telephone !== undefined) {
      dataToUpdate.telephone = telephone ? String(telephone).trim() : null;
    }
    if (photo !== undefined) {
      dataToUpdate.photo = photo ? String(photo).trim() : null;
    }

    // Gestion sécurisée du changement de mot de passe
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caractères' });
      }

      if (ancienMotDePasse !== undefined) {
        const isMatch = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
        if (!isMatch) {
          return res.status(400).json({ message: 'L\'ancien mot de passe est incorrect' });
        }
      }

      dataToUpdate.motDePasse = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      select: SAFE_USER_SELECT
    });

    const enseignant = await prisma.enseignant.findUnique({
      where: { utilisateurId: req.user.id },
      include: {
        affectations: { include: { module: true } }
      }
    });

    res.json({
      status: 'success',
      message: 'Profil personnel mis à jour avec succès',
      data: {
        ...enseignant,
        utilisateur: updatedUser
      }
    });
  } catch (error) {
    console.error('updateMonProfilEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de votre profil' });
  }
};

/**
 * 5. POST /api/enseignants
 * @desc    Atomic teacher creation (Utilisateur role 'teacher' + Enseignant)
 * @access  Private/Admin
 */
const createEnseignant = async (req, res) => {
  let { nom, prenom, name, email, matricule, grade, specialite, specialty, type, volumeHoraireBase, password, telephone } = req.body;

  // Support compatibilité avec formulaire simplifié frontend
  if (!nom && name) {
    const parts = name.trim().split(/\s+/);
    prenom = parts[0];
    nom = parts.slice(1).join(' ') || parts[0];
  }
  if (!specialite && specialty) {
    specialite = specialty;
  }

  // Validations strictes des champs obligatoires
  if (!nom || typeof nom !== 'string' || !nom.trim()) {
    return res.status(400).json({ message: 'Le nom est obligatoire' });
  }
  if (!prenom || typeof prenom !== 'string' || !prenom.trim()) {
    return res.status(400).json({ message: 'Le prénom est obligatoire' });
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ message: 'L\'adresse email est obligatoire' });
  }
  if (!matricule || typeof matricule !== 'string' || !matricule.trim()) {
    return res.status(400).json({ message: 'Le matricule enseignant est obligatoire' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedMatricule = matricule.trim();

  // Validation format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Format d\'adresse email invalide' });
  }

  // Validation longueur mot de passe
  if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
    return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caractères' });
  }

  try {
    // 1. Vérification unicité email
    const existingEmail = await prisma.utilisateur.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingEmail) {
      return res.status(400).json({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Cette adresse email est déjà attribuée à un autre compte'
      });
    }

    // 2. Vérification unicité matricule
    const existingMatricule = await prisma.enseignant.findUnique({
      where: { matricule: normalizedMatricule }
    });
    if (existingMatricule) {
      return res.status(400).json({
        code: 'MATRICULE_ALREADY_EXISTS',
        message: 'Ce matricule enseignant est déjà utilisé'
      });
    }

    const hashedPassword = await bcrypt.hash(password || 'prof123', 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer le compte Utilisateur
      const user = await tx.utilisateur.create({
        data: {
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: normalizedEmail,
          motDePasse: hashedPassword,
          role: 'teacher',
          statut: 'ACTIF',
          telephone: telephone ? String(telephone).trim() : null
        },
        select: SAFE_USER_SELECT
      });

      // 2. Créer le profil Enseignant
      const enseignant = await tx.enseignant.create({
        data: {
          utilisateurId: user.id,
          matricule: normalizedMatricule,
          grade: grade ? String(grade).trim() : null,
          specialite: specialite ? String(specialite).trim() : null,
          type: type ? String(type).trim() : 'PERMANENT',
          volumeHoraireBase: volumeHoraireBase !== undefined && volumeHoraireBase !== null && volumeHoraireBase !== ''
            ? parseInt(volumeHoraireBase, 10)
            : 190,
          statut: 'ACTIF'
        }
      });

      return {
        ...enseignant,
        utilisateur: user
      };
    });

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      const field = target.includes('email') ? 'email' : 'matricule';
      return res.status(400).json({
        code: field === 'email' ? 'EMAIL_ALREADY_EXISTS' : 'MATRICULE_ALREADY_EXISTS',
        message: `Conflit: ce ${field} existe déjà en base.`
      });
    }
    console.error('createEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'enseignant' });
  }
};

/**
 * 6. PATCH /api/enseignants/:id
 * @desc    Update teacher profile and administrative data
 * @access  Private/Admin
 */
const updateEnseignant = async (req, res) => {
  const teacherId = parseIdStrict(req.params.id);
  if (!teacherId) {
    return res.status(400).json({ message: 'Identifiant enseignant invalide' });
  }

  let { nom, prenom, name, email, matricule, grade, specialite, specialty, statut, type, volumeHoraireBase, telephone } = req.body;

  if (!nom && name) {
    const parts = name.trim().split(/\s+/);
    prenom = parts[0];
    nom = parts.slice(1).join(' ') || parts[0];
  }
  if (!specialite && specialty) {
    specialite = specialty;
  }

  try {
    const enseignant = await prisma.enseignant.findUnique({
      where: { idEnseignant: teacherId },
      include: { utilisateur: true }
    });
    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant introuvable' });
    }

    // Validation et contrôle unicité email
    let normalizedEmail = undefined;
    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ message: 'L\'adresse email ne peut être vide' });
      }
      normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Format d\'adresse email invalide' });
      }

      if (normalizedEmail !== enseignant.utilisateur.email) {
        const emailCheck = await prisma.utilisateur.findUnique({
          where: { email: normalizedEmail }
        });
        if (emailCheck) {
          return res.status(400).json({
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Cette adresse email est déjà attribuée à un autre compte'
          });
        }
      }
    }

    // Validation et contrôle unicité matricule
    let normalizedMatricule = undefined;
    if (matricule !== undefined) {
      if (typeof matricule !== 'string' || !matricule.trim()) {
        return res.status(400).json({ message: 'Le matricule ne peut être vide' });
      }
      normalizedMatricule = matricule.trim();
      if (normalizedMatricule !== enseignant.matricule) {
        const matCheck = await prisma.enseignant.findUnique({
          where: { matricule: normalizedMatricule }
        });
        if (matCheck) {
          return res.status(400).json({
            code: 'MATRICULE_ALREADY_EXISTS',
            message: 'Ce matricule enseignant est déjà utilisé'
          });
        }
      }
    }

    // Validation du statut si spécifié
    let normalizedStatut = undefined;
    if (statut !== undefined) {
      const validStatuts = ['ACTIF', 'INACTIF', 'BLOQUE'];
      normalizedStatut = String(statut).trim().toUpperCase();
      if (!validStatuts.includes(normalizedStatut)) {
        return res.status(400).json({
          message: `Statut invalide. Valeurs acceptées: ${validStatuts.join(', ')}`
        });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mise à jour de l'Utilisateur
      const userData = {};
      if (nom !== undefined) userData.nom = String(nom).trim();
      if (prenom !== undefined) userData.prenom = String(prenom).trim();
      if (normalizedEmail !== undefined) userData.email = normalizedEmail;
      if (telephone !== undefined) userData.telephone = telephone ? String(telephone).trim() : null;
      if (normalizedStatut !== undefined) userData.statut = normalizedStatut;

      const updatedUser = await tx.utilisateur.update({
        where: { id: enseignant.utilisateurId },
        data: userData,
        select: SAFE_USER_SELECT
      });

      // 2. Mise à jour de l'Enseignant
      const enseignantData = {};
      if (normalizedMatricule !== undefined) enseignantData.matricule = normalizedMatricule;
      if (grade !== undefined) enseignantData.grade = grade ? String(grade).trim() : null;
      if (specialite !== undefined) enseignantData.specialite = specialite ? String(specialite).trim() : null;
      if (type !== undefined) enseignantData.type = type ? String(type).trim() : null;
      if (volumeHoraireBase !== undefined) {
        enseignantData.volumeHoraireBase = volumeHoraireBase !== null && volumeHoraireBase !== ''
          ? parseInt(volumeHoraireBase, 10)
          : null;
      }
      if (normalizedStatut !== undefined) enseignantData.statut = normalizedStatut;

      const updatedEnseignant = await tx.enseignant.update({
        where: { idEnseignant: teacherId },
        data: enseignantData
      });

      return {
        ...updatedEnseignant,
        utilisateur: updatedUser
      };
    });

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Conflit: l\'email ou le matricule existe déjà.' });
    }
    console.error('updateEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'enseignant' });
  }
};

/**
 * 7. PATCH /api/enseignants/:id/statut
 * @desc    Dedicated status update endpoint (synchronizes Enseignant & Utilisateur)
 * @access  Private/Admin
 */
const updateStatutEnseignant = async (req, res) => {
  const teacherId = parseIdStrict(req.params.id);
  if (!teacherId) {
    return res.status(400).json({ message: 'Identifiant enseignant invalide' });
  }

  const { statut } = req.body;
  if (!statut) {
    return res.status(400).json({ message: 'Le champ statut est obligatoire' });
  }

  const normalizedStatut = String(statut).trim().toUpperCase();
  const validStatuts = ['ACTIF', 'INACTIF', 'BLOQUE'];
  if (!validStatuts.includes(normalizedStatut)) {
    return res.status(400).json({
      message: `Statut invalide. Valeurs acceptées: ${validStatuts.join(', ')}`
    });
  }

  try {
    const enseignant = await prisma.enseignant.findUnique({
      where: { idEnseignant: teacherId }
    });
    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant introuvable' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.utilisateur.update({
        where: { id: enseignant.utilisateurId },
        data: { statut: normalizedStatut },
        select: SAFE_USER_SELECT
      });

      const e = await tx.enseignant.update({
        where: { idEnseignant: teacherId },
        data: { statut: normalizedStatut }
      });

      return { ...e, utilisateur: u };
    });

    res.json({
      status: 'success',
      message: `Statut de l'enseignant mis à jour vers ${normalizedStatut}`,
      data: updated
    });
  } catch (error) {
    console.error('updateStatutEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du statut enseignant' });
  }
};

/**
 * Internal helper to retrieve combined teacher modules (affectations + modulesResponsable)
 */
const getTeacherModulesInternal = async (teacherId) => {
  // 1. Affectations
  const affectations = await prisma.affectation.findMany({
    where: { idEnseignant: teacherId },
    include: {
      module: {
        include: {
          filiere: { select: { idFiliere: true, code: true, intitule: true } }
        }
      }
    }
  });

  // 2. Modules dont l'enseignant est responsable
  const modulesResponsable = await prisma.module.findMany({
    where: { idResponsable: teacherId },
    include: {
      filiere: { select: { idFiliere: true, code: true, intitule: true } }
    }
  });

  // Fusionner et dédupliquer par idModule
  const modulesMap = new Map();

  for (const a of affectations) {
    if (a.module) {
      const modId = a.module.idModule;
      if (!modulesMap.has(modId)) {
        modulesMap.set(modId, {
          ...a.module,
          isResponsable: false,
          affectations: []
        });
      }
      modulesMap.get(modId).affectations.push({
        idAffectation: a.idAffectation,
        typeIntervention: a.typeIntervention,
        heuresAssignees: a.heuresAssignees
      });
    }
  }

  for (const m of modulesResponsable) {
    const modId = m.idModule;
    if (!modulesMap.has(modId)) {
      modulesMap.set(modId, {
        ...m,
        isResponsable: true,
        affectations: []
      });
    } else {
      modulesMap.get(modId).isResponsable = true;
    }
  }

  return Array.from(modulesMap.values());
};

/**
 * 8. GET /api/enseignants/:id/modules
 * @desc    Get all modules and filieres associated to a teacher
 * @access  Private (Admin & Teacher)
 */
const getModulesEnseignant = async (req, res) => {
  const teacherId = parseIdStrict(req.params.id);
  if (!teacherId) {
    return res.status(400).json({ message: 'Identifiant enseignant invalide' });
  }

  try {
    const enseignant = await prisma.enseignant.findUnique({ where: { idEnseignant: teacherId } });
    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant introuvable' });
    }

    const modules = await getTeacherModulesInternal(teacherId);

    res.json({
      status: 'success',
      data: modules
    });
  } catch (error) {
    console.error('getModulesEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des modules de l\'enseignant' });
  }
};

/**
 * 9. GET /api/enseignants/me/modules
 * @desc    Get modules for logged-in teacher
 * @access  Private (Teacher)
 */
const getMesModulesEnseignant = async (req, res) => {
  try {
    const enseignant = await prisma.enseignant.findUnique({
      where: { utilisateurId: req.user.id }
    });

    if (!enseignant) {
      return res.status(404).json({ message: 'Profil enseignant introuvable pour ce compte' });
    }

    const modules = await getTeacherModulesInternal(enseignant.idEnseignant);

    res.json({
      status: 'success',
      data: modules
    });
  } catch (error) {
    console.error('getMesModulesEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de vos modules' });
  }
};

/**
 * 10. POST /api/enseignants/:id/affectations
 * @desc    Assign teacher to a module (intervention CM/TD/TP with hours)
 * @access  Private/Admin
 */
const createAffectation = async (req, res) => {
  const teacherId = parseIdStrict(req.params.id);
  if (!teacherId) {
    return res.status(400).json({ message: 'Identifiant enseignant invalide' });
  }

  const { idModule, typeIntervention, heuresAssignees } = req.body;
  const moduleId = parseIdStrict(idModule);
  if (!moduleId) {
    return res.status(400).json({ message: 'Identifiant module invalide ou manquant' });
  }

  if (!typeIntervention || typeof typeIntervention !== 'string' || !typeIntervention.trim()) {
    return res.status(400).json({ message: 'Le type d\'intervention est obligatoire (ex: CM, TD, TP)' });
  }

  const heures = parseInt(heuresAssignees, 10);
  if (isNaN(heures) || heures <= 0) {
    return res.status(400).json({ message: 'Le nombre d\'heures assignées doit être un entier supérieur à 0' });
  }

  try {
    const enseignant = await prisma.enseignant.findUnique({ where: { idEnseignant: teacherId } });
    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant introuvable' });
    }

    const moduleRecord = await prisma.module.findUnique({ where: { idModule: moduleId } });
    if (!moduleRecord) {
      return res.status(404).json({ message: 'Module introuvable' });
    }

    const normalizedType = typeIntervention.trim().toUpperCase();

    // Vérifier si cette affectation existe déjà
    const existing = await prisma.affectation.findFirst({
      where: {
        idEnseignant: teacherId,
        idModule: moduleId,
        typeIntervention: normalizedType
      }
    });

    if (existing) {
      return res.status(400).json({
        code: 'AFFECTATION_ALREADY_EXISTS',
        message: `Une affectation de type ${normalizedType} existe déjà pour cet enseignant sur ce module`
      });
    }

    const affectation = await prisma.affectation.create({
      data: {
        idEnseignant: teacherId,
        idModule: moduleId,
        typeIntervention: normalizedType,
        heuresAssignees: heures
      },
      include: {
        module: {
          select: { idModule: true, code: true, intitule: true, idFiliere: true }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: affectation
    });
  } catch (error) {
    console.error('createAffectation error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'affectation' });
  }
};

/**
 * 11. DELETE /api/enseignants/:id/affectations/:idAffectation
 * @desc    Remove an assignment from a teacher
 * @access  Private/Admin
 */
const deleteAffectation = async (req, res) => {
  const teacherId = parseIdStrict(req.params.id);
  const affectationId = parseIdStrict(req.params.idAffectation);

  if (!teacherId || !affectationId) {
    return res.status(400).json({ message: 'Identifiants enseignant ou affectation invalides' });
  }

  try {
    const affectation = await prisma.affectation.findFirst({
      where: {
        idAffectation: affectationId,
        idEnseignant: teacherId
      }
    });

    if (!affectation) {
      return res.status(404).json({ message: 'Affectation introuvable pour cet enseignant' });
    }

    await prisma.affectation.delete({
      where: { idAffectation: affectationId }
    });

    res.json({
      status: 'success',
      message: 'Affectation retirée avec succès'
    });
  } catch (error) {
    console.error('deleteAffectation error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'affectation' });
  }
};

/**
 * 12. DELETE /api/enseignants/:id
 * @desc    Safe teacher deletion with strict dependency guards and concurrency lock
 * @access  Private/Admin
 */
const deleteEnseignant = async (req, res) => {
  const teacherId = parseIdStrict(req.params.id);
  if (!teacherId) {
    return res.status(400).json({ message: 'Identifiant enseignant invalide' });
  }

  try {
    const enseignant = await prisma.enseignant.findUnique({
      where: { idEnseignant: teacherId }
    });

    if (!enseignant) {
      return res.status(404).json({ message: 'Enseignant introuvable' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Verrouillage exclusif de la ligne PostgreSQL (FOR UPDATE)
      await tx.$queryRaw`SELECT "idEnseignant" FROM "Enseignant" WHERE "idEnseignant" = ${teacherId} FOR UPDATE`;

      // 2. Contrôle rigoureux de toutes les dépendances académiques
      const [seancesCount, modulesRespCount, groupesRespCount, affectationsCount, pfesCount] = await Promise.all([
        tx.seance.count({ where: { idEnseignant: teacherId } }),
        tx.module.count({ where: { idResponsable: teacherId } }),
        tx.groupe.count({ where: { idEnseignant: teacherId } }),
        tx.affectation.count({ where: { idEnseignant: teacherId } }),
        tx.pfe.count({ where: { idEncadrant: teacherId } })
      ]);

      if (seancesCount > 0) {
        const error = new Error('Action rejetée : Impossible de supprimer un enseignant ayant des séances planifiées.');
        error.code = 'ENSEIGNANT_HAS_SEANCES';
        error.details = { seancesCount };
        error.suggestion = 'Pour archiver un enseignant actif, modifiez son statut en "INACTIF" via PATCH /api/enseignants/:id/statut.';
        throw error;
      }

      if (modulesRespCount > 0) {
        const error = new Error('Action rejetée : Impossible de supprimer un enseignant désigné comme responsable de module.');
        error.code = 'ENSEIGNANT_IS_MODULE_RESPONSABLE';
        error.details = { modulesRespCount };
        error.suggestion = 'Réassignez d\'abord la responsabilité du module avant de supprimer cet enseignant.';
        throw error;
      }

      if (groupesRespCount > 0) {
        const error = new Error('Action rejetée : Impossible de supprimer un enseignant responsable de groupe.');
        error.code = 'ENSEIGNANT_IS_GROUPE_RESPONSABLE';
        error.details = { groupesRespCount };
        error.suggestion = 'Réassignez d\'abord la responsabilité du groupe avant de supprimer cet enseignant.';
        throw error;
      }

      if (affectationsCount > 0) {
        const error = new Error('Action rejetée : Impossible de supprimer un enseignant ayant des affectations d\'enseignement actives.');
        error.code = 'ENSEIGNANT_HAS_AFFECTATIONS';
        error.details = { affectationsCount };
        error.suggestion = 'Veuillez retirer ses affectations ou désactiver son compte.';
        throw error;
      }

      if (pfesCount > 0) {
        const error = new Error('Action rejetée : Impossible de supprimer un enseignant encadrant des PFEs.');
        error.code = 'ENSEIGNANT_HAS_PFES';
        error.details = { pfesCount };
        error.suggestion = 'Réassignez l\'encadrement des projets de fin d\'études avant suppression.';
        throw error;
      }

      // 3. Suppression sécurisée pour un enseignant sans dépendances
      await tx.enseignant.delete({ where: { idEnseignant: teacherId } });
      await tx.utilisateur.delete({ where: { id: enseignant.utilisateurId } });
    });

    res.json({
      status: 'success',
      message: 'Enseignant et compte utilisateur supprimés avec succès (aucune dépendance liée)'
    });
  } catch (error) {
    if (error.code && error.code.startsWith('ENSEIGNANT_')) {
      return res.status(400).json({
        code: error.code,
        message: error.message,
        details: error.details,
        suggestion: error.suggestion
      });
    }
    console.error('deleteEnseignant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'enseignant' });
  }
};

module.exports = {
  getEnseignants,
  getEnseignantById,
  getMonProfilEnseignant,
  updateMonProfilEnseignant,
  getMesModulesEnseignant,
  createEnseignant,
  updateEnseignant,
  updateStatutEnseignant,
  deleteEnseignant,
  getModulesEnseignant,
  createAffectation,
  deleteAffectation
};
