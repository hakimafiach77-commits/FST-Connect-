const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

/**
 * 1. GET /api/etudiants
 * @desc    Obtenir la liste paginée et filtrée des étudiants
 * @access  Private (Admin & Enseignants)
 */
const getEtudiants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      idFiliere,
      anneeInscription,
      statut,
      idGroupeTD,
      idGroupeTP
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // 1. Filtrage par filière
    if (idFiliere && !isNaN(parseInt(idFiliere))) {
      where.idFiliere = parseInt(idFiliere);
    }

    // 2. Filtrage par année d'inscription (1, 2, 3...)
    if (anneeInscription && !isNaN(parseInt(anneeInscription))) {
      where.anneeInscription = parseInt(anneeInscription);
    }

    // 3. Filtrage par statut académique (ACTIF, REDOUBLANT, DIPLOME, ABANDONNE)
    if (statut && typeof statut === 'string' && statut.trim()) {
      where.statut = statut.trim().toUpperCase();
    }

    // 4. Filtrage par groupes TD / TP
    if (idGroupeTD && !isNaN(parseInt(idGroupeTD))) {
      where.idGroupeTD = parseInt(idGroupeTD);
    }
    if (idGroupeTP && !isNaN(parseInt(idGroupeTP))) {
      where.idGroupeTP = parseInt(idGroupeTP);
    }

    // 5. Recherche multi-critères : nom, prénom, email ou CNE
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      where.OR = [
        { cne: { contains: term, mode: 'insensitive' } },
        { utilisateur: { nom: { contains: term, mode: 'insensitive' } } },
        { utilisateur: { prenom: { contains: term, mode: 'insensitive' } } },
        { utilisateur: { email: { contains: term, mode: 'insensitive' } } }
      ];
    }

    // 6. Restriction de visibilité pour les enseignants (filières autorisées)
    if (req.user.role === 'teacher') {
      const enseignant = await prisma.enseignant.findUnique({
        where: { utilisateurId: req.user.id },
        include: { affectations: { include: { module: true } } }
      });

      const teacherFiliereIds = (enseignant?.affectations || [])
        .map(a => a.module?.idFiliere)
        .filter(Boolean);

      // Si l'enseignant ne possède aucune affectation de filière, retourner une liste vide
      if (teacherFiliereIds.length === 0) {
        return res.json({
          status: 'success',
          data: [],
          pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 }
        });
      }

      // Si l'enseignant demande une filière spécifique, vérifier qu'elle fait partie de ses affectations
      if (where.idFiliere) {
        if (!teacherFiliereIds.includes(where.idFiliere)) {
          return res.json({
            status: 'success',
            data: [],
            pagination: { total: 0, page: pageNum, limit: limitNum, totalPages: 0 }
          });
        }
      } else {
        where.idFiliere = { in: teacherFiliereIds };
      }
    }

    const [total, etudiants] = await Promise.all([
      prisma.etudiant.count({ where }),
      prisma.etudiant.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { anneeInscription: 'asc' },
          { utilisateur: { nom: 'asc' } }
        ],
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true,
              statut: true,
              telephone: true,
              photo: true
            }
          },
          filiere: {
            select: {
              idFiliere: true,
              code: true,
              intitule: true,
              niveauEtude: true,
              duree: true
            }
          },
          groupeTD: {
            select: { idGroupe: true, nom: true, type: true }
          },
          groupeTP: {
            select: { idGroupe: true, nom: true, type: true }
          },
          compteurAbsence: {
            select: { totalHeuresAbsence: true, tauxActuel: true }
          }
        }
      })
    ]);

    res.json({
      status: 'success',
      data: etudiants,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('getEtudiants error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des étudiants' });
  }
};

/**
 * 2. GET /api/etudiants/me
 * @desc    Obtenir le dossier complet de l'étudiant actuellement connecté
 * @access  Private (Étudiant connecté uniquement)
 */
const getMonProfilEtudiant = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Cette ressource est réservée aux étudiants' });
    }

    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: req.user.id },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            statut: true,
            telephone: true,
            photo: true,
            dateCreation: true
          }
        },
        filiere: true,
        groupeTD: true,
        groupeTP: true,
        groupeProjet: true,
        compteurAbsence: true,
        notes: {
          include: {
            module: {
              select: { idModule: true, code: true, intitule: true, coefficient: true, semestre: true }
            }
          }
        },
        absences: {
          take: 20,
          orderBy: { dateSaisie: 'desc' },
          include: {
            seance: {
              select: { idSeance: true, type: true, jour: true, heureDebut: true, heureFin: true }
            }
          }
        },
        stages: true,
        pfes: true
      }
    });

    if (!etudiant) {
      return res.status(404).json({ message: 'Dossier étudiant introuvable pour ce compte' });
    }

    res.json({
      status: 'success',
      data: etudiant
    });
  } catch (error) {
    console.error('getMonProfilEtudiant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du dossier étudiant' });
  }
};

/**
 * 3. GET /api/etudiants/:id
 * @desc    Obtenir le dossier détaillé d'un étudiant par son ID (idEtudiant)
 * @access  Private (Admin, Enseignant autorisé, ou Étudiant propriétaire)
 */
const getEtudiantById = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      return res.status(400).json({ message: 'Identifiant étudiant invalide' });
    }

    const etudiant = await prisma.etudiant.findUnique({
      where: { idEtudiant: studentId },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            statut: true,
            telephone: true,
            photo: true,
            dateCreation: true
          }
        },
        filiere: true,
        groupeTD: true,
        groupeTP: true,
        groupeProjet: true,
        compteurAbsence: true,
        notes: {
          include: {
            module: {
              select: { idModule: true, code: true, intitule: true, coefficient: true, semestre: true }
            }
          }
        },
        absences: {
          take: 50,
          orderBy: { dateSaisie: 'desc' },
          include: {
            seance: {
              select: { idSeance: true, type: true, jour: true, heureDebut: true, heureFin: true }
            }
          }
        },
        stages: true,
        pfes: true
      }
    });

    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant introuvable' });
    }

    // Contrôle d'accès sécurisé :
    // 1. L'étudiant ne peut consulter QUE son propre dossier
    if (req.user.role === 'student' && etudiant.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez consulter que votre propre dossier' });
    }

    // 2. L'enseignant ne peut consulter que les étudiants de ses filières d'enseignement
    if (req.user.role === 'teacher') {
      const enseignant = await prisma.enseignant.findUnique({
        where: { utilisateurId: req.user.id },
        include: { affectations: { include: { module: true } } }
      });

      const teacherFiliereIds = (enseignant?.affectations || [])
        .map(a => a.module?.idFiliere)
        .filter(Boolean);

      // Si l'enseignant ne possède aucune affectation de filière
      if (teacherFiliereIds.length === 0) {
        return res.status(403).json({
          message: 'Accès non autorisé : vous ne possédez aucune affectation de filière'
        });
      }

      // Si l'étudiant n'a pas de filière ou n'appartient pas à l'une des filières de l'enseignant
      if (!etudiant.idFiliere || !teacherFiliereIds.includes(etudiant.idFiliere)) {
        return res.status(403).json({
          message: 'Accès non autorisé : cet étudiant n\'appartient pas à vos filières d\'enseignement'
        });
      }
    }

    res.json({
      status: 'success',
      data: etudiant
    });
  } catch (error) {
    console.error('getEtudiantById error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la consultation de l\'étudiant' });
  }
};

/**
 * 4. POST /api/etudiants
 * @desc    Inscription d'un étudiant :
 *          Mode A : Création conjointe d'un compte Utilisateur et de sa fiche Étudiant
 *          Mode B : Association d'un compte Utilisateur existant (role: student) sans dossier étudiant
 * @access  Private/Admin
 */
const createEtudiant = async (req, res) => {
  const {
    nom,
    prenom,
    email,
    cne,
    idFiliere,
    idGroupeTD,
    idGroupeTP,
    anneeInscription = 1,
    password,
    telephone,
    photo,
    utilisateurId
  } = req.body;

  try {
    // 1. Validation du CNE (obligatoire et unique)
    if (!cne || typeof cne !== 'string' || !cne.trim()) {
      return res.status(400).json({ message: 'Le CNE est obligatoire' });
    }
    const cleanCne = cne.trim();

    const existingCne = await prisma.etudiant.findUnique({
      where: { cne: cleanCne }
    });
    if (existingCne) {
      return res.status(400).json({ message: 'Ce CNE est déjà utilisé par un autre étudiant' });
    }

    // 2. Validation de la Filière (si fournie)
    let parsedFiliereId = undefined;
    if (idFiliere !== undefined && idFiliere !== null && idFiliere !== '') {
      parsedFiliereId = parseInt(idFiliere);
      if (isNaN(parsedFiliereId)) {
        return res.status(400).json({ message: 'Identifiant de filière invalide' });
      }
      const filiereExists = await prisma.filiere.findUnique({
        where: { idFiliere: parsedFiliereId }
      });
      if (!filiereExists) {
        return res.status(400).json({ message: 'La filière spécifiée est introuvable' });
      }
    }

    // 3. Validation des groupes TD et TP (si fournis)
    let parsedGroupeTD = undefined;
    if (idGroupeTD !== undefined && idGroupeTD !== null && idGroupeTD !== '') {
      parsedGroupeTD = parseInt(idGroupeTD);
      if (!isNaN(parsedGroupeTD)) {
        const groupTD = await prisma.groupe.findUnique({ where: { idGroupe: parsedGroupeTD } });
        if (!groupTD) {
          return res.status(400).json({ message: 'Le groupe TD spécifié est introuvable' });
        }
      }
    }

    let parsedGroupeTP = undefined;
    if (idGroupeTP !== undefined && idGroupeTP !== null && idGroupeTP !== '') {
      parsedGroupeTP = parseInt(idGroupeTP);
      if (!isNaN(parsedGroupeTP)) {
        const groupTP = await prisma.groupe.findUnique({ where: { idGroupe: parsedGroupeTP } });
        if (!groupTP) {
          return res.status(400).json({ message: 'Le groupe TP spécifié est introuvable' });
        }
      }
    }

    const parsedAnnee = parseInt(anneeInscription) || 1;

    // ── MODE B : Association d'un compte utilisateur existant ──
    if (utilisateurId) {
      const parsedUserId = parseInt(utilisateurId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: 'Identifiant utilisateur invalide' });
      }

      const existingUser = await prisma.utilisateur.findUnique({
        where: { id: parsedUserId },
        include: { etudiant: true }
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }

      if (existingUser.role !== 'student') {
        return res.status(400).json({ message: 'Le compte utilisateur doit impérativement avoir le rôle "student"' });
      }

      if (existingUser.etudiant) {
        return res.status(400).json({ message: 'Cet utilisateur possède déjà un dossier étudiant associé' });
      }

      const result = await prisma.$transaction(async (tx) => {
        const etudiant = await tx.etudiant.create({
          data: {
            utilisateurId: existingUser.id,
            cne: cleanCne,
            idFiliere: parsedFiliereId,
            idGroupeTD: parsedGroupeTD,
            idGroupeTP: parsedGroupeTP,
            anneeInscription: parsedAnnee,
            statut: 'ACTIF'
          },
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                role: true,
                statut: true,
                telephone: true,
                photo: true
              }
            },
            filiere: true,
            groupeTD: true,
            groupeTP: true
          }
        });

        await tx.compteurAbsence.create({
          data: { idEtudiant: etudiant.idEtudiant, totalHeuresAbsence: 0 }
        });

        return etudiant;
      });

      return res.status(201).json({
        status: 'success',
        data: result
      });
    }

    // ── MODE A : Création conjointe (Utilisateur + Étudiant) ──
    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'Nom, prénom et email sont obligatoires pour créer un nouvel étudiant' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Adresse email invalide' });
    }

    const userWithEmail = await prisma.utilisateur.findUnique({
      where: { email: normalizedEmail }
    });
    if (userWithEmail) {
      return res.status(400).json({ message: 'Cet email est déjà associé à un compte existant' });
    }

    const hashedPassword = await bcrypt.hash(password ? password.trim() : 'student123', 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.utilisateur.create({
        data: {
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: normalizedEmail,
          motDePasse: hashedPassword,
          role: 'student',
          telephone: telephone ? telephone.trim() : null,
          photo: photo || null,
          statut: 'ACTIF'
        }
      });

      const etudiant = await tx.etudiant.create({
        data: {
          utilisateurId: user.id,
          cne: cleanCne,
          idFiliere: parsedFiliereId,
          idGroupeTD: parsedGroupeTD,
          idGroupeTP: parsedGroupeTP,
          anneeInscription: parsedAnnee,
          statut: 'ACTIF'
        },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true,
              statut: true,
              telephone: true,
              photo: true
            }
          },
          filiere: true,
          groupeTD: true,
          groupeTP: true
        }
      });

      await tx.compteurAbsence.create({
        data: { idEtudiant: etudiant.idEtudiant, totalHeuresAbsence: 0 }
      });

      return etudiant;
    });

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Conflit d\'unicité : email ou CNE déjà utilisé' });
    }
    console.error('createEtudiant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription de l\'étudiant' });
  }
};

/**
 * 5. PATCH /api/etudiants/:id
 * @desc    Modifier les informations d'un dossier étudiant et son profil utilisateur
 * @access  Private/Admin
 */
const updateEtudiant = async (req, res) => {
  const studentId = parseInt(req.params.id);

  if (isNaN(studentId)) {
    return res.status(400).json({ message: 'Identifiant étudiant invalide' });
  }

  const {
    nom,
    prenom,
    email,
    telephone,
    photo,
    cne,
    idFiliere,
    idGroupeTD,
    idGroupeTP,
    anneeInscription,
    statut
  } = req.body;

  try {
    const etudiant = await prisma.etudiant.findUnique({
      where: { idEtudiant: studentId },
      include: { utilisateur: true }
    });

    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant introuvable' });
    }

    // 1. Validation de l'unicité du CNE si modifié
    if (cne && cne.trim() && cne.trim() !== etudiant.cne) {
      const cneCheck = await prisma.etudiant.findUnique({
        where: { cne: cne.trim() }
      });
      if (cneCheck) {
        return res.status(400).json({ message: 'Ce CNE est déjà utilisé par un autre étudiant' });
      }
    }

    // 2. Validation de l'unicité de l'email si modifié
    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== etudiant.utilisateur.email) {
        const emailCheck = await prisma.utilisateur.findUnique({
          where: { email: normalizedEmail }
        });
        if (emailCheck) {
          return res.status(400).json({ message: 'Cet email est déjà attribué à un autre compte' });
        }
      }
    }

    // 3. Validation de la filière si modifiée
    let finalIdFiliere = undefined;
    if (req.body.hasOwnProperty('idFiliere')) {
      if (idFiliere === null || idFiliere === '') {
        finalIdFiliere = null;
      } else {
        finalIdFiliere = parseInt(idFiliere);
        const filiereCheck = await prisma.filiere.findUnique({ where: { idFiliere: finalIdFiliere } });
        if (!filiereCheck) {
          return res.status(400).json({ message: 'La filière spécifiée est introuvable' });
        }
      }
    }

    // 4. Validation des groupes TD et TP
    let finalIdGroupeTD = undefined;
    if (req.body.hasOwnProperty('idGroupeTD')) {
      if (idGroupeTD === null || idGroupeTD === '') {
        finalIdGroupeTD = null;
      } else {
        finalIdGroupeTD = parseInt(idGroupeTD);
        const groupCheck = await prisma.groupe.findUnique({ where: { idGroupe: finalIdGroupeTD } });
        if (!groupCheck) {
          return res.status(400).json({ message: 'Le groupe TD spécifié est introuvable' });
        }
      }
    }

    let finalIdGroupeTP = undefined;
    if (req.body.hasOwnProperty('idGroupeTP')) {
      if (idGroupeTP === null || idGroupeTP === '') {
        finalIdGroupeTP = null;
      } else {
        finalIdGroupeTP = parseInt(idGroupeTP);
        const groupCheck = await prisma.groupe.findUnique({ where: { idGroupe: finalIdGroupeTP } });
        if (!groupCheck) {
          return res.status(400).json({ message: 'Le groupe TP spécifié est introuvable' });
        }
      }
    }

    // 5. Validation du statut académique
    const validStatuts = ['ACTIF', 'REDOUBLANT', 'DIPLOME', 'ABANDONNE'];
    if (statut && !validStatuts.includes(statut.toUpperCase())) {
      return res.status(400).json({
        message: `Statut académique invalide. Valeurs acceptées: ${validStatuts.join(', ')}`
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Mise à jour de l'Utilisateur
      const userUpdateData = {};
      if (nom && nom.trim()) userUpdateData.nom = nom.trim();
      if (prenom && prenom.trim()) userUpdateData.prenom = prenom.trim();
      if (email && email.trim()) userUpdateData.email = email.trim().toLowerCase();
      if (req.body.hasOwnProperty('telephone')) userUpdateData.telephone = telephone ? telephone.trim() : null;
      if (req.body.hasOwnProperty('photo')) userUpdateData.photo = photo || null;

      if (Object.keys(userUpdateData).length > 0) {
        await tx.utilisateur.update({
          where: { id: etudiant.utilisateurId },
          data: userUpdateData
        });
      }

      // Mise à jour de l'Étudiant
      const etudiantUpdateData = {};
      if (cne && cne.trim()) etudiantUpdateData.cne = cne.trim();
      if (finalIdFiliere !== undefined) etudiantUpdateData.idFiliere = finalIdFiliere;
      if (finalIdGroupeTD !== undefined) etudiantUpdateData.idGroupeTD = finalIdGroupeTD;
      if (finalIdGroupeTP !== undefined) etudiantUpdateData.idGroupeTP = finalIdGroupeTP;
      if (anneeInscription) etudiantUpdateData.anneeInscription = parseInt(anneeInscription);
      if (statut) etudiantUpdateData.statut = statut.toUpperCase();

      const result = await tx.etudiant.update({
        where: { idEtudiant: studentId },
        data: etudiantUpdateData,
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              role: true,
              statut: true,
              telephone: true,
              photo: true
            }
          },
          filiere: true,
          groupeTD: true,
          groupeTP: true
        }
      });

      return result;
    });

    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Conflit d\'unicité : email ou CNE déjà utilisé' });
    }
    console.error('updateEtudiant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'étudiant' });
  }
};

/**
 * 6. DELETE /api/etudiants/:id
 * @desc    Suppression sécurisée d'un étudiant avec respect strict de la règle RG21 :
 *          Si des notes, absences, stages ou PFEs existent, la suppression définitive est bloquée.
 * @access  Private/Admin
 */
const deleteEtudiant = async (req, res) => {
  const studentId = parseInt(req.params.id);

  if (isNaN(studentId)) {
    return res.status(400).json({ message: 'Identifiant étudiant invalide' });
  }

  try {
    const etudiant = await prisma.etudiant.findUnique({
      where: { idEtudiant: studentId }
    });

    if (!etudiant) {
      return res.status(404).json({ message: 'Étudiant introuvable' });
    }

    // ── VÉRIFICATION RÈGLE RG21 & SUPPRESSION ATOMIQUE PROTÉGÉE CONTRE LA CONCURRENCE ──
    await prisma.$transaction(async (tx) => {
      // 1. Verrouillage exclusif de la ligne étudiant dans PostgreSQL pour éliminer toute fenêtre de concurrence (FOR UPDATE)
      await tx.$queryRaw`SELECT "idEtudiant" FROM "Etudiant" WHERE "idEtudiant" = ${studentId} FOR UPDATE`;

      // 2. Vérification des relations académiques avec l'instance transactionnelle tx
      const [notesCount, absencesCount, pfesCount, stagesCount] = await Promise.all([
        tx.note.count({ where: { idEtudiant: studentId } }),
        tx.absence.count({ where: { idEtudiant: studentId } }),
        tx.pfe.count({ where: { idEtudiant: studentId } }),
        tx.stage.count({ where: { idEtudiant: studentId } })
      ]);

      if (notesCount > 0 || absencesCount > 0 || pfesCount > 0 || stagesCount > 0) {
        const error = new Error('Action rejetée (Règle RG21) : Impossible de supprimer définitivement un dossier étudiant contenant des notes, absences, stages ou PFEs liés.');
        error.code = 'RG21_VIOLATION';
        error.details = {
          notes: notesCount,
          absences: absencesCount,
          pfes: pfesCount,
          stages: stagesCount
        };
        error.suggestion = 'Pour préserver l\'intégrité des archives académiques, changez le statut de l\'étudiant en "ABANDONNE" via PATCH /api/etudiants/:id ou désactivez son compte via PATCH /api/utilisateurs/:id/statut.';
        throw error;
      }

      // 3. Aucune donnée académique liée : suppression sécurisée dans la transaction
      await tx.compteurAbsence.deleteMany({ where: { idEtudiant: studentId } });
      await tx.etudiant.delete({ where: { idEtudiant: studentId } });
      await tx.utilisateur.delete({ where: { id: etudiant.utilisateurId } });
    });

    res.json({
      status: 'success',
      message: 'Dossier étudiant et compte utilisateur supprimés avec succès (aucune donnée académique liée).'
    });
  } catch (error) {
    if (error.code === 'RG21_VIOLATION') {
      return res.status(400).json({
        status: 'error',
        code: 'RG21_VIOLATION',
        message: error.message,
        details: error.details,
        suggestion: error.suggestion
      });
    }
    console.error('deleteEtudiant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'étudiant' });
  }
};

/**
 * 7. POST /api/etudiants/affecter
 * @desc    Affectation collective d'étudiants à des groupes TD / TP ou filière
 * @access  Private/Admin
 */
const affecterEtudiantsGroupes = async (req, res) => {
  const { etudiantsIds, idGroupeTD, idGroupeTP, idFiliere } = req.body;

  if (!Array.isArray(etudiantsIds) || etudiantsIds.length === 0) {
    return res.status(400).json({ message: 'Veuillez fournir une liste non vide d\'identifiants étudiants (etudiantsIds)' });
  }

  try {
    const updateData = {};

    // Validation filière
    if (idFiliere !== undefined) {
      if (idFiliere === null || idFiliere === '') {
        updateData.idFiliere = null;
      } else {
        const parsedFiliere = parseInt(idFiliere);
        const filiereCheck = await prisma.filiere.findUnique({ where: { idFiliere: parsedFiliere } });
        if (!filiereCheck) {
          return res.status(400).json({ message: 'Filière spécifiée introuvable' });
        }
        updateData.idFiliere = parsedFiliere;
      }
    }

    // Validation groupe TD
    if (idGroupeTD !== undefined) {
      if (idGroupeTD === null || idGroupeTD === '') {
        updateData.idGroupeTD = null;
      } else {
        const parsedTD = parseInt(idGroupeTD);
        const groupTD = await prisma.groupe.findUnique({ where: { idGroupe: parsedTD } });
        if (!groupTD) {
          return res.status(400).json({ message: 'Groupe TD introuvable' });
        }
        updateData.idGroupeTD = parsedTD;
      }
    }

    // Validation groupe TP
    if (idGroupeTP !== undefined) {
      if (idGroupeTP === null || idGroupeTP === '') {
        updateData.idGroupeTP = null;
      } else {
        const parsedTP = parseInt(idGroupeTP);
        const groupTP = await prisma.groupe.findUnique({ where: { idGroupe: parsedTP } });
        if (!groupTP) {
          return res.status(400).json({ message: 'Groupe TP introuvable' });
        }
        updateData.idGroupeTP = parsedTP;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Aucun groupe ou filière à affecter n\'a été fourni' });
    }

    const cleanIds = etudiantsIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    const result = await prisma.etudiant.updateMany({
      where: {
        idEtudiant: { in: cleanIds }
      },
      data: updateData
    });

    res.json({
      status: 'success',
      message: `${result.count} étudiant(s) affecté(s) avec succès`,
      count: result.count
    });
  } catch (error) {
    console.error('affecterEtudiantsGroupes error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'affectation collective' });
  }
};

module.exports = {
  getEtudiants,
  getMonProfilEtudiant,
  getEtudiantById,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant,
  affecterEtudiantsGroupes
};
