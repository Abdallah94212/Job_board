const user = getCurrentUser();
const accountForm = document.getElementById("account-form");
const applicationsList = document.getElementById("applications-list");
const applicationsCount = document.getElementById("applications-count");
const suggestions = document.getElementById("suggestions");

function fillAccount() {
    const initials = user.first_name.charAt(0) + user.last_name.charAt(0);
    document.getElementById("hero-avatar").textContent = initials.toUpperCase();
    document.getElementById("hero-name").textContent = "Bonjour " + user.first_name;
    document.getElementById("hero-subtitle").textContent = user.email;
    document.getElementById("logout-button").hidden = false;

    accountForm.elements.first_name.value = user.first_name;
    accountForm.elements.last_name.value = user.last_name;
    accountForm.elements.email.value = user.email;
    accountForm.elements.phone.value = "";
    accountForm.elements.city.value = "";
    accountForm.elements.phone.placeholder = "Pas encore enregistré";
    accountForm.elements.city.placeholder = "Pas encore enregistré";
    document.getElementById("password-info").textContent = "Protégé et chiffré";
}

async function loadApplications() {
    try {
        const applications = await getJSON("/people/" + user.id + "/applications");

        applicationsList.innerHTML = "";
        applicationsCount.textContent = applications.length + " envoyée(s)";
        if (applications.length === 0) {
            showListMessage(applicationsList, "Aucune candidature pour le moment.", "info");
            return;
        }

        applications.forEach(function (application) {
            const item = document.createElement("li");

            const initial = document.createElement("span");
            initial.className = "initial";
            initial.textContent = application.company_name.charAt(0);

            const info = document.createElement("div");
            info.className = "app-info";
            const title = document.createElement("strong");
            title.textContent = application.title;
            const company = document.createElement("span");
            company.textContent = application.company_name;
            info.appendChild(title);
            info.appendChild(company);

            const date = document.createElement("span");
            date.className = "app-date";
            const sentOn = new Date(application.created_at);
            date.textContent = "Envoyée le " + sentOn.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

            const status = document.createElement("span");
            status.className = "status status-sent";
            status.textContent = "Envoyée";

            item.appendChild(initial);
            item.appendChild(info);
            item.appendChild(date);
            item.appendChild(status);
            applicationsList.appendChild(item);
        });
    } catch (error) {
        console.error(error);
        applicationsCount.textContent = "";
        if (error.status === 404) {
            showListMessage(applicationsList, "Route GET /people/:id/applications pas encore disponible côté serveur.", "error");
        } else {
            showListMessage(applicationsList, "Impossible de charger vos candidatures. Le backend est-il lancé ?", "error");
        }
    }
}

async function loadSuggestions() {
    try {
        suggestions.innerHTML = "";

        for (const companyId of COMPANY_IDS) {
            const companyAds = await getJSON("/companies/" + companyId + "/ads");
            if (companyAds.length === 0) {
                continue;
            }
            const ad = await getJSON("/ads/" + companyAds[0].id);
            suggestions.appendChild(createSuggestionCard(ad));
        }
    } catch (error) {
        console.error(error);
        showListMessage(suggestions, "Impossible de charger les offres. Le backend est-il lancé ?", "error");
    }
}

function createSuggestionCard(ad) {
    const card = document.createElement("article");
    card.className = "ad-card";

    const header = document.createElement("div");
    header.className = "ad-company";
    const initial = document.createElement("span");
    initial.className = "initial";
    initial.textContent = ad.company_name.charAt(0);
    const company = document.createElement("span");
    company.textContent = ad.company_name;
    header.appendChild(initial);
    header.appendChild(company);

    const title = document.createElement("h3");
    title.textContent = ad.title;

    const footer = document.createElement("div");
    footer.className = "ad-footer";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = ad.category_name;
    const link = document.createElement("a");
    link.className = "btn btn-primary btn-small";
    link.href = "index.html?company=" + ad.company_id;
    link.textContent = "Postuler";
    footer.appendChild(tag);
    footer.appendChild(link);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(footer);
    return card;
}

accountForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!user) {
        showMessage(accountForm, "Connectez-vous pour modifier votre compte.", "error");
        return;
    }

    const data = {
        first_name: accountForm.elements.first_name.value,
        last_name: accountForm.elements.last_name.value,
        email: accountForm.elements.email.value
    };
    showMessage(accountForm, "Enregistrement...", "info");

    try {
        const answer = await sendJSON("PUT", "/people/" + user.id, data);
        if (answer.status === 200) {
            localStorage.setItem("user", JSON.stringify(answer.result));
            showMessage(accountForm, "Modifications enregistrées.", "success");
        } else if (answer.status === 404) {
            showMessage(accountForm, "Route PUT /people/:id pas encore disponible côté serveur.", "error");
        } else {
            showMessage(accountForm, answer.result.error || "Impossible d'enregistrer.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessage(accountForm, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
    }
});

document.getElementById("delete-button").addEventListener("click", async function () {
    if (!user) {
        showMessage(accountForm, "Connectez-vous pour supprimer votre compte.", "error");
        return;
    }
    if (!confirm("Supprimer définitivement votre compte et vos candidatures ?")) {
        return;
    }

    try {
        const answer = await sendJSON("DELETE", "/people/" + user.id);
        if (answer.status === 204 || answer.status === 200) {
            logout();
        } else if (answer.status === 404) {
            showMessage(accountForm, "Route DELETE /people/:id pas encore disponible côté serveur.", "error");
        } else {
            showMessage(accountForm, answer.result.error || "Impossible de supprimer le compte.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessage(accountForm, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
    }
});

document.getElementById("password-button").addEventListener("click", function () {
    showMessage(accountForm, "Le changement de mot de passe arrivera avec la connexion côté serveur (Step 06).", "info");
});

document.getElementById("logout-button").addEventListener("click", logout);

if (user) {
    fillAccount();
    loadApplications();
}
loadSuggestions();
