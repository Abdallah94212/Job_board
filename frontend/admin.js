const TABLES = {
    ads: {
        title: "Annonces",
        newLabel: "Nouvelle annonce",
        columns: { id: "ID", title: "Titre", company_name: "Entreprise", category_name: "Catégorie", applications_count: "Candidatures" }
    },
    companies: {
        title: "Entreprises",
        newLabel: "Nouvelle entreprise",
        columns: { id: "ID", name: "Nom", ads_count: "Annonces" }
    },
    people: {
        title: "Personnes",
        newLabel: "Nouvelle personne",
        columns: { id: "ID", first_name: "Prénom", last_name: "Nom", email: "Email", phone: "Téléphone", applications_count: "Candidatures" }
    },
    applications: {
        title: "Candidatures",
        newLabel: "Nouvelle candidature",
        columns: { id: "ID", ad_title: "Annonce", person_name: "Personne", message: "Message", created_at: "Date" }
    }
};

const LIMIT = 7;

let currentTable = "ads";
let currentPage = 1;
let editingId = null;

const tableCard = document.getElementById("table-card");
const tableTitle = document.getElementById("table-title");
const tableCount = document.getElementById("table-count");
const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");
const pageInfo = document.getElementById("page-info");
const pagination = document.getElementById("pagination");
const newButton = document.getElementById("new-button");
const search = document.getElementById("search");

document.getElementById("today").textContent = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
});

const admin = getCurrentUser();
if (admin) {
    document.getElementById("admin-name").textContent = admin.first_name + " " + admin.last_name;
    document.getElementById("admin-avatar").textContent = admin.first_name.charAt(0);
}
document.getElementById("admin-logout").addEventListener("click", logout);

async function loadStats() {
    try {
        const stats = await getJSON("/admin/stats");
        for (const name in stats) {
            document.getElementById("stat-" + name).textContent = stats[name];
            document.getElementById("count-" + name).textContent = stats[name];
        }
    } catch (error) {
        console.error(error);
    }
}

function formatValue(key, value) {
    if (key === "created_at") {
        return new Date(value).toLocaleDateString("fr-FR");
    }
    return value;
}

function createRow(row, config) {
    const tr = document.createElement("tr");

    for (const key in config.columns) {
        const td = document.createElement("td");
        td.textContent = formatValue(key, row[key]);
        if (key === "id") {
            td.className = "cell-id";
        }
        tr.appendChild(td);
    }

    const actions = document.createElement("td");
    actions.className = "cell-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn-edit";
    editButton.textContent = "Modifier";
    editButton.addEventListener("click", function () {
        openForm(row.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn-delete";
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener("click", function () {
        deleteRow(row.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    tr.appendChild(actions);
    return tr;
}

function createPageButton(text, page, disabled, active) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "page-button active" : "page-button";
    button.textContent = text;
    button.disabled = disabled;
    button.addEventListener("click", function () {
        currentPage = page;
        loadTable();
    });
    return button;
}

function updatePagination(total, shown) {
    const pages = Math.max(1, Math.ceil(total / LIMIT));
    const first = (currentPage - 1) * LIMIT + 1;

    if (total === 0) {
        pageInfo.textContent = "Aucun résultat";
    } else {
        pageInfo.textContent = "Affichage " + first + " à " + (first + shown - 1) + " sur " + total;
    }

    pagination.innerHTML = "";
    pagination.appendChild(createPageButton("Précédent", currentPage - 1, currentPage === 1, false));
    for (let page = 1; page <= pages; page++) {
        pagination.appendChild(createPageButton(page, page, false, page === currentPage));
    }
    pagination.appendChild(createPageButton("Suivant", currentPage + 1, currentPage === pages, false));
}

function filterRows() {
    const text = search.value.toLowerCase();
    for (const tr of tableBody.children) {
        tr.hidden = !tr.textContent.toLowerCase().includes(text);
    }
}

async function loadTable() {
    const config = TABLES[currentTable];
    tableTitle.textContent = config.title;
    newButton.textContent = config.newLabel;

    tableHead.innerHTML = "";
    for (const key in config.columns) {
        const th = document.createElement("th");
        th.textContent = config.columns[key];
        tableHead.appendChild(th);
    }
    const actionsTitle = document.createElement("th");
    actionsTitle.textContent = "Actions";
    actionsTitle.className = "cell-actions";
    tableHead.appendChild(actionsTitle);

    tableBody.innerHTML = "";
    showMessage(tableCard, "", "");

    try {
        const data = await getJSON("/admin/" + currentTable + "?page=" + currentPage + "&limit=" + LIMIT);

        if (data.rows.length === 0 && currentPage > 1) {
            currentPage = currentPage - 1;
            return loadTable();
        }

        tableCount.textContent = data.total + " enregistrements";
        data.rows.forEach(function (row) {
            tableBody.appendChild(createRow(row, config));
        });
        if (data.rows.length === 0) {
            showMessage(tableCard, "Aucune ligne dans cette table.", "info");
        }
        updatePagination(data.total, data.rows.length);
        filterRows();
    } catch (error) {
        console.error(error);
        tableCount.textContent = "";
        showMessage(tableCard, "Impossible de charger la table. Le backend est-il lancé ?", "error");
    }
}

function closeForm() {
    document.querySelectorAll(".admin-form").forEach(function (form) {
        form.hidden = true;
    });
    editingId = null;
}

async function openForm(id) {
    closeForm();
    const form = document.getElementById("form-" + currentTable);
    form.reset();
    showMessage(form, "", "");
    form.hidden = false;
    editingId = id;

    if (!id) {
        form.querySelector("h2").textContent = TABLES[currentTable].newLabel;
        form.scrollIntoView({ behavior: "smooth" });
        return;
    }

    form.querySelector("h2").textContent = "Modifier la ligne n°" + id;
    try {
        const row = await getJSON("/admin/" + currentTable + "/" + id);
        for (const input of form.elements) {
            if (input.name) {
                input.value = row[input.name];
            }
        }
    } catch (error) {
        console.error(error);
        showMessage(form, "Impossible de charger cette ligne.", "error");
    }
    form.scrollIntoView({ behavior: "smooth" });
}

async function saveForm(form) {
    const data = Object.fromEntries(new FormData(form));
    let answer;

    try {
        if (editingId) {
            answer = await sendJSON("PUT", "/admin/" + currentTable + "/" + editingId, data);
        } else {
            answer = await sendJSON("POST", "/admin/" + currentTable, data);
        }
    } catch (error) {
        console.error(error);
        showMessage(form, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
        return;
    }

    if (answer.status === 200 || answer.status === 201) {
        closeForm();
        await loadTable();
        loadStats();
        showMessage(tableCard, "Enregistré dans la base de données.", "success");
    } else {
        showMessage(form, answer.result.error || "Impossible d'enregistrer.", "error");
    }
}

async function deleteRow(id) {
    if (!confirm("Supprimer définitivement la ligne n°" + id + " ?")) {
        return;
    }

    try {
        const answer = await sendJSON("DELETE", "/admin/" + currentTable + "/" + id);
        if (answer.status === 204) {
            await loadTable();
            loadStats();
            showMessage(tableCard, "Ligne n°" + id + " supprimée.", "success");
        } else {
            showMessage(tableCard, answer.result.error || "Impossible de supprimer.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessage(tableCard, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
    }
}

document.querySelectorAll(".side-link[data-table]").forEach(function (link) {
    link.addEventListener("click", function () {
        document.querySelectorAll(".side-link[data-table]").forEach(function (other) {
            other.classList.remove("active");
        });
        link.classList.add("active");
        currentTable = link.dataset.table;
        currentPage = 1;
        search.value = "";
        closeForm();
        loadTable();
    });
});

document.querySelectorAll(".admin-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        saveForm(form);
    });
    form.querySelector(".btn-cancel").addEventListener("click", closeForm);
});

newButton.addEventListener("click", function () {
    openForm(null);
});

search.addEventListener("input", filterRows);

loadStats();
loadTable();
