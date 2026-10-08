const API_URL = "http://localhost:3000";

const COMPANY_IDS = [1, 2];

async function getJSON(path) {
    const response = await fetch(API_URL + path);
    if (!response.ok) {
        const error = new Error("Erreur " + response.status + " sur " + path);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

async function sendJSON(method, path, data) {
    const headers = { "Content-Type": "application/json" };

    const token = localStorage.getItem("token");
    if (token) {
        headers.Authorization = "Bearer " + token;
    }

    const response = await fetch(API_URL + path, {
        method: method,
        headers: headers,
        body: data ? JSON.stringify(data) : undefined
    });

    let result = {};
    try {
        result = await response.json();
    } catch (error) {
        result = {};
    }

    return { status: response.status, result: result };
}

function postJSON(path, data) {
    return sendJSON("POST", path, data);
}

function showListMessage(list, text, type) {
    list.innerHTML = "";
    const message = document.createElement("p");
    message.className = "form-message " + type;
    message.textContent = text;
    list.appendChild(message);
}

function showMessage(container, text, type) {
    const box = container.querySelector(".form-message");
    box.textContent = text;
    box.className = "form-message " + type;
}

function getCurrentUser() {
    const saved = localStorage.getItem("user");
    if (!saved) {
        return null;
    }
    try {
        return JSON.parse(saved);
    } catch (error) {
        return null;
    }
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function updateNavbar() {
    const navUser = document.getElementById("nav-user");
    const user = getCurrentUser();
    if (!navUser || !user) {
        return;
    }

    navUser.href = "compte.html";
    navUser.className = "user-chip";
    navUser.innerHTML = "";

    const avatar = document.createElement("span");
    avatar.className = "avatar avatar-small";
    avatar.textContent = user.first_name.charAt(0);
    navUser.appendChild(avatar);
    navUser.appendChild(document.createTextNode(user.first_name + " " + user.last_name));
}

updateNavbar();
