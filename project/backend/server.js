// filepath: project/backend/server.js
// Serveur principal - Point d'entrée de l'application
// Base de données: MySQL exclusivement

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const User = require('./models/User');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API SRTB - Serveur backend actif' });
});

const startServer = async () => {
    try {
        await User.ensureAccountStatusColumn();
        app.listen(PORT, () => {
            console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Impossible de préparer la base de données:', error.message);
        process.exit(1);
    }
};

startServer();
