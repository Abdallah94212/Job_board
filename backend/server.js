// API du Job Board
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json()); // lit le JSON envoyé dans le corps des requêtes

// GET /ads/:id : le détail complet d'une annonce
app.get('/ads/:id', async (req, res) => {
  const result = await db.query(
    `SELECT ads.*, companies.name AS company_name, categories.name AS category_name
     FROM ads
     JOIN companies ON companies.id = ads.company_id
     JOIN categories ON categories.id = ads.category_id
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

// POST /ads : créer une annonce
app.post('/ads', async (req, res) => {
  const { company_id, category_id, title, short_description, description } = req.body || {}; // {} si aucun JSON n'est envoyé

  if (!company_id || !category_id || !title || !short_description || !description) {
    return res.status(400).json({ error: 'Champs obligatoires : company_id, category_id, title, short_description, description' });
  }

  try {
    const result = await db.query(
      `INSERT INTO ads (company_id, category_id, title, short_description, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [company_id, category_id, title, short_description, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // 23503 : la clé étrangère pointe vers une entreprise ou une catégorie qui n'existe pas
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Entreprise ou catégorie introuvable' });
    }
    throw err;
  }
});

// POST /ads/:id/applications : postuler à une annonce
app.post('/ads/:id/applications', async (req, res) => {
  const { first_name, last_name, email, message } = req.body || {};

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
      'INSERT INTO people (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING id',
      [first_name, last_name, email]
    );
  }

  const result = await db.query(
    'INSERT INTO applications (ad_id, person_id, message) VALUES ($1, $2, $3) RETURNING *',
    [req.params.id, person.rows[0].id, message]
  );
  res.status(201).json(result.rows[0]);
});

app.listen(process.env.PORT, () => {
  console.log(`API lancée sur http://localhost:${process.env.PORT}`);
});
