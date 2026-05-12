document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Recuperar los datos del localStorage
    const villagerData = localStorage.getItem("matchedVillager");

    if (!villagerData) {
        window.location.href = "demoCards.html";
        return;
    }

    const villager = JSON.parse(villagerData);

    // 2. Rellenar HTML
    document.getElementById("info-name").textContent = villager.name;
    document.getElementById("info-species").textContent = villager.species || "Unknown";
    document.getElementById("info-gender").textContent = villager.gender || "Unknown";
    document.getElementById("info-personality").textContent = villager.personality || "Friendly";
    document.getElementById("info-sign").textContent = villager.sign || "Star";
    
    const birthday = (villager.birthday_day && villager.birthday_month) 
        ? `${villager.birthday_month} ${villager.birthday_day}` 
        : "Unknown";
    document.getElementById("info-birthday").textContent = birthday;
    
    // Imagen
    const imgElement = document.getElementById("info-img");
    imgElement.src = villager.img;
    imgElement.onerror = () => { imgElement.src = "../imagenes/Logo_ACRINDER.png"; };

    // 3. Animaciones GSAP
    const tl = gsap.timeline();

    tl.from(".left-card", { x: -50, opacity: 0, duration: 0.6, ease: "back.out(1.2)" })
      .from(".right-card", { x: 50, opacity: 0, duration: 0.6, ease: "back.out(1.2)" }, "-=0.4")
      .from(".stats-list li", { y: 15, opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");

    // 4. Lógica de botones
    document.getElementById("btn-close").addEventListener("click", () => {
        window.location.href = "demoCards.html"; 
    });

    document.getElementById("btn-date").addEventListener("click", () => {
        // Guardamos que vamos a la cita y navegamos
        localStorage.setItem("datingVillager", JSON.stringify(villager));
        window.location.href = "demoMatch.html"; 
    });
});