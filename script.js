function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
        window.open(card.dataset.link, "_blank", "noopener,noreferrer");
    });
});
