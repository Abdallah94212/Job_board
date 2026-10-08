console.log("Le script est bien chargé !");
const buttons = document.querySelectorAll(".ad-card button");

buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        const card = button.closest(".ad-card");
        const title = card.querySelector("h3").textContent;
        console.log("Clic sur : " + title);
    });
});
