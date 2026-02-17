// Contact button
function showMessage() {
    alert("Thanks for contacting me! I will respond soon.");
}

// Smooth scroll
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: "smooth"
    });
}

// GitHub redirect logic
document.addEventListener("DOMContentLoaded", function () {
    const projects = document.querySelectorAll(".project-card");

    projects.forEach(project => {
        project.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            if (url) {
                window.open(url, "_blank");
            }
        });
    });
});
function showMessage() {
    document.getElementById("contactModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("contactModal").style.display = "none";
}

function submitMessage() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (name === "" || email === "") {
        alert("Please fill in your name and email.");
        return;
    }

    alert(
        "Thank you, " + name + "!\n\n" +
        "Your message has been received.\n" +
        "We will contact you at: " + email
    );

    closeModal();

    // Clear form
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
}

