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
