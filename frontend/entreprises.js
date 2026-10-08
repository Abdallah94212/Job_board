// Page des entreprises. Utilise COMPANY_IDS, getJSON et showListMessage (api.js).

const companiesList = document.getElementById("companies-list");
const companiesCount = document.getElementById("companies-count");
const companyTemplate = document.getElementById("company-template");

// ===== Fabriquer une carte à partir d'une entreprise =====
function createCompanyCard(company) {
    const card = companyTemplate.content.cloneNode(true).querySelector(".company-card");

    card.querySelector(".initial").textContent = company.name.charAt(0);
    card.querySelector("h3").textContent = company.name;
    card.querySelector(".company-category").textContent = company.category;

    const offersText = company.ads.length > 1 ? " offres" : " offre";
    card.querySelector(".tag").textContent = company.ads.length + offersText;

    // "Voir les offres" mène à la page des offres, filtrée sur cette entreprise
    card.querySelector(".btn-company-offers").href = "index.html?company=" + company.id;

    // Une ligne par annonce de l'entreprise
    const adsList = card.querySelector(".company-ads");
    company.ads.forEach(function (ad) {
        const item = document.createElement("li");
        const title = document.createElement("strong");
        const description = document.createElement("span");
        title.textContent = ad.title;
        description.textContent = ad.short_description;
        item.appendChild(title);
        item.appendChild(description);
        adsList.appendChild(item);
    });

    return card;
}

// ===== Charger les entreprises et les afficher =====
async function loadCompanies() {
    try {
        const companies = [];

        for (const companyId of COMPANY_IDS) {
            const ads = await getJSON("/companies/" + companyId + "/ads");

            // Pas de route qui donne le nom d'une entreprise :
            // on le lit dans le détail de sa première annonce.
            let name = "Entreprise n°" + companyId;
            let category = "";
            if (ads.length > 0) {
                const firstAd = await getJSON("/ads/" + ads[0].id);
                name = firstAd.company_name;
                category = firstAd.category_name;
            }

            companies.push({ id: companyId, name: name, category: category, ads: ads });
        }

        companiesList.innerHTML = "";
        companies.forEach(function (company) {
            companiesList.appendChild(createCompanyCard(company));
        });
        companiesCount.textContent = companies.length + " entreprises recrutent en ce moment.";
    } catch (error) {
        console.error(error);
        companiesCount.textContent = "Entreprises indisponibles.";
        showListMessage(companiesList, "Impossible de charger les entreprises. Le backend est-il lancé ?", "error");
    }
}

loadCompanies();
