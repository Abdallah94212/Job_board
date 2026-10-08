console.log("Le script est bien chargé !");
const buttons = document.querySelectorAll(".ad-card button");

buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        const card = button.closest(".ad-card");
        const title = card.querySelector("h3").textContent;
        console.log("Clic sur : " + title);
    });
});
async function loadAd(id) {
    const response = await fetch("http://localhost:3000/ads/" + id);
    const ad = await response.json();
    console.log(ad);
}

loadAd(1);
