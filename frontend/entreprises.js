const companiesList = document.getElementById("companies-list");
const companiesCount = document.getElementById("companies-count");
const companyTemplate = document.getElementById("company-template");

function createCompanyCard(company) {
    const card = companyTemplate.content.cloneNode(true).querySelector(".ad-card");

    card.querySelector(".initial").textContent = company.name.charAt(0);
    card.querySelector("h3").textContent = company.name;
    card.querySelector(".company-category").textContent = company.category;

    const offersText = company.ads.length > 1 ? " offres" : " offre";
    card.querySelector(".tag").textContent = company.ads.length + offersText;

    card.querySelector(".btn-company-offers").href = "index.html?company=" + company.id;

    const titles = company.ads.map(function (ad) {
        return ad.title;
    });
    card.querySelector(".company-ads").textContent = titles.join(", ");

    return card;
}

async function loadCompanies() {
    try {
        const companies = [];

        for (const companyId of COMPANY_IDS) {
            const ads = await getJSON("/companies/" + companyId + "/ads");

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
