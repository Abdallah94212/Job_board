# Job Board · Bootstrap

Première partie du projet Job Board d'Epitech : une base de données SQL et une API REST pour l'agence de recrutement fictive HireLoop.

- les entreprises publient des annonces ;
- chaque annonce appartient à une seule catégorie ;
- des personnes postulent aux annonces, avec un message.

## Technologies

| Outil | Rôle |
|---|---|
| PostgreSQL 16 | Base de données |
| Node.js (20.6 ou plus) | Exécution du serveur |
| Express 5 | Serveur et routes de l'API |
| pg | Connexion entre le serveur et PostgreSQL |
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
cp .env.example .env   # puis remplacer VOTRE_UTILISATEUR dans DATABASE_URL
npm install
npm run dev
```

L'API répond sur `http://localhost:3000`. `npm run dev` redémarre le serveur à chaque modification ; `npm start` le lance sans surveillance.

## Base de données

| Table | Colonnes | Rôle |
|---|---|---|
| `companies` | id, name | Entreprises |
| `categories` | id, name | Catégories d'annonces |
| `ads` | id, company_id → companies, category_id → categories, title, short_description, description | Annonces |
| `people` | id, first_name, last_name, email (unique) | Candidats |
| `applications` | id, ad_id → ads, person_id → people, message, created_at | Candidatures |

- une entreprise a plusieurs annonces ; une annonce a une entreprise et une catégorie ;
- `applications` relie les personnes et les annonces (relation plusieurs-à-plusieurs) et garde le message et la date.

Données de démonstration (`data.sql`) : 2 entreprises, 2 catégories, 3 annonces, 3 personnes, 5 candidatures.

### Les 3 requêtes du bootstrap (`database/queries.sql`)

1. Nombre d'annonces publiées par chaque entreprise.
2. Annonce qui a reçu le plus de candidatures.
3. Candidats d'une annonce, avec leur message.

## Routes de l'API

| Méthode | Route | Rôle | Codes |
|---|---|---|---|
| GET | `/ads/:id` | Détail d'une annonce, avec le nom de l'entreprise et de la catégorie | 200, 404 |
| GET | `/companies/:id/ads` | Annonces d'une entreprise | 200, 404 |
| POST | `/ads` | Créer une annonce | 201, 400 |
| POST | `/ads/:id/applications` | Postuler à une annonce | 201, 400, 404 |

Les erreurs sont renvoyées sous la forme `{ "error": "message" }`.

**Corps de `POST /ads`** (tous les champs sont obligatoires) :

```json
{
  "company_id": 2,
  "category_id": 2,
  "title": "Data analyst",
  "short_description": "Créez nos tableaux de bord.",
  "description": "SQL et visualisation de données."
}
```

Une entreprise ou une catégorie inexistante renvoie 400.

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

## Tests

Chaque route est testée dans Postman, en cas de succès comme d'erreur : 200, 201, 400 et 404. Les résultats peuvent être vérifiés dans la base, par exemple avec `SELECT * FROM applications;`.

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
```
