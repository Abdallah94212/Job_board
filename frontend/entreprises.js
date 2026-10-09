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
        const companies = await getJSON("/companies");
        const ads = await getJSON("/ads");

        companiesList.innerHTML = "";
        companies.forEach(function (company) {
            company.ads = ads.filter(function (ad) {
                return ad.company_id === company.id;
            });
            company.category = company.ads.length > 0 ? company.ads[0].category_name : "";
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
