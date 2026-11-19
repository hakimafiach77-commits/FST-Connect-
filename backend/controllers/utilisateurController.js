const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

/**
 * 1. GET /api/utilisateurs
 * @desc    Obtenir la liste paginée et filtrée des utilisateurs
 * @access  Private/Admin
 */
const getUtilisateurs = async (req, res) => {
  try {
    const { role, statut, search, page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (role && ['admin', 'teacher', 'student'].includes(role)) {
      where.role = role;
    }

    if (statut && ['ACTIF', 'INACTIF', 'BLOQUE'].includes(statut)) {
      where.statut = statut;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { nom: { contains: term, mode: 'insensitive' } },
        { prenom: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } }
      ];
    }

    const [total, utilisateurs] = await Promise.all([
      prisma.utilisateur.count({ where }),
      prisma.utilisateur.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { dateCreation: 'desc' },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          telephone: true,
          statut: true,
          photo: true,
          dateCreation: true,
          compteurTentatives: true,
          bloqueJusquA: true,
          administrateur: { select: { matricule: true } },
          enseignant: { select: { idEnseignant: true, matricule: true, grade: true, specialite: true } },
          etudiant: {
            select: {
              idEtudiant: true,
              cne: true,
              idFiliere: true,
              filiere: { select: { code: true, intitule: true } }
            }
          }
        }
      })
    ]);

    res.json({
      status: 'success',
      data: utilisateurs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('getUtilisateurs error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
};

/**
 * 2. GET /api/utilisateurs/:id
 * @desc    Obtenir les détails complets d'un utilisateur par son ID
 * @access  Private (Admin ou Propriétaire du compte)
 */
const getUtilisateurById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Identifiant utilisateur invalide' });
    }

    // Contrôle IDOR : seul un admin ou le propriétaire peut consulter le détail
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez consulter que votre propre compte' });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        telephone: true,
        statut: true,
        photo: true,
        dateCreation: true,
        compteurTentatives: true,
        bloqueJusquA: true,
        administrateur: true,
        enseignant: {
          include: {
            affectations: {
              include: { module: true }
            }
          }
        },
        etudiant: {
          include: {
            filiere: true,
            groupeTD: true,
            groupeTP: true
          }
        },
        historiqueConnexions: {
          take: 10,
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      status: 'success',
      data: utilisateur
    });
  } catch (error) {
    console.error('getUtilisateurById error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du compte' });
  }
};

/**
 * 3. POST /api/utilisateurs
 * @desc    Création administrative d'un compte utilisateur (ex: admin ou compte générique)
 * @access  Private/Admin
 */
const createUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role = 'student', telephone, photo, matricule } = req.body;

    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'Nom, prénom et email sont obligatoires' });
    }

    const validRoles = ['admin', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Rôle invalide. Rôles acceptés: ${validRoles.join(', ')}` });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Vérification de l'unicité
    const existing = await prisma.utilisateur.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà associé à un compte' });
    }

    const defaultPass = role === 'admin' ? 'admin123' : (role === 'teacher' ? 'prof123' : 'student123');
    const rawPass = (motDePasse && motDePasse.trim()) ? motDePasse.trim() : defaultPass;
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.utilisateur.create({
        data: {
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: normalizedEmail,
          motDePasse: hashedPassword,
          role,
          telephone: telephone ? telephone.trim() : null,
          photo: photo || null,
          statut: 'ACTIF'
        }
      });

      // Si création d'un administrateur, créer sa fiche Administrateur associée
      if (role === 'admin') {
        await tx.administrateur.create({
          data: {
            utilisateurId: user.id,
            matricule: matricule ? matricule.trim() : `ADM-${Date.now()}`
          }
        });
      }

      return user;
    });

    const { motDePasse: _, ...userSafe } = result;

    res.status(201).json({
      status: 'success',
      data: userSafe
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    console.error('createUtilisateur error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du compte' });
  }
};

/**
 * 4. PATCH /api/utilisateurs/:id
 * @desc    Modifier un utilisateur (profil personnel ou administratif)
 * @access  Private (Admin ou Propriétaire du compte)
 */
const updateUtilisateur = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Identifiant utilisateur invalide' });
    }

    const userToUpdate = await prisma.utilisateur.findUnique({
      where: { id: userId }
    });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.id === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez modifier que votre propre compte' });
    }

    const updateData = {};

    // 1. Informations de contact et mot de passe (modifiables par propriétaire ou admin)
    if (req.body.hasOwnProperty('telephone')) {
      updateData.telephone = req.body.telephone ? req.body.telephone.trim() : null;
    }

    if (req.body.hasOwnProperty('photo')) {
      updateData.photo = req.body.photo || null;
    }

    if (req.body.motDePasse && typeof req.body.motDePasse === 'string' && req.body.motDePasse.trim()) {
      if (req.body.motDePasse.trim().length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit comporter au moins 6 caractères' });
      }
      updateData.motDePasse = await bcrypt.hash(req.body.motDePasse.trim(), 10);
      updateData.compteurTentatives = 0;
      updateData.bloqueJusquA = null;
    }

    // 2. Champs strictement réservés aux administrateurs (anti-élévation de privilèges)
    if (isAdmin) {
      if (req.body.nom && req.body.nom.trim()) {
        updateData.nom = req.body.nom.trim();
      }

      if (req.body.prenom && req.body.prenom.trim()) {
        updateData.prenom = req.body.prenom.trim();
      }

      if (req.body.email && req.body.email.trim()) {
        const newEmail = req.body.email.trim().toLowerCase();
        if (newEmail !== userToUpdate.email) {
          const emailCheck = await prisma.utilisateur.findUnique({ where: { email: newEmail } });
          if (emailCheck) {
            return res.status(400).json({ message: 'Cet email est déjà attribué à un autre compte' });
          }
          updateData.email = newEmail;
        }
      }

      if (req.body.role && ['admin', 'teacher', 'student'].includes(req.body.role)) {
        updateData.role = req.body.role;
      }

      if (req.body.statut && ['ACTIF', 'INACTIF', 'BLOQUE'].includes(req.body.statut)) {
        updateData.statut = req.body.statut;
        if (req.body.statut === 'ACTIF') {
          updateData.compteurTentatives = 0;
          updateData.bloqueJusquA = null;
        }
      }
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        telephone: true,
        statut: true,
        photo: true,
        dateCreation: true,
        compteurTentatives: true,
        bloqueJusquA: true
      }
    });

    res.json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    console.error('updateUtilisateur error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du compte' });
  }
};

/**
 * 5. PATCH /api/utilisateurs/:id/statut
 * @desc    Activer ou désactiver explicitement un compte (gestion administrative)
 * @access  Private/Admin
 */
const toggleStatutUtilisateur = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { statut } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Identifiant utilisateur invalide' });
    }

    const validStatuts = ['ACTIF', 'INACTIF', 'BLOQUE'];
    if (!statut || !validStatuts.includes(statut)) {
      return res.status(400).json({ message: `Statut invalide. Valeurs acceptées: ${validStatuts.join(', ')}` });
    }

    const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // Protection anti-auto-verrouillage pour l'administrateur
    if (user.id === req.user.id && statut !== 'ACTIF') {
      return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte administrateur' });
    }

    const updatePayload = { statut };

    // Si réactivation administrative en ACTIF : réinitialisation du compteur et levée du verrou temporaire
    if (statut === 'ACTIF') {
      updatePayload.compteurTentatives = 0;
      updatePayload.bloqueJusquA = null;
    }

    const updated = await prisma.utilisateur.update({
      where: { id: userId },
      data: updatePayload,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statut: true,
        bloqueJusquA: true,
        compteurTentatives: true
      }
    });

    res.json({
      status: 'success',
      data: updated,
      message: `Statut du compte mis à jour vers ${statut}`
    });
  } catch (error) {
    console.error('toggleStatutUtilisateur error:', error);
    res.status(500).json({ message: 'Erreur serveur lors du changement de statut' });
  }
};

module.exports = {
  getUtilisateurs,
  getUtilisateurById,
  createUtilisateur,
  updateUtilisateur,
  toggleStatutUtilisateur
};
