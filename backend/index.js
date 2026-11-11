const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient'); // Use our central client
require('dotenv').config();

// Route files
const authRoutes = require('./routes/authRoutes');
const filiereRoutes = require('./routes/filiereRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const absenceRoutes = require('./routes/absenceRoutes');
const noteRoutes = require('./routes/noteRoutes');
const pfeRoutes = require('./routes/pfeRoutes');
const stageRoutes = require('./routes/stageRoutes');
const juryRoutes = require('./routes/juryRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const formationRoutes = require('./routes/formationRoutes');
const etudiantRoutes = require('./routes/etudiantRoutes');
const enseignantRoutes = require('./routes/enseignantRoutes');
const groupeRoutes = require('./routes/groupeRoutes');
const documentRoutes = require('./routes/documentRoutes');
const syncRoutes = require('./routes/syncRoutes');
const salleRoutes = require('./routes/salleRoutes');

const app = express();
const port = process.env.PORT || 5000;

// ── ABSOLUTE TOP LOGGER ──
app.use((req, res, next) => {
  console.log(`>>> [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());

// Detailed Payload Logger
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.url !== '/api/sync') {
    console.log('>>> Payload:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ── TEST PATCH ──
app.patch('/api/test-patch', (req, res) => {
  console.log('>>> TEST PATCH HIT!');
  res.json({ message: 'PATCH works!' });
});

// ── ROUTES ──
app.use('/api/auth', authRoutes);
app.use('/api/filieres', filiereRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/pfe', pfeRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/juries', juryRoutes);
app.use('/api/annonces', annonceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/groupes', groupeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/salles', salleRoutes);

// ── TEST ENDPOINT ──
app.get('/api/status', async (req, res) => {
  try {
    const userCount = await prisma.utilisateur.count();
    res.json({ 
      status: 'success', 
      message: 'FST-Connect Backend is LIVE',
      database: 'Connected',
      stats: { utilisateurs: userCount }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ── ERROR HANDLING ──
app.use((err, req, res, next) => {
  console.error('>>> ERROR HANDLER:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// ── START SERVER ──
const server = app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

// ── ERROR LISTENER ──
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('>>> CRITICAL: Port 5000 is already in use by another process.');
  } else {
    console.error('>>> Server Error:', e);
  }
});

// ── KEEP ALIVE ──
setInterval(() => {
  // console.log('>>> Keeping event loop open...');
}, 1000 * 60 * 60);

module.exports = server;
