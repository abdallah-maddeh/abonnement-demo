-- Schéma de base de données SRTB
-- Table utilisateurs avec id_utilisateur auto-incrémenté et immuable

CREATE TABLE IF NOT EXISTS utilisateurs (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identifiant unique - Auto-généré - Non modifiable',
    nom_utilisateur VARCHAR(50) NOT NULL,
    prénom_utilisateur VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'utilisateur',
    Date_création TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création - Auto-générée - Non modifiable',
    CONSTRAINT chk_role CHECK (Role IN ('utilisateur', 'admin', 'moderateur'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour les recherches fréquentes
CREATE INDEX idx_email ON utilisateurs(email);
CREATE INDEX idx_role ON utilisateurs(Role);
