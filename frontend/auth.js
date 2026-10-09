const tabs = document.querySelectorAll(".auth-tab");
const forms = document.querySelectorAll(".auth-form");

function showTab(targetId) {
    tabs.forEach(function (tab) {
        tab.classList.toggle("active", tab.dataset.target === targetId);
    });
    forms.forEach(function (form) {
        form.hidden = form.id !== targetId;
    });
}

tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
        showTab(tab.dataset.target);
    });
});

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value
    };

    showMessage(loginForm, "Connexion en cours...", "info");

    try {
        const answer = await postJSON("/auth/login", data);

        if (answer.status === 200) {
            localStorage.setItem("token", answer.result.token);
            localStorage.setItem("user", JSON.stringify(answer.result.user));
            showMessage(loginForm, "Connexion réussie !", "success");
            if (answer.result.user.is_admin) {
                window.location.href = "admin.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            showMessage(loginForm, answer.result.error || "Email ou mot de passe incorrect.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessage(loginForm, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
    }
});

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = document.getElementById("register-password").value;
    const confirm = document.getElementById("register-confirm").value;

    if (password !== confirm) {
        showMessage(registerForm, "Les deux mots de passe ne sont pas identiques.", "error");
        return;
    }

    const data = {
        first_name: document.getElementById("register-first-name").value,
        last_name: document.getElementById("register-last-name").value,
        email: document.getElementById("register-email").value,
        password: password
    };

    showMessage(registerForm, "Création du compte...", "info");

    try {
        const answer = await postJSON("/auth/register", data);

        if (answer.status === 201) {
            registerForm.reset();
            showTab("login-form");
            document.getElementById("login-email").value = data.email;
            showMessage(loginForm, "Compte créé ! Vous pouvez vous connecter.", "success");
        } else {
            showMessage(registerForm, answer.result.error || "Impossible de créer le compte.", "error");
        }
    } catch (error) {
        console.error(error);
        showMessage(registerForm, "Impossible de joindre le serveur. Le backend est-il lancé ?", "error");
    }
});
