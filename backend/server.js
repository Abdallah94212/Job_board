// API du Job Board
const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const cors = require('cors');
app.use(cors()); // autorise le front (autre port) à appeler l'API
app.use(express.json()); // lit le JSON envoyé dans le corps des requêtes

// GET /ads : toutes les annonces (page des offres)
app.get('/ads', async (req, res) => {
  const result = await db.query(
    `SELECT ads.id, ads.company_id, ads.title, ads.short_description,
            companies.name AS company_name, categories.name AS category_name
     FROM ads
     JOIN companies ON companies.id = ads.company_id
     JOIN categories ON categories.id = ads.category_id
     ORDER BY ads.id`
  );
  res.json(result.rows);
});

// GET /companies : toutes les entreprises
app.get('/companies', async (req, res) => {
  const result = await db.query('SELECT * FROM companies ORDER BY id');
  res.json(result.rows);
});

// GET /ads/:id : le détail complet d'une annonce
app.get('/ads/:id', async (req, res) => {
  const result = await db.query(
    `SELECT ads.*, companies.name AS company_name, categories.name AS category_name,
            people.first_name || ' ' || people.last_name AS contact_name, people.email AS contact_email
     FROM ads
     JOIN companies ON companies.id = ads.company_id
     JOIN categories ON categories.id = ads.category_id
     JOIN people ON people.id = ads.contact_id
     WHERE ads.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Annonce introuvable' });
  }
  res.json(result.rows[0]);
});

// GET /companies/:id/ads : la liste des annonces d'une entreprise
app.get('/companies/:id/ads', async (req, res) => {
  const company = await db.query('SELECT id FROM companies WHERE id = $1', [req.params.id]);
  if (company.rows.length === 0) {
    return res.status(404).json({ error: 'Entreprise introuvable' });
  }

  const result = await db.query(
    'SELECT id, title, short_description FROM ads WHERE company_id = $1 ORDER BY id',
    [req.params.id]
  );
  res.json(result.rows);
});

// POST /ads : créer une annonce (réservé à l'admin)
app.post('/ads', loggedIn, adminOnly, async (req, res) => {
  const { company_id, category_id, contact_id, title, short_description, description, location, working_time, salary } = req.body || {}; // {} si aucun JSON n'est envoyé

  if (!company_id || !category_id || !contact_id || !title || !short_description || !description || !location || !working_time || !salary) {
    return res.status(400).json({ error: 'Champs obligatoires : company_id, category_id, contact_id, title, short_description, description, location, working_time, salary' });
  }

  try {
    const result = await db.query(
      `INSERT INTO ads (company_id, category_id, contact_id, title, short_description, description, location, working_time, salary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [company_id, category_id, contact_id, title, short_description, description, location, working_time, salary]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // 23503 : la clé étrangère pointe vers une entreprise, une catégorie ou une personne qui n'existe pas
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Entreprise, catégorie ou responsable introuvable' });
    }
    throw err;
  }
});

// POST /ads/:id/applications : postuler à une annonce
app.post('/ads/:id/applications', async (req, res) => {
  const { first_name, last_name, email, phone, message } = req.body || {};

  if (!first_name || !last_name || !email || !message) {
    return res.status(400).json({ error: 'Champs obligatoires : first_name, last_name, email, message' });
  }

  const ad = await db.query('SELECT id FROM ads WHERE id = $1', [req.params.id]);
  if (ad.rows.length === 0) {
    return res.status(404).json({ error: 'Annonce introuvable' });
  }

  // La personne existe déjà (même email) ? Sinon, on la crée.
  let person = await db.query('SELECT id FROM people WHERE email = $1', [email]);
  if (person.rows.length === 0) {
    person = await db.query(
      'INSERT INTO people (first_name, last_name, email, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [first_name, last_name, email, phone || null]
    );
  }

  const result = await db.query(
    'INSERT INTO applications (ad_id, person_id, message) VALUES ($1, $2, $3) RETURNING *',
    [req.params.id, person.rows[0].id, message]
  );
  res.status(201).json(result.rows[0]);
});

// POST /auth/register : créer un compte
app.post('/auth/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body || {};

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Champs obligatoires : first_name, last_name, email, password' });
  }

  const existing = await db.query('SELECT id FROM people WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
  }

  // On ne stocke jamais le mot de passe : seulement son hash
  const password_hash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO people (first_name, last_name, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, first_name, last_name, email`,
    [first_name, last_name, email, password_hash]
  );
  res.status(201).json(result.rows[0]);
});

// POST /auth/login : se connecter, renvoie un jeton (token) et l'utilisateur
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Champs obligatoires : email, password' });
  }

  const result = await db.query('SELECT * FROM people WHERE email = $1', [email]);
  const person = result.rows[0];

  // Même message si l'email est inconnu, s'il n'a pas de compte ou si le mot de passe est faux
  if (!person || !person.password_hash || !(await bcrypt.compare(password, person.password_hash))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = jwt.sign({ id: person.id, is_admin: person.is_admin }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({
    token,
    user: {
      id: person.id,
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      is_admin: person.is_admin
    }
  });
});

// ---------- Administration : CRUD sur toutes les tables ----------

// Middleware : vérifie le jeton envoyé dans l'en-tête « Authorization: Bearer <jeton> »
function loggedIn(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, is_admin }
  } catch (err) {
    return res.status(401).json({ error: 'Vous devez être connecté' });
  }
  next();
}

// Middleware : à placer après loggedIn, laisse passer seulement les administrateurs
function adminOnly(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Réservé aux administrateurs' });
  }
  next();
}

// Toutes les routes qui commencent par /admin sont protégées
app.use('/admin', loggedIn, adminOnly);

// Pour chaque table : les colonnes modifiables et la requête de la liste.
// Les noms de tables et de colonnes viennent UNIQUEMENT de cette liste (jamais de l'utilisateur).
const ADMIN_TABLES = {
  ads: {
    columns: ['company_id', 'category_id', 'contact_id', 'title', 'short_description', 'description', 'location', 'working_time', 'salary'],
    list: `SELECT ads.id, ads.title, companies.name AS company_name, categories.name AS category_name,
             (SELECT COUNT(*) FROM applications WHERE applications.ad_id = ads.id)::int AS applications_count
           FROM ads
           JOIN companies ON companies.id = ads.company_id
           JOIN categories ON categories.id = ads.category_id`
  },
  companies: {
    columns: ['name'],
    list: `SELECT companies.id, companies.name,
             (SELECT COUNT(*) FROM ads WHERE ads.company_id = companies.id)::int AS ads_count
           FROM companies`
  },
  categories: {
    columns: ['name'],
    list: `SELECT categories.id, categories.name,
             (SELECT COUNT(*) FROM ads WHERE ads.category_id = categories.id)::int AS ads_count
           FROM categories`
  },
  people: {
    columns: ['first_name', 'last_name', 'email'],
    list: `SELECT people.id, people.first_name, people.last_name, people.email, people.phone,
             (SELECT COUNT(*) FROM applications WHERE applications.person_id = people.id)::int AS applications_count
           FROM people`
  },
  applications: {
    columns: ['ad_id', 'person_id', 'message'],
    list: `SELECT applications.id, ads.title AS ad_title,
             people.first_name || ' ' || people.last_name AS person_name,
             applications.message, applications.created_at
           FROM applications
           JOIN ads ON ads.id = applications.ad_id
           JOIN people ON people.id = applications.person_id`
  }
};

// Renvoie la configuration de la table, ou undefined si le nom n'est pas dans la liste
function getAdminTable(name) {
  return Object.hasOwn(ADMIN_TABLES, name) ? ADMIN_TABLES[name] : undefined;
}

// Traduit les erreurs PostgreSQL en messages clairs
function sendDbError(res, err) {
  if (err.code === '23503') { // clé étrangère : lien vers une ligne qui n'existe pas, ou ligne encore utilisée
    return res.status(409).json({ error: 'Impossible : cette ligne est liée à une autre table (id inexistant ou encore utilisé)' });
  }
  if (err.code === '23505') { // valeur UNIQUE déjà prise (ex : email)
    return res.status(409).json({ error: 'Cette valeur existe déjà (ex : email déjà utilisé)' });
  }
  if (err.code === '22P02') { // texte à la place d'un nombre
    return res.status(400).json({ error: 'Un champ numérique contient du texte' });
  }
  throw err;
}

// GET /admin/stats : le nombre de lignes de chaque table
app.get('/admin/stats', async (req, res) => {
  const result = await db.query(
    `SELECT (SELECT COUNT(*) FROM ads)::int AS ads,
            (SELECT COUNT(*) FROM companies)::int AS companies,
            (SELECT COUNT(*) FROM categories)::int AS categories,
            (SELECT COUNT(*) FROM people)::int AS people,
            (SELECT COUNT(*) FROM applications)::int AS applications`
  );
  res.json(result.rows[0]);
});

// GET /admin/:table?page=1&limit=7 : une page de la table
app.get('/admin/:table', async (req, res) => {
  const table = getAdminTable(req.params.table);
  if (!table) {
    return res.status(404).json({ error: 'Table inconnue' });
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit) || 7, 1), 100);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const offset = (page - 1) * limit;

  const rows = await db.query(
    `${table.list} ORDER BY ${req.params.table}.id LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await db.query(`SELECT COUNT(*)::int AS total FROM ${req.params.table}`);
  res.json({ rows: rows.rows, total: count.rows[0].total, page, limit });
});

// GET /admin/:table/:id : une ligne complète (pour le formulaire de modification)
app.get('/admin/:table/:id', async (req, res) => {
  if (!getAdminTable(req.params.table)) {
    return res.status(404).json({ error: 'Table inconnue' });
  }
  try {
    const result = await db.query(`SELECT * FROM ${req.params.table} WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ligne introuvable' });
    }
    delete result.rows[0].password_hash; // ne jamais renvoyer le hash du mot de passe
    res.json(result.rows[0]);
  } catch (err) {
    sendDbError(res, err);
  }
});

// POST /admin/:table : créer une ligne
app.post('/admin/:table', async (req, res) => {
  const table = getAdminTable(req.params.table);
  if (!table) {
    return res.status(404).json({ error: 'Table inconnue' });
  }

  const body = req.body || {};
  const missing = table.columns.filter((column) => !body[column]);
  if (missing.length > 0) {
    return res.status(400).json({ error: 'Champs obligatoires : ' + missing.join(', ') });
  }

  const values = table.columns.map((column) => body[column]);
  const placeholders = table.columns.map((column, i) => '$' + (i + 1));
  try {
    const result = await db.query(
      `INSERT INTO ${req.params.table} (${table.columns.join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING *`,
      values
    );
    delete result.rows[0].password_hash; // ne jamais renvoyer le hash du mot de passe
    res.status(201).json(result.rows[0]);
  } catch (err) {
    sendDbError(res, err);
  }
});

// PUT /admin/:table/:id : modifier une ligne
app.put('/admin/:table/:id', async (req, res) => {
  const table = getAdminTable(req.params.table);
  if (!table) {
    return res.status(404).json({ error: 'Table inconnue' });
  }

  const body = req.body || {};
  const missing = table.columns.filter((column) => !body[column]);
  if (missing.length > 0) {
    return res.status(400).json({ error: 'Champs obligatoires : ' + missing.join(', ') });
  }

  const values = table.columns.map((column) => body[column]);
  const sets = table.columns.map((column, i) => `${column} = $${i + 1}`);
  try {
    const result = await db.query(
      `UPDATE ${req.params.table} SET ${sets.join(', ')}
       WHERE id = $${values.length + 1}
       RETURNING *`,
      [...values, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ligne introuvable' });
    }
    delete result.rows[0].password_hash; // ne jamais renvoyer le hash du mot de passe
    res.json(result.rows[0]);
  } catch (err) {
    sendDbError(res, err);
  }
});

// DELETE /admin/:table/:id : supprimer une ligne
app.delete('/admin/:table/:id', async (req, res) => {
  if (!getAdminTable(req.params.table)) {
    return res.status(404).json({ error: 'Table inconnue' });
  }
  try {
    const result = await db.query(`DELETE FROM ${req.params.table} WHERE id = $1 RETURNING id`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ligne introuvable' });
    }
    res.status(204).end();
  } catch (err) {
    sendDbError(res, err);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`API lancée sur http://localhost:${process.env.PORT}`);
});
