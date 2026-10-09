// Remplit la base avec les données de démonstration, depuis le backend : npm run seed
// À lancer juste après database/schema.sql : les tables sont vides, donc les id commencent à 1.
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  await db.query(
    `INSERT INTO companies (name) VALUES
       ('Nébula Studio'),  -- id 1
       ('Vertigo Data')    -- id 2`
  );

  await db.query(
    `INSERT INTO categories (name) VALUES
       ('Développement web'),  -- id 1
       ('Data')                -- id 2`
  );

  // Les personnes 1 à 3 postulent, les personnes 4 et 5 sont responsables d'annonces
  await db.query(
    `INSERT INTO people (first_name, last_name, email, phone) VALUES
       ('Inès', 'Haddad', 'ines.haddad@example.com', '06 12 34 56 78'),
       ('Tom', 'Lefèvre', 'tom.lefevre@example.com', '06 23 45 67 89'),
       ('Chloé', 'Nguyen', 'chloe.nguyen@example.com', '07 34 56 78 90'),
       ('Camille', 'Martin', 'camille.martin@nebula.example', '04 72 00 00 01'),
       ('Hugo', 'Bernard', 'hugo.bernard@vertigo.example', '01 40 00 00 02')`
  );

  // Comptes de démonstration : le mot de passe est haché avec bcrypt, jamais stocké en clair
  await db.query('UPDATE people SET password_hash = $1 WHERE id = 1', [await bcrypt.hash('ines1234', 10)]);
  await db.query(
    `INSERT INTO people (first_name, last_name, email, password_hash, is_admin)
     VALUES ('Admin', 'Tremplin', 'admin@tremplin.example', $1, TRUE)`,
    [await bcrypt.hash('admin1234', 10)]
  );

  await db.query(
    `INSERT INTO ads (company_id, category_id, contact_id, title, short_description, description, location, working_time, salary) VALUES
       (1, 1, 4, 'Développeur full-stack JavaScript',
        'Faites évoluer les outils internes de nos jeux.',
        'Vous rejoignez l''équipe Outils : React, Node.js et PostgreSQL. 2 ans d''expérience souhaités.',
        'Lyon', 'Temps plein', 45000),
       (1, 1, 4, 'Stage développeur front-end',
        'Intégrez les maquettes de nos outils.',
        'Stage de 6 mois : intégration HTML et CSS, composants JavaScript.',
        'Lyon', 'Temps plein', 7800),
       (2, 2, 5, 'Data engineer',
        'Construisez des pipelines de données.',
        'Pipelines en Python et modélisation SQL dans PostgreSQL. 3 ans d''expérience.',
        'Paris', 'Temps plein', 55000)`
  );

  await db.query(
    `INSERT INTO applications (ad_id, person_id, message) VALUES
       (1, 1, 'Bonjour, votre offre correspond à mon profil.'),
       (1, 2, 'Bonjour, je suis disponible dès maintenant.'),
       (1, 3, 'Bonjour, je souhaite évoluer vers le full-stack.'),
       (2, 1, 'Bonjour, je cherche un stage de six mois.'),
       (3, 2, 'Bonjour, je me forme au data engineering.')`
  );

  console.log('Base remplie : 2 entreprises, 2 catégories, 6 personnes, 3 annonces, 5 candidatures');
  await db.end();
}

seed();
