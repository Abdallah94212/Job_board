const user = getCurrentUser();
const accountForm = document.getElementById("account-form");

if (user) {
    document.getElementById("account-title").textContent = "Mon compte";
    document.getElementById("password-label").textContent = "Nouveau mot de passe (laisser vide pour le garder)";
    accountForm.elements.password.required = false;
    document.getElementById("logout-button").hidden = false;

    accountForm.elements.first_name.value = user.first_name;
    accountForm.elements.last_name.value = user.last_name;
    accountForm.elements.email.value = user.email;
    accountForm.elements.phone.value = user.phone || "";
}

async function createAccount(data) {
    const answer = await postJSON("/auth/register", data);
    if (answer.status === 201) {
        accountForm.reset();
        showMessage(accountForm, "Compte créé ! Vous pouvez maintenant vous connecter.", "success");
    } else {
        showMessage(accountForm, answer.result.error || "Impossible de créer le compte.", "error");
    }
}

async function updateAccount(data) {
    const answer = await sendJSON("PUT", "/people/" + user.id, data);
    if (answer.status === 200) {
        localStorage.setItem("user", JSON.stringify(answer.result));
        accountForm.elements.password.value = "";
        showMessage(accountForm, "Modifications enregistrées.", "success");
    } else {
        showMessage(accountForm, answer.result.error || "Impossible d'enregistrer.", "error");
    }
}

accountForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
        first_name: accountForm.elements.first_name.value,
        last_name: accountForm.elements.last_name.value,
        email: accountForm.elements.email.value,
        phone: accountForm.elements.phone.value,
        password: accountForm.elements.password.value
    };
    showMessage(accountForm, "Enregistrement...", "info");

    try {
        if (user) {
            await updateAccount(data);
        } else {
            await createAccount(data);
        }
    } catch (error) {
        console.error(error);
        showMessage(accountForm, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
    }
});

document.getElementById("logout-button").addEventListener("click", logout);
