// Page des offres. Utilise COMPANY_IDS, getJSON, postJSON, showMessage,
// showListMessage et getCurrentUser (api.js).

const adsList = document.getElementById("ads-list");
const adsCount = document.getElementById("ads-count");
const adsTitle = document.getElementById("ads-title");
const showAllLink = document.getElementById("show-all");
const adTemplate = document.getElementById("ad-template");

// Lien venant de la page Entreprises : index.html?company=1
// -> on n'affiche que les offres de cette entreprise.
const params = new URLSearchParams(window.location.search);
const selectedCompany = Number(params.get("company"));

// ===== "Learn more" : afficher le détail sous la carte =====
async function toggleDetails(card, adId, button) {
    const details = card.querySelector(".ad-details");
    const list = details.querySelector(".details-list");

    // Déjà ouvert : on referme
    if (!details.hidden) {
        details.hidden = true;
        button.textContent = "Learn more";
        return;
    }

    details.hidden = false;
    list.hidden = true;
    button.textContent = "Masquer";
    showMessage(details, "Chargement du détail...", "info");

    try {
        // Le sujet demande d'appeler l'API au clic, sans recharger la page
        const ad = await getJSON("/ads/" + adId);
        details.querySelector(".detail-company").textContent = ad.company_name;
        details.querySelector(".detail-category").textContent = ad.category_name;
        details.querySelector(".detail-description").textContent = ad.description;
        showMessage(details, "", "");
        list.hidden = false;
    } catch (error) {
        console.error(error);
        if (error.status === 404) {
            showMessage(details, "Cette annonce n'existe plus.", "error");
        } else {
            showMessage(details, "Impossible de charger le détail. Le backend est-il lancé ?", "error");
        }
    }
}

// ===== "Postuler" : ouvrir ou fermer le formulaire =====
function toggleApplyForm(card, button) {
    const form = card.querySelector(".apply-form");
    form.hidden = !form.hidden;
    button.textContent = form.hidden ? "Postuler" : "Fermer";

    // Personne connectée : on remplit ses infos à sa place
    const user = getCurrentUser();
    if (!form.hidden && user) {
        form.elements.first_name.value = user.first_name;
        form.elements.last_name.value = user.last_name;
        form.elements.email.value = user.email;
    }
}

// ===== Envoi de la candidature =====
async function sendApplication(form, adId) {
    const data = {
        first_name: form.elements.first_name.value,
        last_name: form.elements.last_name.value,
        email: form.elements.email.value,
        message: form.elements.message.value
    };

    const submitButton = form.querySelector("button[type=submit]");
    submitButton.disabled = true;
    showMessage(form, "Envoi en cours...", "info");

    try {
        const answer = await postJSON("/ads/" + adId + "/applications", data);

        if (answer.status === 201) {
            form.elements.message.value = "";
            showMessage(form, "Candidature envoyée ! L'entreprise reviendra vers vous.", "success");
        } else if (answer.status === 404) {
            showMessage(form, "Cette annonce n'existe plus.", "error");
        } else {
            showMessage(form, answer.result.error || "Impossible d'envoyer la candidature.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessage(form, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
    }

    submitButton.disabled = false;
}

// ===== Fabriquer une carte à partir d'une annonce =====
function createAdCard(ad) {
    const card = adTemplate.content.cloneNode(true).querySelector(".ad-card");

    card.querySelector(".initial").textContent = ad.company_name.charAt(0);
    card.querySelector(".ad-company-name").textContent = ad.company_name;
    card.querySelector(".ad-category").textContent = ad.category_name;
    card.querySelector("h3").textContent = ad.title;
    card.querySelector(".ad-short").textContent = ad.short_description;

    const moreButton = card.querySelector(".btn-more");
    moreButton.addEventListener("click", function () {
        toggleDetails(card, ad.id, moreButton);
    });

    const applyButton = card.querySelector(".btn-apply");
    applyButton.addEventListener("click", function () {
        toggleApplyForm(card, applyButton);
    });

    const form = card.querySelector(".apply-form");
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // pas de rechargement de la page
        sendApplication(form, ad.id);
    });

    return card;
}

// ===== Charger les annonces et les afficher =====
async function loadAds() {
    // Toutes les entreprises, ou seulement celle choisie dans l'URL
    let companyIds = COMPANY_IDS;
    if (selectedCompany) {
        companyIds = [selectedCompany];
        showAllLink.hidden = false;
    }

    try {
        const ads = [];

        for (const companyId of companyIds) {
            const companyAds = await getJSON("/companies/" + companyId + "/ads");

            // La liste ne donne que id, titre et description courte :
            // on demande le détail pour avoir le nom de l'entreprise et la catégorie.
            for (const shortAd of companyAds) {
                const ad = await getJSON("/ads/" + shortAd.id);
                ads.push(ad);
            }
        }

        if (ads.length === 0) {
            adsCount.textContent = "Aucune offre pour le moment.";
            showListMessage(adsList, "Aucune annonce à afficher.", "info");
            return;
        }

        if (selectedCompany) {
            adsTitle.textContent = "Les offres de " + ads[0].company_name;
        }

        adsList.innerHTML = "";
        ads.forEach(function (ad) {
            adsList.appendChild(createAdCard(ad));
        });
        const offersText = ads.length > 1 ? " offres disponibles" : " offre disponible";
        adsCount.textContent = ads.length + offersText + " en ce moment.";
    } catch (error) {
        console.error(error);
        adsCount.textContent = "Offres indisponibles.";
        if (error.status === 404) {
            showListMessage(adsList, "Cette entreprise n'existe pas.", "error");
        } else {
            showListMessage(adsList, "Impossible de charger les annonces. Le backend est-il lancé ?", "error");
        }
    }
}

loadAds();
