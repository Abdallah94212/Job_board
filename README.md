# Job Board · Tremplin

Projet Job Board d'Epitech : un site d'offres d'emploi (« Tremplin ») avec une base de données PostgreSQL, une API REST en Node.js / Express et un front en HTML, CSS et JavaScript.

- les entreprises publient des annonces, chacune avec une catégorie et une personne responsable ;
- les visiteurs consultent les annonces et postulent avec un message ;
- les utilisateurs peuvent créer un compte : une fois connectés, le formulaire « Postuler » est déjà rempli ;
- un administrateur gère toutes les tables depuis une page d'administration qui lui est réservée.

## Technologies

| Outil | Rôle |
|---|---|
| PostgreSQL 16 | Base de données |
| Node.js (20.6 ou plus) | Exécution du serveur |
| Express 5 | Serveur et routes de l'API |
| pg | Connexion entre le serveur et PostgreSQL |
| bcryptjs | Hachage des mots de passe |
| jsonwebtoken | Jetons de connexion (JWT) |
| cors | Autorise le front à appeler l'API |
| HTML, CSS, JavaScript | Front (sans framework) |
| Postman | Tests des routes |

## Installation

Prérequis : Node.js 20.6 ou plus, et PostgreSQL démarré.

### 1. Configuration du backend

```bash
cd backend
cp .env.example .env   # puis remplir les 3 variables ci-dessous
npm install
```

| Variable | Rôle |
|---|---|
| `PORT` | Port de l'API (3000) |
| `DATABASE_URL` | Adresse de la base, ex. `postgresql://utilisateur:motdepasse@localhost:5432/jobboard` |
| `JWT_SECRET` | Phrase secrète qui signe les jetons de connexion. Elle doit rester secrète : avec elle, n'importe qui pourrait fabriquer un jeton d'administrateur. |

### 2. Base de données

```bash
createdb jobboard
psql jobboard -f database/schema.sql   # crée les 5 tables (et vide la base si elle existait)
cd backend && npm run seed             # remplit la base depuis le backend (Step 04)
psql jobboard -f database/queries.sql  # exécute les 3 requêtes du bootstrap
```

`database/data.sql` contient les mêmes données écrites à la main en SQL (demandé par le bootstrap) : `psql jobboard -f database/data.sql` peut remplacer `npm run seed`.

### 3. Lancer l'API puis le front

```bash
cd backend
npm run dev   # redémarre à chaque modification ; npm start le lance sans surveillance
```

L'API répond sur `http://localhost:3000`. Ouvrir ensuite `frontend/index.html` dans le navigateur (ou avec Live Server).

### Comptes de démonstration

| Compte | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@tremplin.example` | `admin1234` |
| Utilisatrice | `ines.haddad@example.com` | `ines1234` |

Les mots de passe sont stockés hachés avec bcrypt, jamais en clair.

## Les steps de l'énoncé

| Step | Contenu | Où |
|---|---|---|
| 01 | Base de données : annonces, entreprises, catégories, personnes (candidats et responsables d'annonces), candidatures | `database/schema.sql` |
| 02 | Page qui affiche les annonces : titre, description courte, bouton « Learn more » | `index.html`, `style.css` |
| 03 | « Learn more » affiche tout le détail (description, salaire, lieu, temps de travail, responsable) sans recharger la page ni ouvrir de popup | `script.js` |
| 04 | API REST avec CRUD ; « Learn more » appelle `GET /ads/:id` ; base remplie depuis le backend (`npm run seed`) | `backend/server.js`, `backend/seed.js` |
| 05 | Bouton « Postuler » : nom, email, téléphone et message, enregistrés en base | `index.html`, `script.js` |
| 06 | Inscription, connexion, modification et suppression du compte ; une fois connecté, le formulaire « Postuler » est pré-rempli | `connexion.html`, `compte.html`, `auth.js`, `compte.js` |
| 07 | Page d'administration réservée à l'admin : liste paginée de toutes les tables, création, modification, suppression. Après connexion, l'admin arrive sur l'administration, les autres sur les offres | `admin.html`, `admin.js` |
| 08 | Design soigné, commun à toutes les pages | `style.css` |

## Base de données

| Table | Colonnes | Rôle |
|---|---|---|
| `companies` | id, name | Entreprises |
| `categories` | id, name | Catégories d'annonces |
| `people` | id, first_name, last_name, email (unique), phone, password_hash, is_admin | Candidats, responsables d'annonces et comptes |
| `ads` | id, company_id → companies, category_id → categories, contact_id → people, title, short_description, description, location, working_time, salary | Annonces |
| `applications` | id, ad_id → ads, person_id → people, message, created_at | Candidatures |

- une entreprise a plusieurs annonces ; une annonce a une entreprise, une catégorie et un responsable (`contact_id`) ;
- `applications` relie les personnes et les annonces (relation plusieurs-à-plusieurs) et garde le message et la date ;
- `salary` est le salaire brut annuel en euros ;
- `phone` est facultatif ; `password_hash` est vide pour une personne qui a postulé sans créer de compte.

Données de démonstration : 2 entreprises, 2 catégories, 6 personnes (3 candidats, 2 responsables, 1 admin), 3 annonces, 5 candidatures.

### Les 3 requêtes du bootstrap (`database/queries.sql`)

1. Nombre d'annonces publiées par chaque entreprise.
2. Annonce qui a reçu le plus de candidatures.
3. Candidats d'une annonce, avec leur message.

## Routes de l'API

Les erreurs sont renvoyées sous la forme `{ "error": "message" }`.

Les routes protégées attendent l'en-tête `Authorization: Bearer <jeton>`, où le jeton est celui renvoyé par `POST /auth/login`. Sans jeton valide : **401**. Avec un jeton valide mais sans le droit : **403**.

### Annonces et candidatures (publiques)

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| GET | `/ads` | Toutes les annonces, avec l'entreprise et la catégorie | 200 |
| GET | `/ads/:id` | Détail d'une annonce, avec l'entreprise, la catégorie et le responsable | 200, 404 |
| GET | `/companies` | Toutes les entreprises | 200 |
| GET | `/companies/:id/ads` | Annonces d'une entreprise | 200, 404 |
| POST | `/ads/:id/applications` | Postuler à une annonce | 201, 400, 404 |

**Corps de `POST /ads/:id/applications`** (`phone` est facultatif) :

```json
{
  "first_name": "Sam",
  "last_name": "Durand",
  "email": "sam.durand@example.com",
  "phone": "06 11 22 33 44",
  "message": "Bonjour, votre offre m'intéresse."
}
```

Si l'email est inconnu, la personne est créée ; sinon, elle est réutilisée.

### Connexion

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| POST | `/auth/register` | Créer un compte | 201, 400, 409 |
| POST | `/auth/login` | Se connecter | 200, 400, 401 |

- `POST /auth/register` reçoit `{ first_name, last_name, email, password }` et renvoie `{ id, first_name, last_name, email }`. 409 si l'email existe déjà.
- `POST /auth/login` reçoit `{ email, password }` et renvoie `{ token, user: { id, first_name, last_name, email, phone, is_admin } }`. Le jeton est valable 1 jour. 401 si les identifiants sont faux.
- Le hash du mot de passe n'est jamais renvoyé par l'API.

### Mon compte (réservé à la personne connectée)

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| GET | `/people/:id/applications` | Mes candidatures : `[{ title, company_name, created_at }]` | 200, 401, 403 |
| PUT | `/people/:id` | Modifier mon compte | 200, 400, 401, 403, 404, 409 |
| DELETE | `/people/:id` | Supprimer mon compte et mes candidatures | 204, 401, 403, 404, 409 |

- `PUT /people/:id` reçoit `{ first_name, last_name, email, phone, password }` ; `phone` et `password` sont facultatifs (sans `password`, le mot de passe ne change pas). 409 si l'email est déjà pris.
- 403 si `:id` n'est pas l'id de la personne connectée.

### Administration (réservée à l'admin)

`:table` vaut `ads`, `companies`, `categories`, `people` ou `applications`.

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| POST | `/ads` | Créer une annonce | 201, 400, 401, 403 |
| GET | `/admin/stats` | Nombre de lignes de chaque table | 200, 401, 403 |
| GET | `/admin/:table?page=1&limit=7` | Une page de la table | 200, 401, 403, 404 |
| GET | `/admin/:table/:id` | Une ligne complète | 200, 401, 403, 404 |
| POST | `/admin/:table` | Créer une ligne | 201, 400, 401, 403, 409 |
| PUT | `/admin/:table/:id` | Modifier une ligne | 200, 400, 401, 403, 404, 409 |
| DELETE | `/admin/:table/:id` | Supprimer une ligne | 204, 401, 403, 404, 409 |

**Corps de `POST /ads`** et de `POST /admin/ads` (tous les champs sont obligatoires) :

```json
{
  "company_id": 2,
  "category_id": 2,
  "contact_id": 5,
  "title": "Data analyst",
  "short_description": "Créez nos tableaux de bord.",
  "description": "SQL et visualisation de données.",
  "location": "Paris",
  "working_time": "Temps plein",
  "salary": 42000
}
```

409 : la ligne est liée à une autre table (par exemple, supprimer une personne encore responsable d'une annonce) ou l'email est déjà pris.

## Pages du front

| Page | Rôle |
|---|---|
| `index.html` | Les annonces, « Learn more » et « Postuler » ; `?company=1` filtre par entreprise |
| `entreprises.html` | Les entreprises et leur nombre d'offres |
| `connexion.html` | Connexion et création de compte ; redirige l'admin vers `admin.html`, les autres vers `index.html` |
| `compte.html` | Mon compte : modifier mes informations et mon mot de passe, voir mes candidatures, supprimer mon compte |
| `admin.html` | Administration de la base ; renvoie vers `connexion.html` si l'on n'est pas admin |

Après connexion, le jeton et l'utilisateur sont gardés dans le `localStorage` du navigateur ; `api.js` envoie le jeton à chaque appel.

## Tests dans Postman

Lancer `schema.sql` puis `npm run seed` avant les tests. Pour les routes protégées, copier le `token` renvoyé par `POST /auth/login` dans l'onglet **Authorization** de Postman (type *Bearer Token*).

| # | Requête | Attendu |
|---|---|---|
| 1 | `GET /ads` | 200, 3 annonces |
| 2 | `GET /ads/1` | 200, avec location, working_time, salary, contact_name |
| 3 | `GET /ads/999` | 404 |
| 4 | `GET /companies` puis `GET /companies/1/ads` | 200, puis 200 avec 2 annonces |
| 5 | `GET /companies/999/ads` | 404 |
| 6 | `POST /ads/1/applications` avec le corps complet | 201 |
| 7 | `POST /ads/1/applications` sans `message` | 400 |
| 8 | `POST /ads/999/applications` | 404 |
| 9 | `POST /auth/register` avec un nouvel email | 201, sans hash |
| 10 | `POST /auth/register` avec `ines.haddad@example.com` | 409 |
| 11 | `POST /auth/register` sans `password` | 400 |
| 12 | `POST /auth/login` admin / `admin1234` | 200, `is_admin: true` |
| 13 | `POST /auth/login` Inès / `ines1234` | 200, `is_admin: false` |
| 14 | `POST /auth/login` avec un mauvais mot de passe | 401 |
| 15 | `GET /admin/stats` sans jeton | **401** |
| 16 | `GET /admin/stats` avec un jeton inventé | **401** |
| 17 | `GET /admin/stats` avec le jeton d'Inès | **403** |
| 18 | `GET /admin/stats` avec le jeton admin | 200 |
| 19 | `POST /ads` sans jeton | **401** |
| 20 | `POST /ads` avec le jeton admin et le corps complet | 201 |
| 21 | `POST /ads` avec le jeton admin, sans `salary` | 400 |
| 22 | `POST /ads` avec le jeton admin, `contact_id: 999` | 400 |
| 23 | `GET /admin/categories?page=1&limit=7` (admin) | 200, `rows`, `total`, `page`, `limit` |
| 24 | `GET /admin/inconnue` (admin) | 404 |
| 25 | `POST /admin/categories` `{ "name": "Design" }` (admin) | 201 |
| 26 | `PUT /admin/categories/3` `{ "name": "UX Design" }` (admin) | 200 |
| 27 | `DELETE /admin/categories/1` (admin, catégorie utilisée) | 409 |
| 28 | `DELETE /admin/categories/3` (admin) | 204 |
| 29 | `GET /admin/people/6` (admin) | 200, sans `password_hash` |
| 30 | `GET /people/1/applications` sans jeton | **401** |
| 31 | `GET /people/1/applications` avec le jeton d'Inès | 200, 2 candidatures |
| 32 | `GET /people/2/applications` avec le jeton d'Inès | **403** |
| 33 | `PUT /people/1` (Inès) avec l'email de Tom | 409 |
| 34 | `PUT /people/1` (Inès) sans `email` | 400 |
| 35 | `PUT /people/2` avec le jeton d'Inès | **403** |
| 36 | `PUT /people/1` (Inès) avec un nouveau `password`, puis login avec l'ancien | 200, puis 401 |
| 37 | `DELETE /people/2` avec le jeton d'Inès | **403** |
| 38 | `DELETE /people/1` avec le jeton d'Inès | 204 |

## Structure

```
database/
  schema.sql    création des tables
  data.sql      données de démonstration écrites en SQL (bootstrap)
  queries.sql   les 3 requêtes du bootstrap
backend/
  server.js     les routes de l'API
  db.js         connexion à PostgreSQL
  seed.js       remplissage de la base depuis le backend (npm run seed)
  package.json  dépendances et scripts
  .env.example  modèle de configuration
frontend/
  index.html, entreprises.html, connexion.html, compte.html, admin.html
  api.js        fonctions communes (appels à l'API avec le jeton, barre de navigation)
  script.js, entreprises.js, auth.js, compte.js, admin.js
  style.css     le style de toutes les pages
```
