// filepath: project/frontend/main.jsx
// Point d'entrée de l'application React

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Importation des styles globaux
import '../styles/login.css';
import '../styles/dashboard.css';
import '../styles/profile.css';
import '../styles/app.css';
import '../styles/users.css';
import '../styles/subscriptions.css';
import '../styles/history.css';
import '../styles/forgot-reset.css';
import '../styles/main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);