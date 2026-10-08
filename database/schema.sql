

DROP TABLE IF EXISTS applications, ads, people, categories, companies;

-- Les entreprises
CREATE TABLE companies (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Les catégories d'annonces
CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Les annonces : chacune appartient à une entreprise et à une catégorie
CREATE TABLE ads (
  id                SERIAL PRIMARY KEY,
  company_id        INTEGER NOT NULL REFERENCES companies(id),
  category_id       INTEGER NOT NULL REFERENCES categories(id),
  title             VARCHAR(150) NOT NULL,
  short_description VARCHAR(255) NOT NULL,
  description       TEXT NOT NULL
);

-- Les personnes qui postulent
CREATE TABLE people (
  id         SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name  VARCHAR(50) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE
);

-- Les candidatures : qui a postulé à quelle annonce, avec quel message, quand
CREATE TABLE applications (
  id         SERIAL PRIMARY KEY,
  ad_id      INTEGER NOT NULL REFERENCES ads(id),
  person_id  INTEGER NOT NULL REFERENCES people(id),
  message    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
