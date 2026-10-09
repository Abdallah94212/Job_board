-- Données saisies à la main, comme le demande le bootstrap.
-- À lancer juste après schema.sql : les tables sont vides, donc les id commencent à 1.
-- Dans un texte SQL, une apostrophe s'écrit deux fois : 'l''équipe'.

INSERT INTO companies (name) VALUES
  ('Nébula Studio'),   -- id 1
  ('Vertigo Data');    -- id 2

INSERT INTO categories (name) VALUES
  ('Développement web'),  -- id 1
  ('Data');               -- id 2

-- Les personnes 1 à 3 postulent, les personnes 4 et 5 sont responsables d'annonces
INSERT INTO people (first_name, last_name, email, phone) VALUES
  ('Inès', 'Haddad', 'ines.haddad@example.com', '06 12 34 56 78'),          -- id 1
  ('Tom', 'Lefèvre', 'tom.lefevre@example.com', '06 23 45 67 89'),          -- id 2
  ('Chloé', 'Nguyen', 'chloe.nguyen@example.com', '07 34 56 78 90'),        -- id 3
  ('Camille', 'Martin', 'camille.martin@nebula.example', '04 72 00 00 01'), -- id 4 : responsable chez Nébula Studio
  ('Hugo', 'Bernard', 'hugo.bernard@vertigo.example', '01 40 00 00 02');    -- id 5 : responsable chez Vertigo Data

-- Comptes de démonstration. Le mot de passe est stocké haché avec bcrypt, jamais en clair.
-- Inès (id 1) : mot de passe ines1234
UPDATE people SET password_hash = '$2b$10$.1fAex.zNt9r3Bk3C8IT9O9mM3jR4ZyefPSk13IhAg7aUL3uEjx8K' WHERE id = 1;
-- L'administrateur (id 6) : admin@tremplin.example, mot de passe admin1234
INSERT INTO people (first_name, last_name, email, password_hash, is_admin) VALUES
  ('Admin', 'Tremplin', 'admin@tremplin.example', '$2b$10$M6hCtXmUEWq8qRTvLaeNpuAkmrKNKy4NpxNuLOldv1JMyLKx5Qf9y', TRUE);

-- (company_id, category_id, contact_id, title, short_description, description, location, working_time, salary)
INSERT INTO ads (company_id, category_id, contact_id, title, short_description, description, location, working_time, salary) VALUES
  (1, 1, 4, 'Développeur full-stack JavaScript',
   'Faites évoluer les outils internes de nos jeux.',
   'Vous rejoignez l''équipe Outils : React, Node.js et PostgreSQL. 2 ans d''expérience souhaités.',
   'Lyon', 'Temps plein', 45000),  -- id 1
  (1, 1, 4, 'Stage développeur front-end',
   'Intégrez les maquettes de nos outils.',
   'Stage de 6 mois : intégration HTML et CSS, composants JavaScript.',
   'Lyon', 'Temps plein', 7800),  -- id 2
  (2, 2, 5, 'Data engineer',
   'Construisez des pipelines de données.',
   'Pipelines en Python et modélisation SQL dans PostgreSQL. 3 ans d''expérience.',
   'Paris', 'Temps plein', 55000);  -- id 3

-- (ad_id, person_id, message) : la date est ajoutée automatiquement
INSERT INTO applications (ad_id, person_id, message) VALUES
  (1, 1, 'Bonjour, votre offre correspond à mon profil.'),
  (1, 2, 'Bonjour, je suis disponible dès maintenant.'),
  (1, 3, 'Bonjour, je souhaite évoluer vers le full-stack.'),
  (2, 1, 'Bonjour, je cherche un stage de six mois.'),
  (3, 2, 'Bonjour, je me forme au data engineering.');
