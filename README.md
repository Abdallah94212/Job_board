# Job Board · Tremplin

Projet Job Board d'Epitech : un site d'offres d'emploi (« Tremplin ») avec une base de données PostgreSQL, une API REST en Node.js / Express et un front en HTML, CSS et JavaScript.

- les entreprises publient des annonces, chacune avec une catégorie et une personne responsable ;
- les visiteurs consultent les annonces et postulent avec un message ;
- un administrateur gère toutes les tables depuis une page d'administration.

## Technologies

| Outil | Rôle |
|---|---|
| PostgreSQL 16 | Base de données |
| Node.js (20.6 ou plus) | Exécution du serveur |
| Express 5 | Serveur et routes de l'API |
| pg | Connexion entre le serveur et PostgreSQL |
| cors | Autorise le front à appeler l'API |
| HTML, CSS, JavaScript | Front (sans framework) |
| Postman | Tests des routes |

## Installation

Prérequis : Node.js 20.6 ou plus, et PostgreSQL démarré.

### 1. Base de données

```bash
createdb jobboard
psql jobboard -f database/schema.sql   # crée les 5 tables
psql jobboard -f database/data.sql     # insère les données de démonstration
psql jobboard -f database/queries.sql  # exécute les 3 requêtes du bootstrap
```

Relancer `schema.sql` puis `data.sql` remet la base dans son état de départ.

### 2. Backend

```bash
cd backend
cp .env.example .env   # puis remplir les 3 variables ci-dessous
npm install
npm run dev
```

| Variable | Rôle |
|---|---|
| `PORT` | Port de l'API (3000) |
| `DATABASE_URL` | Adresse de la base, ex. `postgresql://utilisateur:motdepasse@localhost:5432/jobboard` |
| `JWT_SECRET` | Phrase secrète qui signe les jetons de connexion |

L'API répond sur `http://localhost:3000`. `npm run dev` redémarre le serveur à chaque modification ; `npm start` le lance sans surveillance.

### 3. Front

Ouvrir `frontend/index.html` dans le navigateur (ou avec Live Server), l'API étant lancée.

## Les steps de l'énoncé

| Step | Contenu | Où |
|---|---|---|
| 01 | Base de données : annonces, entreprises, personnes (candidats et responsables), candidatures | `database/` |
| 02 | Page qui affiche les annonces : titre, description courte, bouton « Learn more » | `index.html`, `style.css` |
| 03 | « Learn more » affiche tout le détail (description, salaire, lieu, temps de travail, responsable) sans recharger la page | `script.js` |
| 04 | API REST avec CRUD ; « Learn more » appelle `GET /ads/:id` | `backend/server.js` |
| 05 | Bouton « Postuler » et formulaire, candidature enregistrée en base | `index.html`, `script.js` |
| 06 | Connexion et création / modification de compte | `connexion.html`, `compte.html` |
| 07 | Page d'administration : liste paginée, création, modification, suppression | `admin.html`, `admin.js` |
| 08 | Design soigné, commun à toutes les pages | `style.css` |

## Base de données

| Table | Colonnes | Rôle |
|---|---|---|
| `companies` | id, name | Entreprises |
| `categories` | id, name | Catégories d'annonces |
| `people` | id, first_name, last_name, email (unique) | Candidats et responsables d'annonces |
| `ads` | id, company_id → companies, category_id → categories, contact_id → people, title, short_description, description, location, working_time, salary | Annonces |
| `applications` | id, ad_id → ads, person_id → people, message, created_at | Candidatures |

- une entreprise a plusieurs annonces ; une annonce a une entreprise, une catégorie et un responsable (`contact_id`) ;
- `applications` relie les personnes et les annonces (relation plusieurs-à-plusieurs) et garde le message et la date ;
- `salary` est le salaire brut annuel en euros.

Données de démonstration (`data.sql`) : 2 entreprises, 2 catégories, 5 personnes (3 candidats, 2 responsables), 3 annonces, 5 candidatures.

### Les 3 requêtes du bootstrap (`database/queries.sql`)

1. Nombre d'annonces publiées par chaque entreprise.
2. Annonce qui a reçu le plus de candidatures.
3. Candidats d'une annonce, avec leur message.

## Routes de l'API

Les erreurs sont renvoyées sous la forme `{ "error": "message" }`.

### Annonces et candidatures

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| GET | `/ads` | Toutes les annonces, avec l'entreprise et la catégorie | 200 |
| GET | `/ads/:id` | Détail d'une annonce, avec l'entreprise, la catégorie et le responsable | 200, 404 |
| GET | `/companies` | Toutes les entreprises | 200 |
| GET | `/companies/:id/ads` | Annonces d'une entreprise | 200, 404 |
| POST | `/ads` | Créer une annonce | 201, 400 |
| POST | `/ads/:id/applications` | Postuler à une annonce | 201, 400, 404 |

**Corps de `POST /ads`** (tous les champs sont obligatoires) :

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

Une entreprise, une catégorie ou un responsable inexistant renvoie 400.

**Corps de `POST /ads/:id/applications`** (tous les champs sont obligatoires) :

```json
{
  "first_name": "Sam",
  "last_name": "Durand",
  "email": "sam.durand@example.com",
  "message": "Bonjour, votre offre m'intéresse."
}
```

Si l'email est inconnu, la personne est créée ; sinon, elle est réutilisée.

### Administration (CRUD sur les tables)

`:table` vaut `ads`, `companies`, `people` ou `applications`.

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| GET | `/admin/stats` | Nombre de lignes de chaque table | 200 |
| GET | `/admin/:table?page=1&limit=7` | Une page de la table | 200, 404 |
| GET | `/admin/:table/:id` | Une ligne complète | 200, 404 |
| POST | `/admin/:table` | Créer une ligne | 201, 400, 409 |
| PUT | `/admin/:table/:id` | Modifier une ligne | 200, 400, 404, 409 |
| DELETE | `/admin/:table/:id` | Supprimer une ligne | 204, 404, 409 |

409 : la ligne est liée à une autre table (par exemple, supprimer une personne encore responsable d'une annonce) ou l'email est déjà pris.

## Pages du front

| Page | Rôle |
|---|---|
| `index.html` | Les annonces, « Learn more » et « Postuler » ; `?company=1` filtre par entreprise |
| `entreprises.html` | Les entreprises et leur nombre d'offres |
| `connexion.html` | Connexion et création de compte |
| `compte.html` | Mon compte : mes informations et mes candidatures |
| `admin.html` | Administration de la base |

## Tests

Chaque route est testée dans Postman et avec `curl`, en cas de succès comme d'erreur : 200, 201, 204, 400, 404 et 409. Les résultats peuvent être vérifiés dans la base, par exemple avec `SELECT * FROM applications;`.

## Structure

```
database/
  schema.sql    création des tables
  data.sql      données de démonstration
  queries.sql   les 3 requêtes du bootstrap
backend/
  server.js     les routes de l'API
  db.js         connexion à PostgreSQL
  package.json  dépendances et scripts
  .env.example  modèle de configuration
frontend/
  index.html, entreprises.html, connexion.html, compte.html, admin.html
  api.js        fonctions communes (appels à l'API, barre de navigation)
  script.js, entreprises.js, auth.js, compte.js, admin.js
  style.css     le style de toutes les pages
```
