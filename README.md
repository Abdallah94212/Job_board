# Job Board · Tremplin

Projet Job Board d'Epitech : un site d'offres d'emploi (« Tremplin ») avec une base de données PostgreSQL, une API REST en Node.js / Express et un front en HTML, CSS et JavaScript.

- les entreprises publient des annonces, chacune avec une catégorie et une personne responsable ;
- les visiteurs consultent les annonces et postulent avec un message ;
- les utilisateurs peuvent créer un compte : une fois connectés, le formulaire « Postuler » est déjà rempli ;
- un administrateur gère toutes les tables depuis une page d'administration qui lui est réservée.

Le projet ne garde que ce que l'énoncé demande : les ajouts faits en plus (page des entreprises, liste « Mes candidatures », suggestions d'offres, suppression du compte, statistiques et recherche dans l'administration) ont été retirés.

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

## Choix techniques

| Choix | Pourquoi |
|---|---|
| PostgreSQL | Base relationnelle : des clés étrangères relient les annonces aux entreprises, aux catégories et aux personnes, et les candidatures aux annonces et aux personnes. PostgreSQL refuse un lien vers une ligne qui n'existe pas. |
| Express | Une API REST simple : chaque route associe un verbe HTTP (GET, POST, PUT, DELETE) à un nom de ressource (`/ads`, `/people/:id`), comme le demande l'énoncé. |
| `pg`, sans ORM | Les requêtes SQL sont écrites à la main dans `server.js`. Les valeurs passent par des paramètres `$1`, `$2`… : PostgreSQL les lit comme des données, jamais comme du SQL. Cela protège contre l'injection SQL. |
| Front en HTML, CSS et JavaScript, sans framework | Rien à compiler ni à installer côté front. `fetch()` appelle l'API : le détail « Learn more » arrive sans recharger la page. |
| Routes `/admin/:table` génériques | Les mêmes routes servent les 5 tables. Les noms de tables et de colonnes viennent uniquement de la liste `ADMIN_TABLES` écrite dans `server.js` : `Object.hasOwn` refuse tout autre nom de table (404). |
| Données de démo remplies par le backend | `npm run seed` (`backend/seed.js`) répond à « Fill in the database using your backend ». `database/data.sql` est gardé pour le bootstrap, qui demande d'insérer les données à la main en SQL. |

## Installation

Prérequis : Node.js 20.6 ou plus, et PostgreSQL démarré.

Chaque bloc de commandes part de la **racine du dépôt** (le dossier qui contient ce README). Copier les blocs dans l'ordre.

### 1. Configuration du backend

```bash
cd backend
cp .env.example .env   # puis remplir les 3 variables ci-dessous
npm install
cd ..
```

| Variable | Rôle |
|---|---|
| `PORT` | Port de l'API (3000) |
| `DATABASE_URL` | Adresse de la base, ex. `postgresql://utilisateur:motdepasse@localhost:5432/jobboard` |
| `JWT_SECRET` | Phrase secrète qui signe les jetons de connexion. Elle doit rester secrète : avec elle, n'importe qui pourrait fabriquer un jeton d'administrateur. |

### 2. Base de données

```bash
createdb jobboard                       # si la base existe déjà, passer cette ligne
psql jobboard -f database/schema.sql    # crée les 5 tables (et vide la base si elle existait)
cd backend && npm run seed && cd ..     # remplit la base depuis le backend (Step 04)
psql jobboard -f database/queries.sql   # exécute les 3 requêtes du bootstrap
```

`database/data.sql` contient les mêmes données écrites à la main en SQL (demandé par le bootstrap) : `psql jobboard -f database/data.sql` peut remplacer `npm run seed`. Lancer l'un ou l'autre, pas les deux.

### 3. Lancer l'API puis le front

```bash
cd backend
npm run dev   # redémarre à chaque modification ; npm start le lance sans surveillance
```

L'API répond sur `http://localhost:3000`. Ce terminal reste occupé par l'API : ouvrir un autre terminal pour les autres commandes. Ouvrir ensuite `frontend/index.html` dans le navigateur (ou avec Live Server).

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
| 06 | Inscription dans `compte.html`, connexion dans `connexion.html`, modification du compte dans `compte.html` ; une fois connecté, le formulaire « Postuler » est pré-rempli | `connexion.html`, `compte.html`, `auth.js`, `compte.js`, `script.js` |
| 07 | Page d'administration réservée à l'admin : liste paginée de toutes les tables, création, modification, suppression. Après connexion, l'admin arrive sur l'administration, les autres sur les offres | `admin.html`, `admin.js`, `auth.js` |
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

Les erreurs des routes ci-dessous sont renvoyées sous la forme `{ "error": "message" }`. Un JSON mal écrit, ou un texte à la place d'un nombre envoyé à la base (ex. `GET /ads/abc`), donne **400**. Une erreur imprévue donne **500**. Une route qui n'existe pas renvoie la page 404 par défaut d'Express.

Les routes protégées attendent l'en-tête `Authorization: Bearer <jeton>`, où le jeton est celui renvoyé par `POST /auth/login`. Sans jeton valide : **401**. Avec un jeton valide mais sans le droit : **403**.

### Annonces et candidatures (publiques)

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| GET | `/ads` | Toutes les annonces, avec l'entreprise et la catégorie | 200 |
| GET | `/ads/:id` | Détail d'une annonce, avec l'entreprise, la catégorie et le responsable | 200, 400, 404 |
| GET | `/companies/:id/ads` | Annonces d'une entreprise (route demandée par le bootstrap, le front ne l'utilise pas) | 200, 400, 404 |
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

- `POST /auth/register` reçoit `{ first_name, last_name, email, phone, password }` (`phone` est facultatif) et renvoie `{ id, first_name, last_name, email, phone }`. 409 si l'email existe déjà.
- `POST /auth/login` reçoit `{ email, password }` et renvoie `{ token, user: { id, first_name, last_name, email, phone, is_admin } }`. Le jeton est valable 1 jour. 401 si les identifiants sont faux.
- Le hash du mot de passe n'est jamais renvoyé par l'API.

**Limite connue** : un email qui a déjà servi à postuler sans compte ne peut pas créer de compte (409). C'est un choix assumé : l'énoncé ne le demande pas et, comme les emails ne sont pas vérifiés, l'autoriser permettrait de récupérer l'historique lié à l'email de quelqu'un d'autre.

### Mon compte (réservé à la personne connectée)

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| PUT | `/people/:id` | Modifier mon compte | 200, 400, 401, 403, 404, 409 |

- `PUT /people/:id` reçoit `{ first_name, last_name, email, phone, password }` ; `phone` et `password` sont facultatifs (sans `password`, le mot de passe ne change pas). Il renvoie `{ id, first_name, last_name, email, phone, is_admin }`. 409 si l'email est déjà pris.
- 403 si `:id` n'est pas l'id de la personne connectée.

### Administration (réservée à l'admin)

`:table` vaut `ads`, `companies`, `categories`, `people` ou `applications`. Un autre nom donne 404.

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| POST | `/ads` | Créer une annonce (route demandée par le bootstrap ; la page admin utilise `POST /admin/ads`) | 201, 400, 401, 403 |
| GET | `/admin/:table?page=1&limit=7` | Une page de la table : `{ rows, total, page, limit }` | 200, 401, 403, 404 |
| GET | `/admin/:table/:id` | Une ligne complète | 200, 400, 401, 403, 404 |
| POST | `/admin/:table` | Créer une ligne | 201, 400, 401, 403, 404, 409 |
| PUT | `/admin/:table/:id` | Modifier une ligne | 200, 400, 401, 403, 404, 409 |
| DELETE | `/admin/:table/:id` | Supprimer une ligne | 204, 400, 401, 403, 404, 409 |

`limit` vaut 7 par défaut (100 au plus). Champs attendus par `POST` et `PUT /admin/:table`, tous obligatoires :

| Table | Champs |
|---|---|
| `ads` | les 9 champs du corps ci-dessous |
| `companies`, `categories` | `name` |
| `people` | `first_name`, `last_name`, `email` |
| `applications` | `ad_id`, `person_id`, `message` |

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

Avec `POST /ads`, un `company_id`, `category_id` ou `contact_id` qui n'existe pas donne 400.

409 sur les routes `/admin` : un lien vers un id qui n'existe pas, une ligne encore utilisée par une autre table (par exemple, supprimer une personne encore responsable d'une annonce), ou un email déjà pris.

## Pages du front

| Page | Rôle |
|---|---|
| `index.html` | Les annonces, « Learn more » et « Postuler » (formulaire pré-rempli si l'on est connecté) |
| `connexion.html` | Connexion ; redirige l'admin vers `admin.html`, les autres vers `index.html`. Lien « Créer un compte » vers `compte.html` |
| `compte.html` | Sans connexion : créer un compte (`POST /auth/register`). Connecté : modifier son compte (`PUT /people/:id`) et se déconnecter |
| `admin.html` | Administration : barre latérale avec les 5 tables, liste paginée (7 lignes par page), boutons et formulaires pour créer, modifier et supprimer. Renvoie vers `connexion.html` si l'on n'est pas admin |

Après connexion, le jeton et l'utilisateur sont gardés dans le `localStorage` du navigateur ; `api.js` envoie le jeton à chaque appel.

## Sécurité de l'authentification

- **Mots de passe** : hachés avec bcrypt (coût 10) avant d'être enregistrés dans `people.password_hash`. Le mot de passe en clair n'est jamais stocké ni renvoyé.
- **Le hash ne sort jamais de l'API** : les requêtes choisissent les colonnes renvoyées, et les routes `/admin` retirent `password_hash` avant de répondre.
- **Connexion** : `POST /auth/login` vérifie le mot de passe avec `bcrypt.compare`. Le message d'erreur est le même (401) que l'email soit inconnu ou le mot de passe faux : la connexion ne dit pas lequel des deux est faux.
- **Jeton** : après la connexion, l'API renvoie un jeton JWT signé avec `JWT_SECRET`, valable 1 jour, qui contient `{ id, is_admin }`. Sans le secret, personne ne peut fabriquer ni modifier un jeton.
- **Côté front** : le jeton est gardé dans le `localStorage` ; `api.js` l'envoie dans l'en-tête `Authorization: Bearer <jeton>`.
- **Middleware `loggedIn`** : vérifie le jeton avec `jwt.verify`. Jeton absent, faux ou expiré : **401**.
- **Middleware `adminOnly`** (après `loggedIn`) : **403** si l'utilisateur n'est pas admin. Il protège toutes les routes `/admin` et `POST /ads`.
- **`PUT /people/:id`** : **403** si `:id` n'est pas l'id contenu dans le jeton. On ne peut modifier que son propre compte.
- `admin.js` renvoie vers `connexion.html` si l'utilisateur n'est pas admin. Ce n'est qu'un confort d'affichage : c'est l'API qui protège les données.

Limites connues :

- le jeton reste valable jusqu'à son expiration, même après la déconnexion : « Se déconnecter » vide seulement le `localStorage` ;
- les emails ne sont pas vérifiés : rien ne prouve qu'une personne possède l'email qu'elle saisit.

## Tests dans Postman

Lancer `schema.sql` puis `npm run seed` avant les tests. Les tests modifient la base : relancer ces deux commandes pour revenir aux données de départ. Faire les tests dans l'ordre (par exemple, la catégorie créée au test 28 reçoit l'id 3).

Pour les routes protégées, copier le `token` renvoyé par `POST /auth/login` dans l'onglet **Authorization** de Postman (type *Bearer Token*).

| # | Requête | Attendu |
|---|---|---|
| 1 | `GET /ads` | 200, 3 annonces |
| 2 | `GET /ads/1` | 200, avec location, working_time, salary, contact_name |
| 3 | `GET /ads/999` | 404 |
| 4 | `GET /ads/abc` | 400 |
| 5 | `GET /companies/1/ads` | 200, 2 annonces |
| 6 | `GET /companies/999/ads` | 404 |
| 7 | `POST /ads/1/applications` avec le corps complet | 201 |
| 8 | `POST /ads/1/applications` sans `message` | 400 |
| 9 | `POST /ads/999/applications` avec le corps complet | 404 |
| 10 | `POST /ads/1/applications` avec un JSON mal écrit | 400 |
| 11 | `POST /auth/register` avec un nouvel email et un `phone` | 201, sans hash |
| 12 | `POST /auth/register` avec `ines.haddad@example.com` | 409 |
| 13 | `POST /auth/register` sans `password` | 400 |
| 14 | `POST /auth/login` admin / `admin1234` | 200, `is_admin: true` |
| 15 | `POST /auth/login` Inès / `ines1234` | 200, `is_admin: false` |
| 16 | `POST /auth/login` avec un mauvais mot de passe | 401 |
| 17 | `GET /admin/ads` sans jeton | **401** |
| 18 | `GET /admin/ads` avec un jeton inventé | **401** |
| 19 | `GET /admin/ads` avec le jeton d'Inès | **403** |
| 20 | `GET /admin/ads` avec le jeton admin | 200 |
| 21 | `POST /ads` sans jeton | **401** |
| 22 | `POST /ads` avec le jeton d'Inès | **403** |
| 23 | `POST /ads` avec le jeton admin et le corps complet | 201 |
| 24 | `POST /ads` avec le jeton admin, sans `salary` | 400 |
| 25 | `POST /ads` avec le jeton admin, `contact_id: 999` | 400 |
| 26 | `GET /admin/categories?page=1&limit=7` (admin) | 200, `rows`, `total`, `page`, `limit` |
| 27 | `GET /admin/inconnue` (admin) | 404 |
| 28 | `POST /admin/categories` `{ "name": "Design" }` (admin) | 201 |
| 29 | `PUT /admin/categories/3` `{ "name": "UX Design" }` (admin) | 200 |
| 30 | `DELETE /admin/categories/1` (admin, catégorie utilisée) | 409 |
| 31 | `DELETE /admin/categories/3` (admin) | 204 |
| 32 | `GET /admin/people/6` (admin) | 200, sans `password_hash` |
| 33 | `PUT /people/1` sans jeton | **401** |
| 34 | `PUT /people/1` (Inès) avec l'email de Tom | 409 |
| 35 | `PUT /people/1` (Inès) sans `email` | 400 |
| 36 | `PUT /people/2` avec le jeton d'Inès | **403** |
| 37 | `PUT /people/1` (Inès) avec ses informations et un nouveau `password`, puis login avec l'ancien | 200, puis 401 |

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
  index.html, connexion.html, compte.html, admin.html
  api.js        fonctions communes (appels à l'API avec le jeton, barre de navigation)
  script.js     annonces, « Learn more » et « Postuler » (index.html)
  auth.js       connexion (connexion.html)
  compte.js     création et modification du compte (compte.html)
  admin.js      administration (admin.html)
  style.css     le style de toutes les pages
  favicon.svg   icône du site
```

## Utilisation de l'IA

Cette section est commencée pour la soutenance de mi-parcours. Le binôme la complétera pour la soutenance finale.

### Ce qui est documenté (session du 13 octobre 2026)

Audit du projet avant la soutenance de mi-parcours. L'IA a :

- comparé le code à l'énoncé et au bootstrap ;
- relevé du code mort, un texte faux dans la page d'administration, des commandes d'installation qui échouaient dans le README et un risque de perte de données dans l'ancienne suppression de compte ;
- proposé des simplifications. Une partie a été refusée, pour garder le code existant quand il était déjà simple et correct ;
- exécuté des tests : requêtes `curl` sur une base de test temporaire, et tests dans le navigateur ;
- rédigé cette mise à jour du README.

### Décisions prises par l'étudiant

Ces choix ont été faits par Abdallah, pas par l'IA :

- supprimer les fonctionnalités que l'énoncé ne demande pas ;
- déplacer la création de compte dans `compte.html` ;
- ne pas autoriser la création d'un compte avec un email qui a déjà servi à postuler sans compte.

### Limites et vérifications

- L'IA peut se tromper. Les tests ont été lancés avant les modifications, puis relancés après : 64 vérifications `curl` sur une base de test, et les parcours principaux dans le navigateur. Deux relectures du code ont été faites par l'IA, pas par une personne.
- Le binôme doit relire chaque fichier et savoir l'expliquer.

### À compléter par le binôme

> Emplacement à remplir par Abdallah et Rayann avant la soutenance finale. Rien n'est encore écrit ici.

- Parties du projet réalisées avant le 13 octobre avec l'aide de l'IA, et comment : *à compléter*
- Parties écrites sans IA : *à compléter*
- Vérifications faites par Abdallah : *à compléter*
- Vérifications faites par Rayann : *à compléter*
