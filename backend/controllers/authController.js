const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the client IP address from the request.
 * Handles reverse-proxies (x-forwarded-for) and direct connections.
 * @param {import('express').Request} req
 * @returns {string}
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
};

/**
 * Write a row to HistoriqueConnexion without crashing the main flow (used outside transactions).
 * @param {number}  utilisateurId
 * @param {string}  statut        - 'SUCCES' | 'ECHEC'
 * @param {string}  adresseIP
 * @param {string}  [resultat]
 */
const logHistorique = async (utilisateurId, statut, adresseIP, resultat) => {
  try {
    await prisma.historiqueConnexion.create({
      data: {
        utilisateurId,
        statut,
        adresseIP: adresseIP ? adresseIP.substring(0, 45) : null,
        resultat: resultat || null
      }
    });
  } catch (err) {
    console.error('logHistorique failed:', err.message || err);
  }
};

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const ip = getClientIp(req);

  // ── 0. Pré-vérification de la configuration serveur (JWT_SECRET & EXPIRES) ──
  if (!process.env.JWT_SECRET || typeof process.env.JWT_SECRET !== 'string' || process.env.JWT_SECRET.trim() === '') {
    console.error('CRITICAL: process.env.JWT_SECRET is not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  let jwtExpiresIn = '30d';
  if (process.env.JWT_EXPIRES_IN && typeof process.env.JWT_EXPIRES_IN === 'string' && process.env.JWT_EXPIRES_IN.trim() !== '') {
    const candidateExpires = process.env.JWT_EXPIRES_IN.trim();
    // Format sécurisé exigeant une unité explicite (ms, s, m, h, d, w, y)
    // Les chaînes numériques pures sans unité (ex: "30", "3600") sont rejetées pour éviter le bug des millisecondes
    if (!/^\d+(ms|[smhdwy])$/i.test(candidateExpires)) {
      console.error(`CRITICAL: process.env.JWT_EXPIRES_IN has invalid or ambiguous format: "${candidateExpires}". Expected format with explicit unit, e.g. "30d", "15m", "3600s".`);
      return res.status(500).json({ message: 'Server configuration error' });
    }
    jwtExpiresIn = candidateExpires;
  }

  // ── 1. Input validation ──────────────────────────────────────────────────
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ message: 'Email requis.' });
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ message: 'Mot de passe requis.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ message: "Format d'email invalide." });
  }

  try {
    // ── 2. Recherche initiale de l'utilisateur ────────────────────────────
    const user = await prisma.utilisateur.findUnique({
      where: { email: cleanEmail },
      select: { id: true, email: true }
    });

    // Message générique si inexistant pour ne pas faire fuiter l'existence d'un compte
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ── 3. Transaction unifiée avec verrouillage PostgreSQL (SELECT ... FOR UPDATE)
    const LOCKOUT_THRESHOLD = 5;
    const LOCKOUT_MINUTES   = 15;

    const authResult = await prisma.$transaction(async (tx) => {
      // Verrou exclusif de ligne sur l'utilisateur sélectionné
      const [locked] = await tx.$queryRaw`
        SELECT "id", "motDePasse", "role", "statut", "compteurTentatives", "bloqueJusquA"
        FROM "Utilisateur"
        WHERE "id" = ${user.id}
        FOR UPDATE
      `;

      if (!locked) {
        return { status: 401, body: { message: 'Invalid credentials' } };
      }

      // A. Rejet strict des comptes INACTIF (décision administrative irrévocable automatiquement)
      if (locked.statut === 'INACTIF') {
        await tx.historiqueConnexion.create({
          data: {
            utilisateurId: locked.id,
            statut: 'ECHEC',
            adresseIP: ip ? ip.substring(0, 45) : null,
            resultat: 'Compte inactif'
          }
        });
        return { status: 403, body: { message: 'Compte bloqué ou inactif. Accès refusé.' } };
      }

      const now = new Date();

      // B. Évaluation stricte du statut BLOQUE
      if (locked.statut === 'BLOQUE') {
        if (!locked.bloqueJusquA) {
          await tx.historiqueConnexion.create({
            data: {
              utilisateurId: locked.id,
              statut: 'ECHEC',
              adresseIP: ip ? ip.substring(0, 45) : null,
              resultat: "Compte bloqué sans date d'expiration"
            }
          });
          return { status: 403, body: { message: 'Compte bloqué ou inactif. Accès refusé.' } };
        }

        if (new Date(locked.bloqueJusquA) > now) {
          const minutesRestantes = Math.ceil(
            (new Date(locked.bloqueJusquA).getTime() - now.getTime()) / 60000
          );
          await tx.historiqueConnexion.create({
            data: {
              utilisateurId: locked.id,
              statut: 'ECHEC',
              adresseIP: ip ? ip.substring(0, 45) : null,
              resultat: `Compte verrouillé — ${minutesRestantes} min restante(s)`
            }
          });
          return {
            status: 403,
            body: { message: `Compte temporairement verrouillé. Réessayez dans ${minutesRestantes} minute(s).` }
          };
        }

        // Déblocage automatique strictement autorisé : BLOQUE + bloqueJusquA expiré
        await tx.utilisateur.update({
          where: { id: locked.id },
          data:  { bloqueJusquA: null, compteurTentatives: 0, statut: 'ACTIF' }
        });
        locked.bloqueJusquA       = null;
        locked.compteurTentatives = 0;
        locked.statut             = 'ACTIF';
      } else if (locked.statut === 'ACTIF') {
        // Si le statut est ACTIF avec une date résiduelle, nettoyer le verrou sans toucher au statut
        if (locked.bloqueJusquA) {
          await tx.utilisateur.update({
            where: { id: locked.id },
            data:  { bloqueJusquA: null }
          });
          locked.bloqueJusquA = null;
        }
      } else {
        // C. Tout statut inconnu ou incohérent est strictement rejeté sans altération
        await tx.historiqueConnexion.create({
          data: {
            utilisateurId: locked.id,
            statut: 'ECHEC',
            adresseIP: ip ? ip.substring(0, 45) : null,
            resultat: `Statut de compte non autorisé (${locked.statut})`
          }
        });
        return { status: 403, body: { message: 'Statut de compte invalide. Accès refusé.' } };
      }

      // D. Contrôle du mot de passe
      const isMatch = await bcrypt.compare(password, locked.motDePasse);

      if (!isMatch) {
        const nextTentatives = (locked.compteurTentatives || 0) + 1;

        if (nextTentatives >= LOCKOUT_THRESHOLD) {
          const expirationVerrou = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
          await tx.utilisateur.update({
            where: { id: locked.id },
            data:  { compteurTentatives: nextTentatives, bloqueJusquA: expirationVerrou, statut: 'BLOQUE' }
          });
          await tx.historiqueConnexion.create({
            data: {
              utilisateurId: locked.id,
              statut: 'ECHEC',
              adresseIP: ip ? ip.substring(0, 45) : null,
              resultat: `Compte verrouillé après ${LOCKOUT_THRESHOLD} tentatives`
            }
          });
          return {
            status: 403,
            body: { message: `Compte temporairement verrouillé après ${LOCKOUT_THRESHOLD} tentatives. Réessayez dans ${LOCKOUT_MINUTES} minutes.` }
          };
        }

        await tx.utilisateur.update({
          where: { id: locked.id },
          data:  { compteurTentatives: nextTentatives }
        });
        await tx.historiqueConnexion.create({
          data: {
            utilisateurId: locked.id,
            statut: 'ECHEC',
            adresseIP: ip ? ip.substring(0, 45) : null,
            resultat: `Mot de passe incorrect — tentative ${nextTentatives}/${LOCKOUT_THRESHOLD}`
          }
        });
        return {
          status: 401,
          body: { message: `Invalid credentials. Tentative ${nextTentatives}/${LOCKOUT_THRESHOLD}.` }
        };
      }

      // E. Succès vérifié : Chargement du profil complet DANS la transaction
      const fullProfile = await tx.utilisateur.findUnique({
        where: { id: locked.id },
        include: {
          etudiant: {
            include: {
              filiere: true,
              groupeTD: true,
              groupeTP: true
            }
          },
          enseignant: true,
          administrateur: true
        }
      });

      if (!fullProfile) {
        throw new Error('User profile record missing');
      }

      // Signature du JWT AVANT l'enregistrement de l'historique SUCCES
      // Si jwt.sign échoue, l'exception déclenche le ROLLBACK de toute la transaction
      const token = jwt.sign(
        { id: fullProfile.id, role: fullProfile.role },
        process.env.JWT_SECRET,
        { expiresIn: jwtExpiresIn }
      );

      // Réinitialisation de l'état
      await tx.utilisateur.update({
        where: { id: locked.id },
        data:  { compteurTentatives: 0, bloqueJusquA: null, statut: 'ACTIF' }
      });

      // Enregistrement SUCCES uniquement si le token est émis et le profil complet
      await tx.historiqueConnexion.create({
        data: {
          utilisateurId: locked.id,
          statut: 'SUCCES',
          adresseIP: ip ? ip.substring(0, 45) : null,
          resultat: 'Connexion réussie'
        }
      });

      return { status: 200, token, user: fullProfile };
    });

    if (authResult.status !== 200) {
      return res.status(authResult.status).json(authResult.body);
    }

    // Retourner les données utilisateur sans mot de passe
    const { motDePasse, ...userWithoutPassword } = authResult.user;
    return res.json({
      status: 'success',
      token: authResult.token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user.id },
      include: {
        etudiant: {
          include: {
            filiere: true,
            groupeTD: true,
            groupeTP: true
          }
        },
        enseignant: true,
        administrateur: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const { motDePasse, ...userWithoutPassword } = user;
    return res.json({
      status: 'success',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Request a password reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ success: false, error: 'EMAIL_REQUIRED', message: 'L\'adresse email est requise.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'INVALID_EMAIL', message: 'Format d\'adresse email invalide.' });
  }

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: cleanEmail }
    });

    // Réponse générique pour éviter l'énumération des comptes
    const genericResponse = {
      success: true,
      message: 'Si un compte actif existe avec cette adresse email, un jeton de réinitialisation a été généré.'
    };

    if (!user || user.statut !== 'ACTIF') {
      return res.json(genericResponse);
    }

    // 1. Invalider les anciens jetons actifs pour cet utilisateur
    await prisma.tokenReinit.updateMany({
      where: { utilisateurId: user.id, statut: 'ACTIF' },
      data: { statut: 'EXPIRE' }
    });

    // 2. Générer un jeton cryptographique sécurisé
    const tokenValue = crypto.randomBytes(32).toString('hex');
    const expirationDate = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // 3. Persister dans la table TokenReinit
    await prisma.tokenReinit.create({
      data: {
        utilisateurId: user.id,
        valeur: tokenValue,
        dateExpiration: expirationDate,
        statut: 'ACTIF'
      }
    });

    // En environnement de dev/test ou API interne, retourner le jeton pour faciliter l'automatisation sans SMTP
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        ...genericResponse,
        token: tokenValue,
        expiresIn: '1 hour'
      });
    }

    return res.json(genericResponse);
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ message: 'Erreur lors du traitement de la demande de réinitialisation.' });
  }
};

/**
 * @desc    Reset password using a valid token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({ success: false, error: 'TOKEN_REQUIRED', message: 'Le jeton de réinitialisation est obligatoire.' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PASSWORD',
      message: 'Le nouveau mot de passe est obligatoire et doit comporter au moins 6 caractères.'
    });
  }

  try {
    const tokenRecord = await prisma.tokenReinit.findUnique({
      where: { valeur: token.trim() },
      include: { utilisateur: true }
    });

    if (!tokenRecord || tokenRecord.statut !== 'ACTIF' || new Date(tokenRecord.dateExpiration) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Le jeton de réinitialisation est invalide, expiré ou a déjà été utilisé.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le mot de passe et réinitialiser les compteurs
      await tx.utilisateur.update({
        where: { id: tokenRecord.utilisateurId },
        data: {
          motDePasse: hashedPassword,
          compteurTentatives: 0,
          bloqueJusquA: null,
          statut: 'ACTIF'
        }
      });

      // 2. Marquer le jeton comme utilisé
      await tx.tokenReinit.update({
        where: { id: tokenRecord.id },
        data: { statut: 'UTILISE' }
      });

      // 3. Logger dans l'historique des connexions
      await tx.historiqueConnexion.create({
        data: {
          utilisateurId: tokenRecord.utilisateurId,
          statut: 'SUCCES',
          adresseIP: getClientIp(req),
          resultat: 'Réinitialisation du mot de passe réussie via jeton'
        }
      });
    });

    return res.json({
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la réinitialisation du mot de passe.' });
  }
};

module.exports = {
  login,
  getMe,
  forgotPassword,
  resetPassword
};
