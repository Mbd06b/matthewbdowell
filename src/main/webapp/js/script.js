document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll("section");

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            const targetId = link.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 50,
                    behavior: "smooth"
                });
            }
        });
    });

    // Highlight active menu item on scroll
    window.addEventListener("scroll", () => {
        let currentSection = "";
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 60;
            const sectionBottom = sectionTop + section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href").substring(1) === currentSection);
        });
    });

});
