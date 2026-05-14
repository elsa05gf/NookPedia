document.addEventListener("DOMContentLoaded", () => {
    
    console.log("🚀 Cargando pantalla de Match...");

    // 1. Recuperar los datos del aldeano
    const villagerData = localStorage.getItem("datingVillager");
    console.log("📦 Datos en la memoria:", villagerData);

    if (!villagerData) {
        console.error("❌ ERROR: No se ha encontrado ningún aldeano en la memoria.");
        document.getElementById("match-name").textContent = "ERROR AL CARGAR";
        // window.location.href = "demoInicio.html"; // Lo comento temporalmente para que no te expulse y puedas ver el error
        return;
    }

    const villager = JSON.parse(villagerData);
    console.log("💖 Aldeano cargado correctamente:", villager);

    // 2. Rellenar HTML (Imagen y Nombre)
    const imgElement = document.getElementById("match-img");
    
    if (villager.img) {
        imgElement.src = villager.img;
    } else {
        imgElement.src = "../imagenes/Logo_ACRINDER.png";
    }

    // Si la imagen de Nookipedia falla por timeout, cargamos el logo
    imgElement.onerror = () => { 
        console.warn("⚠️ Fallo al cargar la imagen de internet. Usando repuesto.");
        imgElement.onerror = null; 
        imgElement.src = "../imagenes/Logo_ACRINDER.png"; 
    };

    document.getElementById("match-name").textContent = villager.name || "Aldeano";

    // 3. Lógica de Pronombres
    const gender = villager.gender ? villager.gender.toLowerCase() : "";
    let p1 = "Their", p2 = "their"; 
    
    if (gender === "female") {
        p1 = "Her"; p2 = "her";
    } else if (gender === "male") {
        p1 = "His"; p2 = "his";
    }

    document.getElementById("pronoun-1").textContent = p1;
    document.getElementById("pronoun-2").textContent = p2;

    // 4. Animaciones GSAP (Usamos fromTo para asegurarnos de que se hagan visibles sí o sí)
    const tl = gsap.timeline();

    tl.fromTo(".match-villager-img", 
        { scale: 0, rotation: -10, x: -50, opacity: 0 },
        { scale: 1, rotation: 0, x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.5)" }
    )
    .fromTo(".match-text-card", 
        { x: 50, scale: 0.9, opacity: 0 },
        { x: 0, scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }, 
        "-=0.4"
    )
    .fromTo([".logo-title", ".match-logo-img", ".match-arrow-btn"], 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, 
        "-=0.2"
    );

    // Animación de latido alterno (pares e impares)
    gsap.to(".match-heart-img:nth-child(odd)", {
        scale: 1.2,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    gsap.to(".match-heart-img:nth-child(even)", {
        scale: 1.2,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        delay: 0.6, 
        ease: "sine.inOut"
    });

    gsap.to(".match-arrow-btn", {
        y: 10, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut"
    });

    // 5. Botón de Reinicio
    document.getElementById("btn-restart").addEventListener("click", () => {
        localStorage.removeItem("matchedVillager");
        localStorage.removeItem("datingVillager");
        
        gsap.to("body", {
            opacity: 0, duration: 0.5,
            onComplete: () => { window.location.href = "demoInicio.html"; }
        });
    });
});

// --- LÓGICA DEL BOTÓN RESTART (FLECHA INFERIOR) ---
    const btnRestart = document.getElementById("btn-restart");

    btnRestart.addEventListener("click", () => {
        // 1. Limpiamos los datos guardados en el navegador para empezar de cero
        localStorage.removeItem("matchedVillager");
        localStorage.removeItem("datingVillager");
        
        // 2. Animación de salida con GSAP para que sea elegante
        gsap.to("body", {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                // 3. Redirección al archivo inicial
                window.location.href = "demoInicio.html";
            }
        });
    });