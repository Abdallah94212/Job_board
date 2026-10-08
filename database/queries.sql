-- Les 3 requêtes boostrap 

-- 1) Combien d'annonces chaque entreprise a-t-elle publiées ?
SELECT companies.name, COUNT(ads.id) AS nb_annonces
FROM companies
LEFT JOIN ads ON ads.company_id = companies.id
GROUP BY companies.id, companies.name
ORDER BY nb_annonces DESC;

-- 2) Quelle annonce a reçu le plus de candidatures ?
SELECT ads.title, COUNT(applications.id) AS nb_candidatures
FROM ads
JOIN applications ON applications.ad_id = ads.id
GROUP BY ads.id, ads.title
ORDER BY nb_candidatures DESC
LIMIT 1;

-- 3) Tous les candidats de l'annonce n°1, avec leur message
SELECT ads.title, people.first_name, people.last_name, applications.message
FROM applications
JOIN people ON people.id = applications.person_id
JOIN ads ON ads.id = applications.ad_id
WHERE ads.id = 1;
