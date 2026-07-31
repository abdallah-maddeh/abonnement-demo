const mysql = require('mysql2');
require('dotenv').config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
    throw new Error(`Configuration MySQL manquante: ${missingEnv.join(', ')}`);
}

// Configuration MySQL - Mode production uniquement
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.isConnected = false;
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion MySQL:', err.message);
        db.isConnected = false;
        return;
    }
    db.isConnected = true;
    console.log('Connecte a MySQL - Base SRTB');
});

module.exports = db;
