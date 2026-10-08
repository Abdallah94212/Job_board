-- Données saisies à la main, comme le demande le bootstrap.
-- À lancer juste après schema.sql : les tables sont vides, donc les id commencent à 1.
-- Dans un texte SQL, une apostrophe s'écrit deux fois : 'l''équipe'.

INSERT INTO companies (name) VALUES
  ('Nébula Studio'),   -- id 1
  ('Vertigo Data');    -- id 2

INSERT INTO categories (name) VALUES
  ('Développement web'),  -- id 1
  ('Data');               -- id 2

-- (company_id, category_id, title, short_description, description)
INSERT INTO ads (company_id, category_id, title, short_description, description) VALUES
  (1, 1, 'Développeur full-stack JavaScript',
   'Faites évoluer les outils internes de nos jeux.',
   'Vous rejoignez l''équipe Outils : React, Node.js et PostgreSQL. 2 ans d''expérience souhaités.'),   -- id 1
  (1, 1, 'Stage développeur front-end',
   'Intégrez les maquettes de nos outils.',
   'Stage de 6 mois : intégration HTML et CSS, composants JavaScript.'),                                -- id 2
  (2, 2, 'Data engineer',
   'Construisez des pipelines de données.',
   'Pipelines en Python et modélisation SQL dans PostgreSQL. 3 ans d''expérience.');                    -- id 3

INSERT INTO people (first_name, last_name, email) VALUES
  ('Inès', 'Haddad', 'ines.haddad@example.com'),    -- id 1
  ('Tom', 'Lefèvre', 'tom.lefevre@example.com'),    -- id 2
  ('Chloé', 'Nguyen', 'chloe.nguyen@example.com');  -- id 3

-- (ad_id, person_id, message) : la date est ajoutée automatiquement
INSERT INTO applications (ad_id, person_id, message) VALUES
  (1, 1, 'Bonjour, votre offre correspond à mon profil.'),
  (1, 2, 'Bonjour, je suis disponible dès maintenant.'),
  (1, 3, 'Bonjour, je souhaite évoluer vers le full-stack.'),
  (2, 1, 'Bonjour, je cherche un stage de six mois.'),
  (3, 2, 'Bonjour, je me forme au data engineering.');
